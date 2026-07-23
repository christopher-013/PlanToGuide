/*
 * build-precomputed-catalogs.mjs — deploy-time destination research
 *
 * Runs the same research pipeline the browser uses (dynamic-catalog.js), but server-side
 * during the GitHub Pages deploy: no browser rate-limit pressure, sequential pacing, and a
 * proper API user agent. The output ships as precomputed-catalogs.json so most real queries
 * never touch the fragile runtime research path.
 *
 * Reliability model:
 *  - A quality gate rejects thin catalogs (e.g. a run where rate limits left only a
 *    Wikivoyage main page's listings and placeholder food/shopping). Rejected cities keep
 *    runtime research available instead of shipping a poisoned catalog that blocks it.
 *  - The previous deploy's file is fetched and merged: cities that fail (or aren't
 *    reached) this run keep their last-known-good catalog, so coverage converges across
 *    deploys instead of resetting on every bad research day.
 *  - Cities with a fresh (< 14 days) good catalog are carried over without any network
 *    work, so the time budget is spent on missing and stale destinations.
 *
 * Usage: node build-precomputed-catalogs.mjs [--out path] [--limit N]
 * Env: PREVIOUS_CATALOGS_URL overrides where the previous deploy's file is fetched from.
 * Requires Node 18+ (global fetch). Always writes the output file and exits 0 so a bad
 * research day degrades the catalog instead of breaking the deploy.
 */

import { writeFile } from "node:fs/promises";

// Importing the browser IIFE as an ESM side-effect module attaches the api to globalThis.
await import("./dynamic-catalog.js");
const { buildDynamicCatalog, destinationMatchPattern, isWikimediaThrottled, wikimediaRetryAfterMs } = globalThis;

const TOTAL_TIME_BUDGET_MS = 40 * 60 * 1000;
const PER_CITY_DELAY_MS = 1500;
const REFRESH_AFTER_MS = 14 * 24 * 60 * 60 * 1000;
const PREVIOUS_CATALOGS_URL = process.env.PREVIOUS_CATALOGS_URL
  || "https://christopher-013.github.io/PlanToGuide/precomputed-catalogs.json";

// Top tourist destinations. Curated catalogs.json cities are included on purpose: their
// hand-written catalogs are authoritative but thin on dining and shopping (~9 eat / 3 shop),
// and the client merges these researched catalogs into them as enrichment.
const CITIES = [
  "London", "Paris", "Tokyo", "New York", "Rome", "Lisbon", "Honolulu", "Vancouver", "Seattle",
  "Las Vegas", "Los Angeles", "San Diego", "San Francisco", "Chicago", "Miami", "Orlando",
  "New Orleans", "Boston", "Washington", "Austin", "Nashville", "Denver", "Philadelphia",
  "Barcelona", "Madrid", "Seville", "Amsterdam", "Berlin", "Munich", "Vienna", "Prague",
  "Budapest", "Athens", "Istanbul", "Dublin", "Edinburgh", "Venice", "Florence", "Milan",
  "Naples", "Porto", "Brussels", "Copenhagen", "Stockholm", "Oslo", "Helsinki", "Zurich",
  "Geneva", "Krakow", "Warsaw", "Dubai", "Singapore", "Bangkok", "Phuket", "Hong Kong",
  "Seoul", "Kyoto", "Osaka", "Taipei", "Kuala Lumpur", "Hanoi", "Ho Chi Minh City",
  "Sydney", "Melbourne", "Auckland", "Toronto", "Montreal", "Mexico City", "Cancun",
  "Rio de Janeiro", "Buenos Aires", "Cairo", "Marrakesh", "Cape Town"
];

