import type {
  AccountAchievement,
  AccountAnalysis,
  AchievementCatalog,
  AchievementCategory,
  AchievementGroup,
  AccountCharacter,
  AccountItemStack,
  AccountMaterial,
  AccountSnapshot,
  AccountTransaction,
  AccountWalletEntry,
  ApiStatusResult,
  Coin,
  ContainerAnalysis,
  ContainerDrop,
  CommerceListings,
  CommercePrice,
  CraftOpportunity,
  GatherableItemSource,
  GatheringDiscipline,
  GatheringLocationInfo,
  GatheringNodeYield,
  Gw2Achievement,
  Gw2Item,
  Gw2Map,
  Gw2Recipe,
  Gw2World,
  ItemTransactions,
  LegendaryReadiness,
  MarketItem,
  MetaBattleAttributeCombination,
  MetaBattleAttributeComponent,
  MetaBattleAttributeDistribution,
  MetaBattleBuildDetail,
  MetaBattleBuildEquipmentSlot,
  MetaBattleBuildSpecialization,
  MetaBattleBuildSkill,
  MetaBattleBuildTrait,
  MetaBattleFactLine,
  MetaBattleBuildSummary,
  MetaBattleWikiSkill,
  MetaBattleIcon,
  PermanentGatheringNode,
  RecipeGuide,
  RecipeIngredient,
  RecipeIngredientLine,
  TokenInfo,
  WikiGuide,
  WikiItemAcquisition,
  WikiRecipeUnlock,
  WikiVendorOffer,
  WizardVaultListing,
  WizardVaultListingValue,
  WizardVaultObjectiveDefinition,
  WizardVaultObjectiveGuide,
  WizardVaultObjectiveProgress,
  WizardVaultObjectiveSection,
  WizardVaultSnapshot,
} from "../types";
import {
  GATHERING_SOURCE_SEEDS,
  type GatheringSourceSeed,
} from "../data/gatheringSources";
import {
  PERMANENT_GATHERING_NODE_IMAGE_BASE_URL,
  PERMANENT_GATHERING_NODE_SEEDS,
  PERMANENT_GATHERING_NODE_SOURCE_URL,
} from "../data/permanentGatheringNodes";

const GW2_API = "https://api.guildwars2.com/v2";
const WIKI_API = "https://wiki.guildwars2.com/api.php";
const METABATTLE_API = "https://metabattle.com/wiki/api.php";
const METABATTLE_BASE_URL = "https://metabattle.com";
const TRADING_POST_NET_RATE = 0.85;
const CHUNK_SIZE = 180;
const COMMERCE_PAGE_SIZE = 200;
const COMMERCE_PAGE_CONCURRENCY = 12;
const ITEM_DETAIL_CONCURRENCY = 10;
const RECIPE_DETAIL_CONCURRENCY = 12;
const API_CHECK_TIMEOUT_MS = 6000;
const MAX_PARSED_CONTAINER_DROPS = 400;
const GW2_RATE_LIMIT_BURST = 300;
const GW2_RATE_LIMIT_REFILL_MS = 200;
const GW2_REQUEST_RETRY_LIMIT = 3;
const GW2_REQUEST_RETRY_MAX_DELAY_MS = 10_000;
const ACCOUNT_ANALYSIS_PERMISSIONS = ["characters", "inventories", "wallet", "unlocks", "progression"];
const SQL_CACHE_PREFIX = "tyria-ledger:v2";
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const SQL_CACHE_TTL = {
  accountSnapshot: 10 * MINUTE_MS,
  achievementCatalog: 24 * HOUR_MS,
  itemCatalog: 7 * DAY_MS,
  staticCatalog: 7 * DAY_MS,
  wikiDerived: 7 * DAY_MS,
  wikiPage: 7 * DAY_MS,
  wizardVaultPublic: 30 * MINUTE_MS,
  wizardVaultGuide: 24 * HOUR_MS,
  metabattleBuilds: 24 * HOUR_MS,
};

type ProgressCallback = (message: string, completed?: number, total?: number) => void;
type CatalogBatchCallback = (
  items: MarketItem[],
  progress: { loaded: number; total?: number },
) => void;

interface CachedAchievementCatalogPayload {
  groups: AchievementGroup[];
  categories: AchievementCategory[];
  achievements: Gw2Achievement[];
}

interface CachedAccountSnapshotPayload {
  tokenInfo: TokenInfo;
  materials: AccountMaterial[];
  bank: AccountItemStack[];
  inventory: AccountItemStack[];
  characters: AccountCharacter[];
  wallet: AccountWalletEntry[];
  coins: Coin;
  recipes: number[];
  achievements: AccountAchievement[];
  holdings: Array<[number, number]>;
}

interface CachedWikiHtmlPage {
  title: string;
  html: string;
  url: string;
}

interface WizardVaultEasyObjectiveRoute {
  location: string;
  note: string;
  chatLinks: string[];
  wikiLinks: WikiGuide[];
}

interface WizardVaultEasyObjectiveEntry {
  schedule: "Daily" | "Weekly";
  title: string;
  sourceUrl: string;
  routes: WizardVaultEasyObjectiveRoute[];
}

interface ProfitableCraftOptions {
  limit?: number;
  includeRecipeIds?: Iterable<number>;
  includeSpecialRecipeRows?: boolean;
}

interface MysticForgeRecipeOptions {
  holdings?: Map<number, number>;
}

const itemCache = new Map<number, Gw2Item>();
const priceCache = new Map<number, CommercePrice>();
const unresolvableItemIds = new Set<number>();
const unpricedItemIds = new Set<number>();
let recipeCache: Gw2Recipe[] | null = null;
let mysticForgeRecipeCache: Gw2Recipe[] | null = null;
const mysticForgeRecipeItemCache = new Map<number, Gw2Recipe[]>();
const wikiRecipeUsageItemCache = new Map<number, Gw2Recipe[]>();
let achievementCatalogCache: AchievementCatalog | null = null;
let achievementCatalogPromise: Promise<AchievementCatalog> | null = null;
let worldCache: Gw2World[] | null = null;
let mapCache: Gw2Map[] | null = null;
let allItemsCatalogCache: Gw2Item[] | null = null;
let wizardVaultObjectiveCatalogCache: WizardVaultObjectiveDefinition[] | null = null;
let gatherableItemsCache: GatherableItemSource[] | null = null;
let permanentGatheringNodesCache: PermanentGatheringNode[] | null = null;
let slotBagCache: Gw2Item[] | null = null;
let openableBagCache: Gw2Item[] | null = null;
let discontinuedWikiItemNamesCache: Set<string> | null = null;
const gatheringLocationCache = new Map<string, GatheringLocationInfo>();
const wikiAcquisitionCache = new Map<string, WikiItemAcquisition | null>();
let gw2RateLimitTokens = GW2_RATE_LIMIT_BURST;
let gw2RateLimitLastRefillAt = Date.now();
let gw2RateLimitQueue: Promise<void> = Promise.resolve();

const GENERIC_WIKI_TITLES = new Set([
  "Account Bound",
  "Copper coin",
  "Currency",
  "Dynamic event",
  "Equipment",
  "Item",
  "Item#Rarity",
  "Map meta event",
  "PvE",
  "Rarity",
]);
const NON_ITEM_CONTAINER_DROP_TITLES = new Set([
  "Crafting material",
  "Crafting materials",
  "Container",
  "Containers",
]);
const TROPHY_SHIPMENT_AVERAGE_DROP_NOTE =
  "Estimated average amount per opened Trophy Shipment from the GW2 Wiki community drop-rate sample.";
const DISCONTINUED_ITEMS_CATEGORY = "Category:Discontinued items";
const SLOT_BAG_CACHE_KEY = "wiki:slot-bag-items:v2";
const OPENABLE_BAG_CACHE_KEY = "wiki:openable-bag-items:v2";
const LEGACY_SLOT_BAG_CACHE_KEY = "wiki:slot-bag-items";
const LEGACY_OPENABLE_BAG_CACHE_KEY = "wiki:openable-bag-items";
const MIN_TRUSTED_CACHED_SLOT_BAGS = 50;
const MIN_TRUSTED_CACHED_CONTAINERS = 500;
const MYSTIC_FORGE_CATEGORY = "Category:Mystic Forge recipes";
const MYSTIC_FORGE_SEED_PAGES = [
  "Mystic Forge/Equipment",
  "Mystic Forge/Material Promotion",
  "Mystic Forge/Miscellaneous",
  "Mystic Forge/Sigils and Runes",
  "Mystic Coin/Equipment",
  "Mystic Coin/Feast of food",
  "Mystic Coin/Other",
  "Mystic Crystal/Material promotion recipes",
  "Philosopher's Stone/crafting materials",
];
const PHILOSOPHERS_STONE_ITEM_ID = 20796;
const LEGENDARY_READINESS_OUTPUT_NAMES = new Set([
  "Mystic Clover",
  "Mystic Tribute",
  "Gift of Battle",
  "Gift of Condensed Magic",
  "Gift of Condensed Might",
  "Gift of Craftsmanship",
  "Gift of Dedication",
  "Gift of Desert Mastery",
  "Gift of Exploration",
  "Gift of Fortune",
  "Gift of Jade Mastery",
  "Gift of Maguuma Mastery",
  "Gift of Mastery",
  "Gift of Prosperity",
  "Gift of Prowess",
  "Gift of the Mists",
]);
const LEGENDARY_READINESS_OUTPUT_PATTERNS = [
  /^Gift of\b/i,
  /\blegendary\b/i,
  /\bprecursor\b/i,
  /\benvoy\b/i,
  /\btribute\b/i,
];
const LEGENDARY_READINESS_EXOTIC_INGREDIENT_TYPES = new Set(["Weapon", "Armor"]);
const LEGENDARY_READINESS_UNIQUE_INGREDIENT_TYPES = new Set([
  "Armor",
  "Back",
  "Container",
  "Gizmo",
  "Trophy",
  "Trinket",
  "UpgradeComponent",
  "Weapon",
]);
const LEGENDARY_READINESS_EXCLUDED_UNIQUE_INGREDIENT_TYPES = new Set([
  "CraftingMaterial",
  "Gathering",
  "MiniPet",
  "Tool",
]);
const LEGENDARY_READINESS_UNIQUE_INGREDIENT_PATTERNS = [
  /^Gift of\b/i,
  /\bprecursor\b/i,
  /\blegendary\b/i,
  /\btribute\b/i,
  /\baurene\b/i,
  /\bdragon\b/i,
  /\bvision\b/i,
  /\baurora\b/i,
  /\bad infinitum\b/i,
  /\bcoalescence\b/i,
  /\bconflux\b/i,
  /\btranscendence\b/i,
  /\bprismatic\b/i,
  /\bgen(eration)?\s*(1|2|3)\b/i,
];
const LEGENDARY_READINESS_DIRECT_RECIPE_ID_BASE = -900_000_000;
const CRAFTING_DISCIPLINES = [
  "Armorsmith",
  "Artificer",
  "Chef",
  "Huntsman",
  "Jeweler",
  "Leatherworker",
  "Scribe",
  "Tailor",
  "Weaponsmith",
];

async function fetchJsonWithHeaders<T>(
  url: string,
  init?: RequestInit,
): Promise<{ data: T; headers: Headers }> {
  const isGw2Request = isGw2ApiUrl(url);
  const maxAttempts = isGw2Request ? GW2_REQUEST_RETRY_LIMIT + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (isGw2Request) {
      await waitForGw2RateLimitSlot();
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (fetchError) {
      if (isGw2Request && attempt < maxAttempts - 1) {
        await delay(getGw2RetryDelayMs(null, attempt));
        continue;
      }

      throw fetchError;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");

      if (
        isGw2Request &&
        attempt < maxAttempts - 1 &&
        shouldRetryGw2Response(response.status, body)
      ) {
        await delay(getGw2RetryDelayMs(response, attempt));
        continue;
      }

      const detail = formatHttpErrorBody(body);
      throw new Error(`${response.status} ${response.statusText}${detail ? `: ${detail}` : ""}`);
    }

    return {
      data: (await response.json()) as T,
      headers: response.headers,
    };
  }

  throw new Error("Unable to fetch GW2 API data after retries");
}

function isGw2ApiUrl(url: string): boolean {
  return url === GW2_API || url.startsWith(`${GW2_API}/`);
}

function refillGw2RateLimit(now = Date.now()) {
  const elapsedMs = now - gw2RateLimitLastRefillAt;
  if (elapsedMs < GW2_RATE_LIMIT_REFILL_MS) {
    return;
  }

  const restoredTokens = Math.floor(elapsedMs / GW2_RATE_LIMIT_REFILL_MS);
  gw2RateLimitTokens = Math.min(GW2_RATE_LIMIT_BURST, gw2RateLimitTokens + restoredTokens);
  gw2RateLimitLastRefillAt += restoredTokens * GW2_RATE_LIMIT_REFILL_MS;
}

async function waitForGw2RateLimitSlot(): Promise<void> {
  const acquireSlot = gw2RateLimitQueue.then(async () => {
    while (true) {
      const now = Date.now();
      refillGw2RateLimit(now);

      if (gw2RateLimitTokens > 0) {
        gw2RateLimitTokens -= 1;
        return;
      }

      const nextTokenDelay = Math.max(
        50,
        GW2_RATE_LIMIT_REFILL_MS - (now - gw2RateLimitLastRefillAt),
      );
      await delay(nextTokenDelay);
    }
  });

  gw2RateLimitQueue = acquireSlot.catch(() => undefined);
  return acquireSlot;
}

function shouldRetryGw2Response(status: number, body: string): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    (status === 401 && /invalid key/i.test(body))
  );
}

function formatHttpErrorBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmed) as { text?: unknown } | unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "text" in parsed &&
      typeof parsed.text === "string"
    ) {
      return truncateErrorDetail(parsed.text);
    }

    return truncateErrorDetail(JSON.stringify(parsed));
  } catch {
    const plainText = trimmed
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return truncateErrorDetail(plainText || "HTML error page returned by server");
  }
}

function truncateErrorDetail(detail: string): string {
  const normalized = detail.replace(/\s+/g, " ").trim();
  return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
}

function getGw2RetryDelayMs(response: Response | null, attempt: number): number {
  const retryAfter = response ? parseRetryAfterMs(response.headers) : null;
  if (retryAfter !== null) {
    return retryAfter;
  }

  const jitterMs = Math.floor(Math.random() * 250);
  return Math.min(GW2_REQUEST_RETRY_MAX_DELAY_MS, 750 * 2 ** attempt + jitterMs);
}

function parseRetryAfterMs(headers: Headers): number | null {
  const retryAfter = headers.get("retry-after");
  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) {
    return Math.max(0, Math.min(GW2_REQUEST_RETRY_MAX_DELAY_MS, seconds * 1000));
  }

  const retryAt = Date.parse(retryAfter);
  if (Number.isNaN(retryAt)) {
    return null;
  }

  return Math.max(0, Math.min(GW2_REQUEST_RETRY_MAX_DELAY_MS, retryAt - Date.now()));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function getSqlCacheKey(key: string): string {
  return `${SQL_CACHE_PREFIX}:${key}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function getNamedCacheKey(prefix: string, value: string): string {
  return `${prefix}:${stableHash(normalizePlainText(value).toLowerCase())}`;
}

async function loadSqlCache<T>(
  key: string,
  maxAgeMs: number,
  guard: (value: unknown) => value is T,
): Promise<T | null> {
  if (!window.gw2Desktop?.loadAppCache) {
    return null;
  }

  try {
    const cached = await window.gw2Desktop.loadAppCache(getSqlCacheKey(key));
    if (!cached) {
      return null;
    }

    const updatedAt = new Date(cached.updatedAt).getTime();
    if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > maxAgeMs) {
      return null;
    }

    return guard(cached.value) ? cached.value : null;
  } catch {
    return null;
  }
}

async function saveSqlCache(key: string, value: unknown): Promise<void> {
  if (!window.gw2Desktop?.saveAppCache) {
    return;
  }

  try {
    await window.gw2Desktop.saveAppCache(getSqlCacheKey(key), value);
  } catch {
    // SQL cache writes are opportunistic. The live API/wiki result remains usable in memory.
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const { data } = await fetchJsonWithHeaders<T>(url, init);
  return data;
}

function gw2AuthenticatedUrl(path: string, apiKey: string): string {
  const url = new URL(`${GW2_API}${path}`);
  url.searchParams.set("access_token", apiKey.trim());
  return url.toString();
}

function getAccountEndpointError(path: string, error: unknown): Error {
  const detail = error instanceof Error ? error.message : "Request failed";
  return new Error(`GW2 account endpoint ${path} failed: ${detail}`);
}

function assertAccountAnalysisPermissions(tokenInfo: TokenInfo) {
  const permissions = new Set(tokenInfo.permissions);
  const missing = ACCOUNT_ANALYSIS_PERMISSIONS.filter((permission) => !permissions.has(permission));
  if (missing.length > 0) {
    throw new Error(
      `This GW2 API key is valid, but account analysis needs these missing permissions: ${missing.join(", ")}.`,
    );
  }
}

async function checkEndpoint(
  group: ApiStatusResult["group"],
  label: string,
  url: string,
  init?: RequestInit,
): Promise<ApiStatusResult> {
  if (isGw2ApiUrl(url)) {
    await waitForGw2RateLimitSlot();
  }

  const start = performance.now();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    return {
      group,
      label,
      ok: response.ok,
      state: response.ok ? "operational" : "issue",
      latencyMs: Math.max(1, Math.round(performance.now() - start)),
      status: response.status,
    };
  } catch (error) {
    window.clearTimeout(timeout);

    return {
      group,
      label,
      ok: false,
      state: "issue",
      latencyMs: Math.max(1, Math.round(performance.now() - start)),
      status: null,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export async function checkApiStatuses(apiKey = ""): Promise<ApiStatusResult[]> {
  const endpoints = [
    {
      group: "GW2 API" as const,
      label: "/v2/items/",
      url: `${GW2_API}/items?ids=24`,
    },
    {
      group: "GW2 API" as const,
      label: "/v2/currencies/",
      url: `${GW2_API}/currencies?ids=1`,
    },
    {
      group: "GW2 API" as const,
      label: "/v2/commerce/listings/",
      url: `${GW2_API}/commerce/listings/19721`,
    },
    {
      group: "GW2 API" as const,
      label: "/v2/commerce/prices/",
      url: `${GW2_API}/commerce/prices/19721`,
    },
    {
      group: "GW2 API" as const,
      label: "/v2/commerce/exchange/gems",
      url: `${GW2_API}/commerce/exchange/gems?quantity=400`,
    },
  ];

  return Promise.all(
    [
      ...endpoints.map((endpoint) => checkEndpoint(endpoint.group, endpoint.label, endpoint.url)),
      apiKey.trim()
        ? checkEndpoint("User GW2 API", "/v2/tokeninfo", gw2AuthenticatedUrl("/tokeninfo", apiKey))
        : Promise.resolve({
            group: "User GW2 API" as const,
            label: "/v2/tokeninfo",
            ok: false,
            state: "not_configured" as const,
            status: null,
          }),
    ],
  );
}

async function fetchAccountJson<T>(
  apiKey: string,
  path: string,
  fallback: T,
  options: { required?: boolean } = {},
): Promise<T> {
  try {
    return await fetchJson<T>(gw2AuthenticatedUrl(path, apiKey), { cache: "no-store" });
  } catch (error) {
    if (options.required) {
      throw getAccountEndpointError(path, error);
    }

    console.warn(`Account endpoint failed: ${path}`, error);
    return fallback;
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, limit), items.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

function netSellValue(unitPrice: number, count = 1): number {
  return Math.floor(unitPrice * count * TRADING_POST_NET_RATE);
}

function toMarketItem(item: Gw2Item, price: CommercePrice): MarketItem {
  const netSellPrice = netSellValue(price.sells.unit_price);
  const spread = netSellPrice - price.buys.unit_price;
  const spreadPercent =
    price.buys.unit_price > 0 ? (spread / price.buys.unit_price) * 100 : 0;

  return {
    ...item,
    price,
    netSellPrice,
    spread,
    spreadPercent,
  };
}

function sortMarketItems(items: MarketItem[]): MarketItem[] {
  return [...items].sort((left, right) => {
    const quantityDelta = right.price.sells.quantity - left.price.sells.quantity;
    if (quantityDelta !== 0) {
      return quantityDelta;
    }

    return right.price.sells.unit_price - left.price.sells.unit_price;
  });
}

function cacheCommercePrices(prices: CommercePrice[]) {
  for (const price of prices) {
    priceCache.set(price.id, price);
  }
}

export function hydrateTradingPostCatalogCache(items: MarketItem[]) {
  for (const item of items) {
    itemCache.set(item.id, item);
    priceCache.set(item.id, item.price);
  }
}

function isMarketItem(value: unknown): value is MarketItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<MarketItem>;
  const price = (item as {
    price?: {
      id?: unknown;
      buys?: { quantity?: unknown; unit_price?: unknown };
      sells?: { quantity?: unknown; unit_price?: unknown };
    };
  }).price;

  return (
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.type === "string" &&
    typeof item.rarity === "string" &&
    typeof item.level === "number" &&
    typeof item.vendor_value === "number" &&
    typeof item.netSellPrice === "number" &&
    typeof item.spread === "number" &&
    typeof item.spreadPercent === "number" &&
    typeof price?.id === "number" &&
    typeof price.buys?.quantity === "number" &&
    typeof price.buys?.unit_price === "number" &&
    typeof price.sells?.quantity === "number" &&
    typeof price.sells?.unit_price === "number"
  );
}

async function hydrateCachedMarketPrices(): Promise<boolean> {
  if (!window.gw2Desktop?.loadMarketCatalog) {
    return false;
  }

  for (const scopeId of ["global", "region:europe", "region:north-america"]) {
    try {
      const cached = await window.gw2Desktop.loadMarketCatalog(scopeId);
      const items = cached?.items.filter(isMarketItem) ?? [];
      if (items.length > 0) {
        hydrateTradingPostCatalogCache(items);
        return priceCache.size > 0;
      }
    } catch {
      // Try the next saved market scope.
    }
  }

  return false;
}

function isGw2Recipe(value: unknown): value is Gw2Recipe {
  if (!value || typeof value !== "object") {
    return false;
  }

  const recipe = value as Partial<Gw2Recipe>;
  return (
    typeof recipe.id === "number" &&
    typeof recipe.type === "string" &&
    typeof recipe.output_item_count === "number" &&
    typeof recipe.time_to_craft_ms === "number" &&
    Array.isArray(recipe.disciplines) &&
    recipe.disciplines.every((discipline) => typeof discipline === "string") &&
    Array.isArray(recipe.flags) &&
    recipe.flags.every((flag) => typeof flag === "string") &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.every(
      (ingredient) =>
        ingredient &&
        typeof ingredient === "object" &&
        typeof ingredient.item_id === "number" &&
        typeof ingredient.count === "number",
    )
  );
}

async function loadCachedRecipes(): Promise<Gw2Recipe[] | null> {
  if (!window.gw2Desktop?.loadRecipeCache) {
    return null;
  }

  try {
    const cached = await window.gw2Desktop.loadRecipeCache();
    const recipes = cached?.recipes.filter(isGw2Recipe) ?? [];
    return recipes.length > 0 ? recipes : null;
  } catch {
    return null;
  }
}

async function saveCachedRecipes(recipes: Gw2Recipe[]) {
  if (!window.gw2Desktop?.saveRecipeCache || recipes.length === 0) {
    return;
  }

  try {
    await window.gw2Desktop.saveRecipeCache(recipes);
  } catch {
    // Recipe cache writes are opportunistic; live API data remains the source of truth.
  }
}

async function ensureCommercePrices(onProgress?: ProgressCallback): Promise<void> {
  if (priceCache.size > 0) {
    return;
  }

  onProgress?.("Checking cached market prices");
  if (await hydrateCachedMarketPrices()) {
    return;
  }

  const prices = await loadCommercePrices(onProgress);
  cacheCommercePrices(prices);
}

function countStacks(stacks: Array<AccountItemStack | AccountMaterial>): Map<number, number> {
  const holdings = new Map<number, number>();

  for (const stack of stacks) {
    if (!stack || !stack.id || !stack.count) {
      continue;
    }

    holdings.set(stack.id, (holdings.get(stack.id) ?? 0) + stack.count);
  }

  return holdings;
}

function countCharacterStacks(character: AccountCharacter): Map<number, number> {
  const stacks =
    character.bags?.flatMap((bag) => (bag?.inventory?.filter(Boolean) as AccountItemStack[] | undefined) ?? []) ?? [];
  return countStacks(stacks);
}

function mergeHoldings(...maps: Map<number, number>[]): Map<number, number> {
  const merged = new Map<number, number>();

  for (const map of maps) {
    for (const [id, count] of map) {
      merged.set(id, (merged.get(id) ?? 0) + count);
    }
  }

  return merged;
}

function getUnitPrice(itemId: number): number {
  const price = priceCache.get(itemId);
  return price?.sells.unit_price || price?.buys.unit_price || 0;
}

function getSellValue(itemId: number, count = 1): number {
  const price = priceCache.get(itemId);
  if (!price?.sells.unit_price) {
    return 0;
  }

  return netSellValue(price.sells.unit_price, count);
}

function getMarketBuyCost(itemId: number, count = 1): number {
  const price = priceCache.get(itemId);
  const unitPrice = price?.sells.unit_price || price?.buys.unit_price || 0;
  return unitPrice * count;
}

function isMysticForgeRecipeRecord(recipe: Gw2Recipe): boolean {
  const text = [
    recipe.type,
    recipe.source ?? "",
    recipe.sourceName ?? "",
    recipe.sourceUrl ?? "",
    ...recipe.disciplines,
    ...recipe.flags,
  ].join(" ").toLowerCase();
  return recipe.source === "wiki" || text.includes("mystic") || text.includes("forge") || recipe.disciplines.length === 0;
}

function isSpiritShardRecipeRecord(recipe: Gw2Recipe): boolean {
  const text = [
    recipe.type,
    recipe.source ?? "",
    recipe.sourceName ?? "",
    recipe.sourceUrl ?? "",
    ...recipe.disciplines,
    ...recipe.flags,
  ].join(" ").toLowerCase();

  return (
    text.includes("philosopher") ||
    text.includes("spirit shard") ||
    recipe.ingredients.some((ingredient) => ingredient.item_id === PHILOSOPHERS_STONE_ITEM_ID)
  );
}

function isSpecialProfitableCraftRecipe(recipe: Gw2Recipe): boolean {
  return isMysticForgeRecipeRecord(recipe) || isSpiritShardRecipeRecord(recipe);
}

function getUnknownNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getUnknownBoolean(value: unknown): boolean {
  return value === true;
}

function buildRecipeGuide(
  recipe: Gw2Recipe,
  holdings = new Map<number, number>(),
): RecipeGuide {
  const outputValue = recipe.output_item_id
    ? getSellValue(recipe.output_item_id, recipe.output_item_count)
    : 0;

  const ingredients: RecipeIngredientLine[] = recipe.ingredients.map((ingredient) => {
    const unitPrice = getUnitPrice(ingredient.item_id);
    const ownedCount = holdings.get(ingredient.item_id) ?? 0;

    return {
      ...ingredient,
      item: itemCache.get(ingredient.item_id),
      unitPrice,
      totalPrice: unitPrice * ingredient.count,
      ownedCount,
    };
  });

  const marketCost = ingredients.reduce((sum, line) => sum + line.totalPrice, 0);
  const ownedValue = ingredients.reduce((sum, line) => {
    return sum + Math.min(line.ownedCount, line.count) * line.unitPrice;
  }, 0);
  const personalCost = Math.max(0, marketCost - ownedValue);

  return {
    recipe,
    ingredients,
    outputValue,
    marketCost,
    netProfit: outputValue - marketCost,
    personalCost,
    personalProfit: outputValue - personalCost,
    ownedCoverage: marketCost > 0 ? ownedValue / marketCost : 0,
  };
}

async function loadCommercePricePage(
  page: number,
): Promise<{ prices: CommercePrice[]; totalPages: number | null; totalResults: number | null }> {
  const { data, headers } = await fetchJsonWithHeaders<CommercePrice[]>(
    `${GW2_API}/commerce/prices?page=${page}&page_size=${COMMERCE_PAGE_SIZE}`,
  );
  const pageTotalHeader = headers.get("X-Page-Total") ?? headers.get("x-page-total");
  const resultTotalHeader = headers.get("X-Result-Total") ?? headers.get("x-result-total");
  const parsedTotal = pageTotalHeader ? Number(pageTotalHeader) : NaN;
  const parsedResultTotal = resultTotalHeader ? Number(resultTotalHeader) : NaN;

  return {
    prices: data,
    totalPages: Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : null,
    totalResults:
      Number.isFinite(parsedResultTotal) && parsedResultTotal > 0 ? parsedResultTotal : null,
  };
}

async function loadCommercePrices(onProgress?: ProgressCallback): Promise<CommercePrice[]> {
  const prices: CommercePrice[] = [];
  onProgress?.("Loading Trading Post prices", 1);
  const firstPage = await loadCommercePricePage(0);
  prices.push(...firstPage.prices);

  const totalPages = firstPage.totalPages;
  if (totalPages) {
    let completedPages = 1;
    const remainingPages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 1);
    const pageResults = await mapWithConcurrency(
      remainingPages,
      COMMERCE_PAGE_CONCURRENCY,
      async (page) => {
        const result = await loadCommercePricePage(page);
        completedPages += 1;
        onProgress?.("Loading Trading Post prices", completedPages, totalPages);
        return result.prices;
      },
    );

    prices.push(...pageResults.flat());
    return prices;
  }

  let page = 1;
  while (firstPage.prices.length === COMMERCE_PAGE_SIZE) {
    onProgress?.("Loading Trading Post prices", page + 1);
    const result = await loadCommercePricePage(page);
    prices.push(...result.prices);

    if (result.prices.length < COMMERCE_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return prices;
}

async function loadCommercePricesByIds(ids: number[]): Promise<CommercePrice[]> {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id))));
  if (uniqueIds.length === 0) {
    return [];
  }

  const chunks = chunk(uniqueIds, CHUNK_SIZE);
  const batches = await mapWithConcurrency(chunks, COMMERCE_PAGE_CONCURRENCY, async (idChunk) => {
    try {
      return await fetchJson<CommercePrice[]>(`${GW2_API}/commerce/prices?ids=${idChunk.join(",")}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/all ids provided are invalid/i.test(message)) {
        for (const id of idChunk) {
          unpricedItemIds.add(id);
        }

        return [] as CommercePrice[];
      }

      throw error;
    }
  });

  return batches.flat();
}

export async function ensureCommercePricesForItems(ids: number[], onProgress?: ProgressCallback): Promise<void> {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id))));
  if (uniqueIds.length === 0) {
    return;
  }

  if (priceCache.size === 0) {
    onProgress?.("Checking cached market prices");
    await hydrateCachedMarketPrices();
  }

  const missingIds = uniqueIds.filter((id) => !priceCache.has(id) && !unpricedItemIds.has(id));
  if (missingIds.length === 0) {
    return;
  }

  onProgress?.("Loading linked Trading Post prices", 1, Math.ceil(missingIds.length / CHUNK_SIZE));
  const prices = await loadCommercePricesByIds(missingIds);
  cacheCommercePrices(prices);

  const returnedIds = new Set(prices.map((price) => price.id));
  for (const id of missingIds) {
    if (!returnedIds.has(id)) {
      unpricedItemIds.add(id);
    }
  }
}

export async function loadTradingPostCatalog(
  onProgress?: ProgressCallback,
): Promise<MarketItem[]> {
  const prices = await loadCommercePrices(onProgress);

  priceCache.clear();
  cacheCommercePrices(prices);

  const ids = prices.map((price) => price.id);
  const items = await loadItems(ids, onProgress);

  return items
    .map((item) => {
      const price = priceCache.get(item.id);
      return price ? toMarketItem(item, price) : null;
    })
    .filter((item): item is MarketItem => Boolean(item))
    .sort((left, right) => right.price.sells.quantity - left.price.sells.quantity);
}

