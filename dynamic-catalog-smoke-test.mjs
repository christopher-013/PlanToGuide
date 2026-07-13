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

console.log("dynamic catalog smoke test passed");