// --- Build-time photo baking (recommended change #1) --------------------------------------
// Restaurants/shops (and a few imageless sights) get a representative Commons photo baked into
// the catalog so precomputed cities show a real image instantly, with no runtime lookup. The
// keyword->image cache is GLOBAL across all cities, so shared keywords ("sushi", "shopping
// mall", "museum") are resolved once — the whole build makes only a few dozen extra requests.
const IMAGE_USER_AGENT = "Adtona/5.1 (https://christopher-013.github.io/PlanToGuide/)";
const representativeImageCache = new Map();

function representativeImageKeyword(item, type) {
  const text = `${item.cuisine || ""} ${item.name || ""} ${item.detail || ""} ${item.bestFor || ""}`.toLowerCase();
  if (type === "eat") {
    if (/sushi|sashimi|nigiri|omakase/.test(text)) return "sushi";
    if (/ramen|noodle|soba|udon|pho/.test(text)) return "ramen noodles";
    if (/dim sum|dumpling|cantonese/.test(text)) return "dim sum dumplings";
    if (/bakery|pastry|bread|croissant|patisserie/.test(text)) return "bakery pastries";
    if (/coffee|café|cafe|espresso|latte/.test(text)) return "coffee cafe";
    if (/seafood|fish|oyster|prawn|crab|lobster/.test(text)) return "seafood platter";
    if (/steak|grill|bbq|barbecue|yakitori|churrasco/.test(text)) return "grilled meat dish";
    if (/pizza|pasta|italian|trattoria|osteria/.test(text)) return "italian pasta";
    if (/taco|burrito|mexican|taqueria/.test(text)) return "tacos";
    if (/curry|indian|tandoori|biryani/.test(text)) return "indian curry";
    if (/thai|pad thai/.test(text)) return "thai food";
    if (/tapas|spanish|paella/.test(text)) return "tapas";
    if (/french|bistro|brasserie/.test(text)) return "french cuisine plated";
    if (/vegan|vegetarian|salad/.test(text)) return "vegetarian bowl";
    if (/street food|hawker|food hall|food court|market/.test(text)) return "street food market";
    if (/dessert|ice cream|gelato|cake/.test(text)) return "dessert plate";
    return "restaurant plated food";
  }
  if (type === "shop") {
    if (/mall|department store|shopping cent|outlet|emporium/.test(text)) return "shopping mall interior";
    if (/bazaar|flea market|night market|hawker|market/.test(text)) return "street market stalls";
    if (/book/.test(text)) return "bookstore interior";
    if (/craft|artisan|handmade|souvenir|gift/.test(text)) return "artisan craft market";
    if (/boutique|fashion|design|apparel|clothing/.test(text)) return "fashion boutique";
    return "shopping street storefronts";
  }
  // see
  if (/museum|gallery/.test(text)) return "museum interior";
  if (/park|garden|botanical/.test(text)) return "city park";
  if (/cathedral|church|basilica/.test(text)) return "cathedral";
  if (/temple|shrine|pagoda/.test(text)) return "temple";
  if (/castle|fort|palace|citadel/.test(text)) return "castle";
  if (/beach|bay|coast/.test(text)) return "beach";
  if (/tower|monument|statue/.test(text)) return "monument";
  return "";
}

async function commonsRepresentativeImage(keyword) {
  if (!keyword) return "";
  if (representativeImageCache.has(keyword)) return representativeImageCache.get(keyword);
  let resolved = "";
  try {
    const params = new URLSearchParams({ action: "query", generator: "search", gsrsearch: keyword, gsrnamespace: "6", gsrlimit: "16", prop: "imageinfo", iiprop: "url|mime", iiurlwidth: "640", format: "json", origin: "*" });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { "Api-User-Agent": IMAGE_USER_AGENT } });
    if (response.ok) {
      const data = await response.json();
      const pages = Object.values(data?.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
      for (const page of pages) {
        const info = page.imageinfo?.[0];
        const src = info?.thumburl || info?.url || "";
        if (src && /image\/(jpeg|png)/i.test(info?.mime || "") && !/logo|icon|map\b|diagram|flag|coat of arms|\.svg/i.test(page.title || "")) {
          resolved = src;
          break;
        }
      }
    }
  } catch (_) { /* leave imageless; runtime resolves it as before */ }
  representativeImageCache.set(keyword, resolved);
  return resolved;
}