export async function loadTradingPostCatalogProgressive(
  onBatch: CatalogBatchCallback,
  onProgress?: ProgressCallback,
  knownCatalogItems: Iterable<MarketItem> = [],
): Promise<MarketItem[]> {
  const catalog = new Map<number, MarketItem>();
  const knownItemsById = new Map<number, Gw2Item>();

  priceCache.clear();
  for (const item of knownCatalogItems) {
    knownItemsById.set(item.id, item);
    itemCache.set(item.id, item);
  }

  const hydrateMarketItemsForPrices = async (prices: CommercePrice[]): Promise<MarketItem[]> => {
    const marketItems: MarketItem[] = [];
    const missingItemIds: number[] = [];

    for (const price of prices) {
      const knownItem = itemCache.get(price.id) ?? knownItemsById.get(price.id);
      if (knownItem) {
        marketItems.push(toMarketItem(knownItem, price));
      } else {
        missingItemIds.push(price.id);
      }
    }

    if (missingItemIds.length === 0) {
      return marketItems;
    }

    onProgress?.("Loading new item details", 0, Math.ceil(missingItemIds.length / CHUNK_SIZE));
    const items = await loadItems(missingItemIds, onProgress);
    for (const item of items) {
      const price = priceCache.get(item.id);
      if (price) {
        marketItems.push(toMarketItem(item, price));
      }
    }

    return marketItems;
  };

  const processPricePage = async (
    prices: CommercePrice[],
    completedPage: number,
    totalPages?: number,
    totalResults?: number,
  ) => {
    cacheCommercePrices(prices);

    onProgress?.("Preparing market entries", completedPage, totalPages);
    const marketItems = await hydrateMarketItemsForPrices(prices);

    for (const item of marketItems) {
      catalog.set(item.id, item);
    }

    if (marketItems.length > 0) {
      onBatch(marketItems, {
        loaded: catalog.size,
        total: totalResults,
      });
    }
  };

  onProgress?.("Loading Trading Post prices", 1);
  const firstPage = await loadCommercePricePage(0);
  const totalPages = firstPage.totalPages;
  const totalResults = firstPage.totalResults ?? undefined;
  await processPricePage(firstPage.prices, 1, totalPages ?? undefined, totalResults);

  if (totalPages) {
    let completedPages = 1;
    const remainingPages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 1);
    const pageResults = await mapWithConcurrency(
      remainingPages,
      COMMERCE_PAGE_CONCURRENCY,
      async (pageNumber) => {
        const result = await loadCommercePricePage(pageNumber);
        completedPages += 1;
        onProgress?.("Loading Trading Post prices", completedPages, totalPages);
        return result.prices;
      },
    );
    const remainingPrices = pageResults.flat();
    cacheCommercePrices(remainingPrices);

    onProgress?.("Preparing market entries", 1, 1);
    const marketItems = await hydrateMarketItemsForPrices(remainingPrices);

    for (const item of marketItems) {
      catalog.set(item.id, item);
    }

    if (marketItems.length > 0) {
      onBatch(marketItems, {
        loaded: catalog.size,
        total: totalResults,
      });
    }

    return sortMarketItems(Array.from(catalog.values()));
  }

  let page = 1;
  while (firstPage.prices.length === COMMERCE_PAGE_SIZE) {
    onProgress?.("Loading Trading Post prices", page + 1);
    const result = await loadCommercePricePage(page);
    await processPricePage(result.prices, page + 1, result.totalPages ?? undefined, result.totalResults ?? undefined);

    if (result.prices.length < COMMERCE_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return sortMarketItems(Array.from(catalog.values()));
}

export async function loadProfitableCrafts(
  onProgress?: ProgressCallback,
  optionsOrLimit: ProfitableCraftOptions | number = {},
): Promise<CraftOpportunity[]> {
  const options =
    typeof optionsOrLimit === "number"
      ? {
          limit: optionsOrLimit,
        }
      : optionsOrLimit;
  const limit = options.limit ?? Number.POSITIVE_INFINITY;
  const includeRecipeIds = new Set(options.includeRecipeIds ?? []);
  const includeSpecialRecipeRows = options.includeSpecialRecipeRows ?? false;
  const [, officialRecipes, wikiMysticRecipes] = await Promise.all([
    ensureCommercePrices(onProgress),
    loadAllRecipes(onProgress),
    loadWikiMysticForgeRecipes(onProgress).catch(() => []),
  ]);
  const recipes = [...officialRecipes, ...wikiMysticRecipes];

  onProgress?.("Ranking market craft profits");
  const ranked = recipes
    .map((recipe) => {
      if (!recipe.output_item_id || recipe.output_item_count <= 0) {
        return null;
      }

      const outputPrice = priceCache.get(recipe.output_item_id);
      if (!outputPrice?.sells.unit_price) {
        return null;
      }

      let marketCost = 0;
      for (const ingredient of recipe.ingredients) {
        const ingredientCost = getMarketBuyCost(ingredient.item_id, ingredient.count);
        if (ingredientCost <= 0) {
          return null;
        }

        marketCost += ingredientCost;
      }

      const outputValue = netSellValue(outputPrice.sells.unit_price, recipe.output_item_count);
      const marketProfit = outputValue - marketCost;

      return {
        recipe,
        outputValue,
        marketCost,
        marketProfit,
      };
    })
    .filter(
      (
        item,
      ): item is Pick<CraftOpportunity, "recipe" | "outputValue" | "marketCost" | "marketProfit"> =>
        item !== null,
    )
    .sort((left, right) => right.marketProfit - left.marketProfit);

  const profitableRanked = ranked.filter((entry) => entry.marketProfit > 0);
  const candidatesByRecipeId = new Map<number, (typeof ranked)[number]>();
  const marketCandidateCount = Math.max(limit, 0);
  const marketCandidates = Number.isFinite(marketCandidateCount)
    ? profitableRanked.slice(0, marketCandidateCount)
    : profitableRanked;
  for (const entry of marketCandidates) {
    candidatesByRecipeId.set(entry.recipe.id, entry);
  }

  if (includeRecipeIds.size > 0) {
    for (const entry of profitableRanked) {
      if (includeRecipeIds.has(entry.recipe.id)) {
        candidatesByRecipeId.set(entry.recipe.id, entry);
      }
    }
  }

  if (includeSpecialRecipeRows) {
    for (const entry of ranked) {
      if (isSpecialProfitableCraftRecipe(entry.recipe)) {
        candidatesByRecipeId.set(entry.recipe.id, entry);
      }
    }
  }

  const candidates = Array.from(candidatesByRecipeId.values()).sort(
    (left, right) => right.marketProfit - left.marketProfit,
  );

  const outputIds = candidates
    .map((entry) => entry.recipe.output_item_id)
    .filter((id): id is number => typeof id === "number");
  await loadItems(outputIds, onProgress);

  return candidates
    .map((entry) => {
      const outputId = entry.recipe.output_item_id;
      const output = outputId ? itemCache.get(outputId) : undefined;
      if (!output) {
        return null;
      }

      return {
        recipe: entry.recipe,
        output,
        outputValue: entry.outputValue,
        marketCost: entry.marketCost,
        marketProfit: entry.marketProfit,
        personalCost: entry.marketCost,
        personalProfit: entry.marketProfit,
        ownedCoverage: 0,
      };
    })
    .filter((item): item is CraftOpportunity => Boolean(item))
    .sort((left, right) => right.marketProfit - left.marketProfit);
}

export async function loadHighValueCrafts(
  onProgress?: ProgressCallback,
  limit = Number.POSITIVE_INFINITY,
): Promise<CraftOpportunity[]> {
  const [, officialRecipes, wikiMysticRecipes] = await Promise.all([
    ensureCommercePrices(onProgress),
    loadAllRecipes(onProgress),
    loadWikiMysticForgeRecipes(onProgress).catch(() => []),
  ]);
  const recipes = [...officialRecipes, ...wikiMysticRecipes];

  onProgress?.("Ranking highest-value craft outputs");
  const ranked = recipes
    .map((recipe) => {
      if (!recipe.output_item_id || recipe.output_item_count <= 0) {
        return null;
      }

      const outputPrice = priceCache.get(recipe.output_item_id);
      const unitSell = outputPrice?.sells.unit_price || outputPrice?.buys.unit_price || 0;
      if (unitSell <= 0) {
        return null;
      }

      const outputValue = netSellValue(unitSell, recipe.output_item_count);
      let marketCost = 0;
      let hasFullCost = true;
      for (const ingredient of recipe.ingredients) {
        const ingredientCost = getMarketBuyCost(ingredient.item_id, ingredient.count);
        if (ingredientCost <= 0) {
          hasFullCost = false;
        }
        marketCost += ingredientCost;
      }

      return {
        recipe,
        outputValue,
        marketCost: hasFullCost ? marketCost : 0,
        marketProfit: hasFullCost ? outputValue - marketCost : 0,
      };
    })
    .filter(
      (
        item,
      ): item is Pick<CraftOpportunity, "recipe" | "outputValue" | "marketCost" | "marketProfit"> =>
        item !== null,
    )
    .sort((left, right) => right.outputValue - left.outputValue);

  const outputIds = ranked
    .map((entry) => entry.recipe.output_item_id)
    .filter((id): id is number => typeof id === "number");
  await loadItems(outputIds, onProgress);

  return ranked
    .map((entry) => {
      const outputId = entry.recipe.output_item_id;
      const output = outputId ? itemCache.get(outputId) : undefined;
      if (!output) {
        return null;
      }

      return {
        recipe: entry.recipe,
        output,
        outputValue: entry.outputValue,
        marketCost: entry.marketCost,
        marketProfit: entry.marketProfit,
        personalCost: entry.marketCost,
        personalProfit: entry.marketProfit,
        ownedCoverage: 0,
      };
    })
    .filter((item): item is CraftOpportunity => Boolean(item))
    .sort((left, right) => right.outputValue - left.outputValue);
}

export async function loadMysticForgeRecipeGuides(
  onProgress?: ProgressCallback,
  options: MysticForgeRecipeOptions = {},
): Promise<RecipeGuide[]> {
  const [officialRecipes, wikiMysticRecipes] = await Promise.all([
    loadAllRecipes(onProgress),
    loadWikiMysticForgeRecipes(onProgress).catch(() => []),
    ensureCommercePrices(onProgress),
  ]).then(([officialRecipes, wikiMysticRecipes]) => [officialRecipes, wikiMysticRecipes] as const);
  const recipes = dedupeRecipes([
    ...officialRecipes.filter(isMysticForgeRecipeRecord),
    ...wikiMysticRecipes,
  ]);
  const linkedIds = Array.from(
    new Set([
      ...recipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.item_id)),
      ...recipes
        .map((recipe) => recipe.output_item_id)
        .filter((id): id is number => typeof id === "number"),
    ]),
  );

  await Promise.all([
    loadItems(linkedIds, onProgress),
    ensureCommercePricesForItems(linkedIds, onProgress),
  ]);

  return recipes
    .map((recipe) => buildRecipeGuide(recipe, options.holdings))
    .sort((left, right) => {
      const leftValue = left.outputValue || getUnitPrice(left.recipe.output_item_id ?? 0);
      const rightValue = right.outputValue || getUnitPrice(right.recipe.output_item_id ?? 0);
      return rightValue - leftValue || (left.recipe.sourceName ?? "").localeCompare(right.recipe.sourceName ?? "");
    });
}

export async function loadItems(ids: number[], onProgress?: ProgressCallback): Promise<Gw2Item[]> {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id))));
  const initiallyMissingIds = uniqueIds.filter((id) => !itemCache.has(id) && !unresolvableItemIds.has(id));
  const cachedItems = await loadCachedItemDetails(initiallyMissingIds);
  for (const item of cachedItems) {
    itemCache.set(item.id, item);
  }

  const missingIds = uniqueIds.filter((id) => !itemCache.has(id) && !unresolvableItemIds.has(id));
  const idChunks = chunk(missingIds, CHUNK_SIZE);

  const loadedChunks = await mapWithConcurrency(idChunks, ITEM_DETAIL_CONCURRENCY, async (idChunk, index) => {
    if (idChunk.length === 0) {
      return [] as Gw2Item[];
    }

    onProgress?.("Loading linked item details", index + 1, idChunks.length);
    return loadItemChunk(idChunk);
  });
  const loadedItems = loadedChunks.flat();
  if (loadedItems.length > 0) {
    await saveCachedItemDetails(loadedItems);
  }

  return ids.map((id) => itemCache.get(id)).filter((item): item is Gw2Item => Boolean(item));
}

async function loadItemChunk(ids: number[]): Promise<Gw2Item[]> {
  if (ids.length === 0) {
    return [];
  }

  try {
    const batch = await fetchJson<Gw2Item[]>(`${GW2_API}/items?ids=${ids.join(",")}`);
    const returnedIds = new Set(batch.map((item) => item.id));

    for (const item of batch) {
      itemCache.set(item.id, item);
    }

    for (const id of ids) {
      if (!returnedIds.has(id)) {
        unresolvableItemIds.add(id);
      }
    }

    return batch;
  } catch (error) {
    if (!isItemDetailIdError(error)) {
      throw error;
    }

    if (ids.length === 1) {
      unresolvableItemIds.add(ids[0]);
      return [];
    }

    const midpoint = Math.ceil(ids.length / 2);
    const [left, right] = await Promise.all([
      loadItemChunk(ids.slice(0, midpoint)),
      loadItemChunk(ids.slice(midpoint)),
    ]);
    return [...left, ...right];
  }
}

function isGw2Item(value: unknown): value is Gw2Item {
  const item = value as Partial<Gw2Item> | null;
  return Boolean(
    item &&
      typeof item.id === "number" &&
      typeof item.name === "string" &&
      typeof item.type === "string" &&
      typeof item.rarity === "string" &&
      typeof item.level === "number" &&
      typeof item.vendor_value === "number",
  );
}

async function loadCachedItemDetails(ids: number[]): Promise<Gw2Item[]> {
  if (!window.gw2Desktop?.loadItemCache || ids.length === 0) {
    return [];
  }

  try {
    const result = await window.gw2Desktop.loadItemCache(ids);
    return result.items.filter(isGw2Item);
  } catch {
    return [];
  }
}

async function saveCachedItemDetails(items: Gw2Item[]): Promise<void> {
  if (!window.gw2Desktop?.saveItemCache || items.length === 0) {
    return;
  }

  try {
    await window.gw2Desktop.saveItemCache(items);
  } catch {
    // The memory cache is still valid; persistent cache failures should not break API loading.
  }
}

async function loadCachedItemDetailsByType(type: string): Promise<Gw2Item[]> {
  if (!window.gw2Desktop?.loadItemCacheByType) {
    return [];
  }

  try {
    const result = await window.gw2Desktop.loadItemCacheByType(type);
    return result.items.filter(isGw2Item);
  } catch {
    return [];
  }
}

function isItemDetailIdError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /^(400|404)\b/.test(message);
}

async function loadAllItemsCatalog(onProgress?: ProgressCallback): Promise<Gw2Item[]> {
  if (allItemsCatalogCache) {
    return allItemsCatalogCache;
  }

  const cachedCatalog = await loadSqlCache(
    "official:all-items-catalog",
    SQL_CACHE_TTL.itemCatalog,
    (value): value is Gw2Item[] => isArrayOf(value, isGw2Item),
  );
  if (cachedCatalog?.length) {
    allItemsCatalogCache = cachedCatalog;
    for (const item of allItemsCatalogCache) {
      itemCache.set(item.id, item);
    }
    return allItemsCatalogCache;
  }

  onProgress?.("Scanning official item catalog");
  const ids = await fetchJson<number[]>(`${GW2_API}/items`);
  onProgress?.("Loading official item catalog", 0, Math.ceil(ids.length / CHUNK_SIZE));
  allItemsCatalogCache = await loadItems(ids, onProgress);

  for (const item of allItemsCatalogCache) {
    itemCache.set(item.id, item);
  }

  void saveSqlCache("official:all-items-catalog", allItemsCatalogCache);
  return allItemsCatalogCache;
}

interface SemanticWikiAskResponse {
  "query-continue-offset"?: number;
  query?: {
    results?: Record<
      string,
      {
        fulltext?: string;
        fullurl?: string;
        printouts?: {
          Has_game_id?: number[];
          "Has game id"?: number[];
        };
      }
    >;
  };
}

async function loadWikiWikitext(page: string): Promise<string> {
  const cacheKey = getNamedCacheKey("wiki:wikitext", page);
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wikiPage,
    (value): value is string => typeof value === "string",
  );
  if (cached !== null) {
    return cached;
  }

  const params = new URLSearchParams({
    action: "parse",
    page,
    prop: "wikitext",
    redirects: "1",
    origin: "*",
    format: "json",
  });
  const payload = await fetchJson<{
    parse?: {
      wikitext?: {
        "*": string;
      };
    };
  }>(`${WIKI_API}?${params.toString()}`);

  const wikitext = payload.parse?.wikitext?.["*"] ?? "";
  void saveSqlCache(cacheKey, wikitext);
  return wikitext;
}

function normalizeWikiLookupName(name: string): string {
  return name
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getWikiLinkTitle(cell: string): string {
  const match = cell.match(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/);
  if (!match) {
    return cell.replace(/\[\[|\]\]/g, "").replace(/\s+/g, " ").trim();
  }

  return match[1].replace(/\s+/g, " ").trim();
}

function wikiPageUrl(title: string): string {
  return `https://wiki.guildwars2.com/wiki/${encodeURIComponent(title).replace(/%20/g, "_")}`;
}

function metaBattlePageUrl(title: string): string {
  return `${METABATTLE_BASE_URL}/wiki/${encodeURIComponent(title).replace(/%20/g, "_").replace(/%3A/g, ":")}`;
}

function toAbsoluteMetaBattleUrl(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, METABATTLE_BASE_URL).toString();
  } catch {
    return undefined;
  }
}

const METABATTLE_BUILD_PAGES = [
  { page: "Open_World", mode: "Open World" },
  { page: "Fractal", mode: "Fractal & Dungeon" },
  { page: "Raid", mode: "Raid" },
  { page: "PvP", mode: "PvP" },
  { page: "WvW_Roaming", mode: "WvW - Roaming" },
  { page: "WvW_Zerg", mode: "WvW - Zerg" },
  { page: "Core", mode: "Core / F2P" },
];

const METABATTLE_PROFESSION_SKILL_PAGES: Record<string, string> = {
  Elementalist: "List of elementalist skills",
  Engineer: "List of engineer skills",
  Guardian: "List of guardian skills",
  Mesmer: "List of mesmer skills",
  Necromancer: "List of necromancer skills",
  Ranger: "List of ranger skills",
  Revenant: "List of revenant skills",
  Thief: "List of thief skills",
  Warrior: "List of warrior skills",
};

const METABATTLE_ELITE_SPEC_PROFESSIONS: Record<string, string> = {
  Berserker: "Warrior",
  Bladesworn: "Warrior",
  Catalyst: "Elementalist",
  Chronomancer: "Mesmer",
  Daredevil: "Thief",
  Deadeye: "Thief",
  Dragonhunter: "Guardian",
  Druid: "Ranger",
  Elementalist: "Elementalist",
  Engineer: "Engineer",
  Firebrand: "Guardian",
  Guardian: "Guardian",
  Harbinger: "Necromancer",
  Herald: "Revenant",
  Holosmith: "Engineer",
  Mechanist: "Engineer",
  Mesmer: "Mesmer",
  Mirage: "Mesmer",
  Necromancer: "Necromancer",
  Ranger: "Ranger",
  Reaper: "Necromancer",
  Renegade: "Revenant",
  Revenant: "Revenant",
  Scourge: "Necromancer",
  Scrapper: "Engineer",
  Soulbeast: "Ranger",
  Specter: "Thief",
  Spellbreaker: "Warrior",
  Tempest: "Elementalist",
  Thief: "Thief",
  Untamed: "Ranger",
  Vindicator: "Revenant",
  Virtuoso: "Mesmer",
  Warrior: "Warrior",
  Weaver: "Elementalist",
  Willbender: "Guardian",
};

const metaBattleWikiSkillMemoryCache = new Map<string, MetaBattleWikiSkill[]>();
const metaBattleHtmlMemoryCache = new Map<string, MetaBattleHtmlPage | null>();
const metaBattleHtmlInflightCache = new Map<string, Promise<MetaBattleHtmlPage | null>>();
const metaBattleBuildDetailMemoryCache = new Map<string, MetaBattleBuildDetail>();
const metaBattleBuildDetailInflightCache = new Map<string, Promise<MetaBattleBuildDetail>>();
const metaBattleSkillBundleMemoryCache = new Map<string, MetaBattleBuildSkill[]>();
const metaBattleSpecializationBundleMemoryCache = new Map<string, Gw2SpecializationApiEntry[]>();
const metaBattleTraitBundleMemoryCache = new Map<string, Gw2TraitApiEntry[]>();
let metaBattleBuildLibraryMemoryCache: MetaBattleBuildSummary[] | null = null;
let metaBattleBuildLibraryInflight: Promise<MetaBattleBuildSummary[]> | null = null;
let metaBattleWikiSpecializationIndexMemoryCache: Map<string, MetaBattleWikiSpecializationInfo> | null = null;
const metaBattleWikiSpecializationDetailMemoryCache = new Map<string, MetaBattleWikiSpecializationInfo | undefined>();
const wikiHtmlMemoryCache = new Map<string, { title: string; html: string; url: string } | null>();
const wikiHtmlInflightCache = new Map<string, Promise<{ title: string; html: string; url: string } | null>>();

interface MetaBattleHtmlPage {
  title: string;
  html: string;
  url: string;
}

interface MetaBattleWikiSpecializationInfo {
  name: string;
  profession?: string;
  focus?: string;
  icon?: string;
  background?: string;
  description?: string;
  url: string;
}

interface Gw2SkillApiEntry {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  type?: string;
  slot?: string;
  facts?: Gw2FactApiEntry[];
}

interface Gw2SpecializationApiEntry {
  id: number;
  name: string;
  profession?: string;
  elite?: boolean;
  icon?: string;
  background?: string;
  minor_traits?: number[];
  major_traits?: number[];
}

interface Gw2TraitApiEntry {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  specialization?: number;
  facts?: Gw2FactApiEntry[];
}

interface Gw2FactApiEntry {
  text?: string;
  type?: string;
  icon?: string;
  value?: number | boolean | string;
  percent?: number;
  duration?: number;
  status?: string;
  description?: string;
  field_type?: string;
  finisher_type?: string;
  hit_count?: number;
  distance?: number;
  prefix?: {
    text?: string;
    icon?: string;
    status?: string;
    description?: string;
  };
}

async function loadMetaBattleHtml(page: string): Promise<MetaBattleHtmlPage | null> {
  const memoryKey = normalizeWikiLookupName(page);
  if (metaBattleHtmlMemoryCache.has(memoryKey)) {
    return metaBattleHtmlMemoryCache.get(memoryKey) ?? null;
  }
  const inflight = metaBattleHtmlInflightCache.get(memoryKey);
  if (inflight) {
    return inflight;
  }

  const promise = loadMetaBattleHtmlUncached(page)
    .then((result) => {
      metaBattleHtmlMemoryCache.set(memoryKey, result);
      return result;
    })
    .finally(() => {
      metaBattleHtmlInflightCache.delete(memoryKey);
    });
  metaBattleHtmlInflightCache.set(memoryKey, promise);
  return promise;
}

async function loadMetaBattleHtmlUncached(page: string): Promise<MetaBattleHtmlPage | null> {
  const cacheKey = getNamedCacheKey("metabattle:html", page);
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.metabattleBuilds, isMetaBattleHtmlPage);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    action: "parse",
    page,
    prop: "text|displaytitle",
    redirects: "1",
    origin: "*",
    format: "json",
  });

  try {
    const payload = await fetchJson<{
      parse?: {
        title: string;
        text?: {
          "*": string;
        };
      };
    }>(`${METABATTLE_API}?${params.toString()}`);

    if (!payload.parse?.text?.["*"]) {
      return null;
    }

    const result = {
      title: payload.parse.title,
      html: payload.parse.text["*"],
      url: metaBattlePageUrl(payload.parse.title),
    };
    void saveSqlCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`MetaBattle page failed: ${page}`, error);
    return null;
  }
}

function parseMetaBattleBuildRows(page: MetaBattleHtmlPage, mode: string): MetaBattleBuildSummary[] {
  const document = new DOMParser().parseFromString(page.html, "text/html");
  const root = document.querySelector(".mw-parser-output") ?? document.body;
  const rows: MetaBattleBuildSummary[] = [];
  let currentSection = "Builds";
  let currentProfession = "Any";

  for (const child of Array.from(root.children)) {
    if (/^H[2-3]$/i.test(child.tagName)) {
      currentSection = normalizePlainText(child.textContent ?? "").replace(/\[edit]$/i, "").trim() || currentSection;
      continue;
    }

    if (child.classList.contains("build-row-header")) {
      currentProfession = normalizePlainText(child.textContent ?? "") || currentProfession;
      continue;
    }

    if (!child.classList.contains("build-row")) {
      continue;
    }

    const link = child.querySelector<HTMLAnchorElement>('a[title^="Build:"]');
    const pageTitle = link?.getAttribute("title")?.trim();
    const title = normalizePlainText(link?.textContent ?? "");
    if (!link || !pageTitle || !title) {
      continue;
    }

    const rowIcons = Array.from(child.querySelectorAll<HTMLImageElement>("img"))
      .map((image): MetaBattleIcon | null => {
        const label = normalizePlainText(
          image.closest<HTMLElement>("[title]")?.getAttribute("title") ?? image.getAttribute("alt") ?? "",
        );
        if (!label || label === "Optional") {
          return null;
        }
        return {
          label,
          imageUrl: toAbsoluteMetaBattleUrl(image.getAttribute("src")),
        };
      })
      .filter((icon): icon is MetaBattleIcon => Boolean(icon));

    const uniqueIcons = dedupeMetaBattleIcons(rowIcons);
    const quality = uniqueIcons[0]?.label;
    const eliteSpec = uniqueIcons.find((icon) => icon.label !== quality && /profession|spec/i.test(icon.imageUrl ?? ""))?.label
      ?? uniqueIcons.find((icon) => icon.label !== quality)?.label;
    const difficulty = normalizePlainText(
      child.querySelector<HTMLElement>('[title^="Difficulty:"]')?.getAttribute("title")?.replace(/^Difficulty:\s*/i, "") ?? "",
    );
    const ratingValue = Number(normalizePlainText(child.querySelector(".build-row-rating")?.textContent ?? ""));
    const url = toAbsoluteMetaBattleUrl(link.getAttribute("href")) ?? metaBattlePageUrl(pageTitle);

    rows.push({
      id: `${mode}:${pageTitle}`,
      title,
      pageTitle,
      url,
      mode,
      section: currentSection,
      profession: currentProfession,
      eliteSpec,
      quality,
      difficulty: difficulty || undefined,
      rating: Number.isFinite(ratingValue) ? ratingValue : undefined,
      icons: uniqueIcons.slice(0, 12),
    });
  }

  return rows;
}

function dedupeMetaBattleIcons(icons: MetaBattleIcon[]): MetaBattleIcon[] {
  const seen = new Set<string>();
  const result: MetaBattleIcon[] = [];

  for (const icon of icons) {
    const key = `${icon.label}:${icon.imageUrl ?? ""}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(icon);
  }

  return result;
}

export async function loadMetaBattleBuildLibrary(onProgress?: ProgressCallback): Promise<MetaBattleBuildSummary[]> {
  if (metaBattleBuildLibraryMemoryCache) {
    onProgress?.("MetaBattle builds loaded", 1, 1);
    return metaBattleBuildLibraryMemoryCache;
  }
  if (metaBattleBuildLibraryInflight) {
    return metaBattleBuildLibraryInflight;
  }

  metaBattleBuildLibraryInflight = loadMetaBattleBuildLibraryUncached(onProgress).finally(() => {
    metaBattleBuildLibraryInflight = null;
  });
  return metaBattleBuildLibraryInflight;
}

async function loadMetaBattleBuildLibraryUncached(onProgress?: ProgressCallback): Promise<MetaBattleBuildSummary[]> {
  const cached = await loadSqlCache(
    "metabattle:build-library",
    SQL_CACHE_TTL.metabattleBuilds,
    (value): value is MetaBattleBuildSummary[] => isArrayOf(value, isMetaBattleBuildSummary),
  );
  if (cached) {
    metaBattleBuildLibraryMemoryCache = cached;
    return cached;
  }

  const allBuilds: MetaBattleBuildSummary[] = [];
  for (const [index, source] of METABATTLE_BUILD_PAGES.entries()) {
    onProgress?.(`Loading MetaBattle ${source.mode} builds`, index, METABATTLE_BUILD_PAGES.length);
    const page = await loadMetaBattleHtml(source.page);
    if (!page) {
      continue;
    }
    allBuilds.push(...parseMetaBattleBuildRows(page, source.mode));
  }

  const deduped = dedupeMetaBattleBuilds(allBuilds).sort((left, right) =>
    `${left.mode}:${left.profession}:${left.title}`.localeCompare(`${right.mode}:${right.profession}:${right.title}`),
  );
  onProgress?.("MetaBattle builds loaded", METABATTLE_BUILD_PAGES.length, METABATTLE_BUILD_PAGES.length);
  void saveSqlCache("metabattle:build-library", deduped);
  metaBattleBuildLibraryMemoryCache = deduped;
  return deduped;
}

function dedupeMetaBattleBuilds(builds: MetaBattleBuildSummary[]): MetaBattleBuildSummary[] {
  const seen = new Set<string>();
  return builds.filter((build) => {
    const key = `${build.mode}:${build.pageTitle}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function loadMetaBattleBuildDetail(summary: MetaBattleBuildSummary): Promise<MetaBattleBuildDetail> {
  const memoryKey = normalizeWikiLookupName(summary.pageTitle);
  const memoryCached = metaBattleBuildDetailMemoryCache.get(memoryKey);
  if (memoryCached) {
    return { ...memoryCached, summary };
  }
  const inflight = metaBattleBuildDetailInflightCache.get(memoryKey);
  if (inflight) {
    return inflight.then((detail) => ({ ...detail, summary }));
  }

  const promise = loadMetaBattleBuildDetailUncached(summary)
    .then((detail) => {
      metaBattleBuildDetailMemoryCache.set(memoryKey, detail);
      return detail;
    })
    .finally(() => {
      metaBattleBuildDetailInflightCache.delete(memoryKey);
    });
  metaBattleBuildDetailInflightCache.set(memoryKey, promise);
  return promise;
}

async function loadMetaBattleBuildDetailUncached(summary: MetaBattleBuildSummary): Promise<MetaBattleBuildDetail> {
  const cacheKey = getNamedCacheKey("metabattle:build-detail:v4", summary.pageTitle);
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.metabattleBuilds, isMetaBattleBuildDetail);
  if (cached && cached.skillGroups.length > 0) {
    const wikiSkills = cached.wikiSkills?.length
      ? cached.wikiSkills
      : await loadMetaBattleWikiSkillsForBuild(summary).catch(() => []);
    const specializations = await enrichCachedMetaBattleSpecializations(cached.specializations).catch(
      () => cached.specializations,
    );
    const detail = {
      ...cached,
      summary,
      equipment: await hydrateMetaBattleEquipment(cached.equipment),
      specializations,
      wikiSkills,
    };
    if (
      !cached.wikiSkills?.length ||
      detail.specializations.some((specialization) => specialization.focus || specialization.wikiDescription)
    ) {
      void saveSqlCache(cacheKey, detail);
    }
    return detail;
  }

  const page = await loadMetaBattleHtml(summary.pageTitle);
  if (!page) {
    throw new Error(`MetaBattle build page could not be loaded: ${summary.title}`);
  }

  const detail = await parseMetaBattleBuildDetail(summary, page.html);
  void saveSqlCache(cacheKey, detail);
  return detail;
}

export function preloadMetaBattleBuildDetails(summaries: MetaBattleBuildSummary[], limit = 6): void {
  const uniqueSummaries = summaries
    .filter((summary, index, all) => all.findIndex((candidate) => candidate.pageTitle === summary.pageTitle) === index)
    .slice(0, limit);
  uniqueSummaries.forEach((summary) => {
    const memoryKey = normalizeWikiLookupName(summary.pageTitle);
    if (metaBattleBuildDetailMemoryCache.has(memoryKey) || metaBattleBuildDetailInflightCache.has(memoryKey)) {
      return;
    }
    void loadMetaBattleBuildDetail(summary).catch(() => undefined);
  });
}

async function parseMetaBattleBuildDetail(
  summary: MetaBattleBuildSummary,
  html: string,
): Promise<MetaBattleBuildDetail> {
  const document = new DOMParser().parseFromString(html, "text/html");
  const templateCode = normalizePlainText(document.querySelector(".build-template-code")?.textContent ?? "")
    .replace(/&amp;/g, "&") || undefined;
  const equipment = await hydrateMetaBattleEquipment(parseMetaBattleEquipment(document));
  const specializations = await hydrateMetaBattleSpecializations(parseMetaBattleSpecializations(document));
  const wikiSkills = await loadMetaBattleWikiSkillsForBuild(summary).catch(() => []);
  const skillGroups = await hydrateMetaBattleSkillGroups(parseMetaBattleSkillGroups(document), wikiSkills);

  return {
    summary,
    overview: getMetaBattleSectionText(document, "Overview", 900, 2),
    templateCode,
    skillGroups,
    specializations,
    equipment,
    wikiSkills,
    weaponVariants: getMetaBattleSectionText(document, "Weapon_Variants", 700, 3),
    skillVariants: getMetaBattleSectionText(document, "Skill_Variants", 1200, 2),
    usage: getMetaBattleSectionText(document, "Usage", 1600, 2),
    defense: getMetaBattleSectionText(document, "Defense", 900, 3),
    updatedNote: normalizePlainText(document.querySelector(".alert")?.textContent ?? "") || undefined,
  };
}

function getMetaBattleSectionText(
  document: Document,
  sectionId: string,
  maxLength: number,
  stopAtHeadingLevel: number,
): string {
  const headline = document.getElementById(sectionId);
  const heading = headline?.closest("h2,h3,h4");
  if (!heading) {
    return "";
  }

  const chunks: string[] = [];
  let sibling = heading.nextElementSibling;
  while (sibling) {
    const headingMatch = sibling.tagName.match(/^H([1-6])$/i);
    if (headingMatch && Number(headingMatch[1]) <= stopAtHeadingLevel) {
      break;
    }
    const clone = sibling.cloneNode(true) as Element;
    clone.querySelectorAll(".mw-editsection, style, script, table.metadata").forEach((node) => node.remove());
    const text = normalizePlainText(clone.textContent ?? "");
    if (text) {
      chunks.push(text);
    }
    sibling = sibling.nextElementSibling;
  }

  const text = chunks.join(" ");
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function getMetaBattleSectionElement(document: Document, sectionId: string, stopAtHeadingLevel: number): HTMLElement {
  const container = document.createElement("div");
  const headline = document.getElementById(sectionId);
  const heading = headline?.closest("h2,h3,h4");
  if (!heading) {
    return container;
  }

  let sibling = heading.nextElementSibling;
  while (sibling) {
    const headingMatch = sibling.tagName.match(/^H([1-6])$/i);
    if (headingMatch && Number(headingMatch[1]) <= stopAtHeadingLevel) {
      break;
    }
    container.appendChild(sibling.cloneNode(true));
    sibling = sibling.nextElementSibling;
  }

  return container;
}

interface ParsedMetaBattleSkillGroup {
  label: string;
  ids: number[];
  names: string[];
}

function parseMetaBattleSkillGroups(document: Document): ParsedMetaBattleSkillGroup[] {
  const groups: ParsedMetaBattleSkillGroup[] = [];
  const elements = getMetaBattleSkillEmbedElements(document);

  elements.forEach((element, index) => {
    const ids = parseMetaBattleSkillIds(element);
    const names = parseMetaBattleSkillNames(element);
    if (ids.length === 0 && names.length === 0) {
      return;
    }
    const label = getMetaBattleSkillGroupLabel(element, index);
    groups.push({ label, ids, names });
  });

  return groups;
}

function getMetaBattleSkillEmbedElements(document: Document): HTMLElement[] {
  const sectionIds = ["Skill_Bar", "Skillbar", "Skill_Bars", "Skills"];
  for (const sectionId of sectionIds) {
    const section = getMetaBattleLeadingSectionElement(document, sectionId, 3);
    const elements = Array.from(section.querySelectorAll<HTMLElement>('[data-armory-embed="skills"]'));
    if (elements.length > 0) {
      return elements;
    }
  }

  return Array.from(document.querySelectorAll<HTMLElement>('[data-armory-embed="skills"]'));
}

function parseMetaBattleSkillIds(element: HTMLElement): number[] {
  const direct = parseMetaBattleSkillIdsFromElement(element);
  const nested = Array.from(
    element.querySelectorAll<HTMLElement>("[data-armory-ids], [data-armory-id], [data-skill-id], [data-id]"),
  ).flatMap(parseMetaBattleSkillIdsFromElement);
  return [...new Set([...direct, ...nested])];
}

function parseMetaBattleSkillIdsFromElement(element: HTMLElement): number[] {
  return parseNumberList(
    [
      element.getAttribute("data-armory-ids"),
      element.getAttribute("data-armory-id"),
      element.getAttribute("data-skill-id"),
      element.getAttribute("data-id"),
    ]
      .filter(Boolean)
      .join(","),
  );
}

function parseMetaBattleSkillNames(element: HTMLElement): string[] {
  const names = Array.from(element.querySelectorAll<HTMLAnchorElement | HTMLImageElement>("a[title], img[alt], img[title]"))
    .map((node) =>
      normalizeMetaBattleSkillName(
        node instanceof HTMLImageElement
          ? node.getAttribute("alt") || node.getAttribute("title") || ""
          : node.getAttribute("title") || node.textContent || "",
      ),
    )
    .filter(Boolean);
  return [...new Set(names)];
}

function normalizeMetaBattleSkillName(name: string): string {
  return normalizePlainText(name)
    .replace(/^Skill:/i, "")
    .replace(/\s+\((?:skill|effect|trait)\)$/i, "")
    .trim();
}

function getMetaBattleLeadingSectionElement(
  document: Document,
  sectionId: string,
  stopAtHeadingLevel: number,
): HTMLElement {
  const section = getMetaBattleSectionElement(document, sectionId, 2);
  const container = document.createElement("div");
  for (const child of Array.from(section.children)) {
    const headingMatch = child.tagName.match(/^H([1-6])$/i);
    if (headingMatch && Number(headingMatch[1]) <= stopAtHeadingLevel) {
      break;
    }
    container.appendChild(child.cloneNode(true));
  }
  return container;
}

function getMetaBattleSkillGroupLabel(element: HTMLElement, index: number): string {
  const previousLabel = findPreviousMetaBattleSkillLabel(element);
  if (previousLabel) {
    return previousLabel;
  }
  return index === 0 ? "Profession mechanic" : `Skill bar ${index}`;
}

function findPreviousMetaBattleSkillLabel(element: HTMLElement): string {
  let current: HTMLElement | null = element;
  for (let depth = 0; current && depth < 7; depth += 1) {
    const label = getMetaBattleShortSkillLabel(current.previousElementSibling);
    if (label) {
      return label;
    }
    current = current.parentElement;
  }
  return "";
}

function getMetaBattleShortSkillLabel(element: Element | null): string {
  if (!element || element.querySelector("[data-armory-embed]")) {
    return "";
  }
  const text = normalizePlainText(element.textContent ?? "");
  if (!text || text.length > 48 || /^optional$/i.test(text)) {
    return "";
  }
  return text;
}

async function hydrateMetaBattleSkillGroups(
  groups: ParsedMetaBattleSkillGroup[],
  wikiSkills: MetaBattleWikiSkill[] = [],
): Promise<Array<{ label: string; skills: MetaBattleBuildSkill[] }>> {
  const ids = [...new Set(groups.flatMap((group) => group.ids))];
  const skills = await loadMetaBattleSkills(ids).catch(() => []);
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const wikiSkillMap = new Map(wikiSkills.map((skill) => [normalizeWikiLookupName(skill.name), skill]));

  return groups.map((group) => ({
    label: group.label,
    skills: group.ids.length
      ? group.ids.map((id) => skillMap.get(id) ?? { id, name: `Skill ${id}` })
      : group.names.map((name, index) => {
          const wikiSkill = wikiSkillMap.get(normalizeWikiLookupName(name));
          if (!wikiSkill) {
            return { id: -index - 1, name };
          }

          const facts: MetaBattleFactLine[] = [];
          if (wikiSkill.activation) {
            facts.push({ label: "Activation", value: wikiSkill.activation });
          }
          if (wikiSkill.recharge) {
            facts.push({ label: "Recharge", value: wikiSkill.recharge });
          }
          return {
            id: -index - 1,
            name: wikiSkill.name,
            icon: wikiSkill.icon,
            description: wikiSkill.description,
            facts,
            type: wikiSkill.group || wikiSkill.section,
            slot: wikiSkill.slot,
          };
        }),
  }));
}

async function loadMetaBattleSkills(ids: number[]): Promise<MetaBattleBuildSkill[]> {
  const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) {
    return [];
  }

  const cacheKey = `gw2:skills:${uniqueIds.sort((left, right) => left - right).join(",")}`;
  const memoryCached = metaBattleSkillBundleMemoryCache.get(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.staticCatalog,
    (value): value is MetaBattleBuildSkill[] => isArrayOf(value, isMetaBattleBuildSkill),
  );
  if (cached) {
    metaBattleSkillBundleMemoryCache.set(cacheKey, cached);
    return cached;
  }

  const loaded: MetaBattleBuildSkill[] = [];
  for (const idChunk of chunk(uniqueIds, CHUNK_SIZE)) {
    const response = await fetchJson<Gw2SkillApiEntry[]>(`${GW2_API}/skills?ids=${idChunk.join(",")}`);
    loaded.push(
      ...response.map((skill) => ({
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        description: cleanGw2Description(skill.description),
        facts: parseGw2FactLines(skill.facts),
        type: skill.type,
        slot: skill.slot,
      })),
    );
  }

  void saveSqlCache(cacheKey, loaded);
  metaBattleSkillBundleMemoryCache.set(cacheKey, loaded);
  return loaded;
}

async function loadMetaBattleWikiSkillsForBuild(summary: MetaBattleBuildSummary): Promise<MetaBattleWikiSkill[]> {
  const profession = getMetaBattlePrimaryProfession(summary);
  return profession ? loadMetaBattleWikiSkillsForProfession(profession) : [];
}

function getMetaBattlePrimaryProfession(summary: MetaBattleBuildSummary): string | undefined {
  const candidates = [
    summary.profession,
    summary.eliteSpec,
    summary.title.split(/\s+/).slice(-1)[0],
    ...summary.icons.map((icon) => icon.label),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = normalizePlainText(candidate);
    if (METABATTLE_PROFESSION_SKILL_PAGES[normalized]) {
      return normalized;
    }
    if (METABATTLE_ELITE_SPEC_PROFESSIONS[normalized]) {
      return METABATTLE_ELITE_SPEC_PROFESSIONS[normalized];
    }
  }
  return undefined;
}

async function loadMetaBattleWikiSkillsForProfession(profession: string): Promise<MetaBattleWikiSkill[]> {
  const page = METABATTLE_PROFESSION_SKILL_PAGES[profession];
  if (!page) {
    return [];
  }
  const memoryKey = profession.toLowerCase();
  const memoryCached = metaBattleWikiSkillMemoryCache.get(memoryKey);
  if (memoryCached) {
    return memoryCached;
  }

  const cacheKey = getNamedCacheKey("wiki:profession-skills", profession);
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is MetaBattleWikiSkill[] => isArrayOf(value, isMetaBattleWikiSkill),
  );
  if (cached) {
    metaBattleWikiSkillMemoryCache.set(memoryKey, cached);
    return cached;
  }

  const wikiPage = await loadWikiHtml(page);
  if (!wikiPage) {
    return [];
  }

  const parsed = parseMetaBattleWikiSkillPage(wikiPage.html, profession, wikiPage.url);
  metaBattleWikiSkillMemoryCache.set(memoryKey, parsed);
  void saveSqlCache(cacheKey, parsed);
  return parsed;
}

