const { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

let DatabaseSync = null;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch {
  DatabaseSync = null;
}

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
let mainWindow;
let database;

const MARKET_HISTORY_REPLACE_WINDOW_MS = 10 * 60 * 1000;
const MARKET_HISTORY_RAW_WINDOW_MS = 24 * 60 * 60 * 1000;
const MARKET_HISTORY_DAILY_WINDOW_MS = 31 * 24 * 60 * 60 * 1000;
const MARKET_HISTORY_WEEKLY_WINDOW_MS = 8 * 31 * 24 * 60 * 60 * 1000;
const MARKET_HISTORY_MAX_AGE_MS = 2 * 366 * 24 * 60 * 60 * 1000;
const MAX_MARKET_HISTORY_POINTS_PER_ITEM = 800;
const VALID_ROLLUPS = new Set(["raw", "day", "week", "month", "bimonth"]);
const UPDATE_REPOSITORY_OWNER = "Retoral";
const UPDATE_REPOSITORY_NAME = "Tyria-Ledger";
const UPDATE_API_URL = `https://api.github.com/repos/${UPDATE_REPOSITORY_OWNER}/${UPDATE_REPOSITORY_NAME}/releases/latest`;
const UPDATE_RELEASES_URL = `https://github.com/${UPDATE_REPOSITORY_OWNER}/${UPDATE_REPOSITORY_NAME}/releases`;

function apiKeyPath() {
  return path.join(app.getPath("userData"), "gw2-api-key.bin");
}

function databasePath() {
  return path.join(app.getPath("userData"), "tyria-ledger.sqlite");
}

function openDatabase() {
  if (database) {
    return database;
  }

  if (!DatabaseSync) {
    throw new Error("SQLite is not available in this Electron runtime.");
  }

  fsSync.mkdirSync(app.getPath("userData"), { recursive: true });
  database = new DatabaseSync(databasePath());
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS market_history (
      item_id INTEGER NOT NULL,
      recorded_at TEXT NOT NULL,
      buy_price INTEGER NOT NULL,
      sell_price INTEGER NOT NULL,
      buy_quantity INTEGER NOT NULL,
      sell_quantity INTEGER NOT NULL,
      rollup TEXT NOT NULL DEFAULT 'raw',
      sample_count INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (item_id, recorded_at, rollup)
    );
    CREATE INDEX IF NOT EXISTS idx_market_history_item_time
      ON market_history (item_id, recorded_at);
    CREATE INDEX IF NOT EXISTS idx_market_history_item_rollup_time
      ON market_history (item_id, rollup, recorded_at);
    CREATE TABLE IF NOT EXISTS market_catalog_cache (
      scope_id TEXT PRIMARY KEY,
      updated_at TEXT NOT NULL,
      items_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS market_catalog_items (
      scope_id TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      rarity TEXT NOT NULL,
      type TEXT NOT NULL,
      sell_price INTEGER NOT NULL,
      buy_price INTEGER NOT NULL,
      sell_quantity INTEGER NOT NULL,
      buy_quantity INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      item_json TEXT NOT NULL,
      PRIMARY KEY (scope_id, item_id)
    );
    CREATE INDEX IF NOT EXISTS idx_market_catalog_items_scope_supply
      ON market_catalog_items (scope_id, sell_quantity DESC, sell_price DESC);
    CREATE INDEX IF NOT EXISTS idx_market_catalog_items_scope_name
      ON market_catalog_items (scope_id, name COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS recipe_cache (
      recipe_id INTEGER PRIMARY KEY,
      updated_at TEXT NOT NULL,
      recipe_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS item_cache (
      item_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      rarity TEXT NOT NULL,
      type TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      item_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_item_cache_name
      ON item_cache (name COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS wiki_container_cache (
      cache_key TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      analysis_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_cache (
      cache_key TEXT PRIMARY KEY,
      updated_at TEXT NOT NULL,
      value_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_app_cache_updated_at
      ON app_cache (updated_at);
  `);

  return database;
}

function normalizeMarketScopeId(rawScopeId) {
  const scopeId = typeof rawScopeId === "string" ? rawScopeId.trim() : "";
  if (!scopeId || scopeId.length > 80 || !/^[a-z0-9:.-]+$/i.test(scopeId)) {
    return "global";
  }

  return scopeId;
}

function isMarketCatalogItem(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value;
  return (
    Number.isFinite(item.id) &&
    typeof item.name === "string" &&
    typeof item.type === "string" &&
    typeof item.rarity === "string" &&
    item.price &&
    typeof item.price === "object" &&
    Number.isFinite(item.price.id) &&
    item.price.buys &&
    typeof item.price.buys === "object" &&
    Number.isFinite(item.price.buys.quantity) &&
    Number.isFinite(item.price.buys.unit_price) &&
    item.price.sells &&
    typeof item.price.sells === "object" &&
    Number.isFinite(item.price.sells.quantity) &&
    Number.isFinite(item.price.sells.unit_price)
  );
}

function normalizeMarketCatalogItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.filter(isMarketCatalogItem);
}

function marketCatalogRowToItem(row) {
  try {
    const item = JSON.parse(row.item_json);
    return isMarketCatalogItem(item) ? item : null;
  } catch {
    return null;
  }
}

function isRecipe(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    Number.isFinite(value.id) &&
    typeof value.type === "string" &&
    Number.isFinite(value.output_item_count) &&
    Number.isFinite(value.time_to_craft_ms) &&
    Array.isArray(value.disciplines) &&
    value.disciplines.every((discipline) => typeof discipline === "string") &&
    Array.isArray(value.flags) &&
    value.flags.every((flag) => typeof flag === "string") &&
    Array.isArray(value.ingredients) &&
    value.ingredients.every((ingredient) =>
      ingredient &&
      typeof ingredient === "object" &&
      Number.isFinite(ingredient.item_id) &&
      Number.isFinite(ingredient.count),
    )
  );
}

function normalizeRecipes(rawRecipes) {
  if (!Array.isArray(rawRecipes)) {
    return [];
  }

  return rawRecipes.filter(isRecipe);
}

function recipeRowToRecipe(row) {
  try {
    const recipe = JSON.parse(row.recipe_json);
    return isRecipe(recipe) ? recipe : null;
  } catch {
    return null;
  }
}

function isGw2Item(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    Number.isFinite(value.id) &&
    typeof value.name === "string" &&
    typeof value.type === "string" &&
    typeof value.rarity === "string" &&
    Number.isFinite(value.level) &&
    Number.isFinite(value.vendor_value)
  );
}

function normalizeGw2Items(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.filter(isGw2Item);
}

function itemRowToItem(row) {
  try {
    const item = JSON.parse(row.item_json);
    return isGw2Item(item) ? item : null;
  } catch {
    return null;
  }
}

function isContainerAnalysis(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.title === "string" &&
    typeof value.sourceUrl === "string" &&
    Array.isArray(value.drops) &&
    typeof value.exactChancesAvailable === "boolean" &&
    Array.isArray(value.parserNotes)
  );
}

function normalizeMarketHistoryPoint(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const itemId = Number(value.itemId ?? value.item_id);
  const recordedAt = typeof value.recordedAt === "string"
    ? value.recordedAt
    : typeof value.recorded_at === "string"
      ? value.recorded_at
      : "";
  const recordedTime = new Date(recordedAt).getTime();
  const buyPrice = Number(value.buyPrice ?? value.buy_price);
  const sellPrice = Number(value.sellPrice ?? value.sell_price);
  const buyQuantity = Number(value.buyQuantity ?? value.buy_quantity);
  const sellQuantity = Number(value.sellQuantity ?? value.sell_quantity);
  const rollup = VALID_ROLLUPS.has(value.rollup) ? value.rollup : "raw";
  const sampleCount = Math.max(1, Math.round(Number(value.sampleCount ?? value.sample_count ?? 1)));

  if (
    !Number.isFinite(itemId) ||
    !Number.isFinite(recordedTime) ||
    !Number.isFinite(buyPrice) ||
    !Number.isFinite(sellPrice) ||
    !Number.isFinite(buyQuantity) ||
    !Number.isFinite(sellQuantity)
  ) {
    return null;
  }

  return {
    itemId: Math.round(itemId),
    recordedAt: new Date(recordedTime).toISOString(),
    buyPrice: Math.round(buyPrice),
    sellPrice: Math.round(sellPrice),
    buyQuantity: Math.round(buyQuantity),
    sellQuantity: Math.round(sellQuantity),
    rollup,
    sampleCount,
  };
}

function rowToMarketHistoryPoint(row) {
  return {
    itemId: row.item_id,
    recordedAt: row.recorded_at,
    buyPrice: row.buy_price,
    sellPrice: row.sell_price,
    buyQuantity: row.buy_quantity,
    sellQuantity: row.sell_quantity,
    rollup: row.rollup,
    sampleCount: row.sample_count,
  };
}

function getMarketHistoryRollup(time, now) {
  const age = Math.max(0, now - time);

  if (age <= MARKET_HISTORY_RAW_WINDOW_MS) return "raw";
  if (age <= MARKET_HISTORY_DAILY_WINDOW_MS) return "day";
  if (age <= MARKET_HISTORY_WEEKLY_WINDOW_MS) return "week";
  return "bimonth";
}

function getMarketHistoryBucketStart(time, rollup) {
  const date = new Date(time);

  if (rollup === "day") {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }

  if (rollup === "week") {
    const day = date.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + mondayOffset);
  }

  const month =
    rollup === "bimonth"
      ? Math.floor(date.getUTCMonth() / 2) * 2
      : date.getUTCMonth();

  return Date.UTC(date.getUTCFullYear(), month, 1);
}

function getMarketHistoryBucketRecordedAt(bucketStart, rollup) {
  const offset =
    rollup === "day"
      ? 12 * 60 * 60 * 1000
      : rollup === "week"
        ? 3.5 * 24 * 60 * 60 * 1000
        : rollup === "bimonth"
          ? 31 * 24 * 60 * 60 * 1000
          : 15 * 24 * 60 * 60 * 1000;

  return new Date(bucketStart + offset).toISOString();
}

function averageMarketHistoryBucket(itemId, bucketStart, rollup, points) {
  const totals = points.reduce(
    (sum, point) => {
      const weight = Math.max(1, point.sampleCount ?? 1);
      return {
        weight: sum.weight + weight,
        buyPrice: sum.buyPrice + point.buyPrice * weight,
        sellPrice: sum.sellPrice + point.sellPrice * weight,
        buyQuantity: sum.buyQuantity + point.buyQuantity * weight,
        sellQuantity: sum.sellQuantity + point.sellQuantity * weight,
      };
    },
    {
      weight: 0,
      buyPrice: 0,
      sellPrice: 0,
      buyQuantity: 0,
      sellQuantity: 0,
    },
  );
  const weight = Math.max(1, totals.weight);

  return {
    itemId,
    recordedAt: getMarketHistoryBucketRecordedAt(bucketStart, rollup),
    buyPrice: Math.round(totals.buyPrice / weight),
    sellPrice: Math.round(totals.sellPrice / weight),
    buyQuantity: Math.round(totals.buyQuantity / weight),
    sellQuantity: Math.round(totals.sellQuantity / weight),
    rollup,
    sampleCount: weight,
  };
}

function compactMarketHistoryPoints(points, now = Date.now()) {
  const byItem = new Map();
  const cutoff = now - MARKET_HISTORY_MAX_AGE_MS;

  for (const input of points) {
    const point = normalizeMarketHistoryPoint(input);
    if (!point) {
      continue;
    }

    const time = new Date(point.recordedAt).getTime();
    if (!Number.isFinite(time) || time < cutoff) {
      continue;
    }

    const group = byItem.get(point.itemId) ?? [];
    group.push(point);
    byItem.set(point.itemId, group);
  }

  return Array.from(byItem.values()).flatMap((itemPoints) => {
    const rawPoints = [];
    const buckets = new Map();

    for (const point of itemPoints) {
      const time = new Date(point.recordedAt).getTime();
      const rollup = getMarketHistoryRollup(time, now);
      if (rollup === "raw") {
        rawPoints.push({ ...point, rollup: "raw", sampleCount: Math.max(1, point.sampleCount ?? 1) });
        continue;
      }

      const bucketStart = getMarketHistoryBucketStart(time, rollup);
      const key = `${point.itemId}:${rollup}:${bucketStart}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(point);
      buckets.set(key, bucket);
    }

    const rolledPoints = Array.from(buckets.entries()).map(([key, bucketPoints]) => {
      const [, rollup, bucketStartText] = key.split(":");
      return averageMarketHistoryBucket(bucketPoints[0].itemId, Number(bucketStartText), rollup, bucketPoints);
    });

    return [...rawPoints, ...rolledPoints]
      .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime())
      .slice(-MAX_MARKET_HISTORY_POINTS_PER_ITEM);
  });
}

function insertMarketHistoryPoints(db, points) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO market_history (
      item_id,
      recorded_at,
      buy_price,
      sell_price,
      buy_quantity,
      sell_quantity,
      rollup,
      sample_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const point of points) {
    insert.run(
      point.itemId,
      point.recordedAt,
      point.buyPrice,
      point.sellPrice,
      point.buyQuantity,
      point.sellQuantity,
      point.rollup ?? "raw",
      Math.max(1, point.sampleCount ?? 1),
    );
  }
}

function replaceAllMarketHistory(points) {
  const db = openDatabase();
  const compacted = compactMarketHistoryPoints(points);

  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM market_history");
    insertMarketHistoryPoints(db, compacted);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return compacted;
}

function replaceItemMarketHistory(itemId, points) {
  const db = openDatabase();
  const compacted = compactMarketHistoryPoints(points).filter((point) => point.itemId === itemId);

  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM market_history WHERE item_id = ?").run(itemId);
    insertMarketHistoryPoints(db, compacted);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return compacted;
}

function getAllMarketHistory() {
  const db = openDatabase();
  const rows = db
    .prepare("SELECT * FROM market_history ORDER BY item_id, recorded_at")
    .all()
    .map(rowToMarketHistoryPoint);

  const compacted = compactMarketHistoryPoints(rows);
  if (compacted.length !== rows.length) {
    replaceAllMarketHistory(compacted);
  }

  return compacted;
}

function getItemMarketHistory(_event, rawItemId) {
  const itemId = Number(rawItemId);
  if (!Number.isFinite(itemId)) {
    return [];
  }

  const db = openDatabase();
  const rows = db
    .prepare("SELECT * FROM market_history WHERE item_id = ? ORDER BY recorded_at")
    .all(Math.round(itemId))
    .map(rowToMarketHistoryPoint);
  const compacted = compactMarketHistoryPoints(rows).filter((point) => point.itemId === Math.round(itemId));

  if (compacted.length !== rows.length) {
    replaceItemMarketHistory(Math.round(itemId), compacted);
  }

  return compacted;
}

function getMarketHistoryDayKey(point) {
  const time = new Date(point.recordedAt).getTime();
  if (!Number.isFinite(time)) {
    return null;
  }

  return `${point.itemId}:${new Date(time).toISOString().slice(0, 10)}`;
}

function importMarketHistory(_event, rawPoints) {
  const currentPoints = getAllMarketHistory();
  const importedPoints = Array.isArray(rawPoints)
    ? rawPoints.map(normalizeMarketHistoryPoint).filter(Boolean)
    : [];
  const currentDayKeys = new Set(currentPoints.map(getMarketHistoryDayKey).filter(Boolean));
  const importedDayKeys = new Set();
  const merged = [...currentPoints];
  let added = 0;
  let ignored = 0;

  for (const point of importedPoints) {
    const key = getMarketHistoryDayKey(point);
    if (!key || currentDayKeys.has(key) || importedDayKeys.has(key)) {
      ignored += 1;
      continue;
    }

    importedDayKeys.add(key);
    merged.push(point);
    added += 1;
  }

  const points = replaceAllMarketHistory(merged);
  return {
    added,
    ignored,
    total: points.length,
  };
}

function recordMarketHistory(_event, rawPoint) {
  const point = normalizeMarketHistoryPoint(rawPoint);
  if (!point) {
    throw new Error("Invalid market history point.");
  }

  const itemPoints = getItemMarketHistory(null, point.itemId);
  const lastPoint = itemPoints[itemPoints.length - 1];
  const now = new Date(point.recordedAt).getTime();

  if (lastPoint) {
    const lastTime = new Date(lastPoint.recordedAt).getTime();
    const samePrice =
      lastPoint.buyPrice === point.buyPrice &&
      lastPoint.sellPrice === point.sellPrice &&
      lastPoint.buyQuantity === point.buyQuantity &&
      lastPoint.sellQuantity === point.sellQuantity;

    if (samePrice && now - lastTime < 6 * 60 * 60 * 1000) {
      return itemPoints;
    }

    if (now - lastTime < MARKET_HISTORY_REPLACE_WINDOW_MS) {
      itemPoints[itemPoints.length - 1] = point;
    } else {
      itemPoints.push(point);
    }
  } else {
    itemPoints.push(point);
  }

  return replaceItemMarketHistory(point.itemId, itemPoints);
}

function loadMarketCatalog(_event, rawScopeId) {
  const db = openDatabase();
  const scopeId = normalizeMarketScopeId(rawScopeId);
  const itemRows = db
    .prepare(`
      SELECT updated_at, item_json
      FROM market_catalog_items
      WHERE scope_id = ?
      ORDER BY sell_quantity DESC, sell_price DESC
    `)
    .all(scopeId);

  if (itemRows.length > 0) {
    const metaRow = db
      .prepare("SELECT updated_at FROM market_catalog_cache WHERE scope_id = ?")
      .get(scopeId);
    const items = itemRows.map(marketCatalogRowToItem).filter(Boolean);

    if (items.length > 0) {
      return {
        scopeId,
        updatedAt: metaRow?.updated_at ?? itemRows[0].updated_at ?? new Date().toISOString(),
        items,
      };
    }

    db.prepare("DELETE FROM market_catalog_items WHERE scope_id = ?").run(scopeId);
  }

  const row = db
    .prepare("SELECT updated_at, items_json FROM market_catalog_cache WHERE scope_id = ?")
    .get(scopeId);

  if (!row) {
    return null;
  }

  try {
    const items = normalizeMarketCatalogItems(JSON.parse(row.items_json));
    return {
      scopeId,
      updatedAt: row.updated_at,
      items,
    };
  } catch {
    db.prepare("DELETE FROM market_catalog_cache WHERE scope_id = ?").run(scopeId);
    return null;
  }
}

function saveMarketCatalog(_event, rawScopeId, rawItems) {
  const db = openDatabase();
  const scopeId = normalizeMarketScopeId(rawScopeId);
  const items = normalizeMarketCatalogItems(rawItems);
  const updatedAt = new Date().toISOString();
  const upsertMeta = db.prepare(`
    INSERT OR REPLACE INTO market_catalog_cache (
      scope_id,
      updated_at,
      items_json
    ) VALUES (?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT OR REPLACE INTO market_catalog_items (
      scope_id,
      item_id,
      name,
      rarity,
      type,
      sell_price,
      buy_price,
      sell_quantity,
      buy_quantity,
      updated_at,
      item_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    upsertMeta.run(scopeId, updatedAt, "[]");
    db.prepare("DELETE FROM market_catalog_items WHERE scope_id = ?").run(scopeId);

    for (const item of items) {
      insertItem.run(
        scopeId,
        item.id,
        item.name,
        item.rarity,
        item.type,
        item.price.sells.unit_price,
        item.price.buys.unit_price,
        item.price.sells.quantity,
        item.price.buys.quantity,
        updatedAt,
        JSON.stringify(item),
      );
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    scopeId,
    updatedAt,
    total: items.length,
  };
}

function loadRecipeCache() {
  const db = openDatabase();
  const rows = db
    .prepare("SELECT updated_at, recipe_json FROM recipe_cache ORDER BY recipe_id")
    .all();

  if (rows.length === 0) {
    return null;
  }

  const recipes = rows.map(recipeRowToRecipe).filter(Boolean);
  if (recipes.length === 0) {
    db.exec("DELETE FROM recipe_cache");
    return null;
  }

  return {
    updatedAt: rows[0].updated_at,
    recipes,
  };
}

function saveRecipeCache(_event, rawRecipes) {
  const db = openDatabase();
  const recipes = normalizeRecipes(rawRecipes);
  const updatedAt = new Date().toISOString();
  const insertRecipe = db.prepare(`
    INSERT OR REPLACE INTO recipe_cache (
      recipe_id,
      updated_at,
      recipe_json
    ) VALUES (?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM recipe_cache");

    for (const recipe of recipes) {
      insertRecipe.run(recipe.id, updatedAt, JSON.stringify(recipe));
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    updatedAt,
    total: recipes.length,
  };
}

function loadItemCache(_event, rawIds) {
  const ids = Array.isArray(rawIds)
    ? Array.from(new Set(rawIds.map((id) => Math.round(Number(id))).filter((id) => Number.isFinite(id))))
    : [];
  if (ids.length === 0) {
    return {
      updatedAt: null,
      items: [],
    };
  }

  const db = openDatabase();
  const rows = [];
  for (let index = 0; index < ids.length; index += 900) {
    const idChunk = ids.slice(index, index + 900);
    const placeholders = idChunk.map(() => "?").join(",");
    rows.push(
      ...db
        .prepare(`SELECT updated_at, item_json FROM item_cache WHERE item_id IN (${placeholders})`)
        .all(...idChunk),
    );
  }
  const items = rows.map(itemRowToItem).filter(Boolean);

  return {
    updatedAt: rows[0]?.updated_at ?? null,
    items,
  };
}

function loadItemCacheByType(_event, rawType) {
  const type = typeof rawType === "string" ? rawType.trim() : "";
  if (!type || type.length > 40 || !/^[A-Za-z]+$/.test(type)) {
    return {
      updatedAt: null,
      items: [],
    };
  }

  const db = openDatabase();
  const rows = db
    .prepare("SELECT updated_at, item_json FROM item_cache WHERE type = ? ORDER BY name COLLATE NOCASE")
    .all(type);
  const items = rows.map(itemRowToItem).filter(Boolean);

  return {
    updatedAt: rows[0]?.updated_at ?? null,
    items,
  };
}

function saveItemCache(_event, rawItems) {
  const db = openDatabase();
  const items = normalizeGw2Items(rawItems);
  const updatedAt = new Date().toISOString();
  const insertItem = db.prepare(`
    INSERT OR REPLACE INTO item_cache (
      item_id,
      name,
      rarity,
      type,
      updated_at,
      item_json
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    for (const item of items) {
      insertItem.run(
        item.id,
        item.name,
        item.rarity,
        item.type,
        updatedAt,
        JSON.stringify(item),
      );
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    updatedAt,
    total: items.length,
  };
}

function normalizeWikiCacheKey(rawKey) {
  const key = typeof rawKey === "string" ? rawKey.trim() : "";
  return key.length > 0 && key.length <= 300 ? key : "";
}

function loadWikiContainerCache(_event, rawKey) {
  const cacheKey = normalizeWikiCacheKey(rawKey);
  if (!cacheKey) {
    return null;
  }

  const db = openDatabase();
  const row = db
    .prepare("SELECT updated_at, analysis_json FROM wiki_container_cache WHERE cache_key = ?")
    .get(cacheKey);
  if (!row) {
    return null;
  }

  try {
    const analysis = JSON.parse(row.analysis_json);
    if (!isContainerAnalysis(analysis)) {
      db.prepare("DELETE FROM wiki_container_cache WHERE cache_key = ?").run(cacheKey);
      return null;
    }

    return {
      updatedAt: row.updated_at,
      analysis,
    };
  } catch {
    db.prepare("DELETE FROM wiki_container_cache WHERE cache_key = ?").run(cacheKey);
    return null;
  }
}

function saveWikiContainerCache(_event, rawKey, rawAnalysis) {
  const cacheKey = normalizeWikiCacheKey(rawKey);
  if (!cacheKey || !isContainerAnalysis(rawAnalysis)) {
    throw new Error("Invalid wiki container cache payload.");
  }

  const db = openDatabase();
  const updatedAt = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO wiki_container_cache (
      cache_key,
      title,
      updated_at,
      analysis_json
    ) VALUES (?, ?, ?, ?)
  `).run(cacheKey, rawAnalysis.title, updatedAt, JSON.stringify(rawAnalysis));

  return {
    updatedAt,
    title: rawAnalysis.title,
  };
}

function normalizeAppCacheKey(rawKey) {
  const key = typeof rawKey === "string" ? rawKey.trim() : "";
  return key.length > 0 && key.length <= 600 ? key : "";
}

function loadAppCache(_event, rawKey) {
  const cacheKey = normalizeAppCacheKey(rawKey);
  if (!cacheKey) {
    return null;
  }

  const db = openDatabase();
  const row = db
    .prepare("SELECT updated_at, value_json FROM app_cache WHERE cache_key = ?")
    .get(cacheKey);
  if (!row) {
    return null;
  }

  try {
    return {
      key: cacheKey,
      updatedAt: row.updated_at,
      value: JSON.parse(row.value_json),
    };
  } catch {
    db.prepare("DELETE FROM app_cache WHERE cache_key = ?").run(cacheKey);
    return null;
  }
}

function saveAppCache(_event, rawKey, rawValue) {
  const cacheKey = normalizeAppCacheKey(rawKey);
  if (!cacheKey) {
    throw new Error("Invalid app cache key.");
  }

  const valueJson = JSON.stringify(rawValue);
  if (!valueJson) {
    throw new Error("Invalid app cache value.");
  }

  const db = openDatabase();
  const updatedAt = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO app_cache (
      cache_key,
      updated_at,
      value_json
    ) VALUES (?, ?, ?)
  `).run(cacheKey, updatedAt, valueJson);

  return {
    key: cacheKey,
    updatedAt,
  };
}

function deleteAppCachePrefix(_event, rawPrefix) {
  const prefix = normalizeAppCacheKey(rawPrefix);
  if (!prefix) {
    return {
      deleted: 0,
    };
  }

  const db = openDatabase();
  const result = db.prepare("DELETE FROM app_cache WHERE cache_key LIKE ?").run(`${prefix}%`);
  return {
    deleted: Number(result.changes ?? 0),
  };
}

async function readApiKey() {
  try {
    const payload = await fs.readFile(apiKeyPath());
    if (payload.length === 0) {
      return null;
    }

    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(payload);
    }

    return payload.toString("utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function writeApiKey(apiKey) {
  const trimmedKey = apiKey.trim();
  const payload = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(trimmedKey)
    : Buffer.from(trimmedKey, "utf8");

  await fs.mkdir(app.getPath("userData"), { recursive: true });
  await fs.writeFile(apiKeyPath(), payload, { mode: 0o600 });
  return true;
}

async function deleteApiKey() {
  try {
    await fs.unlink(apiKeyPath());
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      throw error;
    }
  }

  return true;
}

function normalizeReleaseVersion(value) {
  return String(value ?? "")
    .trim()
    .replace(/^v/i, "")
    .split(/[+-]/)[0];
}

function compareReleaseVersions(left, right) {
  const leftParts = normalizeReleaseVersion(left).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = normalizeReleaseVersion(right).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length, 3);

  for (let index = 0; index < length; index += 1) {
    const delta = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (delta !== 0) {
      return delta;
    }
  }

  return 0;
}

function pickReleaseAsset(assets) {
  if (!Array.isArray(assets)) {
    return null;
  }

  const namedAssets = assets.filter(
    (asset) =>
      asset &&
      typeof asset.name === "string" &&
      typeof asset.browser_download_url === "string",
  );
  const findAsset = (matcher) => namedAssets.find((asset) => matcher(asset.name.toLowerCase()));

  if (process.platform === "darwin") {
    const isAppleSilicon = process.arch === "arm64";
    return (
      (isAppleSilicon
        ? findAsset((name) => name.includes("arm64") && name.endsWith(".dmg"))
        : findAsset((name) => name.endsWith(".dmg") && !name.includes("arm64"))) ??
      (isAppleSilicon
        ? findAsset((name) => name.includes("arm64") && name.endsWith(".zip"))
        : findAsset((name) => name.endsWith(".zip") && name.includes("mac") && !name.includes("arm64"))) ??
      null
    );
  }

  if (process.platform === "win32") {
    return (
      findAsset((name) => name.includes("setup") && name.endsWith(".exe")) ??
      findAsset((name) => name.endsWith(".exe")) ??
      null
    );
  }

  return namedAssets[0] ?? null;
}

async function checkForUpdates() {
  const currentVersion = app.getVersion();
  const checkedAt = new Date().toISOString();

  try {
    const response = await fetch(UPDATE_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": `${app.getName()}/${currentVersion}`,
      },
    });

    if (response.status === 404) {
      return {
        state: "not_configured",
        available: false,
        currentVersion,
        checkedAt,
        releaseUrl: UPDATE_RELEASES_URL,
        message: "No GitHub release has been published yet.",
      };
    }

    if (!response.ok) {
      return {
        state: "error",
        available: false,
        currentVersion,
        checkedAt,
        releaseUrl: UPDATE_RELEASES_URL,
        message: `GitHub returned HTTP ${response.status} while checking for updates.`,
      };
    }

    const release = await response.json();
    const latestVersion = normalizeReleaseVersion(release.tag_name || release.name);
    const asset = pickReleaseAsset(release.assets);
    const available =
      Boolean(latestVersion) &&
      !release.draft &&
      !release.prerelease &&
      compareReleaseVersions(latestVersion, currentVersion) > 0;

    return {
      state: available ? "available" : "current",
      available,
      currentVersion,
      latestVersion,
      checkedAt,
      releaseName: typeof release.name === "string" ? release.name : release.tag_name,
      releaseNotes: typeof release.body === "string" ? release.body : "",
      releaseUrl: typeof release.html_url === "string" ? release.html_url : UPDATE_RELEASES_URL,
      assetName: asset?.name,
      assetUrl: asset?.browser_download_url,
      message: available
        ? `Tyria Ledger ${latestVersion} is available.`
        : `Tyria Ledger ${currentVersion} is up to date.`,
    };
  } catch (error) {
    return {
      state: "error",
      available: false,
      currentVersion,
      checkedAt,
      releaseUrl: UPDATE_RELEASES_URL,
      message: error instanceof Error ? error.message : "Unable to check for updates.",
    };
  }
}

async function openUpdateDownload(_event, updateInfo) {
  const latestVersion = normalizeReleaseVersion(updateInfo?.latestVersion);
  const assetUrl = typeof updateInfo?.assetUrl === "string" ? updateInfo.assetUrl : "";
  const releaseUrl = typeof updateInfo?.releaseUrl === "string" ? updateInfo.releaseUrl : UPDATE_RELEASES_URL;
  const assetName = typeof updateInfo?.assetName === "string" ? updateInfo.assetName : "the latest installer";

  const response = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: assetUrl ? ["Download installer", "Open release page", "Cancel"] : ["Open release page", "Cancel"],
    defaultId: 0,
    cancelId: assetUrl ? 2 : 1,
    title: "Update available",
    message: latestVersion
      ? `Tyria Ledger ${latestVersion} is available.`
      : "A Tyria Ledger update is available.",
    detail: assetUrl
      ? `The app will open ${assetName} from GitHub. After it downloads, run the installer to update Tyria Ledger.`
      : "The app will open the GitHub release page so you can download the installer for your platform.",
  });

  if (response.response === 0) {
    await shell.openExternal(assetUrl || releaseUrl);
    return {
      opened: true,
      target: assetUrl ? "asset" : "release",
    };
  }

  if (assetUrl && response.response === 1) {
    await shell.openExternal(releaseUrl);
    return {
      opened: true,
      target: "release",
    };
  }

  return {
    opened: false,
    target: "cancelled",
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: "#f5f6f2",
    title: "Tyria Ledger",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  try {
    openDatabase();
  } catch (error) {
    console.warn("SQLite market history storage is unavailable; renderer fallback can continue.", error);
  }

  ipcMain.handle("gw2-api-key:load", readApiKey);
  ipcMain.handle("gw2-api-key:save", (_event, apiKey) => writeApiKey(apiKey));
  ipcMain.handle("gw2-api-key:delete", deleteApiKey);
  ipcMain.handle("market-history:list", getAllMarketHistory);
  ipcMain.handle("market-history:item", getItemMarketHistory);
  ipcMain.handle("market-history:record", recordMarketHistory);
  ipcMain.handle("market-history:import", importMarketHistory);
  ipcMain.handle("market-history:migrate", importMarketHistory);
  ipcMain.handle("market-catalog:load", loadMarketCatalog);
  ipcMain.handle("market-catalog:save", saveMarketCatalog);
  ipcMain.handle("recipe-cache:load", loadRecipeCache);
  ipcMain.handle("recipe-cache:save", saveRecipeCache);
  ipcMain.handle("item-cache:load", loadItemCache);
  ipcMain.handle("item-cache:load-by-type", loadItemCacheByType);
  ipcMain.handle("item-cache:save", saveItemCache);
  ipcMain.handle("wiki-container-cache:load", loadWikiContainerCache);
  ipcMain.handle("wiki-container-cache:save", saveWikiContainerCache);
  ipcMain.handle("app-cache:load", loadAppCache);
  ipcMain.handle("app-cache:save", saveAppCache);
  ipcMain.handle("app-cache:delete-prefix", deleteAppCachePrefix);
  ipcMain.handle("updates:check", checkForUpdates);
  ipcMain.handle("updates:open-download", openUpdateDownload);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