async function bakeCatalogImages(catalog) {
  const targets = [];
  ["breakfast", "lunch", "dinner"].forEach((slot) => (catalog?.food?.[slot] || []).forEach((item) => { if (item && !item.image && !item.placeholder) targets.push([item, "eat"]); }));
  (catalog?.shopping || []).forEach((item) => { if (item && !item.image && !item.placeholder) targets.push([item, "shop"]); });
  (catalog?.attractions || []).forEach((item) => { if (item && !item.image && !item.placeholder) targets.push([item, "see"]); });
  for (const [item, type] of targets) {
    const src = await commonsRepresentativeImage(representativeImageKeyword(item, type));
    if (src) item.image = src;
  }
}

function parseArgs(argv) {
  const args = { out: "precomputed-catalogs.json", limit: CITIES.length };
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === "--out" && argv[index + 1]) args.out = argv[++index];
    else if (argv[index] === "--limit" && argv[index + 1]) args.limit = Math.max(1, Number(argv[++index]) || CITIES.length);
  }
  return args;
}

function isRealItem(item) {
  const label = String(item?.sourceLabel || "");
  return Boolean(label) && !/^plantoguide/i.test(label) && !item?.placeholder;
}

export function catalogQuality(catalog) {
  const see = (catalog?.attractions || []).filter((item) => !item?.placeholder);
  const food = catalog?.food || {};
  return {
    realSee: see.length,
    wikipediaSee: see.filter((item) => /wikipedia/i.test(item?.sourceLabel || "")).length,
    realEat: ["breakfast", "lunch", "dinner"].flatMap((slot) => food[slot] || []).filter(isRealItem).length,
    realBuy: (catalog?.shopping || []).filter(isRealItem).length
  };
}

// Reject catalogs that would ship a degraded experience AND block runtime research from
// improving it: enough real sights plus real food (and shopping, unless dining coverage is
// strong) rather than generic placeholders. This catches both observed failure modes — a
// rate-limited run that captured only one Wikivoyage section (Las Vegas: sports listings,
// zero real dining), and runs where only Wikipedia succeeded (real sights, placeholder food).
export function isGoodCatalog(catalog) {
  const quality = catalogQuality(catalog);
  return quality.realSee >= 6 && quality.realEat >= 2 && (quality.realBuy >= 1 || quality.realEat >= 6);
}

async function loadPreviousGoodCatalogs() {
  try {
    const response = await fetch(PREVIOUS_CATALOGS_URL, { headers: { "cache-control": "no-cache" } });
    if (!response.ok) return [];
    const data = await response.json();
    const entries = Array.isArray(data?.precomputedCatalogs) ? data.precomputedCatalogs : [];
    const good = entries.filter(isGoodCatalog);
    console.log(`Previous deploy: ${entries.length} catalogs, ${good.length} pass the quality gate.`);
    return good;
  } catch (error) {
    console.warn(`No previous catalogs available (${error?.message || error}).`);
    return [];
  }
}

function previousForCity(previous, city) {
  const lower = city.toLowerCase();
  return previous.find((entry) => String(entry.sourceCity || "").toLowerCase() === lower)
    || previous.find((entry) => String(entry.label || "").toLowerCase().startsWith(lower));
}

function isFresh(entry) {
  const builtAt = Date.parse(entry?.builtAt || "");
  return Number.isFinite(builtAt) && Date.now() - builtAt < REFRESH_AFTER_MS;
}