function parseMetaBattleWikiSkillPage(html: string, profession: string, sourceUrl: string): MetaBattleWikiSkill[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const output = document.querySelector(".mw-parser-output") ?? document.body;
  const skills: MetaBattleWikiSkill[] = [];
  let section = "Skills";
  let group = "";

  Array.from(output.children).forEach((child) => {
    const tag = child.tagName.toUpperCase();
    if (/^H[2-4]$/.test(tag)) {
      const heading = cleanWikiSkillText(child).replace(/\s*\[edit\]\s*$/i, "");
      if (!heading) {
        return;
      }
      if (tag === "H2") {
        section = heading;
        group = "";
        return;
      }
      group = heading;
      return;
    }
    if (tag !== "TABLE" || !child.classList.contains("wikitable")) {
      return;
    }
    skills.push(...parseMetaBattleWikiSkillTable(child, profession, section, group, sourceUrl));
  });

  const seen = new Set<string>();
  return skills.filter((skill) => {
    const key = `${skill.name.toLowerCase()}:${skill.section.toLowerCase()}:${(skill.group ?? "").toLowerCase()}:${skill.slot ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function parseMetaBattleWikiSkillTable(
  table: Element,
  profession: string,
  section: string,
  initialGroup: string,
  sourceUrl: string,
): MetaBattleWikiSkill[] {
  const skills: MetaBattleWikiSkill[] = [];
  let group = initialGroup;

  Array.from(table.querySelectorAll("tr")).forEach((row) => {
    const cells = Array.from(row.children).filter((cell) => ["TD", "TH"].includes(cell.tagName.toUpperCase()));
    if (cells.length < 2) {
      return;
    }

    const headerText = cleanWikiSkillText(cells[0]).replace(/\s*\[edit\]\s*$/i, "");
    const hasSkillIcon = Boolean(row.querySelector("img"));
    const skillCellIndex = cells.findIndex((cell, index) => {
      if (index === 0) {
        return false;
      }
      return Boolean(getWikiSkillCellLink(cell));
    });

    if (skillCellIndex < 0) {
      if (headerText && cells[0].tagName.toUpperCase() === "TH" && !/^#|skill|description$/i.test(headerText)) {
        group = headerText;
      }
      return;
    }

    const skillCell = cells[skillCellIndex];
    const link = getWikiSkillCellLink(skillCell);
    const name = normalizePlainText(link?.textContent ?? link?.getAttribute("title") ?? "");
    if (!name || name.toLowerCase() === "edit" || !hasSkillIcon) {
      return;
    }

    const descriptionCell = cells[cells.length - 1];
    const middleCells = cells.slice(skillCellIndex + 1, -1).map(cleanWikiSkillText).filter(Boolean);
    const slot = cleanWikiSkillText(cells[0]);
    const iconSrc = skillCell.querySelector<HTMLImageElement>("img")?.getAttribute("src") ?? undefined;
    const description = cleanWikiSkillDescription(descriptionCell);

    skills.push({
      name,
      profession,
      section,
      group: group || undefined,
      slot: slot || undefined,
      activation: middleCells[0],
      recharge: middleCells[1],
      description,
      icon: iconSrc ? toAbsoluteWikiAssetUrl(iconSrc) : undefined,
      url: link?.href ? new URL(link.getAttribute("href") ?? wikiPageUrl(name), sourceUrl).toString() : wikiPageUrl(name),
    });
  });

  return skills;
}

function getWikiSkillCellLink(cell: Element): HTMLAnchorElement | undefined {
  return Array.from(cell.querySelectorAll<HTMLAnchorElement>("a[title]")).find((link) => {
    const title = link.getAttribute("title") ?? "";
    const text = normalizePlainText(link.textContent ?? "");
    return Boolean(title && !title.startsWith("File:") && text && text.toLowerCase() !== "edit");
  });
}

function cleanWikiSkillText(element: Element | undefined): string {
  if (!element) {
    return "";
  }
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll(".mw-editsection, style, script").forEach((node) => node.remove());
  return normalizePlainText(clone.textContent ?? "");
}

function cleanWikiSkillDescription(element: Element | undefined): string {
  const text = cleanWikiSkillText(element)
    .replace(/\s*\[edit\]\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 480 ? `${text.slice(0, 480).trim()}...` : text;
}

function parseMetaBattleSpecializations(document: Document): Array<{ id: number; traits: number[] }> {
  const section = getMetaBattleSectionElement(document, "Specializations", 2);
  return Array.from(section.querySelectorAll<HTMLElement>('[data-armory-embed="specializations"][data-armory-ids]'))
    .map((element) => {
      const id = parseNumberList(element.getAttribute("data-armory-ids") ?? "")[0];
      const traits = id ? parseNumberList(element.getAttribute(`data-armory-${id}-traits`) ?? "") : [];
      return id ? { id, traits } : null;
    })
    .filter((entry): entry is { id: number; traits: number[] } => Boolean(entry));
}

async function hydrateMetaBattleSpecializations(
  entries: Array<{ id: number; traits: number[] }>,
): Promise<MetaBattleBuildSpecialization[]> {
  const specializationIds = [...new Set(entries.map((entry) => entry.id))];
  if (specializationIds.length === 0) {
    return [];
  }

  const specializations = await loadMetaBattleSpecializationEntries(specializationIds).catch(() => []);
  const specMap = new Map(specializations.map((specialization) => [specialization.id, specialization]));
  const traitIds = [
    ...new Set(
      specializations.flatMap((specialization) => [
        ...(specialization.minor_traits ?? []),
        ...(specialization.major_traits ?? []),
      ]),
    ),
  ];
  const traits = await loadMetaBattleTraitEntries(traitIds).catch(() => []);
  const traitMap = new Map(traits.map((trait) => [trait.id, trait]));
  const wikiSpecializations = await loadMetaBattleWikiSpecializationsForNames(
    specializations.map((specialization) => specialization.name),
  ).catch(() => new Map<string, MetaBattleWikiSpecializationInfo>());

  return entries.map((entry) => {
    const specialization = specMap.get(entry.id);
    const wikiInfo = specialization ? wikiSpecializations.get(specialization.name.toLowerCase()) : undefined;
    const selectedTraitIds = new Set(entry.traits);
    const minorTraits = (specialization?.minor_traits ?? []).map((traitId) =>
      mapMetaBattleTrait(traitMap.get(traitId), traitId, { minor: true, selected: true }),
    );
    const majorTraits = (specialization?.major_traits ?? []).map((traitId) =>
      mapMetaBattleTrait(traitMap.get(traitId), traitId, { selected: selectedTraitIds.has(traitId) }),
    );

    return {
      id: entry.id,
      name: specialization?.name ?? `Specialization ${entry.id}`,
      profession: specialization?.profession,
      elite: specialization?.elite,
      icon: wikiInfo?.icon ?? specialization?.icon,
      background: wikiInfo?.background ?? specialization?.background,
      focus: wikiInfo?.focus,
      wikiDescription: wikiInfo?.description,
      wikiUrl: wikiInfo?.url,
      traits: [...minorTraits, ...majorTraits],
    };
  });
}

async function enrichCachedMetaBattleSpecializations(
  specializations: MetaBattleBuildSpecialization[],
): Promise<MetaBattleBuildSpecialization[]> {
  if (
    specializations.length === 0 ||
    specializations.every((specialization) => specialization.focus || specialization.wikiDescription || specialization.wikiUrl)
  ) {
    return specializations;
  }

  const wikiSpecializations = await loadMetaBattleWikiSpecializationsForNames(
    specializations.map((specialization) => specialization.name),
  );
  return specializations.map((specialization) => {
    const wikiInfo = wikiSpecializations.get(specialization.name.toLowerCase());
    if (!wikiInfo) {
      return specialization;
    }
    return {
      ...specialization,
      profession: specialization.profession ?? wikiInfo.profession,
      icon: wikiInfo.icon ?? specialization.icon,
      background: wikiInfo.background ?? specialization.background,
      focus: specialization.focus ?? wikiInfo.focus,
      wikiDescription: specialization.wikiDescription ?? wikiInfo.description,
      wikiUrl: specialization.wikiUrl ?? wikiInfo.url,
    };
  });
}

async function loadMetaBattleWikiSpecializationsForNames(
  names: string[],
): Promise<Map<string, MetaBattleWikiSpecializationInfo>> {
  const uniqueNames = [...new Set(names.map((name) => normalizePlainText(name)).filter(Boolean))];
  if (uniqueNames.length === 0) {
    return new Map();
  }
  const index = await loadMetaBattleWikiSpecializationIndex();
  const entries = await Promise.all(
    uniqueNames.map(async (name) => {
      const indexed = index.get(name.toLowerCase());
      const detail = await loadMetaBattleWikiSpecializationDetail(name).catch(() => undefined);
      const merged: MetaBattleWikiSpecializationInfo = {
        name,
        url: indexed?.url ?? detail?.url ?? wikiPageUrl(name),
        profession: indexed?.profession ?? detail?.profession,
        focus: indexed?.focus ?? detail?.focus,
        icon: detail?.icon ?? indexed?.icon,
        background: detail?.background ?? indexed?.background,
        description: detail?.description ?? indexed?.description,
      };
      return [name.toLowerCase(), merged] as const;
    }),
  );
  return new Map(entries);
}

async function loadMetaBattleWikiSpecializationIndex(): Promise<Map<string, MetaBattleWikiSpecializationInfo>> {
  if (metaBattleWikiSpecializationIndexMemoryCache) {
    return metaBattleWikiSpecializationIndexMemoryCache;
  }
  const cacheKey = getNamedCacheKey("wiki:specialization-index", "all");
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is MetaBattleWikiSpecializationInfo[] => isArrayOf(value, isMetaBattleWikiSpecializationInfo),
  );
  if (cached) {
    metaBattleWikiSpecializationIndexMemoryCache = new Map(cached.map((entry) => [entry.name.toLowerCase(), entry]));
    return metaBattleWikiSpecializationIndexMemoryCache;
  }

  const page = await loadWikiHtml("Specialization");
  const parsed = page ? parseMetaBattleWikiSpecializationIndex(page.html, page.url) : [];
  void saveSqlCache(cacheKey, parsed);
  metaBattleWikiSpecializationIndexMemoryCache = new Map(parsed.map((entry) => [entry.name.toLowerCase(), entry]));
  return metaBattleWikiSpecializationIndexMemoryCache;
}

function parseMetaBattleWikiSpecializationIndex(html: string, sourceUrl: string): MetaBattleWikiSpecializationInfo[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const output = document.querySelector(".mw-parser-output") ?? document.body;
  const entries: MetaBattleWikiSpecializationInfo[] = [];
  let profession = "";
  let tier = "";

  output.querySelectorAll("table.wikitable tr").forEach((row) => {
    const cells = Array.from(row.children).filter((cell) => ["TD", "TH"].includes(cell.tagName.toUpperCase()));
    if (cells.length === 0) {
      return;
    }
    if (cells.length === 1 && cells[0].tagName.toUpperCase() === "TH") {
      const text = cleanWikiSkillText(cells[0]).replace(/\s*\[edit\]\s*$/i, "");
      if (METABATTLE_PROFESSION_SKILL_PAGES[text]) {
        profession = text;
        tier = "";
      } else if (/core|elite/i.test(text)) {
        tier = text;
      }
      return;
    }

    const firstCell = cells[0];
    const link = getFirstUsefulWikiLink(firstCell);
    if (!link || !profession || /^specialization$/i.test(link.title)) {
      return;
    }
    const focus = cells[1] ? cleanWikiSkillText(cells[1]) : undefined;
    const iconSrc = firstCell.querySelector<HTMLImageElement>("img")?.getAttribute("src") ?? undefined;
    entries.push({
      name: link.title,
      profession,
      focus: [tier, focus].filter(Boolean).join(" · ") || undefined,
      icon: iconSrc ? toAbsoluteWikiAssetUrl(iconSrc) : undefined,
      url: link.url || new URL(firstCell.querySelector<HTMLAnchorElement>("a[title]")?.getAttribute("href") ?? wikiPageUrl(link.title), sourceUrl).toString(),
    });
  });

  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = entry.name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function loadMetaBattleWikiSpecializationDetail(
  name: string,
): Promise<MetaBattleWikiSpecializationInfo | undefined> {
  const memoryKey = normalizeWikiLookupName(name);
  if (metaBattleWikiSpecializationDetailMemoryCache.has(memoryKey)) {
    return metaBattleWikiSpecializationDetailMemoryCache.get(memoryKey);
  }
  const cacheKey = getNamedCacheKey("wiki:specialization-detail", name);
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiDerived, isMetaBattleWikiSpecializationInfo);
  if (cached) {
    metaBattleWikiSpecializationDetailMemoryCache.set(memoryKey, cached);
    return cached;
  }

  const page = await loadWikiHtml(name);
  if (!page) {
    metaBattleWikiSpecializationDetailMemoryCache.set(memoryKey, undefined);
    return undefined;
  }
  const parsed = parseMetaBattleWikiSpecializationDetail(page.html, page.title, page.url);
  metaBattleWikiSpecializationDetailMemoryCache.set(memoryKey, parsed);
  void saveSqlCache(cacheKey, parsed);
  return parsed;
}

function parseMetaBattleWikiSpecializationDetail(
  html: string,
  name: string,
  sourceUrl: string,
): MetaBattleWikiSpecializationInfo {
  const document = new DOMParser().parseFromString(html, "text/html");
  const output = document.querySelector(".mw-parser-output") ?? document.body;
  const icon = getWikiSpecializationIcon(output);
  const background = getWikiSpecializationBackground(output);
  const description = getWikiSpecializationDescription(output);

  return {
    name,
    icon,
    background,
    description,
    url: sourceUrl,
  };
}

function getWikiSpecializationIcon(output: Element): string | undefined {
  const images = Array.from(output.querySelectorAll<HTMLImageElement>("img"));
  const icon = images.find((image) => {
    const alt = image.getAttribute("alt") ?? "";
    const src = image.getAttribute("src") ?? "";
    return /specialization/i.test(alt) || /specialization/i.test(src);
  }) ?? images.find((image) => {
    const width = Number(image.getAttribute("width") ?? image.naturalWidth);
    const height = Number(image.getAttribute("height") ?? image.naturalHeight);
    return width > 24 && height > 24 && Math.abs(width - height) <= 20;
  });
  return icon ? getBestWikiImageUrl(icon) : undefined;
}

function getWikiSpecializationBackground(output: Element): string | undefined {
  const figures = Array.from(output.querySelectorAll<HTMLElement>(".thumb, figure, .gallerybox"));
  const figure = figures.find((item) => /specialization background/i.test(item.textContent ?? ""));
  const backgroundImage = figure?.querySelector<HTMLImageElement>("img");
  if (backgroundImage) {
    return getBestWikiImageUrl(backgroundImage);
  }

  const image = Array.from(output.querySelectorAll<HTMLImageElement>("img")).find((item) => {
    const text = `${item.getAttribute("alt") ?? ""} ${item.getAttribute("src") ?? ""}`;
    return /background/i.test(text) || /specialization.*bg/i.test(text);
  });
  return image ? getBestWikiImageUrl(image) : undefined;
}

function getBestWikiImageUrl(image: HTMLImageElement): string | undefined {
  const srcset = image.getAttribute("srcset");
  const bestSrcsetUrl = srcset
    ?.split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean)
    .pop();
  const src = bestSrcsetUrl || image.getAttribute("src");
  return src ? toAbsoluteWikiAssetUrl(src) : undefined;
}

function getWikiSpecializationDescription(output: Element): string | undefined {
  const clone = output.cloneNode(true) as Element;
  clone.querySelectorAll("table, .thumb, figure, .gallery, .mw-editsection, style, script, .toc, .navbox").forEach((node) => node.remove());
  const paragraphs = Array.from(clone.querySelectorAll("p"))
    .map((paragraph) => cleanWikiSkillText(paragraph))
    .filter((text) => text.length > 40 && !/^This article/i.test(text))
    .slice(0, 3);
  const text = paragraphs.join(" ");
  return text ? (text.length > 560 ? `${text.slice(0, 560).trim()}...` : text) : undefined;
}

function mapMetaBattleTrait(
  trait: Gw2TraitApiEntry | undefined,
  id: number,
  options: { selected?: boolean; minor?: boolean } = {},
): MetaBattleBuildTrait {
  return {
    id,
    name: trait?.name ?? `Trait ${id}`,
    icon: trait?.icon,
    description: cleanGw2Description(trait?.description),
    facts: parseGw2FactLines(trait?.facts),
    selected: options.selected,
    minor: options.minor,
  };
}

async function loadMetaBattleSpecializationEntries(ids: number[]): Promise<Gw2SpecializationApiEntry[]> {
  const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) {
    return [];
  }

  const cacheKey = `gw2:specializations:${uniqueIds.sort((left, right) => left - right).join(",")}`;
  const memoryCached = metaBattleSpecializationBundleMemoryCache.get(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.staticCatalog,
    (value): value is Gw2SpecializationApiEntry[] => isArrayOf(value, isGw2SpecializationApiEntry),
  );
  if (cached) {
    metaBattleSpecializationBundleMemoryCache.set(cacheKey, cached);
    return cached;
  }

  const loaded: Gw2SpecializationApiEntry[] = [];
  for (const idChunk of chunk(uniqueIds, CHUNK_SIZE)) {
    loaded.push(
      ...(await fetchJson<Gw2SpecializationApiEntry[]>(
        `${GW2_API}/specializations?ids=${idChunk.join(",")}`,
      )),
    );
  }

  void saveSqlCache(cacheKey, loaded);
  metaBattleSpecializationBundleMemoryCache.set(cacheKey, loaded);
  return loaded;
}

async function loadMetaBattleTraitEntries(ids: number[]): Promise<Gw2TraitApiEntry[]> {
  const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) {
    return [];
  }

  const cacheKey = `gw2:traits:${uniqueIds.sort((left, right) => left - right).join(",")}`;
  const memoryCached = metaBattleTraitBundleMemoryCache.get(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.staticCatalog,
    (value): value is Gw2TraitApiEntry[] => isArrayOf(value, isGw2TraitApiEntry),
  );
  if (cached) {
    metaBattleTraitBundleMemoryCache.set(cacheKey, cached);
    return cached;
  }

  const loaded: Gw2TraitApiEntry[] = [];
  for (const idChunk of chunk(uniqueIds, CHUNK_SIZE)) {
    loaded.push(...(await fetchJson<Gw2TraitApiEntry[]>(`${GW2_API}/traits?ids=${idChunk.join(",")}`)));
  }

  void saveSqlCache(cacheKey, loaded);
  metaBattleTraitBundleMemoryCache.set(cacheKey, loaded);
  return loaded;
}

function cleanGw2Description(description?: string): string | undefined {
  const text = normalizePlainText(
    (description ?? "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">"),
  );
  return text || undefined;
}

function parseGw2FactLines(facts?: Gw2FactApiEntry[]): MetaBattleFactLine[] {
  return (facts ?? [])
    .map((fact): MetaBattleFactLine | null => {
      const label =
        fact.text ??
        fact.status ??
        fact.field_type ??
        fact.finisher_type ??
        fact.type ??
        fact.prefix?.text ??
        "";
      const value = getGw2FactValue(fact);
      if (!label && !value) {
        return null;
      }

      return {
        label: normalizePlainText(label),
        value,
        icon: fact.icon ?? fact.prefix?.icon,
      };
    })
    .filter((fact): fact is MetaBattleFactLine => Boolean(fact));
}

function getGw2FactValue(fact: Gw2FactApiEntry): string | undefined {
  if (typeof fact.value === "number") {
    return fact.type === "Percent" || fact.percent ? `${fact.value}%` : fact.value.toLocaleString();
  }
  if (typeof fact.value === "string") {
    return fact.value;
  }
  if (typeof fact.percent === "number") {
    return `${fact.percent}%`;
  }
  if (typeof fact.duration === "number") {
    return `${fact.duration}s`;
  }
  if (typeof fact.hit_count === "number") {
    return fact.hit_count.toLocaleString();
  }
  if (typeof fact.distance === "number") {
    return fact.distance.toLocaleString();
  }
  if (fact.description) {
    return cleanGw2Description(fact.description);
  }
  if (fact.prefix?.description) {
    return cleanGw2Description(fact.prefix.description);
  }
  return undefined;
}

function parseMetaBattleEquipment(document: Document): MetaBattleBuildEquipmentSlot[] {
  const section = getMetaBattleSectionElement(document, "Equipment", 2);
  return Array.from(section.querySelectorAll<HTMLElement>(".equipment-slot"))
    .map((slot) => {
      const embed = slot.querySelector<HTMLElement>("[data-armory-ids]");
      const itemId = parseNumberList(embed?.getAttribute("data-armory-ids") ?? "")[0];
      const text = getMetaBattleEquipmentLabelText(slot, embed);
      const { slotName, stat } = parseMetaBattleEquipmentLabel(text);
      return {
        slot: slotName || "Equipment",
        stat,
        itemId,
      };
    })
    .filter((slot) => slot.slot || slot.itemId);
}

function getMetaBattleEquipmentLabelText(slot: HTMLElement, embed?: HTMLElement | null): string {
  const candidates = [
    slot.querySelector("small")?.textContent,
    slot.getAttribute("aria-label"),
    slot.getAttribute("title"),
    embed?.getAttribute("aria-label"),
    embed?.getAttribute("title"),
    slot.querySelector("img")?.getAttribute("alt"),
    slot.querySelector("img")?.getAttribute("title"),
    slot.textContent,
  ];

  return candidates.map((candidate) => normalizePlainText(candidate ?? "")).find(Boolean) ?? "";
}

const METABATTLE_EQUIPMENT_SLOT_LABELS = [
  "Backpiece",
  "Accessory",
  "Shoulders",
  "Shoulder",
  "Amulet",
  "Hammer",
  "Longbow",
  "Shortbow",
  "Greatsword",
  "Warhorn",
  "Scepter",
  "Sceptre",
  "Trident",
  "Harpoon",
  "Pistol",
  "Dagger",
  "Shield",
  "Focus",
  "Torch",
  "Sword",
  "Staff",
  "Rifle",
  "Mace",
  "Spear",
  "Chest",
  "Hands",
  "Gloves",
  "Legs",
  "Feet",
  "Boots",
  "Head",
  "Ring",
  "Rune",
  "Relic",
  "Sigil",
  "Infusion",
].sort((a, b) => b.length - a.length);

function parseMetaBattleEquipmentLabel(text: string): { slotName: string; stat?: string } {
  const compact = text.trim();
  if (!compact) {
    return { slotName: "Equipment" };
  }

  const lower = compact.toLowerCase();
  const embeddedUpgrade = ["Infusion", "Rune", "Relic", "Sigil"].find((label) =>
    new RegExp(`\\b${label}\\b`, "i").test(compact),
  );
  if (embeddedUpgrade) {
    const count = compact.match(/\bx\d+\b/i)?.[0];
    return {
      slotName: embeddedUpgrade,
      stat: count,
    };
  }

  const spacedMatch = compact.match(/^(.+?)\s+([A-Z][A-Za-z' -]+|x\d+)$/);
  if (spacedMatch) {
    return {
      slotName: spacedMatch[1].trim(),
      stat: spacedMatch[2].trim() || undefined,
    };
  }

  const slotName = METABATTLE_EQUIPMENT_SLOT_LABELS.find((label) => lower.startsWith(label.toLowerCase()));
  if (!slotName) {
    return { slotName: compact };
  }

  const stat = compact.slice(slotName.length).trim();
  return {
    slotName,
    stat: stat || undefined,
  };
}

async function hydrateMetaBattleEquipment(slots: MetaBattleBuildEquipmentSlot[]): Promise<MetaBattleBuildEquipmentSlot[]> {
  const itemIds = [...new Set(slots.map((slot) => slot.itemId).filter((id): id is number => Boolean(id)))];
  const items = itemIds.length ? await loadItems(itemIds).catch(() => []) : [];
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const attributeReference = await loadMetaBattleAttributeReference().catch(() => null);
  return slots.map((slot) => {
    const parsedSlot = slot.stat ? null : parseMetaBattleEquipmentLabel(slot.slot);
    const normalizedSlot = parsedSlot
      ? {
          ...slot,
          slot: parsedSlot.slotName,
          stat: parsedSlot.stat,
        }
      : slot;
    const item = slot.itemId ? itemMap.get(slot.itemId) ?? slot.item : slot.item;
    return enrichMetaBattleEquipmentSlot(
      {
        ...normalizedSlot,
        item,
      },
      attributeReference,
    );
  });
}

interface MetaBattleAttributeReference {
  combinations: MetaBattleAttributeCombination[];
  bonuses: Record<string, MetaBattleLevel80Bonus>;
}

interface MetaBattleLevel80Bonus {
  major1?: number;
  minor1?: number;
  major2?: number;
  minor2?: number;
  celestial?: number;
}

let metaBattleAttributeReferenceCache: MetaBattleAttributeReference | null = null;

async function loadMetaBattleAttributeReference(): Promise<MetaBattleAttributeReference | null> {
  if (metaBattleAttributeReferenceCache) {
    return metaBattleAttributeReferenceCache;
  }

  const cacheKey = "wiki:attribute-combinations-reference:v1";
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiDerived, isMetaBattleAttributeReference);
  if (cached) {
    metaBattleAttributeReferenceCache = cached;
    return cached;
  }

  const page = await loadWikiHtml("Attribute combinations");
  if (!page?.html) {
    return null;
  }

  const reference = parseMetaBattleAttributeReference(page.html);
  metaBattleAttributeReferenceCache = reference;
  void saveSqlCache(cacheKey, reference);
  return reference;
}

function parseMetaBattleAttributeReference(html: string): MetaBattleAttributeReference {
  const document = new DOMParser().parseFromString(html, "text/html");
  const tables = Array.from(document.querySelectorAll<HTMLTableElement>("table"));
  const combinations = [
    ...parseThreeOrFourAttributeCombinations(tables[0]),
    ...parseOneOrTwoAttributeCombinations(tables[1]),
  ];
  const distributions = parseAttributeDistributions(tables[3]);
  const bonuses = parseLevel80AttributeBonuses(tables[2]);

  return {
    combinations: combinations.map((combination) => {
      const distribution = findAttributeRecord(distributions, combination.prefix);
      return distribution ? { ...combination, distribution } : combination;
    }),
    bonuses,
  };
}

function parseThreeOrFourAttributeCombinations(table?: HTMLTableElement): MetaBattleAttributeCombination[] {
  if (!table) {
    return [];
  }

  const availabilityLabels = ["Armor", "Weapon", "Trinket", "Back", "Upgrade", "PvP"];
  return Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr"))
    .map((row): MetaBattleAttributeCombination | null => {
      const cells = Array.from(row.children);
      const prefix = cleanAttributeCellText(cells[0]);
      if (!prefix || prefix.toLowerCase() === "prefix") {
        return null;
      }

      const attributes = [
        parseAttributeComponent(cells[1], "major"),
        parseAttributeComponent(cells[2], "major"),
        parseAttributeComponent(cells[3], "minor"),
        parseAttributeComponent(cells[4], "minor"),
      ].filter((attribute): attribute is MetaBattleAttributeComponent => Boolean(attribute));

      return {
        prefix,
        attributes,
        availability: parseAvailabilityCells(cells.slice(5, 11), availabilityLabels),
      };
    })
    .filter((combination): combination is MetaBattleAttributeCombination => Boolean(combination));
}

function parseOneOrTwoAttributeCombinations(table?: HTMLTableElement): MetaBattleAttributeCombination[] {
  if (!table) {
    return [];
  }

  const availabilityLabels = ["Armor", "Weapon", "Trinket", "Back", "Upgrade"];
  return Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr"))
    .map((row): MetaBattleAttributeCombination | null => {
      const cells = Array.from(row.children);
      const prefix = cleanAttributeCellText(cells[0]);
      if (!prefix || prefix.toLowerCase() === "prefix") {
        return null;
      }

      const suffix = cleanAttributeCellText(cells[1]) || undefined;
      const attributes = [
        parseAttributeComponent(cells[2], "major"),
        parseAttributeComponent(cells[3], "minor"),
      ].filter((attribute): attribute is MetaBattleAttributeComponent => Boolean(attribute));

      return {
        prefix,
        suffix,
        attributes,
        availability: parseAvailabilityCells(cells.slice(4, 9), availabilityLabels),
      };
    })
    .filter((combination): combination is MetaBattleAttributeCombination => Boolean(combination));
}

function parseAttributeComponent(cell: Element | undefined, tier: "major" | "minor"): MetaBattleAttributeComponent | null {
  const name = cleanAttributeCellText(cell);
  if (!name || name === "-") {
    return null;
  }

  const icon = cell?.querySelector<HTMLImageElement>("img")?.getAttribute("src");
  return {
    name,
    tier,
    icon: icon ? toAbsoluteWikiAssetUrl(icon) : undefined,
  };
}

function parseAvailabilityCells(cells: Element[], labels: string[]): string[] {
  return cells
    .map((cell, index) => {
      const text = normalizePlainText(cell.textContent ?? "").toLowerCase();
      const imageAlt = cell.querySelector<HTMLImageElement>("img")?.getAttribute("alt")?.toLowerCase() ?? "";
      const isAvailable = imageAlt.includes("yes") || text === "1" || text.includes("yes");
      return isAvailable ? labels[index] : null;
    })
    .filter((label): label is string => Boolean(label));
}

function parseAttributeDistributions(table?: HTMLTableElement): Record<string, MetaBattleAttributeDistribution> {
  if (!table) {
    return {};
  }

  const result: Record<string, MetaBattleAttributeDistribution> = {};
  Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr")).forEach((row) => {
    const cells = Array.from(row.children);
    const prefix = cleanAttributeCellText(cells[0]);
    if (!prefix || prefix.toLowerCase() === "prefix") {
      return;
    }

    result[prefix] = {
      strikeDamage: parseAttributePercent(cells[1]),
      conditionDamage: parseAttributePercent(cells[2]),
      defense: parseAttributePercent(cells[3]),
      support: parseAttributePercent(cells[4]),
    };
  });
  return result;
}

function parseLevel80AttributeBonuses(table?: HTMLTableElement): Record<string, MetaBattleLevel80Bonus> {
  if (!table) {
    return {};
  }

  const result: Record<string, MetaBattleLevel80Bonus> = {};
  let currentCategory = "";
  const rarityGroups = [
    { rarity: "Ascended", offset: 0, keys: ["major1", "minor1", "major2", "minor2", "celestial"] as const },
    { rarity: "Exotic", offset: 5, keys: ["major1", "minor1", "major2", "minor2", "celestial"] as const },
    { rarity: "Rare", offset: 10, keys: ["major1", "minor1", "major2", "minor2", "celestial"] as const },
    { rarity: "Masterwork", offset: 15, keys: ["major1", "minor1"] as const },
    { rarity: "Fine", offset: 17, keys: ["major1", "minor1"] as const },
    { rarity: "Basic", offset: 19, keys: ["major1", "minor1"] as const },
  ];

  Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr")).forEach((row) => {
    const cells = Array.from(row.children);
    if (cells.length < 4) {
      return;
    }

    let typeCellIndex = 0;
    const first = cleanAttributeCellText(cells[0]);
    if (["Weapons", "Armor", "Trinkets"].includes(first)) {
      currentCategory = first;
      typeCellIndex = 1;
    }

    const type = cleanAttributeCellText(cells[typeCellIndex]);
    if (!currentCategory || !type || /^total/i.test(type)) {
      return;
    }

    const values = cells.slice(typeCellIndex + 1).map(parseAttributeNumber);
    rarityGroups.forEach((group) => {
      const bonus: MetaBattleLevel80Bonus = {};
      group.keys.forEach((key, index) => {
        const value = values[group.offset + index];
        if (typeof value === "number") {
          bonus[key] = value;
        }
      });

      if (Object.keys(bonus).length > 0) {
        result[getAttributeBonusKey(group.rarity, currentCategory, type)] = bonus;
      }
    });
  });

  return result;
}

function enrichMetaBattleEquipmentSlot(
  slot: MetaBattleBuildEquipmentSlot,
  reference: MetaBattleAttributeReference | null,
): MetaBattleBuildEquipmentSlot {
  if (!reference || !slot.stat) {
    return slot;
  }

  const attributeCombination = findAttributeRecord(reference.combinations, slot.stat);
  if (!attributeCombination) {
    return slot;
  }

  const bonus = findEquipmentAttributeBonus(slot, reference);
  const attributeBonuses = bonus ? applyEquipmentAttributeBonus(attributeCombination, bonus) : attributeCombination.attributes;
  return {
    ...slot,
    attributeCombination,
    attributeBonuses,
  };
}

function applyEquipmentAttributeBonus(
  combination: MetaBattleAttributeCombination,
  bonus: MetaBattleLevel80Bonus,
): MetaBattleAttributeComponent[] {
  const isCelestial = normalizeAttributeLookupKey(combination.prefix) === "celestial";
  const usesFourAttributeValues = combination.attributes.filter((attribute) => attribute.tier === "major").length > 1;
  return combination.attributes.map((attribute) => ({
    ...attribute,
    value: isCelestial
      ? bonus.celestial
      : attribute.tier === "major"
        ? usesFourAttributeValues
          ? bonus.major2
          : bonus.major1
        : usesFourAttributeValues
          ? bonus.minor2
          : bonus.minor1,
  }));
}

function findEquipmentAttributeBonus(
  slot: MetaBattleBuildEquipmentSlot,
  reference: MetaBattleAttributeReference,
): MetaBattleLevel80Bonus | null {
  const rarity = normalizeAttributeRarity(slot.item?.rarity) ?? "Ascended";
  const category = getEquipmentAttributeCategory(slot);
  const type = getEquipmentAttributeType(slot);
  if (!category || !type) {
    return null;
  }

  return reference.bonuses[getAttributeBonusKey(rarity, category, type)] ?? null;
}

function getEquipmentAttributeCategory(slot: MetaBattleBuildEquipmentSlot): string | null {
  const itemType = slot.item?.type;
  if (itemType === "Weapon") {
    return "Weapons";
  }
  if (itemType === "Armor") {
    return "Armor";
  }
  if (itemType === "Trinket" || itemType === "Back") {
    return "Trinkets";
  }

  const slotName = slot.slot.toLowerCase();
  if (/(hammer|staff|bow|rifle|sword|axe|dagger|focus|scepter|pistol|mace|shield|warhorn|torch|greatsword|harpoon|spear|trident)/.test(slotName)) {
    return "Weapons";
  }
  if (/(head|shoulder|chest|hand|leg|feet|boot|glove)/.test(slotName)) {
    return "Armor";
  }
  if (/(ring|amulet|accessory|back)/.test(slotName)) {
    return "Trinkets";
  }
  return null;
}

function getEquipmentAttributeType(slot: MetaBattleBuildEquipmentSlot): string | null {
  const slotName = slot.slot.toLowerCase();
  if (slot.item?.type === "Weapon" || getEquipmentAttributeCategory(slot) === "Weapons") {
    const weaponType = typeof slot.item?.details?.type === "string" ? slot.item.details.type.toLowerCase() : slotName;
    return /(greatsword|hammer|longbow|shortbow|rifle|staff|harpoon|spear|trident)/.test(weaponType)
      ? "Two-handed"
      : "One-handed";
  }

  if (/chest/.test(slotName)) return "Chest";
  if (/leg/.test(slotName)) return "Legs";
  if (/head/.test(slotName)) return "Head";
  if (/shoulder/.test(slotName)) return "Shoulders";
  if (/hand|glove/.test(slotName)) return "Gloves";
  if (/feet|boot/.test(slotName)) return "Boots";
  if (/amulet/.test(slotName)) return "Amulet";
  if (/ring/.test(slotName)) return "Ring";
  if (/accessory/.test(slotName)) return "Accessory";
  if (/back/.test(slotName)) return "Back item";
  return null;
}

function getAttributeBonusKey(rarity: string, category: string, type: string): string {
  return `${normalizeAttributeLookupKey(rarity)}:${normalizeAttributeLookupKey(category)}:${normalizeAttributeLookupKey(type.replace(/\s*\([^)]*\)/g, ""))}`;
}

function findAttributeRecord<T>(records: Record<string, T> | T[], name: string): T | undefined {
  const entries = Array.isArray(records)
    ? records.map((record) => [getAttributeRecordName(record), record] as const)
    : Object.entries(records);
  const wantedKeys = getAttributeLookupKeys(name);
  return entries.find(([key]) => getAttributeLookupKeys(key).some((candidate) => wantedKeys.includes(candidate)))?.[1];
}

function getAttributeRecordName(record: unknown): string {
  return isRecord(record) && typeof record.prefix === "string" ? record.prefix : "";
}

function getAttributeLookupKeys(value: string): string[] {
  const base = normalizeAttributeLookupKey(value);
  const keys = new Set([base]);
  if (base.endsWith("s")) {
    keys.add(base.slice(0, -1));
  }
  return Array.from(keys);
}

function normalizeAttributeLookupKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/s$/, "");
}

function normalizeAttributeRarity(value?: string): string | null {
  if (!value) {
    return null;
  }

  return ["Ascended", "Exotic", "Rare", "Masterwork", "Fine", "Basic"].find(
    (rarity) => rarity.toLowerCase() === value.toLowerCase(),
  ) ?? null;
}

function cleanAttributeCellText(cell: Element | undefined): string {
  if (!cell) {
    return "";
  }

  return normalizePlainText(
    cell
      .textContent
      ?.replace(/\[[^\]]+]/g, " ")
      .replace(/—/g, "-") ?? "",
  );
}

function parseAttributeNumber(cell: Element | undefined): number | undefined {
  const text = cleanAttributeCellText(cell);
  if (!text || text === "-" || text === "?") {
    return undefined;
  }
  const value = Number(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(value) ? value : undefined;
}

function parseAttributePercent(cell: Element | undefined): number | undefined {
  const value = parseAttributeNumber(cell);
  return typeof value === "number" ? value : undefined;
}

function toAbsoluteWikiAssetUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  return new URL(src, "https://wiki.guildwars2.com").toString();
}

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function parseWikiQuantityTitle(value: string): { title: string; count: number } | null {
  const cleaned = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\{\{rarity\|[^}]+}}/gi, " ")
    .replace(/\{\{tooltip\|([^}|]+)(?:\|[^}]*)?}}/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || /^-+$/.test(cleaned)) {
    return null;
  }

  const itemIcon = cleaned.match(/\{\{\s*item icon\s*\|([^}|]+)(?:\|([^}|]+))?/i);
  if (itemIcon) {
    return {
      title: normalizeWikiRecipeTitle(itemIcon[1]),
      count: extractLeadingCount(cleaned) ?? 1,
    };
  }

  const link = cleaned.match(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/);
  if (link) {
    return {
      title: normalizeWikiRecipeTitle(link[1]),
      count: extractLeadingCount(cleaned) ?? 1,
    };
  }

  const plain = cleaned.match(/^(\d+)?\s*([^()[\]{}|]+)$/);
  if (!plain) {
    return null;
  }

  return {
    title: normalizeWikiRecipeTitle(plain[2]),
    count: plain[1] ? Number(plain[1]) : 1,
  };
}

function normalizeWikiRecipeTitle(title: string): string {
  return title
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/\s+\((?:exotic|ascended|rare|masterwork|fine|basic)\)$/i, "")
    .replace(/\s+(?:s|es)$/i, (suffix, offset, full) => {
      const base = full.slice(0, offset);
      return /\b(?:Glass|Compass|Focus|Aegis|Tome|Case|Piece|Essence|Incense)$/i.test(base)
        ? suffix
        : "";
    })
    .trim();
}

function extractLeadingCount(value: string): number | null {
  const match = value.trim().match(/^(\d[\d,]*)\b/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseGatheringWikitext(wikitext: string): ParsedGatheringRow[] {
  const rows: ParsedGatheringRow[] = [];
  let discipline: GatheringDiscipline | null = null;
  let tool = "";

  for (const rawLine of wikitext.split(/\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^===.*?\b(Harvesting|Logging|Mining)\b.*?===$/);
    if (heading) {
      discipline = heading[1] as GatheringDiscipline;
      tool = "";
      continue;
    }

    if (!discipline) {
      continue;
    }

    const toolHeading = line.match(/^!\s*colspan="2"\s*\|\s*(.+)$/);
    if (toolHeading) {
      tool = getWikiLinkTitle(toolHeading[1]);
      continue;
    }

    const row = line.match(/^\|\s*(.+?)\s*\|\|\s*(.+)$/);
    if (!row) {
      continue;
    }

    const node = getWikiLinkTitle(row[1]);
    const itemNames = Array.from(row[2].matchAll(/\{\{item icon\|([^}|]+)(?:\|[^}]*)?\}\}/g))
      .map((match) => match[1].replace(/\s+/g, " ").trim())
      .filter(Boolean);

    for (const itemName of itemNames) {
      rows.push({
        itemName,
        discipline,
        tool,
        node,
        mainYields: [
          {
            itemName,
            chance: "guaranteed",
          },
        ],
        extraYields: [],
      });
    }
  }

  return rows;
}

interface ParsedGatheringRow {
  itemName: string;
  itemId?: number;
  discipline: GatheringDiscipline;
  tool: string;
  toolTier?: string;
  node: string;
  mainYields: GatheringNodeYield[];
  extraYields: GatheringNodeYield[];
}

function parseGatheringHtml(html: string): ParsedGatheringRow[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  return [
    ...parseHarvestingGatheringTables(document),
    ...parseCompactGatheringTable(document, "Logging"),
    ...parseCompactGatheringTable(document, "Mining"),
    ...parseSpecialGatheringNodes(document),
  ];
}

function parseHarvestingGatheringTables(document: Document): ParsedGatheringRow[] {
  const elements = sectionAfterHeadline(document, "Harvesting", { stopAtSubheading: true });
  const tables = elements.flatMap((element) =>
    element.matches("table") ? [element] : Array.from(element.querySelectorAll("table")),
  );
  const occasionalYields = dedupeGatheringYields(
    elements
      .filter((element) => !element.matches("table"))
      .flatMap((element) =>
        extractGatheringYieldsFromElement(
          element,
          "chance",
          "Occasionally yielded while harvesting terrestrial plants.",
        ),
      ),
  ).filter((yieldInfo) => yieldInfo.itemName !== "Dedicated Gardener");
  const rows: ParsedGatheringRow[] = [];

  for (const table of tables) {
    const headerText = getCleanElementText(table.querySelector("th") ?? table);
    if (!/Harvesting Sickle/i.test(headerText)) {
      continue;
    }

    const toolTitle = getFirstWikiTitleFromElement(table.querySelector("th") ?? table) ?? headerText;
    const toolTier = getGatheringToolTier(toolTitle);
    for (const row of Array.from(table.querySelectorAll("tr"))) {
      const cells = Array.from(row.children).filter((cell) => cell.tagName.toLowerCase() === "td");
      if (cells.length < 2) {
        continue;
      }

      const nodes = extractGatheringLinkTitles(cells[0], { allowNodeTitles: true });
      const crops = extractGatheringYieldsFromElement(cells[1], "guaranteed");
      if (nodes.length === 0 || crops.length === 0) {
        continue;
      }

      for (const node of nodes) {
        for (const crop of crops) {
          rows.push({
            itemName: crop.itemName,
            discipline: "Harvesting",
            tool: toolTitle,
            toolTier,
            node,
            mainYields: [crop],
            extraYields: occasionalYields,
          });
        }
      }
    }
  }

  return rows;
}

function parseCompactGatheringTable(document: Document, discipline: "Logging" | "Mining"): ParsedGatheringRow[] {
  const elements = sectionAfterHeadline(document, discipline, { stopAtSubheading: true });
  const table = elements.find((element) => element.matches("table")) ??
    elements.flatMap((element) => Array.from(element.querySelectorAll("table")))[0];
  if (!table) {
    return [];
  }

  const rows: ParsedGatheringRow[] = [];
  let currentToolTier = "";
  let currentNodes: string[] = [];
  const toolSuffix = discipline === "Logging" ? "Logging Axe" : "Mining Pick";

  for (const row of Array.from(table.querySelectorAll("tr"))) {
    const cells = Array.from(row.children).filter((cell) => cell.tagName.toLowerCase() === "td");
    if (cells.length < 3) {
      continue;
    }

    const toolCell = cells.length >= 4 ? cells[0] : null;
    const nodeCell = cells.length >= 4 ? cells[1] : cells[0];
    const mainCell = cells.length >= 4 ? cells[2] : cells[1];
    const extraCell = cells.length >= 4 ? cells[3] : cells[2];

    const tier = toolCell ? getCleanElementText(toolCell) : "";
    if (tier) {
      currentToolTier = tier;
    }

    const nodes = extractGatheringLinkTitles(nodeCell, { allowNodeTitles: true });
    if (nodes.length > 0) {
      currentNodes = nodes;
    }

    const mainYields = extractGatheringYieldsFromElement(mainCell, "guaranteed");
    const extraYields = extractGatheringYieldsFromElement(extraCell, "chance");
    if (currentNodes.length === 0 || mainYields.length === 0) {
      continue;
    }

    const tool = currentToolTier ? `${currentToolTier} ${toolSuffix}` : toolSuffix;
    for (const node of currentNodes) {
      for (const mainYield of mainYields) {
        rows.push({
          itemName: mainYield.itemName,
          discipline,
          tool,
          toolTier: currentToolTier,
          node,
          mainYields,
          extraYields,
        });
      }

      for (const extraYield of extraYields) {
        rows.push({
          itemName: extraYield.itemName,
          discipline,
          tool,
          toolTier: currentToolTier,
          node,
          mainYields,
          extraYields,
        });
      }
    }
  }

  return rows;
}

function parseSpecialGatheringNodes(document: Document): ParsedGatheringRow[] {
  const elements = sectionAfterHeadline(document, "Special_nodes", { stopAtSubheading: true });
  const table = elements.find((element) => element.matches("table")) ??
    elements.flatMap((element) => Array.from(element.querySelectorAll("table")))[0];
  if (!table) {
    return [];
  }

  const rows: ParsedGatheringRow[] = [];
  for (const row of Array.from(table.querySelectorAll("tr"))) {
    const cells = Array.from(row.children).filter((cell) => cell.tagName.toLowerCase() === "td");
    if (cells.length < 5) {
      continue;
    }

    const nodes = extractGatheringLinkTitles(cells[0], { allowNodeTitles: true });
    const toolTitle = getFirstWikiTitleFromElement(cells[1]) ?? (getCleanElementText(cells[1]) || "Gathering tool");
    const toolTier = getGatheringToolTier(toolTitle);
    const association = getCleanElementText(cells[2]);
    const mainYields = extractGatheringYieldsFromElement(
      cells[3],
      "guaranteed",
      association ? `Special node associated with ${association}.` : "Special gathering node.",
    );
    const extraYields = extractGatheringYieldsFromElement(
      cells[4],
      "rare",
      association ? `Rare special-node yield associated with ${association}.` : "Rare special-node yield.",
    );
    const discipline = getDisciplineFromToolOrNode(toolTitle, nodes.join(" "), mainYields.map((item) => item.itemName).join(" "));
    if (nodes.length === 0 || mainYields.length === 0) {
      continue;
    }

    for (const node of nodes) {
      for (const mainYield of mainYields) {
        rows.push({
          itemName: mainYield.itemName,
          discipline,
          tool: toolTitle,
          toolTier,
          node,
          mainYields,
          extraYields,
        });
      }

      for (const extraYield of extraYields) {
        rows.push({
          itemName: extraYield.itemName,
          discipline,
          tool: toolTitle,
          toolTier,
          node,
          mainYields,
          extraYields,
        });
      }
    }
  }

  return rows;
}

function extractGatheringLinkTitles(
  element: Element,
  options: { allowNodeTitles?: boolean } = {},
): string[] {
  const titles = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[title]"))
    .map((link) => {
      const rawTitle = (link.getAttribute("title") ?? link.textContent ?? "").replace(/\s+/g, " ").trim();
      return options.allowNodeTitles ? rawTitle : normalizeDropName(rawTitle);
    })
    .filter((title) =>
      Boolean(
        title &&
          !title.startsWith("File:") &&
          !title.startsWith("Category:") &&
          !title.startsWith("Special:") &&
          !title.startsWith("API:") &&
          !GENERIC_WIKI_TITLES.has(title) &&
          (options.allowNodeTitles || !/\(node\)$/i.test(title)),
      ),
    );

  return Array.from(new Set(titles));
}

function getFirstWikiTitleFromElement(element: Element | null): string | null {
  if (!element) {
    return null;
  }

  return extractGatheringLinkTitles(element, { allowNodeTitles: true })[0] ?? null;
}

function extractGatheringYieldsFromElement(
  element: Element,
  fallbackChance: GatheringNodeYield["chance"],
  fallbackNote = "",
): GatheringNodeYield[] {
  const cellText = getCleanElementText(element);
  return extractGatheringLinkTitles(element).map((itemName) => {
    const quantity = extractGatheringQuantity(cellText, itemName);
    const chance = inferGatheringChance(cellText, fallbackChance);
    const note = getGatheringYieldNote(cellText, itemName, fallbackNote);

    return {
      itemName,
      chance,
      quantity,
      note,
    };
  });
}

function extractGatheringQuantity(text: string, itemName: string): string | undefined {
  const normalized = text.replace(/\s+/g, " ");
  const itemSpecificRange = normalized.match(new RegExp(`${escapeRegex(itemName)}\\s*\\((\\d+\\s*[-–]\\s*\\d+)\\)`, "i"));
  if (itemSpecificRange) {
    return itemSpecificRange[1].replace(/\s+/g, "");
  }

  const itemSpecificCount = normalized.match(new RegExp(`${escapeRegex(itemName)}\\s*x\\s*(\\d+)`, "i"));
  if (itemSpecificCount) {
    return `x${itemSpecificCount[1]}`;
  }

  const range = normalized.match(/\((\d+\s*[-–]\s*\d+)\)/);
  if (range) {
    return range[1].replace(/\s+/g, "");
  }

  const count = normalized.match(/\bx\s*(\d+)\b/i);
  return count ? `x${count[1]}` : undefined;
}

function inferGatheringChance(
  text: string,
  fallbackChance: GatheringNodeYield["chance"],
): GatheringNodeYield["chance"] {
  const normalized = text.toLowerCase();
  if (/\bguaranteed\b/.test(normalized)) {
    return "guaranteed";
  }
  if (/low chance/.test(normalized)) {
    return "low_chance";
  }
  if (/\brare\b/.test(normalized)) {
    return "rare";
  }
  if (/\bchance\b|occasionally|additional/.test(normalized)) {
    return "chance";
  }
  return fallbackChance;
}

function getGatheringYieldNote(text: string, itemName: string, fallbackNote: string): string | undefined {
  const normalized = text.replace(/\s+/g, " ").trim();
  const simpleItemText = normalized.replace(new RegExp(`\\b${escapeRegex(itemName)}\\b`, "gi"), "").trim();
  if (/\((?:DG|Dedicated Gardener)\)/i.test(normalized)) {
    return "Dedicated Gardener achievement crop.";
  }
  if (/\bguaranteed\b/i.test(normalized)) {
    return "Guaranteed yield.";
  }
  if (/low chance/i.test(normalized)) {
    return "Low chance yield.";
  }
  if (simpleItemText && simpleItemText.length <= 80 && simpleItemText !== normalized) {
    return simpleItemText.replace(/^[-–,;:]+|[-–,;:]+$/g, "").trim() || fallbackNote || undefined;
  }
  return fallbackNote || undefined;
}

function dedupeGatheringYields(yields: GatheringNodeYield[]): GatheringNodeYield[] {
  const seen = new Set<string>();
  return yields.filter((yieldInfo) => {
    const key = `${yieldInfo.itemName}:${yieldInfo.chance}:${yieldInfo.quantity ?? ""}:${yieldInfo.note ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getGatheringToolTier(toolTitle: string): string | undefined {
  const match = toolTitle.match(/\b(Copper|Iron|Steel|Darksteel|Mithril|Orichalcum)\b/i);
  return match ? match[1][0].toUpperCase() + match[1].slice(1).toLowerCase() : undefined;
}

function getDisciplineFromToolOrNode(tool: string, nodeNames: string, itemNames: string): GatheringDiscipline {
  const combined = `${tool} ${nodeNames} ${itemNames}`;
  if (/logging|sapling|wood|log/i.test(combined)) {
    return "Logging";
  }
  if (/mining|ore|vein|crystal|formation|quartz|sprocket|candy corn/i.test(combined)) {
    return "Mining";
  }
  return "Harvesting";
}

const GATHERING_CATEGORY_SOURCES: Array<{
  category: string;
  discipline: GatheringDiscipline;
  tool: string;
  node: string;
}> = [
  {
    category: "Category:Harvesting materials",
    discipline: "Harvesting",
    tool: "Harvesting sickle",
    node: "Harvesting node",
  },
  {
    category: "Category:Logging materials",
    discipline: "Logging",
    tool: "Logging axe",
    node: "Logging node",
  },
  {
    category: "Category:Mining materials",
    discipline: "Mining",
    tool: "Mining pick",
    node: "Mining node",
  },
];

async function loadGatherableItemsFromWikiCategories(
  onProgress?: ProgressCallback,
): Promise<GatherableItemSource[]> {
  const grouped = new Map<number, GatherableItemSource>();

  await mapWithConcurrency(GATHERING_CATEGORY_SOURCES, 2, async (source, index) => {
    onProgress?.("Loading gathering categories", index + 1, GATHERING_CATEGORY_SOURCES.length);
    const titles = await loadWikiCategoryMembers(source.category);
    const items = await loadItemsByWikiTitles(titles, onProgress);

    for (const item of items) {
      const existing = grouped.get(item.id);
      if (existing) {
        if (!existing.nodes.includes(source.node)) {
          existing.nodes.push(source.node);
        }
        if (!existing.tool.includes(source.tool)) {
          existing.tool = `${existing.tool}, ${source.tool}`;
        }
        continue;
      }

      grouped.set(item.id, {
        item,
        discipline: source.discipline,
        tool: source.tool,
        nodes: [source.node],
      });
    }
  });

  return Array.from(grouped.values());
}

async function loadWikiItemIdsByTitles(
  titles: string[],
  onProgress?: ProgressCallback,
): Promise<Map<string, number>> {
  const uniqueTitles = Array.from(new Set(titles.map((title) => title.trim()).filter(Boolean)));
  const titleToId = new Map<string, number>();
  if (uniqueTitles.length === 0) {
    return titleToId;
  }

  const cacheKey = getNamedCacheKey(
    "wiki:item-id-batch",
    [...uniqueTitles].sort((left, right) => left.localeCompare(right)).join("|"),
  );
  const cachedPairs = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiDerived, isWikiItemIdPairCache);
  if (cachedPairs) {
    return new Map(cachedPairs);
  }

  const titleChunks = chunk(uniqueTitles, 8);
  await mapWithConcurrency(titleChunks, 3, async (titleChunk, index) => {
    if (titleChunk.length === 0) {
      return;
    }

    onProgress?.("Resolving wiki item ids", index + 1, titleChunks.length);
    const query = `[[${titleChunk.join("||")}]]|?Has game id|limit=${titleChunk.length}`;
    const payload = await fetchJson<SemanticWikiAskResponse>(
      `${WIKI_API}?action=ask&query=${encodeURIComponent(query)}&format=json&origin=*`,
    );
    const results = payload.query?.results ?? {};

    for (const [title, result] of Object.entries(results)) {
      const printouts = result.printouts ?? {};
      const id = (printouts.Has_game_id ?? printouts["Has game id"] ?? []).find((value) => Number.isFinite(value));
      if (typeof id === "number") {
        titleToId.set(normalizeWikiLookupName(result.fulltext ?? title), id);
      }
    }
  });

  void saveSqlCache(cacheKey, Array.from(titleToId.entries()));
  return titleToId;
}

function isWikiItemIdPairCache(value: unknown): value is Array<[string, number]> {
  return (
    Array.isArray(value) &&
    value.every(
      (entry): entry is [string, number] =>
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "string" &&
        typeof entry[1] === "number" &&
        Number.isFinite(entry[1]),
    )
  );
}

export async function loadItemsByWikiTitles(
  titles: string[],
  onProgress?: ProgressCallback,
): Promise<Gw2Item[]> {
  const titleToId = await loadWikiItemIdsByTitles(titles, onProgress);
  const ids = Array.from(new Set(Array.from(titleToId.values())));
  return ids.length ? loadItems(ids, onProgress) : [];
}

async function loadWikiCategoryMembers(categoryTitle: string): Promise<string[]> {
  const cacheKey = getNamedCacheKey("wiki:category-members", categoryTitle);
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is string[] => isArrayOf(value, (item): item is string => typeof item === "string"),
  );
  if (cached) {
    return cached;
  }

  const titles: string[] = [];
  let continuation: string | null = null;

  do {
    const params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      cmtitle: categoryTitle,
      cmnamespace: "0",
      cmlimit: "500",
      origin: "*",
      format: "json",
    });

    if (continuation) {
      params.set("cmcontinue", continuation);
    }

    const payload = await fetchJson<{
      continue?: {
        cmcontinue?: string;
      };
      query?: {
        categorymembers?: Array<{ title?: string }>;
      };
    }>(`${WIKI_API}?${params.toString()}`);

    titles.push(
      ...(payload.query?.categorymembers ?? [])
        .map((member) => member.title)
        .filter((title): title is string => Boolean(title)),
    );
    continuation = payload.continue?.cmcontinue ?? null;
  } while (continuation);

  void saveSqlCache(cacheKey, titles);
  return titles;
}

