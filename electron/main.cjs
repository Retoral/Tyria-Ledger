const { app, BrowserWindow, Menu, Tray, clipboard, dialog, ipcMain, nativeImage, nativeTheme, safeStorage, screen, shell } = require("electron");
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
let tray;
let database;
let isQuitting = false;

const HOUR_MS = 60 * 60 * 1000;
const START_HIDDEN_ARG = "--hidden";
const MARKET_HISTORY_RAW_WINDOW_MS = 24 * 60 * 60 * 1000;
const MARKET_HISTORY_DAILY_WINDOW_MS = 31 * 24 * 60 * 60 * 1000;
const MARKET_HISTORY_WEEKLY_WINDOW_MS = 8 * 31 * 24 * 60 * 60 * 1000;
const MARKET_HISTORY_MAX_AGE_MS = 2 * 366 * 24 * 60 * 60 * 1000;
const MAX_MARKET_HISTORY_POINTS_PER_ITEM = 800;
const VALID_ROLLUPS = new Set(["raw", "day", "week", "month", "bimonth"]);
const MARKET_HISTORY_COLUMNS = [
  ["item_id", "INTEGER NOT NULL"],
  ["recorded_at", "TEXT NOT NULL"],
  ["buy_price", "INTEGER NOT NULL"],
  ["sell_price", "INTEGER NOT NULL"],
  ["buy_quantity", "INTEGER NOT NULL"],
  ["sell_quantity", "INTEGER NOT NULL"],
  ["buy_price_open", "INTEGER"],
  ["buy_price_close", "INTEGER"],
  ["buy_price_min", "INTEGER"],
  ["buy_price_max", "INTEGER"],
  ["sell_price_open", "INTEGER"],
  ["sell_price_close", "INTEGER"],
  ["sell_price_min", "INTEGER"],
  ["sell_price_max", "INTEGER"],
  ["buy_quantity_min", "INTEGER"],
  ["buy_quantity_max", "INTEGER"],
  ["sell_quantity_min", "INTEGER"],
  ["sell_quantity_max", "INTEGER"],
  ["rollup", "TEXT NOT NULL DEFAULT 'raw'"],
  ["sample_count", "INTEGER NOT NULL DEFAULT 1"],
];
const MARKET_HISTORY_EXTRA_COLUMN_FALLBACKS = {
  buy_price_open: "buy_price",
  buy_price_close: "buy_price",
  buy_price_min: "buy_price",
  buy_price_max: "buy_price",
  sell_price_open: "sell_price",
  sell_price_close: "sell_price",
  sell_price_min: "sell_price",
  sell_price_max: "sell_price",
  buy_quantity_min: "buy_quantity",
  buy_quantity_max: "buy_quantity",
  sell_quantity_min: "sell_quantity",
  sell_quantity_max: "sell_quantity",
};
const UPDATE_REPOSITORY_OWNER = "Retoral";
const UPDATE_REPOSITORY_NAME = "Tyria-Ledger";
const UPDATE_API_URL = `https://api.github.com/repos/${UPDATE_REPOSITORY_OWNER}/${UPDATE_REPOSITORY_NAME}/releases/latest`;
const UPDATE_RELEASES_URL = `https://github.com/${UPDATE_REPOSITORY_OWNER}/${UPDATE_REPOSITORY_NAME}/releases`;
const WINDOW_BACKGROUND_COLOR = "#090d0f";
const WINDOW_CHROME_COLOR = "#151a1d";
const WINDOW_CHROME_SYMBOL_COLOR = "#d6ddd8";
const DEFAULT_WINDOW_BOUNDS = {
  width: 1440,
  height: 920,
};
const MIN_WINDOW_BOUNDS = {
  width: 1120,
  height: 720,
};