function augmentedMatchPattern(city, catalog) {
  // The pipeline's own pattern covers the entered name and geocode name; add the common
  // "City, Region" and "City, Country" spellings travelers actually type.
  const geocodeName = catalog.label?.split(",")[0]?.trim() || city;
  const parts = String(catalog.label || "").split(",").map((part) => part.trim()).filter(Boolean);
  const admin1 = parts.length > 2 ? parts[1] : "";
  const country = parts.length > 1 ? parts[parts.length - 1] : "";
  const aliases = [city, geocodeName];
  if (admin1) aliases.push(`${geocodeName} ${admin1}`);
  if (country) aliases.push(`${geocodeName} ${country}`);
  return destinationMatchPattern(aliases);
}

async function main() {
  const { out, limit } = parseArgs(process.argv);
  const previousGood = await loadPreviousGoodCatalogs();
  const started = Date.now();
  const catalogs = [];
  const failures = [];
  const rejected = [];
  let carriedCount = 0;

  const carry = (entry, reason, city) => {
    catalogs.push(entry);
    carriedCount += 1;
    console.log(`carry (${reason}): ${city}`);
  };

  for (const city of CITIES.slice(0, limit)) {
    const previous = previousForCity(previousGood, city);
    if (previous && isFresh(previous)) {
      carry(previous, "fresh", city);
      continue;
    }
    if (Date.now() - started > TOTAL_TIME_BUDGET_MS) {
      if (previous) carry(previous, "budget", city);
      else failures.push(city);
      continue;
    }
    if (typeof isWikimediaThrottled === "function" && isWikimediaThrottled()) {
      const waitMs = wikimediaRetryAfterMs();
      console.warn(`Rate limited; waiting ${Math.ceil(waitMs / 1000)}s before ${city}…`);
      await new Promise((resolve) => setTimeout(resolve, waitMs + 500));
    }
    try {
      const catalog = await buildDynamicCatalog(city);
      if (catalog && isGoodCatalog(catalog)) {
        await bakeCatalogImages(catalog);
        catalogs.push({ ...catalog, match: undefined, matchPattern: augmentedMatchPattern(city, catalog), sourceCity: city, builtAt: new Date().toISOString() });
        const quality = catalogQuality(catalog);
        console.log(`ok: ${city} (see ${quality.realSee} / eat ${quality.realEat} / buy ${quality.realBuy})`);
      } else if (catalog) {
        rejected.push(city);
        const quality = catalogQuality(catalog);
        console.warn(`rejected (thin): ${city} — see ${quality.realSee}, wikipedia ${quality.wikipediaSee}, eat ${quality.realEat}, buy ${quality.realBuy}`);
        if (previous) carry(previous, "rejected", city);
      } else {
        failures.push(city);
        console.warn(`no catalog: ${city}`);
        if (previous) carry(previous, "failed", city);
      }
    } catch (error) {
      failures.push(city);
      console.warn(`failed: ${city} — ${error?.message || error}`);
      if (previous) carry(previous, "failed", city);
    }
    await new Promise((resolve) => setTimeout(resolve, PER_CITY_DELAY_MS));
  }

  // Keep any remaining previous good catalogs (e.g. after city-list edits) that this run
  // didn't rebuild or carry, deduped by slug with this run's entries winning.
  const seenSlugs = new Set(catalogs.map((entry) => entry.slug).filter(Boolean));
  previousGood.forEach((entry) => {
    if (entry.slug && !seenSlugs.has(entry.slug)) {
      seenSlugs.add(entry.slug);
      catalogs.push(entry);
      carriedCount += 1;
    }
  });

  const payload = { generatedAt: new Date().toISOString(), count: catalogs.length, precomputedCatalogs: catalogs };
  await writeFile(out, JSON.stringify(payload));
  console.log(`Wrote ${out}: ${catalogs.length} catalogs (${carriedCount} carried forward), ${rejected.length} rejected as thin${rejected.length ? ` (${rejected.join(", ")})` : ""}, ${failures.length} failures${failures.length ? ` (${failures.join(", ")})` : ""}.`);
}

await main();