async function loadDiscontinuedWikiItemNames(onProgress?: ProgressCallback): Promise<Set<string>> {
  if (discontinuedWikiItemNamesCache) {
    return discontinuedWikiItemNamesCache;
  }

  onProgress?.("Checking discontinued wiki item filter");

  try {
    const titles = await loadWikiCategoryMembers(DISCONTINUED_ITEMS_CATEGORY);
    discontinuedWikiItemNamesCache = new Set(titles.map(normalizeWikiLookupName));
  } catch (error) {
    console.warn("Wiki discontinued item filter failed", error);
    discontinuedWikiItemNamesCache = new Set();
  }

  return discontinuedWikiItemNamesCache;
}

interface WikiRecipeDraft {
  outputTitle: string;
  outputCount: number;
  type: string;
  disciplines: string[];
  minRating: number;
  ingredients: Array<{
    title: string;
    count: number;
  }>;
  sourcePage: string;
  sourceUrl: string;
}

interface WikiSearchResponse {
  continue?: {
    sroffset?: number;
  };
  query?: {
    search?: Array<{
      title?: string;
    }>;
  };
}

async function loadWikiMysticForgeRecipes(onProgress?: ProgressCallback): Promise<Gw2Recipe[]> {
  if (mysticForgeRecipeCache) {
    return mysticForgeRecipeCache;
  }

  const cachedRecipes = await loadSqlCache(
    "wiki:mystic-forge-recipes:v2",
    SQL_CACHE_TTL.wikiDerived,
    (value): value is Gw2Recipe[] => isArrayOf(value, isGw2Recipe),
  );
  if (cachedRecipes) {
    mysticForgeRecipeCache = cachedRecipes;
    return mysticForgeRecipeCache;
  }

  onProgress?.("Scanning GW2 Wiki Mystic Forge recipes");
  const categoryTitles = await loadWikiCategoryMembers(MYSTIC_FORGE_CATEGORY).catch(() => []);
  const pageTitles = Array.from(
    new Set([
      ...MYSTIC_FORGE_SEED_PAGES,
      ...categoryTitles,
    ]),
  );
  const pageTexts = await mapWithConcurrency(pageTitles, 3, async (pageTitle, index) => {
    onProgress?.("Loading wiki Mystic Forge pages", index + 1, pageTitles.length);
    return {
      pageTitle,
      wikitext: await loadWikiWikitext(pageTitle).catch(() => ""),
    };
  });
  const drafts = pageTexts.flatMap(({ pageTitle, wikitext }) =>
    parseMysticForgeRecipeDrafts(pageTitle, wikitext),
  );
  mysticForgeRecipeCache = await hydrateWikiRecipeDrafts(drafts, onProgress);
  void saveSqlCache("wiki:mystic-forge-recipes:v2", mysticForgeRecipeCache);
  return mysticForgeRecipeCache;
}

async function loadWikiMysticForgeRecipesForItem(
  itemId: number,
  onProgress?: ProgressCallback,
): Promise<Gw2Recipe[]> {
  const cached = mysticForgeRecipeItemCache.get(itemId);
  if (cached) {
    return cached;
  }

  const persistentCacheKey = `wiki:mystic-forge-recipes:item:v2:${itemId}`;
  const cachedRecipes = await loadSqlCache(
    persistentCacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is Gw2Recipe[] => isArrayOf(value, isGw2Recipe),
  );
  if (cachedRecipes) {
    mysticForgeRecipeItemCache.set(itemId, cachedRecipes);
    return cachedRecipes;
  }

  const item = itemCache.get(itemId) ?? (await loadItems([itemId], onProgress))[0];
  if (!item) {
    mysticForgeRecipeItemCache.set(itemId, []);
    return [];
  }

  onProgress?.("Searching GW2 Wiki Mystic Forge recipes");
  const pageTitles = await loadWikiMysticForgeRecipePageTitlesForItem(item.name);
  const pageTexts = await mapWithConcurrency(pageTitles, 3, async (pageTitle, index) => {
    onProgress?.("Checking item-specific Mystic Forge pages", index + 1, pageTitles.length);
    return {
      pageTitle,
      wikitext: await loadWikiWikitext(pageTitle).catch(() => ""),
    };
  });
  const drafts = pageTexts.flatMap(({ pageTitle, wikitext }) =>
    parseMysticForgeRecipeDrafts(pageTitle, wikitext),
  );
  const recipes = (await hydrateWikiRecipeDrafts(drafts, onProgress)).filter(
    (recipe) =>
      recipe.output_item_id === itemId ||
      recipe.ingredients.some((ingredient) => ingredient.item_id === itemId),
  );

  mysticForgeRecipeItemCache.set(itemId, recipes);
  void saveSqlCache(persistentCacheKey, recipes);
  return recipes;
}

async function loadWikiMysticForgeRecipePageTitlesForItem(itemName: string): Promise<string[]> {
  const cacheKey = getNamedCacheKey("wiki:mystic-forge-page-titles:v2", itemName);
  const cachedTitles = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is string[] => isArrayOf(value, (item): item is string => typeof item === "string"),
  );
  if (cachedTitles) {
    return cachedTitles;
  }

  const titles = new Set<string>([itemName]);
  const queries = buildWikiMysticForgeItemSearchQueries(itemName);

  for (const searchQuery of queries) {
    let offset = 0;

    while (true) {
      const params = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: searchQuery,
        srnamespace: "0",
        srlimit: "50",
        origin: "*",
        format: "json",
      });
      if (offset > 0) {
        params.set("sroffset", String(offset));
      }

      const payload = await fetchJson<WikiSearchResponse>(`${WIKI_API}?${params.toString()}`);
      const results = payload.query?.search ?? [];
      for (const result of results) {
        if (result.title) {
          titles.add(result.title);
        }
      }

      const nextOffset = payload.continue?.sroffset;
      if (!nextOffset || nextOffset <= offset || results.length === 0) {
        break;
      }

      offset = nextOffset;
    }

    if (titles.size > 1) {
      break;
    }
  }

  const result = Array.from(titles);
  void saveSqlCache(cacheKey, result);
  return result;
}

function buildWikiMysticForgeItemSearchQueries(itemName: string): string[] {
  const phrase = itemName.replace(/"/g, "").trim();
  return [
    `"${phrase}" incategory:"Mystic Forge recipes"`,
    `${phrase} incategory:"Mystic Forge recipes"`,
  ];
}

async function loadWikiRecipeUsageForItem(
  itemId: number,
  onProgress?: ProgressCallback,
): Promise<Gw2Recipe[]> {
  const cached = wikiRecipeUsageItemCache.get(itemId);
  if (cached) {
    return cached;
  }

  const persistentCacheKey = `wiki:recipe-usage:item:v2:${itemId}`;
  const cachedRecipes = await loadSqlCache(
    persistentCacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is Gw2Recipe[] => isArrayOf(value, isGw2Recipe),
  );
  if (cachedRecipes) {
    wikiRecipeUsageItemCache.set(itemId, cachedRecipes);
    return cachedRecipes;
  }

  const item = itemCache.get(itemId) ?? (await loadItems([itemId], onProgress))[0];
  if (!item) {
    wikiRecipeUsageItemCache.set(itemId, []);
    return [];
  }

  const itemPage = await loadWikiHtml(item.name).catch(() => null);
  if (!itemPage) {
    wikiRecipeUsageItemCache.set(itemId, []);
    return [];
  }

  const recipePageTitles = extractWikiRecipeUsagePageTitles(itemPage.html, itemPage.title);
  if (recipePageTitles.length === 0) {
    wikiRecipeUsageItemCache.set(itemId, []);
    return [];
  }

  const pages = await mapWithConcurrency(recipePageTitles, 3, async (pageTitle, index) => {
    onProgress?.("Loading wiki recipe usage pages", index + 1, recipePageTitles.length);
    return loadWikiHtml(pageTitle).catch(() => null);
  });
  const drafts = pages
    .filter((page): page is { title: string; html: string; url: string } => Boolean(page))
    .flatMap((page) => parseWikiRecipeTableDrafts(page.title, page.html, page.url));
  const recipes = (await hydrateWikiRecipeDrafts(drafts, onProgress)).filter(
    (recipe) =>
      recipe.output_item_id === itemId ||
      recipe.ingredients.some((ingredient) => ingredient.item_id === itemId),
  );

  wikiRecipeUsageItemCache.set(itemId, recipes);
  void saveSqlCache(persistentCacheKey, recipes);
  return recipes;
}

function extractWikiRecipeUsagePageTitles(html: string, itemPageTitle: string): string[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const usedInElements = sectionAfterHeadline(document, "Used_in");
  const itemPrefix = `${normalizeWikiLookupName(itemPageTitle)}/`;
  const titles = new Set<string>();

  for (const element of usedInElements) {
    if (!/\brecipes?\b/i.test(element.textContent ?? "")) {
      continue;
    }

    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[title]"));
    for (const link of links) {
      const title = link.getAttribute("title")?.replace(/\s+/g, " ").trim();
      if (!title || title.includes("redlink=1")) {
        continue;
      }

      const normalizedTitle = normalizeWikiLookupName(title);
      if (normalizedTitle.startsWith(itemPrefix) && !/#/.test(title)) {
        titles.add(title);
      }
    }
  }

  return Array.from(titles);
}

function parseWikiRecipeTableDrafts(
  pageTitle: string,
  html: string,
  sourceUrl: string,
): WikiRecipeDraft[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const drafts: WikiRecipeDraft[] = [];

  for (const table of Array.from(document.querySelectorAll("table.recipe"))) {
    for (const row of Array.from(table.querySelectorAll("tr"))) {
      const cells = Array.from(row.children).filter((cell) => cell.tagName.toLowerCase() === "td");
      if (cells.length < 5) {
        continue;
      }

      const outputTitle = getFirstWikiItemTitle(cells[0]);
      const ingredients = parseWikiRecipeIngredientCell(cells[cells.length - 1]);
      if (!outputTitle || ingredients.length < 1) {
        continue;
      }

      const disciplines = extractRecipeDisciplinesFromCell(cells[2]);
      const isMystic = /mystic forge/i.test(pageTitle) || disciplines.some((discipline) => /mystic forge/i.test(discipline));
      drafts.push({
        outputTitle,
        outputCount: 1,
        type: isMystic ? "Mystic Forge" : "Crafting",
        disciplines: isMystic ? ["Mystic Forge"] : disciplines,
        minRating: parseWikiRecipeRating(cells[3]),
        ingredients,
        sourcePage: pageTitle,
        sourceUrl,
      });
    }
  }

  return drafts;
}

function parseWikiRecipeIngredientCell(cell: Element): Array<{ title: string; count: number }> {
  const ingredients: Array<{ title: string; count: number }> = [];
  const quantityNodes = Array.from(cell.querySelectorAll("dt"));

  for (const quantityNode of quantityNodes) {
    const detailNode = quantityNode.nextElementSibling;
    if (!detailNode || detailNode.tagName.toLowerCase() !== "dd") {
      continue;
    }

    const title = getFirstWikiItemTitle(detailNode);
    const count = parseWikiRecipeCount(quantityNode.textContent ?? "");
    if (title && count > 0) {
      ingredients.push({
        title,
        count,
      });
    }
  }

  if (ingredients.length > 0) {
    return ingredients;
  }

  return Array.from(cell.querySelectorAll<HTMLAnchorElement>("a[title]"))
    .map((link) => {
      const title = getWikiItemTitleFromAnchor(link);
      return title
        ? {
            title,
            count: 1,
          }
        : null;
    })
    .filter((ingredient): ingredient is { title: string; count: number } => Boolean(ingredient));
}

function getFirstWikiItemTitle(element: Element): string | null {
  const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[title]"));
  for (const link of links) {
    const title = getWikiItemTitleFromAnchor(link);
    if (title) {
      return title;
    }
  }

  return null;
}

function getWikiItemTitleFromAnchor(link: HTMLAnchorElement): string | null {
  const title = link.getAttribute("title")?.replace(/\s+/g, " ").trim();
  if (
    !title ||
    title.startsWith("File:") ||
    title.startsWith("Category:") ||
    title.includes("#") ||
    CRAFTING_DISCIPLINES.includes(title)
  ) {
    return null;
  }

  return normalizeWikiRecipeTitle(title);
}

function extractRecipeDisciplinesFromCell(cell: Element): string[] {
  const found = new Set<string>();
  const text = cell.textContent ?? "";

  for (const discipline of CRAFTING_DISCIPLINES) {
    if (new RegExp(`\\b${escapeRegex(discipline)}\\b`, "i").test(text)) {
      found.add(discipline);
    }
  }

  for (const link of Array.from(cell.querySelectorAll<HTMLAnchorElement>("a[title]"))) {
    const title = link.getAttribute("title")?.trim() ?? "";
    if (CRAFTING_DISCIPLINES.includes(title)) {
      found.add(title);
    }
  }

  return Array.from(found);
}

function parseWikiRecipeRating(cell: Element): number {
  const match = (cell.textContent ?? "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function parseWikiRecipeCount(value: string): number {
  const match = value.replace(/,/g, "").match(/\d+/);
  const count = match ? Number(match[0]) : 1;
  return Number.isFinite(count) && count > 0 ? count : 1;
}

async function hydrateWikiRecipeDrafts(
  drafts: WikiRecipeDraft[],
  onProgress?: ProgressCallback,
): Promise<Gw2Recipe[]> {
  const allTitles = Array.from(
    new Set(
      drafts.flatMap((draft) => [
        draft.outputTitle,
        ...draft.ingredients.map((ingredient) => ingredient.title),
      ]),
    ),
  );
  const titleToId = await loadWikiItemIdsByTitles(allTitles, onProgress);
  const recipes: Gw2Recipe[] = [];
  const seenKeys = new Set<string>();

  for (const draft of drafts) {
    const outputId = titleToId.get(normalizeWikiLookupName(draft.outputTitle));
    if (!outputId) {
      continue;
    }

    const ingredients = draft.ingredients
      .map((ingredient) => {
        const ingredientId = titleToId.get(normalizeWikiLookupName(ingredient.title));
        return ingredientId
          ? {
              item_id: ingredientId,
              count: ingredient.count,
            }
          : null;
      })
      .filter((ingredient): ingredient is RecipeIngredient => Boolean(ingredient));

    if (ingredients.length < 2) {
      continue;
    }

    const key = `${outputId}:${ingredients
      .map((ingredient) => `${ingredient.item_id}x${ingredient.count}`)
      .sort()
      .join(",")}`;
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    recipes.push({
      id: getSyntheticWikiRecipeId(key),
      type: draft.type,
      output_item_id: outputId,
      output_item_count: draft.outputCount,
      time_to_craft_ms: 0,
      disciplines: draft.disciplines,
      min_rating: draft.minRating,
      flags: ["Wiki"],
      ingredients,
      source: "wiki",
      sourceName: draft.sourcePage,
      sourceUrl: draft.sourceUrl,
    });
  }

  const linkedIds = Array.from(
    new Set([
      ...recipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.item_id)),
      ...recipes
        .map((recipe) => recipe.output_item_id)
        .filter((id): id is number => typeof id === "number"),
    ]),
  );
  await loadItems(linkedIds, onProgress);
  return recipes;
}