function windowStatePath() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function readWindowState() {
  try {
    const raw = fsSync.readFileSync(windowStatePath(), "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const width = Math.max(MIN_WINDOW_BOUNDS.width, Math.round(Number(parsed.width)));
    const height = Math.max(MIN_WINDOW_BOUNDS.height, Math.round(Number(parsed.height)));
    const x = Number.isFinite(parsed.x) ? Math.round(parsed.x) : undefined;
    const y = Number.isFinite(parsed.y) ? Math.round(parsed.y) : undefined;
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      return null;
    }

    const restoredBounds = {
      width,
      height,
      ...(Number.isFinite(x) && Number.isFinite(y) ? { x, y } : {}),
    };

    if (Number.isFinite(restoredBounds.x) && Number.isFinite(restoredBounds.y)) {
      const display = screen.getDisplayMatching(restoredBounds);
      const area = display.workArea;
      const intersectsDisplay =
        restoredBounds.x + restoredBounds.width > area.x &&
        restoredBounds.x < area.x + area.width &&
        restoredBounds.y + restoredBounds.height > area.y &&
        restoredBounds.y < area.y + area.height;

      if (!intersectsDisplay) {
        delete restoredBounds.x;
        delete restoredBounds.y;
      }
    }

    return restoredBounds;
  } catch {
    return null;
  }
}

function writeWindowState(window) {
  if (!window || window.isDestroyed() || window.isMinimized() || window.isFullScreen()) {
    return;
  }

  try {
    const bounds = window.getBounds();
    fsSync.mkdirSync(app.getPath("userData"), { recursive: true });
    fsSync.writeFileSync(windowStatePath(), JSON.stringify(bounds), "utf8");
  } catch {
    // Window state is a convenience only.
  }
}

function getWindowChromeOptions() {
  if (process.platform !== "win32" && process.platform !== "linux") {
    return {};
  }

  return {
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: WINDOW_CHROME_COLOR,
      symbolColor: WINDOW_CHROME_SYMBOL_COLOR,
      height: 36,
    },
  };
}

function getWindowIconPath() {
  if (isDev) {
    return path.join(__dirname, "..", "public", "app-icon.png");
  }

  return path.join(app.getAppPath(), "dist", "app-icon.png");
}

function getTrayIconImage() {
  const icon = nativeImage.createFromPath(getWindowIconPath());
  const trayIcon = icon.resize({
    width: process.platform === "darwin" ? 18 : 16,
    height: process.platform === "darwin" ? 18 : 16,
    quality: "best",
  });

  if (process.platform === "darwin") {
    trayIcon.setTemplateImage(true);
  }

  return trayIcon;
}

function shouldStartHidden() {
  return process.argv.includes(START_HIDDEN_ARG);
}

function getStartupSettings() {
  const settings = app.getLoginItemSettings({
    args: [START_HIDDEN_ARG],
  });

  return {
    openAtLogin: Boolean(settings.openAtLogin),
    openAsHidden: true,
  };
}

function setStartupSettings(_event, options = {}) {
  const openAtLogin = Boolean(options.openAtLogin);
  app.setLoginItemSettings({
    openAtLogin,
    openAsHidden: true,
    args: [START_HIDDEN_ARG],
  });
  updateTrayMenu();
  return getStartupSettings();
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
}

function hideMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  writeWindowState(mainWindow);
  mainWindow.hide();
}

function updateTrayMenu() {
  if (!tray) {
    return;
  }

  const startupSettings = getStartupSettings();
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: "Show Tyria Ledger",
      click: showMainWindow,
    },
    {
      label: "Hide Tyria Ledger",
      click: hideMainWindow,
    },
    { type: "separator" },
    {
      label: "Start with computer",
      type: "checkbox",
      checked: startupSettings.openAtLogin,
      click: (menuItem) => {
        setStartupSettings(null, { openAtLogin: menuItem.checked });
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]));
}

