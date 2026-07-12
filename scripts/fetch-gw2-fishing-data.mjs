import { writeFile } from "node:fs/promises";

const SOURCE_URL = "https://wiki.guildwars2.com/wiki/List_of_fish";
const API_URL = "https://wiki.guildwars2.com/api.php?action=parse&page=List_of_fish&prop=text&format=json&origin=*";
const OUTPUT_PATH = new URL("../src/data/gw2FishingLocations.json", import.meta.url);

function decodeHtml(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function textContent(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function firstLinkTitle(value) {
  const match = value.match(/<a[^>]+title="([^"]+)"/i);
  return match ? decodeHtml(match[1]) : textContent(value);
}

function normalizeHole(value) {
  const normalized = value.trim();
  return /^None$/i.test(normalized) ? "" : normalized;
}

const response = await fetch(API_URL, {
  headers: { "User-Agent": "TyriaLedger/0.2.2 fishing data importer" },
});
if (!response.ok) {
  throw new Error(`Guild Wars 2 Wiki returned ${response.status}`);
}

const payload = await response.json();
const html = payload?.parse?.text?.["*"] ?? "";
const rows = [...html.matchAll(/<tr class="filter-row[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];
const fish = rows.flatMap((row) => {
  const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1]);
  if (cells.length < 7) return [];

  const name = firstLinkTitle(cells[0]);
  const rarity = textContent(cells[1]).replace(/^[A-H]\s+/, "");
  const location = textContent(cells[2]);
  const holes = textContent(cells[3]).split(",").map(normalizeHole).filter(Boolean);
  const bait = textContent(cells[4]) || "Any";
  const time = textContent(cells[5]) || "Any";
  const fishingPower = Number.parseInt(textContent(cells[6]), 10) || 0;
  const collection = cells[7] ? textContent(cells[7]) : "";
  const imageMatch = cells[0].match(/<img[^>]+src="([^"]+)"/i);
  const icon = imageMatch
    ? new URL(decodeHtml(imageMatch[1]), "https://wiki.guildwars2.com").toString()
    : "";

  return [{
    name,
    rarity,
    location,
    holes,
    bait,
    time,
    fishingPower,
    collection,
    icon,
    wikiUrl: `https://wiki.guildwars2.com/wiki/${encodeURIComponent(name.replaceAll(" ", "_"))}`,
  }];
});

await writeFile(OUTPUT_PATH, `${JSON.stringify({ source: SOURCE_URL, fish }, null, 2)}\n`);
console.log(`Saved ${fish.length} fish entries to ${OUTPUT_PATH.pathname}`);
