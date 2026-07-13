import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const sandbox = {
  console,
  globalThis: {},
  localStorage: { getItem: () => "", setItem: () => {} },
  URL,
  setTimeout,
  clearTimeout,
  fetch: async () => { throw new Error("network disabled in smoke test"); }
};
sandbox.globalThis = sandbox;
vm.runInNewContext(readFileSync("dynamic-catalog.js", "utf8"), sandbox, { filename: "dynamic-catalog.js" });
const api = sandbox;

const normal = readFileSync("test-fixtures/wikivoyage-normal.wiki", "utf8");
const nested = readFileSync("test-fixtures/wikivoyage-nested.wiki", "utf8");

const normalItems = api.parseWikivoyageListings(normal, "Fixture City");
assert.equal(normalItems.length, 4);
assert.equal(normalItems[0].name, "Old Town Square");
assert.equal(normalItems[0].type, "see");
assert.equal(normalItems[2].type, "eat");
assert.equal(normalItems[3].type, "buy");
assert.equal(normalItems[0].sourceLabel, "Wikivoyage");

const nestedItems = api.parseWikivoyageListings(nested, "Nested City");
assert.equal(nestedItems.length, 2);
assert.equal(nestedItems[0].name, "City Museum");
assert.match(nestedItems[0].detail, /historic rooms/);
assert.equal(nestedItems[1].name, "Harbor Café");
assert.match(nestedItems[1].detail, /regional pastries/);

const catalog = api.assembleDynamicCatalog("Fixture City", { name: "Fixture City", country: "Exampleland" }, {
  wikivoyageTitle: "Fixture City",
  wikivoyageItems: normalItems,
  wikipediaItems: [
    { name: "Hill View", type: "see", area: "North", detail: "A scenic viewpoint.", sourceLabel: "Wikipedia", sourceUrl: "https://en.wikipedia.org/wiki/Hill_View" },
    { name: "Art Walk", type: "see", area: "Arts", detail: "A public art route.", sourceLabel: "Wikipedia", sourceUrl: "https://en.wikipedia.org/wiki/Art_Walk" },
    { name: "Garden", type: "see", area: "Park", detail: "A central green space.", sourceLabel: "Wikipedia", sourceUrl: "https://en.wikipedia.org/wiki/Garden" }
  ]
});
assert.equal(catalog.dynamic, true);
assert.equal(catalog.researchMode, true);
assert.ok(catalog.match.test("Fixture City"));
assert.ok(catalog.attractions.length >= 4);
assert.ok(catalog.food.breakfast.length >= 3);
assert.ok(catalog.shopping.length >= 1);

const osmEnhancedCatalog = api.assembleDynamicCatalog("OSM Food City", { name: "OSM Food City", country: "Exampleland" }, {
  wikivoyageTitle: "OSM Food City",
  wikivoyageItems: normalItems,
  wikipediaItems: [
    { name: "Riverfront Park", type: "see", area: "Riverfront", detail: "A popular waterfront park.", sourceLabel: "Wikipedia" },
    { name: "Science Museum", type: "see", area: "Museum District", detail: "A major museum.", sourceLabel: "Wikipedia" },
    { name: "Old Fort", type: "see", area: "Historic Core", detail: "A historic attraction.", sourceLabel: "Wikipedia" }
  ],
  osmItems: [
    { name: "Blue Bottle Cafe", type: "eat", area: "Downtown", detail: "OpenStreetMap-listed cafe.", cuisine: "Cafe", sourceLabel: "OpenStreetMap", osmScore: 80 },
    { name: "Central Food Hall", type: "eat", area: "Market District", detail: "OpenStreetMap-listed food hall.", cuisine: "Food hall", sourceLabel: "OpenStreetMap", osmScore: 78 },
    { name: "Harbor Dinner House", type: "eat", area: "Waterfront", detail: "OpenStreetMap-listed restaurant.", cuisine: "Seafood", sourceLabel: "OpenStreetMap", osmScore: 76 },
    { name: "City Market", type: "buy", area: "Market District", detail: "OpenStreetMap-listed marketplace.", bestFor: "Market, food goods, and local browsing", sourceLabel: "OpenStreetMap", osmScore: 82 },
    { name: "Design Arcade", type: "buy", area: "Arts District", detail: "OpenStreetMap-listed boutique cluster.", bestFor: "Boutiques and local fashion", sourceLabel: "OpenStreetMap", osmScore: 79 }
  ]
});
assert.ok(osmEnhancedCatalog.food.breakfast.some((item) => item.name === "Blue Bottle Cafe"));
assert.ok(osmEnhancedCatalog.food.lunch.some((item) => item.name === "Central Food Hall"));
assert.ok(osmEnhancedCatalog.food.dinner.some((item) => item.name === "Harbor Dinner House"));
assert.ok(osmEnhancedCatalog.shopping.some((item) => item.name === "City Market"));
assert.ok(osmEnhancedCatalog.sources.some((source) => source.label === "OpenStreetMap"));