function createTray() {
  if (tray) {
    return;
  }

  tray = new Tray(getTrayIconImage());
  tray.setToolTip("Tyria Ledger");
  tray.on("click", showMainWindow);
  updateTrayMenu();
}

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
  try {
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
        buy_price_open INTEGER,
        buy_price_close INTEGER,
        buy_price_min INTEGER,
        buy_price_max INTEGER,
        sell_price_open INTEGER,
        sell_price_close INTEGER,
        sell_price_min INTEGER,
        sell_price_max INTEGER,
        buy_quantity_min INTEGER,
        buy_quantity_max INTEGER,
        sell_quantity_min INTEGER,
        sell_quantity_max INTEGER,
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

    ensureMarketHistorySchema(database);
  } catch (error) {
    try {
      database.close();
    } catch {
      // The original schema error is more useful than a close failure.
    }
    database = null;
    throw error;
  }

  return database;
}

function createMarketHistoryTableSql(tableName) {
  return `
    CREATE TABLE ${tableName} (
      ${MARKET_HISTORY_COLUMNS.map(([name, definition]) => `${name} ${definition}`).join(",\n      ")},
      PRIMARY KEY (item_id, recorded_at, rollup)
    )
  `;
}

function createMarketHistoryIndexes(db) {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_market_history_item_time
      ON market_history (item_id, recorded_at);
    CREATE INDEX IF NOT EXISTS idx_market_history_item_rollup_time
      ON market_history (item_id, rollup, recorded_at);
  `);
}

function getTableColumns(db, tableName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all();
}

function getPrimaryKeyColumns(columns) {
  return columns
    .filter((column) => Number(column.pk) > 0)
    .sort((left, right) => Number(left.pk) - Number(right.pk))
    .map((column) => column.name);
}

function ensureMarketHistorySchema(db) {
  let columns = getTableColumns(db, "market_history");
  const existingNames = new Set(columns.map((column) => column.name));
  const primaryKeyColumns = getPrimaryKeyColumns(columns);
  const needsRebuild = primaryKeyColumns.join(",") !== "item_id,recorded_at,rollup";

  if (needsRebuild) {
    rebuildMarketHistoryTable(db, columns);
    columns = getTableColumns(db, "market_history");
  } else {
    for (const [name, definition] of MARKET_HISTORY_COLUMNS) {
      if (!existingNames.has(name)) {
        db.exec(`ALTER TABLE market_history ADD COLUMN ${name} ${definition}`);
      }
    }
  }

  const finalColumns = getTableColumns(db, "market_history");
  const finalNames = new Set(finalColumns.map((column) => column.name));
  const missingColumns = MARKET_HISTORY_COLUMNS
    .map(([name]) => name)
    .filter((name) => !finalNames.has(name));
  if (missingColumns.length) {
    throw new Error(`Unable to upgrade market history database. Missing columns: ${missingColumns.join(", ")}`);
  }

  createMarketHistoryIndexes(db);
}

function rebuildMarketHistoryTable(db, columns) {
  const existingNames = new Set(columns.map((column) => column.name));
  const targetColumns = MARKET_HISTORY_COLUMNS.map(([name]) => name);
  const selectExpressions = targetColumns.map((name) => {
    if (name === "rollup") {
      return existingNames.has("rollup") ? "COALESCE(rollup, 'raw') AS rollup" : "'raw' AS rollup";
    }

    if (name === "sample_count") {
      return existingNames.has("sample_count") ? "COALESCE(sample_count, 1) AS sample_count" : "1 AS sample_count";
    }

    if (existingNames.has(name)) {
      return name;
    }

    const fallback = MARKET_HISTORY_EXTRA_COLUMN_FALLBACKS[name];
    if (fallback && existingNames.has(fallback)) {
      return `${fallback} AS ${name}`;
    }

    throw new Error(`Unable to rebuild market history database. Missing source column: ${name}`);
  });

  db.exec("BEGIN");
  try {
    db.exec(`
      DROP TABLE IF EXISTS market_history_migration_new;
      ${createMarketHistoryTableSql("market_history_migration_new")};
      INSERT OR REPLACE INTO market_history_migration_new (${targetColumns.join(", ")})
        SELECT ${selectExpressions.join(", ")}
        FROM market_history;
      DROP TABLE market_history;
      ALTER TABLE market_history_migration_new RENAME TO market_history;
    `);
    db.exec("COMMIT");
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // Preserve the original migration error.
    }
    throw error;
  }
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
  const buyPriceOpen = getOptionalHistoryNumber(value.buyPriceOpen ?? value.buy_price_open, buyPrice);
  const buyPriceClose = getOptionalHistoryNumber(value.buyPriceClose ?? value.buy_price_close, buyPrice);
  const buyPriceMin = getOptionalHistoryNumber(value.buyPriceMin ?? value.buy_price_min, buyPrice);
  const buyPriceMax = getOptionalHistoryNumber(value.buyPriceMax ?? value.buy_price_max, buyPrice);
  const sellPriceOpen = getOptionalHistoryNumber(value.sellPriceOpen ?? value.sell_price_open, sellPrice);
  const sellPriceClose = getOptionalHistoryNumber(value.sellPriceClose ?? value.sell_price_close, sellPrice);
  const sellPriceMin = getOptionalHistoryNumber(value.sellPriceMin ?? value.sell_price_min, sellPrice);
  const sellPriceMax = getOptionalHistoryNumber(value.sellPriceMax ?? value.sell_price_max, sellPrice);
  const buyQuantityMin = getOptionalHistoryNumber(value.buyQuantityMin ?? value.buy_quantity_min, buyQuantity);
  const buyQuantityMax = getOptionalHistoryNumber(value.buyQuantityMax ?? value.buy_quantity_max, buyQuantity);
  const sellQuantityMin = getOptionalHistoryNumber(value.sellQuantityMin ?? value.sell_quantity_min, sellQuantity);
  const sellQuantityMax = getOptionalHistoryNumber(value.sellQuantityMax ?? value.sell_quantity_max, sellQuantity);
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
    buyPriceOpen,
    buyPriceClose,
    buyPriceMin,
    buyPriceMax,
    sellPriceOpen,
    sellPriceClose,
    sellPriceMin,
    sellPriceMax,
    buyQuantityMin,
    buyQuantityMax,
    sellQuantityMin,
    sellQuantityMax,
    rollup,
    sampleCount,
  };
}

function getOptionalHistoryNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.round(numeric) : Math.round(fallback);
}

function rowToMarketHistoryPoint(row) {
  return {
    itemId: row.item_id,
    recordedAt: row.recorded_at,
    buyPrice: row.buy_price,
    sellPrice: row.sell_price,
    buyQuantity: row.buy_quantity,
    sellQuantity: row.sell_quantity,
    buyPriceOpen: row.buy_price_open ?? row.buy_price,
    buyPriceClose: row.buy_price_close ?? row.buy_price,
    buyPriceMin: row.buy_price_min ?? row.buy_price,
    buyPriceMax: row.buy_price_max ?? row.buy_price,
    sellPriceOpen: row.sell_price_open ?? row.sell_price,
    sellPriceClose: row.sell_price_close ?? row.sell_price,
    sellPriceMin: row.sell_price_min ?? row.sell_price,
    sellPriceMax: row.sell_price_max ?? row.sell_price,
    buyQuantityMin: row.buy_quantity_min ?? row.buy_quantity,
    buyQuantityMax: row.buy_quantity_max ?? row.buy_quantity,
    sellQuantityMin: row.sell_quantity_min ?? row.sell_quantity,
    sellQuantityMax: row.sell_quantity_max ?? row.sell_quantity,
    rollup: row.rollup,
    sampleCount: row.sample_count,
  };
}

function getMarketHistoryHourlyBucketStart(time) {
  return Math.round(time / HOUR_MS) * HOUR_MS;
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
  if (rollup === "raw") {
    return new Date(bucketStart).toISOString();
  }

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
  const sortedPoints = [...points].sort(
    (left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime(),
  );
  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];
  const totals = sortedPoints.reduce(
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
  const minValue = (key, fallbackKey) =>
    Math.min(...sortedPoints.map((point) => Number(point[key] ?? point[fallbackKey])));
  const maxValue = (key, fallbackKey) =>
    Math.max(...sortedPoints.map((point) => Number(point[key] ?? point[fallbackKey])));

  return {
    itemId,
    recordedAt: getMarketHistoryBucketRecordedAt(bucketStart, rollup),
    buyPrice: Math.round(totals.buyPrice / weight),
    sellPrice: Math.round(totals.sellPrice / weight),
    buyQuantity: Math.round(totals.buyQuantity / weight),
    sellQuantity: Math.round(totals.sellQuantity / weight),
    buyPriceOpen: firstPoint.buyPriceOpen ?? firstPoint.buyPrice,
    buyPriceClose: lastPoint.buyPriceClose ?? lastPoint.buyPrice,
    buyPriceMin: minValue("buyPriceMin", "buyPrice"),
    buyPriceMax: maxValue("buyPriceMax", "buyPrice"),
    sellPriceOpen: firstPoint.sellPriceOpen ?? firstPoint.sellPrice,
    sellPriceClose: lastPoint.sellPriceClose ?? lastPoint.sellPrice,
    sellPriceMin: minValue("sellPriceMin", "sellPrice"),
    sellPriceMax: maxValue("sellPriceMax", "sellPrice"),
    buyQuantityMin: minValue("buyQuantityMin", "buyQuantity"),
    buyQuantityMax: maxValue("buyQuantityMax", "buyQuantity"),
    sellQuantityMin: minValue("sellQuantityMin", "sellQuantity"),
    sellQuantityMax: maxValue("sellQuantityMax", "sellQuantity"),
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
    const buckets = new Map();

    for (const point of itemPoints) {
      const time = new Date(point.recordedAt).getTime();
      const rollup = getMarketHistoryRollup(time, now);
      const bucketStart =
        rollup === "raw" ? getMarketHistoryHourlyBucketStart(time) : getMarketHistoryBucketStart(time, rollup);
      const key = `${point.itemId}:${rollup}:${bucketStart}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(point);
      buckets.set(key, bucket);
    }

    const rolledPoints = Array.from(buckets.entries()).map(([key, bucketPoints]) => {
      const [, rollup, bucketStartText] = key.split(":");
      return averageMarketHistoryBucket(bucketPoints[0].itemId, Number(bucketStartText), rollup, bucketPoints);
    });

    return rolledPoints
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
      buy_price_open,
      buy_price_close,
      buy_price_min,
      buy_price_max,
      sell_price_open,
      sell_price_close,
      sell_price_min,
      sell_price_max,
      buy_quantity_min,
      buy_quantity_max,
      sell_quantity_min,
      sell_quantity_max,
      rollup,
      sample_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const point of points) {
    insert.run(
      point.itemId,
      point.recordedAt,
      point.buyPrice,
      point.sellPrice,
      point.buyQuantity,
      point.sellQuantity,
      point.buyPriceOpen ?? point.buyPrice,
      point.buyPriceClose ?? point.buyPrice,
      point.buyPriceMin ?? point.buyPrice,
      point.buyPriceMax ?? point.buyPrice,
      point.sellPriceOpen ?? point.sellPrice,
      point.sellPriceClose ?? point.sellPrice,
      point.sellPriceMin ?? point.sellPrice,
      point.sellPriceMax ?? point.sellPrice,
      point.buyQuantityMin ?? point.buyQuantity,
      point.buyQuantityMax ?? point.buyQuantity,
      point.sellQuantityMin ?? point.sellQuantity,
      point.sellQuantityMax ?? point.sellQuantity,
      point.rollup ?? "raw",
      Math.max(1, point.sampleCount ?? 1),
    );
  }
}