function parseMysticForgeRecipeDrafts(
  pageTitle: string,
  wikitext: string,
): WikiRecipeDraft[] {
  if (!wikitext) {
    return [];
  }

  return [
    ...parseMysticForgeTemplateRecipes(pageTitle, wikitext),
    ...parseMysticForgeTableRecipes(pageTitle, wikitext),
  ];
}

function parseMysticForgeTemplateRecipes(
  pageTitle: string,
  wikitext: string,
): WikiRecipeDraft[] {
  const drafts: WikiRecipeDraft[] = [];
  const recipeTemplatePattern = /\{\{\s*recipe\b([\s\S]*?)\n}}/gi;
  let match: RegExpExecArray | null;

  while ((match = recipeTemplatePattern.exec(wikitext))) {
    const template = match[1];
    if (!/source\s*=\s*Mystic Forge/i.test(template)) {
      continue;
    }

    const output =
      getTemplateParam(template, "output") ??
      getTemplateParam(template, "result") ??
      getTemplateParam(template, "item") ??
      pageTitle;
    const outputParsed = parseWikiQuantityTitle(output) ?? {
      title: pageTitle,
      count: 1,
    };
    const ingredients = [1, 2, 3, 4]
      .map((index) => getTemplateParam(template, `ingredient${index}`))
      .map((value) => (value ? parseWikiQuantityTitle(value) : null))
      .filter((ingredient): ingredient is { title: string; count: number } => Boolean(ingredient));

    if (ingredients.length >= 2) {
      drafts.push({
        outputTitle: outputParsed.title,
        outputCount: outputParsed.count,
        type: "Mystic Forge",
        disciplines: ["Mystic Forge"],
        minRating: 0,
        ingredients,
        sourcePage: pageTitle,
        sourceUrl: wikiPageUrl(pageTitle),
      });
    }
  }

  return drafts;
}

function getTemplateParam(template: string, key: string): string | null {
  const match = template.match(new RegExp(`\\|\\s*${key}\\s*=\\s*([^\\n|]+(?:\\|[^\\n]+)?)`, "i"));
  return match?.[1]?.trim() ?? null;
}

function parseMysticForgeTableRecipes(
  pageTitle: string,
  wikitext: string,
): WikiRecipeDraft[] {
  const drafts: WikiRecipeDraft[] = [];
  const rows = wikitext.split(/\n\|-/g);

  for (const row of rows) {
    if (!/\|\|/.test(row) || !/\{\{\s*item icon/i.test(row)) {
      continue;
    }

    const cells = row
      .split(/\s*\|\|\s*/g)
      .map((cell) => cell.replace(/^\|\s*/, "").trim())
      .filter(Boolean);

    if (cells.length < 5) {
      continue;
    }

    const output = parseWikiQuantityTitle(cells[0]);
    if (!output) {
      continue;
    }

    const ingredientCells = cells
      .slice(1)
      .map((cell) => parseWikiQuantityTitle(cell))
      .filter((ingredient): ingredient is { title: string; count: number } => Boolean(ingredient))
      .filter((ingredient) => normalizeWikiLookupName(ingredient.title) !== normalizeWikiLookupName(output.title))
      .slice(-4);

    if (ingredientCells.length < 2) {
      continue;
    }

    drafts.push({
      outputTitle: output.title,
      outputCount: output.count,
      type: "Mystic Forge",
      disciplines: ["Mystic Forge"],
      minRating: 0,
      ingredients: ingredientCells,
      sourcePage: pageTitle,
      sourceUrl: wikiPageUrl(pageTitle),
    });
  }

  return drafts;
}

function getSyntheticWikiRecipeId(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return -Math.abs(hash >>> 0);
}

export async function loadGatherableItems(
  onProgress?: ProgressCallback,
): Promise<GatherableItemSource[]> {
  if (gatherableItemsCache) {
    return gatherableItemsCache;
  }

  const gatheringCacheKey = "wiki:gatherable-items:v3";
  const cachedSources = await loadSqlCache(
    gatheringCacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is GatherableItemSource[] => isArrayOf(value, isGatherableItemSource),
  );
  if (cachedSources?.length) {
    gatherableItemsCache = cachedSources;
    for (const source of gatherableItemsCache) {
      itemCache.set(source.item.id, source.item);
    }
    return gatherableItemsCache;
  }

  let parsedRows: ParsedGatheringRow[] = GATHERING_SOURCE_SEEDS.map(
    normalizeGatheringSourceSeed,
  );
  let pageError: unknown = null;

  if (parsedRows.length === 0) {
    try {
      onProgress?.("Loading gathering index");
      const wikiPage = await loadWikiHtml("Gathering");
      parsedRows = wikiPage ? parseGatheringHtml(wikiPage.html) : [];
      if (parsedRows.length === 0) {
        const wikitext = await loadWikiWikitext("Gathering");
        parsedRows = parseGatheringWikitext(wikitext);
      }
    } catch (error) {
      pageError = error;
      console.warn("Wiki gathering page failed", error);
    }
  }

  const grouped = new Map<string, GatherableItemSource>();

  if (parsedRows.length > 0) {
    const names = Array.from(
      new Set(
        parsedRows
          .filter((row) => typeof row.itemId !== "number")
          .flatMap((row) => [
            row.itemName,
            ...(row.mainYields ?? [])
              .filter((yieldInfo) => typeof yieldInfo.itemId !== "number")
              .map((yieldInfo) => yieldInfo.itemName),
            ...(row.extraYields ?? [])
              .filter((yieldInfo) => typeof yieldInfo.itemId !== "number")
              .map((yieldInfo) => yieldInfo.itemName),
          ]),
      ),
    );
    const titleToId =
      names.length > 0
        ? await loadWikiItemIdsByTitles(names, onProgress)
        : new Map<string, number>();
    const ids = Array.from(
      new Set([
        ...parsedRows.map((row) => row.itemId),
        ...parsedRows.flatMap((row) => [
          ...(row.mainYields ?? []).map((yieldInfo) => yieldInfo.itemId),
          ...(row.extraYields ?? []).map((yieldInfo) => yieldInfo.itemId),
        ]),
        ...names.map((name) => titleToId.get(normalizeWikiLookupName(name))),
      ].filter((id): id is number => typeof id === "number")),
    );

    onProgress?.("Loading gathering item details");
    const items = await loadItems(ids, onProgress);
    const itemById = new Map(items.map((item) => [item.id, item]));
    const itemByName = new Map(items.map((item) => [normalizeWikiLookupName(item.name), item]));

    for (const row of parsedRows) {
      const resolvedRowId = row.itemId ?? titleToId.get(normalizeWikiLookupName(row.itemName));
      const item =
        (typeof resolvedRowId === "number" ? itemById.get(resolvedRowId) : undefined) ??
        itemByName.get(normalizeWikiLookupName(row.itemName));
      if (!item) {
        continue;
      }
      const mainYields = hydrateGatheringYields(row.mainYields ?? [], itemByName, itemById);
      const extraYields = hydrateGatheringYields(row.extraYields ?? [], itemByName, itemById);

      const existing = grouped.get(item.id.toString());
      if (existing) {
        if (!existing.nodes.includes(row.node)) {
          existing.nodes.push(row.node);
        }
        if (!existing.tool.includes(row.tool)) {
          existing.tool = `${existing.tool}, ${row.tool}`;
        }
        if (row.toolTier && !existing.toolTier?.includes(row.toolTier)) {
          existing.toolTier = existing.toolTier ? `${existing.toolTier}, ${row.toolTier}` : row.toolTier;
        }
        existing.mainYields = mergeGatheringYields(existing.mainYields ?? [], mainYields);
        existing.extraYields = mergeGatheringYields(existing.extraYields ?? [], extraYields);
      } else {
        grouped.set(item.id.toString(), {
          item,
          discipline: row.discipline,
          tool: row.tool || `${row.discipline} tool`,
          toolTier: row.toolTier,
          nodes: [row.node],
          mainYields,
          extraYields,
        });
      }
    }
  }

  if (grouped.size === 0) {
    try {
      for (const source of await loadGatherableItemsFromWikiCategories(onProgress)) {
        grouped.set(source.item.id.toString(), source);
      }
    } catch (error) {
      if (pageError instanceof Error) {
        throw pageError;
      }
      throw error;
    }
  }

  gatherableItemsCache = Array.from(grouped.values()).sort((left, right) => {
    const disciplineDelta = left.discipline.localeCompare(right.discipline);
    return disciplineDelta || left.item.name.localeCompare(right.item.name);
  });

  void saveSqlCache(gatheringCacheKey, gatherableItemsCache);
  return gatherableItemsCache;
}

export async function loadPermanentGatheringNodes(
  onProgress?: ProgressCallback,
): Promise<PermanentGatheringNode[]> {
  if (permanentGatheringNodesCache) {
    return permanentGatheringNodesCache;
  }

  const cacheKey = "gw2efficiency:permanent-gathering-nodes:v1";
  const cachedNodes = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is PermanentGatheringNode[] => isArrayOf(value, isPermanentGatheringNode),
  );
  if (cachedNodes?.length) {
    permanentGatheringNodesCache = cachedNodes;
    for (const node of cachedNodes) {
      for (const drop of node.items) {
        if (drop.item) {
          itemCache.set(drop.item.id, drop.item);
        }
      }
    }
    return cachedNodes;
  }

  const itemIds = Array.from(
    new Set(PERMANENT_GATHERING_NODE_SEEDS.flatMap((node) => node.items.map((item) => item.id))),
  );
  onProgress?.("Loading permanent gathering node items");
  const items = await loadItems(itemIds, onProgress);
  const itemById = new Map(items.map((item) => [item.id, item]));

  permanentGatheringNodesCache = PERMANENT_GATHERING_NODE_SEEDS.map((node) => ({
    id: node.id,
    image: node.image,
    imageUrl: `${PERMANENT_GATHERING_NODE_IMAGE_BASE_URL}${encodeURIComponent(node.image)}`,
    area: node.area,
    zone: node.zone,
    region: node.region,
    materialName: node.materialName,
    waypointName: node.waypointName,
    waypointCode: node.waypointCode,
    optimal: node.optimal,
    videoGuide: node.videoGuide,
    sourceUrl: PERMANENT_GATHERING_NODE_SOURCE_URL,
    items: node.items.map((drop) => ({
      id: drop.id,
      quantity: drop.quantity,
      ore: drop.ore,
      item: itemById.get(drop.id),
    })),
  })).sort((left, right) => left.optimal - right.optimal);

  void saveSqlCache(cacheKey, permanentGatheringNodesCache);
  return permanentGatheringNodesCache;
}

function hydrateGatheringYields(
  yields: GatheringNodeYield[],
  itemByName: Map<string, Gw2Item>,
  itemById = new Map<number, Gw2Item>(),
): GatheringNodeYield[] {
  return yields.map((yieldInfo) => {
    const item =
      (typeof yieldInfo.itemId === "number" ? itemById.get(yieldInfo.itemId) : undefined) ??
      itemByName.get(normalizeWikiLookupName(yieldInfo.itemName));
    return item
      ? {
          ...yieldInfo,
          itemId: item.id,
          itemName: item.name,
        }
      : yieldInfo;
  });
}

function normalizeGatheringSourceSeed(seed: GatheringSourceSeed): ParsedGatheringRow {
  return {
    itemName: seed.itemName,
    itemId: seed.itemId,
    discipline: seed.discipline,
    tool: seed.tool,
    toolTier: seed.toolTier,
    node: seed.node,
    mainYields: seed.mainYields,
    extraYields: seed.extraYields,
  };
}

function mergeGatheringYields(
  existingYields: GatheringNodeYield[],
  nextYields: GatheringNodeYield[],
): GatheringNodeYield[] {
  return dedupeGatheringYields([...existingYields, ...nextYields]);
}

function isInventorySlotBagItem(item: Gw2Item): boolean {
  return item.type === "Bag" && typeof item.details?.size === "number";
}

function filterDiscontinuedWikiItems<T extends Gw2Item>(
  items: T[],
  discontinuedNames: Set<string>,
): T[] {
  if (discontinuedNames.size === 0) {
    return items;
  }

  return items.filter((item) => !discontinuedNames.has(normalizeWikiLookupName(item.name)));
}

function cacheItemDetails(items: Gw2Item[]) {
  for (const item of items) {
    itemCache.set(item.id, item);
  }
}

function sortSlotBagItems(items: Gw2Item[]): Gw2Item[] {
  return [...items].sort((left, right) => {
    const leftSize = getUnknownNumber(left.details?.size) ?? 0;
    const rightSize = getUnknownNumber(right.details?.size) ?? 0;
    const sizeDelta = rightSize - leftSize;
    return sizeDelta || left.name.localeCompare(right.name);
  });
}

function sortOpenableBagItems(items: Gw2Item[]): Gw2Item[] {
  return [...items].sort((left, right) => left.name.localeCompare(right.name));
}

function saveFilteredBagCache(
  cacheKey: string,
  items: Gw2Item[],
  discontinuedNames: Set<string>,
) {
  if (discontinuedNames.size > 0) {
    void saveSqlCache(cacheKey, items);
  }
}

async function loadWikiSlotBagItemIds(onProgress?: ProgressCallback): Promise<Set<number>> {
  const cachedIds = await loadSqlCache(
    "wiki:slot-bag-item-ids",
    SQL_CACHE_TTL.wikiDerived,
    (value): value is number[] => isArrayOf(value, (item): item is number => typeof item === "number" && Number.isFinite(item)),
  );
  if (cachedIds) {
    return new Set(cachedIds);
  }

  const ids = new Set<number>();
  let offset = 0;
  let page = 1;

  while (true) {
    onProgress?.("Loading slot bag index", page);
    const query = `[[Has item type::Bag]]|?Has game id|limit=500|offset=${offset}`;
    const payload = await fetchJson<SemanticWikiAskResponse>(
      `${WIKI_API}?action=ask&query=${encodeURIComponent(query)}&format=json&origin=*`,
    );
    const results = payload.query?.results ?? {};

    for (const result of Object.values(results)) {
      for (const id of result.printouts?.Has_game_id ?? []) {
        if (Number.isFinite(id)) {
          ids.add(id);
        }
      }
    }

    const nextOffset = payload["query-continue-offset"];
    if (typeof nextOffset !== "number" || nextOffset <= offset) {
      break;
    }

    offset = nextOffset;
    page += 1;
  }

  void saveSqlCache("wiki:slot-bag-item-ids", Array.from(ids));
  return ids;
}

async function loadOfficialSlotBagItems(onProgress?: ProgressCallback): Promise<Gw2Item[]> {
  onProgress?.("Scanning official item catalog for slot bags");
  const items = await loadAllItemsCatalog(onProgress);

  return items.filter(isInventorySlotBagItem);
}

export async function loadSlotBagItems(onProgress?: ProgressCallback): Promise<Gw2Item[]> {
  if (slotBagCache) {
    return slotBagCache;
  }

  const cachedBags = await loadSqlCache(
    SLOT_BAG_CACHE_KEY,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is Gw2Item[] => isArrayOf(value, isGw2Item),
  );
  if (cachedBags?.length) {
    slotBagCache = cachedBags;
    cacheItemDetails(slotBagCache);
    return slotBagCache;
  }

  const discontinuedNames = await loadDiscontinuedWikiItemNames(onProgress);
  const legacyBags = await loadSqlCache(
    LEGACY_SLOT_BAG_CACHE_KEY,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is Gw2Item[] => isArrayOf(value, isGw2Item),
  );
  if (legacyBags?.length) {
    slotBagCache = sortSlotBagItems(
      filterDiscontinuedWikiItems(legacyBags.filter(isInventorySlotBagItem), discontinuedNames),
    );
    cacheItemDetails(slotBagCache);
    saveFilteredBagCache(SLOT_BAG_CACHE_KEY, slotBagCache, discontinuedNames);
    return slotBagCache;
  }

  let officialError: unknown = null;
  const cachedTypeBags = filterDiscontinuedWikiItems(
    (await loadCachedItemDetailsByType("Bag")).filter(isInventorySlotBagItem),
    discontinuedNames,
  );

  if (cachedTypeBags.length >= MIN_TRUSTED_CACHED_SLOT_BAGS) {
    slotBagCache = sortSlotBagItems(cachedTypeBags);
    cacheItemDetails(slotBagCache);
    saveFilteredBagCache(SLOT_BAG_CACHE_KEY, slotBagCache, discontinuedNames);
    return slotBagCache;
  }

  try {
    slotBagCache = sortSlotBagItems(
      filterDiscontinuedWikiItems(await loadOfficialSlotBagItems(onProgress), discontinuedNames),
    );
  } catch (error) {
    officialError = error;
    console.warn("Official slot bag scan failed", error);
  }

  if (!slotBagCache?.length) {
    throw officialError instanceof Error
      ? officialError
      : new Error("Unable to load slot bags from the official item catalog.");
  }

  cacheItemDetails(slotBagCache);
  saveFilteredBagCache(SLOT_BAG_CACHE_KEY, slotBagCache, discontinuedNames);
  return slotBagCache;
}

function isOpenableContainerItem(item: Gw2Item): boolean {
  return item.type === "Container";
}

async function loadWikiOpenableContainerIds(onProgress?: ProgressCallback): Promise<Set<number>> {
  const cachedIds = await loadSqlCache(
    "wiki:openable-container-item-ids",
    SQL_CACHE_TTL.wikiDerived,
    (value): value is number[] => isArrayOf(value, (item): item is number => typeof item === "number" && Number.isFinite(item)),
  );
  if (cachedIds) {
    return new Set(cachedIds);
  }

  const ids = new Set<number>();
  let offset = 0;
  let page = 1;

  while (true) {
    onProgress?.("Loading openable container index", page);
    const query = `[[Has item type::Container]]|?Has game id|limit=500|offset=${offset}`;
    const payload = await fetchJson<SemanticWikiAskResponse>(
      `${WIKI_API}?action=ask&query=${encodeURIComponent(query)}&format=json&origin=*`,
    );
    const results = payload.query?.results ?? {};

    for (const result of Object.values(results)) {
      for (const id of result.printouts?.Has_game_id ?? []) {
        if (Number.isFinite(id)) {
          ids.add(id);
        }
      }
    }

    const nextOffset = payload["query-continue-offset"];
    if (typeof nextOffset !== "number" || nextOffset <= offset) {
      break;
    }

    offset = nextOffset;
    page += 1;
  }

  void saveSqlCache("wiki:openable-container-item-ids", Array.from(ids));
  return ids;
}

async function loadOfficialOpenableContainerItems(onProgress?: ProgressCallback): Promise<Gw2Item[]> {
  onProgress?.("Scanning official item catalog for containers");
  const items = await loadAllItemsCatalog(onProgress);

  return items.filter(isOpenableContainerItem);
}

export async function loadOpenableBagItems(onProgress?: ProgressCallback): Promise<Gw2Item[]> {
  if (openableBagCache) {
    return openableBagCache;
  }

  const cachedBags = await loadSqlCache(
    OPENABLE_BAG_CACHE_KEY,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is Gw2Item[] => isArrayOf(value, isGw2Item),
  );
  if (cachedBags?.length) {
    openableBagCache = cachedBags;
    cacheItemDetails(openableBagCache);
    return openableBagCache;
  }

  const discontinuedNames = await loadDiscontinuedWikiItemNames(onProgress);
  const legacyBags = await loadSqlCache(
    LEGACY_OPENABLE_BAG_CACHE_KEY,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is Gw2Item[] => isArrayOf(value, isGw2Item),
  );
  if (legacyBags?.length) {
    openableBagCache = sortOpenableBagItems(
      filterDiscontinuedWikiItems(legacyBags.filter(isOpenableContainerItem), discontinuedNames),
    );
    cacheItemDetails(openableBagCache);
    saveFilteredBagCache(OPENABLE_BAG_CACHE_KEY, openableBagCache, discontinuedNames);
    return openableBagCache;
  }

  let officialError: unknown = null;
  const cachedTypeContainers = filterDiscontinuedWikiItems(
    (await loadCachedItemDetailsByType("Container")).filter(isOpenableContainerItem),
    discontinuedNames,
  );

  if (cachedTypeContainers.length >= MIN_TRUSTED_CACHED_CONTAINERS) {
    openableBagCache = sortOpenableBagItems(cachedTypeContainers);
    cacheItemDetails(openableBagCache);
    saveFilteredBagCache(OPENABLE_BAG_CACHE_KEY, openableBagCache, discontinuedNames);
    return openableBagCache;
  }

  try {
    openableBagCache = sortOpenableBagItems(
      filterDiscontinuedWikiItems(await loadOfficialOpenableContainerItems(onProgress), discontinuedNames),
    );
  } catch (error) {
    officialError = error;
    console.warn("Official openable container scan failed", error);
  }

  if (!openableBagCache?.length) {
    throw officialError instanceof Error
      ? officialError
      : new Error("Unable to load openable containers from the official item catalog.");
  }

  cacheItemDetails(openableBagCache);
  saveFilteredBagCache(OPENABLE_BAG_CACHE_KEY, openableBagCache, discontinuedNames);
  return openableBagCache;
}

export async function loadWorlds(): Promise<Gw2World[]> {
  if (worldCache) {
    return worldCache;
  }

  const cachedWorlds = await loadSqlCache(
    "official:worlds",
    SQL_CACHE_TTL.staticCatalog,
    (value): value is Gw2World[] => isArrayOf(value, isGw2World),
  );
  if (cachedWorlds) {
    worldCache = cachedWorlds;
    return worldCache;
  }

  worldCache = (await fetchJson<Gw2World[]>(`${GW2_API}/worlds?ids=all`)).sort(
    (left, right) => left.id - right.id,
  );
  void saveSqlCache("official:worlds", worldCache);
  return worldCache;
}

export async function loadMaps(): Promise<Gw2Map[]> {
  if (mapCache) {
    return mapCache;
  }

  const cachedMaps = await loadSqlCache(
    "official:maps",
    SQL_CACHE_TTL.staticCatalog,
    (value): value is Gw2Map[] => isArrayOf(value, isGw2Map),
  );
  if (cachedMaps) {
    mapCache = cachedMaps;
    return mapCache;
  }

  mapCache = await fetchJson<Gw2Map[]>(`${GW2_API}/maps?ids=all`);
  void saveSqlCache("official:maps", mapCache);
  return mapCache;
}

export async function loadListings(itemId: number): Promise<CommerceListings> {
  return fetchJson<CommerceListings>(`${GW2_API}/commerce/listings/${itemId}`);
}

export async function loadTransactionsForItem(
  apiKey: string,
  itemId: number,
): Promise<ItemTransactions> {
  const [currentBuys, currentSells, historyBuys, historySells] = await Promise.all([
    fetchAccountJson<AccountTransaction[]>(
      apiKey,
      "/commerce/transactions/current/buys",
      [],
    ),
    fetchAccountJson<AccountTransaction[]>(
      apiKey,
      "/commerce/transactions/current/sells",
      [],
    ),
    fetchAccountJson<AccountTransaction[]>(
      apiKey,
      "/commerce/transactions/history/buys",
      [],
    ),
    fetchAccountJson<AccountTransaction[]>(
      apiKey,
      "/commerce/transactions/history/sells",
      [],
    ),
  ]);

  const matching = (transaction: AccountTransaction) => transaction.item_id === itemId;

  return {
    currentBuys: currentBuys.filter(matching),
    currentSells: currentSells.filter(matching),
    historyBuys: historyBuys.filter(matching),
    historySells: historySells.filter(matching),
  };
}

export async function loadAchievementCatalog(
  onProgress?: ProgressCallback,
): Promise<AchievementCatalog> {
  if (achievementCatalogCache) {
    return achievementCatalogCache;
  }

  if (achievementCatalogPromise) {
    return achievementCatalogPromise;
  }

  achievementCatalogPromise = loadAchievementCatalogFresh(onProgress).finally(() => {
    achievementCatalogPromise = null;
  });

  return achievementCatalogPromise;
}

async function loadAchievementCatalogFresh(
  onProgress?: ProgressCallback,
): Promise<AchievementCatalog> {
  const cachedCatalog = await loadSqlCache(
    "official:achievement-catalog",
    SQL_CACHE_TTL.achievementCatalog,
    isAchievementCatalogPayload,
  );
  if (cachedCatalog) {
    achievementCatalogCache = hydrateAchievementCatalog(cachedCatalog);
    return achievementCatalogCache;
  }

  onProgress?.("Loading achievement groups");
  const [groups, categories] = await Promise.all([
    fetchJson<AchievementGroup[]>(`${GW2_API}/achievements/groups?ids=all`),
    fetchJson<AchievementCategory[]>(`${GW2_API}/achievements/categories?ids=all`),
  ]);
  const achievementIds = Array.from(
    new Set(categories.flatMap((category) => category.achievements)),
  ).sort((left, right) => left - right);
  const idChunks = chunk(achievementIds, CHUNK_SIZE);
  const achievements: Gw2Achievement[] = [];

  for (const [index, idChunk] of idChunks.entries()) {
    if (idChunk.length === 0) {
      continue;
    }

    onProgress?.("Loading achievement details", index + 1, idChunks.length);
    const batch = await fetchJson<Gw2Achievement[]>(
      `${GW2_API}/achievements?ids=${idChunk.join(",")}`,
    );
    achievements.push(...batch);
  }

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const achievementMap = new Map(achievements.map((achievement) => [achievement.id, achievement]));

  achievementCatalogCache = {
    groups: [...groups].sort((left, right) => left.order - right.order),
    categories: [...categories].sort((left, right) => left.order - right.order),
    achievements,
    groupMap,
    categoryMap,
    achievementMap,
  };

  void saveSqlCache("official:achievement-catalog", serializeAchievementCatalog(achievementCatalogCache));
  return achievementCatalogCache;
}

export async function loadRecipesForOutput(
  itemId: number,
  holdings = new Map<number, number>(),
): Promise<RecipeGuide[]> {
  if (itemId <= 0) {
    return [];
  }

  const cachedRecipes = recipeCache
    ? recipeCache.filter((recipe) => recipe.output_item_id === itemId)
    : [];
  let officialRecipes: Gw2Recipe[] = [];

  try {
    officialRecipes = await loadOfficialRecipesBySearch("output", itemId);
  } catch (error) {
    console.warn(`Official recipe output lookup failed for item ${itemId}`, error);
  }

  const wikiRecipes = (await loadWikiMysticForgeRecipes().catch(() => [])).filter(
    (recipe) => recipe.output_item_id === itemId,
  );
  const itemWikiRecipes = (await loadWikiMysticForgeRecipesForItem(itemId).catch(() => [])).filter(
    (recipe) => recipe.output_item_id === itemId,
  );
  const wikiUsageRecipes = (await loadWikiRecipeUsageForItem(itemId, undefined).catch(() => [])).filter(
    (recipe) => recipe.output_item_id === itemId,
  );
  const allRecipes = dedupeRecipes([
    ...officialRecipes,
    ...cachedRecipes,
    ...wikiRecipes,
    ...itemWikiRecipes,
    ...wikiUsageRecipes,
  ]);
  const ingredientIds = Array.from(
    new Set(allRecipes.flatMap((recipe) => recipe.ingredients.map((item) => item.item_id))),
  );
  await Promise.all([
    loadItems(ingredientIds),
    ensureCommercePricesForItems([itemId, ...ingredientIds]),
  ]);

  return allRecipes.map((recipe) => buildRecipeGuide(recipe, holdings));
}

export async function loadRecipesUsingItem(
  itemId: number,
  holdings = new Map<number, number>(),
): Promise<RecipeGuide[]> {
  if (itemId <= 0) {
    return [];
  }

  const cachedRecipes = recipeCache
    ? recipeCache.filter((recipe) =>
        recipe.ingredients.some((ingredient) => ingredient.item_id === itemId),
      )
    : [];
  let officialRecipes: Gw2Recipe[] = [];

  try {
    officialRecipes = await loadOfficialRecipesBySearch("input", itemId);
  } catch (error) {
    console.warn(`Official recipe input lookup failed for item ${itemId}`, error);
  }

  const wikiRecipes = (await loadWikiMysticForgeRecipes().catch(() => [])).filter((recipe) =>
    recipe.ingredients.some((ingredient) => ingredient.item_id === itemId),
  );
  const itemWikiRecipes = (await loadWikiMysticForgeRecipesForItem(itemId).catch(() => [])).filter((recipe) =>
    recipe.ingredients.some((ingredient) => ingredient.item_id === itemId),
  );
  const wikiUsageRecipes = (await loadWikiRecipeUsageForItem(itemId, undefined).catch(() => [])).filter((recipe) =>
    recipe.ingredients.some((ingredient) => ingredient.item_id === itemId),
  );
  const allRecipes = dedupeRecipes([
    ...officialRecipes,
    ...cachedRecipes,
    ...wikiRecipes,
    ...itemWikiRecipes,
    ...wikiUsageRecipes,
  ]);
  const linkedIds = Array.from(
    new Set([
      ...allRecipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.item_id)),
      ...allRecipes
        .map((recipe) => recipe.output_item_id)
        .filter((outputId): outputId is number => typeof outputId === "number"),
    ]),
  );
  await Promise.all([
    loadItems(linkedIds),
    ensureCommercePricesForItems(linkedIds),
  ]);

  return allRecipes.map((recipe) => buildRecipeGuide(recipe, holdings));
}

async function loadOfficialRecipesBySearch(
  searchKey: "input" | "output",
  itemId: number,
): Promise<Gw2Recipe[]> {
  const cacheKey = `official:recipes:${searchKey}:${itemId}`;
  const cachedRecipes = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.staticCatalog,
    (value): value is Gw2Recipe[] => isArrayOf(value, isGw2Recipe),
  );
  if (cachedRecipes) {
    mergeRecipesIntoCache(cachedRecipes);
    return cachedRecipes;
  }

  const recipeIds = await fetchJson<number[]>(
    `${GW2_API}/recipes/search?${searchKey}=${itemId}`,
  );
  const recipes = await loadRecipeDetailsByIds(recipeIds);
  mergeRecipesIntoCache(recipes);
  void saveSqlCache(cacheKey, recipes);
  return recipes;
}

async function loadRecipeDetailsByIds(recipeIds: number[]): Promise<Gw2Recipe[]> {
  const uniqueIds = Array.from(new Set(recipeIds)).filter((id) => Number.isFinite(id));
  if (uniqueIds.length === 0) {
    return [];
  }

  const batches = await mapWithConcurrency(
    chunk(uniqueIds, CHUNK_SIZE),
    RECIPE_DETAIL_CONCURRENCY,
    (recipeChunk) =>
      fetchJson<Gw2Recipe[]>(`${GW2_API}/recipes?ids=${recipeChunk.join(",")}`),
  );

  return batches.flat();
}

function mergeRecipesIntoCache(recipes: Gw2Recipe[]) {
  if (!recipeCache || recipes.length === 0) {
    return;
  }

  const recipesById = new Map(recipeCache.map((recipe) => [recipe.id, recipe]));
  for (const recipe of recipes) {
    recipesById.set(recipe.id, recipe);
  }

  recipeCache = Array.from(recipesById.values());
  void saveCachedRecipes(recipeCache);
}