const sanDiegoCatalog = api.assembleDynamicCatalog("San Diego, California", {
  name: "San Diego",
  admin1: "California",
  country: "United States"
}, {
  wikivoyageTitle: "San Diego",
  wikivoyageItems: [],
  wikipediaItems: []
});
assert.equal(sanDiegoCatalog.dynamic, true);
assert.equal(sanDiegoCatalog.researchMode, true);
assert.ok(sanDiegoCatalog.match.test("San Diego"));
const sanDiegoAttractions = sanDiegoCatalog.attractions.map((item) => item.name);
for (const expected of ["San Diego Zoo", "Balboa Park", "SeaWorld San Diego"]) {
  assert.ok(sanDiegoAttractions.includes(expected), `Expected San Diego attraction: ${expected}`);
}
assert.ok(sanDiegoAttractions.some((name) => /beach|cove/i.test(name)), "Expected a San Diego beach/coastal recommendation");
assert.ok(sanDiegoCatalog.shopping.some((item) => /Seaport Village|Liberty Public Market|Fashion Valley/.test(item.name)));
assert.ok(Object.values(sanDiegoCatalog.food).flat().some((item) => /taco|seafood|brunch/i.test(`${item.name} ${item.cuisine}`)));
assert.equal(api.catalogHasSeededAnchors({
  attractions: [{ name: "Generic San Diego landmark" }, { name: "Downtown walk" }]
}, "San Diego, California"), false);
assert.equal(api.catalogHasSeededAnchors(sanDiegoCatalog, "San Diego, California"), true);

const losAngelesCatalog = api.assembleDynamicCatalog("Los Angeles, California", {
  name: "Los Angeles",
  admin1: "California",
  country: "United States"
}, {
  wikivoyageTitle: "Los Angeles",
  wikivoyageItems: [],
  wikipediaItems: []
});
assert.equal(losAngelesCatalog.dynamic, true);
assert.ok(losAngelesCatalog.match.test("Los Angeles"));
const losAngelesAttractions = losAngelesCatalog.attractions.map((item) => item.name);
for (const expected of ["Griffith Observatory", "Santa Monica Pier", "The Getty Center", "Universal Studios Hollywood"]) {
  assert.ok(losAngelesAttractions.includes(expected), `Expected Los Angeles attraction: ${expected}`);
}
assert.ok(losAngelesAttractions.some((name) => /Hollywood Walk of Fame|Venice Beach/i.test(name)), "Expected a major Hollywood or beach recommendation");
assert.ok(losAngelesCatalog.shopping.some((item) => /The Grove|Rodeo Drive|Abbot Kinney/.test(item.name)));
assert.ok(Object.values(losAngelesCatalog.food).flat().some((item) => /Grand Central Market|Original Farmers Market|taco/i.test(`${item.name} ${item.cuisine}`)));
assert.equal(api.catalogHasSeededAnchors({
  attractions: [{ name: "Generic Los Angeles landmark" }, { name: "Downtown walk" }]
}, "Los Angeles, California"), false);
assert.equal(api.catalogHasSeededAnchors(losAngelesCatalog, "Los Angeles, California"), true);

const newYorkCatalog = api.assembleDynamicCatalog("New York City, New York", {
  name: "New York City",
  admin1: "New York",
  country: "United States"
}, {
  wikivoyageTitle: "New York City",
  wikivoyageItems: [],
  wikipediaItems: []
});
assert.equal(newYorkCatalog.dynamic, true);
assert.ok(newYorkCatalog.match.test("New York City"));
const newYorkAttractions = newYorkCatalog.attractions.map((item) => item.name);
for (const expected of ["Statue of Liberty and Ellis Island", "Central Park", "The Metropolitan Museum of Art", "Empire State Building"]) {
  assert.ok(newYorkAttractions.includes(expected), `Expected New York attraction: ${expected}`);
}
assert.ok(newYorkAttractions.some((name) => /Times Square|Broadway/i.test(name)), "Expected Times Square or Broadway recommendation");
assert.ok(newYorkAttractions.some((name) => /Brooklyn Bridge|DUMBO/i.test(name)), "Expected Brooklyn Bridge or DUMBO recommendation");
assert.ok(newYorkCatalog.shopping.some((item) => /Fifth Avenue|SoHo|Chelsea Market/.test(item.name)));
assert.ok(Object.values(newYorkCatalog.food).flat().some((item) => /Katz|Russ|Pizza|Tacos/i.test(item.name)));
assert.equal(api.catalogHasSeededAnchors({
  attractions: [{ name: "Generic New York landmark" }, { name: "Downtown walk" }]
}, "New York City, New York"), false);
assert.equal(api.catalogHasSeededAnchors(newYorkCatalog, "New York City, New York"), true);

console.log("dynamic catalog smoke test passed");