function insertOrMergeMarketHistoryPoints(db, points) {
  const upsert = db.prepare(`
    INSERT INTO market_history (
      item_id,
      recorded_at,
      buy_price,
      sell_price,
      buy_quantity,
      sell_quantity,
      buy_price_open,
      buy_price_close,
      buy_price_min,
      buy_price_max,
      sell_price_open,
      sell_price_close,
      sell_price_min,
      sell_price_max,
      buy_quantity_min,
      buy_quantity_max,
      sell_quantity_min,
      sell_quantity_max,
      rollup,
      sample_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(item_id, recorded_at, rollup) DO UPDATE SET
      buy_price = ROUND(
        (market_history.buy_price * market_history.sample_count + excluded.buy_price * excluded.sample_count) /
        CAST(market_history.sample_count + excluded.sample_count AS REAL)
      ),
      sell_price = ROUND(
        (market_history.sell_price * market_history.sample_count + excluded.sell_price * excluded.sample_count) /
        CAST(market_history.sample_count + excluded.sample_count AS REAL)
      ),
      buy_quantity = ROUND(
        (market_history.buy_quantity * market_history.sample_count + excluded.buy_quantity * excluded.sample_count) /
        CAST(market_history.sample_count + excluded.sample_count AS REAL)
      ),
      sell_quantity = ROUND(
        (market_history.sell_quantity * market_history.sample_count + excluded.sell_quantity * excluded.sample_count) /
        CAST(market_history.sample_count + excluded.sample_count AS REAL)
      ),
      buy_price_open = COALESCE(market_history.buy_price_open, market_history.buy_price),
      buy_price_close = excluded.buy_price_close,
      buy_price_min = MIN(COALESCE(market_history.buy_price_min, market_history.buy_price), excluded.buy_price_min),
      buy_price_max = MAX(COALESCE(market_history.buy_price_max, market_history.buy_price), excluded.buy_price_max),
      sell_price_open = COALESCE(market_history.sell_price_open, market_history.sell_price),
      sell_price_close = excluded.sell_price_close,
      sell_price_min = MIN(COALESCE(market_history.sell_price_min, market_history.sell_price), excluded.sell_price_min),
      sell_price_max = MAX(COALESCE(market_history.sell_price_max, market_history.sell_price), excluded.sell_price_max),
      buy_quantity_min = MIN(COALESCE(market_history.buy_quantity_min, market_history.buy_quantity), excluded.buy_quantity_min),
      buy_quantity_max = MAX(COALESCE(market_history.buy_quantity_max, market_history.buy_quantity), excluded.buy_quantity_max),
      sell_quantity_min = MIN(COALESCE(market_history.sell_quantity_min, market_history.sell_quantity), excluded.sell_quantity_min),
      sell_quantity_max = MAX(COALESCE(market_history.sell_quantity_max, market_history.sell_quantity), excluded.sell_quantity_max),
      sample_count = market_history.sample_count + excluded.sample_count
  `);

  for (const point of points) {
    upsert.run(
      point.itemId,
      point.recordedAt,
      point.buyPrice,
      point.sellPrice,
      point.buyQuantity,
      point.sellQuantity,
      point.buyPriceOpen ?? point.buyPrice,
      point.buyPriceClose ?? point.buyPrice,
      point.buyPriceMin ?? point.buyPrice,
      point.buyPriceMax ?? point.buyPrice,
      point.sellPriceOpen ?? point.sellPrice,
      point.sellPriceClose ?? point.sellPrice,
      point.sellPriceMin ?? point.sellPrice,
      point.sellPriceMax ?? point.sellPrice,
      point.buyQuantityMin ?? point.buyQuantity,
      point.buyQuantityMax ?? point.buyQuantity,
      point.sellQuantityMin ?? point.sellQuantity,
      point.sellQuantityMax ?? point.sellQuantity,
      point.rollup ?? "raw",
      Math.max(1, point.sampleCount ?? 1),
    );
  }
}

