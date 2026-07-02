import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SOURCE_URL =
  "https://wiki.guildwars2.com/index.php?title=Widget:Interactive_map_data_builder/output.js&action=raw&ctype=text/javascript";
const OUTPUT_PATH = resolve("src/data/gw2WikiMapPoints.json");

const POINT_GROUPS = [
  "sectors",
  "tasks",
  "waypoint",
  "landmark",
  "vista",
  "points_of_interest",
  "skill_challenges",
  "mastery_points",
  "adventures",
  "jumping_puzzles",
];

async function loadSource() {
  const inputArgIndex = process.argv.indexOf("--input");
  if (inputArgIndex !== -1) {
    const inputPath = process.argv[inputArgIndex + 1];
    if (!inputPath) {
      throw new Error("Missing path after --input");
    }

    return readFile(resolve(inputPath), "utf8");
  }

  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`GW2 Wiki map point request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseWidgetData(source) {
  const json = source.replace(/^var wiki_continents = /, "").replace(/;\s*$/, "");
  return JSON.parse(json);
}

function toPoint(type, value) {
  if (!value || !Array.isArray(value.coord)) {
    return null;
  }

  return {
    type,
    name: value.name ?? type,
    coord: value.coord,
    id: value.id,
    chatLink: value.chat_link,
    floors: value.floors,
    level: value.level,
    region: value.region,
  };
}

function buildCache(data) {
  return Object.values(data).flatMap((continent) =>
    Object.values(continent.maps ?? {}).map((map) => ({
      mapId: map.id,
      mapName: map.name,
      continentId: continent.id ?? Number(map.continent_id ?? 0),
      defaultFloor: map.default_floor,
      floors: map.floors ?? [],
      continentRect: map.continent_rect,
      points: POINT_GROUPS.flatMap((group) =>
        Object.values(map[group] ?? {})
          .map((point) => toPoint(group, point))
          .filter(Boolean),
      ),
    })),
  );
}

const source = await loadSource();
const data = parseWidgetData(source);
const cache = buildCache(data);

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(cache)}\n`);

const pointCount = cache.reduce((sum, map) => sum + map.points.length, 0);
console.log(`Stored ${pointCount.toLocaleString()} GW2 Wiki interactive-map points across ${cache.length.toLocaleString()} maps.`);