function dedupeRecipes(recipes: Gw2Recipe[]): Gw2Recipe[] {
  const seen = new Set<string>();
  const result: Gw2Recipe[] = [];

  for (const recipe of recipes) {
    const key = `${recipe.output_item_id ?? "none"}:${recipe.ingredients
      .map((ingredient) => `${ingredient.item_id}x${ingredient.count}`)
      .sort()
      .join(",")}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(recipe);
  }

  return result;
}

function wikiGuideTitleLevel(title: string): number | null {
  const match = title.match(/\(level\s+(\d+)\)$/i);
  return match ? Number(match[1]) : null;
}

export async function loadWikiGuide(
  itemName: string,
  options: { level?: number; itemId?: number } = {},
): Promise<WikiGuide | null> {
  const normalizedLevel = options.level && options.level > 0 ? options.level : null;
  const cacheKey = getNamedCacheKey(
    "wiki:guide:v3",
    `${itemName}:${normalizedLevel ?? "any"}:${options.itemId ?? "any"}`,
  );
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiDerived, isWikiGuide);
  if (cached) {
    return cached;
  }

  const directGuide = await loadWikiGuidePage(itemName).catch(() => null);
  if (directGuide) {
    void saveSqlCache(cacheKey, directGuide);
    return directGuide;
  }

  const levelTitle = normalizedLevel ? `${itemName} (level ${normalizedLevel})` : "";
  const directLevelGuide = levelTitle ? await loadWikiGuidePage(levelTitle).catch(() => null) : null;
  if (directLevelGuide) {
    void saveSqlCache(cacheKey, directLevelGuide);
    return directLevelGuide;
  }

  const levelPages = levelTitle
    ? await searchWikiGuides(`intitle:"${levelTitle}"`, 6).catch(() => [])
    : [];
  const levelExact = levelTitle
    ? levelPages.find((page) => page.title.toLowerCase() === levelTitle.toLowerCase())
    : null;
  const pages = await searchWikiGuides(`intitle:"${itemName}"`, 8);
  const exact = pages.find((page) => page.title.toLowerCase() === itemName.toLowerCase());
  const preferredLevel = normalizedLevel
    ? pages.find((page) => wikiGuideTitleLevel(page.title) === normalizedLevel)
    : null;
  const withoutWrongLevel = normalizedLevel
    ? pages.find((page) => {
        const titleLevel = wikiGuideTitleLevel(page.title);
        return titleLevel === null || titleLevel === normalizedLevel;
      })
    : null;
  const guide = exact ?? levelExact ?? preferredLevel ?? withoutWrongLevel ?? pages[0] ?? null;
  if (guide) {
    void saveSqlCache(cacheKey, guide);
  }
  return guide;
}

export async function loadWikiItemFallback(itemName: string): Promise<Gw2Item | null> {
  const normalizedName = normalizeWikiLookupName(itemName);
  const cacheKey = getNamedCacheKey("wiki:item-fallback:v2", normalizedName);
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiDerived, isGw2Item);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    action: "query",
    titles: itemName,
    prop: "extracts|info|pageimages",
    exintro: "1",
    explaintext: "1",
    inprop: "url",
    piprop: "thumbnail|original",
    pithumbsize: "96",
    redirects: "1",
    origin: "*",
    format: "json",
  });
  const payload = await fetchJson<{
    query?: {
      pages?: Record<
        string,
        {
          title: string;
          extract?: string;
          missing?: string;
          thumbnail?: { source?: string };
          original?: { source?: string };
        }
      >;
    };
  }>(`${WIKI_API}?${params.toString()}`);

  const page = Object.values(payload.query?.pages ?? {}).find((candidate) => !candidate.missing);
  if (!page) {
    return null;
  }

  const infobox = await loadWikiItemInfobox(page.title).catch(() => null);
  const infoboxIcon = infobox?.icon ? await loadWikiFileImageUrl(infobox.icon).catch(() => null) : null;
  const parsedItemId = infobox?.id ? Number.parseInt(infobox.id, 10) : NaN;
  const item: Gw2Item = {
    id: Number.isFinite(parsedItemId) && parsedItemId > 0 ? parsedItemId : wikiFallbackItemId(page.title),
    name: page.title,
    icon: page.thumbnail?.source ?? page.original?.source ?? infoboxIcon ?? undefined,
    description: page.extract || infobox?.description || "",
    type: infobox?.type ?? "Wiki",
    rarity: infobox?.rarity ?? "Basic",
    level: 0,
    vendor_value: 0,
    flags: ["WikiOnly"],
    game_types: [],
    restrictions: [],
    details: {
      source: "Guild Wars 2 Wiki",
      lookupName: itemName,
    },
  };

  void saveSqlCache(cacheKey, item);
  return item;
}

async function loadWikiItemInfobox(title: string): Promise<{
  icon?: string;
  id?: string;
  type?: string;
  rarity?: string;
  description?: string;
} | null> {
  const cacheKey = getNamedCacheKey("wiki:item-infobox:v1", normalizeWikiLookupName(title));
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiDerived, isPlainRecord);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "wikitext",
    redirects: "1",
    origin: "*",
    format: "json",
  });
  const payload = await fetchJson<{ parse?: { wikitext?: { "*": string } } }>(`${WIKI_API}?${params.toString()}`);
  const wikitext = payload.parse?.wikitext?.["*"] ?? "";
  const result = {
    icon: getWikiTemplateField(wikitext, "icon"),
    id: getWikiTemplateField(wikitext, "id"),
    type: getWikiTemplateField(wikitext, "type"),
    rarity: getWikiTemplateField(wikitext, "rarity"),
    description: stripWikiMarkup(getWikiTemplateField(wikitext, "description") ?? ""),
  };
  const infobox = Object.values(result).some(Boolean) ? result : null;
  if (infobox) {
    void saveSqlCache(cacheKey, infobox);
  }
  return infobox;
}

async function loadWikiFileImageUrl(fileName: string): Promise<string | null> {
  const cleanFileName = fileName.replace(/^File:/i, "").trim();
  if (!cleanFileName) {
    return null;
  }

  const cacheKey = getNamedCacheKey("wiki:file-image:v1", normalizeWikiLookupName(cleanFileName));
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiDerived, (value): value is string => typeof value === "string");
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    action: "query",
    titles: `File:${cleanFileName}`,
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "96",
    origin: "*",
    format: "json",
  });
  const payload = await fetchJson<{
    query?: {
      pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; url?: string }> }>;
    };
  }>(`${WIKI_API}?${params.toString()}`);
  const imageUrl =
    Object.values(payload.query?.pages ?? {})
      .flatMap((page) => page.imageinfo ?? [])
      .map((image) => image.thumburl ?? image.url)
      .find(Boolean) ?? null;

  if (imageUrl) {
    void saveSqlCache(cacheKey, imageUrl);
  }
  return imageUrl;
}

function getWikiTemplateField(wikitext: string, fieldName: string): string | undefined {
  const pattern = new RegExp(`^\\s*\\|\\s*${escapeRegExp(fieldName)}\\s*=\\s*([^\\n]+)`, "im");
  const value = pattern.exec(wikitext)?.[1]?.trim();
  return value ? value.replace(/<!--.*?-->/g, "").trim() : undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isPlainRecord(value: unknown): value is Record<string, string | undefined> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function wikiFallbackItemId(itemName: string): number {
  let hash = 0;
  for (const char of normalizeWikiLookupName(itemName)) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  }
  return -1_000_000 - Math.abs(hash % 8_000_000);
}

async function loadWikiGuidePage(title: string): Promise<WikiGuide | null> {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    inprop: "url",
    redirects: "1",
    origin: "*",
    format: "json",
  });

  const payload = await fetchJson<{
    query?: {
      pages?: Record<string, { title: string; extract?: string; fullurl?: string; missing?: string }>;
    };
  }>(`${WIKI_API}?${params.toString()}`);
  const page = Object.values(payload.query?.pages ?? {}).find((candidate) => !candidate.missing && candidate.fullurl);
  return page
    ? {
        title: page.title,
        extract: page.extract ?? "",
        url: page.fullurl!,
      }
    : null;
}

export async function loadWikiItemAcquisition(itemName: string): Promise<WikiItemAcquisition | null> {
  const cacheKey = normalizeWikiLookupName(itemName);
  if (wikiAcquisitionCache.has(cacheKey)) {
    return wikiAcquisitionCache.get(cacheKey) ?? null;
  }

  const persistentCacheKey = getNamedCacheKey("wiki:item-acquisition:v3", itemName);
  const cached = await loadSqlCache(
    persistentCacheKey,
    SQL_CACHE_TTL.wikiDerived,
    isWikiItemAcquisition,
  );
  if (cached) {
    wikiAcquisitionCache.set(cacheKey, cached);
    return cached;
  }

  const [wikiPage, wikitext] = await Promise.all([
    loadWikiHtml(itemName),
    loadWikiWikitext(itemName).catch(() => ""),
  ]);

  if (!wikiPage) {
    wikiAcquisitionCache.set(cacheKey, null);
    return null;
  }

  const document = new DOMParser().parseFromString(wikiPage.html, "text/html");
  const vendorOffers = dedupeWikiVendorOffers([
    ...parseRenderedVendorOffers(document, wikiPage.url),
    ...parseWikitextVendorOffers(wikitext, wikiPage.url),
  ]);
  const acquisitionNotes = parseWikitextAcquisitionNotes(wikitext);
  const teachesRecipe =
    parseRenderedTeachesRecipe(document) ?? parseWikitextTeachesRecipe(wikitext);

  const acquisition: WikiItemAcquisition = {
    itemName: wikiPage.title,
    sourceUrl: wikiPage.url,
    vendorOffers,
    acquisitionNotes,
    teachesRecipe,
  };

  wikiAcquisitionCache.set(cacheKey, acquisition);
  void saveSqlCache(persistentCacheKey, acquisition);
  return acquisition;
}

function parseRenderedVendorOffers(document: Document, sourceUrl: string): WikiVendorOffer[] {
  const acquisitionElements = sectionAfterHeadline(document, "Acquisition");
  const tables = acquisitionElements.flatMap((element) =>
    Array.from(element.matches("table") ? [element] : element.querySelectorAll("table")),
  );
  const offers: WikiVendorOffer[] = [];

  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll("tr:first-child th")).map((header) =>
      normalizePlainText(header.textContent ?? "").toLowerCase(),
    );
    const costIndex = headers.findIndex((header) => /cost|price/.test(header));
    if (costIndex < 0) {
      continue;
    }

    const rows = Array.from(table.querySelectorAll("tr")).slice(1);
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length === 0 || costIndex >= cells.length) {
        continue;
      }

      const costCell = cells[costIndex];
      const priceElements = Array.from(costCell.querySelectorAll<HTMLElement>(".price[data-sort-value]"));
      const cost = priceElements.reduce((sum, element) => {
        const value = Number(element.dataset.sortValue);
        return Number.isFinite(value) ? sum + value : sum;
      }, 0);
      const costCurrencies = parseRenderedCurrencyCosts(costCell);
      if (cost <= 0 && costCurrencies.length === 0) {
        continue;
      }

      const vendorCell = cells[0];
      const vendorLink = getFirstUsefulWikiLink(vendorCell);
      const vendor = vendorLink?.title || normalizePlainText(vendorCell.textContent ?? "") || "Vendor";
      offers.push({
        vendor,
        vendorUrl: vendorLink?.url,
        area: cells[1] ? normalizePlainText(cells[1].textContent ?? "") : undefined,
        zone: cells[2] ? normalizePlainText(cells[2].textContent ?? "") : undefined,
        cost,
        costCurrencies,
        quantity: 1,
        costText: formatRenderedVendorCost(costCurrencies, cost, normalizePlainText(costCell.textContent ?? "")),
        sourceUrl,
      });
    }
  }

  return offers;
}

function parseRenderedCurrencyCosts(element: Element): Array<{ name: string; amount: number }> {
  const currencies: Array<{ name: string; amount: number }> = [];
  let pendingAmount: number | null = null;

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const matches = Array.from((node.textContent ?? "").matchAll(/(\d[\d,]*)/g));
      if (matches.length) {
        pendingAmount = Number(matches[matches.length - 1][1].replace(/,/g, ""));
      }
      return;
    }

    if (!(node instanceof Element)) {
      return;
    }

    const title = node instanceof HTMLAnchorElement ? node.getAttribute("title") ?? "" : "";
    const currencyName = normalizeRenderedCurrencyTitle(title);
    if (currencyName && pendingAmount !== null) {
      currencies.push({ name: currencyName, amount: pendingAmount });
      pendingAmount = null;
      return;
    }

    for (const child of Array.from(node.childNodes)) {
      visit(child);
    }
  };

  for (const child of Array.from(element.childNodes)) {
    visit(child);
  }

  return currencies;
}

function normalizeRenderedCurrencyTitle(title: string): string | null {
  const normalized = title.trim();
  if (!normalized || /coin$/i.test(normalized)) {
    return null;
  }

  return normalized;
}

function formatRenderedVendorCost(currencies: Array<{ name: string; amount: number }>, coin: number, fallback: string): string {
  const parts = [
    ...currencies.map((currency) => `${currency.amount.toLocaleString()} ${currency.name}`),
    coin > 0 ? formatCoinCostText(coin) : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length ? parts.join(" + ") : fallback;
}

function formatCoinCostText(value: number): string {
  const gold = Math.floor(value / 10_000);
  const silver = Math.floor((value % 10_000) / 100);
  const copper = value % 100;
  const parts = [];

  if (gold) {
    parts.push(`${gold.toLocaleString()} gold`);
  }
  if (silver) {
    parts.push(`${silver} silver`);
  }
  if (copper || parts.length === 0) {
    parts.push(`${copper} copper`);
  }

  return parts.join(" ");
}

function parseWikitextVendorOffers(wikitext: string, sourceUrl: string): WikiVendorOffer[] {
  return getWikitextSection(wikitext, "Acquisition")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("*") && /vendor|sold|purchased|craftsman/i.test(line))
    .map((line): WikiVendorOffer | null => {
      const cost = parseCoinCostFromText(line);
      if (!cost) {
        return null;
      }

      const quantity = parseVendorQuantity(line);
      const vendor = getWikiLinkTitle(line) || "Vendor";
      return {
        vendor,
        vendorUrl: vendor !== "Vendor" ? wikiPageUrl(vendor) : undefined,
        cost,
        quantity,
        costText: stripWikiMarkup(line.replace(/^\*+\s*/, "")),
        sourceUrl,
      };
    })
    .filter((offer): offer is WikiVendorOffer => Boolean(offer));
}

function parseWikitextAcquisitionNotes(wikitext: string): string[] {
  return getWikitextSection(wikitext, "Acquisition")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("*"))
    .map((line) => stripWikiMarkup(line.replace(/^\*+\s*/, "")))
    .filter((line) => line.length > 0)
    .slice(0, 6);
}

function parseRenderedTeachesRecipe(document: Document): WikiRecipeUnlock | undefined {
  const elements = sectionAfterHeadline(document, "Teaches_recipe", { stopAtSubheading: true });
  for (const element of elements) {
    const link = getFirstUsefulWikiLink(element);
    if (link) {
      return {
        title: link.title,
        url: link.url,
      };
    }
  }

  return undefined;
}

function parseWikitextTeachesRecipe(wikitext: string): WikiRecipeUnlock | undefined {
  const section = getWikitextSection(wikitext, "Teaches recipe");
  const linkMatch = section.match(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?]]/);
  const title = linkMatch?.[1]?.replace(/\s+/g, " ").trim();
  if (!title) {
    return undefined;
  }

  return {
    title,
    url: wikiPageUrl(title),
  };
}

function getWikitextSection(wikitext: string, heading: string): string {
  const pattern = new RegExp(`^==\\s*${escapeRegex(heading)}\\s*==\\s*$`, "im");
  const match = pattern.exec(wikitext);
  if (!match) {
    return "";
  }

  const start = match.index + match[0].length;
  const rest = wikitext.slice(start);
  const nextHeading = rest.search(/^==[^=].*==\s*$/m);
  return nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
}

function parseCoinCostFromText(text: string): Coin | null {
  const coinTemplate = text.match(/\{\{\s*coin\s*\|\s*([\d,]+)\s*}}/i);
  if (coinTemplate) {
    return Number(coinTemplate[1].replace(/,/g, ""));
  }

  let total = 0;
  const gold = text.match(/([\d,.]+)\s*\{\{\s*gold\s*}}/i);
  const silver = text.match(/([\d,.]+)\s*\{\{\s*silver\s*}}/i);
  const copper = text.match(/([\d,.]+)\s*\{\{\s*copper\s*}}/i);
  if (gold) {
    total += Math.round(Number(gold[1].replace(/,/g, "")) * 10000);
  }
  if (silver) {
    total += Math.round(Number(silver[1].replace(/,/g, "")) * 100);
  }
  if (copper) {
    total += Math.round(Number(copper[1].replace(/,/g, "")));
  }

  return total > 0 ? total : null;
}

function parseVendorQuantity(text: string): number {
  const perMatch = text.match(/\bper\s+([\d,]+)/i);
  if (perMatch) {
    return Math.max(1, Number(perMatch[1].replace(/,/g, "")));
  }

  return 1;
}

function dedupeWikiVendorOffers(offers: WikiVendorOffer[]): WikiVendorOffer[] {
  const seen = new Set<string>();
  const result: WikiVendorOffer[] = [];

  for (const offer of offers) {
    const key = [
      normalizeWikiLookupName(offer.vendor),
      normalizeWikiLookupName(offer.area ?? ""),
      normalizeWikiLookupName(offer.zone ?? ""),
      offer.cost,
      (offer.costCurrencies ?? []).map((currency) => `${normalizeWikiLookupName(currency.name)}:${currency.amount}`).join(","),
      offer.quantity,
    ].join("|");
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(offer);
  }

  return result.sort((left, right) => left.cost / left.quantity - right.cost / right.quantity);
}

function normalizePlainText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function getFirstUsefulWikiLink(element: Element): { title: string; url: string } | null {
  const link = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[title]")).find((item) => {
    const title = item.getAttribute("title") ?? "";
    return title && !title.startsWith("File:") && !GENERIC_WIKI_TITLES.has(title);
  });

  const title = link?.getAttribute("title")?.replace(/\s+/g, " ").trim();
  if (!link || !title) {
    return null;
  }

  return {
    title,
    url: new URL(link.getAttribute("href") ?? wikiPageUrl(title), "https://wiki.guildwars2.com").toString(),
  };
}

function stripWikiMarkup(text: string): string {
  return text
    .replace(/\{\{\s*coin\s*\|\s*([\d,]+)\s*}}/gi, (_, value: string) => `${value} coin`)
    .replace(/\{\{\s*gold\s*}}/gi, "gold")
    .replace(/\{\{\s*silver\s*}}/gi, "silver")
    .replace(/\{\{\s*copper\s*}}/gi, "copper")
    .replace(/\{\{[^}|]+\|([^}]+)}}/g, "$1")
    .replace(/\{\{[^}]+}}/g, "")
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?\|([^\]]+)]]/g, "$2")
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?]]/g, "$1")
    .replace(/'{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchWikiGuides(query: string, limit = 6): Promise<WikiGuide[]> {
  const cacheKey = getNamedCacheKey("wiki:search", `${limit}:${query}`);
  const cached = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is WikiGuide[] => isArrayOf(value, isWikiGuide),
  );
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "0",
    gsrlimit: String(limit),
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    inprop: "url",
    redirects: "1",
    origin: "*",
    format: "json",
  });

  const payload = await fetchJson<{
    query?: {
      pages?: Record<string, { title: string; extract?: string; fullurl?: string }>;
    };
  }>(`${WIKI_API}?${params.toString()}`);

  const guides = Object.values(payload.query?.pages ?? {})
    .filter((page) => Boolean(page.fullurl))
    .map((page) => ({
      title: page.title,
      extract: page.extract ?? "",
      url: page.fullurl!,
    }));
  void saveSqlCache(cacheKey, guides);
  return guides;
}

async function loadWikiHtml(page: string): Promise<{ title: string; html: string; url: string } | null> {
  const memoryKey = normalizeWikiLookupName(page);
  if (wikiHtmlMemoryCache.has(memoryKey)) {
    return wikiHtmlMemoryCache.get(memoryKey) ?? null;
  }
  const inflight = wikiHtmlInflightCache.get(memoryKey);
  if (inflight) {
    return inflight;
  }

  const promise = loadWikiHtmlUncached(page)
    .then((result) => {
      wikiHtmlMemoryCache.set(memoryKey, result);
      return result;
    })
    .finally(() => {
      wikiHtmlInflightCache.delete(memoryKey);
    });
  wikiHtmlInflightCache.set(memoryKey, promise);
  return promise;
}

async function loadWikiHtmlUncached(page: string): Promise<{ title: string; html: string; url: string } | null> {
  const cacheKey = getNamedCacheKey("wiki:html", page);
  const cached = await loadSqlCache(cacheKey, SQL_CACHE_TTL.wikiPage, isWikiHtmlPage);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    action: "parse",
    page,
    prop: "text|displaytitle",
    redirects: "1",
    origin: "*",
    format: "json",
  });

  try {
    const payload = await fetchJson<{
      parse?: {
        title: string;
        displaytitle?: string;
        text?: {
          "*": string;
        };
      };
      error?: {
        code: string;
        info: string;
      };
    }>(`${WIKI_API}?${params.toString()}`);

    if (!payload.parse?.text?.["*"]) {
      return null;
    }

    const wikiPage = {
      title: payload.parse.title,
      html: payload.parse.text["*"],
      url: `https://wiki.guildwars2.com/wiki/${encodeURIComponent(payload.parse.title).replace(/%20/g, "_")}`,
    };
    void saveSqlCache(cacheKey, wikiPage);
    return wikiPage;
  } catch (error) {
    console.warn(`Wiki page failed: ${page}`, error);
    return null;
  }
}

async function loadWizardVaultEasyObjectives(): Promise<WizardVaultEasyObjectiveEntry[]> {
  const cachedEntries = await loadSqlCache(
    "wiki:wizard-vault-easy-objectives",
    SQL_CACHE_TTL.wikiDerived,
    (value): value is WizardVaultEasyObjectiveEntry[] =>
      isArrayOf(value, isWizardVaultEasyObjectiveEntry),
  );
  if (cachedEntries) {
    return cachedEntries;
  }

  const page = await loadWikiHtml("Wizard's Vault/Easy objectives");
  if (!page) {
    return [];
  }

  const document = new DOMParser().parseFromString(page.html, "text/html");
  const entries = [
    ...parseWizardVaultEasyObjectiveSection(document, "Daily", page.url),
    ...parseWizardVaultEasyObjectiveSection(document, "Weekly", page.url),
  ];
  void saveSqlCache("wiki:wizard-vault-easy-objectives", entries);
  return entries;
}

function parseWizardVaultEasyObjectiveSection(
  document: Document,
  schedule: "Daily" | "Weekly",
  sourceUrl: string,
): WizardVaultEasyObjectiveEntry[] {
  const elements = sectionAfterHeadline(document, schedule, { stopAtSubheading: true });
  const table = elements.find((element) => element.matches("table")) ??
    elements.flatMap((element) => Array.from(element.querySelectorAll("table")))[0];
  if (!table) {
    return [];
  }

  const entries = new Map<string, WizardVaultEasyObjectiveEntry>();
  let currentTitle = "";

  for (const row of Array.from(table.querySelectorAll("tr"))) {
    const cells = Array.from(row.children).filter((cell) => cell.tagName.toLowerCase() === "td");
    if (cells.length < 2) {
      continue;
    }

    let title = currentTitle;
    let locationCell: Element | undefined;
    let noteCell: Element | undefined;

    if (cells.length >= 3) {
      title = getCleanElementText(cells[0]);
      currentTitle = title || currentTitle;
      locationCell = cells[1];
      noteCell = cells[2];
    } else if (currentTitle) {
      locationCell = cells[0];
      noteCell = cells[1];
    }

    const normalizedTitle = normalizePlainText(title);
    if (!normalizedTitle || !locationCell || !noteCell) {
      continue;
    }

    const location = getCleanElementText(locationCell);
    const note = simplifyWizardVaultEasyNote(getCleanElementText(noteCell));
    const route: WizardVaultEasyObjectiveRoute = {
      location,
      note,
      chatLinks: Array.from(new Set([
        ...extractGw2ChatLinksFromGameLinkElements(locationCell),
        ...extractGw2ChatLinksFromGameLinkElements(noteCell),
      ])),
      wikiLinks: dedupeWikiGuides([
        ...extractWikiLinksFromElement(locationCell),
        ...extractWikiLinksFromElement(noteCell),
      ]).slice(0, 8),
    };
    if (!route.location && !route.note) {
      continue;
    }

    const key = normalizeWizardVaultObjectiveForMatch(normalizedTitle);
    const existing = entries.get(key);
    if (existing) {
      existing.routes.push(route);
    } else {
      entries.set(key, {
        schedule,
        title: normalizedTitle,
        sourceUrl,
        routes: [route],
      });
    }
  }

  return Array.from(entries.values());
}

function getCleanElementText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll("script, style, noscript, input.chatlink, .gamelink, img").forEach((node) => {
    node.remove();
  });

  return normalizePlainText(clone.textContent ?? "")
    .replace(/\s+—\s*$/g, "")
    .replace(/^—\s+/g, "")
    .trim();
}

function extractWikiLinksFromElement(element: Element): WikiGuide[] {
  return Array.from(element.querySelectorAll<HTMLAnchorElement>("a[title][href]"))
    .map((link): WikiGuide | null => {
      const title = link.getAttribute("title")?.replace(/\s+/g, " ").trim();
      const href = link.getAttribute("href");
      if (
        !title ||
        !href ||
        title.startsWith("File:") ||
        title.startsWith("Category:") ||
        GENERIC_WIKI_TITLES.has(title)
      ) {
        return null;
      }

      return {
        title,
        extract: "Linked from the GW2 Wiki easy objective notes.",
        url: new URL(href, "https://wiki.guildwars2.com").toString(),
      };
    })
    .filter((guide): guide is WikiGuide => Boolean(guide));
}

function extractGw2ChatLinksFromGameLinkElements(element: Element): string[] {
  const links = extractGw2ChatLinks(element.innerHTML);
  for (const gameLink of Array.from(element.querySelectorAll<HTMLElement>(".gamelink[data-type][data-id]"))) {
    const chatLink = buildGw2ChatLink(
      gameLink.dataset.type ?? "",
      Number(gameLink.dataset.id),
    );
    if (chatLink) {
      links.push(chatLink);
    }
  }

  return Array.from(new Set(links));
}

function buildGw2ChatLink(type: string, rawId: number): string | null {
  const typeId = {
    item: 2,
    text: 3,
    map: 4,
    skill: 6,
    trait: 7,
    recipe: 9,
    skin: 10,
    outfit: 11,
  }[type.trim().toLowerCase()];
  if (!typeId || !Number.isFinite(rawId) || rawId <= 0) {
    return null;
  }

  let id = Math.floor(rawId);
  const bytes: number[] = [];
  while (id > 0) {
    bytes.push(id & 255);
    id >>= 8;
  }

  while (bytes.length < 4 || bytes.length % 2 !== 0) {
    bytes.push(0);
  }

  if (typeId === 2) {
    bytes.unshift(1);
  }
  bytes.unshift(typeId);

  return `[&${btoa(String.fromCharCode(...bytes))}]`;
}

function findWizardVaultEasyObjectiveMatch(
  objectiveTitle: string,
  entries: WizardVaultEasyObjectiveEntry[],
): WizardVaultEasyObjectiveEntry | null {
  const scored = entries
    .map((entry) => ({
      entry,
      score: scoreWizardVaultEasyObjectiveMatch(objectiveTitle, entry.title),
    }))
    .filter((item) => item.score >= 42)
    .sort((left, right) => right.score - left.score);

  return scored[0]?.entry ?? null;
}

function scoreWizardVaultEasyObjectiveMatch(objectiveTitle: string, easyTitle: string): number {
  const objective = normalizeWizardVaultObjectiveForMatch(objectiveTitle);
  const easy = normalizeWizardVaultObjectiveForMatch(easyTitle);
  if (!objective || !easy) {
    return 0;
  }

  if (objective === easy) {
    return 100;
  }

  const objectiveNoNumbers = objective.replace(/\b\d+\b/g, "#");
  const easyNoNumbers = easy.replace(/\b\d+\b/g, "#");
  if (objectiveNoNumbers === easyNoNumbers) {
    return 92;
  }

  if (objective.includes(easy) || easy.includes(objective)) {
    return 78;
  }

  const objectiveTokens = getWizardVaultEasyObjectiveTokens(objectiveTitle);
  const easyTokens = getWizardVaultEasyObjectiveTokens(easyTitle);
  if (objectiveTokens.length === 0 || easyTokens.length === 0) {
    return 0;
  }

  const easyTokenSet = new Set(easyTokens);
  const overlap = objectiveTokens.filter((token) => easyTokenSet.has(token)).length;
  const coverage = overlap / Math.max(1, objectiveTokens.length);
  const countBonus = getWizardVaultObjectiveCount(objectiveTitle) === getWizardVaultObjectiveCount(easyTitle) ? 8 : 0;
  const actionBonus = objectiveTokens[0] === easyTokens[0] ? 8 : 0;
  return coverage * 70 + countBonus + actionBonus;
}

function normalizeWizardVaultObjectiveForMatch(title: string): string {
  return title
    .replace(/&amp;/g, "&")
    .replace(/—/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getWizardVaultEasyObjectiveTokens(title: string): string[] {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "any",
    "by",
    "in",
    "of",
    "or",
    "the",
    "to",
    "while",
    "with",
    "using",
    "use",
    "rank",
    "enemy",
    "enemies",
    "objective",
    "objectives",
  ]);

  return Array.from(
    new Set(
      normalizeWizardVaultObjectiveForMatch(title)
        .split(/\s+/)
        .filter((token) => token.length > 1 && !stopWords.has(token)),
    ),
  );
}

function simplifyWizardVaultEasyNote(note: string): string {
  const cleaned = note
    .replace(/\[\d+]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= 220) {
    return cleaned;
  }

  const sentence = cleaned.match(/^.{80,220}?[.!?](?:\s|$)/)?.[0]?.trim();
  return sentence ?? `${cleaned.slice(0, 217).trim()}...`;
}

function buildWizardVaultEasySummary(entry: WizardVaultEasyObjectiveEntry): string {
  const firstRoute = entry.routes[0];
  const routeLead = firstRoute?.location || firstRoute?.note;
  return routeLead
    ? `Easy ${entry.schedule.toLowerCase()} route from the GW2 Wiki: ${routeLead}.`
    : `Easy ${entry.schedule.toLowerCase()} route from the GW2 Wiki.`;
}

function buildWizardVaultEasySteps(entry: WizardVaultEasyObjectiveEntry): string[] {
  const steps = entry.routes.slice(0, 4).map((route) => {
    if (route.location && route.note) {
      return `${route.location}: ${route.note}`;
    }

    if (route.location) {
      return `Go to ${route.location}.`;
    }

    return route.note;
  });

  if (entry.routes.length > steps.length) {
    steps.push(`The Easy objectives wiki page lists ${entry.routes.length - steps.length} more route option${entry.routes.length - steps.length === 1 ? "" : "s"}.`);
  }

  return steps;
}

export async function loadWizardVaultObjectiveGuide(
  objectiveTitle: string,
  track: string,
): Promise<WizardVaultObjectiveGuide> {
  const cacheKey = getNamedCacheKey("wiki:wizard-vault-objective-guide", `${track}:${objectiveTitle}`);
  const cachedGuide = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wizardVaultGuide,
    isWizardVaultObjectiveGuide,
  );
  if (cachedGuide) {
    return cachedGuide;
  }

  const searchTerms = buildWizardVaultObjectiveSearchTerms(objectiveTitle, track);
  const [searchResults, easyObjectives] = await Promise.all([
    mapWithConcurrency(searchTerms, 2, (term) =>
      searchWikiGuides(term, 5).catch(() => []),
    ),
    loadWizardVaultEasyObjectives().catch(() => []),
  ]);
  const easyMatch = findWizardVaultEasyObjectiveMatch(objectiveTitle, easyObjectives);
  const easyWikiLinks = easyMatch
    ? dedupeWikiGuides([
        {
          title: "Wizard's Vault/Easy objectives",
          extract: "GW2 Wiki source for short Wizard's Vault routes and waypoint suggestions.",
          url: easyMatch.sourceUrl,
        },
        ...easyMatch.routes.flatMap((route) => route.wikiLinks),
      ]).slice(0, 10)
    : [];
  const wikiLinks = dedupeWikiGuides([
    ...easyWikiLinks,
    ...filterWizardVaultWikiLinks(objectiveTitle, dedupeWikiGuides(searchResults.flat())),
  ]).slice(0, 10);
  const htmlPages = await mapWithConcurrency(wikiLinks.slice(0, 4), 2, (guide) =>
    loadWikiHtml(guide.title).catch(() => null),
  );
  const chatLinks = Array.from(
    new Set(
      [
        ...(easyMatch?.routes.flatMap((route) => route.chatLinks) ?? []),
        ...htmlPages
        .filter((page): page is { title: string; html: string; url: string } => Boolean(page))
        .flatMap((page) => extractGw2ChatLinks(page.html)),
      ],
    ),
  ).slice(0, 12);

  const guide = {
    objectiveTitle,
    track,
    summary: easyMatch
      ? buildWizardVaultEasySummary(easyMatch)
      : buildWizardVaultObjectiveSummary(objectiveTitle, track),
    steps: easyMatch
      ? buildWizardVaultEasySteps(easyMatch)
      : buildWizardVaultObjectiveSteps(objectiveTitle, track, wikiLinks),
    wikiLinks,
    chatLinks,
    searchTerms,
  };
  void saveSqlCache(cacheKey, guide);
  return guide;
}

function buildWizardVaultObjectiveSummary(title: string, track: string): string {
  const normalizedTitle = title.toLowerCase();
  const normalizedTrack = normalizeWizardVaultTrack(track);
  const count = getWizardVaultObjectiveCount(title);
  const trackSuffix = normalizedTrack === "PvE" ? " on an eligible PvE map" : "";

  if (/^log in\b/.test(normalizedTitle)) {
    return "Log into any character. The objective should complete as soon as the account enters the game.";
  }

  if (/combo/.test(normalizedTitle)) {
    return `${count ? `Trigger ${count}` : "Trigger"} combo ${count === 1 ? "skill" : "skills"}: place a combo field, then use a finisher inside it.`;
  }

  if (/gather|harvest|mine|\blog\b/.test(normalizedTitle)) {
    if (/logging axe/.test(normalizedTitle)) {
      return `${count ? `Cut ${count}` : "Cut"} wood resource nodes with a logging axe${trackSuffix}.`;
    }

    if (/mining pick/.test(normalizedTitle)) {
      return `${count ? `Mine ${count}` : "Mine"} ore resource nodes with a mining pick${trackSuffix}.`;
    }

    if (/harvesting sickle/.test(normalizedTitle)) {
      return `${count ? `Harvest ${count}` : "Harvest"} plant resource nodes with a harvesting sickle${trackSuffix}.`;
    }

    return `${count ? `Gather ${count}` : "Gather"} resource nodes${trackSuffix}.`;
  }

  if (/defeat|kill/.test(normalizedTitle)) {
    return `${count ? `Defeat ${count}` : "Defeat the required"} enemies or named targets${trackSuffix}. Tagging enemies is enough if you receive credit.`;
  }

  if (/complete.*event|events? in|meta/.test(normalizedTitle)) {
    return `${count ? `Complete ${count}` : "Complete the required"} dynamic events or meta-event steps${trackSuffix}.`;
  }

  if (/world boss|boss/.test(normalizedTitle)) {
    return "Join the named boss or event before it starts, tag the target, and stay until the reward credit appears.";
  }

  if (/craft/.test(normalizedTitle)) {
    return `${count ? `Craft ${count}` : "Craft the required"} valid items at the matching crafting station.`;
  }

  if (/salvage/.test(normalizedTitle)) {
    return `${count ? `Salvage ${count}` : "Salvage the required"} items with an appropriate salvage kit.`;
  }

  if (/identify|unidentified/.test(normalizedTitle)) {
    return `${count ? `Open ${count}` : "Open the required"} unidentified gear items from inventory.`;
  }

  if (/dodge/.test(normalizedTitle)) {
    return `${count ? `Dodge ${count}` : "Dodge the required"} attacks in combat.`;
  }

  if (/breakbar|defiance/.test(normalizedTitle)) {
    return "Use crowd-control skills on enemies with breakbars until the objective updates.";
  }

  if (/boon|condition/.test(normalizedTitle)) {
    return "Apply the required boons or conditions during combat until the tracker completes.";
  }

  if (normalizedTrack === "WvW") {
    return "Complete the named objective in World vs. World, preferably while following an active commander or squad.";
  }

  if (normalizedTrack === "PvP") {
    return "Finish the named PvP objective in a full match. Stay focused on map objectives for the fastest credit.";
  }

  return ensureSentence(title);
}

function getWizardVaultObjectiveCount(title: string): number | null {
  const match = title.match(/\b\d+\b/);
  return match ? Number(match[0]) : null;
}