function bucketMarketHistoryPoint(point, now = Date.now()) {
  const time = new Date(point.recordedAt).getTime();
  if (!Number.isFinite(time)) {
    return null;
  }

  const rollup = getMarketHistoryRollup(time, now);
  const bucketStart =
    rollup === "raw" ? getMarketHistoryHourlyBucketStart(time) : getMarketHistoryBucketStart(time, rollup);
  return averageMarketHistoryBucket(point.itemId, bucketStart, rollup, [point]);
}

function haveMarketHistoryPointsChanged(previousPoints, nextPoints) {
  if (previousPoints.length !== nextPoints.length) {
    return true;
  }

  return nextPoints.some((nextPoint, index) => {
    const previousPoint = previousPoints[index];
    return (
      !previousPoint ||
      nextPoint.itemId !== previousPoint.itemId ||
      nextPoint.recordedAt !== previousPoint.recordedAt ||
      nextPoint.rollup !== previousPoint.rollup ||
      nextPoint.sampleCount !== previousPoint.sampleCount ||
      nextPoint.buyPrice !== previousPoint.buyPrice ||
      nextPoint.sellPrice !== previousPoint.sellPrice ||
      nextPoint.buyQuantity !== previousPoint.buyQuantity ||
      nextPoint.sellQuantity !== previousPoint.sellQuantity
    );
  });
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
  if (haveMarketHistoryPointsChanged(rows, compacted)) {
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

  if (haveMarketHistoryPointsChanged(rows, compacted)) {
    replaceItemMarketHistory(Math.round(itemId), compacted);
  }

  return compacted;
}

function getMarketHistoryMergeKey(point, now = Date.now()) {
  const time = new Date(point.recordedAt).getTime();
  if (!Number.isFinite(time)) {
    return null;
  }

  const rollup = getMarketHistoryRollup(time, now);
  const bucketStart =
    rollup === "raw" ? getMarketHistoryHourlyBucketStart(time) : getMarketHistoryBucketStart(time, rollup);
  return `${point.itemId}:${rollup}:${bucketStart}`;
}

function isRicherMarketHistoryPoint(candidate, existing) {
  const candidateSamples = Math.max(1, candidate.sampleCount ?? 1);
  const existingSamples = Math.max(1, existing.sampleCount ?? 1);
  if (candidateSamples !== existingSamples) {
    return candidateSamples > existingSamples;
  }

  const candidateTime = new Date(candidate.recordedAt).getTime();
  const existingTime = new Date(existing.recordedAt).getTime();
  return Number.isFinite(candidateTime) && Number.isFinite(existingTime) && candidateTime > existingTime;
}

function importMarketHistory(_event, rawPoints) {
  const currentPoints = getAllMarketHistory();
  const importedPoints = Array.isArray(rawPoints)
    ? rawPoints.map(normalizeMarketHistoryPoint).filter(Boolean)
    : [];
  const merged = [...currentPoints];
  const mergedIndexByKey = new Map();
  let added = 0;
  let ignored = 0;

  merged.forEach((point, index) => {
    const key = getMarketHistoryMergeKey(point);
    if (key) {
      mergedIndexByKey.set(key, index);
    }
  });

  for (const point of importedPoints) {
    const key = getMarketHistoryMergeKey(point);
    if (!key) {
      ignored += 1;
      continue;
    }

    const existingIndex = mergedIndexByKey.get(key);
    if (typeof existingIndex === "number") {
      if (isRicherMarketHistoryPoint(point, merged[existingIndex])) {
        merged[existingIndex] = point;
        added += 1;
      } else {
        ignored += 1;
      }
      continue;
    }

    mergedIndexByKey.set(key, merged.length);
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

function recordMarketHistoryBatch(_event, rawPoints) {
  const points = Array.isArray(rawPoints)
    ? rawPoints
        .map(normalizeMarketHistoryPoint)
        .filter(Boolean)
        .map((point) => bucketMarketHistoryPoint(point))
        .filter(Boolean)
    : [];

  if (points.length === 0) {
    return {
      recorded: 0,
    };
  }

  const db = openDatabase();
  db.exec("BEGIN");
  try {
    insertOrMergeMarketHistoryPoints(db, points);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    recorded: points.length,
  };
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

function closeDatabase() {
  if (!database || typeof database.close !== "function") {
    return;
  }

  try {
    database.close();
  } catch (error) {
    console.warn("Unable to close local database before quitting.", error);
  } finally {
    database = null;
  }
}

function quitAfterInstallerDownload() {
  const quitTimer = setTimeout(() => {
    isQuitting = true;
    closeDatabase();

    for (const browserWindow of BrowserWindow.getAllWindows()) {
      if (!browserWindow.isDestroyed()) {
        browserWindow.destroy();
      }
    }

    app.quit();

    const forceExitTimer = setTimeout(() => app.exit(0), 1500);
    forceExitTimer.unref?.();
  }, 750);

  quitTimer.unref?.();
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
  const shouldQuitForInstaller = Boolean(assetUrl) && (process.platform === "win32" || process.platform === "darwin");

  const response = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: assetUrl
      ? [shouldQuitForInstaller ? "Download and close app" : "Download installer", "Open release page", "Cancel"]
      : ["Open release page", "Cancel"],
    defaultId: 0,
    cancelId: assetUrl ? 2 : 1,
    title: "Update available",
    message: latestVersion
      ? `Tyria Ledger ${latestVersion} is available.`
      : "A Tyria Ledger update is available.",
    detail: assetUrl
      ? shouldQuitForInstaller
        ? `The app will open ${assetName} from GitHub, then close Tyria Ledger so the installer can replace the app files. After the download finishes, run the installer.`
        : `The app will open ${assetName} from GitHub. After it downloads, run the installer to update Tyria Ledger.`
      : "The app will open the GitHub release page so you can download the installer for your platform.",
  });

  if (response.response === 0) {
    await shell.openExternal(assetUrl || releaseUrl);

    if (shouldQuitForInstaller) {
      quitAfterInstallerDownload();
    }

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
  const savedWindowBounds = readWindowState();
  mainWindow = new BrowserWindow({
    width: DEFAULT_WINDOW_BOUNDS.width,
    height: DEFAULT_WINDOW_BOUNDS.height,
    minWidth: MIN_WINDOW_BOUNDS.width,
    minHeight: MIN_WINDOW_BOUNDS.height,
    ...savedWindowBounds,
    backgroundColor: WINDOW_BACKGROUND_COLOR,
    darkTheme: true,
    icon: getWindowIconPath(),
    title: "Tyria Ledger",
    autoHideMenuBar: true,
    show: false,
    ...getWindowChromeOptions(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const sendHistoryNavigation = (direction) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send("navigation:history", direction);
  };

  mainWindow.on("app-command", (event, command) => {
    if (command === "browser-backward") {
      event.preventDefault();
      sendHistoryNavigation("back");
    }

    if (command === "browser-forward") {
      event.preventDefault();
      sendHistoryNavigation("forward");
    }
  });

  mainWindow.on("swipe", (_event, direction) => {
    if (direction === "right") {
      sendHistoryNavigation("back");
    }

    if (direction === "left") {
      sendHistoryNavigation("forward");
    }
  });

  mainWindow.once("ready-to-show", () => {
    if (!shouldStartHidden()) {
      mainWindow.show();
    }
  });

  mainWindow.on("close", (event) => {
    writeWindowState(mainWindow);
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv = []) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    if (argv.includes(START_HIDDEN_ARG)) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
    mainWindow.focus();
  });

  app.on("before-quit", () => {
    isQuitting = true;
    closeDatabase();
  });

  app.whenReady().then(() => {
    nativeTheme.themeSource = "dark";
    createTray();

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
    ipcMain.handle("market-history:record-batch", recordMarketHistoryBatch);
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
    ipcMain.handle("clipboard:copy-text", (_event, text) => {
      clipboard.writeText(typeof text === "string" ? text : "");
      return true;
    });
    ipcMain.handle("updates:check", checkForUpdates);
    ipcMain.handle("updates:open-download", openUpdateDownload);
    ipcMain.handle("startup:get", getStartupSettings);
    ipcMain.handle("startup:set", setStartupSettings);

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else {
        showMainWindow();
      }
    });
  });

  app.on("window-all-closed", () => {});
}
