import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalogData = JSON.parse(readFileSync("catalogs.json", "utf8"));
const londonCatalog = catalogData.destinationCatalogs.find((catalog) => {
  const match = new RegExp(catalog.matchPattern, catalog.matchFlags || "i");
  return match.test("London, United Kingdom");
});

assert.ok(londonCatalog, "London must resolve to a curated destination catalog");
assert.equal(londonCatalog.dynamic, undefined, "London's primary catalog must remain curated");
assert.equal(londonCatalog.attractions.length, 20, "London should provide 20 real curated Places to See");

const expectedLondonLeaders = [
  "Westminster Abbey, Big Ben, and the London Eye",
  "Tower of London and Tower Bridge",
  "Buckingham Palace and St James’s Park",
  "British Museum",
  "St Paul’s Cathedral and Millennium Bridge",
  "Natural History Museum",
  "Tate Modern and the South Bank",
  "National Gallery and Trafalgar Square"
];

assert.deepEqual(
  londonCatalog.attractions.slice(0, expectedLondonLeaders.length).map((place) => place.name),
  expectedLondonLeaders,
  "London's first recommendations should remain recognizable first-visit landmarks"
);
assert.equal(
  new Set(londonCatalog.attractions.map((place) => place.name.toLocaleLowerCase())).size,
  londonCatalog.attractions.length,
  "London's curated Places to See must not contain duplicates"
);
assert.ok(
  londonCatalog.attractions.every((place) => place.name && place.area && place.detail),
  "Every London recommendation needs a name, area, and useful description"
);

console.log("Catalog ordering smoke test passed.");
