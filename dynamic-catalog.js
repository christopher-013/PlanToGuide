(function (global) {
  "use strict";

  const FETCH_TIMEOUT_MS = 6000;
  const PIPELINE_TIMEOUT_MS = 12000;
  const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
  const CACHE_LIMIT_BYTES = 200000;
  const WIKIVOYAGE_API = "https://en.wikivoyage.org/w/api.php";
  const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
  const OPEN_METEO_GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";

  function slugify(value = "") {
    return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "destination";
  }

  function escapeRegExp(value = "") {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function safeStorageGet(key) {
    try { return global.localStorage?.getItem(key) || ""; } catch (_) { return ""; }
  }

  function safeStorageSet(key, value) {
    try { global.localStorage?.setItem(key, value); return true; } catch (_) { return false; }
  }

  function cacheKey(slug) {
    return `ptg:dyncat:${slug}:${global.PLANTOGUIDE_VERSION || "dev"}`;
  }

  const dynamicCatalogCache = {
    get(slug) {
      try {
        const raw = safeStorageGet(cacheKey(slug));
        if (!raw) return null;
        const payload = JSON.parse(raw);
        if (!payload || Date.now() - Number(payload.cachedAt || 0) > CACHE_TTL_MS) return null;
        return payload.catalog || null;
      } catch (_) {
        return null;
      }
    },
    set(slug, catalog) {
      try {
        const value = JSON.stringify({ cachedAt: Date.now(), catalog });
        if (value.length > CACHE_LIMIT_BYTES) return false;
        return safeStorageSet(cacheKey(slug), value);
      } catch (_) {
        return false;
      }
    }
  };

  function makeUrl(base, params) {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  }

  async function fetchJson(url, signal) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const abort = () => controller.abort();
    signal?.addEventListener?.("abort", abort, { once: true });
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener?.("abort", abort);
    }
  }

  function scoreGeocodeResult(result, query) {
    const normalizedQuery = slugify(query).replace(/-/g, " ");
    const hint = query.includes(",") ? query.split(",").slice(1).join(" ").toLowerCase() : "";
    const fields = [result.name, result.admin1, result.country, result.country_code].filter(Boolean).join(" ").toLowerCase();
    let score = Math.log10(Number(result.population || 1));
    if (fields.includes(normalizedQuery)) score += 8;
    if (hint && fields.includes(hint.trim())) score += 5;
    if (String(result.name || "").toLowerCase() === query.split(",")[0].trim().toLowerCase()) score += 4;
    return score;
  }

  async function geocodeDestination(query, options = {}) {
    const name = String(query || "").trim();
    if (!name) return null;
    const url = makeUrl(OPEN_METEO_GEOCODE, { name, count: "5", language: "en", format: "json" });
    const data = await fetchJson(url, options.signal);
    const results = Array.isArray(data?.results) ? data.results : [];
    if (!results.length) return null;
    return results.sort((a, b) => scoreGeocodeResult(b, name) - scoreGeocodeResult(a, name))[0];
  }

  function splitTopLevel(text, separator = "|") {
    const parts = [];
    let current = "";
    let templateDepth = 0;
    let linkDepth = 0;
    for (let index = 0; index < text.length; index += 1) {
      const pair = text.slice(index, index + 2);
      if (pair === "{{") { templateDepth += 1; current += pair; index += 1; continue; }
      if (pair === "}}") { templateDepth = Math.max(0, templateDepth - 1); current += pair; index += 1; continue; }
      if (pair === "[[") { linkDepth += 1; current += pair; index += 1; continue; }
      if (pair === "]]") { linkDepth = Math.max(0, linkDepth - 1); current += pair; index += 1; continue; }
      if (text[index] === separator && !templateDepth && !linkDepth) {
        parts.push(current);
        current = "";
      } else current += text[index];
    }
    parts.push(current);
    return parts;
  }

  function extractTemplates(wikitext = "") {
    const templates = [];
    for (let index = 0; index < wikitext.length - 1; index += 1) {
      if (wikitext.slice(index, index + 2) !== "{{") continue;
      const start = index;
      let depth = 1;
      index += 2;
      for (; index < wikitext.length - 1; index += 1) {
        const pair = wikitext.slice(index, index + 2);
        if (pair === "{{") { depth += 1; index += 1; continue; }
        if (pair === "}}") {
          depth -= 1;
          if (!depth) {
            templates.push(wikitext.slice(start + 2, index));
            index += 1;
            break;
          }
          index += 1;
        }
      }
    }
    return templates;
  }

  function stripWikitext(value = "") {
    let text = String(value);
    text = text.replace(/<ref[\s\S]*?<\/ref>/gi, " ").replace(/<ref[^>]*\/>/gi, " ");
    let previous = "";
    while (previous !== text) {
      previous = text;
      text = text.replace(/\{\{[^{}]*\}\}/g, " ");
    }
    text = text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1");
    text = text.replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, "$1").replace(/\[https?:\/\/[^\]]+\]/g, " ");
    text = text.replace(/'''?/g, "").replace(/<[^>]+>/g, " ");
    text = text.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
    return text.replace(/\s+/g, " ").trim();
  }

  function parseListingTemplate(content, pageTitle) {
    const parts = splitTopLevel(content);
    const templateName = parts.shift().trim().toLowerCase();
    const allowed = new Set(["see", "do", "eat", "drink", "buy", "listing", "sleep"]);
    if (!allowed.has(templateName)) return null;
    const fields = {};
    const unnamed = [];
    parts.forEach((part) => {
      const equalIndex = part.indexOf("=");
      if (equalIndex > -1) fields[part.slice(0, equalIndex).trim().toLowerCase()] = part.slice(equalIndex + 1).trim();
      else if (part.trim()) unnamed.push(part.trim());
    });
    const rawName = fields.name || fields.alt || fields.content || unnamed[0] || "";
    const name = stripWikitext(rawName);
    if (!name || /^(none|various)$/i.test(name)) return null;
    const description = stripWikitext(fields.content || fields.description || fields.directions || fields.wiki || unnamed.slice(1).join(" "));
    const category = templateName === "listing" ? String(fields.type || "").toLowerCase() : templateName;
    const type = /eat|drink/.test(category) ? "eat" : /buy/.test(category) ? "buy" : /see|do/.test(category) ? "see" : "";
    if (!type) return null;
    return {
      name,
      type,
      area: stripWikitext(pageTitle || fields.address || fields.district || ""),
      detail: description || "A Wikivoyage-listed place to research and verify before visiting.",
      address: stripWikitext(fields.address || ""),
      lat: Number(fields.lat || fields.latitude) || null,
      lon: Number(fields.long || fields.lon || fields.longitude) || null,
      sourceLabel: "Wikivoyage",
      sourceUrl: `https://en.wikivoyage.org/wiki/${encodeURIComponent(String(pageTitle || "").replace(/\s+/g, "_"))}`
    };
  }

  function parseWikivoyageListings(wikitext = "", pageTitle = "") {
    const seen = new Set();
    return extractTemplates(wikitext).map((template) => parseListingTemplate(template, pageTitle)).filter((item) => {
      if (!item) return false;
      const key = slugify(item.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function findDistrictTitles(wikitext = "", pageTitle = "") {
    const escaped = escapeRegExp(pageTitle.replace(/ /g, "[ _]"));
    const titles = new Set();
    const regex = new RegExp(`\\[\\[(${escaped}/[^|\\]#]+)`, "gi");
    let match;
    while ((match = regex.exec(wikitext))) titles.add(match[1].replace(/_/g, " "));
    return [...titles].slice(0, 3);
  }

  async function wikivoyagePageTitle(destination, signal) {
    const data = await fetchJson(makeUrl(WIKIVOYAGE_API, {
      action: "query", list: "search", srsearch: destination, srlimit: "3", format: "json", origin: "*"
    }), signal);
    return data?.query?.search?.[0]?.title || null;
  }

  async function fetchWikivoyageWikitext(title, signal) {
    const data = await fetchJson(makeUrl(WIKIVOYAGE_API, {
      action: "parse", page: title, prop: "wikitext", redirects: "1", format: "json", origin: "*"
    }), signal);
    return data?.parse?.wikitext?.["*"] || "";
  }

  async function fetchWikivoyageListings(destination, signal) {
    const title = await wikivoyagePageTitle(destination, signal);
    if (!title) return { title: "", items: [] };
    const wikitext = await fetchWikivoyageWikitext(title, signal);
    let items = parseWikivoyageListings(wikitext, title);
    if (items.filter((item) => item.type === "see").length < 5) {
      const districts = findDistrictTitles(wikitext, title);
      const districtLists = await Promise.all(districts.map(async (district) => {
        try { return parseWikivoyageListings(await fetchWikivoyageWikitext(district, signal), district); }
        catch (_) { return []; }
      }));
      items = [...items, ...districtLists.flat()];
    }
    return { title, items: dedupeItems(items) };
  }

  async function fetchWikipediaGeoPlaces(geocode, signal) {
    if (!geocode?.latitude || !geocode?.longitude) return [];
    const geo = await fetchJson(makeUrl(WIKIPEDIA_API, {
      action: "query", list: "geosearch", gscoord: `${geocode.latitude}|${geocode.longitude}`, gsradius: "10000",
      gslimit: "20", format: "json", origin: "*"
    }), signal);
    const ids = (geo?.query?.geosearch || []).map((item) => item.pageid).filter(Boolean).slice(0, 20);
    if (!ids.length) return [];
    const pages = await fetchJson(makeUrl(WIKIPEDIA_API, {
      action: "query", pageids: ids.join("|"), prop: "pageimages|extracts|info", exintro: "1", explaintext: "1",
      piprop: "thumbnail", pithumbsize: "640", inprop: "url", format: "json", origin: "*"
    }), signal);
    return Object.values(pages?.query?.pages || {}).map((page) => ({
      name: page.title,
      type: "see",
      area: geocode.name,
      detail: String(page.extract || "A Wikipedia-listed landmark or neighborhood worth researching.").split(/\n/)[0].slice(0, 220),
      image: page.thumbnail?.source || "",
      sourceLabel: "Wikipedia",
      sourceUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(String(page.title || "").replace(/\s+/g, "_"))}`
    }));
  }

  function dedupeItems(items = []) {
    const seen = new Set();
    return items.filter((item) => {
      const key = slugify(item.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function toPlace(item, fallbackArea) {
    return {
      name: item.name,
      area: item.area || fallbackArea,
      detail: item.detail || "Research this local recommendation before adding it to a final route.",
      address: item.address || "",
      image: item.image || "",
      sourceLabel: item.sourceLabel || "",
      sourceUrl: item.sourceUrl || ""
    };
  }

  function assembleDynamicCatalog(destination, geocode, sourceData) {
    const fallbackArea = [geocode?.name, geocode?.admin1, geocode?.country].filter(Boolean).join(", ") || destination;
    const items = dedupeItems([...(sourceData.wikivoyageItems || []), ...(sourceData.wikipediaItems || [])]);
    const see = items.filter((item) => item.type === "see").slice(0, 24).map((item) => toPlace(item, fallbackArea));
    const eatItems = items.filter((item) => item.type === "eat").slice(0, 18).map((item) => ({ ...toPlace(item, fallbackArea), cuisine: "Local cuisine", order: "Check the current menu and signature dishes." }));
    const buy = items.filter((item) => item.type === "buy").slice(0, 18).map((item) => ({ ...toPlace(item, fallbackArea), bestFor: "Local shopping, gifts, and browsing" }));
    const enoughSignal = see.length >= 4 || eatItems.length >= 3 || buy.length >= 2;
    if (!enoughSignal) return null;
    const fillerImage = [...see, ...eatItems, ...buy].find((item) => item.image)?.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=82";
    const food = { breakfast: [], lunch: [], dinner: [] };
    eatItems.forEach((item, index) => food[["breakfast", "lunch", "dinner"][index % 3]].push(item));
    while (food.breakfast.length < 3) food.breakfast.push({ name: `${destination} neighborhood café`, area: fallbackArea, detail: "Use live Maps research to choose a highly rated breakfast spot near the day’s route.", cuisine: "Café and local breakfast", sourceLabel: "PlanToGuide", sourceUrl: "" });
    while (food.lunch.length < 3) food.lunch.push({ name: `${destination} local lunch favorite`, area: fallbackArea, detail: "Choose a well-reviewed lunch stop near the day’s sights and verify current hours.", cuisine: "Regional cuisine", sourceLabel: "PlanToGuide", sourceUrl: "" });
    while (food.dinner.length < 3) food.dinner.push({ name: `${destination} dinner reservation option`, area: fallbackArea, detail: "Research a dinner spot that matches your budget, dietary needs, and route.", cuisine: "Local dinner", sourceLabel: "PlanToGuide", sourceUrl: "" });
    const zones = see.slice(0, 8).map((item, index) => ({
      name: item.area || item.name,
      icon: ["🏛️", "🌿", "🌆", "🎨", "🧭", "📸", "🛍️", "🌉"][index % 8],
      keywords: [item.name, item.area].filter(Boolean)
    }));
    return {
      dynamic: true,
      researchMode: true,
      match: new RegExp([destination, geocode?.name, geocode?.country].filter(Boolean).map(escapeRegExp).join("|"), "i"),
      label: fallbackArea,
      banner: fillerImage,
      zones: zones.length ? zones : [{ name: fallbackArea, icon: "🧭", keywords: [destination] }],
      attractions: see,
      food,
      shopping: buy.length ? buy : [
        { name: `${destination} central shopping street`, area: fallbackArea, detail: "Research the main retail street or market district and verify current stores.", bestFor: "Local gifts and browsing", sourceLabel: "PlanToGuide", sourceUrl: "" },
        { name: `${destination} artisan market`, area: fallbackArea, detail: "Look for a local maker market, food market, or craft area near the route.", bestFor: "Crafts, food gifts, and souvenirs", sourceLabel: "PlanToGuide", sourceUrl: "" },
        { name: `${destination} design and vintage district`, area: fallbackArea, detail: "Find a walkable independent shopping area with boutiques, books, or vintage shops.", bestFor: "Independent finds", sourceLabel: "PlanToGuide", sourceUrl: "" }
      ],
      practical: {},
      sources: [
        { label: "Wikivoyage", url: sourceData.wikivoyageTitle ? `https://en.wikivoyage.org/wiki/${encodeURIComponent(sourceData.wikivoyageTitle.replace(/\s+/g, "_"))}` : "https://en.wikivoyage.org" },
        { label: "Wikipedia", url: "https://en.wikipedia.org" }
      ]
    };
  }

  async function buildDynamicCatalog(destination, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PIPELINE_TIMEOUT_MS);
    options.signal?.addEventListener?.("abort", () => controller.abort(), { once: true });
    try {
      const geocode = options.geocode || await geocodeDestination(destination, { signal: controller.signal });
      if (!geocode) return null;
      const slug = slugify([geocode.name, geocode.admin1, geocode.country].filter(Boolean).join(" "));
      const cached = dynamicCatalogCache.get(slug);
      if (cached) return { ...cached, match: new RegExp(cached.matchPattern || escapeRegExp(destination), cached.matchFlags || "i") };
      const [voyage, wiki] = await Promise.all([
        fetchWikivoyageListings([geocode.name, geocode.country].filter(Boolean).join(" "), controller.signal).catch(() => ({ title: "", items: [] })),
        fetchWikipediaGeoPlaces(geocode, controller.signal).catch(() => [])
      ]);
      const catalog = assembleDynamicCatalog(destination, geocode, { wikivoyageTitle: voyage.title, wikivoyageItems: voyage.items, wikipediaItems: wiki });
      if (!catalog) return null;
      const cacheable = { ...catalog, match: undefined, matchPattern: [destination, geocode.name, geocode.country].filter(Boolean).map(escapeRegExp).join("|"), matchFlags: "i" };
      dynamicCatalogCache.set(slug, cacheable);
      return catalog;
    } catch (_) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  const api = { geocodeDestination, parseWikivoyageListings, stripWikitext, buildDynamicCatalog, dynamicCatalogCache, assembleDynamicCatalog };
  Object.assign(global, api);
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