function ensureSentence(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildWizardVaultObjectiveSearchTerms(title: string, track: string): string[] {
  const cleanedTitle = title.replace(/\s+/g, " ").trim();
  const target = cleanedTitle
    .replace(/^wizard'?s vault:\s*/i, "")
    .replace(/^(complete|defeat|earn|gain|capture|participate in|win|play|gather|harvest|mine|log|craft|salvage|identify|dodge|use)\s+/i, "")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const trackHint =
    normalizeWizardVaultTrack(track) === "WvW"
      ? "World versus World"
      : normalizeWizardVaultTrack(track) === "PvP"
        ? "Structured PvP"
        : "Guild Wars 2";

  return Array.from(
    new Set(
      [cleanedTitle, target, `${target} ${trackHint}`, `${cleanedTitle} Wizard's Vault`]
        .map((term) => term.trim())
        .filter((term) => term.length > 2),
    ),
  ).slice(0, 4);
}

function dedupeWikiGuides(guides: WikiGuide[]): WikiGuide[] {
  const seen = new Set<string>();
  const result: WikiGuide[] = [];

  for (const guide of guides) {
    const key = guide.url || guide.title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(guide);
  }

  return result;
}

function filterWizardVaultWikiLinks(title: string, guides: WikiGuide[]): WikiGuide[] {
  const tokens = getWizardVaultGuideTokens(title);
  const scored = guides
    .map((guide, index) => {
      const haystackTitle = guide.title.toLowerCase();
      const haystackExtract = guide.extract.toLowerCase();
      const blocked =
        /\/history\b|game updates|list of objectives|wizard'?s vault\/research/i.test(guide.title) ||
        /list of wizard'?s vault objectives/i.test(guide.extract);
      const tokenScore = tokens.reduce((score, token) => {
        if (haystackTitle.includes(token)) {
          return score + 5;
        }

        if (haystackExtract.includes(token)) {
          return score + 1;
        }

        return score;
      }, 0);
      const exactScore = title.toLowerCase().includes(haystackTitle) || haystackTitle.includes(title.toLowerCase())
        ? 8
        : 0;

      return {
        guide,
        index,
        score: tokenScore + exactScore - (blocked ? 20 : 0),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);

  return scored.length ? scored.map((entry) => entry.guide) : guides;
}

function getWizardVaultGuideTokens(title: string): string[] {
  const stopWords = new Set([
    "with",
    "from",
    "into",
    "any",
    "the",
    "and",
    "for",
    "daily",
    "weekly",
    "special",
    "complete",
    "defeat",
    "earn",
    "gain",
    "capture",
    "participate",
    "play",
    "gather",
    "harvest",
    "mine",
    "craft",
    "salvage",
    "identify",
    "perform",
    "combat",
  ]);

  return Array.from(
    new Set(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, " ")
        .split(/\s+/)
        .map((token) => token.replace(/^'+|'+$/g, ""))
        .filter((token) => token.length > 2 && !/^\d+$/.test(token) && !stopWords.has(token)),
    ),
  );
}

function extractGw2ChatLinks(html: string): string[] {
  const text = html.replace(/&amp;/g, "&");
  return Array.from(text.matchAll(/\[&[A-Za-z0-9+/=]+]/g), (match) => match[0]);
}

function normalizeWizardVaultTrack(track: string): "PvE" | "PvP" | "WvW" | "Other" {
  if (/wvw|world versus world/i.test(track)) {
    return "WvW";
  }

  if (/pvp|structured pvp/i.test(track)) {
    return "PvP";
  }

  if (/pve|player versus environment/i.test(track)) {
    return "PvE";
  }

  return "Other";
}

function buildWizardVaultObjectiveSteps(
  title: string,
  track: string,
  wikiLinks: WikiGuide[],
): string[] {
  const normalizedTitle = title.toLowerCase();
  const normalizedTrack = normalizeWizardVaultTrack(track);
  const bestWikiTitle = wikiLinks[0]?.title;
  const wikiStep = bestWikiTitle
    ? `Use the ${bestWikiTitle} wiki link for exact locations, timers, skill examples, vendor details, or map notes.`
    : null;
  const steps: string[] = [];

  if (normalizedTrack === "WvW") {
    steps.push("Enter World vs World and join the active commander or nearest friendly group.");
    if (/capture|tower|camp|keep|castle|objective/.test(normalizedTitle)) {
      steps.push("Capture camps first for speed; move to towers or keeps only when your group is already pushing them.");
    } else if (/defeat|player|enemy/.test(normalizedTitle)) {
      steps.push("For enemy defeats, follow large fights or defend contested objectives where players are already clashing.");
    } else {
      steps.push("Stay near active fights and objectives until participation or objective progress updates.");
    }
    if (wikiStep) {
      steps.push(wikiStep);
    }
    return steps;
  }

  if (normalizedTrack === "PvP") {
    steps.push("Queue for Unranked or Ranked PvP and use a build you can play comfortably.");
    if (/win/.test(normalizedTitle)) {
      steps.push("For wins, rotate with teammates and avoid chasing kills away from capture points.");
    } else if (/complete|match|play/.test(normalizedTitle)) {
      steps.push("Finish full matches; leaving early usually wastes the fastest progress route.");
    } else {
      steps.push("Adjust traits, relics, and amulets in the PvP lobby before queueing.");
    }
    if (wikiStep) {
      steps.push(wikiStep);
    }
    return steps;
  }

  if (/complete.*event|events? in|meta/.test(normalizedTitle)) {
    steps.push("Go to the named map or a busy event chain and complete nearby dynamic events.");
    steps.push("If the map is quiet, use LFG or waypoint-dense starter zones for faster event credit.");
  } else if (/defeat|kill|world boss|boss/.test(normalizedTitle)) {
    steps.push("Pick a dense enemy area, event chain, or the named target's map.");
    steps.push("Tag enemies or the boss before they die, then stay until reward credit appears.");
  } else if (/gather|harvest|mine|log/.test(normalizedTitle)) {
    steps.push("Equip the required gathering tool before leaving town.");
    steps.push("Run dense node routes, rich nodes, guild hall nodes, or home instance nodes if they count.");
  } else if (/craft/.test(normalizedTitle)) {
    steps.push("Use the matching crafting station and craft the cheapest valid recipes.");
    steps.push("Prefer materials already in storage; buy only the missing pieces if the counter is worth finishing quickly.");
  } else if (/salvage/.test(normalizedTitle)) {
    steps.push("Use cheap gear or unidentified gear, then salvage until the counter completes.");
    steps.push("Check rare or exotic drops before salvaging if their sell value is high.");
  } else if (/identify|unidentified/.test(normalizedTitle)) {
    steps.push("Open unidentified gear from inventory until the objective updates.");
    steps.push("Fine or uncommon unidentified gear is usually the cheapest source if you need to buy progress.");
  } else if (/combo/.test(normalizedTitle)) {
    steps.push("Slot one combo field skill and one combo finisher skill.");
    steps.push("Fight weak enemies or a training golem, place the field, then use the finisher while inside or through it.");
    steps.push("Repeat the field-and-finisher sequence until the counter completes.");
  } else if (/dodge|combo|breakbar|defiance|boon|condition/.test(normalizedTitle)) {
    steps.push("Use low-risk open-world enemies or training areas so you can repeat the combat action quickly.");
    steps.push("Keep the fight alive long enough to repeat the required action until the tracker updates.");
  } else if (/^log in\b/.test(normalizedTitle)) {
    steps.push("Enter the game on any character.");
    steps.push("If the objective does not complete immediately, swap map or character once.");
  } else {
    steps.push("Complete the named activity, map, event, vendor purchase, or account action until the tracker updates.");
  }

  if (wikiStep) {
    steps.push(wikiStep);
  }
  return steps;
}

function normalizeDropName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s+\(.+?\)$/g, "")
    .trim();
}

function getQuantityRange(text: string): { quantityMin: number; quantityMax: number } {
  const normalized = text.trim().toLowerCase();
  const range = normalized.match(/^(\d+)\s*[-\u2013]\s*(\d+)/);
  if (range) {
    return {
      quantityMin: Number(range[1]),
      quantityMax: Number(range[2]),
    };
  }

  const count = normalized.match(/^(\d+)/);
  if (count) {
    const value = Number(count[1]);
    return {
      quantityMin: value,
      quantityMax: value,
    };
  }

  const wordCounts: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };
  const word = normalized.match(/^(one|two|three|four|five)\b/);
  if (word) {
    const value = wordCounts[word[1]] ?? 1;
    return {
      quantityMin: value,
      quantityMax: value,
    };
  }

  return {
    quantityMin: 1,
    quantityMax: 1,
  };
}

function extractChance(text: string): number | undefined {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : undefined;
}

function sectionAfterHeadline(
  document: Document,
  headlineId: string,
  options: { stopAtSubheading?: boolean } = {},
): Element[] {
  const headline = document.querySelector(`#${CSS.escape(headlineId)}`);
  const heading = headline?.closest("h2, h3");
  if (!heading?.parentElement) {
    return [];
  }

  const elements: Element[] = [];
  let next = heading.nextElementSibling;
  const stopPattern = options.stopAtSubheading ? /^H[2-6]$/i : /^H2$/i;
  while (next && !stopPattern.test(next.tagName)) {
    elements.push(next);
    next = next.nextElementSibling;
  }

  return elements;
}

function isLikelyWikiNavigationElement(element: Element): boolean {
  const className = element.getAttribute("class") ?? "";
  const id = element.getAttribute("id") ?? "";
  const text = element.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";

  return (
    /\b(navbox|metadata|vertical-navbox|toc|infobox|mw-collapsible)\b/i.test(className) ||
    /black lion service items|see also|external links/.test(text) ||
    /navbox|toc/i.test(id)
  );
}

function extractDropsFromElements(elements: Element[]): ContainerDrop[] {
  const rows: Element[] = elements
    .filter((element) => !isLikelyWikiNavigationElement(element))
    .flatMap((element): Element[] => {
      if (isLikelyWikiNavigationElement(element)) {
        return [];
      }

      const tableRows = Array.from(element.querySelectorAll("tr")) as Element[];
      if (tableRows.length > 0) {
        return tableRows.filter((row) => !isLikelyWikiNavigationElement(row));
      }

      return Array.from(element.querySelectorAll("li")) as Element[];
    });
  const drops = new Map<string, ContainerDrop>();

  for (const row of rows) {
    const text = row.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (!text || /edit$/i.test(text)) {
      continue;
    }

    const { quantityMin, quantityMax } = getQuantityRange(text);
    const chancePct = extractChance(text);

    if (/coin/i.test(text) && /^\d+\s*[-\u2013]\s*\d+/.test(text)) {
      const key = "coin";
      drops.set(key, {
        name: "Coin",
        quantityMin,
        quantityMax,
        chancePct,
        note: "Raw coin drop from the wiki contents section.",
        coinValue: 1,
      });
      continue;
    }

    const titles = Array.from(row.querySelectorAll<HTMLAnchorElement>("a[title]"))
      .map((link) => normalizeDropName(link.getAttribute("title") ?? link.textContent ?? ""))
      .filter(
        (title) =>
          title &&
          !title.startsWith("File:") &&
          !GENERIC_WIKI_TITLES.has(title) &&
          !NON_ITEM_CONTAINER_DROP_TITLES.has(title),
      )
      .filter((title) => !title.includes("#"));

    for (const title of titles) {
      const key = title.toLowerCase();
      if (drops.has(key)) {
        const existing = drops.get(key)!;
        drops.set(key, {
          ...existing,
          quantityMin: Math.min(existing.quantityMin, quantityMin),
          quantityMax: Math.max(existing.quantityMax, quantityMax),
          chancePct: existing.chancePct ?? chancePct,
        });
      } else {
        drops.set(key, {
          name: title,
          quantityMin,
          quantityMax,
          chancePct,
          note: chancePct === undefined ? "Chance not listed in the parsed wiki row." : undefined,
        });
      }
    }
  }

  return Array.from(drops.values()).slice(0, MAX_PARSED_CONTAINER_DROPS);
}

function mergeDropRates(baseDrops: ContainerDrop[], rateDrops: ContainerDrop[]): ContainerDrop[] {
  const merged = new Map(baseDrops.map((drop) => [drop.name.toLowerCase(), drop]));

  for (const drop of rateDrops) {
    const key = drop.name.toLowerCase();
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        chancePct: existing.chancePct ?? drop.chancePct,
        note: drop.chancePct ? "Chance parsed from the wiki drop-rate page." : existing.note,
      });
    }
  }

  return Array.from(merged.values()).slice(0, MAX_PARSED_CONTAINER_DROPS);
}

function extractTrophyShipmentAverageDrops(document: Document): ContainerDrop[] {
  const tables = Array.from(document.querySelectorAll("table.item.table"));
  const table = tables.find((candidate) => {
    const text = candidate.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return /Trophy Shipment/i.test(text) && /Per\s*container:/i.test(text);
  });
  if (!table) {
    return [];
  }

  const rows = Array.from(table.querySelectorAll("tr"));
  const headerRow = rows.find((row) => {
    const firstCell = row.children[0];
    return firstCell?.tagName.toLowerCase() === "th" && /Trophy Shipment/i.test(firstCell.textContent ?? "");
  });
  const averageRow = rows.find((row) => /Per\s*container:/i.test(row.textContent ?? ""));
  if (!headerRow || !averageRow) {
    return [];
  }

  const headerCells = Array.from(headerRow.children).filter(
    (cell) => cell.tagName.toLowerCase() === "th",
  );
  const titles = headerCells
    .slice(1)
    .map((cell) => normalizeDropName(cell.querySelector<HTMLAnchorElement>("a[title]")?.getAttribute("title") ?? ""))
    .filter((title) => title && !GENERIC_WIKI_TITLES.has(title) && !NON_ITEM_CONTAINER_DROP_TITLES.has(title));
  const valueCells = Array.from(averageRow.children).slice(1);

  return titles
    .map((title, index): ContainerDrop | null => {
      const rawValue = valueCells[index]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const average = Number(rawValue.replace(/[^\d.]/g, ""));
      if (!Number.isFinite(average) || average <= 0) {
        return null;
      }

      return {
        name: title,
        quantityMin: average,
        quantityMax: average,
        note: TROPHY_SHIPMENT_AVERAGE_DROP_NOTE,
      };
    })
    .filter((drop): drop is ContainerDrop => Boolean(drop))
    .slice(0, MAX_PARSED_CONTAINER_DROPS);
}

function isContainerAnalysis(value: unknown): value is ContainerAnalysis {
  const analysis = value as Partial<ContainerAnalysis> | null;
  return Boolean(
    analysis &&
      typeof analysis.title === "string" &&
      typeof analysis.sourceUrl === "string" &&
      Array.isArray(analysis.drops) &&
      typeof analysis.exactChancesAvailable === "boolean" &&
      Array.isArray(analysis.parserNotes),
  );
}

function containerAnalysisCacheKey(itemName: string): string {
  return `container:v3:${normalizeWikiLookupName(itemName)}`;
}

async function loadCachedContainerAnalysis(itemName: string): Promise<ContainerAnalysis | null> {
  if (!window.gw2Desktop?.loadWikiContainerCache) {
    return null;
  }

  try {
    const result = await window.gw2Desktop.loadWikiContainerCache(containerAnalysisCacheKey(itemName));
    return isContainerAnalysis(result?.analysis) ? result.analysis : null;
  } catch {
    return null;
  }
}

async function saveCachedContainerAnalysis(itemName: string, analysis: ContainerAnalysis): Promise<void> {
  if (!window.gw2Desktop?.saveWikiContainerCache) {
    return;
  }

  try {
    await window.gw2Desktop.saveWikiContainerCache(containerAnalysisCacheKey(itemName), analysis);
  } catch {
    // Keep the parsed result in memory even if the persistent cache is unavailable.
  }
}

function findResolvedWikiItemForDrop(dropName: string, items: Gw2Item[]): Gw2Item | undefined {
  const normalized = normalizeWikiLookupName(dropName);
  const exact = items.find((item) => normalizeWikiLookupName(item.name) === normalized);
  if (exact) {
    return exact;
  }

  return items.find((item) => {
    const itemName = normalizeWikiLookupName(item.name);
    return itemName.includes(normalized) || normalized.includes(itemName);
  });
}

async function hydrateContainerDropsWithItems(drops: ContainerDrop[]): Promise<ContainerDrop[]> {
  const ids = Array.from(
    new Set(drops.map((drop) => drop.itemId).filter((id): id is number => typeof id === "number")),
  );
  if (ids.length > 0) {
    await loadItems(ids).catch(() => []);
  }

  const unresolvedNames = Array.from(
    new Set(
      drops
        .filter((drop) => !drop.coinValue && typeof drop.itemId !== "number")
        .map((drop) => drop.name)
        .filter(Boolean),
    ),
  );

  if (unresolvedNames.length === 0) {
    return drops;
  }

  const resolvedItems = await loadItemsByWikiTitles(unresolvedNames).catch(() => []);
  return drops.map((drop) => {
    if (drop.coinValue || typeof drop.itemId === "number") {
      return drop;
    }

    const item = findResolvedWikiItemForDrop(drop.name, resolvedItems);
    return item
      ? {
          ...drop,
          itemId: item.id,
          officialName: item.name,
        }
      : drop;
  });
}

export async function loadContainerAnalysis(itemName: string): Promise<ContainerAnalysis | null> {
  const cachedAnalysis = await loadCachedContainerAnalysis(itemName);
  if (cachedAnalysis) {
    const drops = await hydrateContainerDropsWithItems(cachedAnalysis.drops);
    const hydratedAnalysis = {
      ...cachedAnalysis,
      drops,
    };
    if (drops.some((drop, index) => drop.itemId !== cachedAnalysis.drops[index]?.itemId)) {
      await saveCachedContainerAnalysis(itemName, hydratedAnalysis);
    }
    return hydratedAnalysis;
  }

  const wikiPage = await loadWikiHtml(itemName);
  if (!wikiPage) {
    return null;
  }

  const document = new DOMParser().parseFromString(wikiPage.html, "text/html");
  const contentsElements = sectionAfterHeadline(document, "Contents", { stopAtSubheading: true });
  const baseDrops = extractDropsFromElements(contentsElements);
  const dropRatePage = await loadWikiHtml(`${wikiPage.title}/Drop rate`);
  const dropRateDocument = dropRatePage
    ? new DOMParser().parseFromString(dropRatePage.html, "text/html")
    : null;
  const averageDropRateDrops = dropRateDocument
    ? extractTrophyShipmentAverageDrops(dropRateDocument)
    : [];
  const dropRateElements = dropRateDocument
    ? [
        ...sectionAfterHeadline(dropRateDocument, "Drop_rates"),
        ...sectionAfterHeadline(dropRateDocument, "Drop_rate"),
      ]
    : [];
  const dropRateDrops = averageDropRateDrops.length
    ? averageDropRateDrops
    : extractDropsFromElements(dropRateElements);
  const drops = await hydrateContainerDropsWithItems(
    averageDropRateDrops.length ? dropRateDrops : mergeDropRates(baseDrops, dropRateDrops),
  );
  const hasAverageDropRates = drops.some((drop) => drop.note === TROPHY_SHIPMENT_AVERAGE_DROP_NOTE);
  const exactChancesAvailable =
    !hasAverageDropRates && drops.some((drop) => drop.chancePct !== undefined);
  const parserNotes = [
    hasAverageDropRates
      ? "Average amounts were parsed from the GW2 Wiki Trophy Shipment/Drop rate community sample."
      : drops.length
      ? "Loot rows were parsed from the GW2 Wiki contents section."
      : "No structured contents rows were found on the wiki page.",
    hasAverageDropRates
      ? "These are estimated average drops per opened Trophy Shipment, not guaranteed drops from a single container."
      : exactChancesAvailable
      ? "At least one chance value was parsed; rows without chance values remain marked as unknown."
      : "Exact drop chances were not found in the parsed wiki data.",
    "Salvage values are estimates unless the item has direct market value only.",
  ];

  const analysis = {
    title: wikiPage.title,
    sourceUrl: wikiPage.url,
    dropRateUrl: dropRatePage?.url,
    drops,
    exactChancesAvailable,
    parserNotes,
  };

  await saveCachedContainerAnalysis(itemName, analysis);
  return analysis;
}

function extractMapNamesFromLocationSection(
  html: string,
  mapNameSet: Set<string>,
): string[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const locationElements = sectionAfterHeadline(document, "Locations");
  const names = new Set<string>();

  for (const element of locationElements) {
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[title]"));
    for (const link of links) {
      const title = normalizeDropName(link.getAttribute("title") ?? link.textContent ?? "");
      if (mapNameSet.has(title)) {
        names.add(title);
      }
    }
  }

  return Array.from(names).sort((left, right) => left.localeCompare(right));
}

function extractGatheredFromNodes(html: string): string[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const gatheredFromElements = sectionAfterHeadline(document, "Gathered_from", { stopAtSubheading: true });
  return Array.from(
    new Set(
      gatheredFromElements.flatMap((element) =>
        extractGatheringLinkTitles(element, { allowNodeTitles: true }),
      ),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

function extractGatheringResultsFromNodePage(html: string): GatheringNodeYield[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const elements = sectionAfterHeadline(document, "Gathering_results", { stopAtSubheading: true });
  if (elements.length === 0) {
    return [];
  }

  return dedupeGatheringYields(
    elements.flatMap((element) => extractGatheringYieldsFromElement(element, "unknown")),
  );
}

export async function loadGatheringLocations(
  itemName: string,
  nodes: string[],
): Promise<GatheringLocationInfo> {
  const uniqueNodes = Array.from(new Set(nodes.map((node) => node.trim()).filter(Boolean)));
  const cacheKey = `${itemName}::${uniqueNodes.join("|")}`;
  const cached = gatheringLocationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const persistentCacheKey = getNamedCacheKey("wiki:gathering-locations:v2", cacheKey);
  const cachedInfo = await loadSqlCache(
    persistentCacheKey,
    SQL_CACHE_TTL.wikiDerived,
    (value): value is GatheringLocationInfo =>
      isRecord(value) &&
      typeof value.itemName === "string" &&
      typeof value.sourceUrl === "string" &&
      Array.isArray(value.nodes) &&
      Array.isArray(value.maps),
  );
  if (cachedInfo) {
    gatheringLocationCache.set(cacheKey, cachedInfo);
    return cachedInfo;
  }

  const maps = await loadMaps();
  const mapNameSet = new Set(maps.map((map) => map.name));
  const itemPage = await loadWikiHtml(itemName);
  const gatheredFromNodes = itemPage ? extractGatheredFromNodes(itemPage.html) : [];
  const drilldownNodes = Array.from(new Set([...uniqueNodes, ...gatheredFromNodes])).slice(0, 16);
  const nodeEntries = await mapWithConcurrency(drilldownNodes, 3, async (node) => {
    const page = await loadWikiHtml(node);
    const mapNames = page
      ? extractMapNamesFromLocationSection(page.html, mapNameSet)
      : [];
    const results = page ? extractGatheringResultsFromNodePage(page.html) : [];

    return {
      name: page?.title ?? node,
      maps: mapNames,
      url: page?.url,
      results,
    };
  });
  const allMaps = Array.from(new Set(nodeEntries.flatMap((node) => node.maps)))
    .sort((left, right) => left.localeCompare(right));
  const info: GatheringLocationInfo = {
    itemName,
    sourceUrl: itemPage?.url ?? wikiPageUrl(itemName),
    nodes: nodeEntries,
    maps: allMaps,
    gatheredFromNodes,
  };

  gatheringLocationCache.set(cacheKey, info);
  void saveSqlCache(persistentCacheKey, info);
  return info;
}

export async function loadAccountSnapshot(
  apiKey: string,
  options: { forceRefresh?: boolean } = {},
): Promise<AccountSnapshot> {
  const trimmedKey = apiKey.trim();
  let tokenInfo: TokenInfo;

  try {
    tokenInfo = await fetchJson<TokenInfo>(gw2AuthenticatedUrl("/tokeninfo", trimmedKey), { cache: "no-store" });
    assertAccountAnalysisPermissions(tokenInfo);
  } catch (error) {
    if (!options.forceRefresh) {
      const cachedSnapshot = await loadAccountSnapshotFallback(trimmedKey);
      if (cachedSnapshot) {
        return cachedSnapshot;
      }
    }

    throw error;
  }

  const cacheKey = `account:snapshot:${tokenInfo.id}`;

  try {
    const [materials, bank, inventory, characters, wallet, recipes, achievements] = await Promise.all([
      fetchAccountJson<AccountMaterial[]>(trimmedKey, "/account/materials", [], { required: true }),
      fetchAccountJson<AccountItemStack[]>(trimmedKey, "/account/bank", [], { required: true }),
      fetchAccountJson<AccountItemStack[]>(trimmedKey, "/account/inventory", [], { required: true }),
      fetchAccountJson<AccountCharacter[]>(trimmedKey, "/characters?ids=all", [], { required: true }),
      fetchAccountJson<AccountWalletEntry[]>(trimmedKey, "/account/wallet", [], { required: true }),
      fetchAccountJson<number[]>(trimmedKey, "/account/recipes", [], { required: true }),
      fetchAccountJson<AccountAchievement[]>(trimmedKey, "/account/achievements", [], { required: true }),
    ]);

    const characterHoldings = characters.map(countCharacterStacks);
    const holdings = mergeHoldings(
      countStacks(materials),
      countStacks(bank.filter(Boolean)),
      countStacks(inventory.filter(Boolean)),
      ...characterHoldings,
    );

    const snapshot = {
      tokenInfo,
      materials,
      bank,
      inventory,
      characters,
      wallet,
      coins: wallet.find((entry) => entry.id === 1)?.value ?? 0,
      recipes,
      achievements,
      holdings,
    };
    void saveSqlCache(cacheKey, serializeAccountSnapshot(snapshot));
    void saveSqlCache(`account:snapshot-index:${stableHash(trimmedKey)}`, [tokenInfo.id]);
    return snapshot;
  } catch (error) {
    if (!options.forceRefresh) {
      const cachedSnapshot = await loadSqlCache(
        cacheKey,
        SQL_CACHE_TTL.accountSnapshot,
        isAccountSnapshotPayload,
      );
      if (cachedSnapshot) {
        return hydrateAccountSnapshot(cachedSnapshot, tokenInfo);
      }
    }

    throw error;
  }
}

async function loadAccountSnapshotFallback(apiKey: string): Promise<AccountSnapshot | null> {
  const tokenHash = stableHash(apiKey.trim());
  const knownAccountIds = await loadSqlCache(
    `account:snapshot-index:${tokenHash}`,
    SQL_CACHE_TTL.accountSnapshot,
    (value): value is string[] => isArrayOf(value, (item): item is string => typeof item === "string"),
  );

  if (!knownAccountIds?.length) {
    return null;
  }

  for (const accountId of knownAccountIds) {
    const cachedSnapshot = await loadSqlCache(
      `account:snapshot:${accountId}`,
      SQL_CACHE_TTL.accountSnapshot,
      isAccountSnapshotPayload,
    );
    if (cachedSnapshot) {
      return hydrateAccountSnapshot(cachedSnapshot, cachedSnapshot.tokenInfo);
    }
  }

  return null;
}

async function loadAllRecipes(onProgress?: ProgressCallback): Promise<Gw2Recipe[]> {
  if (recipeCache) {
    return recipeCache;
  }

  onProgress?.("Checking cached recipe database");
  const cachedRecipes = await loadCachedRecipes();
  if (cachedRecipes) {
    recipeCache = cachedRecipes;
    return recipeCache;
  }

  onProgress?.("Loading recipe index");
  const recipeIds = await fetchJson<number[]>(`${GW2_API}/recipes`);
  const recipeChunks = chunk(recipeIds, CHUNK_SIZE);
  let completedChunks = 0;
  const recipeBatches = await mapWithConcurrency(
    recipeChunks,
    RECIPE_DETAIL_CONCURRENCY,
    async (recipeChunk) => {
      const batch = await fetchJson<Gw2Recipe[]>(
        `${GW2_API}/recipes?ids=${recipeChunk.join(",")}`,
      );
      completedChunks += 1;
      onProgress?.("Loading recipe database", completedChunks, recipeChunks.length);
      return batch;
    },
  );

  recipeCache = recipeBatches.flat();
  void saveCachedRecipes(recipeCache);
  return recipeCache;
}

async function loadWizardVaultObjectiveDefinitions(
  ids: number[],
): Promise<Map<number, WizardVaultObjectiveDefinition>> {
  const uniqueIds = Array.from(new Set(ids)).filter((id) => Number.isFinite(id));
  const definitions = new Map<number, WizardVaultObjectiveDefinition>();

  if (uniqueIds.length === 0) {
    return definitions;
  }

  const cachedCatalog = wizardVaultObjectiveCatalogCache ?? await loadSqlCache(
    "official:wizard-vault-objective-catalog",
    SQL_CACHE_TTL.wizardVaultPublic,
    (value): value is WizardVaultObjectiveDefinition[] =>
      isArrayOf(value, isWizardVaultObjectiveDefinition),
  );
  if (cachedCatalog) {
    for (const definition of cachedCatalog) {
      if (uniqueIds.includes(definition.id)) {
        definitions.set(definition.id, definition);
      }
    }

    if (definitions.size === uniqueIds.length) {
      return definitions;
    }
  }

  const batches = await mapWithConcurrency(
    chunk(uniqueIds, CHUNK_SIZE),
    4,
    (objectiveChunk) =>
      fetchJson<WizardVaultObjectiveDefinition[]>(
        `${GW2_API}/wizardsvault/objectives?ids=${objectiveChunk.join(",")}`,
      ),
  );

  for (const definition of batches.flat()) {
    definitions.set(definition.id, definition);
  }

  return definitions;
}

async function loadWizardVaultObjectiveCatalog(
  onProgress?: ProgressCallback,
): Promise<WizardVaultObjectiveDefinition[]> {
  if (wizardVaultObjectiveCatalogCache) {
    return wizardVaultObjectiveCatalogCache;
  }

  const cachedCatalog = await loadSqlCache(
    "official:wizard-vault-objective-catalog",
    SQL_CACHE_TTL.wizardVaultPublic,
    (value): value is WizardVaultObjectiveDefinition[] =>
      isArrayOf(value, isWizardVaultObjectiveDefinition),
  );
  if (cachedCatalog) {
    wizardVaultObjectiveCatalogCache = cachedCatalog;
    return wizardVaultObjectiveCatalogCache;
  }

  onProgress?.("Loading Wizard's Vault objective catalog");
  wizardVaultObjectiveCatalogCache = await fetchJson<WizardVaultObjectiveDefinition[]>(
    `${GW2_API}/wizardsvault/objectives?ids=all`,
  );

  void saveSqlCache("official:wizard-vault-objective-catalog", wizardVaultObjectiveCatalogCache);
  return wizardVaultObjectiveCatalogCache;
}

async function loadWizardVaultListings(): Promise<WizardVaultListing[]> {
  const cachedListings = await loadSqlCache(
    "official:wizard-vault-listings",
    SQL_CACHE_TTL.wizardVaultPublic,
    (value): value is WizardVaultListing[] => isArrayOf(value, isWizardVaultListing),
  );
  if (cachedListings) {
    return cachedListings;
  }

  const listings: WizardVaultListing[] = [];
  const firstPage = await loadWizardVaultListingPage(0);
  listings.push(...firstPage.listings);

  if (firstPage.totalPages) {
    const remainingPages = Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) => index + 1);
    const pageResults = await mapWithConcurrency(remainingPages, 4, (page) =>
      loadWizardVaultListingPage(page).then((result) => result.listings),
    );
    listings.push(...pageResults.flat());
    void saveSqlCache("official:wizard-vault-listings", listings);
    return listings;
  }

  let page = 1;
  while (firstPage.listings.length === COMMERCE_PAGE_SIZE) {
    const result = await loadWizardVaultListingPage(page);
    listings.push(...result.listings);

    if (result.listings.length < COMMERCE_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  void saveSqlCache("official:wizard-vault-listings", listings);
  return listings;
}

async function loadWizardVaultListingPage(
  page: number,
): Promise<{ listings: WizardVaultListing[]; totalPages: number | null }> {
  const { data, headers } = await fetchJsonWithHeaders<WizardVaultListing[]>(
    `${GW2_API}/wizardsvault/listings?page=${page}&page_size=${COMMERCE_PAGE_SIZE}`,
  );
  const pageTotalHeader = headers.get("X-Page-Total") ?? headers.get("x-page-total");
  const parsedTotal = pageTotalHeader ? Number(pageTotalHeader) : NaN;

  return {
    listings: data,
    totalPages: Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : null,
  };
}

async function loadAccountWizardVaultSection(
  apiKey: string,
  id: WizardVaultObjectiveSection["id"],
): Promise<{ raw: unknown; objectiveIds: number[] }> {
  const cacheKey = `account:wizard-vault-section:${stableHash(apiKey)}:${id}`;
  let raw: unknown;

  try {
    raw = await fetchJson<unknown>(gw2AuthenticatedUrl(`/account/wizardsvault/${id}`, apiKey));
    if (isCacheableApiPayload(raw)) {
      void saveSqlCache(cacheKey, raw);
    }
  } catch {
    const cachedSection = await loadSqlCache(cacheKey, SQL_CACHE_TTL.accountSnapshot, isCacheableApiPayload);
    if (!cachedSection) {
      throw new Error(`Unable to load ${id} Wizard's Vault section.`);
    }
    raw = cachedSection;
  }

  return {
    raw,
    objectiveIds: extractWizardVaultObjectiveRows(raw)
      .map((row) => getUnknownNumber((row as Record<string, unknown>).id))
      .filter((objectiveId): objectiveId is number => typeof objectiveId === "number"),
  };
}

async function loadPublicWizardVaultSection(
  id: WizardVaultObjectiveSection["id"],
): Promise<{ raw: unknown; objectiveIds: number[] } | null> {
  const cacheKey = `official:wizard-vault-section:${id}`;
  const cachedSection = await loadSqlCache(
    cacheKey,
    SQL_CACHE_TTL.wizardVaultPublic,
    (value): value is { raw: unknown; objectiveIds: number[] } =>
      isRecord(value) &&
      isArrayOf(value.objectiveIds, (objectiveId): objectiveId is number => typeof objectiveId === "number"),
  );
  if (cachedSection) {
    return cachedSection;
  }

  try {
    const raw = await fetchJson<unknown>(`${GW2_API}/wizardsvault/${id}`);
    const section = {
      raw,
      objectiveIds: extractWizardVaultObjectiveRows(raw)
        .map((row) => getUnknownNumber((row as Record<string, unknown>).id))
        .filter((objectiveId): objectiveId is number => typeof objectiveId === "number"),
    };
    void saveSqlCache(cacheKey, section);
    return section;
  } catch {
    return null;
  }
}

function extractWizardVaultObjectiveRows(raw: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(raw)) {
    return raw.filter(isRecord);
  }

  if (isRecord(raw) && Array.isArray(raw.objectives)) {
    return raw.objectives.filter(isRecord);
  }

  return [];
}

function normalizeWizardVaultSection(
  id: WizardVaultObjectiveSection["id"],
  raw: unknown,
  definitions: Map<number, WizardVaultObjectiveDefinition>,
): WizardVaultObjectiveSection {
  const sectionLabels: Record<WizardVaultObjectiveSection["id"], string> = {
    daily: "Daily",
    weekly: "Weekly",
    special: "Special",
  };
  const record = isRecord(raw) ? raw : {};
  const objectives = extractWizardVaultObjectiveRows(raw)
    .map((row): WizardVaultObjectiveProgress | null => {
      const objectiveId = getUnknownNumber(row.id);
      if (objectiveId === null) {
        return null;
      }

      const definition = definitions.get(objectiveId);
      const current = getUnknownNumber(row.current) ?? getUnknownNumber(row.progress_current);
      const complete = getUnknownNumber(row.complete) ?? getUnknownNumber(row.progress_complete);
      const completed =
        getUnknownBoolean(row.completed) ||
        getUnknownBoolean(row.done) ||
        (current !== null && complete !== null && current >= complete);

      return {
        id: objectiveId,
        title: definition?.title ?? `Objective ${objectiveId}`,
        track: definition?.track ?? (typeof row.track === "string" ? row.track : "Vault"),
        acclaim: definition?.acclaim ?? getUnknownNumber(row.acclaim) ?? 0,
        completed,
        claimed: getUnknownBoolean(row.claimed) || getUnknownBoolean(row.reward_claimed),
        current,
        complete,
      };
    })
    .filter((objective): objective is WizardVaultObjectiveProgress => Boolean(objective));

  return {
    id,
    label: sectionLabels[id],
    objectives,
    metaCurrent: getUnknownNumber(record.meta_progress_current),
    metaComplete: getUnknownNumber(record.meta_progress_complete),
    metaClaimed: getUnknownBoolean(record.meta_reward_claimed),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

function isMetaBattleHtmlPage(value: unknown): value is MetaBattleHtmlPage {
  return Boolean(
    isRecord(value) &&
      typeof value.title === "string" &&
      typeof value.html === "string" &&
      typeof value.url === "string",
  );
}

function isMetaBattleIcon(value: unknown): value is MetaBattleIcon {
  return Boolean(
    isRecord(value) &&
      typeof value.label === "string" &&
      (value.imageUrl === undefined || typeof value.imageUrl === "string"),
  );
}

function isMetaBattleAttributeComponent(value: unknown): value is MetaBattleAttributeComponent {
  return Boolean(
    isRecord(value) &&
      typeof value.name === "string" &&
      (value.tier === "major" || value.tier === "minor") &&
      (value.icon === undefined || typeof value.icon === "string") &&
      (value.value === undefined || typeof value.value === "number"),
  );
}

function isMetaBattleAttributeDistribution(value: unknown): value is MetaBattleAttributeDistribution {
  return Boolean(
    isRecord(value) &&
      (value.strikeDamage === undefined || typeof value.strikeDamage === "number") &&
      (value.conditionDamage === undefined || typeof value.conditionDamage === "number") &&
      (value.defense === undefined || typeof value.defense === "number") &&
      (value.support === undefined || typeof value.support === "number"),
  );
}

function isMetaBattleAttributeCombination(value: unknown): value is MetaBattleAttributeCombination {
  return Boolean(
    isRecord(value) &&
      typeof value.prefix === "string" &&
      (value.suffix === undefined || typeof value.suffix === "string") &&
      isArrayOf(value.attributes, isMetaBattleAttributeComponent) &&
      isArrayOf(value.availability, (item): item is string => typeof item === "string") &&
      (value.distribution === undefined || isMetaBattleAttributeDistribution(value.distribution)),
  );
}

function isMetaBattleLevel80Bonus(value: unknown): value is MetaBattleLevel80Bonus {
  return Boolean(
    isRecord(value) &&
      (value.major1 === undefined || typeof value.major1 === "number") &&
      (value.minor1 === undefined || typeof value.minor1 === "number") &&
      (value.major2 === undefined || typeof value.major2 === "number") &&
      (value.minor2 === undefined || typeof value.minor2 === "number") &&
      (value.celestial === undefined || typeof value.celestial === "number"),
  );
}

function isMetaBattleAttributeReference(value: unknown): value is MetaBattleAttributeReference {
  return Boolean(
    isRecord(value) &&
      isArrayOf(value.combinations, isMetaBattleAttributeCombination) &&
      isRecord(value.bonuses) &&
      Object.values(value.bonuses).every(isMetaBattleLevel80Bonus),
  );
}

function isMetaBattleBuildSummary(value: unknown): value is MetaBattleBuildSummary {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "string" &&
      typeof value.title === "string" &&
      typeof value.pageTitle === "string" &&
      typeof value.url === "string" &&
      typeof value.mode === "string" &&
      typeof value.section === "string" &&
      typeof value.profession === "string" &&
      isArrayOf(value.icons, isMetaBattleIcon),
  );
}

function isMetaBattleBuildSkill(value: unknown): value is MetaBattleBuildSkill {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      (value.icon === undefined || typeof value.icon === "string"),
  );
}

function isMetaBattleWikiSkill(value: unknown): value is MetaBattleWikiSkill {
  return Boolean(
    isRecord(value) &&
      typeof value.name === "string" &&
      typeof value.profession === "string" &&
      typeof value.section === "string" &&
      typeof value.description === "string" &&
      typeof value.url === "string" &&
      (value.icon === undefined || typeof value.icon === "string"),
  );
}

function isMetaBattleWikiSpecializationInfo(value: unknown): value is MetaBattleWikiSpecializationInfo {
  return Boolean(
    isRecord(value) &&
      typeof value.name === "string" &&
      typeof value.url === "string" &&
      (value.profession === undefined || typeof value.profession === "string") &&
      (value.focus === undefined || typeof value.focus === "string") &&
      (value.icon === undefined || typeof value.icon === "string") &&
      (value.background === undefined || typeof value.background === "string") &&
      (value.description === undefined || typeof value.description === "string"),
  );
}

function isMetaBattleBuildTrait(value: unknown): value is MetaBattleBuildTrait {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      (value.icon === undefined || typeof value.icon === "string"),
  );
}

function isMetaBattleBuildSpecialization(value: unknown): value is MetaBattleBuildSpecialization {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      (value.focus === undefined || typeof value.focus === "string") &&
      (value.wikiDescription === undefined || typeof value.wikiDescription === "string") &&
      (value.wikiUrl === undefined || typeof value.wikiUrl === "string") &&
      isArrayOf(value.traits, isMetaBattleBuildTrait),
  );
}

function isMetaBattleBuildDetail(value: unknown): value is MetaBattleBuildDetail {
  return Boolean(
    isRecord(value) &&
      isMetaBattleBuildSummary(value.summary) &&
      typeof value.overview === "string" &&
      Array.isArray(value.skillGroups) &&
      isArrayOf(value.specializations, isMetaBattleBuildSpecialization) &&
      Array.isArray(value.equipment) &&
      (value.wikiSkills === undefined || isArrayOf(value.wikiSkills, isMetaBattleWikiSkill)),
  );
}

function isGw2SpecializationApiEntry(value: unknown): value is Gw2SpecializationApiEntry {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      (value.icon === undefined || typeof value.icon === "string") &&
      (value.background === undefined || typeof value.background === "string"),
  );
}

function isGw2TraitApiEntry(value: unknown): value is Gw2TraitApiEntry {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      (value.icon === undefined || typeof value.icon === "string"),
  );
}

function isGw2World(value: unknown): value is Gw2World {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      typeof value.population === "string",
  );
}

function isGw2Map(value: unknown): value is Gw2Map {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      typeof value.default_floor === "number" &&
      typeof value.type === "string" &&
      typeof value.continent_id === "number" &&
      typeof value.continent_name === "string" &&
      Array.isArray(value.map_rect) &&
      Array.isArray(value.continent_rect),
  );
}

function isAchievementCatalogPayload(value: unknown): value is CachedAchievementCatalogPayload {
  return Boolean(
    isRecord(value) &&
      isArrayOf(value.groups, (group): group is AchievementGroup =>
        isRecord(group) &&
        typeof group.id === "string" &&
        typeof group.name === "string" &&
        typeof group.order === "number" &&
        Array.isArray(group.categories),
      ) &&
      isArrayOf(value.categories, (category): category is AchievementCategory =>
        isRecord(category) &&
        typeof category.id === "number" &&
        typeof category.name === "string" &&
        typeof category.order === "number" &&
        Array.isArray(category.achievements),
      ) &&
      isArrayOf(value.achievements, (achievement): achievement is Gw2Achievement =>
        isRecord(achievement) &&
        typeof achievement.id === "number" &&
        typeof achievement.name === "string" &&
        Array.isArray(achievement.tiers),
      ),
  );
}

function hydrateAchievementCatalog(payload: CachedAchievementCatalogPayload): AchievementCatalog {
  return {
    groups: payload.groups,
    categories: payload.categories,
    achievements: payload.achievements,
    groupMap: new Map(payload.groups.map((group) => [group.id, group])),
    categoryMap: new Map(payload.categories.map((category) => [category.id, category])),
    achievementMap: new Map(payload.achievements.map((achievement) => [achievement.id, achievement])),
  };
}

function serializeAchievementCatalog(catalog: AchievementCatalog): CachedAchievementCatalogPayload {
  return {
    groups: catalog.groups,
    categories: catalog.categories,
    achievements: catalog.achievements,
  };
}

function isWizardVaultObjectiveDefinition(value: unknown): value is WizardVaultObjectiveDefinition {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.title === "string" &&
      typeof value.track === "string" &&
      typeof value.acclaim === "number",
  );
}

function isWizardVaultListing(value: unknown): value is WizardVaultListing {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.item_id === "number" &&
      typeof value.item_count === "number" &&
      typeof value.type === "string" &&
      typeof value.cost === "number",
  );
}

function isWikiGuide(value: unknown): value is WikiGuide {
  return Boolean(
    isRecord(value) &&
      typeof value.title === "string" &&
      typeof value.extract === "string" &&
      typeof value.url === "string",
  );
}

function isWikiRecipeUnlock(value: unknown): value is WikiRecipeUnlock {
  return Boolean(
    isRecord(value) &&
      typeof value.title === "string" &&
      typeof value.url === "string",
  );
}

function isWizardVaultEasyObjectiveRoute(value: unknown): value is WizardVaultEasyObjectiveRoute {
  return Boolean(
    isRecord(value) &&
      typeof value.location === "string" &&
      typeof value.note === "string" &&
      isArrayOf(value.chatLinks, (link): link is string => typeof link === "string") &&
      isArrayOf(value.wikiLinks, isWikiGuide),
  );
}

function isWizardVaultEasyObjectiveEntry(value: unknown): value is WizardVaultEasyObjectiveEntry {
  return Boolean(
    isRecord(value) &&
      (value.schedule === "Daily" || value.schedule === "Weekly") &&
      typeof value.title === "string" &&
      typeof value.sourceUrl === "string" &&
      isArrayOf(value.routes, isWizardVaultEasyObjectiveRoute),
  );
}

function isWikiHtmlPage(value: unknown): value is CachedWikiHtmlPage {
  return Boolean(
    isRecord(value) &&
      typeof value.title === "string" &&
      typeof value.html === "string" &&
      typeof value.url === "string",
  );
}

function isWikiItemAcquisition(value: unknown): value is WikiItemAcquisition {
  return Boolean(
    isRecord(value) &&
      typeof value.itemName === "string" &&
      typeof value.sourceUrl === "string" &&
      Array.isArray(value.vendorOffers) &&
      Array.isArray(value.acquisitionNotes) &&
      (value.teachesRecipe === undefined || isWikiRecipeUnlock(value.teachesRecipe)),
  );
}

function isGatherableItemSource(value: unknown): value is GatherableItemSource {
  return Boolean(
    isRecord(value) &&
      isGw2Item(value.item) &&
      (value.discipline === "Harvesting" || value.discipline === "Logging" || value.discipline === "Mining") &&
      typeof value.tool === "string" &&
      Array.isArray(value.nodes) &&
      (value.toolTier === undefined || typeof value.toolTier === "string") &&
      (value.mainYields === undefined || isArrayOf(value.mainYields, isGatheringNodeYield)) &&
      (value.extraYields === undefined || isArrayOf(value.extraYields, isGatheringNodeYield)),
  );
}

function isPermanentGatheringNode(value: unknown): value is PermanentGatheringNode {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.image === "string" &&
      typeof value.imageUrl === "string" &&
      typeof value.area === "string" &&
      typeof value.zone === "string" &&
      typeof value.region === "string" &&
      typeof value.materialName === "string" &&
      typeof value.sourceUrl === "string" &&
      typeof value.optimal === "number" &&
      (value.waypointName === undefined || typeof value.waypointName === "string") &&
      (value.waypointCode === undefined || typeof value.waypointCode === "string") &&
      (value.videoGuide === undefined || typeof value.videoGuide === "string") &&
      isArrayOf(value.items, isPermanentGatheringNodeDrop),
  );
}

function isPermanentGatheringNodeDrop(value: unknown): value is PermanentGatheringNode["items"][number] {
  return Boolean(
    isRecord(value) &&
      typeof value.id === "number" &&
      typeof value.quantity === "number" &&
      (value.ore === undefined || typeof value.ore === "boolean") &&
      (value.item === undefined || isGw2Item(value.item)),
  );
}

function isGatheringNodeYield(value: unknown): value is GatheringNodeYield {
  return Boolean(
    isRecord(value) &&
      typeof value.itemName === "string" &&
      (value.itemId === undefined || typeof value.itemId === "number") &&
      (value.chance === "guaranteed" ||
        value.chance === "chance" ||
        value.chance === "low_chance" ||
        value.chance === "rare" ||
        value.chance === "unknown") &&
      (value.quantity === undefined || typeof value.quantity === "string") &&
      (value.note === undefined || typeof value.note === "string"),
  );
}

function isWizardVaultObjectiveGuide(value: unknown): value is WizardVaultObjectiveGuide {
  return Boolean(
    isRecord(value) &&
      typeof value.objectiveTitle === "string" &&
      typeof value.track === "string" &&
      typeof value.summary === "string" &&
      isArrayOf(value.steps, (step): step is string => typeof step === "string") &&
      isArrayOf(value.wikiLinks, isWikiGuide) &&
      isArrayOf(value.chatLinks, (link): link is string => typeof link === "string") &&
      isArrayOf(value.searchTerms, (term): term is string => typeof term === "string"),
  );
}

function isAccountSnapshotPayload(value: unknown): value is CachedAccountSnapshotPayload {
  return Boolean(
    isRecord(value) &&
      isRecord(value.tokenInfo) &&
      typeof value.tokenInfo.id === "string" &&
      typeof value.tokenInfo.name === "string" &&
      Array.isArray(value.tokenInfo.permissions) &&
      Array.isArray(value.materials) &&
      Array.isArray(value.bank) &&
      Array.isArray(value.inventory) &&
      Array.isArray(value.characters) &&
      Array.isArray(value.wallet) &&
      typeof value.coins === "number" &&
      isArrayOf(value.recipes, (id): id is number => typeof id === "number") &&
      Array.isArray(value.achievements) &&
      Array.isArray(value.holdings) &&
      value.holdings.every(
        (entry) =>
          Array.isArray(entry) &&
          entry.length === 2 &&
          typeof entry[0] === "number" &&
          typeof entry[1] === "number",
      ),
  );
}

function serializeAccountSnapshot(snapshot: AccountSnapshot): CachedAccountSnapshotPayload {
  return {
    tokenInfo: snapshot.tokenInfo,
    materials: snapshot.materials,
    bank: snapshot.bank,
    inventory: snapshot.inventory,
    characters: snapshot.characters,
    wallet: snapshot.wallet,
    coins: snapshot.coins,
    recipes: snapshot.recipes,
    achievements: snapshot.achievements,
    holdings: Array.from(snapshot.holdings.entries()),
  };
}

function hydrateAccountSnapshot(payload: CachedAccountSnapshotPayload, tokenInfo: TokenInfo): AccountSnapshot {
  return {
    ...payload,
    tokenInfo,
    holdings: new Map(payload.holdings),
  };
}

interface AccountWizardVaultListingState {
  purchased: number | null;
  purchaseLimit: number | null;
}

interface AccountWizardVaultListingLookup {
  byListingId: Map<number, AccountWizardVaultListingState>;
  byItemId: Map<number, AccountWizardVaultListingState>;
  limitedCount: number;
  nonZeroPurchasedCount: number;
  reportedZeroLimitedCount: number;
}

function createEmptyAccountWizardVaultListingLookup(): AccountWizardVaultListingLookup {
  return {
    byListingId: new Map<number, AccountWizardVaultListingState>(),
    byItemId: new Map<number, AccountWizardVaultListingState>(),
    limitedCount: 0,
    nonZeroPurchasedCount: 0,
    reportedZeroLimitedCount: 0,
  };
}

interface CachedWizardVaultPurchaseEntry {
  key: string;
  purchased: number;
  purchaseLimit: number | null;
  updatedAt: number;
}

function isCachedWizardVaultPurchaseEntry(value: unknown): value is CachedWizardVaultPurchaseEntry {
  return Boolean(
    isRecord(value) &&
      typeof value.key === "string" &&
      typeof value.purchased === "number" &&
      (value.purchaseLimit === null || typeof value.purchaseLimit === "number") &&
      typeof value.updatedAt === "number",
  );
}

function getUnknownNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getFirstNumericField(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = getUnknownNumericValue(record[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function getNestedNumericField(
  record: Record<string, unknown>,
  parentKeys: string[],
  childKeys: string[],
): number | null {
  for (const parentKey of parentKeys) {
    const parent = record[parentKey];
    if (!isRecord(parent)) {
      continue;
    }

    const value = getFirstNumericField(parent, childKeys);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function normalizeAccountWizardVaultListings(raw: unknown): AccountWizardVaultListingLookup {
  const rows = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.listings)
      ? raw.listings
      : [];
  const lookup = createEmptyAccountWizardVaultListingLookup();
  const itemMatches = new Map<number, AccountWizardVaultListingState[]>();

  for (const row of rows.filter(isRecord)) {
    const listingId =
      getFirstNumericField(row, ["id", "listing_id", "listingId"]) ??
      getNestedNumericField(row, ["listing"], ["id", "listing_id", "listingId"]);
    const itemId =
      getFirstNumericField(row, ["item_id", "itemId", "reward_item_id", "rewardItemId"]) ??
      getNestedNumericField(row, ["item", "reward"], ["id", "item_id", "itemId"]);

    if (listingId === null && itemId === null) {
      continue;
    }

    const purchaseLimit = getFirstNumericField(row, [
      "purchase_limit",
      "purchaseLimit",
      "limit",
      "maximum",
      "max",
      "total",
    ]);
    const remaining = getFirstNumericField(row, [
      "remaining",
      "remaining_purchases",
      "remainingPurchases",
      "available",
    ]);
    const purchased =
      getFirstNumericField(row, [
        "purchased",
        "purchase_count",
        "purchaseCount",
        "count",
        "bought",
        "claimed",
        "current",
      ]) ??
      (purchaseLimit !== null && remaining !== null ? Math.max(0, purchaseLimit - remaining) : null);
    const state = { purchased, purchaseLimit };
    if (purchaseLimit !== null) {
      lookup.limitedCount += 1;
      if ((purchased ?? 0) > 0) {
        lookup.nonZeroPurchasedCount += 1;
      } else if (purchased === 0) {
        lookup.reportedZeroLimitedCount += 1;
      }
    }

    if (listingId !== null) {
      lookup.byListingId.set(listingId, state);
    }

    if (itemId !== null) {
      const matches = itemMatches.get(itemId) ?? [];
      matches.push(state);
      itemMatches.set(itemId, matches);
    }
  }

  for (const [itemId, matches] of itemMatches.entries()) {
    if (matches.length === 1) {
      lookup.byItemId.set(itemId, matches[0]);
    }
  }

  return lookup;
}

function getWizardVaultPurchaseCacheKey(listing: WizardVaultListing): string {
  return [
    listing.id,
    listing.item_id,
    listing.item_count,
    listing.type,
    listing.cost,
  ].join(":");
}

async function loadCachedWizardVaultPurchases(accountId: string): Promise<Map<string, CachedWizardVaultPurchaseEntry>> {
  const rows = await loadSqlCache(
    `account:wizard-vault-purchases:${accountId}`,
    370 * DAY_MS,
    (value): value is CachedWizardVaultPurchaseEntry[] =>
      isArrayOf(value, isCachedWizardVaultPurchaseEntry),
  );

  return new Map((rows ?? []).map((entry) => [entry.key, entry]));
}

async function saveCachedWizardVaultPurchases(
  accountId: string,
  entries: Map<string, CachedWizardVaultPurchaseEntry>,
): Promise<void> {
  await saveSqlCache(`account:wizard-vault-purchases:${accountId}`, Array.from(entries.values()));
}

function isCacheableApiPayload(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || isRecord(value);
}

async function loadAccountWizardVaultListingsRaw(apiKey: string): Promise<unknown> {
  const cacheKey = `account:wizard-vault-listings:${stableHash(apiKey)}`;

  try {
    const raw = await fetchJson<unknown>(gw2AuthenticatedUrl("/account/wizardsvault/listings", apiKey));
    if (isCacheableApiPayload(raw)) {
      void saveSqlCache(cacheKey, raw);
    }
    return raw;
  } catch {
    return (await loadSqlCache(cacheKey, SQL_CACHE_TTL.accountSnapshot, isCacheableApiPayload)) ?? [];
  }
}

export async function loadWizardVault(
  apiKey: string,
  onProgress?: ProgressCallback,
): Promise<WizardVaultSnapshot> {
  const trimmedKey = apiKey.trim();

  onProgress?.("Loading Wizard's Vault objectives");
  const objectiveCatalogPromise = loadWizardVaultObjectiveCatalog(onProgress).catch(() => []);
  let sectionPayloads: Array<{ raw: unknown; objectiveIds: number[] } | null>;
  let accountListings = createEmptyAccountWizardVaultListingLookup();
  let hasAccountProgress = false;
  let publicObjectiveRotationAvailable = false;
  let accountTokenInfo: TokenInfo | null = null;

  if (trimmedKey) {
    const [daily, weekly, special, accountListingsRaw, tokenInfo] = await Promise.all([
      loadAccountWizardVaultSection(trimmedKey, "daily"),
      loadAccountWizardVaultSection(trimmedKey, "weekly"),
      loadAccountWizardVaultSection(trimmedKey, "special"),
      loadAccountWizardVaultListingsRaw(trimmedKey),
      fetchJson<TokenInfo>(gw2AuthenticatedUrl("/tokeninfo", trimmedKey)).catch(() => null),
    ]);

    sectionPayloads = [daily, weekly, special];
    accountListings = normalizeAccountWizardVaultListings(accountListingsRaw);
    accountTokenInfo = tokenInfo;
    hasAccountProgress = true;
  } else {
    const [daily, weekly, special] = await Promise.all([
      loadPublicWizardVaultSection("daily"),
      loadPublicWizardVaultSection("weekly"),
      loadPublicWizardVaultSection("special"),
    ]);

    sectionPayloads = [daily, weekly, special];
    publicObjectiveRotationAvailable = sectionPayloads.some((section) => Boolean(section?.objectiveIds.length));
  }

  const objectiveIds = sectionPayloads.flatMap((section) => section?.objectiveIds ?? []);
  const objectiveDefinitions = objectiveIds.length
    ? await loadWizardVaultObjectiveDefinitions(objectiveIds)
    : new Map<number, WizardVaultObjectiveDefinition>();
  const objectiveCatalog = await objectiveCatalogPromise;

  onProgress?.("Loading Wizard's Vault store");
  const listings = await loadWizardVaultListings();
  const itemIds = Array.from(new Set(listings.map((listing) => listing.item_id)));
  await Promise.all([ensureCommercePrices(onProgress), loadItems(itemIds, onProgress)]);

  const purchaseCacheAccountId = accountTokenInfo?.id ?? (trimmedKey ? stableHash(trimmedKey) : "");
  const rememberedPurchases = purchaseCacheAccountId
    ? await loadCachedWizardVaultPurchases(purchaseCacheAccountId)
    : new Map<string, CachedWizardVaultPurchaseEntry>();
  const nextRememberedPurchases = new Map(rememberedPurchases);
  const livePurchaseCountsLookSuspicious =
    hasAccountProgress &&
    accountListings.limitedCount > 0 &&
    accountListings.nonZeroPurchasedCount === 0 &&
    accountListings.reportedZeroLimitedCount === accountListings.limitedCount;
  const now = Date.now();
  const valuedListings: WizardVaultListingValue[] = listings
    .map((listing) => {
      const value = getSellValue(listing.item_id, listing.item_count);
      const accountListing =
        accountListings.byListingId.get(listing.id) ?? accountListings.byItemId.get(listing.item_id);
      const purchaseCacheKey = getWizardVaultPurchaseCacheKey(listing);
      const remembered = rememberedPurchases.get(purchaseCacheKey);
      const apiPurchased = accountListing?.purchased ?? null;
      const apiLimit = accountListing?.purchaseLimit ?? null;
      const bestRememberedPurchased = remembered?.purchased ?? null;
      const useRemembered =
        bestRememberedPurchased !== null &&
        (apiPurchased === null || bestRememberedPurchased > apiPurchased);
      const purchased = useRemembered ? bestRememberedPurchased : apiPurchased;
      const purchaseLimit = apiLimit ?? remembered?.purchaseLimit ?? null;
      const purchaseSource: WizardVaultListingValue["purchaseSource"] = purchased === null
        ? "unavailable"
        : useRemembered
          ? "remembered"
          : "api";
      const purchaseReliable =
        purchaseSource === "remembered" ||
        !livePurchaseCountsLookSuspicious ||
        purchased === null ||
        purchased > 0;

      if (purchaseCacheAccountId && purchased !== null) {
        const previousPurchased = remembered?.purchased ?? -1;
        if (purchased > previousPurchased || remembered?.purchaseLimit !== purchaseLimit) {
          nextRememberedPurchases.set(purchaseCacheKey, {
            key: purchaseCacheKey,
            purchased,
            purchaseLimit,
            updatedAt: now,
          });
        }
      }

      return {
        listing,
        item: itemCache.get(listing.item_id),
        value,
        valuePerAcclaim: listing.cost > 0 ? value / listing.cost : 0,
        purchased,
        purchaseLimit,
        purchaseSource,
        purchaseReliable,
      };
    })
    .sort(
      (left, right) =>
        right.valuePerAcclaim - left.valuePerAcclaim ||
        right.value - left.value ||
        left.listing.cost - right.listing.cost,
    );
  if (purchaseCacheAccountId && nextRememberedPurchases.size > 0) {
    void saveCachedWizardVaultPurchases(purchaseCacheAccountId, nextRememberedPurchases);
  }

  return {
    sections: sectionPayloads
      .map((section, index) => {
        const id = (["daily", "weekly", "special"] as const)[index];
        return section ? normalizeWizardVaultSection(id, section.raw, objectiveDefinitions) : null;
      })
      .filter((section): section is WizardVaultObjectiveSection => Boolean(section)),
    listings: valuedListings,
    objectiveCatalog,
    hasAccountProgress,
    publicObjectiveRotationAvailable,
    purchaseCountWarning: livePurchaseCountsLookSuspicious
      ? "The official GW2 API reported 0 purchased for every limited Vault reward. This is a known API issue; remembered non-zero counts are kept, but fresh 0 values are marked as API-reported only."
      : undefined,
    updatedAt: Date.now(),
  };
}

function scoreCraftOpportunity(
  recipe: Gw2Recipe,
  output: Gw2Item,
  holdings: Map<number, number>,
): CraftOpportunity | null {
  if (!recipe.output_item_id || recipe.output_item_count <= 0) {
    return null;
  }

  const guide = buildRecipeGuide(recipe, holdings);

  if (guide.outputValue <= 0 || guide.marketCost <= 0) {
    return null;
  }

  return {
    recipe,
    output,
    outputValue: guide.outputValue,
    marketCost: guide.marketCost,
    marketProfit: guide.netProfit,
    personalCost: guide.personalCost,
    personalProfit: guide.personalProfit,
    ownedCoverage: guide.ownedCoverage,
  };
}

export async function analyzeAccount(
  apiKey: string,
  onProgress?: ProgressCallback,
  options: { forceRefresh?: boolean } = {},
): Promise<AccountAnalysis> {
  onProgress?.("Loading account snapshot");
  const [account, officialRecipes, wikiMysticRecipes, allItems] = await Promise.all([
    loadAccountSnapshot(apiKey, { forceRefresh: options.forceRefresh }),
    loadAllRecipes(onProgress),
    loadWikiMysticForgeRecipes(onProgress).catch(() => []),
    loadAllItemsCatalog(onProgress).catch(() => []),
    ensureCommercePrices(onProgress),
  ]).then(([account, officialRecipes, wikiMysticRecipes, allItems]) => [account, officialRecipes, wikiMysticRecipes, allItems] as const);
  const recipes = dedupeRecipes([...officialRecipes, ...wikiMysticRecipes]);
  const ingredientIds = Array.from(
    new Set(recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.item_id))),
  );
  const outputIds = Array.from(
    new Set(
      recipes
        .map((recipe) => recipe.output_item_id)
        .filter((id): id is number => typeof id === "number"),
    ),
  );

  await loadItems([...ingredientIds, ...outputIds], onProgress);

  onProgress?.("Ranking craft opportunities");
  const opportunities = recipes
    .map((recipe) => {
      const output = recipe.output_item_id ? itemCache.get(recipe.output_item_id) : undefined;
      return output ? scoreCraftOpportunity(recipe, output, account.holdings) : null;
    })
    .filter((item): item is CraftOpportunity => Boolean(item))
    .filter((item) => item.personalProfit > 0 || item.marketProfit > 0)
    .sort((left, right) => right.personalProfit - left.personalProfit)
    .slice(0, 24);

  onProgress?.("Ranking legendary readiness");
  const unlockedRecipes = new Set(account.recipes);
  const legendaryOutputRecipes = recipes.filter((recipe) => {
    const item = recipe.output_item_id ? itemCache.get(recipe.output_item_id) : undefined;
    return Boolean(item && isLegendaryReadinessOutput(item));
  });
  const legendaryExoticIngredientIds = getLegendaryReadinessExoticIngredientIds(legendaryOutputRecipes);
  const legendaryUniqueIngredientIds = getLegendaryReadinessUniqueIngredientIds(
    legendaryOutputRecipes,
    recipes,
  );
  const legendaryItemIds = new Set(
    allItems
      .filter((item) => item.rarity === "Legendary")
      .map((item) => item.id),
  );
  const legendaryCandidates = [
    ...Array.from(legendaryItemIds)
      .map((itemId) => {
        const item = itemCache.get(itemId);
        if (!item) {
          return null;
        }

        const recipe = selectBestReadinessRecipeForItem(item.id, recipes, account.holdings)
          ?? createDirectLegendaryIngredientRecipe(item);
        return buildLegendaryReadinessEntry(
          item,
          recipe,
          account.holdings,
          recipe.id < 0 || unlockedRecipes.has(recipe.id),
        );
      })
      .filter((item): item is LegendaryReadiness => Boolean(item)),
    ...legendaryOutputRecipes
      .map((recipe) => {
        const item = recipe.output_item_id ? itemCache.get(recipe.output_item_id) : undefined;
        return item
          ? buildLegendaryReadinessEntry(item, recipe, account.holdings, unlockedRecipes.has(recipe.id))
          : null;
      })
      .filter((item): item is LegendaryReadiness => Boolean(item)),
    ...Array.from(new Set([...legendaryExoticIngredientIds, ...legendaryUniqueIngredientIds]))
      .map((itemId) => {
        const item = itemCache.get(itemId);
        if (!item) {
          return null;
        }

        const recipe = selectBestReadinessRecipeForItem(item.id, recipes, account.holdings)
          ?? createDirectLegendaryIngredientRecipe(item);
        return buildLegendaryReadinessEntry(
          item,
          recipe,
          account.holdings,
          recipe.id < 0 || unlockedRecipes.has(recipe.id),
        );
      })
      .filter((item): item is LegendaryReadiness => Boolean(item)),
  ];
  const bestLegendaryByItemId = new Map<number, LegendaryReadiness>();
  for (const candidate of legendaryCandidates) {
    const previous = bestLegendaryByItemId.get(candidate.item.id);
    if (!previous || compareLegendaryReadinessCandidate(candidate, previous) < 0) {
      bestLegendaryByItemId.set(candidate.item.id, candidate);
    }
  }
  const legendaries = Array.from(bestLegendaryByItemId.values()).sort((left, right) => {
    if (right.ownedCoverage !== left.ownedCoverage) {
      return right.ownedCoverage - left.ownedCoverage;
    }

    return left.personalCost - right.personalCost;
  });

  return {
    account,
    opportunities,
    legendaries,
  };
}

function isLegendaryReadinessOutput(item: Gw2Item): boolean {
  if (item.rarity === "Legendary") {
    return true;
  }

  if (LEGENDARY_READINESS_OUTPUT_NAMES.has(item.name)) {
    return true;
  }

  return LEGENDARY_READINESS_OUTPUT_PATTERNS.some((pattern) => pattern.test(item.name));
}

function getLegendaryReadinessExoticIngredientIds(recipes: Gw2Recipe[]): Set<number> {
  const itemIds = new Set<number>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const item = itemCache.get(ingredient.item_id);
      if (item && isLegendaryReadinessExoticIngredient(item)) {
        itemIds.add(item.id);
      }
    }
  }

  return itemIds;
}

function getLegendaryReadinessUniqueIngredientIds(
  legendaryRecipes: Gw2Recipe[],
  allRecipes: Gw2Recipe[],
): Set<number> {
  const itemIds = new Set<number>();
  const allRecipeUseCounts = countRecipeIngredientUses(allRecipes);
  const legendaryRecipeUseCounts = countRecipeIngredientUses(legendaryRecipes);

  for (const itemId of legendaryRecipeUseCounts.keys()) {
    const item = itemCache.get(itemId);
    if (!item) {
      continue;
    }

    if (
      isLegendaryReadinessUniqueIngredient(
        item,
        allRecipeUseCounts.get(itemId) ?? 0,
        legendaryRecipeUseCounts.get(itemId) ?? 0,
      )
    ) {
      itemIds.add(item.id);
    }
  }

  return itemIds;
}

function countRecipeIngredientUses(recipes: Gw2Recipe[]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const recipe of recipes) {
    const recipeIngredientIds = new Set(recipe.ingredients.map((ingredient) => ingredient.item_id));
    for (const itemId of recipeIngredientIds) {
      counts.set(itemId, (counts.get(itemId) ?? 0) + 1);
    }
  }

  return counts;
}

function isLegendaryReadinessExoticIngredient(item: Gw2Item): boolean {
  return (
    item.rarity === "Exotic" &&
    LEGENDARY_READINESS_EXOTIC_INGREDIENT_TYPES.has(item.type)
  );
}

function isLegendaryReadinessUniqueIngredient(
  item: Gw2Item,
  allRecipeUseCount: number,
  legendaryRecipeUseCount: number,
): boolean {
  if (isLegendaryReadinessOutput(item) || isLegendaryReadinessExoticIngredient(item)) {
    return true;
  }

  if (LEGENDARY_READINESS_EXCLUDED_UNIQUE_INGREDIENT_TYPES.has(item.type)) {
    return false;
  }

  if (LEGENDARY_READINESS_UNIQUE_INGREDIENT_PATTERNS.some((pattern) => pattern.test(item.name))) {
    return true;
  }

  if (!LEGENDARY_READINESS_UNIQUE_INGREDIENT_TYPES.has(item.type)) {
    return false;
  }

  return legendaryRecipeUseCount > 0 && allRecipeUseCount === legendaryRecipeUseCount;
}

function buildLegendaryReadinessEntry(
  item: Gw2Item,
  recipe: Gw2Recipe,
  holdings: Map<number, number>,
  recipeUnlocked: boolean,
): LegendaryReadiness {
  const guide = buildRecipeGuide(recipe, holdings);
  const ownedCoverage = getLegendaryReadinessOwnedCoverage(recipe, holdings);

  return {
    item,
    recipe,
    outputValue: guide.outputValue,
    marketCost: guide.marketCost,
    personalCost: guide.personalCost,
    ownedCoverage,
    recipeUnlocked,
  };
}

function getLegendaryReadinessOwnedCoverage(
  recipe: Gw2Recipe,
  holdings: Map<number, number>,
): number {
  const ingredients = recipe.ingredients.filter((ingredient) => ingredient.count > 0);
  if (ingredients.length === 0) {
    const outputId = recipe.output_item_id;
    const outputCount = Math.max(1, recipe.output_item_count);
    return outputId && (holdings.get(outputId) ?? 0) >= outputCount ? 1 : 0;
  }

  const totalCoverage = ingredients.reduce((sum, ingredient) => {
    const ownedCount = holdings.get(ingredient.item_id) ?? 0;
    return sum + Math.min(1, ownedCount / ingredient.count);
  }, 0);

  return totalCoverage / ingredients.length;
}

function selectBestReadinessRecipeForItem(
  itemId: number,
  recipes: Gw2Recipe[],
  holdings: Map<number, number>,
): Gw2Recipe | null {
  const candidates = recipes.filter((recipe) => recipe.output_item_id === itemId);
  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((best, recipe) => {
    const bestGuide = buildRecipeGuide(best, holdings);
    const recipeGuide = buildRecipeGuide(recipe, holdings);
    if (recipeGuide.personalCost !== bestGuide.personalCost) {
      return recipeGuide.personalCost < bestGuide.personalCost ? recipe : best;
    }

    if (recipeGuide.marketCost !== bestGuide.marketCost) {
      return recipeGuide.marketCost < bestGuide.marketCost ? recipe : best;
    }

    return recipe.id < best.id ? recipe : best;
  }, candidates[0]);
}

function createDirectLegendaryIngredientRecipe(item: Gw2Item): Gw2Recipe {
  return {
    id: LEGENDARY_READINESS_DIRECT_RECIPE_ID_BASE - item.id,
    type: "Legendary Ingredient",
    output_item_id: item.id,
    output_item_count: 1,
    time_to_craft_ms: 0,
    disciplines: [],
    min_rating: 0,
    flags: [],
    ingredients: [{ item_id: item.id, count: 1 }],
    source: "wiki",
    sourceName: "Legendary ingredient",
  };
}

function compareLegendaryReadinessCandidate(
  left: LegendaryReadiness,
  right: LegendaryReadiness,
): number {
  if (right.ownedCoverage !== left.ownedCoverage) {
    return left.ownedCoverage > right.ownedCoverage ? -1 : 1;
  }

  if (left.personalCost !== right.personalCost) {
    return left.personalCost - right.personalCost;
  }

  if (left.marketCost !== right.marketCost) {
    return left.marketCost - right.marketCost;
  }

  return left.recipe.id - right.recipe.id;
}

export function formatCoin(value: number): string {
  const safeValue = Math.max(0, Math.round(value));
  const gold = Math.floor(safeValue / 10_000);
  const silver = Math.floor((safeValue % 10_000) / 100);
  const copper = safeValue % 100;

  if (gold > 0) {
    return `${gold}g ${silver}s ${copper}c`;
  }

  if (silver > 0) {
    return `${silver}s ${copper}c`;
  }

  return `${copper}c`;
}

export function getStoredItem(itemId: number): Gw2Item | undefined {
  return itemCache.get(itemId);
}

export function getStoredItemByName(itemName: string): Gw2Item | undefined {
  const normalizedName = normalizeWikiLookupName(itemName);
  for (const item of itemCache.values()) {
    if (normalizeWikiLookupName(item.name) === normalizedName) {
      return item;
    }
  }

  return undefined;
}

export function getStoredPrice(itemId: number): CommercePrice | undefined {
  return priceCache.get(itemId);
}
