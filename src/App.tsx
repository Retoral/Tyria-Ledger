import {
  AlertCircle,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Database,
  ExternalLink,
  Hammer,
  Home,
  KeyRound,
  ListChecks,
  Loader2,
  PackageSearch,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  Trophy,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  analyzeAccount,
  checkApiStatuses,
  getStoredItem,
  getStoredPrice,
  hydrateTradingPostCatalogCache,
  loadAchievementCatalog,
  loadContainerAnalysis,
  loadGatherableItems,
  loadGatheringLocations,
  loadAccountSnapshot,
  loadHighValueCrafts,
  loadItems,
  loadListings,
  loadMaps,
  loadOpenableBagItems,
  loadPermanentGatheringNodes,
  loadProfitableCrafts,
  loadRecipesForOutput,
  loadRecipesUsingItem,
  loadSlotBagItems,
  loadTradingPostCatalogProgressive,
  loadTransactionsForItem,
  loadWizardVault,
  loadWizardVaultObjectiveGuide,
  loadWikiGuide,
  loadWikiItemAcquisition,
} from "./services/gw2";
import type {
  AccountAnalysis,
  AccountAchievement,
  AccountCharacter,
  AccountItemStack,
  AccountMaterial,
  AccountSnapshot,
  AchievementBit,
  AchievementCatalog,
  AchievementCategory,
  AchievementGroup,
  ApiStatusResult,
  ContainerAnalysis,
  ContainerDrop,
  CommerceListings,
  CraftOpportunity,
  GatherableItemSource,
  GatheringDiscipline,
  GatheringLocationInfo,
  GatheringNodeYield,
  Gw2Achievement,
  Gw2Item,
  Gw2Map,
  ItemTransactions,
  MarketItem,
  PermanentGatheringNode,
  RecipeGuide,
  WikiGuide,
  WikiItemAcquisition,
  WikiVendorOffer,
  WizardVaultObjectiveDefinition,
  WizardVaultObjectiveGuide,
  WizardVaultObjectiveProgress,
  WizardVaultObjectiveSection,
  WizardVaultListingValue,
  WizardVaultSnapshot,
} from "./types";

type LoadState = "idle" | "loading" | "ready" | "error";
type ActivePage = string;
type SpeedLabel = "Quickest" | "Fast" | "Moderate" | "Slowest";

interface GoldSuggestion {
  title: string;
  detail: string;
  value: string;
  valueCoin?: number;
  speed: SpeedLabel;
  source: "Personal" | "General";
}

interface NavItem {
  id: ActivePage;
  label: string;
  icon: ReactNode;
}

interface SidebarGroup {
  title: string;
  items: NavItem[];
}

interface GuideLocation {
  label: string;
  map: string;
  waypoint?: string;
  note: string;
  wikiUrl?: string;
  continentCoord?: [number, number];
  zoom?: number;
}

interface GuideDefinition {
  title: string;
  summary: string;
  steps: string[];
  locations: GuideLocation[];
}

interface ActivityGuideDefinition extends GuideDefinition {
  id: string;
  category: string;
  speed: SpeedLabel;
  tips: string[];
}

interface MetaFarmEstimate {
  name: string;
  map: string;
  expansion: string;
  cadence: string;
  duration: string;
  goldMin: number;
  goldMax: number;
  access: string;
  confidence: "High" | "Medium" | "Variable";
  wikiUrl: string;
}

type AchievementFilter = "unfinished" | "completed" | "all";

interface AchievementView {
  achievement: Gw2Achievement;
  category?: AchievementCategory;
  group?: AchievementGroup;
  progress?: AccountAchievement;
  completed: boolean;
  current: number;
  max: number;
  percent: number;
  earnedPoints: number;
}

interface AchievementStep {
  key: string;
  title: string;
  detail: string;
  completed: boolean;
  item?: Gw2Item;
  chatLink?: string;
}

type HistoryRangeId = "24h" | "1w" | "1m" | "3m" | "6m" | "12m" | "2y" | "5y" | "all";

interface HistoryRange {
  id: HistoryRangeId;
  label: string;
  hours?: number;
  days?: number;
}

interface MarketHistoryPoint {
  itemId: number;
  recordedAt: string;
  buyPrice: number;
  sellPrice: number;
  buyQuantity: number;
  sellQuantity: number;
  rollup?: MarketHistoryRollup;
  sampleCount?: number;
}

type MarketHistoryRollup = "raw" | "day" | "week" | "month";

interface MarketHistoryImportResult {
  added: number;
  ignored: number;
  total: number;
}

interface ChartPoint {
  id: string;
  label: string;
  kind: "buy" | "sell" | "purchase" | "sale" | "posted-buy" | "posted-sell";
  time: number;
  value: number;
  quantity?: number;
}

type ImportState = LoadState | "missing";

interface DataImportRow {
  id: string;
  label: string;
  detail: string;
  state: ImportState;
  updatedAt: number | null;
}

interface IngredientCraftRouteSummary {
  craftCost: number;
  marketCost: number;
  vendorCost: number;
  vendorOffer?: WikiVendorOffer;
  hasCraftRoute: boolean;
}

const ingredientCraftRouteCache = new Map<string, Promise<IngredientCraftRouteSummary | null>>();

type FarmTrackerMode = "account" | "character";

interface FarmTrackerStoredState {
  scopeKey: string;
  dateKey: string;
  startedAt: number;
  lastUpdatedAt: number;
  lastHoldings: Array<[number, number]>;
  gained: Array<[number, number]>;
}

interface ActivityValueItem {
  name: string;
  source: string;
  note: string;
}

interface ActivityValueDefinition {
  title: string;
  summary: string;
  items: ActivityValueItem[];
}

interface SalvageOutputEstimate {
  name: string;
  averageCount: number;
  note?: string;
}

interface SalvageProfile {
  outputs: SalvageOutputEstimate[];
  note: string;
  confidence: "Known from wiki" | "Estimated from level/rarity" | "Unmodeled";
  tierLabel: string;
  familyLabel: string;
}

interface MarketQuote {
  item?: MarketItem;
  buyCost: number;
  instantSellNet: number;
  listedSellNet: number;
}

interface SalvageEstimateRow {
  item: MarketItem;
  purchaseCost: number;
  directSellNet: number;
  salvageValue: number;
  buySalvageProfit: number;
  salvageInsteadOfSell: number;
  outputs: SalvageOutputEstimate[];
  confidence: SalvageProfile["confidence"];
  familyLabel: string;
  tierLabel: string;
  note: string;
}

interface UnidentifiedGearDefinition {
  tier: string;
  itemId: number;
  label: string;
  aliases: string[];
  outputs: SalvageOutputEstimate[];
  note: string;
}

interface FishingRouteInfo {
  name: string;
  expansion: string;
  bait: string;
  fishingPower: string;
  map: string;
  valueFocus: string;
}

interface BuildSource {
  profession: string;
  source: string;
  mode: string;
  title: string;
  role: string;
  url: string;
  note: string;
}

type MarketScopeId = "global" | "region:north-america" | "region:europe";
type WizardVaultSectionFilter = WizardVaultObjectiveSection["id"];
type WizardVaultTrackFilter = "all" | "PvE" | "PvP" | "WvW";

const DEFAULT_QUERY = "";
const MARKET_SCOPE_STORAGE_KEY = "tyria-ledger.market-scope.v1";
const MARKET_HISTORY_STORAGE_KEY = "tyria-ledger.market-history.v1";
const FARM_TRACKER_STORAGE_KEY = "tyria-ledger.farm-tracker.v1";
const MARKET_AUTO_SCAN_MIN_DELAY_MS = 1000;
const MARKET_SCAN_COOLDOWN_MS = 10 * 60 * 1000;
const MAX_MARKET_HISTORY_POINTS_PER_ITEM = 800;
const MARKET_HISTORY_REPLACE_WINDOW_MS = 10 * 60 * 1000;
const MARKET_HISTORY_RAW_WINDOW_MS = 24 * 60 * 60 * 1000;
const MARKET_HISTORY_DAILY_WINDOW_MS = 31 * 24 * 60 * 60 * 1000;
const MARKET_HISTORY_WEEKLY_WINDOW_MS = 366 * 24 * 60 * 60 * 1000;
const MARKET_PRELOAD_DELAY_MS = 500;
const MARKET_LIST_INITIAL_ITEMS = 220;
const MARKET_LIST_BATCH_SIZE = 360;
const OPENABLE_BAG_ANALYSIS_LIMIT = 90;
const OPENABLE_BAG_ANALYSIS_CONCURRENCY = 3;
const HISTORY_RANGES: HistoryRange[] = [
  { id: "24h", label: "24H", hours: 24 },
  { id: "1w", label: "1W", days: 7 },
  { id: "1m", label: "1M", days: 31 },
  { id: "3m", label: "3M", days: 93 },
  { id: "6m", label: "6M", days: 186 },
  { id: "12m", label: "12M", days: 366 },
  { id: "2y", label: "2Y", days: 732 },
  { id: "5y", label: "5Y", days: 1830 },
  { id: "all", label: "All" },
];

const SALVAGE_ROW_LIMIT = 300;
const SALVAGE_OUTPUT_PRICE_NAMES = [
  "Glob of Ectoplasm",
  "Pile of Crystalline Dust",
  "Pile of Incandescent Dust",
  "Pile of Luminous Dust",
  "Pile of Radiant Dust",
  "Pile of Shimmering Dust",
  "Pile of Glittering Dust",
  "Orichalcum Ore",
  "Mithril Ore",
  "Platinum Ore",
  "Iron Ore",
  "Copper Ore",
  "Ancient Wood Log",
  "Elder Wood Log",
  "Hard Wood Log",
  "Seasoned Wood Log",
  "Soft Wood Log",
  "Green Wood Log",
  "Hardened Leather Section",
  "Thick Leather Section",
  "Rugged Leather Section",
  "Coarse Leather Section",
  "Thin Leather Section",
  "Rawhide Leather Section",
  "Gossamer Scrap",
  "Silk Scrap",
  "Linen Scrap",
  "Cotton Scrap",
  "Wool Scrap",
  "Jute Scrap",
  "Pile of Lucent Crystal",
  "Lucent Mote",
];
const SALVAGE_MATERIAL_TIERS = [
  {
    maxLevel: 15,
    label: "Tier 1 / level 1-15",
    metal: "Copper Ore",
    wood: "Green Wood Log",
    leather: "Rawhide Leather Section",
    cloth: "Jute Scrap",
    dust: "Pile of Glittering Dust",
  },
  {
    maxLevel: 39,
    label: "Tier 2 / level 16-39",
    metal: "Iron Ore",
    wood: "Soft Wood Log",
    leather: "Thin Leather Section",
    cloth: "Wool Scrap",
    dust: "Pile of Shimmering Dust",
  },
  {
    maxLevel: 54,
    label: "Tier 3 / level 40-54",
    metal: "Platinum Ore",
    wood: "Seasoned Wood Log",
    leather: "Coarse Leather Section",
    cloth: "Cotton Scrap",
    dust: "Pile of Radiant Dust",
  },
  {
    maxLevel: 69,
    label: "Tier 4 / level 55-69",
    metal: "Mithril Ore",
    wood: "Hard Wood Log",
    leather: "Rugged Leather Section",
    cloth: "Linen Scrap",
    dust: "Pile of Luminous Dust",
  },
  {
    maxLevel: 80,
    label: "Tier 5 / level 70-80",
    metal: "Mithril Ore",
    wood: "Elder Wood Log",
    leather: "Thick Leather Section",
    cloth: "Silk Scrap",
    dust: "Pile of Crystalline Dust",
  },
] as const;
const SALVAGE_FAMILY_LABELS = {
  metal: "Metal",
  wood: "Wood",
  leather: "Leather",
  cloth: "Cloth",
} as const;
type SalvageMaterialFamily = keyof typeof SALVAGE_FAMILY_LABELS;
const FINE_GEAR_OUTPUTS: SalvageOutputEstimate[] = [
  { name: "Mithril Ore", averageCount: 0.35 },
  { name: "Elder Wood Log", averageCount: 0.25 },
  { name: "Thick Leather Section", averageCount: 0.2 },
  { name: "Silk Scrap", averageCount: 0.2 },
];
const MASTERWORK_GEAR_OUTPUTS: SalvageOutputEstimate[] = [
  { name: "Mithril Ore", averageCount: 0.45 },
  { name: "Elder Wood Log", averageCount: 0.35 },
  { name: "Thick Leather Section", averageCount: 0.25 },
  { name: "Silk Scrap", averageCount: 0.25 },
];
const RARE_GEAR_OUTPUTS: SalvageOutputEstimate[] = [
  { name: "Glob of Ectoplasm", averageCount: 0.875 },
  { name: "Pile of Crystalline Dust", averageCount: 0.12 },
];
const EXOTIC_GEAR_OUTPUTS: SalvageOutputEstimate[] = [
  { name: "Glob of Ectoplasm", averageCount: 1.15 },
  { name: "Pile of Crystalline Dust", averageCount: 0.28 },
];
const UNIDENTIFIED_GEAR_DEFINITIONS: UnidentifiedGearDefinition[] = [
  {
    tier: "Fine",
    itemId: 84731,
    label: "Piece of Unidentified Gear",
    aliases: ["Piece of Unidentified Gear", "Unidentified Gear", "Fine Unidentified Gear"],
    outputs: FINE_GEAR_OUTPUTS,
    note: "Rough open-and-salvage basket for fine equipment. Actual material family and luck output vary by opened item.",
  },
  {
    tier: "Common",
    itemId: 85016,
    label: "Piece of Common Unidentified Gear",
    aliases: [
      "Piece of Common Unidentified Gear",
      "Common Unidentified Gear",
      "Piece of Uncommon Unidentified Gear",
      "Uncommon Unidentified Gear",
    ],
    outputs: MASTERWORK_GEAR_OUTPUTS,
    note: "Rough open-and-salvage basket for common unidentified gear. Exact value depends on the opened item family and salvage kit.",
  },
  {
    tier: "Rare",
    itemId: 83008,
    label: "Piece of Rare Unidentified Gear",
    aliases: ["Piece of Rare Unidentified Gear", "Rare Unidentified Gear", "Unidentified Rare Gear"],
    outputs: RARE_GEAR_OUTPUTS,
    note: "Estimated from the rare gear salvage anchor. Exact outcomes vary by opened item and salvage kit.",
  },
];

type SlotBagSourceKind = "Crafted" | "Vendor" | "Achievement" | "Story" | "Reward" | "Unobtainable" | "Unknown";

interface SlotBagSourceNote {
  kind: SlotBagSourceKind;
  source: string;
  detail: string;
  cost?: string;
}

const SLOT_BAG_SOURCE_NOTES: Record<string, SlotBagSourceNote> = {
  "Leather Bag": {
    kind: "Vendor",
    source: "Various vendors or level 3 reward",
    detail: "Small starter bag sold by common vendors. A soulbound 8-slot variant is also used as a level reward.",
    cost: "Vendor price: 32 copper for the 4-slot vendor version.",
  },
  "Red Leather Bag": {
    kind: "Vendor",
    source: "Various vendors",
    detail: "Colored 5-slot vendor bag.",
    cost: "Vendor price: 32 copper.",
  },
  "Orange Leather Bag": {
    kind: "Vendor",
    source: "Various vendors",
    detail: "Colored 5-slot vendor bag.",
    cost: "Vendor price: 32 copper.",
  },
  "Yellow Leather Bag": {
    kind: "Vendor",
    source: "Various vendors",
    detail: "Colored 5-slot vendor bag.",
    cost: "Vendor price: 32 copper.",
  },
  "Green Leather Bag": {
    kind: "Vendor",
    source: "Various vendors",
    detail: "Colored 5-slot vendor bag.",
    cost: "Vendor price: 32 copper.",
  },
  "Blue Leather Bag": {
    kind: "Vendor",
    source: "Various vendors",
    detail: "Colored 5-slot vendor bag.",
    cost: "Vendor price: 32 copper.",
  },
  "Purple Leather Bag": {
    kind: "Vendor",
    source: "Various vendors",
    detail: "Colored 5-slot vendor bag.",
    cost: "Vendor price: 32 copper.",
  },
  "Pillager's Pack (18 slots)": {
    kind: "Vendor",
    source: "WvW Outfitter",
    detail: "Basic WvW bag purchased from an Outfitter.",
    cost: "75 Badges of Honor + 1g 50s.",
  },
  "Siegemaster's Satchel (rare)": {
    kind: "Vendor",
    source: "WvW Outfitter",
    detail: "Consumable-priority WvW bag purchased from an Outfitter.",
    cost: "75 Badges of Honor + 1g 50s.",
  },
  "Halloween Pail": {
    kind: "Vendor",
    source: "Halloween Vendor",
    detail: "Festival 20-slot bag purchased during Halloween.",
    cost: "3 Candy Corn Cobs.",
  },
  "Large Wintersday Gift": {
    kind: "Vendor",
    source: "Charity Corps Seraph",
    detail: "Festival 20-slot bag purchased during Wintersday.",
    cost: "7,000 karma + 5 Snow Diamonds.",
  },
  "20 Slot Fractal Uncommon Equipment Box": {
    kind: "Vendor",
    source: "BUY-4373",
    detail: "Fractal equipment-priority bag for uncommon equipment.",
    cost: "150 Fractal Relics + 10s 08c.",
  },
  "20 Slot Fractal Rare Equipment Box": {
    kind: "Vendor",
    source: "BUY-4373",
    detail: "Fractal equipment-priority bag for rare equipment.",
    cost: "200 Fractal Relics + 15s 12c.",
  },
  "20 Slot Fractal Exotic Equipment Box": {
    kind: "Vendor",
    source: "BUY-4373",
    detail: "Fractal equipment-priority bag for exotic equipment.",
    cost: "250 Fractal Relics + 20s 16c.",
  },
  "Siegemaster's Satchel": {
    kind: "Vendor",
    source: "WvW Outfitter",
    detail: "20-slot consumable-priority WvW bag.",
    cost: "350 Badges of Honor + 7g.",
  },
  "Pillager's Pack (20 slots)": {
    kind: "Vendor",
    source: "WvW Outfitter",
    detail: "20-slot WvW bag that upgrades into larger Pillager's Packs.",
    cost: "350 Badges of Honor + 7g.",
  },
  "Pillager's Pack (24 slots)": {
    kind: "Vendor",
    source: "WvW Outfitter upgrade",
    detail: "Upgrade from the 20-slot Pillager's Pack.",
    cost: "Previous tier + Supreme Rune of Holding + WvW currencies.",
  },
  "Pillager's Pack (28 slots)": {
    kind: "Vendor",
    source: "WvW Outfitter upgrade",
    detail: "Upgrade from the 24-slot Pillager's Pack.",
    cost: "Previous tier + 3 Supreme Runes of Holding + WvW currencies.",
  },
  "Pillager's Pack (32 slots)": {
    kind: "Vendor",
    source: "WvW Outfitter upgrade",
    detail: "Upgrade from the 28-slot Pillager's Pack.",
    cost: "Previous tier + 8 Supreme Runes of Holding + WvW currencies.",
  },
  "Leather Bag (8 slots)": {
    kind: "Story",
    source: "Personal story level 10",
    detail: "Rewarded through the personal story.",
  },
  "8 Slot Invisible Bag": {
    kind: "Story",
    source: "Personal story level 30 or crafting",
    detail: "An account-bound version is rewarded by the story; tradeable versions are crafted.",
  },
  "Leather Bag (10 slots)": {
    kind: "Achievement",
    source: "100 achievement points",
    detail: "Achievement Chest reward.",
  },
  "Leather Bag (exotic 10 slots)": {
    kind: "Achievement",
    source: "Tutorial achievements",
    detail: "Tutorial achievement reward.",
  },
  "10 Slot Trick-or-Treat Bag": {
    kind: "Reward",
    source: "Ascent to Madness",
    detail: "First-time completion reward from the Halloween instance.",
  },
  "Leather Bag (12 slots)": {
    kind: "Story",
    source: "Personal story level 20",
    detail: "Rewarded through the personal story.",
  },
  "Leather Bag (15 slots)": {
    kind: "Reward",
    source: "Level-80 Boost Package",
    detail: "Four 15-slot bags are included in the boost package.",
  },
  "Leather Bag (18 slots)": {
    kind: "Story",
    source: "Personal story level 70",
    detail: "Rewarded through the personal story.",
  },
  "Uncanny Jar": {
    kind: "Achievement",
    source: "Uncanny Canner",
    detail: "Achievement reward.",
  },
  "Rox's Reinforced Treat Bag": {
    kind: "Reward",
    source: "A Quiet Celebration",
    detail: "First-time Living World reward.",
  },
  "Marjory's Tool Belt": {
    kind: "Reward",
    source: "Case Closed",
    detail: "First-time Living World reward.",
  },
  "Braham's Trophy Bag": {
    kind: "Reward",
    source: "Picking Up the Pieces",
    detail: "First-time Living World reward.",
  },
  "Kasmeer's Illusioned Coin Purse": {
    kind: "Reward",
    source: "Awake and Allied",
    detail: "First-time Living World reward.",
  },
  "Taimi's Coffer of Holding": {
    kind: "Reward",
    source: "After the Battle",
    detail: "First-time Living World reward.",
  },
  "Bandit Coin Purse": {
    kind: "Achievement",
    source: "Bandit Weapons Specialist",
    detail: "Achievement reward.",
  },
  "Simple Olmakhan Bandolier": {
    kind: "Achievement",
    source: "The Charge",
    detail: "First-time instance completion via the achievement. Later Olmakhan tiers require donating the previous tier.",
  },
  "20-Slot Tengu Bag": {
    kind: "Achievement",
    source: "Tengu Weapon Collector Tier 4",
    detail: "Achievement reward with container and invisible-bag behavior.",
  },
  "Simple Boreal Canteen": {
    kind: "Achievement",
    source: "Master of the Ancestral Forge Tier 5",
    detail: "Achievement reward and first Boreal bag tier.",
  },
  "Hero's Trusty Satchel": {
    kind: "Achievement",
    source: "New Hero Jump Start",
    detail: "Achievement reward.",
  },
  "20-Slot Fractally Stitched Pouch": {
    kind: "Achievement",
    source: "Fractal Incursion",
    detail: "Achievement reward.",
  },
  "Mail Carrier Satchel": {
    kind: "Reward",
    source: "Guild Wars 2 newsletter",
    detail: "Rewarded for subscribing to Guild Wars 2 and ArenaNet newsletters.",
  },
  "Handwoven Olmakhan Bandolier": {
    kind: "Achievement",
    source: "Lasting Bonds: Where We Come From",
    detail: "Olmakhan upgrade tier. Requires donating the previous tier.",
  },
  "Sturdy Boreal Duffel": {
    kind: "Achievement",
    source: "Master of the Ancestral Forge Tier 7",
    detail: "Achievement reward and Boreal upgrade tier.",
  },
  "Pocketed Olmakhan Bandolier": {
    kind: "Achievement",
    source: "Lasting Bonds: What We Do Here",
    detail: "Olmakhan upgrade tier. Requires donating the previous tier.",
  },
  "Reinforced Olmakhan Bandolier": {
    kind: "Achievement",
    source: "Lasting Bonds: What Comes Next",
    detail: "Final Olmakhan upgrade tier. Requires donating the previous tier.",
  },
  "Reinforced Boreal Trunk": {
    kind: "Achievement",
    source: "Illuminated Boreal Weapons",
    detail: "Achievement reward and final Boreal tier.",
  },
  "32-Slot Hero's Trusty Backpack": {
    kind: "Achievement",
    source: "Seasons of the Dragons Tier 3",
    detail: "Achievement reward.",
  },
  "Rox's Treat Bag": {
    kind: "Unobtainable",
    source: "Flame and Frost: The Razing",
    detail: "Historical Living World reward, no longer obtainable.",
  },
  "15-Slot Gift Box": {
    kind: "Unobtainable",
    source: "Wintersday: The Wondrous Workshop of Toymaker Tixx",
    detail: "Historical Wintersday reward, no longer obtainable.",
  },
  "Ancient Karka Shell Box": {
    kind: "Unobtainable",
    source: "The Lost Shores",
    detail: "Historical reward, no longer obtainable.",
  },
  "Soldier's Bag": {
    kind: "Unobtainable",
    source: "Old PvP rewards",
    detail: "Historical PvP reward, no longer obtainable.",
  },
  "Soldier's Satchel": {
    kind: "Unobtainable",
    source: "Old PvP rewards",
    detail: "Historical PvP reward, no longer obtainable.",
  },
  "Soldier's Ruck": {
    kind: "Unobtainable",
    source: "Old PvP rewards",
    detail: "Historical PvP reward, no longer obtainable.",
  },
  "Soldier's Sack": {
    kind: "Unobtainable",
    source: "Glory Rewards Vendor",
    detail: "Historical PvP vendor item, no longer obtainable.",
  },
  "Soldier's Pack": {
    kind: "Unobtainable",
    source: "Glory Rewards Vendor",
    detail: "Historical PvP vendor item, no longer obtainable.",
  },
  "Soldier's Backpack": {
    kind: "Unobtainable",
    source: "Glory Rewards Vendor",
    detail: "Historical PvP vendor item, no longer obtainable.",
  },
  "Soldier's Duffel": {
    kind: "Unobtainable",
    source: "Glory Rewards Vendor",
    detail: "Historical PvP vendor item, no longer obtainable.",
  },
};

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "My GW2 Account",
    items: [
      { id: "account", label: "Your GW2 Account", icon: <Home /> },
      { id: "account-items", label: "Account Items", icon: <Boxes /> },
      { id: "wizard-vault", label: "Wizard's Vault", icon: <Coins /> },
      { id: "account-achievements", label: "Achievements", icon: <Trophy /> },
      { id: "farming-builds", label: "Farming Builds", icon: <ShieldCheck /> },
      { id: "farming-guides", label: "Farming Guides", icon: <BookOpen /> },
      { id: "farming-tracker", label: "Farming Tracker", icon: <ListChecks /> },
      { id: "farming-calculator", label: "Farming Calculator", icon: <Database /> },
    ],
  },
  {
    title: "Market",
    items: [
      { id: "market", label: "Trading Post", icon: <PackageSearch /> },
      { id: "crafting", label: "Crafting Planner", icon: <Hammer /> },
      { id: "profitable-crafts", label: "Profitable Crafts", icon: <TrendingUp /> },
      { id: "legendary-readiness", label: "Legendary Readiness", icon: <ShieldCheck /> },
    ],
  },
  {
    title: "Open World Farming",
    items: [
      { id: "open-world", label: "Open World Farming", icon: <TrendingUp /> },
      { id: "drizzlewood-donation", label: "Drizzlewood Material Donation", icon: <Database /> },
      { id: "fishing", label: "Fishing", icon: <BookOpen /> },
      { id: "meta-events", label: "Meta", icon: <ShieldCheck /> },
      { id: "solo-farming", label: "Solo Farming", icon: <PackageSearch /> },
    ],
  },
  {
    title: "Salvaging",
    items: [
      { id: "salvaging", label: "Salvaging", icon: <Boxes /> },
      { id: "unidentified-gear", label: "Unidentified Gear", icon: <PackageSearch /> },
    ],
  },
  {
    title: "Gathering",
    items: [
      { id: "gathering", label: "Gathering", icon: <Database /> },
    ],
  },
  {
    title: "Bags",
    items: [
      { id: "bag-opener", label: "Bags", icon: <PackageSearch /> },
      { id: "bags", label: "Slot Bags", icon: <BookOpen /> },
    ],
  },
  {
    title: "Conversions",
    items: [
      { id: "conversions", label: "Conversions", icon: <Coins /> },
    ],
  },
  {
    title: "Festivals",
    items: [
      { id: "festivals", label: "Festivals", icon: <BookOpen /> },
    ],
  },
];

const NAV_ITEMS = SIDEBAR_GROUPS.flatMap((group) => group.items);

const GUIDE_DEFINITIONS: Record<string, GuideDefinition> = {
  "open-world": {
    title: "Open World Farming",
    summary: "Follow a high-activity map, convert rewards into sellable materials, and favor routes with short setup time.",
    steps: [
      "Start with account-wide dailies, then move into map metas that are currently active.",
      "Prioritize routes with sellable materials, map currency conversion, and repeatable chests.",
      "Use the waypoint links below to jump to common staging maps, then follow commander tags or event timers.",
    ],
    locations: [
      {
        label: "Drizzlewood Coast staging",
        map: "Drizzlewood Coast",
        waypoint: "[&BGQMAAA=]",
        note: "Base Camp is a reliable start for reward-track and material-heavy map loops.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Drizzlewood_Coast",
      },
      {
        label: "Silverwastes chest train",
        map: "The Silverwastes",
        waypoint: "[&BH8HAAA=]",
        note: "Camp Resolve is the usual entry point for chest and event trains.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/The_Silverwastes",
      },
    ],
  },
  "meta-events": {
    title: "Meta Event Farming",
    summary: "Meta events are best when you can arrive before pre-events, tag broadly, and convert map rewards quickly.",
    steps: [
      "Check the event timer, arrive early, and join a squad if one is listed.",
      "Bring salvage kits and empty inventory space before starting.",
      "Sell or convert rewards after the chain instead of interrupting the route.",
    ],
    locations: [
      {
        label: "Auric Basin meta",
        map: "Auric Basin",
        waypoint: "[&BMYHAAA=]",
        note: "Forgotten City Waypoint is central for Octovine organization.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Auric_Basin",
      },
      {
        label: "Verdant Brink",
        map: "Verdant Brink",
        waypoint: "[&BMAHAAA=]",
        note: "Shipwreck Peak is a good Verdant Brink staging point.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Verdant_Brink",
      },
    ],
  },
  "drizzlewood-donation": {
    title: "Drizzlewood Material Donation",
    summary: "A targeted material conversion route built around Drizzlewood Coast reward flow.",
    steps: [
      "Stage at Base Camp and run the south or north meta chain.",
      "Track material inputs before donating; do not convert scarce legendary materials blindly.",
      "Compare sell value against donation output before committing large stacks.",
    ],
    locations: [
      {
        label: "Base Camp",
        map: "Drizzlewood Coast",
        waypoint: "[&BGQMAAA=]",
        note: "Main access point for Drizzlewood reward loops.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Drizzlewood_Coast",
      },
      {
        label: "Forward Camp",
        map: "Drizzlewood Coast",
        waypoint: "[&BHIMAAA=]",
        note: "Useful when the north route is active.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Drizzlewood_Coast",
      },
    ],
  },
  fishing: {
    title: "Fishing",
    summary: "Fishing income depends heavily on map, time window, bait, lure, and fishing power.",
    steps: [
      "Pick a route with stable access and prepare bait before starting.",
      "Keep fishing party stacks up and avoid map hopping unless the target fish requires it.",
      "Sell high-value catches and convert low-value stacks only when the market spread makes sense.",
    ],
    locations: [
      {
        label: "Seitung fishing routes",
        map: "Seitung Province",
        waypoint: "[&BJ4MAAA=]",
        note: "Village Waypoint gives fast access to beginner-friendly Canthan fishing waters.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Seitung_Province",
      },
      {
        label: "Haiju Docks",
        map: "Seitung Province",
        waypoint: "[&BGQNAAA=]",
        note: "Good coastal access for dock and skiff-based routes.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Seitung_Province",
      },
    ],
  },
  instances: {
    title: "Instance Farming",
    summary: "Instanced farms usually trade travel time for reliable liquid rewards and repeatable daily value.",
    steps: [
      "Start with daily clears that match your account unlocks and build readiness.",
      "Convert tokens and boxes after checking current material prices.",
      "Keep separate routes for daily, weekly, and long-term progression rewards.",
    ],
    locations: [
      {
        label: "Lion's Arch hub",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Trader's Forum is a central city waypoint for vendors and portals.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Lion%27s_Arch",
      },
    ],
  },
  fractals: {
    title: "Fractals",
    summary: "Fractals are one of the strongest repeatable gold routes once agony resistance and daily tiers are ready.",
    steps: [
      "Run recommended dailies first, then fill with the highest comfortable tier.",
      "Open encryptions and compare stabilizing matrix prices before selling.",
      "Use account analysis to avoid selling materials needed for near-term legendary goals.",
    ],
    locations: [
      {
        label: "Mistlock access",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use the Fractals of the Mists portal from Lion's Arch or your account lounge.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Fractals_of_the_Mists",
      },
    ],
  },
  "home-instance": {
    title: "Home Instance",
    summary: "Home instance gathering is short daily value that scales with unlocked nodes.",
    steps: [
      "Gather all unlocked nodes once per day.",
      "Invite friends or use a shared full instance if your own unlocks are limited.",
      "Sell or store the materials depending on current crafting goals.",
    ],
    locations: [
      {
        label: "Lion's Arch access",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use city access and racial home instance entrances from your character's capital.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Home_instance",
      },
    ],
  },
  salvaging: {
    title: "Salvaging",
    summary: "Salvaging turns gear and bags into materials; profit depends on kit cost, material prices, and luck value.",
    steps: [
      "Separate unidentified gear by rarity and choose the correct salvage kit.",
      "Deposit materials after each batch and compare material value against direct sell value.",
      "Avoid salvaging expensive named items before checking Trading Post price.",
    ],
    locations: [
      {
        label: "Trading Post hub",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Trader's Forum is useful for buy/sell cleanup after salvage batches.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Salvage_kit",
      },
    ],
  },
  gathering: {
    title: "Gathering",
    summary: "Gathering routes are best when the route is short, node density is high, and tool/glyph value is understood.",
    steps: [
      "Choose a map with clustered nodes and stable waypoint access.",
      "Use glyphs that fit the material goal rather than defaulting to one setup.",
      "Convert gathered materials only after checking current prices.",
    ],
    locations: [
      {
        label: "Bjora Marches route",
        map: "Bjora Marches",
        waypoint: "[&BCcMAAA=]",
        note: "Jora's Keep is a useful northern staging point for Icebrood Saga gathering routes.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Bjora_Marches",
      },
    ],
  },
  conversions: {
    title: "Conversions",
    summary: "Conversions turn account currencies, keys, and event tokens into sellable materials or valuable account progress.",
    steps: [
      "Check if the currency is time-gated or needed for a personal goal before converting.",
      "Prefer conversions with fast liquidation and low opportunity cost.",
      "Use the account API to rank currencies you actually have instead of generic best lists.",
    ],
    locations: [
      {
        label: "Lion's Arch vendor cleanup",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "A practical vendor and Trading Post cleanup hub.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Currency",
      },
    ],
  },
  "competitive": {
    title: "Competitive",
    summary: "PvP and WvW tracks convert playtime into materials, clovers, tickets, and account progression.",
    steps: [
      "Pick reward tracks that match your crafting or material goals.",
      "Do not value tickets as raw gold if they are needed for legendary armor or trinkets.",
      "Use the account API to separate quick gold from long-term progression value.",
    ],
    locations: [
      {
        label: "Lion's Arch portals",
        map: "Lion's Arch",
        waypoint: "[&BBEEAAA=]",
        note: "Gate Hub Plaza is convenient for portal and city routing.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/World_versus_World",
      },
    ],
  },
};

const GENERAL_EARNING_OPTIONS: GoldSuggestion[] = [
  {
    title: "Daily Wizard's Vault objectives",
    detail: "Fast daily account rewards with broad value conversion options.",
    value: "Daily",
    speed: "Quickest",
    source: "General",
  },
  {
    title: "Sell unused high-demand materials",
    detail: "Use instant sell for speed or listings for stronger margins.",
    value: "Market",
    speed: "Quickest",
    source: "General",
  },
  {
    title: "Daily fractal recommended runs",
    detail: "Reliable liquid rewards when the account is geared for fractals.",
    value: "Repeatable",
    speed: "Fast",
    source: "General",
  },
  {
    title: "Craft profitable unlocked recipes",
    detail: "Best after an account API scan can compare owned materials.",
    value: "Personal scan",
    speed: "Fast",
    source: "General",
  },
  {
    title: "Open world meta event trains",
    detail: "Good broad material income and easy group access.",
    value: "Event chain",
    speed: "Fast",
    source: "General",
  },
  {
    title: "Salvage unidentified gear",
    detail: "Convert gear into sellable materials before listing.",
    value: "Materials",
    speed: "Fast",
    source: "General",
  },
  {
    title: "Fishing route with high-value catches",
    detail: "Steady income when maps and fishing power are available.",
    value: "Route",
    speed: "Moderate",
    source: "General",
  },
  {
    title: "Home instance gathering",
    detail: "Quick daily value if the account has unlocked nodes.",
    value: "Daily",
    speed: "Moderate",
    source: "General",
  },
  {
    title: "Alt parking chests",
    detail: "Short daily pickups if characters are parked in reward spots.",
    value: "Daily",
    speed: "Moderate",
    source: "General",
  },
  {
    title: "Map currency conversions",
    detail: "Convert account currencies into materials where available.",
    value: "Currency",
    speed: "Moderate",
    source: "General",
  },
  {
    title: "Material promotion crafting",
    detail: "Promote lower-tier materials when market spread is favorable.",
    value: "Craft",
    speed: "Moderate",
    source: "General",
  },
  {
    title: "Provisioner token planning",
    detail: "Longer-term legendary supply planning with controlled costs.",
    value: "Long-term",
    speed: "Moderate",
    source: "General",
  },
  {
    title: "Dungeon currency conversion",
    detail: "Use stored currencies where vendor conversions are worthwhile.",
    value: "Currency",
    speed: "Moderate",
    source: "General",
  },
  {
    title: "WvW reward track conversion",
    detail: "Turn regular WvW play into sellable materials over time.",
    value: "Track",
    speed: "Slowest",
    source: "General",
  },
  {
    title: "PvP reward track conversion",
    detail: "Use repeatable tracks for materials while playing PvP.",
    value: "Track",
    speed: "Slowest",
    source: "General",
  },
  {
    title: "Legendary precursor progress",
    detail: "Use account unlocks and materials to choose the shortest path.",
    value: "Account scan",
    speed: "Slowest",
    source: "General",
  },
  {
    title: "Research note conversions",
    detail: "Compare crafted item cost before converting into notes.",
    value: "Conversion",
    speed: "Slowest",
    source: "General",
  },
  {
    title: "Festival material trading",
    detail: "Seasonal items can carry better margins during active events.",
    value: "Seasonal",
    speed: "Slowest",
    source: "General",
  },
  {
    title: "Gathering route with glyphs",
    detail: "Best when the account owns strong tools and route unlocks.",
    value: "Route",
    speed: "Slowest",
    source: "General",
  },
  {
    title: "Long craft chains",
    detail: "Higher value crafts that require several material layers.",
    value: "Craft chain",
    speed: "Slowest",
    source: "General",
  },
];

const NON_REPEATABLE_ACTIVITY_TITLES = new Set([
  "Daily Wizard's Vault objectives",
]);

const REPEATABLE_EARNING_OPTIONS = GENERAL_EARNING_OPTIONS.filter(isRepeatableGoldSuggestion);

const ABSTRACT_LOCATION_MAPS = new Set([
  "major expansion hubs",
  "racial cities",
  "wvw panel",
]);

const GW2_CONTINENT_MAX_ZOOM: Record<number, number> = {
  1: 8,
  2: 6,
};

const GW2_TILE_RENDER_MAX_ZOOM: Record<number, number> = {
  1: 7,
  2: 6,
};

const GW2_TILE_SIZE = 256;
const MAX_MAP_PREVIEW_TILES = 24;
const MAP_PREVIEW_GRID_SIZE = 3;

const BUILD_SOURCES: BuildSource[] = [
  {
    profession: "Elementalist",
    source: "Snow Crows",
    mode: "Raids",
    title: "Elementalist raid builds",
    role: "DPS, boon DPS, healer",
    url: "https://snowcrows.com/builds/raids/elementalist",
    note: "High-end instanced builds with rotation and gear references.",
  },
  {
    profession: "Mesmer",
    source: "Snow Crows",
    mode: "Raids",
    title: "Mesmer raid builds",
    role: "DPS, boon, utility",
    url: "https://snowcrows.com/builds/raids/mesmer",
    note: "Strong source for Chronomancer, Mirage, and Virtuoso raid setups.",
  },
  {
    profession: "Necromancer",
    source: "Snow Crows",
    mode: "Raids",
    title: "Necromancer raid builds",
    role: "DPS, barrier, boon",
    url: "https://snowcrows.com/builds/raids/necromancer",
    note: "Instanced builds for Reaper, Scourge, Harbinger, and newer elite specs.",
  },
  {
    profession: "Engineer",
    source: "Snow Crows",
    mode: "Raids",
    title: "Engineer raid builds",
    role: "DPS, quickness, alacrity",
    url: "https://snowcrows.com/builds/raids/engineer",
    note: "Benchmark-oriented Holosmith, Mechanist, Scrapper, and related builds.",
  },
  {
    profession: "Ranger",
    source: "Snow Crows",
    mode: "Raids",
    title: "Ranger raid builds",
    role: "DPS, healer, boon",
    url: "https://snowcrows.com/builds/raids/ranger",
    note: "Good source for Druid support and DPS variants.",
  },
  {
    profession: "Thief",
    source: "Snow Crows",
    mode: "Raids",
    title: "Thief raid builds",
    role: "DPS, utility",
    url: "https://snowcrows.com/builds/raids/thief",
    note: "Instanced Thief builds with current gear and skill templates.",
  },
  {
    profession: "Guardian",
    source: "Snow Crows",
    mode: "Raids",
    title: "Guardian raid builds",
    role: "DPS, quickness, healer",
    url: "https://snowcrows.com/builds/raids/guardian",
    note: "Popular source for Firebrand, Willbender, and Dragonhunter setups.",
  },
  {
    profession: "Revenant",
    source: "Snow Crows",
    mode: "Raids",
    title: "Revenant raid builds",
    role: "DPS, alacrity, healer",
    url: "https://snowcrows.com/builds/raids/revenant",
    note: "Instanced Herald, Renegade, Vindicator, and support variants.",
  },
  {
    profession: "Warrior",
    source: "Snow Crows",
    mode: "Raids",
    title: "Warrior raid builds",
    role: "DPS, boon DPS",
    url: "https://snowcrows.com/builds/raids/warrior",
    note: "Berserker, Spellbreaker, Bladesworn, and newer specialization builds.",
  },
  {
    profession: "Any",
    source: "MetaBattle",
    mode: "Open World / PvP / WvW",
    title: "MetaBattle build library",
    role: "Broad build lookup",
    url: "https://metabattle.com/wiki/MetaBattle_Wiki",
    note: "Broad community wiki with many casual and competitive templates.",
  },
  {
    profession: "Any",
    source: "Hardstuck",
    mode: "Open World / PvE / Competitive",
    title: "Hardstuck build library",
    role: "Guided build lookup",
    url: "https://hardstuck.gg/gw2/builds/",
    note: "Curated build pages and guides across several game modes.",
  },
  {
    profession: "Any",
    source: "Snow Crows",
    mode: "Open World",
    title: "Snow Crows open world builds",
    role: "Solo and farming builds",
    url: "https://snowcrows.com/builds/open-world",
    note: "Useful for farming builds when survivability and low-friction damage matter.",
  },
];

const ACTIVITY_VALUE_DEFINITIONS: Record<string, ActivityValueDefinition> = {
  "open-world": {
    title: "Open World Value Items",
    summary: "Common sellable rewards from meta trains, event chains, and map reward containers.",
    items: [
      { name: "Piece of Unidentified Gear", source: "General event drops", note: "Open or sell depending on current salvage spread." },
      { name: "Rare Unidentified Gear", source: "Champions and meta chests", note: "Usually checked against salvage and ectoplasm value." },
      { name: "Heavy Loot Bag", source: "Champion trains", note: "Trophy-material bag with value tied to T5/T6 material prices." },
      { name: "Pulsing Brandspark", source: "Path of Fire maps", note: "Useful as a sellable map reward when available." },
      { name: "Amalgamated Gemstone", source: "Heart of Thorns and Path of Fire metas", note: "High-value meta chest reward and legendary material." },
      { name: "Mystic Coin", source: "Event and account reward routes", note: "High-liquidity material with strong market relevance." },
      { name: "Glob of Ectoplasm", source: "Rare gear salvage", note: "Core value anchor for rare gear and many recipes." },
      { name: "Ancient Bone", source: "Trophy bags", note: "T6 trophy material; value changes strongly with legendary demand." },
    ],
  },
  instances: {
    title: "Instance Value Items",
    summary: "Liquid and semi-liquid rewards from repeatable instanced content.",
    items: [
      { name: "Fractal Encryption", source: "Fractals", note: "Core fractal income item; compare opening cost and sell value." },
      { name: "Stabilizing Matrix", source: "Fractals", note: "Key liquid reward from encryptions and fractal salvage." },
      { name: "Mystic Coin", source: "Strike/fractal/account rewards", note: "Often one of the cleanest liquid rewards." },
      { name: "Glob of Ectoplasm", source: "Rare gear salvage", note: "Frequent side value from instanced loot." },
      { name: "Piece of Rare Unidentified Gear", source: "Strike and fractal drops", note: "Check current price before opening or salvaging." },
      { name: "Tale of Dungeon Delving", source: "Dungeons", note: "Account currency; value depends on vendor conversion choice." },
      { name: "Magnetite Shard", source: "Raids", note: "Mostly account progression; not direct liquid gold." },
      { name: "Gaeting Crystal", source: "Strike Missions", note: "Vendor/conversion value depends on personal goals." },
    ],
  },
  fishing: {
    title: "Fishing Value Items",
    summary: "Fishing value is mostly high-grade fish conversion, ambergris, and fillets.",
    items: [
      { name: "Chunk of Ancient Ambergris", source: "Legendary fish conversion", note: "One of the most important fishing value outputs." },
      { name: "Flawless Fish Fillet", source: "Fish processing", note: "Used in ascended food and fishing-related crafting." },
      { name: "Fine Fish Fillet", source: "Fish processing", note: "Lower-tier fillet value depends on food demand." },
      { name: "Fabulous Fish", source: "Fishing", note: "Often better converted through the right vendor route." },
      { name: "Flavorful Fish", source: "Fishing", note: "Route value depends on fishing hole and time window." },
      { name: "Mackerel", source: "Bait and catch routing", note: "Useful bait/catch item to check before longer routes." },
    ],
  },
  salvaging: {
    title: "Salvage Value Items",
    summary: "Materials that usually drive the value of unidentified gear and salvage loops.",
    items: [
      { name: "Glob of Ectoplasm", source: "Rare gear salvage", note: "Primary salvage value anchor." },
      { name: "Pile of Crystalline Dust", source: "Rare/exotic salvage", note: "High-use crafting material." },
      { name: "Ancient Bone", source: "Trophy bags and salvage routes", note: "T6 material with legendary demand." },
      { name: "Vicious Claw", source: "Trophy bags", note: "High-tier trophy material." },
      { name: "Powerful Venom Sac", source: "Trophy bags", note: "Often swings with legendary and ascended crafting demand." },
      { name: "Armored Scale", source: "Trophy bags", note: "Common T6 value component." },
    ],
  },
  gathering: {
    title: "Gathering Value Items",
    summary: "Gathering routes are strongest when they target dense high-value nodes and glyph procs.",
    items: [
      { name: "Orichalcum Ore", source: "Ore nodes", note: "Classic high-tier ore route material." },
      { name: "Ancient Wood Log", source: "Logging nodes", note: "High-tier wood used in many recipes." },
      { name: "Flax Fiber", source: "Heart of Thorns and guild hall nodes", note: "Often strong for short gathering loops." },
      { name: "Mithril Ore", source: "Ore nodes", note: "Bulk material with steady crafting demand." },
      { name: "Elder Wood Log", source: "Logging nodes", note: "Bulk material used widely in crafting." },
      { name: "Freshwater Pearl", source: "Orr and aquatic gathering", note: "Check price before targeting." },
    ],
  },
  bags: {
    title: "Bag Value Items",
    summary: "Container farms are driven by trophy bags, unidentified gear, and jackpot materials.",
    items: [
      { name: "Heavy Loot Bag", source: "Champion bags", note: "Stable trophy-material container." },
      { name: "Bag of Gear", source: "Event and champion rewards", note: "Open-value depends on current market prices." },
      { name: "Piece of Unidentified Gear", source: "Modern PvE drops", note: "Compare direct sale with open/salvage route." },
      { name: "Rare Unidentified Gear", source: "Modern PvE drops", note: "Ectoplasm value is the key comparison." },
      { name: "Trick-or-Treat Bag", source: "Halloween", note: "Seasonal bag with volatile prices." },
      { name: "Divine Lucky Envelope", source: "Lunar New Year", note: "Seasonal expected value item." },
    ],
  },
  conversions: {
    title: "Conversion Value Items",
    summary: "Currencies are best compared by the sell value of their likely vendor outputs.",
    items: [
      { name: "Mystic Clover", source: "Legendary conversion route", note: "Account-value item; do not treat as raw liquid gold." },
      { name: "Mystic Coin", source: "Multiple conversions", note: "Strong liquidity and frequent bottleneck." },
      { name: "Trophy Shipment", source: "Volatile Magic", note: "Value depends on T5/T6 material prices." },
      { name: "Material Bag", source: "Currency vendors", note: "Generic conversion output to compare against alternatives." },
      { name: "Amalgamated Gemstone", source: "Meta and vendor routes", note: "Legendary-adjacent material with liquid value." },
    ],
  },
  competitive: {
    title: "Competitive Value Items",
    summary: "PvP/WvW rewards mix liquid materials with long-term account-bound progression.",
    items: [
      { name: "Mystic Clover", source: "Reward tracks", note: "High account value for legendary crafting." },
      { name: "Mystic Coin", source: "Reward tracks and chests", note: "Liquid reward to track separately from tickets." },
      { name: "Memory of Battle", source: "WvW", note: "Key WvW market item." },
      { name: "Badge of Honor", source: "WvW", note: "Account currency; vendor value depends on route." },
      { name: "Shard of Glory", source: "PvP", note: "PvP material with market value." },
      { name: "WvW Skirmish Claim Ticket", source: "WvW pips", note: "Long-term legendary progression, not liquid gold." },
    ],
  },
};

const FISHING_ROUTE_INFO: FishingRouteInfo[] = [
  {
    name: "Canthan ambergris route",
    expansion: "End of Dragons",
    bait: "Use the bait required by the target legendary fish; carry a mixed bait stack before route start.",
    fishingPower: "575+ comfortable, 650+ preferred",
    map: "Seitung Province / New Kaineng / Echovald / Dragon's End",
    valueFocus: "Legendary fish turn-ins, Chunk of Ancient Ambergris, fillets",
  },
  {
    name: "Open water fillet route",
    expansion: "End of Dragons",
    bait: "Any route-appropriate bait; prioritize stocked vendors before leaving a hub.",
    fishingPower: "400+ workable, higher is smoother",
    map: "Seitung Province",
    valueFocus: "Fine and flawless fillets with low setup time",
  },
  {
    name: "Daily collection fishing",
    expansion: "End of Dragons and later maps",
    bait: "Match bait to the achievement or collection target before starting.",
    fishingPower: "As high as available; food, lure, skiff stacks",
    map: "Route depends on collection",
    valueFocus: "Account progress first, sellable fish value second",
  },
];

const goldToCoins = (gold: number): number => Math.round(gold * 10_000);

const META_FARM_ESTIMATES: MetaFarmEstimate[] = [
  {
    name: "Drizzlewood Coast north/south",
    map: "Drizzlewood Coast",
    expansion: "Icebrood Saga",
    cadence: "Repeatable",
    duration: "35-55m loop",
    goldMin: goldToCoins(20),
    goldMax: goldToCoins(30),
    access: "Strong material bags, commendations, and cache keys. Best with a commander tag.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Drizzlewood_Coast",
  },
  {
    name: "Dragonfall",
    map: "Dragonfall",
    expansion: "Living World S4",
    cadence: "Repeatable",
    duration: "30-45m",
    goldMin: goldToCoins(16),
    goldMax: goldToCoins(24),
    access: "Mistborn coffers, volatile magic, champ train cleanup, and key conversion.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Dragonfall",
  },
  {
    name: "The Silverwastes RIBA",
    map: "The Silverwastes",
    expansion: "Core",
    cadence: "Repeatable",
    duration: "35-50m",
    goldMin: goldToCoins(12),
    goldMax: goldToCoins(20),
    access: "Bandit crest/key loop, chest train, breach, and Vinewrath reward cycle.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/The_Silverwastes",
  },
  {
    name: "Auric Basin Octovine",
    map: "Auric Basin",
    expansion: "Heart of Thorns",
    cadence: "Every 2h",
    duration: "20-30m",
    goldMin: goldToCoins(12),
    goldMax: goldToCoins(20),
    access: "Fast when joined before challenges; strongest with exalted chest keys.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Auric_Basin",
  },
  {
    name: "Dragon's End",
    map: "Dragon's End",
    expansion: "End of Dragons",
    cadence: "Every 2h",
    duration: "45-60m",
    goldMin: goldToCoins(12),
    goldMax: goldToCoins(22),
    access: "High payout when the map succeeds; bring a prepared squad and jade bot buffs.",
    confidence: "Variable",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Dragon%27s_End",
  },
  {
    name: "Dragon's Stand",
    map: "Dragon's Stand",
    expansion: "Heart of Thorns",
    cadence: "Every 2h",
    duration: "40-60m",
    goldMin: goldToCoins(10),
    goldMax: goldToCoins(18),
    access: "Long lane push with many pods; strongest when commanders split lanes cleanly.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Dragon%27s_Stand",
  },
  {
    name: "Gyala Delve",
    map: "Gyala Delve",
    expansion: "End of Dragons",
    cadence: "Repeatable",
    duration: "35-55m",
    goldMin: goldToCoins(10),
    goldMax: goldToCoins(18),
    access: "Sustained event chain with chests and jade-themed material drops.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Gyala_Delve",
  },
  {
    name: "Tangled Depths Chak Gerent",
    map: "Tangled Depths",
    expansion: "Heart of Thorns",
    cadence: "Every 2h",
    duration: "15-25m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(15),
    access: "Short burst meta; value improves with crystalline ore and chest routes.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Tangled_Depths",
  },
  {
    name: "Verdant Brink night bosses",
    map: "Verdant Brink",
    expansion: "Heart of Thorns",
    cadence: "Night cycle",
    duration: "30-45m",
    goldMin: goldToCoins(7),
    goldMax: goldToCoins(14),
    access: "Needs map organization for tier rewards and boss splits.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Verdant_Brink",
  },
  {
    name: "The Echovald Wilds Gang War",
    map: "The Echovald Wilds",
    expansion: "End of Dragons",
    cadence: "Every 2h",
    duration: "25-35m",
    goldMin: goldToCoins(9),
    goldMax: goldToCoins(16),
    access: "Jade tech chests, imperial favor, and organized lane progress.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/The_Echovald_Wilds",
  },
  {
    name: "New Kaineng City Blackout",
    map: "New Kaineng City",
    expansion: "End of Dragons",
    cadence: "Every 2h",
    duration: "25-35m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(15),
    access: "Good with quick event clears; map travel can slow weaker groups.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/New_Kaineng_City",
  },
  {
    name: "Seitung Province Aetherblade Assault",
    map: "Seitung Province",
    expansion: "End of Dragons",
    cadence: "Every 2h",
    duration: "20-30m",
    goldMin: goldToCoins(7),
    goldMax: goldToCoins(13),
    access: "Low-friction EoD meta with favor, chests, and material payout.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Seitung_Province",
  },
  {
    name: "Domain of Istan Palawadan",
    map: "Domain of Istan",
    expansion: "Living World S4",
    cadence: "Every 2h",
    duration: "20-35m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(14),
    access: "Volatile magic and trophy bags; stronger when paired with Great Hall.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Domain_of_Istan",
  },
  {
    name: "Thunderhead Peaks oil meta",
    map: "Thunderhead Peaks",
    expansion: "Living World S4",
    cadence: "Every 2h",
    duration: "25-40m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(14),
    access: "Dwarven room and branded/event rewards with volatile magic conversion.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Thunderhead_Peaks",
  },
  {
    name: "Bjora Marches Storms of Winter",
    map: "Bjora Marches",
    expansion: "Icebrood Saga",
    cadence: "Every 2h",
    duration: "20-35m",
    goldMin: goldToCoins(7),
    goldMax: goldToCoins(13),
    access: "Eternal ice conversion is the main account-value lever.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Bjora_Marches",
  },
  {
    name: "Sandswept Isles Specimen Chamber",
    map: "Sandswept Isles",
    expansion: "Living World S4",
    cadence: "Repeatable",
    duration: "15-25m",
    goldMin: goldToCoins(6),
    goldMax: goldToCoins(12),
    access: "Shorter meta; value comes from volatile magic and local reward chests.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Sandswept_Isles",
  },
  {
    name: "Domain of Vabbi Serpents' Ire",
    map: "Domain of Vabbi",
    expansion: "Path of Fire",
    cadence: "Every 2h",
    duration: "25-45m",
    goldMin: goldToCoins(5),
    goldMax: goldToCoins(10),
    access: "Needs a coordinated group; less reliable for pure gold than modern trains.",
    confidence: "Variable",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Domain_of_Vabbi",
  },
  {
    name: "Amnytas Defense",
    map: "Amnytas",
    expansion: "Secrets of the Obscure",
    cadence: "Every 2h",
    duration: "25-40m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(14),
    access: "Rift essences, map currencies, and SOTO containers drive value.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Amnytas",
  },
  {
    name: "Skywatch Archipelago",
    map: "Skywatch Archipelago",
    expansion: "Secrets of the Obscure",
    cadence: "Every 2h",
    duration: "25-40m",
    goldMin: goldToCoins(7),
    goldMax: goldToCoins(12),
    access: "Best when paired with rifts and static charge conversion.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Skywatch_Archipelago",
  },
  {
    name: "Inner Nayos",
    map: "Inner Nayos",
    expansion: "Secrets of the Obscure",
    cadence: "Repeatable",
    duration: "30-45m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(14),
    access: "Longer chains with essences and map currency conversion.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Inner_Nayos",
  },
  {
    name: "Lowland Shore",
    map: "Lowland Shore",
    expansion: "Janthir Wilds",
    cadence: "Repeatable",
    duration: "25-40m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(14),
    access: "Modern map rewards; local values should improve as snapshots collect prices.",
    confidence: "Variable",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Lowland_Shore",
  },
  {
    name: "Janthir Syntri",
    map: "Janthir Syntri",
    expansion: "Janthir Wilds",
    cadence: "Repeatable",
    duration: "25-45m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(15),
    access: "Modern map rewards with higher variance until local price snapshots settle.",
    confidence: "Variable",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Janthir_Syntri",
  },
  {
    name: "Crystal Oasis Casino Blitz",
    map: "Crystal Oasis",
    expansion: "Path of Fire",
    cadence: "Every 2h",
    duration: "15-25m",
    goldMin: goldToCoins(5),
    goldMax: goldToCoins(10),
    access: "Short and easy; better as a fill-in than a full-session farm.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Crystal_Oasis",
  },
  {
    name: "Elon Riverlands Junundu Rising",
    map: "Elon Riverlands",
    expansion: "Path of Fire",
    cadence: "Every 2h",
    duration: "20-35m",
    goldMin: goldToCoins(5),
    goldMax: goldToCoins(9),
    access: "Lower liquid value, useful when you also need PoF currencies or collections.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Elon_Riverlands",
  },
  {
    name: "The Desolation Maws of Torment",
    map: "The Desolation",
    expansion: "Path of Fire",
    cadence: "Every 2h",
    duration: "25-40m",
    goldMin: goldToCoins(5),
    goldMax: goldToCoins(9),
    access: "Group quality matters; not a top gold pick unless you need the map rewards.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/The_Desolation",
  },
  {
    name: "Bloodstone Fen Bloodstone Maw",
    map: "Bloodstone Fen",
    expansion: "Living World S3",
    cadence: "Repeatable",
    duration: "15-25m",
    goldMin: goldToCoins(4),
    goldMax: goldToCoins(9),
    access: "Good filler with unbound magic and bloodstone currency needs.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Bloodstone_Fen",
  },
  {
    name: "Ember Bay destroyer chain",
    map: "Ember Bay",
    expansion: "Living World S3",
    cadence: "Repeatable",
    duration: "15-25m",
    goldMin: goldToCoins(4),
    goldMax: goldToCoins(8),
    access: "Filler farm with unbound magic and map-currency value.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Ember_Bay",
  },
  {
    name: "Draconis Mons meta",
    map: "Draconis Mons",
    expansion: "Living World S3",
    cadence: "Repeatable",
    duration: "20-35m",
    goldMin: goldToCoins(4),
    goldMax: goldToCoins(8),
    access: "Useful for collection/currency progress; modest raw gold.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Draconis_Mons",
  },
  {
    name: "Lake Doric leather farm/meta",
    map: "Lake Doric",
    expansion: "Living World S3",
    cadence: "Repeatable",
    duration: "20-35m",
    goldMin: goldToCoins(4),
    goldMax: goldToCoins(8),
    access: "Value depends heavily on leather and trophy prices.",
    confidence: "Variable",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Lake_Doric",
  },
  {
    name: "Triple Trouble",
    map: "Bloodtide Coast",
    expansion: "Core",
    cadence: "World boss timer",
    duration: "15-25m",
    goldMin: goldToCoins(7),
    goldMax: goldToCoins(14),
    access: "Excellent with organized community runs; poor if the map fails.",
    confidence: "Variable",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Triple_Trouble",
  },
  {
    name: "Tequatl the Sunless",
    map: "Sparkfly Fen",
    expansion: "Core",
    cadence: "World boss timer",
    duration: "15-20m",
    goldMin: goldToCoins(6),
    goldMax: goldToCoins(12),
    access: "Short daily boss with reliable participation rewards.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Tequatl_the_Sunless",
  },
  {
    name: "Ley-Line Anomaly",
    map: "Rotating core maps",
    expansion: "Core",
    cadence: "Daily",
    duration: "5-10m",
    goldMin: goldToCoins(8),
    goldMax: goldToCoins(18),
    access: "Very high hourly rate but limited by daily completion.",
    confidence: "High",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Legendary_Ley-Line_Anomaly",
  },
  {
    name: "Tower of Nightmares",
    map: "Kessex Hills",
    expansion: "Living World S1",
    cadence: "Repeatable",
    duration: "20-35m",
    goldMin: goldToCoins(5),
    goldMax: goldToCoins(10),
    access: "Mostly worthwhile for achievements and rotating participation.",
    confidence: "Variable",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Tower_of_Nightmares",
  },
  {
    name: "Harathi Hinterlands centaur meta",
    map: "Harathi Hinterlands",
    expansion: "Core",
    cadence: "Repeatable",
    duration: "20-30m",
    goldMin: goldToCoins(3),
    goldMax: goldToCoins(7),
    access: "Low barrier core map chain, useful while leveling or for specific drops.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Harathi_Hinterlands",
  },
  {
    name: "Mount Maelstrom volcano chain",
    map: "Mount Maelstrom",
    expansion: "Core",
    cadence: "Repeatable",
    duration: "15-25m",
    goldMin: goldToCoins(3),
    goldMax: goldToCoins(6),
    access: "Lower-value core meta; keep as filler unless a daily points you there.",
    confidence: "Medium",
    wikiUrl: "https://wiki.guildwars2.com/wiki/Mount_Maelstrom",
  },
];

const SPEED_ORDER: Record<SpeedLabel, number> = {
  Quickest: 0,
  Fast: 1,
  Moderate: 2,
  Slowest: 3,
};

const ACTIVITY_GUIDES: Record<string, ActivityGuideDefinition> = {
  "sell-unused-high-demand-materials": {
    id: "sell-unused-high-demand-materials",
    title: "Sell Unused High-Demand Materials",
    category: "Market",
    speed: "Quickest",
    summary: "A low-friction route for turning stored materials into liquid gold without committing to a long farm.",
    steps: [
      "Open your material storage and sort by valuable crafting materials, trophies, and tier-six ingredients.",
      "Check the current buy and sell spread before choosing instant sell or a posted sell listing.",
      "Keep materials that are already needed for a near legendary, ascended, or profitable craft goal.",
      "List slower-moving expensive materials instead of instant-selling them when the spread is wide.",
    ],
    tips: [
      "Good candidates are materials with high demand, high stack count, and no immediate personal crafting use.",
      "Use instant sell only when speed matters more than margin.",
    ],
    locations: [
      {
        label: "Trading and storage hub",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use the bank, material storage, vendors, and Trading Post from the central hub.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Lion%27s_Arch",
      },
    ],
  },
  "daily-fractal-recommended-runs": {
    id: "daily-fractal-recommended-runs",
    title: "Daily Fractal Recommended Runs",
    category: "Repeatable",
    speed: "Fast",
    summary: "Repeatable instanced farming with liquid rewards, relics, encryption boxes, and useful account progress.",
    steps: [
      "Start with recommended fractals at the highest tier your account can comfortably clear.",
      "Open or sell Fractal Encryptions depending on your key stock and current market values.",
      "Convert relics and pristine relics only after checking whether you need them for account goals.",
      "Finish dailies when your group is already moving quickly through the rotation.",
    ],
    tips: [
      "Agony resistance and stable builds matter more than squeezing small market margins.",
      "Recommended fractals are the best short session; full dailies are better when you have a steady group.",
    ],
    locations: [
      {
        label: "Fractals of the Mists",
        map: "Mistlock Observatory",
        note: "Enter from Lion's Arch or the fractal portal and pick the current recommended scale.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Fractals_of_the_Mists",
      },
    ],
  },
  "craft-profitable-unlocked-recipes": {
    id: "craft-profitable-unlocked-recipes",
    title: "Craft Profitable Unlocked Recipes",
    category: "Personal scan",
    speed: "Fast",
    summary: "Use account materials and unlocked recipes to find crafts where your personal cost is lower than the sell value.",
    steps: [
      "Run account analysis so the app can compare owned materials against recipe requirements.",
      "Favor crafts with high owned coverage and a positive after-fee sell value.",
      "Check whether the crafted item sells regularly before tying up expensive materials.",
      "Craft in small batches first, then re-check the market before repeating.",
    ],
    tips: [
      "A recipe can be profitable for you even when it is not profitable from pure market-buy inputs.",
      "Avoid spending account-bound or time-gated materials needed for nearer goals.",
    ],
    locations: [
      {
        label: "Crafting stations",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use any crafting station hub after confirming the route in the item detail panel.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Crafting",
      },
    ],
  },
  "open-world-meta-event-trains": {
    id: "open-world-meta-event-trains",
    title: "Open World Meta Event Trains",
    category: "Event chain",
    speed: "Fast",
    summary: "Compare repeatable map metas by estimated gold per hour, setup time, and useful account currencies.",
    steps: [
      "Pick a meta from the estimate table based on time available, expansion access, and whether you need its account currency.",
      "Check active event timers and join a map before the pre-event chain starts.",
      "Bring salvage kits, empty bags, and boosters before committing to a longer train.",
      "Tag broadly, follow commander calls, and avoid stopping to sell until the train reaches a natural break.",
      "After the route, salvage, convert map currency, and list materials in batches.",
    ],
    tips: [
      "The table uses local estimates until enough market snapshots exist for the app to calculate account-specific returns.",
      "Meta trains are strongest when your session is long enough to catch multiple event chains.",
      "Commander tags and LFG descriptions usually matter more than the exact map pick.",
    ],
    locations: [
      {
        label: "Auric Basin meta",
        map: "Auric Basin",
        waypoint: "[&BMYHAAA=]",
        note: "Forgotten City is a common Octovine staging point.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Auric_Basin",
        continentCoord: [34304, 33920],
        zoom: 8,
      },
      {
        label: "Drizzlewood Coast",
        map: "Drizzlewood Coast",
        waypoint: "[&BGQMAAA=]",
        note: "Base Camp is a reliable starting point for material-heavy event loops.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Drizzlewood_Coast",
        continentCoord: [51216, 21720],
        zoom: 8,
      },
      {
        label: "Dragonfall meta",
        map: "Dragonfall",
        note: "Use a commander map to rotate camp events, champ trains, and the final meta cleanup.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Dragonfall",
        continentCoord: [45696, 49880],
        zoom: 8,
      },
      {
        label: "The Silverwastes RIBA",
        map: "The Silverwastes",
        note: "Rotate Red, Indigo, Blue, and Amber forts before Breach and Vinewrath.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/The_Silverwastes",
        continentCoord: [37632, 31360],
        zoom: 8,
      },
      {
        label: "Dragon's End",
        map: "Dragon's End",
        note: "Join early for prep, map readiness, and Soo-Won squad organization.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Dragon%27s_End",
        continentCoord: [34214, 103694],
        zoom: 8,
      },
    ],
  },
  "salvage-unidentified-gear": {
    id: "salvage-unidentified-gear",
    title: "Salvage Unidentified Gear",
    category: "Materials",
    speed: "Fast",
    summary: "Turn gear drops into material value before selling, especially when direct gear prices are weak.",
    steps: [
      "Open unidentified gear in sensible batches if the expected contents are worth more than selling the stack.",
      "Salvage lower-value gear with the right kit for the rarity and target material.",
      "Deposit materials, then sell materials with healthy demand and keep those needed for current goals.",
      "Compare the simulator on container pages before opening large stacks.",
    ],
    tips: [
      "Rare and exotic salvage decisions can swing with ectoplasm and upgrade component prices.",
      "Do not salvage account-bound or collection items unless you know they are disposable.",
    ],
    locations: [
      {
        label: "Bank and salvage cleanup",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use a hub with bank, vendor, and Trading Post access for a clean inventory pass.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Salvage_kit",
      },
    ],
  },
  "fishing-route-with-high-value-catches": {
    id: "fishing-route-with-high-value-catches",
    title: "Fishing Route With High-Value Catches",
    category: "Route",
    speed: "Moderate",
    summary: "Repeatable fishing income built around map choice, fishing power, and valuable catch windows.",
    steps: [
      "Pick a fishing map and time window with valuable fish available.",
      "Stack fishing power before chasing rare catches.",
      "Use food, bait, and lures that match the target fish.",
      "Sell high-value fish and convert or consume lower-value catches only when it supports your account goal.",
    ],
    tips: [
      "Fishing is steadier when you stay in one route long enough to keep fishing party stacks.",
      "Check current fish prices before committing to a long session.",
    ],
    locations: [
      {
        label: "Seitung Province fishing",
        map: "Seitung Province",
        waypoint: "[&BJ4MAAA=]",
        note: "A convenient Canthan fishing start with vendors and varied water.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Fishing",
      },
    ],
  },
  "home-instance-gathering": {
    id: "home-instance-gathering",
    title: "Home Instance Gathering",
    category: "Daily",
    speed: "Moderate",
    summary: "A repeatable daily route that pays off more as your account unlocks home instance nodes.",
    steps: [
      "Enter your home instance or join a full instance from another player.",
      "Gather every valuable node with appropriate gathering tools and glyphs.",
      "Deposit materials, then sell surplus materials not needed for active goals.",
      "Repeat daily only while the time-to-value remains worthwhile for your account.",
    ],
    tips: [
      "This is best when the route is fast and node access is already unlocked.",
      "Glyphs can change the value of a gathering route substantially.",
    ],
    locations: [
      {
        label: "Home instance access",
        map: "Racial cities",
        note: "Enter from your character's home city or use a friend's fuller instance.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Home_instance",
      },
    ],
  },
  "alt-parking-chests": {
    id: "alt-parking-chests",
    title: "Alt Parking Chests",
    category: "Daily",
    speed: "Moderate",
    summary: "Short repeatable pickups from characters parked near valuable chests, vendors, or gathering points.",
    steps: [
      "Park spare characters at reliable daily reward spots.",
      "Log in, collect the chest or node, then switch characters without starting a longer route.",
      "Track which spots are daily and which are per-character or account-wide.",
      "Move parked characters when the value drops or a better route opens.",
    ],
    tips: [
      "This is strongest when the login loop is very short.",
      "Avoid spots that require long travel or event setup unless the reward is exceptional.",
    ],
    locations: [
      {
        label: "Bjora Marches chest route",
        map: "Bjora Marches",
        waypoint: "[&BCcMAAA=]",
        note: "Useful as an example of a compact reward pickup map.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Bjora_Marches",
      },
    ],
  },
  "map-currency-conversions": {
    id: "map-currency-conversions",
    title: "Map Currency Conversions",
    category: "Currency",
    speed: "Moderate",
    summary: "Convert surplus account currencies into materials, keys, containers, or vendor items with market value.",
    steps: [
      "Check which currencies your account has in excess.",
      "Find vendors that convert the currency into sellable or salvageable rewards.",
      "Compare the market value of output materials against alternate uses for the currency.",
      "Convert in small batches when prices are volatile.",
    ],
    tips: [
      "Currency value changes when material prices move.",
      "Keep currencies needed for legendary collections, mounts, skins, or account unlocks.",
    ],
    locations: [
      {
        label: "Trading hub cleanup",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use the hub after vendor conversion to list or salvage outputs.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Currency",
      },
    ],
  },
  "material-promotion-crafting": {
    id: "material-promotion-crafting",
    title: "Material Promotion Crafting",
    category: "Craft",
    speed: "Moderate",
    summary: "Promote lower-tier materials only when the output value beats inputs, fees, and crafting time.",
    steps: [
      "Pick a material family with strong demand at the promoted tier.",
      "Compare input costs, output sell value, and Trading Post fees.",
      "Craft a test batch before committing large stacks.",
      "Stop when margins shrink or the output moves slowly.",
    ],
    tips: [
      "This is a margin activity, not a guaranteed conversion.",
      "Personal stored materials can make a promotion route worthwhile for your account.",
    ],
    locations: [
      {
        label: "Crafting station",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use a station near the bank and Trading Post for quick price checks.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Crafting",
      },
    ],
  },
  "provisioner-token-planning": {
    id: "provisioner-token-planning",
    title: "Provisioner Token Planning",
    category: "Long-term",
    speed: "Moderate",
    summary: "A repeatable planning route for lowering legendary supply costs over time.",
    steps: [
      "Identify the cheapest daily turn-ins your account can comfortably supply.",
      "Prioritize tokens only when they support an active legendary or account goal.",
      "Avoid expensive turn-ins unless they save meaningful time.",
      "Track daily completion so you do not overbuy materials.",
    ],
    tips: [
      "Provisioner Tokens are often time-gated value, not immediate gold.",
      "Best results come from planning before you start the legendary craft.",
    ],
    locations: [
      {
        label: "Provisioner vendors",
        map: "Major expansion hubs",
        note: "Use vendors tied to the legendary or expansion path you are pursuing.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Provisioner_Token",
      },
    ],
  },
  "dungeon-currency-conversion": {
    id: "dungeon-currency-conversion",
    title: "Dungeon Currency Conversion",
    category: "Currency",
    speed: "Moderate",
    summary: "Turn dungeon currencies and repeatable dungeon play into materials, skins, or salvage value.",
    steps: [
      "Check stored Tales of Dungeon Delving and dungeon reward currencies.",
      "Compare vendor output value against skins, gifts, or account unlocks you still need.",
      "Buy outputs that can be salvaged or converted profitably.",
      "Repeat dungeon paths only when the route is still fun or efficient for your group.",
    ],
    tips: [
      "Do not convert currencies needed for collection or legendary gifts.",
      "Dungeon value is best treated as a bonus from content you already intend to run.",
    ],
    locations: [
      {
        label: "Dungeon vendors",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use Lion's Arch as a cleanup point after choosing vendor rewards.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Dungeon",
      },
    ],
  },
  "wvw-reward-track-conversion": {
    id: "wvw-reward-track-conversion",
    title: "WvW Reward Track Conversion",
    category: "Track",
    speed: "Slowest",
    summary: "Convert regular WvW play into repeatable reward track boxes, currencies, and materials.",
    steps: [
      "Choose a repeatable reward track with valuable output or account progress.",
      "Use boosters when you plan a long session.",
      "Open track boxes after checking whether their contents are better sold, salvaged, or saved.",
      "Swap tracks when you complete account-bound goals or the output value changes.",
    ],
    tips: [
      "The gold value is slower, but it stacks well with WvW goals you already care about.",
      "Reward tracks are best compared by output value and personal account needs.",
    ],
    locations: [
      {
        label: "World vs. World",
        map: "WvW panel",
        note: "Queue into an active borderland or Eternal Battlegrounds map.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/World_versus_World",
      },
    ],
  },
  "pvp-reward-track-conversion": {
    id: "pvp-reward-track-conversion",
    title: "PvP Reward Track Conversion",
    category: "Track",
    speed: "Slowest",
    summary: "Turn repeatable PvP matches into reward track boxes, currencies, and sellable materials.",
    steps: [
      "Select a reward track with useful output before queueing.",
      "Use reward track boosters during focused sessions.",
      "Open, salvage, or sell outputs after checking current market values.",
      "Switch tracks when account-bound unlocks are complete.",
    ],
    tips: [
      "PvP tracks are value added to matches, not always the fastest pure gold route.",
      "Choose tracks that match both market output and personal unlock goals.",
    ],
    locations: [
      {
        label: "PvP lobby",
        map: "Heart of the Mists",
        note: "Queue from the PvP panel and set the reward track before playing.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Structured_PvP",
      },
    ],
  },
  "legendary-precursor-progress": {
    id: "legendary-precursor-progress",
    title: "Legendary Precursor Progress",
    category: "Account scan",
    speed: "Slowest",
    summary: "Use account unlocks, currencies, and stored materials to choose the shortest legendary route available to you.",
    steps: [
      "Run an account scan so the app can compare recipes, materials, and unlocks.",
      "Pick the legendary or precursor with the highest owned coverage and lowest personal cost.",
      "Break the craft into first-level ingredients and clear the cheapest missing pieces first.",
      "Buy missing materials only after checking whether direct purchase beats farming time.",
    ],
    tips: [
      "A legendary can be fastest for your account even when it is not cheapest on paper.",
      "Do not liquidate materials used by the selected route unless the buyback cost is acceptable.",
    ],
    locations: [
      {
        label: "Legendary crafting hub",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use bank, crafting, Mystic Forge access, and Trading Post checks from a central hub.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Legendary_weapon",
      },
    ],
  },
  "research-note-conversions": {
    id: "research-note-conversions",
    title: "Research Note Conversions",
    category: "Conversion",
    speed: "Slowest",
    summary: "Craft or buy suitable items for research notes only when the note cost is competitive.",
    steps: [
      "Check current craft costs for common research-note items.",
      "Avoid items with expensive or volatile inputs.",
      "Craft in batches and research them only after confirming they are eligible.",
      "Stop when market input prices move or the route becomes crowded.",
    ],
    tips: [
      "The best research-note item changes as markets move.",
      "Use owned materials only if they are not needed for higher-priority crafts.",
    ],
    locations: [
      {
        label: "Crafting and research station",
        map: "Arborstone",
        note: "Use any convenient crafting hub with access to research tools.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Research_Note",
      },
    ],
  },
  "festival-material-trading": {
    id: "festival-material-trading",
    title: "Festival Material Trading",
    category: "Seasonal",
    speed: "Slowest",
    summary: "Repeatable seasonal trading around festival containers, currencies, materials, and demand spikes.",
    steps: [
      "Identify the active festival and its repeatable currency or container loop.",
      "Compare opening containers against selling them directly.",
      "Sell during demand spikes or hold only when you accept the storage risk.",
      "Avoid one-time achievements unless you also want the account reward.",
    ],
    tips: [
      "Seasonal markets are volatile; do smaller batches.",
      "Container simulators are useful when exact drop data is available.",
    ],
    locations: [
      {
        label: "Festival hub",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Most festivals route through Lion's Arch or a dedicated festival map.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Festival",
      },
    ],
  },
  "gathering-route-with-glyphs": {
    id: "gathering-route-with-glyphs",
    title: "Gathering Route With Glyphs",
    category: "Route",
    speed: "Slowest",
    summary: "Use tools and glyphs to improve repeatable gathering routes where material demand is strong.",
    steps: [
      "Choose a map with dense valuable nodes and easy movement.",
      "Equip glyphs that add useful bonus output for the route.",
      "Gather in a consistent loop and deposit materials between passes.",
      "Compare route output against direct farming or buying the target material.",
    ],
    tips: [
      "Glyph choice can change the route more than map choice.",
      "Routes are best when you can repeat them without downtime.",
    ],
    locations: [
      {
        label: "Verdant Brink gathering start",
        map: "Verdant Brink",
        waypoint: "[&BMAHAAA=]",
        note: "A flexible example route with varied gathering and event overlap.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Gathering",
      },
    ],
  },
  "long-craft-chains": {
    id: "long-craft-chains",
    title: "Long Craft Chains",
    category: "Craft chain",
    speed: "Slowest",
    summary: "Multi-layer crafting routes that can pay off when intermediate materials and final output are priced well.",
    steps: [
      "Start from the final output and expand every ingredient to first-level inputs.",
      "Check each intermediate step for buy-versus-craft value.",
      "Use owned materials where they reduce personal cost without blocking higher goals.",
      "Craft in stages and re-check prices before making the final output.",
    ],
    tips: [
      "Long chains are slower but can expose hidden personal profit.",
      "The app's ingredient mind map is the best place to inspect the first-level tree.",
    ],
    locations: [
      {
        label: "Crafting hub",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "Use crafting stations near bank and Trading Post access for staged crafting.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Crafting",
      },
    ],
  },
};

const ACTIVITY_TITLE_TO_ID = new Map(
  Object.values(ACTIVITY_GUIDES).map((guide) => [guide.title.toLowerCase(), guide.id]),
);

function App() {
  const [pageHistory, setPageHistory] = useState<ActivePage[]>(["account"]);
  const [pageHistoryIndex, setPageHistoryIndex] = useState(0);
  const [catalog, setCatalog] = useState<MarketItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [progress, setProgress] = useState("Ready");
  const [progressCount, setProgressCount] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [listings, setListings] = useState<CommerceListings | null>(null);
  const [itemTransactions, setItemTransactions] = useState<ItemTransactions | null>(null);
  const [recipes, setRecipes] = useState<RecipeGuide[]>([]);
  const [usedInRecipes, setUsedInRecipes] = useState<RecipeGuide[]>([]);
  const [recipeUsageState, setRecipeUsageState] = useState<LoadState>("idle");
  const [marketCrafts, setMarketCrafts] = useState<CraftOpportunity[]>([]);
  const [craftLoadState, setCraftLoadState] = useState<LoadState>("idle");
  const [craftsUpdatedAt, setCraftsUpdatedAt] = useState<number | null>(null);
  const [highValueCrafts, setHighValueCrafts] = useState<CraftOpportunity[]>([]);
  const [highValueCraftLoadState, setHighValueCraftLoadState] = useState<LoadState>("idle");
  const [highValueCraftsUpdatedAt, setHighValueCraftsUpdatedAt] = useState<number | null>(null);
  const [marketHistoryRevision, setMarketHistoryRevision] = useState(0);
  const [wikiGuide, setWikiGuide] = useState<WikiGuide | null>(null);
  const [containerAnalysis, setContainerAnalysis] = useState<ContainerAnalysis | null>(null);
  const [containerState, setContainerState] = useState<LoadState>("idle");
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [apiKey, setApiKey] = useState("");
  const [apiKeyRemembered, setApiKeyRemembered] = useState(false);
  const [accountSnapshot, setAccountSnapshot] = useState<AccountSnapshot | null>(null);
  const [accountItems, setAccountItems] = useState<Map<number, Gw2Item>>(new Map());
  const [analysis, setAnalysis] = useState<AccountAnalysis | null>(null);
  const [analysisState, setAnalysisState] = useState<LoadState>("idle");
  const [apiStatuses, setApiStatuses] = useState<ApiStatusResult[]>([]);
  const [apiStatusState, setApiStatusState] = useState<LoadState>("idle");
  const [apiStatusUpdatedAt, setApiStatusUpdatedAt] = useState<number | null>(null);
  const [marketUpdatedAt, setMarketUpdatedAt] = useState<number | null>(null);
  const [accountUpdatedAt, setAccountUpdatedAt] = useState<number | null>(null);
  const [achievementImportState, setAchievementImportState] = useState<LoadState>("idle");
  const [achievementUpdatedAt, setAchievementUpdatedAt] = useState<number | null>(null);
  const [mapsState, setMapsState] = useState<LoadState>("idle");
  const [mapsUpdatedAt, setMapsUpdatedAt] = useState<number | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [marketScopeId, setMarketScopeId] = useState<MarketScopeId>("global");
  const [maps, setMaps] = useState<Gw2Map[]>([]);
  const [error, setError] = useState<string | null>(null);
  const activePage = pageHistory[pageHistoryIndex] ?? "account";
  const canNavigateBack = pageHistoryIndex > 0;
  const canNavigateForward = pageHistoryIndex < pageHistory.length - 1;
  const marketLoadRunRef = useRef(0);
  const marketPreloadStartedRef = useRef(false);
  const catalogRef = useRef(catalog);
  const marketUpdatedAtRef = useRef(marketUpdatedAt);
  const marketScopeIdRef = useRef(marketScopeId);
  const loadStateRef = useRef(loadState);

  useEffect(() => {
    void migrateLocalStorageMarketHistory();

    const storedMarketScope = normalizeMarketScopeId(
      window.localStorage.getItem(MARKET_SCOPE_STORAGE_KEY),
    );
    if (storedMarketScope) {
      setMarketScopeId(storedMarketScope);
      window.localStorage.setItem(MARKET_SCOPE_STORAGE_KEY, storedMarketScope);
    }

    setMapsState("loading");
    loadMaps()
      .then((loadedMaps) => {
        setMaps(loadedMaps);
        setMapsState("ready");
        setMapsUpdatedAt(Date.now());
      })
      .catch(() => {
        setMapsState("error");
      });

    const storedKeyPromise = window.gw2Desktop?.loadApiKey();
    if (storedKeyPromise) {
      storedKeyPromise.then((storedKey) => {
        refreshApiStatuses(storedKey ?? "");

        if (storedKey) {
          setApiKey(storedKey);
          setApiKeyRemembered(true);
          runAnalysisForKey(storedKey);
        }
      });
    } else {
      refreshApiStatuses("");
    }
  }, []);

  useEffect(() => {
    marketScopeIdRef.current = marketScopeId;
  }, [marketScopeId]);

  useEffect(() => {
    loadStateRef.current = loadState;
  }, [loadState]);

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useEffect(() => {
    marketUpdatedAtRef.current = marketUpdatedAt;
  }, [marketUpdatedAt]);

  useEffect(() => {
    if (!accountSnapshot) {
      setAccountItems(new Map());
      return;
    }

    let ignore = false;
    const ids = Array.from(accountSnapshot.holdings.keys());

    loadItems(ids).then((items) => {
      if (ignore) {
        return;
      }

      setAccountItems(new Map(items.map((item) => [item.id, item])));
    });

    return () => {
      ignore = true;
    };
  }, [accountSnapshot]);

  useEffect(() => {
    let autoScanTimer: number | null = null;
    let cancelled = false;

    const scheduleNextHourlyScan = () => {
      if (cancelled) {
        return;
      }

      autoScanTimer = window.setTimeout(() => {
        autoScanTimer = null;

        if (loadStateRef.current === "loading") {
          scheduleNextHourlyScan();
          return;
        }

        void loadCatalog(marketScopeIdRef.current, { preload: true })
          .catch(() => undefined)
          .finally(scheduleNextHourlyScan);
      }, getDelayToNextMarketHour());
    };

    scheduleNextHourlyScan();

    return () => {
      cancelled = true;
      if (autoScanTimer !== null) {
        window.clearTimeout(autoScanTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (marketPreloadStartedRef.current || catalog.length > 0 || loadState !== "idle") {
      return;
    }

    const preloadTimer = window.setTimeout(() => {
      marketPreloadStartedRef.current = true;
      void loadCatalog(marketScopeId, { preload: true });
    }, MARKET_PRELOAD_DELAY_MS);

    return () => {
      window.clearTimeout(preloadTimer);
    };
  }, [catalog.length, loadState, marketScopeId]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = normalized
      ? catalog.filter((item) => {
          return (
            item.name.toLowerCase().includes(normalized) ||
            item.type.toLowerCase().includes(normalized) ||
            item.rarity.toLowerCase().includes(normalized)
          );
        })
      : catalog;

    return source;
  }, [catalog, query]);

  const dataImports = useMemo<DataImportRow[]>(() => {
    const hasApiKey = Boolean(apiKey.trim() || apiKeyRemembered);
    const latestMapCount = maps.length.toLocaleString();
    const accountDataState: ImportState = accountSnapshot ? "ready" : hasApiKey ? analysisState : "missing";
    const accountDataUpdatedAt = accountSnapshot ? accountUpdatedAt : null;
    const loadedAccountStackCount = accountSnapshot?.holdings.size ?? 0;
    const storedItemStackCount =
      (accountSnapshot?.materials.length ?? 0) +
      (accountSnapshot?.bank.filter(Boolean).length ?? 0) +
      (accountSnapshot?.inventory.filter(Boolean).length ?? 0);

    return [
      {
        id: "api-status",
        label: "API Status",
        detail: apiStatuses.length
          ? `${apiStatuses.length.toLocaleString()} endpoints checked`
          : "Checks GW2 public and account API availability",
        state: apiStatusState,
        updatedAt: apiStatusUpdatedAt,
      },
      {
        id: "account",
        label: "GW2 Account",
        detail: accountSnapshot
          ? `${accountSnapshot.tokenInfo.name} wallet, materials, bank, inventory, recipes, achievements`
          : hasApiKey
            ? "Ready to import personal account data"
            : "API key not provided",
        state: accountDataState,
        updatedAt: accountDataUpdatedAt,
      },
      {
        id: "account-characters",
        label: "Characters",
        detail: accountSnapshot
          ? `${accountSnapshot.characters.length.toLocaleString()} characters loaded for inventory and profession checks`
          : hasApiKey
            ? "Loads character bags and crafting professions from the account key"
            : "API key not provided",
        state: accountDataState,
        updatedAt: accountDataUpdatedAt,
      },
      {
        id: "account-wallet",
        label: "Wallet",
        detail: accountSnapshot
          ? `${accountSnapshot.wallet.length.toLocaleString()} currencies loaded, including current coin balance`
          : hasApiKey
            ? "Loads currencies and coin balance from the account key"
            : "API key not provided",
        state: accountDataState,
        updatedAt: accountDataUpdatedAt,
      },
      {
        id: "account-inventory",
        label: "Inventory & Materials",
        detail: accountSnapshot
          ? `${loadedAccountStackCount.toLocaleString()} unique item holdings from ${storedItemStackCount.toLocaleString()} storage entries`
          : hasApiKey
            ? "Loads material storage, bank, shared inventory, and character bags"
            : "API key not provided",
        state: accountDataState,
        updatedAt: accountDataUpdatedAt,
      },
      {
        id: "account-recipes",
        label: "Unlocked Recipes",
        detail: accountSnapshot
          ? `${accountSnapshot.recipes.length.toLocaleString()} unlocked recipes loaded for personal craft checks`
          : hasApiKey
            ? "Loads unlocked account recipes from the account key"
            : "API key not provided",
        state: accountDataState,
        updatedAt: accountDataUpdatedAt,
      },
      {
        id: "account-achievements",
        label: "Achievements",
        detail: accountSnapshot
          ? `${accountSnapshot.achievements.length.toLocaleString()} account achievement progress records loaded`
          : hasApiKey
            ? "Loads personal achievement progress from the account key"
            : "API key not provided",
        state: accountDataState,
        updatedAt: accountDataUpdatedAt,
      },
      {
        id: "trading-post",
        label: "Trading Post",
        detail: catalog.length
          ? `${catalog.length.toLocaleString()} market items loaded`
          : "Live prices and item catalog not loaded",
        state: loadState,
        updatedAt: marketUpdatedAt,
      },
      {
        id: "achievement-catalog",
        label: "Achievement Catalog",
        detail:
          achievementImportState === "idle"
            ? "Open Achievements to import the official achievement catalog"
            : "Official achievement catalog and account progress guide data",
        state: achievementImportState,
        updatedAt: achievementUpdatedAt,
      },
      {
        id: "maps",
        label: "Maps",
        detail: maps.length ? `${latestMapCount} official map entries loaded` : "Map metadata not loaded",
        state: mapsState,
        updatedAt: mapsUpdatedAt,
      },
    ];
  }, [
    accountSnapshot,
    accountUpdatedAt,
    achievementImportState,
    achievementUpdatedAt,
    analysisState,
    apiKey,
    apiKeyRemembered,
    apiStatuses.length,
    apiStatusState,
    apiStatusUpdatedAt,
    catalog.length,
    loadState,
    maps.length,
    mapsState,
    mapsUpdatedAt,
    marketUpdatedAt,
  ]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    let ignore = false;
    setDetailState("loading");
    setListings(null);
    setItemTransactions(null);
    setRecipes([]);
    setUsedInRecipes([]);
    setRecipeUsageState("loading");
    setWikiGuide(null);
    setContainerAnalysis(null);
    setContainerState(isLikelyContainer(selectedItem) ? "loading" : "idle");
    const transactionKey = accountSnapshot ? apiKey.trim() : "";
    const hasMarketPrice =
      selectedItem.price.buys.unit_price > 0 || selectedItem.price.sells.unit_price > 0;

    Promise.allSettled([
      hasMarketPrice ? loadListings(selectedItem.id) : Promise.resolve(null),
      loadRecipesForOutput(selectedItem.id, accountSnapshot?.holdings),
      loadRecipesUsingItem(selectedItem.id, accountSnapshot?.holdings),
      loadWikiGuide(selectedItem.name),
      transactionKey && hasMarketPrice
        ? loadTransactionsForItem(transactionKey, selectedItem.id)
        : Promise.resolve(null),
      isLikelyContainer(selectedItem)
        ? loadContainerAnalysis(selectedItem.name)
        : Promise.resolve(null),
    ]).then((results) => {
      if (ignore) {
        return;
      }

      if (results[0].status === "fulfilled") {
        setListings(results[0].value);
      }

      if (results[1].status === "fulfilled") {
        setRecipes(results[1].value);
      }

      if (results[2].status === "fulfilled") {
        setUsedInRecipes(results[2].value);
        setRecipeUsageState("ready");
      } else {
        setRecipeUsageState("error");
      }

      if (results[3].status === "fulfilled") {
        setWikiGuide(results[3].value);
      }

      if (results[4].status === "fulfilled") {
        setItemTransactions(results[4].value);
      }

      if (results[5].status === "fulfilled") {
        setContainerAnalysis(results[5].value);
        setContainerState(results[5].value ? "ready" : "error");
      } else if (isLikelyContainer(selectedItem)) {
        setContainerState("error");
      }

      setDetailState("ready");
    });

    return () => {
      ignore = true;
    };
  }, [accountSnapshot, apiKey, selectedItem]);

  useEffect(() => {
    function handleNavigationHotkeys(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTextEntry =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        Boolean(target?.isContentEditable);

      if (isTextEntry) {
        return;
      }

      const wantsBack =
        (event.altKey && event.key === "ArrowLeft") ||
        (event.metaKey && event.key === "[");
      const wantsForward =
        (event.altKey && event.key === "ArrowRight") ||
        (event.metaKey && event.key === "]");

      if (wantsBack && canNavigateBack) {
        event.preventDefault();
        navigateBack();
      }

      if (wantsForward && canNavigateForward) {
        event.preventDefault();
        navigateForward();
      }
    }

    window.addEventListener("keydown", handleNavigationHotkeys);
    return () => window.removeEventListener("keydown", handleNavigationHotkeys);
  }, [canNavigateBack, canNavigateForward, pageHistoryIndex]);

  function navigateToPage(page: ActivePage) {
    if (page === activePage) {
      return;
    }

    const nextHistory = [...pageHistory.slice(0, pageHistoryIndex + 1), page];
    setPageHistory(nextHistory);
    setPageHistoryIndex(nextHistory.length - 1);
  }

  function navigateBack() {
    setPageHistoryIndex((current) => Math.max(0, current - 1));
  }

  function navigateForward() {
    setPageHistoryIndex((current) => Math.min(pageHistory.length - 1, current + 1));
  }

  function openActivityGuide(suggestion: GoldSuggestion) {
    navigateToPage(`activity:${getActivityIdForSuggestion(suggestion)}`);
  }

  function openItemSearch(itemName: string) {
    setQuery(itemName);

    const match = catalog.find((item) => item.name.toLowerCase() === itemName.toLowerCase());
    if (match) {
      setSelectedItem(match);
    } else {
      setSelectedItem(null);
    }

    navigateToPage("market");
  }

  async function refreshApiStatuses(key = apiKey.trim()) {
    setApiStatusState("loading");

    try {
      const statuses = await checkApiStatuses(key);
      setApiStatuses(statuses);
      setApiStatusState("ready");
      setApiStatusUpdatedAt(Date.now());
    } catch (statusError) {
      setApiStatusState("error");
      setError(statusError instanceof Error ? statusError.message : "Unable to check API status");
    }
  }

  async function loadCatalog(
    scopeId = marketScopeId,
    options: { preload?: boolean } = {},
  ): Promise<MarketItem[]> {
    const scopeLabel = getMarketScopeLabel(scopeId);
    const currentCatalog = catalogRef.current;
    const cooldownRemaining = getMarketScanCooldownRemaining(marketUpdatedAtRef.current);

    if (loadStateRef.current === "loading") {
      return currentCatalog;
    }

    if (currentCatalog.length > 0 && cooldownRemaining > 0) {
      setLoadState("ready");
      loadStateRef.current = "ready";
      setProgressCount(null);
      setProgress(
        `${currentCatalog.length.toLocaleString()} Trading Post items already loaded - next live scan in ${formatMarketScanCooldown(cooldownRemaining)}`,
      );
      return currentCatalog;
    }

    const runId = marketLoadRunRef.current + 1;
    marketLoadRunRef.current = runId;
    const existingCatalogById = new Map(currentCatalog.map((item) => [item.id, item]));
    const catalogById = new Map(existingCatalogById);
    const refreshedItemIds = new Set<number>();
    let lastCatalogPublishAt = 0;
    let catalogPublishTimer: number | null = null;
    let expectedMarketItemTotal: number | null = null;

    const isCurrentLoad = () => marketLoadRunRef.current === runId;
    const publishCatalog = (items: MarketItem[], updatedAt = Date.now()) => {
      if (!isCurrentLoad()) {
        return;
      }

      const sortedItems = Array.from(items).sort((left, right) => {
        const quantityDelta = right.price.sells.quantity - left.price.sells.quantity;
        if (quantityDelta !== 0) {
          return quantityDelta;
        }

        return right.price.sells.unit_price - left.price.sells.unit_price;
      });

      setCatalog(sortedItems);
      catalogRef.current = sortedItems;
      setSelectedItem((current) => {
        if (!current) {
          return sortedItems[0] ?? null;
        }

        return sortedItems.find((item) => item.id === current.id) ?? current;
      });
      setMarketUpdatedAt(updatedAt);
      marketUpdatedAtRef.current = updatedAt;
      lastCatalogPublishAt = Date.now();
    };
    const clearCatalogPublishTimer = () => {
      if (catalogPublishTimer !== null) {
        window.clearTimeout(catalogPublishTimer);
        catalogPublishTimer = null;
      }
    };
    const publishCurrentCatalog = (updatedAt?: number) => {
      publishCatalog(Array.from(catalogById.values()), updatedAt);
    };
    const scheduleCatalogPublish = () => {
      if (!isCurrentLoad()) {
        return;
      }

      const now = Date.now();
      const delay = Math.max(0, 300 - (now - lastCatalogPublishAt));
      if (delay === 0) {
        clearCatalogPublishTimer();
        publishCurrentCatalog();
        return;
      }

      if (catalogPublishTimer !== null) {
        return;
      }

      catalogPublishTimer = window.setTimeout(() => {
        catalogPublishTimer = null;
        publishCurrentCatalog();
      }, delay);
    };

    setLoadState("loading");
    loadStateRef.current = "loading";
    setError(null);
    setProgressCount(null);
    setProgress(`${options.preload ? "Preloading" : "Loading"} ${scopeLabel} market`);

    try {
      const cachedCatalog = await loadCachedMarketCatalog(scopeId);
      if (cachedCatalog && isCurrentLoad()) {
        for (const item of cachedCatalog.items) {
          catalogById.set(item.id, mergeMarketItemMetadata(item, catalogById.get(item.id)));
        }

        publishCatalog(Array.from(catalogById.values()), cachedCatalog.updatedAt);
        const cachedCooldownRemaining = getMarketScanCooldownRemaining(cachedCatalog.updatedAt);
        if (cachedCooldownRemaining > 0) {
          setLoadState("ready");
          loadStateRef.current = "ready";
          setProgressCount(null);
          setProgress(
            `${cachedCatalog.items.length.toLocaleString()} cached Trading Post items shown - next live scan in ${formatMarketScanCooldown(cachedCooldownRemaining)}`,
          );
          return catalogRef.current;
        }

        setProgress(
          `${cachedCatalog.items.length.toLocaleString()} cached Trading Post items shown - refreshing ${scopeLabel}`,
        );
      }

      const items = await loadTradingPostCatalogProgressive(
        (batch, batchProgress) => {
          if (!isCurrentLoad()) {
            return;
          }

          for (const item of batch) {
            refreshedItemIds.add(item.id);
            catalogById.set(item.id, mergeMarketItemMetadata(item, catalogById.get(item.id)));
          }

          expectedMarketItemTotal = batchProgress.total ?? expectedMarketItemTotal;
          scheduleCatalogPublish();
          setProgress(
            `${refreshedItemIds.size.toLocaleString()} Trading Post items refreshed - ${scopeLabel}`,
          );
          setProgressCount(
            batchProgress.total
              ? { done: Math.min(refreshedItemIds.size, batchProgress.total), total: batchProgress.total }
              : null,
          );
        },
        (message, done, total) => {
          if (!isCurrentLoad()) {
            return;
          }

          setProgress(`${message} - ${scopeLabel}`);
          setProgressCount(done && total ? { done, total } : null);
        },
      );

      if (!isCurrentLoad()) {
        clearCatalogPublishTimer();
        return items;
      }

      clearCatalogPublishTimer();
      const mergedItems = items.map((item) =>
        mergeMarketItemMetadata(item, catalogById.get(item.id) ?? existingCatalogById.get(item.id)),
      );
      setCatalog(mergedItems);
      setSelectedItem((current) => {
        if (!current) {
          return mergedItems[0] ?? null;
        }

        return mergedItems.find((item) => item.id === current.id) ?? current;
      });
      setLoadState("ready");
      loadStateRef.current = "ready";
      const loadedAt = Date.now();
      setMarketUpdatedAt(loadedAt);
      marketUpdatedAtRef.current = loadedAt;
      catalogRef.current = mergedItems;
      setProgressCount(null);
      const skippedCount = expectedMarketItemTotal
        ? Math.max(0, expectedMarketItemTotal - mergedItems.length)
        : 0;
      setProgress(
        `${mergedItems.length.toLocaleString()} Trading Post items loaded - ${scopeLabel}${
          skippedCount
            ? ` (${skippedCount.toLocaleString()} unavailable item IDs skipped)`
            : ""
        }`,
      );
      void saveCachedMarketCatalog(scopeId, mergedItems);
      return mergedItems;
    } catch (loadError) {
      if (isCurrentLoad()) {
        if (catalogById.size > 0) {
          clearCatalogPublishTimer();
          publishCurrentCatalog(marketUpdatedAtRef.current ?? Date.now());
          setLoadState("ready");
          loadStateRef.current = "ready";
          setProgressCount(null);
          setProgress(
            `${catalogById.size.toLocaleString()} cached Trading Post items shown - live refresh failed`,
          );
          return catalogRef.current;
        } else {
          setLoadState("error");
          loadStateRef.current = "error";
          setProgressCount(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load catalog");
        }
      }
      throw loadError;
    }
  }

  async function loadCraftOpportunities(): Promise<CraftOpportunity[]> {
    if (craftLoadState === "loading") {
      return marketCrafts;
    }

    setCraftLoadState("loading");
    setError(null);
    setProgressCount(null);
    setProgress("Loading profitable craft data");

    try {
      const opportunities = await loadProfitableCrafts((message, done, total) => {
        setProgress(message);
        setProgressCount(done && total ? { done, total } : null);
      });

      setMarketCrafts(opportunities);
      setCraftLoadState("ready");
      setCraftsUpdatedAt(Date.now());
      setProgress(`${opportunities.length.toLocaleString()} profitable crafts ranked`);
      return opportunities;
    } catch (craftError) {
      setCraftLoadState("error");
      setError(craftError instanceof Error ? craftError.message : "Unable to load craft profits");
      throw craftError;
    }
  }

  async function loadHighValueCraftOpportunities(): Promise<CraftOpportunity[]> {
    if (highValueCraftLoadState === "loading") {
      return highValueCrafts;
    }

    setHighValueCraftLoadState("loading");
    setError(null);
    setProgressCount(null);
    setProgress("Loading high-value craft outputs");

    try {
      const opportunities = await loadHighValueCrafts((message, done, total) => {
        setProgress(message);
        setProgressCount(done && total ? { done, total } : null);
      });

      setHighValueCrafts(opportunities);
      setHighValueCraftLoadState("ready");
      setHighValueCraftsUpdatedAt(Date.now());
      setProgress(`${opportunities.length.toLocaleString()} high-value craft outputs ranked`);
      return opportunities;
    } catch (craftError) {
      setHighValueCraftLoadState("error");
      setError(craftError instanceof Error ? craftError.message : "Unable to load high-value crafts");
      throw craftError;
    }
  }

  function selectCraftOpportunity(opportunity: CraftOpportunity) {
    const marketItem = buildMarketItemFromStoredPrice(opportunity.output);
    if (marketItem) {
      setSelectedItem(marketItem);
    }
  }

  async function exportMarketHistory() {
    const points = await readAllMarketHistory();
    const payload = {
      app: "tyria-ledger",
      kind: "market-history",
      version: 1,
      exportedAt: new Date().toISOString(),
      points,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tyria-ledger-market-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setProgress(`${points.length.toLocaleString()} market history snapshots exported`);
  }

  async function importMarketHistory(file: File): Promise<MarketHistoryImportResult> {
    try {
      const text = await file.text();
      const importedPoints = parseMarketHistoryImport(text);
      const result = window.gw2Desktop?.importMarketHistory
        ? await window.gw2Desktop.importMarketHistory(importedPoints).catch(() =>
            importMarketHistoryToLocalStore(importedPoints),
          )
        : importMarketHistoryToLocalStore(importedPoints);
      setMarketHistoryRevision((revision) => revision + 1);
      setProgress(
        `${result.added.toLocaleString()} market snapshots imported - ${result.ignored.toLocaleString()} item-days skipped`,
      );
      return {
        added: result.added,
        ignored: result.ignored,
        total: result.total,
      };
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Unable to import market history");
      throw importError;
    }
  }

  function updateMarketScope(nextScopeId: MarketScopeId) {
    setMarketScopeId(nextScopeId);
    window.localStorage.setItem(MARKET_SCOPE_STORAGE_KEY, nextScopeId);

    if (catalog.length > 0 && loadState !== "loading") {
      void loadCatalog(nextScopeId);
    }
  }

  async function saveApiKey() {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      return;
    }

    await window.gw2Desktop?.saveApiKey(trimmedKey);
    setApiKeyRemembered(true);
    await refreshApiStatuses(trimmedKey);
    await runAnalysisForKey(trimmedKey);
  }

  async function refreshAccountSnapshot(key: string) {
    try {
      const snapshot = await loadAccountSnapshot(key);
      setAccountSnapshot(snapshot);
      setAccountUpdatedAt(Date.now());
      setProgress(`Personal data ready for ${snapshot.tokenInfo.name}`);
      return snapshot;
    } catch (snapshotError) {
      setError(
        snapshotError instanceof Error
          ? snapshotError.message
          : "Unable to load account snapshot",
      );
      throw snapshotError;
    }
  }

  async function forgetApiKey() {
    await window.gw2Desktop?.deleteApiKey();
    setApiKey("");
    setApiKeyRemembered(false);
    setAnalysis(null);
    setAccountSnapshot(null);
    setAccountUpdatedAt(null);
    await refreshApiStatuses("");
  }

  async function runAnalysisForKey(key = apiKey.trim()) {
    if (!key) {
      setError("Paste a GW2 API key before account analysis.");
      return;
    }

    setAnalysisState("loading");
    setError(null);
    setProgressCount(null);

    try {
      const result = await analyzeAccount(key, (message, done, total) => {
        setProgress(message);
        setProgressCount(done && total ? { done, total } : null);
      });
      setAnalysis(result);
      setAccountSnapshot(result.account);
      setAnalysisState("ready");
      setAccountUpdatedAt(Date.now());
      setProgress(`Account analysis ready for ${result.account.tokenInfo.name}`);
      await refreshApiStatuses(key);
    } catch (analysisError) {
      setAnalysisState("error");
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to analyze this account key",
      );

      if (!accountSnapshot && key) {
        await refreshAccountSnapshot(key).catch(() => undefined);
      }
    }
  }

  const content = (() => {
    if (activePage === "account") {
      return (
        <AccountDashboard
          accountSnapshot={accountSnapshot}
          accountItems={accountItems}
          analysis={analysis}
          analysisState={analysisState}
          apiStatuses={apiStatuses}
          apiStatusState={apiStatusState}
          catalog={catalog}
          dataImports={dataImports}
          onAnalyze={() => runAnalysisForKey()}
          onOpenActivity={openActivityGuide}
          onOpenItemSearch={openItemSearch}
          onLoadMarket={loadCatalog}
          onRefreshApiStatuses={() => refreshApiStatuses()}
        />
      );
    }

    if (activePage === "account-items") {
      return (
        <AccountItemsPage
          accountSnapshot={accountSnapshot}
          accountItems={accountItems}
          analysisState={analysisState}
          onAnalyze={() => runAnalysisForKey()}
          onOpenItem={(item) => {
            setSelectedItem(buildMarketItemForDetail(item));
            navigateToPage("market");
          }}
        />
      );
    }

    if (activePage.startsWith("activity:")) {
      return (
        <ActivityGuidePage
          activePage={activePage}
          maps={maps}
          onOpenActivity={openActivityGuide}
        />
      );
    }

    if (activePage === "wizard-vault") {
      return (
        <WizardVaultPage
          apiKey={apiKey}
          apiKeyRemembered={apiKeyRemembered}
          onOpenItem={(item) => {
            setSelectedItem(buildMarketItemForDetail(item));
            navigateToPage("market");
          }}
          onProgress={(message, done, total) => {
            setProgress(message);
            setProgressCount(done && total ? { done, total } : null);
          }}
        />
      );
    }

    if (activePage === "account-achievements") {
      return (
        <AchievementsPage
          accountSnapshot={accountSnapshot}
          analysisState={analysisState}
          onAnalyze={() => runAnalysisForKey()}
          onImportStateChange={(state, updatedAt = null) => {
            setAchievementImportState(state);
            if (updatedAt) {
              setAchievementUpdatedAt(updatedAt);
            }
          }}
          onProgress={(message, done, total) => {
            setProgress(message);
            setProgressCount(done && total ? { done, total } : null);
          }}
        />
      );
    }

    if (activePage === "farming-builds") {
      return <BuildLibraryPage />;
    }

    if (activePage === "farming-tracker") {
      return (
        <FarmTrackerPage
          accountSnapshot={accountSnapshot}
          accountItems={accountItems}
          apiKeyRemembered={apiKeyRemembered}
          analysisState={analysisState}
          onAnalyze={() => runAnalysisForKey()}
        />
      );
    }

    if (activePage === "farming-calculator") {
      return (
        <FarmingCalculatorPage
          highValueCrafts={highValueCrafts}
          highValueCraftLoadState={highValueCraftLoadState}
          highValueCraftsUpdatedAt={highValueCraftsUpdatedAt}
          onLoadHighValueCrafts={loadHighValueCraftOpportunities}
          onSelectCraft={(opportunity) => {
            selectCraftOpportunity(opportunity);
            navigateToPage("crafting");
          }}
        />
      );
    }

    if (activePage === "market") {
      return (
        <MarketPage
          catalog={catalog}
          filteredItems={filteredItems}
          selectedItem={selectedItem}
          query={query}
          loadState={loadState}
          listings={listings}
          itemTransactions={itemTransactions}
          recipes={recipes}
          usedInRecipes={usedInRecipes}
          recipeUsageState={recipeUsageState}
          wikiGuide={wikiGuide}
          detailState={detailState}
          containerAnalysis={containerAnalysis}
          containerState={containerState}
          accountSnapshot={accountSnapshot}
          marketHistoryRevision={marketHistoryRevision}
          onQueryChange={setQuery}
          onExportMarketHistory={exportMarketHistory}
          onImportMarketHistory={importMarketHistory}
          onCloseDetail={() => setSelectedItem(null)}
          onSelectItem={setSelectedItem}
          onLoadMarket={loadCatalog}
        />
      );
    }

    if (activePage === "crafting") {
      return (
        <CraftingPlannerPage
          catalog={catalog}
          craftLoadState={craftLoadState}
          craftsUpdatedAt={craftsUpdatedAt}
          marketCrafts={marketCrafts}
          selectedItem={selectedItem}
          listings={listings}
          itemTransactions={itemTransactions}
          recipes={recipes}
          usedInRecipes={usedInRecipes}
          recipeUsageState={recipeUsageState}
          wikiGuide={wikiGuide}
          detailState={detailState}
          containerAnalysis={containerAnalysis}
          containerState={containerState}
          accountSnapshot={accountSnapshot}
          marketHistoryRevision={marketHistoryRevision}
          onLoadCrafts={loadCraftOpportunities}
          onCloseDetail={() => setSelectedItem(null)}
          onSelectCraft={selectCraftOpportunity}
          onSelectItem={(item) => setSelectedItem(buildMarketItemForDetail(item))}
        />
      );
    }

    if (activePage === "profitable-crafts") {
      return (
        <ProfitableCraftsPage
          accountSnapshot={accountSnapshot}
          craftLoadState={craftLoadState}
          craftsUpdatedAt={craftsUpdatedAt}
          marketCrafts={marketCrafts}
          onLoadCrafts={loadCraftOpportunities}
          onSelectCraft={(opportunity) => {
            selectCraftOpportunity(opportunity);
            navigateToPage("crafting");
          }}
        />
      );
    }

    if (activePage === "legendary-readiness") {
      return (
        <LegendaryReadinessPage
          accountSnapshot={accountSnapshot}
          analysis={analysis}
          analysisState={analysisState}
          onAnalyze={() => runAnalysisForKey()}
        />
      );
    }

    if (activePage === "salvaging") {
      return (
        <SalvagingPage
          catalog={catalog}
          loadState={loadState}
          selectedItem={selectedItem}
          listings={listings}
          itemTransactions={itemTransactions}
          recipes={recipes}
          usedInRecipes={usedInRecipes}
          recipeUsageState={recipeUsageState}
          wikiGuide={wikiGuide}
          detailState={detailState}
          containerAnalysis={containerAnalysis}
          containerState={containerState}
          accountSnapshot={accountSnapshot}
          marketHistoryRevision={marketHistoryRevision}
          onCloseDetail={() => setSelectedItem(null)}
          onSelectItem={setSelectedItem}
          onLoadMarket={loadCatalog}
        />
      );
    }

    if (activePage === "unidentified-gear") {
      return (
        <UnidentifiedGearPage
          catalog={catalog}
          loadState={loadState}
          selectedItem={selectedItem}
          listings={listings}
          itemTransactions={itemTransactions}
          recipes={recipes}
          usedInRecipes={usedInRecipes}
          recipeUsageState={recipeUsageState}
          wikiGuide={wikiGuide}
          detailState={detailState}
          containerAnalysis={containerAnalysis}
          containerState={containerState}
          accountSnapshot={accountSnapshot}
          marketHistoryRevision={marketHistoryRevision}
          onCloseDetail={() => setSelectedItem(null)}
          onSelectItem={setSelectedItem}
          onLoadMarket={loadCatalog}
        />
      );
    }

    if (activePage === "bag-opener") {
      return (
        <OpenableBagsPage
          catalog={catalog}
          selectedItem={selectedItem}
          listings={listings}
          itemTransactions={itemTransactions}
          recipes={recipes}
          usedInRecipes={usedInRecipes}
          recipeUsageState={recipeUsageState}
          wikiGuide={wikiGuide}
          detailState={detailState}
          containerAnalysis={containerAnalysis}
          containerState={containerState}
          accountSnapshot={accountSnapshot}
          marketHistoryRevision={marketHistoryRevision}
          onProgress={(message, done, total) => {
            setProgress(message);
            setProgressCount(done && total ? { done, total } : null);
          }}
          onCloseDetail={() => setSelectedItem(null)}
          onSelectItem={setSelectedItem}
        />
      );
    }

    if (activePage === "bags" || activePage === "bags-table" || activePage === "storage-slot-bags") {
      return (
        <SlotBagsPage
          catalog={catalog}
          selectedItem={selectedItem}
          listings={listings}
          itemTransactions={itemTransactions}
          recipes={recipes}
          usedInRecipes={usedInRecipes}
          recipeUsageState={recipeUsageState}
          wikiGuide={wikiGuide}
          detailState={detailState}
          containerAnalysis={containerAnalysis}
          containerState={containerState}
          accountSnapshot={accountSnapshot}
          marketHistoryRevision={marketHistoryRevision}
          onProgress={(message, done, total) => {
            setProgress(message);
            setProgressCount(done && total ? { done, total } : null);
          }}
          onCloseDetail={() => setSelectedItem(null)}
          onSelectItem={setSelectedItem}
        />
      );
    }

    if (activePage === "meta-events") {
      return (
        <ActivityGuidePage
          activePage="activity:open-world-meta-event-trains"
          maps={maps}
          onOpenActivity={openActivityGuide}
        />
      );
    }

    if (activePage === "gathering") {
      return (
        <GatheringPage
          catalog={catalog}
          selectedItem={selectedItem}
          listings={listings}
          itemTransactions={itemTransactions}
          recipes={recipes}
          usedInRecipes={usedInRecipes}
          recipeUsageState={recipeUsageState}
          wikiGuide={wikiGuide}
          detailState={detailState}
          containerAnalysis={containerAnalysis}
          containerState={containerState}
          accountSnapshot={accountSnapshot}
          marketHistoryRevision={marketHistoryRevision}
          onProgress={(message, done, total) => {
            setProgress(message);
            setProgressCount(done && total ? { done, total } : null);
          }}
          onCloseDetail={() => setSelectedItem(null)}
          onSelectItem={setSelectedItem}
        />
      );
    }

    return (
      <CategoryPage
        activePage={activePage}
        catalog={catalog}
        maps={maps}
        onLoadMarket={loadCatalog}
        onOpenActivity={openActivityGuide}
      />
    );
  })();

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        apiKey={apiKey}
        apiKeyRemembered={apiKeyRemembered}
        analysisState={analysisState}
        marketScopeId={marketScopeId}
        sidebarSearch={sidebarSearch}
        onAnalyze={() => runAnalysisForKey()}
        onApiKeyChange={setApiKey}
        onForgetApiKey={forgetApiKey}
        onMarketScopeChange={updateMarketScope}
        onSaveApiKey={saveApiKey}
        onSidebarSearchChange={setSidebarSearch}
        onSetActivePage={navigateToPage}
      />

      <main className="content-shell">
        <section className="status-strip">
          <div className="status-left">
            <div className="history-controls">
              <button onClick={navigateBack} disabled={!canNavigateBack} aria-label="Back">
                <ChevronLeft />
                <span>Back</span>
              </button>
              <button onClick={navigateForward} disabled={!canNavigateForward} aria-label="Forward">
                <span>Forward</span>
                <ChevronRight />
              </button>
            </div>
            <div className="progress-copy">
              <strong>{progress}</strong>
              {progressCount ? (
                <span>
                  {progressCount.done} / {progressCount.total}
                </span>
              ) : null}
            </div>
          </div>
          {error ? (
            <div className="error-pill">
              <AlertCircle />
              {error}
              <button onClick={() => setError(null)} aria-label="Dismiss error">
                <X />
              </button>
            </div>
          ) : null}
        </section>

        <div className="content-main">{content}</div>
      </main>
    </div>
  );
}

function Sidebar({
  activePage,
  apiKey,
  apiKeyRemembered,
  analysisState,
  marketScopeId,
  sidebarSearch,
  onAnalyze,
  onApiKeyChange,
  onForgetApiKey,
  onMarketScopeChange,
  onSaveApiKey,
  onSidebarSearchChange,
  onSetActivePage,
}: {
  activePage: ActivePage;
  apiKey: string;
  apiKeyRemembered: boolean;
  analysisState: LoadState;
  marketScopeId: MarketScopeId;
  sidebarSearch: string;
  onAnalyze: () => void;
  onApiKeyChange: (value: string) => void;
  onForgetApiKey: () => void;
  onMarketScopeChange: (scopeId: MarketScopeId) => void;
  onSaveApiKey: () => void;
  onSidebarSearchChange: (value: string) => void;
  onSetActivePage: (page: ActivePage) => void;
}) {
  const normalizedSearch = sidebarSearch.trim().toLowerCase();
  const visibleGroups = normalizedSearch
    ? SIDEBAR_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          return (
            item.label.toLowerCase().includes(normalizedSearch) ||
            group.title.toLowerCase().includes(normalizedSearch)
          );
        }),
      })).filter((group) => group.items.length > 0)
    : SIDEBAR_GROUPS;

  return (
    <aside className="side-nav">
      <div className="side-brand">
        <div className="brand-mark">TL</div>
        <div>
          <h1>Tyria Ledger</h1>
          <p>GW2 account economy</p>
        </div>
      </div>

      <label className="nav-search">
        <Search />
        <input
          value={sidebarSearch}
          onChange={(event) => onSidebarSearchChange(event.target.value)}
          placeholder="Search tools, currencies, farms"
        />
      </label>

      <nav className="side-menu" aria-label="Primary navigation">
        {visibleGroups.map((group) => (
          <details key={group.title} className="nav-group" open>
            <summary>
              <ChevronRight className="summary-closed" />
              <ChevronDown className="summary-open" />
              {group.title}
            </summary>
            <div className="nav-group-items">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => onSetActivePage(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </details>
        ))}
        {visibleGroups.length === 0 ? (
          <p className="nav-empty">No matching tools found.</p>
        ) : null}
      </nav>

      <div className="side-bottom">
        <MarketScopeSelector
          marketScopeId={marketScopeId}
          onMarketScopeChange={onMarketScopeChange}
        />

        <section className="api-key-dock">
          <div className="dock-title">
            <KeyRound />
            <span>GW2 API Key</span>
            {apiKeyRemembered ? <CheckCircle2 className="ok" /> : null}
          </div>
          <div className="key-row">
            <input
              value={apiKey}
              type="password"
              onChange={(event) => onApiKeyChange(event.target.value)}
              placeholder="Paste account API key"
            />
            <button onClick={onSaveApiKey} disabled={!apiKey.trim()}>
              Save
            </button>
          </div>
          <div className="small-actions">
            <button onClick={onAnalyze} disabled={analysisState === "loading" || !apiKey.trim()}>
              {analysisState === "loading" ? <Loader2 className="spin" /> : <TrendingUp />}
              Analyze
            </button>
            <button onClick={onForgetApiKey} disabled={!apiKey && !apiKeyRemembered}>
              <X />
              Forget
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}

function MarketScopeSelector({
  marketScopeId,
  onMarketScopeChange,
}: {
  marketScopeId: MarketScopeId;
  onMarketScopeChange: (scopeId: MarketScopeId) => void;
}) {
  return (
    <section className="market-scope-dock">
      <div className="dock-title">
        <Server />
        <span>Market Scope</span>
      </div>
      <select
        value={marketScopeId}
        onChange={(event) => {
          const nextScope = event.target.value;
          if (isMarketScopeId(nextScope)) {
            onMarketScopeChange(nextScope);
          }
        }}
      >
        <option value="global">Global Trading Post</option>
        <option value="region:north-america">North America</option>
        <option value="region:europe">Europe</option>
      </select>
      <p>
        The official Trading Post API exposes shared market data. The region scope is saved for
        filtering, notes, and future region-aware data.
      </p>
    </section>
  );
}

function isMarketScopeId(value: string | null): value is MarketScopeId {
  if (!value) {
    return false;
  }

  return (
    value === "global" ||
    value === "region:north-america" ||
    value === "region:europe"
  );
}

function normalizeMarketScopeId(value: string | null): MarketScopeId | null {
  if (isMarketScopeId(value)) {
    return value;
  }

  const worldId = value?.startsWith("world:") ? Number(value.replace("world:", "")) : NaN;
  if (worldId >= 1000 && worldId < 2000) {
    return "region:north-america";
  }

  if (worldId >= 2000 && worldId < 3000) {
    return "region:europe";
  }

  return null;
}

function getMarketScopeLabel(scopeId: MarketScopeId): string {
  if (scopeId === "global") {
    return "Global Trading Post";
  }

  if (scopeId === "region:north-america") {
    return "North America";
  }

  if (scopeId === "region:europe") {
    return "Europe";
  }

  return "Global Trading Post";
}

async function loadCachedMarketCatalog(
  scopeId: MarketScopeId,
): Promise<{ items: MarketItem[]; updatedAt: number } | null> {
  if (!window.gw2Desktop?.loadMarketCatalog) {
    return null;
  }

  try {
    const cached = await window.gw2Desktop.loadMarketCatalog(scopeId);
    if (!cached) {
      return null;
    }

    const items = cached.items.filter(isCachedMarketItem);
    if (items.length === 0) {
      return null;
    }

    hydrateTradingPostCatalogCache(items);
    const updatedAt = new Date(cached.updatedAt).getTime();
    return {
      items,
      updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

async function saveCachedMarketCatalog(scopeId: MarketScopeId, items: MarketItem[]) {
  if (!window.gw2Desktop?.saveMarketCatalog || items.length === 0) {
    return;
  }

  try {
    await window.gw2Desktop.saveMarketCatalog(scopeId, items);
  } catch {
    // A failed cache write should not make live market loading feel broken.
  }
}

function mergeMarketItemMetadata(next: MarketItem, previous?: MarketItem): MarketItem {
  if (!previous) {
    return next;
  }

  return {
    ...previous,
    ...next,
    icon: next.icon || previous.icon,
    description: next.description ?? previous.description,
    chat_link: next.chat_link ?? previous.chat_link,
    details: next.details ?? previous.details,
    default_skin: next.default_skin ?? previous.default_skin,
    flags: next.flags ?? previous.flags,
    game_types: next.game_types ?? previous.game_types,
    restrictions: next.restrictions ?? previous.restrictions,
    price: next.price,
    netSellPrice: next.netSellPrice,
    spread: next.spread,
    spreadPercent: next.spreadPercent,
  };
}

function isCachedMarketItem(value: unknown): value is MarketItem {
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

function ApiStatusPanel({
  apiStatusState,
  apiStatuses,
  onRefreshApiStatuses,
}: {
  apiStatusState: LoadState;
  apiStatuses: ApiStatusResult[];
  onRefreshApiStatuses: () => void;
}) {
  const issueStatuses = apiStatuses.filter((status) => status.state !== "not_configured" && !status.ok);
  const missingUserApi = apiStatuses.some((status) => status.group === "User GW2 API" && status.state === "not_configured");
  const allOk = apiStatuses.length > 0 && issueStatuses.length === 0;
  const warningSummary = getApiStatusWarningSummary(issueStatuses);
  const grouped = apiStatuses.reduce<Record<string, ApiStatusResult[]>>((groups, status) => {
    groups[status.group] = groups[status.group] ?? [];
    groups[status.group].push(status);
    return groups;
  }, {});

  return (
    <section className="api-status-panel">
      <div className="api-status-head">
        <div>
          <span className="eyebrow">API Status</span>
          <h3>{allOk ? (missingUserApi ? "Public systems operational" : "All systems operational") : "Service check"}</h3>
        </div>
        {apiStatusState === "loading" ? (
          <Loader2 className="spin" />
        ) : allOk ? (
          <CheckCircle2 className="ok" />
        ) : (
          <ApiWarningIcon message={warningSummary} placement="head" />
        )}
      </div>

      <button className="refresh-status" onClick={onRefreshApiStatuses}>
        <RefreshCcw />
        Check again
      </button>

      {apiStatusState === "loading" && apiStatuses.length === 0 ? <SkeletonRows /> : null}
      {Object.entries(grouped).map(([group, statuses]) => (
        <section key={group} className="status-group">
          <h3>{group}</h3>
          {statuses.map((status) => (
            <div
              key={`${status.group}-${status.label}`}
              className={`status-row ${getApiStatusClass(status)}`}
            >
              {getApiStatusIcon(status)}
              <span>{status.label} </span>
              <strong>{getApiStatusText(status)}</strong>
            </div>
          ))}
        </section>
      ))}
    </section>
  );
}

function ApiWarningIcon({ message, placement = "row" }: { message: string; placement?: "head" | "row" }) {
  return (
    <span className={`api-warning-icon ${placement}`} tabIndex={0} aria-label={message}>
      <AlertCircle className="warn" />
      <span className="api-warning-tooltip" role="tooltip">
        {message}
      </span>
    </span>
  );
}

function getApiStatusClass(status: ApiStatusResult): string {
  if (status.state === "not_configured") {
    return "missing";
  }

  return status.ok ? "online" : "issue";
}

function getApiStatusIcon(status: ApiStatusResult): ReactNode {
  if (status.state === "not_configured") {
    return <X className="bad" />;
  }

  return status.ok ? <CheckCircle2 className="ok" /> : <ApiWarningIcon message={getApiStatusIssueMessage(status)} />;
}

function getApiStatusText(status: ApiStatusResult): string {
  if (status.state === "not_configured") {
    return "Not provided";
  }

  const label = status.ok ? "Operational" : status.status === 401 ? "Invalid key" : "Issue";
  return status.latencyMs ? `${label} ${status.latencyMs}ms` : label;
}

function getApiStatusWarningSummary(statuses: ApiStatusResult[]): string {
  if (statuses.length === 0) {
    return "No endpoint issues detected.";
  }

  return statuses.map((status) => `${status.label}: ${getApiStatusIssueMessage(status)}`).join("\n");
}

function getApiStatusIssueMessage(status: ApiStatusResult): string {
  if (status.error) {
    return `Request failed: ${status.error}`;
  }

  if (status.status === 401) {
    return "The request was rejected as unauthorized. Check that the saved GW2 API key is valid and has the needed permissions.";
  }

  if (status.status === 403) {
    return "The GW2 API refused this request. The endpoint may require different permissions or the request may be blocked.";
  }

  if (status.status === 404) {
    return "The endpoint or sample item used for this check was not found.";
  }

  if (status.status === 429) {
    return "The GW2 API rate limit was reached. Wait a little before checking or scanning again.";
  }

  if (typeof status.status === "number" && status.status >= 500) {
    return `The GW2 API returned HTTP ${status.status}, which usually means the service is having trouble.`;
  }

  if (typeof status.status === "number") {
    return `The endpoint returned HTTP ${status.status} instead of a successful response.`;
  }

  return "The endpoint did not return a successful response.";
}

function AccountDashboard({
  accountSnapshot,
  accountItems,
  analysis,
  analysisState,
  apiStatuses,
  apiStatusState,
  catalog,
  dataImports,
  onAnalyze,
  onOpenActivity,
  onOpenItemSearch,
  onLoadMarket,
  onRefreshApiStatuses,
}: {
  accountSnapshot: AccountSnapshot | null;
  accountItems: Map<number, Gw2Item>;
  analysis: AccountAnalysis | null;
  analysisState: LoadState;
  apiStatuses: ApiStatusResult[];
  apiStatusState: LoadState;
  catalog: MarketItem[];
  dataImports: DataImportRow[];
  onAnalyze: () => void;
  onOpenActivity: (suggestion: GoldSuggestion) => void;
  onOpenItemSearch: (itemName: string) => void;
  onLoadMarket: () => void;
  onRefreshApiStatuses: () => void;
}) {
  const holdingRows = useMemo(() => {
    if (!accountSnapshot) {
      return [];
    }

    return Array.from(accountSnapshot.holdings.entries())
      .map(([id, count]) => {
        const item = accountItems.get(id) ?? getStoredItem(id);
        const price = getStoredPrice(id);
        const value = (price?.buys.unit_price ?? 0) * count;

        return {
          id,
          count,
          item,
          value,
        };
      })
      .sort((left, right) => right.value - left.value || right.count - left.count)
      .slice(0, 12);
  }, [accountItems, accountSnapshot]);

  const totalItemValue = holdingRows.reduce((sum, row) => sum + row.value, 0);
  const totalStacks = accountSnapshot
    ? Array.from(accountSnapshot.holdings.values()).reduce((sum, count) => sum + count, 0)
    : 0;
  const suggestions = buildGoldSuggestions(analysis);

  return (
    <div className="account-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">First page</span>
          <h2>Your GW2 Account</h2>
          <p>
            {accountSnapshot
              ? `${accountSnapshot.tokenInfo.name} is loaded locally.`
              : "Generalized market and farming view until a GW2 API key is saved."}
          </p>
        </div>
        <div className="account-header-side">
          <ApiStatusPanel
            apiStatusState={apiStatusState}
            apiStatuses={apiStatuses}
            onRefreshApiStatuses={onRefreshApiStatuses}
          />
          <div className="page-actions">
            <button className="icon-button" onClick={onLoadMarket}>
              <RefreshCcw />
              <span>{catalog.length ? "Refresh Market" : "Load Market"}</span>
            </button>
            <button className="icon-button primary" onClick={onAnalyze}>
              {analysisState === "loading" ? <Loader2 className="spin" /> : <ShieldCheck />}
              <span>{accountSnapshot ? "Refresh Account" : "Analyze API"}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="account-metrics">
        <Metric
          icon={<Coins />}
          label="Wallet"
          value={accountSnapshot ? <Money value={accountSnapshot.coins} /> : "General"}
        />
        <Metric
          icon={<Boxes />}
          label="Tracked Items"
          value={accountSnapshot ? totalStacks.toLocaleString() : `${catalog.length.toLocaleString()} market`}
        />
        <Metric
          icon={<TrendingUp />}
          label="Known Item Value"
          value={accountSnapshot ? <Money value={totalItemValue} /> : "Load account"}
        />
        <Metric
          icon={<Hammer />}
          label="Craft Routes"
          value={analysis ? analysis.opportunities.length.toLocaleString() : "General"}
          tone={analysis ? "positive" : "muted"}
        />
      </section>

      <DataImportsPanel imports={dataImports} />

      <section className="dashboard-grid">
        <div className="surface suggestions-panel">
          <div className="section-title">
            <TrendingUp />
            <h3>Gold Options</h3>
          </div>
          {analysisState === "loading" ? (
            <SkeletonRows />
          ) : (
            <div className="earning-list">
              {suggestions.slice(0, 20).map((suggestion, index) => (
                <button
                  key={`${suggestion.title}-${index}`}
                  className="earning-row"
                  onClick={() => onOpenActivity(suggestion)}
                >
                  <span className={`speed-badge speed-${suggestion.speed.toLowerCase()}`}>
                    {suggestion.speed}
                  </span>
                  <div>
                    <strong>{suggestion.title}</strong>
                    <span>{suggestion.detail}</span>
                  </div>
                  <strong>
                    {suggestion.valueCoin !== undefined ? (
                      <>
                        <Money value={suggestion.valueCoin} /> profit
                      </>
                    ) : (
                      suggestion.value
                    )}
                  </strong>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface holdings-panel">
          <div className="section-title">
            <Boxes />
            <h3>Items</h3>
          </div>
          {accountSnapshot ? (
            <div className="holding-list">
              {holdingRows.map((row) => (
                <button
                  key={row.id}
                  className="holding-row"
                  onClick={() => onOpenItemSearch(row.item?.name ?? `Item ${row.id}`)}
                >
                  <ItemIcon item={row.item ?? { name: "Item" }} />
                  <div>
                    <strong>{row.item?.name ?? `Item ${row.id}`}</strong>
                    <span>{row.count.toLocaleString()} owned</span>
                  </div>
                  <strong>{row.value ? <Money value={row.value} /> : "-"}</strong>
                </button>
              ))}
            </div>
          ) : (
            <div className="general-card-list">
              {REPEATABLE_EARNING_OPTIONS.slice(0, 6).map((option) => (
                <button
                  key={option.title}
                  className="general-card"
                  onClick={() => onOpenActivity(option)}
                >
                  <strong>{option.title}</strong>
                  <span>{option.speed}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface OwnedItemRow {
  id: number;
  count: number;
  item?: Gw2Item;
  value: number;
  materialCount: number;
  bankCount: number;
  sharedCount: number;
  characterCount: number;
  isCraftingItem: boolean;
}

function AccountItemsPage({
  accountSnapshot,
  accountItems,
  analysisState,
  onAnalyze,
  onOpenItem,
}: {
  accountSnapshot: AccountSnapshot | null;
  accountItems: Map<number, Gw2Item>;
  analysisState: LoadState;
  onAnalyze: () => void;
  onOpenItem: (item: Gw2Item) => void;
}) {
  const [search, setSearch] = useState("");
  const rows = useMemo(
    () => (accountSnapshot ? buildOwnedItemRows(accountSnapshot, accountItems) : []),
    [accountItems, accountSnapshot],
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) => {
      const item = row.item;
      return (
        String(row.id).includes(normalizedSearch) ||
        item?.name.toLowerCase().includes(normalizedSearch) ||
        item?.type.toLowerCase().includes(normalizedSearch) ||
        item?.rarity.toLowerCase().includes(normalizedSearch) ||
        describeOwnedItemSources(row).toLowerCase().includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, rows]);
  const craftingRows = filteredRows.filter((row) => row.isCraftingItem);
  const normalRows = filteredRows.filter((row) => !row.isCraftingItem);
  const totalOwnedCount = rows.reduce((sum, row) => sum + row.count, 0);
  const totalKnownValue = rows.reduce((sum, row) => sum + row.value, 0);

  if (!accountSnapshot) {
    return (
      <div className="focused-page">
        <section className="page-header">
          <div>
            <span className="eyebrow">My GW2 Account</span>
            <h2>Account Items</h2>
            <p>Load a GW2 API key to list material storage, bank, shared inventory, and character inventory items.</p>
          </div>
          <button className="icon-button primary" onClick={onAnalyze}>
            {analysisState === "loading" ? <Loader2 className="spin" /> : <ShieldCheck />}
            <span>{analysisState === "loading" ? "Loading" : "Analyze API"}</span>
          </button>
        </section>
        <section className="surface account-required-panel">
          <Boxes />
          <h2>Account data required</h2>
          <p>This page needs the account API key so the app can read owned items locally.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="focused-page account-items-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">My GW2 Account</span>
          <h2>Account Items</h2>
          <p>
            Every loaded item stack for {accountSnapshot.tokenInfo.name}, with crafting materials shown before normal items.
          </p>
        </div>
        <button className="icon-button primary" onClick={onAnalyze}>
          {analysisState === "loading" ? <Loader2 className="spin" /> : <RefreshCcw />}
          <span>{analysisState === "loading" ? "Refreshing" : "Refresh Account"}</span>
        </button>
      </section>

      <section className="account-metrics">
        <Metric icon={<Boxes />} label="Unique Items" value={rows.length.toLocaleString()} />
        <Metric icon={<Database />} label="Total Stack Count" value={totalOwnedCount.toLocaleString()} />
        <Metric icon={<Hammer />} label="Crafting Items" value={craftingRows.length.toLocaleString()} />
        <Metric
          icon={<Coins />}
          label="Known TP Value"
          value={totalKnownValue ? <Money value={totalKnownValue} /> : "Load market"}
          tone={totalKnownValue ? "positive" : "muted"}
        />
      </section>

      <section className="surface account-items-browser">
        <div className="section-title">
          <PackageSearch />
          <h3>Owned Items</h3>
        </div>
        <label className="search-box">
          <Search />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search owned item, type, rarity, source"
          />
        </label>

        <OwnedItemTable
          title="Crafting Items"
          rows={craftingRows}
          emptyText="No owned crafting items match the current search."
          onOpenItem={onOpenItem}
        />
        <OwnedItemTable
          title="Normal Items"
          rows={normalRows}
          emptyText="No owned normal items match the current search."
          onOpenItem={onOpenItem}
        />
      </section>
    </div>
  );
}

function OwnedItemTable({
  title,
  rows,
  emptyText,
  onOpenItem,
}: {
  title: string;
  rows: OwnedItemRow[];
  emptyText: string;
  onOpenItem: (item: Gw2Item) => void;
}) {
  return (
    <div className="owned-item-section">
      <div className="owned-item-section-head">
        <h4>{title}</h4>
        <span>{rows.length.toLocaleString()}</span>
      </div>
      {rows.length > 0 ? (
        <div className="craft-table-wrap">
          <table className="craft-profit-table account-item-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Count</th>
                <th>Source</th>
                <th>Known Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${title}-${row.id}`}
                  className={row.item ? "clickable-row" : ""}
                  onClick={() => {
                    if (row.item) {
                      onOpenItem(row.item);
                    }
                  }}
                >
                  <td>
                    <span className="table-item-cell">
                      <ItemIcon item={row.item ?? { name: "Item" }} />
                      <span className="item-copy">
                        <strong>{row.item?.name ?? `Item ${row.id}`}</strong>
                        <span>
                          {row.item
                            ? `${row.item.rarity} ${formatItemTypeLabel(row.item.type)}`
                            : "Loading item details"}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td>{row.count.toLocaleString()}</td>
                  <td>{describeOwnedItemSources(row)}</td>
                  <td>{row.value ? <Money value={row.value} /> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted-copy">{emptyText}</p>
      )}
    </div>
  );
}

function buildOwnedItemRows(
  accountSnapshot: AccountSnapshot,
  accountItems: Map<number, Gw2Item>,
): OwnedItemRow[] {
  const materialCounts = countOwnedStacks(accountSnapshot.materials);
  const bankCounts = countOwnedStacks(accountSnapshot.bank);
  const sharedCounts = countOwnedStacks(accountSnapshot.inventory);
  const characterCounts = countCharacterInventoryStacks(accountSnapshot.characters);

  return Array.from(accountSnapshot.holdings.entries())
    .map(([id, count]) => {
      const item = accountItems.get(id) ?? getStoredItem(id);
      const price = getStoredPrice(id);
      const value = price?.buys.unit_price ? Math.floor(price.buys.unit_price * count * 0.85) : 0;
      const materialCount = materialCounts.get(id) ?? 0;

      return {
        id,
        count,
        item,
        value,
        materialCount,
        bankCount: bankCounts.get(id) ?? 0,
        sharedCount: sharedCounts.get(id) ?? 0,
        characterCount: characterCounts.get(id) ?? 0,
        isCraftingItem: materialCount > 0 || item?.type === "CraftingMaterial",
      };
    })
    .sort((left, right) => {
      if (left.isCraftingItem !== right.isCraftingItem) {
        return left.isCraftingItem ? -1 : 1;
      }

      if (right.value !== left.value) {
        return right.value - left.value;
      }

      const leftName = left.item?.name ?? `Item ${left.id}`;
      const rightName = right.item?.name ?? `Item ${right.id}`;
      return leftName.localeCompare(rightName);
    });
}

function countOwnedStacks(stacks: Array<AccountItemStack | AccountMaterial | null | undefined>): Map<number, number> {
  const counts = new Map<number, number>();

  for (const stack of stacks) {
    if (!stack?.id || !stack.count) {
      continue;
    }

    counts.set(stack.id, (counts.get(stack.id) ?? 0) + stack.count);
  }

  return counts;
}

function countCharacterInventoryStacks(characters: AccountCharacter[]): Map<number, number> {
  return countOwnedStacks(
    characters.flatMap((character) =>
      character.bags?.flatMap((bag) => bag?.inventory ?? []) ?? [],
    ),
  );
}

function describeOwnedItemSources(row: OwnedItemRow): string {
  const sources = [
    row.materialCount > 0 ? `Materials ${row.materialCount.toLocaleString()}` : null,
    row.bankCount > 0 ? `Bank ${row.bankCount.toLocaleString()}` : null,
    row.sharedCount > 0 ? `Shared ${row.sharedCount.toLocaleString()}` : null,
    row.characterCount > 0 ? `Characters ${row.characterCount.toLocaleString()}` : null,
  ].filter((source): source is string => Boolean(source));

  return sources.length > 0 ? sources.join(" / ") : "Loaded account storage";
}

function formatItemTypeLabel(type: string): string {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function useRelativeNow(tickMs = 10_000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const update = () => setNow(Date.now());
    const intervalId = window.setInterval(update, tickMs);

    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [tickMs]);

  return now;
}

function getDelayToNextMarketHour(now = Date.now()): number {
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return Math.max(MARKET_AUTO_SCAN_MIN_DELAY_MS, nextHour.getTime() - now);
}

function getMarketScanCooldownRemaining(updatedAt: number | null, now = Date.now()): number {
  if (!updatedAt) {
    return 0;
  }

  return Math.max(0, MARKET_SCAN_COOLDOWN_MS - (now - updatedAt));
}

function formatMarketScanCooldown(ms: number): string {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function WizardVaultPage({
  apiKey,
  apiKeyRemembered,
  onOpenItem,
  onProgress,
}: {
  apiKey: string;
  apiKeyRemembered: boolean;
  onOpenItem: (item: Gw2Item) => void;
  onProgress: (message: string, done?: number, total?: number) => void;
}) {
  const now = useRelativeNow();
  const [vault, setVault] = useState<WizardVaultSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<WizardVaultSectionFilter>("daily");
  const [trackFilter, setTrackFilter] = useState<WizardVaultTrackFilter>("all");
  const [selectedObjective, setSelectedObjective] = useState<WizardVaultObjectiveProgress | null>(null);
  const [objectiveGuide, setObjectiveGuide] = useState<WizardVaultObjectiveGuide | null>(null);
  const [objectiveGuideState, setObjectiveGuideState] = useState<LoadState>("idle");
  const [objectiveGuideError, setObjectiveGuideError] = useState<string | null>(null);
  const key = apiKey.trim();

  async function refreshVault() {
    setLoadState("loading");
    setError(null);

    try {
      const snapshot = await loadWizardVault(key, onProgress);
      setVault(snapshot);
      setLoadedKey(key);
      setLoadState("ready");
    } catch (vaultError) {
      setLoadState("error");
      setError(vaultError instanceof Error ? vaultError.message : "Unable to load Wizard's Vault");
    }
  }

  useEffect(() => {
    if (loadState !== "loading" && loadedKey !== key) {
      void refreshVault();
    }
  }, [key, loadState, loadedKey]);

  const daily = vault?.sections.find((section) => section.id === "daily");
  const weekly = vault?.sections.find((section) => section.id === "weekly");
  const special = vault?.sections.find((section) => section.id === "special");
  const bestListing = vault?.listings.find((listing) => listing.value > 0);
  const hasPublicMode = !vault?.hasAccountProgress;
  const activeSection = vault?.sections.find((section) => section.id === sectionFilter);
  const filteredObjectives = useMemo(() => {
    const objectives = activeSection?.objectives ?? [];
    return objectives.filter((objective) => {
      if (trackFilter === "all") {
        return true;
      }

      return normalizeVaultTrackFilter(objective.track) === trackFilter;
    });
  }, [activeSection, trackFilter]);

  useEffect(() => {
    if (!vault) {
      setSelectedObjective(null);
      return;
    }

    if (selectedObjective && filteredObjectives.some((objective) => objective.id === selectedObjective.id)) {
      return;
    }

    setSelectedObjective(filteredObjectives[0] ?? null);
  }, [filteredObjectives, selectedObjective, vault]);

  useEffect(() => {
    if (!selectedObjective) {
      setObjectiveGuide(null);
      setObjectiveGuideState("idle");
      setObjectiveGuideError(null);
      return;
    }

    let ignore = false;
    setObjectiveGuideState("loading");
    setObjectiveGuideError(null);

    loadWizardVaultObjectiveGuide(selectedObjective.title, selectedObjective.track)
      .then((guide) => {
        if (ignore) {
          return;
        }

        setObjectiveGuide(guide);
        setObjectiveGuideState("ready");
      })
      .catch((guideError) => {
        if (ignore) {
          return;
        }

        setObjectiveGuide(null);
        setObjectiveGuideState("error");
        setObjectiveGuideError(
          guideError instanceof Error ? guideError.message : "Unable to load objective guide",
        );
      });

    return () => {
      ignore = true;
    };
  }, [selectedObjective]);

  return (
    <div className="focused-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">Astral Acclaim</span>
          <h2>Wizard&apos;s Vault</h2>
          <p>
            {key
              ? "Current account objectives, progress, purchase limits, and the most valuable store rewards by Trading Post value."
              : "Public Wizard's Vault store rewards and objective catalog. Add a GW2 API key for progress and purchase limits."}
          </p>
        </div>
        <button className="icon-button primary" onClick={() => void refreshVault()} disabled={loadState === "loading"}>
          {loadState === "loading" ? <Loader2 className="spin" /> : <RefreshCcw />}
          <span>{loadState === "loading" ? "Loading" : "Refresh"}</span>
        </button>
      </section>

      {error ? (
        <section className="surface account-warning">
          <AlertCircle />
          <span>{error}</span>
        </section>
      ) : null}

      {!key ? (
        <section className="surface account-warning">
          <KeyRound />
          <span>
            Public mode is loaded without a GW2 API key. Objective progress, claimed status, and purchased store limits require an account key.
            {apiKeyRemembered ? " A saved key is still loading." : ""}
          </span>
        </section>
      ) : null}

      {vault && hasPublicMode && !vault.publicObjectiveRotationAvailable ? (
        <section className="surface account-warning">
          <AlertCircle />
          <span>
            The public API exposes the store and objective definitions, but not account progress. Current daily/weekly/special progress appears after adding a key.
          </span>
        </section>
      ) : null}

      <section className="stat-grid">
        <Metric icon={<ListChecks />} label="Daily" value={formatVaultSectionProgress(daily)} />
        <Metric icon={<Trophy />} label="Weekly" value={formatVaultSectionProgress(weekly)} />
        <Metric icon={<ShieldCheck />} label="Special" value={formatVaultSectionProgress(special)} />
        <Metric
          icon={<Coins />}
          label="Best Store Value"
          value={bestListing ? <Money value={bestListing.value} /> : loadState === "loading" ? "Loading" : "No value"}
          tone={bestListing ? "positive" : "muted"}
        />
      </section>

      {loadState === "loading" && !vault ? <SkeletonRows /> : null}

      {vault ? (
        <>
          {vault.sections.length > 0 ? (
            <section className="surface vault-filter-panel">
              <div className="section-title">
                <ListChecks />
                <h3>Objectives</h3>
              </div>
              <div className="vault-filter-grid">
                <div>
                  <span className="filter-label">Schedule</span>
                  <div className="segment-row compact-segments">
                    {vault.sections.map((section) => (
                      <button
                        key={section.id}
                        className={sectionFilter === section.id ? "active" : ""}
                        onClick={() => setSectionFilter(section.id)}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="filter-label">Mode</span>
                  <div className="segment-row compact-segments">
                    {(["all", "PvE", "PvP", "WvW"] as WizardVaultTrackFilter[]).map((track) => (
                      <button
                        key={track}
                        className={trackFilter === track ? "active" : ""}
                        onClick={() => setTrackFilter(track)}
                      >
                        {track === "all" ? "All" : track}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {activeSection ? (
                <div className="vault-meta-row">
                  <span>
                    {activeSection.objectives.filter((objective) => objective.completed).length.toLocaleString()} /{" "}
                    {activeSection.objectives.length.toLocaleString()} complete
                  </span>
                  {activeSection.metaComplete ? (
                    <span>
                      Meta {activeSection.metaCurrent ?? 0} / {activeSection.metaComplete}
                      {activeSection.metaClaimed ? " claimed" : ""}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="vault-browser">
                <div className="vault-objective-list vault-objective-browser">
                  {filteredObjectives.length > 0 ? (
                    filteredObjectives.map((objective) => (
                      <button
                        key={objective.id}
                        className={`vault-objective vault-objective-button ${objective.completed ? "done" : ""} ${
                          selectedObjective?.id === objective.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedObjective(objective)}
                      >
                        {objective.completed ? <CheckCircle2 /> : <AlertCircle />}
                        <div>
                          <strong>{objective.title}</strong>
                          <span>{objective.track} · {objective.acclaim.toLocaleString()} Astral Acclaim</span>
                          {objective.complete ? (
                            <small>{objective.current ?? 0} / {objective.complete}</small>
                          ) : null}
                        </div>
                        {objective.claimed ? <span className="import-state">Claimed</span> : null}
                      </button>
                    ))
                  ) : (
                    <p className="muted-copy">No {trackFilter === "all" ? "" : trackFilter} objectives found for this schedule.</p>
                  )}
                </div>

                <WizardVaultObjectiveGuidePanel
                  objective={selectedObjective}
                  guide={objectiveGuide}
                  state={objectiveGuideState}
                  error={objectiveGuideError}
                />
              </div>
            </section>
          ) : null}

          {vault.objectiveCatalog.length > 0 ? (
            <WizardVaultObjectiveCatalog
              objectives={vault.objectiveCatalog}
              hasAccountProgress={vault.hasAccountProgress}
            />
          ) : null}

          <section className="surface craft-profit-surface">
            <div className="section-title">
              <Coins />
              <h3>Vault Store Value</h3>
            </div>
            <p className="market-list-note">
              Ranked by after-fee Trading Post value per Astral Acclaim. Purchase counts and limits are imported when an account
              key exposes them, though the official endpoint can report stale or zero purchased counts.
              Updated {formatAge(vault.updatedAt, now)}.
            </p>
            {vault.purchaseCountWarning ? (
              <div className="account-warning compact-warning">
                <AlertCircle />
                <span>{vault.purchaseCountWarning}</span>
              </div>
            ) : null}
            <div className="craft-table-wrap">
              <table className="craft-profit-table vault-store-table">
                <thead>
                  <tr>
                    <th>Reward</th>
                    <th>Type</th>
                    <th>Cost</th>
                    <th>Sell Value</th>
                    <th>Value / Acclaim</th>
                    <th>Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.listings.slice(0, 80).map((entry) => (
                    <tr
                      key={entry.listing.id}
                      className={entry.item ? "clickable-row" : ""}
                      onClick={() => {
                        if (entry.item) {
                          onOpenItem(entry.item);
                        }
                      }}
                    >
                      <td>
                        <span className="table-item-cell">
                          <ItemIcon item={entry.item ?? { name: "Reward" }} />
                          <span className="item-copy">
                            <strong>{entry.item?.name ?? `Item ${entry.listing.item_id}`}</strong>
                            <span>{entry.listing.item_count.toLocaleString()} per purchase</span>
                          </span>
                        </span>
                      </td>
                      <td>{entry.listing.type}</td>
                      <td><span className="acclaim-cost">{entry.listing.cost.toLocaleString()} AA</span></td>
                      <td>{entry.value ? <Money value={entry.value} /> : "No TP value"}</td>
                      <td>{entry.valuePerAcclaim ? <Money value={entry.valuePerAcclaim} /> : "-"}</td>
                      <td>{formatVaultPurchaseLimit(entry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : loadState !== "loading" ? (
        <section className="surface account-required-panel">
          <Coins />
          <h2>Ready to load the vault</h2>
          <p>Refresh to load current Wizard&apos;s Vault objectives and store reward values.</p>
        </section>
      ) : null}
    </div>
  );
}

function WizardVaultObjectiveCatalog({
  objectives,
  hasAccountProgress,
}: {
  objectives: WizardVaultObjectiveDefinition[];
  hasAccountProgress: boolean;
}) {
  const [selectedObjective, setSelectedObjective] = useState<WizardVaultObjectiveProgress | null>(null);
  const [guide, setGuide] = useState<WizardVaultObjectiveGuide | null>(null);
  const [guideState, setGuideState] = useState<LoadState>("idle");
  const [guideError, setGuideError] = useState<string | null>(null);
  const trackGroups = useMemo(() => {
    const grouped: Record<Exclude<WizardVaultTrackFilter, "all">, WizardVaultObjectiveDefinition[]> = {
      PvE: [],
      PvP: [],
      WvW: [],
    };

    for (const objective of objectives) {
      const track = normalizeVaultTrackFilter(objective.track);
      if (track !== "other") {
        grouped[track].push(objective);
      }
    }

    return (["PvE", "PvP", "WvW"] as const).map((track) => ({
      track,
      objectives: grouped[track].sort(
        (left, right) => right.acclaim - left.acclaim || left.title.localeCompare(right.title),
      ),
    }));
  }, [objectives]);

  useEffect(() => {
    if (!selectedObjective) {
      setGuide(null);
      setGuideState("idle");
      setGuideError(null);
      return;
    }

    let ignore = false;
    setGuide(null);
    setGuideState("loading");
    setGuideError(null);

    loadWizardVaultObjectiveGuide(selectedObjective.title, selectedObjective.track)
      .then((nextGuide) => {
        if (ignore) {
          return;
        }

        setGuide(nextGuide);
        setGuideState("ready");
      })
      .catch((nextError) => {
        if (ignore) {
          return;
        }

        setGuide(null);
        setGuideState("error");
        setGuideError(nextError instanceof Error ? nextError.message : "Unable to load objective guide");
      });

    return () => {
      ignore = true;
    };
  }, [selectedObjective]);

  useEffect(() => {
    if (!selectedObjective) {
      return undefined;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedObjective(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedObjective]);

  return (
    <section className="surface craft-profit-surface">
      <div className="section-title">
        <ListChecks />
        <h3>Objective Catalog</h3>
      </div>
      <p className="market-list-note">
        Public objective definitions from the GW2 API. {hasAccountProgress ? "Your active objectives are shown above." : "Add a key to see which ones are active for your account and how far along they are."}
      </p>

      <div className="vault-catalog-groups">
        {trackGroups.map((group) => (
          <details key={group.track} className="vault-catalog-group">
            <summary>
              <span>
                <ChevronDown />
                <strong>{group.track}</strong>
              </span>
              <span>{group.objectives.length.toLocaleString()} objectives</span>
            </summary>
            <div className="vault-catalog-list">
              {group.objectives.length > 0 ? (
                group.objectives.map((objective) => (
                  <button
                    key={objective.id}
                    className="vault-catalog-row"
                    onClick={() => setSelectedObjective(toVaultCatalogProgressObjective(objective))}
                  >
                    <span>
                      <strong>{objective.title}</strong>
                      <small>{objective.track}</small>
                    </span>
                    <span className="acclaim-cost">{objective.acclaim.toLocaleString()} AA</span>
                  </button>
                ))
              ) : (
                <p className="muted-copy">No {group.track} objective definitions found.</p>
              )}
            </div>
          </details>
        ))}
      </div>

      {selectedObjective ? (
        <div
          className="vault-guide-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedObjective(null);
            }
          }}
        >
          <div className="vault-guide-modal" role="dialog" aria-modal="true" aria-label={`${selectedObjective.title} guide`}>
            <button
              className="detail-close-button"
              onClick={() => setSelectedObjective(null)}
              aria-label="Close objective guide"
              title="Close objective guide"
            >
              <X />
            </button>
            <WizardVaultObjectiveGuidePanel
              objective={selectedObjective}
              guide={guide}
              state={guideState}
              error={guideError}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function toVaultCatalogProgressObjective(objective: WizardVaultObjectiveDefinition): WizardVaultObjectiveProgress {
  return {
    id: objective.id,
    title: objective.title,
    track: objective.track,
    acclaim: objective.acclaim,
    completed: false,
    claimed: false,
    current: null,
    complete: null,
  };
}

function WizardVaultObjectiveGuidePanel({
  objective,
  guide,
  state,
  error,
}: {
  objective: WizardVaultObjectiveProgress | null;
  guide: WizardVaultObjectiveGuide | null;
  state: LoadState;
  error: string | null;
}) {
  if (!objective) {
    return (
      <aside className="vault-guide-card">
        <BookOpen />
        <h3>Select an objective</h3>
        <p className="muted-copy">Choose an objective to load a quick route and matching wiki links.</p>
      </aside>
    );
  }

  return (
    <aside className="vault-guide-card">
      <div className="section-title">
        <BookOpen />
        <h3>Quick Guide</h3>
      </div>
      <div className="vault-guide-head">
        <strong>{objective.title}</strong>
        <span>
          {objective.track} · {objective.acclaim.toLocaleString()} Astral Acclaim
          {objective.complete ? ` · ${objective.current ?? 0}/${objective.complete}` : ""}
        </span>
      </div>

      {state === "loading" ? <SkeletonRows /> : null}
      {error ? (
        <div className="account-warning compact-warning">
          <AlertCircle />
          <span>{error}</span>
        </div>
      ) : null}

      {guide && state !== "loading" ? (
        <>
          <p className="muted-copy">{guide.summary}</p>
          <ol className="vault-guide-steps">
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          {guide.chatLinks.length > 0 ? (
            <div className="vault-chat-links">
              <strong>GW2 chat links</strong>
              <div>
                {guide.chatLinks.map((chatLink) => (
                  <code key={chatLink}>{chatLink}</code>
                ))}
              </div>
            </div>
          ) : null}

          <div className="vault-wiki-links">
            <strong>Wiki links</strong>
            {guide.wikiLinks.length > 0 ? (
              guide.wikiLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  <span>{link.title}</span>
                  <ExternalLink />
                </a>
              ))
            ) : (
              <span className="muted-copy">No matching wiki pages found for the current objective title.</span>
            )}
          </div>
        </>
      ) : null}
    </aside>
  );
}

function normalizeVaultTrackFilter(track: string): Exclude<WizardVaultTrackFilter, "all"> | "other" {
  if (/wvw|world versus world/i.test(track)) {
    return "WvW";
  }

  if (/pvp|structured pvp/i.test(track)) {
    return "PvP";
  }

  if (/pve|player versus environment/i.test(track)) {
    return "PvE";
  }

  return "other";
}

function WizardVaultObjectivePanel({ section }: { section: WizardVaultObjectiveSection }) {
  const completedCount = section.objectives.filter((objective) => objective.completed).length;

  return (
    <section className="surface vault-objective-panel">
      <div className="section-title">
        <ListChecks />
        <h3>{section.label}</h3>
      </div>
      <div className="vault-meta-row">
        <span>{completedCount.toLocaleString()} / {section.objectives.length.toLocaleString()} complete</span>
        {section.metaComplete ? (
          <span>
            Meta {section.metaCurrent ?? 0} / {section.metaComplete}
            {section.metaClaimed ? " claimed" : ""}
          </span>
        ) : null}
      </div>
      <div className="vault-objective-list">
        {section.objectives.map((objective) => (
          <article key={objective.id} className={`vault-objective ${objective.completed ? "done" : ""}`}>
            {objective.completed ? <CheckCircle2 /> : <AlertCircle />}
            <div>
              <strong>{objective.title}</strong>
              <span>{objective.track} · {objective.acclaim.toLocaleString()} Astral Acclaim</span>
              {objective.complete ? (
                <small>{objective.current ?? 0} / {objective.complete}</small>
              ) : null}
            </div>
            {objective.claimed ? <span className="import-state">Claimed</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function formatVaultSectionProgress(section: WizardVaultObjectiveSection | undefined): string {
  if (!section) {
    return "Not loaded";
  }

  const completed = section.objectives.filter((objective) => objective.completed).length;
  return `${completed}/${section.objectives.length}`;
}

function formatVaultPurchaseLimit(entry: WizardVaultListingValue): ReactNode {
  const { purchased, purchaseLimit: limit } = entry;
  if (purchased === null && limit === null) {
    return "-";
  }

  const value = limit === null ? `${purchased ?? 0}` : `${purchased ?? 0}/${limit}`;
  if (entry.purchaseSource === "remembered") {
    return (
      <span
        className="vault-purchase remembered"
        title="Remembered from a previous non-zero GW2 API response for this account and Vault listing."
      >
        Remembered {value}
      </span>
    );
  }

  if (!entry.purchaseReliable) {
    return (
      <span
        className="vault-purchase uncertain"
        title="The GW2 API reported this count, but the endpoint is currently known to sometimes return 0 for every purchased value."
      >
        API {value}
      </span>
    );
  }

  if (limit === null) {
    return value;
  }

  return value;
}

function DataImportsPanel({ imports }: { imports: DataImportRow[] }) {
  const now = useRelativeNow();
  const latestUpdatedAt = imports.reduce<number | null>((latest, row) => {
    if (!row.updatedAt) {
      return latest;
    }

    return latest === null ? row.updatedAt : Math.max(latest, row.updatedAt);
  }, null);

  return (
    <section className="surface data-import-panel">
      <div className="section-title">
        <Database />
        <h3>Data Imports</h3>
      </div>
      <div className="data-import-list">
        {imports.map((row) => (
          <div key={row.id} className={`data-import-row state-${row.state}`}>
            {getImportStateIcon(row.state)}
            <div>
              <strong>{row.label}</strong>
              <span>{row.detail}</span>
            </div>
            <span className="import-state">{getImportStateLabel(row.state)}</span>
            <time>{row.updatedAt ? `Updated ${formatAge(row.updatedAt, now)}` : "Never loaded"}</time>
          </div>
        ))}
      </div>
      <p className="import-latest">
        Latest information age: {latestUpdatedAt ? formatAge(latestUpdatedAt, now) : "not loaded yet"}
      </p>
    </section>
  );
}

function getImportStateIcon(state: ImportState): ReactNode {
  if (state === "ready") {
    return <CheckCircle2 className="ok" />;
  }

  if (state === "loading") {
    return <Loader2 className="spin" />;
  }

  if (state === "missing") {
    return <X className="bad" />;
  }

  if (state === "error") {
    return <AlertCircle className="warn" />;
  }

  return <Database />;
}

function getImportStateLabel(state: ImportState): string {
  switch (state) {
    case "ready":
      return "Up to date";
    case "loading":
      return "Loading";
    case "error":
      return "Issue";
    case "missing":
      return "Not provided";
    default:
      return "Not loaded";
  }
}

function formatAge(timestamp: number, now = Date.now()): string {
  const elapsedMs = Math.max(0, now - timestamp);
  const seconds = Math.floor(elapsedMs / 1000);

  if (seconds < 5) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AchievementsPage({
  accountSnapshot,
  analysisState,
  onAnalyze,
  onImportStateChange,
  onProgress,
}: {
  accountSnapshot: AccountSnapshot | null;
  analysisState: LoadState;
  onAnalyze: () => void;
  onImportStateChange: (state: LoadState, updatedAt?: number | null) => void;
  onProgress: (message: string, done?: number, total?: number) => void;
}) {
  const [catalog, setCatalog] = useState<AchievementCatalog | null>(null);
  const [catalogState, setCatalogState] = useState<LoadState>("idle");
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AchievementFilter>("unfinished");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [guideWiki, setGuideWiki] = useState<WikiGuide | null>(null);
  const [guideState, setGuideState] = useState<LoadState>("idle");
  const [guideItems, setGuideItems] = useState<Map<number, Gw2Item>>(new Map());

  useEffect(() => {
    let ignore = false;
    setCatalogState("loading");
    setCatalogError(null);
    onImportStateChange("loading");

    loadAchievementCatalog(onProgress)
      .then((achievementCatalog) => {
        if (ignore) {
          return;
        }

        setCatalog(achievementCatalog);
        setCatalogState("ready");
        onImportStateChange("ready", Date.now());
        onProgress(`${achievementCatalog.achievements.length.toLocaleString()} achievements loaded`);
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setCatalogState("error");
        setCatalogError(error instanceof Error ? error.message : "Unable to load achievements");
        onImportStateChange("error");
      });

    return () => {
      ignore = true;
    };
  }, []);

  const achievementViews = useMemo(() => {
    return catalog ? buildAchievementViews(catalog, accountSnapshot) : [];
  }, [accountSnapshot, catalog]);

  const filteredViews = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return achievementViews.filter((view) => {
      if (filter === "completed" && !view.completed) {
        return false;
      }

      if (filter === "unfinished" && view.completed) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      const haystack = [
        view.achievement.name,
        view.achievement.description,
        view.achievement.requirement,
        view.category?.name,
        view.group?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [achievementViews, filter, search]);

  useEffect(() => {
    if (achievementViews.length === 0) {
      return;
    }

    const selectedStillExists = selectedId
      ? achievementViews.some((view) => view.achievement.id === selectedId)
      : false;
    if (selectedStillExists) {
      return;
    }

    const firstUnfinished = achievementViews.find((view) => !view.completed);
    setSelectedId((firstUnfinished ?? achievementViews[0]).achievement.id);
  }, [achievementViews, selectedId]);

  const selectedView = selectedId
    ? achievementViews.find((view) => view.achievement.id === selectedId) ?? null
    : null;
  const selectedAchievement = selectedView?.achievement ?? null;

  useEffect(() => {
    if (!selectedAchievement) {
      setGuideWiki(null);
      setGuideItems(new Map());
      setGuideState("idle");
      return;
    }

    let ignore = false;
    const itemIds = getAchievementItemIds(selectedAchievement);
    setGuideState("loading");
    setGuideWiki(null);
    setGuideItems(new Map());

    Promise.allSettled([
      loadWikiGuide(selectedAchievement.name),
      itemIds.length ? loadItems(itemIds) : Promise.resolve([]),
    ]).then((results) => {
      if (ignore) {
        return;
      }

      if (results[0].status === "fulfilled") {
        setGuideWiki(results[0].value);
      }

      if (results[1].status === "fulfilled") {
        setGuideItems(new Map(results[1].value.map((item) => [item.id, item])));
      }

      setGuideState("ready");
    });

    return () => {
      ignore = true;
    };
  }, [selectedAchievement]);

  const completedCount = achievementViews.filter((view) => view.completed).length;
  const unfinishedCount = Math.max(0, achievementViews.length - completedCount);
  const earnedPoints = achievementViews.reduce((sum, view) => sum + view.earnedPoints, 0);
  const hasProgressionPermission = Boolean(
    accountSnapshot?.tokenInfo.permissions.includes("progression"),
  );
  const visibleViews = filteredViews.slice(0, 360);

  return (
    <div className="achievements-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">My GW2 Account</span>
          <h2>Achievements</h2>
          <p>
            {accountSnapshot
              ? `${accountSnapshot.tokenInfo.name} progress is merged with the official achievement catalog.`
              : "Add a GW2 API key with progression permission to see completed and unfinished steps."}
          </p>
        </div>
        <div className="page-actions">
          <button className="icon-button primary" onClick={onAnalyze}>
            {analysisState === "loading" ? <Loader2 className="spin" /> : <ShieldCheck />}
            <span>{accountSnapshot ? "Refresh Progress" : "Analyze API"}</span>
          </button>
        </div>
      </section>

      <section className="account-metrics achievement-metrics">
        <Metric
          icon={<Trophy />}
          label="Completed"
          value={accountSnapshot ? completedCount.toLocaleString() : "General"}
          tone={accountSnapshot ? "positive" : "muted"}
        />
        <Metric
          icon={<ListChecks />}
          label="Unfinished"
          value={accountSnapshot ? unfinishedCount.toLocaleString() : catalogState}
        />
        <Metric
          icon={<Coins />}
          label="Tracked AP"
          value={accountSnapshot ? earnedPoints.toLocaleString() : "API needed"}
        />
        <Metric
          icon={<Database />}
          label="Catalog"
          value={catalog ? catalog.achievements.length.toLocaleString() : catalogState}
        />
      </section>

      {!accountSnapshot ? (
        <section className="surface account-warning">
          <AlertCircle />
          <span>
            Achievement completion is private account data. Save a key with progression permission
            to mark finished steps in green and collapse them by default.
          </span>
        </section>
      ) : !hasProgressionPermission && accountSnapshot.achievements.length === 0 ? (
        <section className="surface account-warning">
          <AlertCircle />
          <span>
            This key did not return achievement progress. Create a GW2 API key with progression
            permission, then refresh progress.
          </span>
        </section>
      ) : null}

      <section className="achievement-workspace">
        <aside className="surface achievement-browser">
          <div className="panel-heading tight">
            <div>
              <span className="eyebrow">Account Progress</span>
              <h3>Achievement List</h3>
            </div>
            <span className="metric">{filteredViews.length.toLocaleString()}</span>
          </div>

          <label className="search-box">
            <Search />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search achievement, category, group"
            />
          </label>

          <div className="segment-row" role="group" aria-label="Achievement filter">
            {(["unfinished", "completed", "all"] as AchievementFilter[]).map((option) => (
              <button
                key={option}
                className={filter === option ? "active" : ""}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="achievement-list">
            {catalogState === "loading" ? <SkeletonRows /> : null}
            {catalogError ? <p className="muted-copy">{catalogError}</p> : null}
            {visibleViews.map((view) => (
              <button
                key={view.achievement.id}
                className={`achievement-row ${selectedId === view.achievement.id ? "active" : ""} ${
                  view.completed ? "completed" : ""
                }`}
                onClick={() => setSelectedId(view.achievement.id)}
              >
                <AchievementIcon achievement={view.achievement} />
                <span className="achievement-row-copy">
                  <strong>{view.achievement.name}</strong>
                  <span>{view.category?.name ?? view.group?.name ?? "Achievements"}</span>
                  <span className="achievement-progress-line">
                    {accountSnapshot
                      ? `${view.current.toLocaleString()} / ${view.max.toLocaleString()}`
                      : "General guide"}
                  </span>
                </span>
                <span className="achievement-status">
                  {view.completed ? <CheckCircle2 /> : <ListChecks />}
                  {accountSnapshot ? `${Math.round(view.percent)}%` : "Guide"}
                </span>
              </button>
            ))}
            {catalogState !== "loading" && visibleViews.length === 0 ? (
              <p className="muted-copy">No achievements match this filter.</p>
            ) : null}
          </div>
        </aside>

        <AchievementGuidePanel
          catalog={catalog}
          guideItems={guideItems}
          guideState={guideState}
          hasAccount={Boolean(accountSnapshot)}
          view={selectedView}
          wikiGuide={guideWiki}
        />
      </section>
    </div>
  );
}

function AchievementGuidePanel({
  catalog,
  guideItems,
  guideState,
  hasAccount,
  view,
  wikiGuide,
}: {
  catalog: AchievementCatalog | null;
  guideItems: Map<number, Gw2Item>;
  guideState: LoadState;
  hasAccount: boolean;
  view: AchievementView | null;
  wikiGuide: WikiGuide | null;
}) {
  if (!view) {
    return (
      <section className="surface achievement-guide empty-achievement-guide">
        <Trophy />
        <h3>Select an achievement</h3>
        <p className="muted-copy">Choose an unfinished achievement to open its completion guide.</p>
      </section>
    );
  }

  const { achievement } = view;
  const steps = buildAchievementSteps(view, guideItems);
  const prerequisites =
    achievement.prerequisites
      ?.map((id) => catalog?.achievementMap.get(id)?.name ?? `Achievement ${id}`)
      .slice(0, 8) ?? [];
  const totalPoints = achievement.tiers.reduce((sum, tier) => sum + tier.points, 0);

  return (
    <section className="surface achievement-guide">
      <div className="achievement-guide-head">
        <AchievementIcon achievement={achievement} />
        <div>
          <span className="eyebrow">{view.group?.name ?? "Achievement"}</span>
          <h3>{achievement.name}</h3>
          <p>{view.category?.name ?? "General achievements"}</p>
        </div>
        <span className={`achievement-complete-pill ${view.completed ? "done" : ""}`}>
          {view.completed ? <CheckCircle2 /> : <ListChecks />}
          {hasAccount ? `${Math.round(view.percent)}%` : "General"}
        </span>
      </div>

      <div className="achievement-progress-block">
        <div className="progress-label">
          <span>{hasAccount ? "Your progress" : "Progress guide"}</span>
          <strong>
            {hasAccount
              ? `${view.current.toLocaleString()} / ${view.max.toLocaleString()}`
              : `${steps.length.toLocaleString()} steps`}
          </strong>
        </div>
        <span className="progress-track">
          <span style={{ width: `${hasAccount ? view.percent : 0}%` }} />
        </span>
      </div>

      <div className="achievement-summary-grid">
        <div>
          <strong>Requirement</strong>
          <span>{achievement.requirement || achievement.description || "Complete the listed steps."}</span>
        </div>
        <div>
          <strong>Achievement Points</strong>
          <span>{totalPoints.toLocaleString()} total</span>
        </div>
        {achievement.locked_text ? (
          <div>
            <strong>Locked Until</strong>
            <span>{achievement.locked_text}</span>
          </div>
        ) : null}
        {prerequisites.length ? (
          <div>
            <strong>Prerequisites</strong>
            <span>{prerequisites.join(", ")}</span>
          </div>
        ) : null}
      </div>

      <div className="achievement-step-list">
        <div className="section-title">
          <ListChecks />
          <h3>Completion Steps</h3>
        </div>
        {steps.map((step) => (
          <details
            key={step.key}
            className={`achievement-step ${step.completed ? "done" : ""}`}
            open={!step.completed}
          >
            <summary>
              <ChevronRight className="step-chevron" />
              {step.completed ? <CheckCircle2 className="ok" /> : <ListChecks />}
              <span>{step.title}</span>
              <strong>{step.completed ? "Done" : "Open"}</strong>
            </summary>
            <div className="achievement-step-body">
              {step.item ? <ItemIcon item={step.item} /> : null}
              <p>{step.detail}</p>
              {step.chatLink ? (
                <code title="Paste this in GW2 chat, then click it in game.">{step.chatLink}</code>
              ) : null}
            </div>
          </details>
        ))}
      </div>

      {achievement.rewards?.length ? (
        <div className="achievement-rewards">
          <div className="section-title">
            <Boxes />
            <h3>Rewards</h3>
          </div>
          <div className="reward-list">
            {achievement.rewards.map((reward, index) => (
              <span key={`${reward.type}-${reward.id ?? index}`}>
                {renderAchievementReward(reward, guideItems)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="achievement-wiki">
        <div className="section-title">
          <BookOpen />
          <h3>Wiki Guide</h3>
        </div>
        {guideState === "loading" ? <SkeletonRows /> : null}
        {wikiGuide ? (
          <div className="wiki-box">
            <p>{wikiGuide.extract || "Wiki page found."}</p>
            <a href={wikiGuide.url} target="_blank" rel="noreferrer">
              Open {wikiGuide.title}
              <ExternalLink />
            </a>
          </div>
        ) : guideState !== "loading" ? (
          <p className="muted-copy">
            No matching wiki extract was found. The official API steps above are still available.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function AchievementIcon({ achievement }: { achievement: Gw2Achievement }) {
  return achievement.icon ? (
    <img className="achievement-icon" src={achievement.icon} alt="" />
  ) : (
    <span className="achievement-icon fallback">
      <Trophy />
    </span>
  );
}

function buildAchievementViews(
  catalog: AchievementCatalog,
  accountSnapshot: AccountSnapshot | null,
): AchievementView[] {
  const progressMap = new Map(
    (accountSnapshot?.achievements ?? []).map((progress) => [progress.id, progress]),
  );
  const categoryByAchievement = new Map<number, AchievementCategory>();
  for (const category of catalog.categories) {
    for (const achievementId of category.achievements) {
      categoryByAchievement.set(achievementId, category);
    }
  }
  const groupByCategory = new Map<number, AchievementGroup>();
  for (const group of catalog.groups) {
    for (const categoryId of group.categories) {
      const category = catalog.categoryMap.get(categoryId);
      if (category) {
        groupByCategory.set(category.id, group);
      }
    }
  }

  return catalog.achievements
    .map((achievement) => {
      const progress = progressMap.get(achievement.id);
      const completion = getAchievementCompletion(achievement, progress);
      const category = categoryByAchievement.get(achievement.id);

      return {
        achievement,
        category,
        group: category ? groupByCategory.get(category.id) : undefined,
        progress,
        ...completion,
      };
    })
    .sort((left, right) => {
      if (left.completed !== right.completed) {
        return Number(left.completed) - Number(right.completed);
      }

      const groupOrder = (left.group?.order ?? 9999) - (right.group?.order ?? 9999);
      if (groupOrder !== 0) {
        return groupOrder;
      }

      const categoryOrder = (left.category?.order ?? 9999) - (right.category?.order ?? 9999);
      if (categoryOrder !== 0) {
        return categoryOrder;
      }

      return left.achievement.name.localeCompare(right.achievement.name);
    });
}

function getAchievementCompletion(
  achievement: Gw2Achievement,
  progress?: AccountAchievement,
): Pick<AchievementView, "completed" | "current" | "max" | "percent" | "earnedPoints"> {
  const tierMax = achievement.tiers.length
    ? achievement.tiers[achievement.tiers.length - 1].count
    : 0;
  const bitMax = achievement.bits?.length ?? 0;
  const baseMax = Math.max(progress?.max ?? 0, tierMax, bitMax, 1);
  const rawCurrent = progress?.current ?? progress?.bits?.length ?? 0;
  const completed = Boolean(progress?.done) || rawCurrent >= baseMax;
  const current = completed ? baseMax : Math.max(0, Math.min(rawCurrent, baseMax));
  const percent = Math.min(100, Math.max(0, (current / baseMax) * 100));
  const earnedPoints = achievement.tiers.reduce((sum, tier) => {
    return sum + (completed || current >= tier.count ? tier.points : 0);
  }, 0);

  return {
    completed,
    current,
    max: baseMax,
    percent,
    earnedPoints,
  };
}

function getAchievementItemIds(achievement: Gw2Achievement): number[] {
  const bitItemIds =
    achievement.bits
      ?.filter((bit) => bit.type === "Item" && typeof bit.id === "number")
      .map((bit) => bit.id!) ?? [];
  const rewardItemIds =
    achievement.rewards
      ?.filter((reward) => reward.type === "Item" && typeof reward.id === "number")
      .map((reward) => reward.id!) ?? [];

  return Array.from(new Set([...bitItemIds, ...rewardItemIds]));
}

function buildAchievementSteps(
  view: AchievementView,
  guideItems: Map<number, Gw2Item>,
): AchievementStep[] {
  const completedBits = new Set(view.progress?.bits ?? []);
  const bits = view.achievement.bits ?? [];

  if (bits.length > 0) {
    return bits.map((bit, index) => {
      const item = bit.type === "Item" && bit.id ? guideItems.get(bit.id) : undefined;
      const completed = view.completed || completedBits.has(index);

      return {
        key: `${view.achievement.id}-bit-${index}`,
        title: getAchievementBitTitle(bit, item, index),
        detail: getAchievementBitDetail(bit, item, view.achievement),
        completed,
        item,
        chatLink: item?.chat_link,
      };
    });
  }

  if (view.achievement.tiers.length > 0) {
    return view.achievement.tiers.map((tier, index) => {
      const completed = view.completed || view.current >= tier.count;

      return {
        key: `${view.achievement.id}-tier-${index}`,
        title: `Tier ${index + 1}: reach ${tier.count.toLocaleString()} progress`,
        detail: `${view.achievement.requirement || "Complete the achievement objective."} This tier awards ${tier.points.toLocaleString()} achievement points.`,
        completed,
      };
    });
  }

  return [
    {
      key: `${view.achievement.id}-requirement`,
      title: view.achievement.requirement || "Complete the achievement objective",
      detail:
        view.achievement.description ||
        view.achievement.locked_text ||
        "Check the wiki guide for the exact route or location.",
      completed: view.completed,
    },
  ];
}

function getAchievementBitTitle(bit: AchievementBit, item: Gw2Item | undefined, index: number): string {
  if (item) {
    return item.name;
  }

  if (bit.text) {
    return bit.text;
  }

  if (bit.id) {
    return `${bit.type} ${bit.id}`;
  }

  return `Step ${index + 1}`;
}

function getAchievementBitDetail(
  bit: AchievementBit,
  item: Gw2Item | undefined,
  achievement: Gw2Achievement,
): string {
  if (item) {
    return `Collect, unlock, equip, consume, or otherwise use ${item.name} as required by this achievement. ${achievement.requirement || achievement.description || "Check the wiki guide for the exact source."}`;
  }

  if (bit.text) {
    return `${bit.text}. ${achievement.requirement || achievement.description || "Complete this listed objective."}`;
  }

  return `${achievement.requirement || achievement.description || "Complete this listed objective."} The official API marks this as a ${bit.type} step.`;
}

function renderAchievementReward(
  reward: { type: string; id?: number; count?: number; region?: string },
  guideItems: Map<number, Gw2Item>,
): ReactNode {
  if (reward.type === "Coins") {
    return (
      <>
        <Money value={reward.count ?? 0} /> coins
      </>
    );
  }

  if (reward.type === "Item" && reward.id) {
    const item = guideItems.get(reward.id);
    return `${(reward.count ?? 1).toLocaleString()} x ${item?.name ?? `Item ${reward.id}`}`;
  }

  return `${reward.count ? `${reward.count.toLocaleString()} x ` : ""}${reward.type}${
    reward.region ? ` (${reward.region})` : ""
  }`;
}

function buildGoldSuggestions(analysis: AccountAnalysis | null): GoldSuggestion[] {
  if (!analysis) {
    return REPEATABLE_EARNING_OPTIONS;
  }

  return analysis.opportunities
    .map((opportunity) => {
      const speed = getOpportunitySpeed(opportunity);
      return {
        title: opportunity.output.name,
        detail: `Craft and sell with ${Math.round(opportunity.ownedCoverage * 100)}% owned coverage.`,
        value: "profit",
        valueCoin: Math.max(0, opportunity.personalProfit),
        speed,
        source: "Personal" as const,
      };
    })
    .sort((left, right) => {
      const speedDiff = SPEED_ORDER[left.speed] - SPEED_ORDER[right.speed];
      if (speedDiff !== 0) {
        return speedDiff;
      }

      return (right.valueCoin ?? 0) - (left.valueCoin ?? 0);
    })
    .slice(0, 20);
}

function isRepeatableGoldSuggestion(suggestion: GoldSuggestion): boolean {
  return !NON_REPEATABLE_ACTIVITY_TITLES.has(suggestion.title);
}

function getActivityIdForSuggestion(suggestion: GoldSuggestion): string {
  if (suggestion.source === "Personal") {
    return "craft-profitable-unlocked-recipes";
  }

  return (
    ACTIVITY_TITLE_TO_ID.get(suggestion.title.toLowerCase()) ??
    suggestion.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );
}

function getOpportunitySpeed(opportunity: CraftOpportunity): SpeedLabel {
  if (opportunity.ownedCoverage >= 0.85 || opportunity.personalCost <= 10_000) {
    return "Quickest";
  }

  if (opportunity.ownedCoverage >= 0.6 || opportunity.personalCost <= 100_000) {
    return "Fast";
  }

  if (opportunity.ownedCoverage >= 0.3 || opportunity.personalCost <= 500_000) {
    return "Moderate";
  }

  return "Slowest";
}

function ActivityGuidePage({
  activePage,
  maps,
  onOpenActivity,
}: {
  activePage: ActivePage;
  maps: Gw2Map[];
  onOpenActivity: (suggestion: GoldSuggestion) => void;
}) {
  const activityId = activePage.replace(/^activity:/, "");
  const guide = ACTIVITY_GUIDES[activityId] ?? ACTIVITY_GUIDES["open-world-meta-event-trains"];
  const relatedOptions = REPEATABLE_EARNING_OPTIONS.filter((option) => {
    return option.title !== guide.title && getActivityIdForSuggestion(option) !== guide.id;
  }).slice(0, 6);

  return (
    <div className="activity-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">{guide.category}</span>
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
        </div>
        <span className={`speed-badge speed-${guide.speed.toLowerCase()}`}>{guide.speed}</span>
      </section>

      {guide.id === "open-world-meta-event-trains" ? <MetaFarmTable /> : null}

      <section className="guide-grid activity-guide-grid">
        <div className="surface guide-steps">
          <div className="section-title">
            <BookOpen />
            <h3>How To Do It</h3>
          </div>
          <ol>
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="surface guide-map-panel">
          <div className="section-title">
            <Database />
            <h3>Map and GW2 Links</h3>
          </div>
          <div className="location-list">
            {guide.locations.map((location) => (
              <LocationCard
                key={`${location.map}-${location.label}`}
                location={location}
                maps={maps}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="activity-support-grid">
        <div className="surface">
          <div className="section-title">
            <CheckCircle2 />
            <h3>Practical Notes</h3>
          </div>
          <div className="activity-tip-list">
            {guide.tips.map((tip) => (
              <div key={tip} className="activity-tip">
                <CheckCircle2 />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface suggestions-panel">
          <div className="section-title">
            <TrendingUp />
            <h3>Related Activities</h3>
          </div>
          <div className="earning-list">
            {relatedOptions.map((option) => (
              <button
                key={option.title}
                className="earning-row compact"
                onClick={() => onOpenActivity(option)}
              >
                <span className={`speed-badge speed-${option.speed.toLowerCase()}`}>
                  {option.speed}
                </span>
                <div>
                  <strong>{option.title}</strong>
                  <span>{option.detail}</span>
                </div>
                <strong>{option.value}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetaFarmTable() {
  return (
    <section className="surface meta-farm-panel">
      <div className="section-title meta-farm-title">
        <TrendingUp />
        <div>
          <h3>Meta Farm Estimates</h3>
          <p>Approximate liquid value per hour before your local snapshots can tune the numbers.</p>
        </div>
      </div>
      <div className="meta-table-wrap">
        <table className="meta-table">
          <thead>
            <tr>
              <th>Meta</th>
              <th>Map</th>
              <th>Est. gold/hour</th>
              <th>Time</th>
              <th>Access and payout notes</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {META_FARM_ESTIMATES.map((estimate) => (
              <tr key={`${estimate.map}-${estimate.name}`}>
                <td>
                  <strong>{estimate.name}</strong>
                  <span>{estimate.expansion}</span>
                </td>
                <td>
                  <span>{estimate.map}</span>
                  <small>{estimate.cadence}</small>
                </td>
                <td className="meta-money-cell">
                  <MoneyRange min={estimate.goldMin} max={estimate.goldMax} />
                  <span className={`meta-confidence confidence-${estimate.confidence.toLowerCase()}`}>
                    {estimate.confidence}
                  </span>
                </td>
                <td>{estimate.duration}</td>
                <td>{estimate.access}</td>
                <td>
                  <a href={estimate.wikiUrl} target="_blank" rel="noreferrer">
                    Wiki
                    <ExternalLink />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MoneyRange({ min, max }: { min: number; max: number }) {
  return (
    <span className="money-range">
      <Money value={min} />
      <span>to</span>
      <Money value={max} />
    </span>
  );
}

function MarketPage({
  catalog,
  filteredItems,
  selectedItem,
  query,
  loadState,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onQueryChange,
  onExportMarketHistory,
  onImportMarketHistory,
  onCloseDetail,
  onSelectItem,
  onLoadMarket,
}: {
  catalog: MarketItem[];
  filteredItems: MarketItem[];
  selectedItem: MarketItem | null;
  query: string;
  loadState: LoadState;
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onQueryChange: (query: string) => void;
  onExportMarketHistory: () => Promise<void> | void;
  onImportMarketHistory: (file: File) => Promise<MarketHistoryImportResult>;
  onCloseDetail: () => void;
  onSelectItem: (item: MarketItem) => void;
  onLoadMarket: () => void;
}) {
  const [visibleItemCount, setVisibleItemCount] = useState(MARKET_LIST_INITIAL_ITEMS);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleItemCount),
    [filteredItems, visibleItemCount],
  );
  const remainingItemCount = Math.max(0, filteredItems.length - visibleItems.length);

  useEffect(() => {
    setVisibleItemCount(MARKET_LIST_INITIAL_ITEMS);
  }, [query, loadState]);

  return (
    <div className={`market-workspace ${selectedItem ? "" : "detail-closed"}`}>
      <aside className="market-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Black Lion Trading Post</span>
            <h2>Market Items</h2>
          </div>
          <div className="market-heading-actions">
            <span className="metric">{catalog.length.toLocaleString()}</span>
            <div className="history-file-actions">
              <button
                className="mini-action"
                onClick={() => void Promise.resolve(onExportMarketHistory()).catch(() => undefined)}
                title="Export local market history"
              >
                Export
              </button>
              <button
                className="mini-action"
                onClick={() => importInputRef.current?.click()}
                title="Import and merge local market history"
              >
                Import
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) {
                    void onImportMarketHistory(file).catch(() => undefined);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <label className="search-box">
          <Search />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search item, rarity, type"
          />
        </label>

        <div className="item-list">
          {visibleItems.length > 0 ? (
            <div className="market-table-wrap">
              <table className="market-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Sell</th>
                    <th>Buy</th>
                    <th>Spread</th>
                    <th>Supply</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`market-row ${selectedItem?.id === item.id ? "active" : ""}`}
                      onClick={() => onSelectItem(item)}
                    >
                      <td>
                        <span className="table-item-cell">
                          <ItemIcon item={item} />
                          <span className="item-copy">
                            <strong>{item.name}</strong>
                            <span>
                              {item.rarity} {item.type}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td><Money value={item.price.sells.unit_price} /></td>
                      <td><Money value={item.price.buys.unit_price} /></td>
                      <td className={item.spread > 0 ? "profit" : "muted-money"}>
                        <Money value={Math.abs(item.spread)} />
                      </td>
                      <td>{item.price.sells.quantity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {remainingItemCount > 0 ? (
            <button
              className="empty-action load-more-market"
              onClick={() => {
                setVisibleItemCount((current) =>
                  Math.min(filteredItems.length, current + MARKET_LIST_BATCH_SIZE),
                );
              }}
            >
              <PackageSearch />
              Show next {Math.min(MARKET_LIST_BATCH_SIZE, remainingItemCount).toLocaleString()} items
            </button>
          ) : null}

          {loadState === "loading" && catalog.length > 0 ? (
            <p className="market-list-note">Loading more Trading Post items in the background.</p>
          ) : null}

          {loadState === "idle" ? (
            <button className="empty-action" onClick={onLoadMarket}>
              <RefreshCcw />
              Load live market
            </button>
          ) : null}

          {loadState === "loading" && catalog.length === 0 ? <SkeletonRows /> : null}
        </div>
      </aside>

      {selectedItem ? (
        <section className="detail-panel">
          <ItemDetail
            item={selectedItem}
            catalog={catalog}
            listings={listings}
            itemTransactions={itemTransactions}
            recipes={recipes}
            usedInRecipes={usedInRecipes}
            recipeUsageState={recipeUsageState}
            wikiGuide={wikiGuide}
            detailState={detailState}
            containerAnalysis={containerAnalysis}
            containerState={containerState}
            accountSnapshot={accountSnapshot}
            marketHistoryRevision={marketHistoryRevision}
            onClose={onCloseDetail}
            onOpenDetail={(detailItem) => onSelectItem(buildMarketItemForDetail(detailItem))}
          />
        </section>
      ) : null}
    </div>
  );
}

type OpenableBagSourceKind = "Market" | "Festival" | "Fractal" | "WvW" | "PvP" | "Living World" | "Expansion" | "Core" | "Gem Store" | "Unknown";

interface OpenableBagGuide {
  expansion: string;
  sourceKind: OpenableBagSourceKind;
  acquisition: string;
}

interface OpenableBagValue {
  revenue: number;
  profit: number | null;
  bestChoice: {
    name: string;
    value: number;
    quantity: string;
    item?: MarketItem;
  } | null;
  matchedRows: number;
  exactChancesAvailable: boolean;
  source: "wiki" | "market" | "pending" | "unknown";
}

function OpenableBagsPage({
  catalog,
  selectedItem,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onProgress,
  onCloseDetail,
  onSelectItem,
}: {
  catalog: MarketItem[];
  selectedItem: MarketItem | null;
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onProgress: (message: string, done?: number, total?: number) => void;
  onCloseDetail: () => void;
  onSelectItem: (item: MarketItem) => void;
}) {
  const [bags, setBags] = useState<Gw2Item[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [bagAnalyses, setBagAnalyses] = useState<Map<number, ContainerAnalysis | null>>(new Map());
  const [analysisStates, setAnalysisStates] = useState<Map<number, LoadState>>(new Map());
  const startedAnalysisIds = useRef<Set<number>>(new Set());
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    let ignore = false;
    setLoadState("loading");

    loadOpenableBagItems((message, done, total) => onProgressRef.current(message, done, total))
      .then((items) => {
        if (ignore) {
          return;
        }

        setBags(items);
        setLoadState("ready");
        onProgressRef.current(`${items.length.toLocaleString()} openable containers loaded`);
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setLoadState("error");
        onProgressRef.current(error instanceof Error ? error.message : "Unable to load openable containers");
      });

    return () => {
      ignore = true;
    };
  }, []);

  const catalogById = useMemo(() => new Map(catalog.map((item) => [item.id, item])), [catalog]);
  const rows = useMemo(
    () =>
      bags.map((item) => {
        const marketItem = catalogById.get(item.id) ?? buildMarketItemForDetail(item);
        const guide = getOpenableBagGuide(item);
        const analysis = bagAnalyses.get(item.id) ?? null;
        const value = estimateOpenableBagValue(marketItem, analysis, catalog);
        const analysisState = analysisStates.get(item.id) ?? "idle";
        const fallbackRank = marketItem.price.sells.unit_price || marketItem.price.buys.unit_price || marketItem.vendor_value;
        const isTradable = hasTradingPostPrice(marketItem);

        return {
          item,
          marketItem,
          guide,
          analysis,
          value,
          analysisState,
          isTradable,
          rankValue: value.revenue || fallbackRank,
        };
      }),
    [analysisStates, bagAnalyses, bags, catalog, catalogById],
  );
  const sourceKinds = useMemo(
    () => Array.from(new Set(rows.map((row) => row.guide.sourceKind))).sort(),
    [rows],
  );
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (sourceFilter !== "all" && row.guide.sourceKind !== sourceFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return (
          row.item.name.toLowerCase().includes(normalizedQuery) ||
          row.guide.expansion.toLowerCase().includes(normalizedQuery) ||
          row.guide.acquisition.toLowerCase().includes(normalizedQuery) ||
          row.guide.sourceKind.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((left, right) => right.rankValue - left.rankValue || left.item.name.localeCompare(right.item.name));
  }, [query, rows, sourceFilter]);
  const selectedOpenableRow = rows.find((row) => row.item.id === selectedItem?.id) ?? null;
  const selectedOpenableBag = selectedOpenableRow?.marketItem ?? null;
  const analyzedCount = rows.filter((row) => row.analysisState === "ready" || row.analysisState === "error").length;
  const profitableCount = rows.filter((row) => row.value.profit !== null && row.value.profit > 0).length;
  const bestRevenue = Math.max(0, ...rows.map((row) => row.value.revenue));
  const marketCount = rows.filter((row) => row.isTradable).length;
  const nonMarketCount = Math.max(0, rows.length - marketCount);

  useEffect(() => {
    if (rows.length === 0) {
      return;
    }

    let cancelled = false;
    const remainingAnalysisSlots = Math.max(0, OPENABLE_BAG_ANALYSIS_LIMIT - startedAnalysisIds.current.size);
    if (remainingAnalysisSlots === 0) {
      return;
    }

    const targets = rows
      .filter((row) => !startedAnalysisIds.current.has(row.item.id))
      .sort((left, right) => {
        const leftPrice = left.marketItem.price.sells.unit_price || left.marketItem.price.buys.unit_price;
        const rightPrice = right.marketItem.price.sells.unit_price || right.marketItem.price.buys.unit_price;
        return rightPrice - leftPrice || left.item.name.localeCompare(right.item.name);
      })
      .slice(0, remainingAnalysisSlots);

    if (targets.length === 0) {
      return;
    }

    for (const target of targets) {
      startedAnalysisIds.current.add(target.item.id);
    }

    setAnalysisStates((current) => {
      const next = new Map(current);
      for (const target of targets) {
        next.set(target.item.id, "loading");
      }
      return next;
    });

    let cursor = 0;
    let completed = 0;

    const worker = async () => {
      while (!cancelled && cursor < targets.length) {
        const target = targets[cursor];
        cursor += 1;

        try {
          const analysis = await loadContainerAnalysis(target.item.name);
          if (cancelled) {
            return;
          }

          setBagAnalyses((current) => {
            const next = new Map(current);
            next.set(target.item.id, analysis);
            return next;
          });
          setAnalysisStates((current) => {
            const next = new Map(current);
            next.set(target.item.id, analysis ? "ready" : "error");
            return next;
          });
        } catch {
          if (cancelled) {
            return;
          }

          setBagAnalyses((current) => {
            const next = new Map(current);
            next.set(target.item.id, null);
            return next;
          });
          setAnalysisStates((current) => {
            const next = new Map(current);
            next.set(target.item.id, "error");
            return next;
          });
        } finally {
          completed += 1;
          onProgressRef.current("Estimating openable bag revenue", completed, targets.length);
        }
      }
    };

    void Promise.all(
      Array.from({ length: Math.min(OPENABLE_BAG_ANALYSIS_CONCURRENCY, targets.length) }, worker),
    );

    return () => {
      cancelled = true;
    };
  }, [rows]);

  return (
    <div className={`market-workspace openable-bags-workspace ${selectedOpenableBag ? "" : "detail-closed"}`}>
      <aside className="market-panel craft-table-panel">
        <section className="page-header compact-page-header">
          <div>
            <span className="eyebrow">Loot Containers</span>
            <h2>Bags</h2>
            <p>All official openable container items, including tradeable bags and account-bound or non-Trading Post variants.</p>
          </div>
        </section>

        <section className="stat-grid compact-stat-grid">
          <Metric icon={<PackageSearch />} label="Containers" value={rows.length.toLocaleString()} />
          <Metric icon={<Coins />} label="Best Avg Value" value={<Money value={bestRevenue} />} tone={bestRevenue ? "positive" : "muted"} />
          <Metric icon={<ShieldCheck />} label="Not Tradable" value={nonMarketCount.toLocaleString()} tone={nonMarketCount ? "muted" : "default"} />
          <Metric icon={<Database />} label="Checked" value={`${analyzedCount.toLocaleString()} / ${Math.min(rows.length, OPENABLE_BAG_ANALYSIS_LIMIT).toLocaleString()}`} />
        </section>

        <div className="slot-bag-toolbar">
          <label className="search-box">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bags, expansion, source"
            />
          </label>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} aria-label="Filter by source">
            <option value="all">All sources</option>
            {sourceKinds.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {loadState === "loading" && rows.length === 0 ? <SkeletonRows /> : null}
        {loadState === "error" ? (
          <div className="empty-detail inline-empty">
            <AlertCircle />
            <h2>Bags could not be loaded</h2>
            <p>The app could not reach the GW2 Wiki or official item catalog. Try reopening this page once the APIs are reachable.</p>
          </div>
        ) : null}

        {visibleRows.length > 0 ? (
          <div className="craft-table-wrap">
            <table className="craft-profit-table openable-bag-table">
              <thead>
                <tr>
                  <th>Container</th>
                  <th>How to get</th>
                  <th>Average Contents</th>
                  <th>Profit</th>
                  <th>Trading Post</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr
                    key={row.item.id}
                    className={selectedOpenableBag?.id === row.item.id ? "selected-row" : ""}
                    onClick={() => onSelectItem(row.marketItem)}
                  >
                    <td>
                      <span className="table-item-cell">
                        <ItemIcon item={row.item} />
                        <span className="item-copy">
                          <strong>{row.item.name}</strong>
                          <span>{row.item.rarity} {row.item.type}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={`source-pill source-${sourceClassName(row.guide.sourceKind)}`}>
                        {row.guide.sourceKind}
                      </span>
                      <small>{row.guide.expansion} - {row.guide.acquisition}</small>
                    </td>
                    <td>{renderOpenableRevenue(row.value, row.analysisState)}</td>
                    <td className={row.value.profit !== null && row.value.profit > 0 ? "profit" : "muted-money"}>
                      {!row.isTradable
                        ? "Not tradable"
                        : row.value.profit !== null
                          ? <Money value={Math.abs(row.value.profit)} />
                          : "Unknown"}
                    </td>
                    <td>
                      {row.isTradable ? (
                        <span className="market-value-note">
                          <small>Lowest listing</small>
                          <Money value={row.marketItem.price.sells.unit_price || row.marketItem.price.buys.unit_price} />
                        </span>
                      ) : (
                        <span className="not-tradable-note">Not tradable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : loadState === "ready" ? (
          <div className="empty-detail inline-empty">
            <Search />
            <h2>No bags match</h2>
            <p>Clear the search or source filter to show the full openable-container list.</p>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <p className="market-list-note">
            {profitableCount.toLocaleString()} tradable bags currently show positive estimated opening profit from parsed wiki contents.
            {nonMarketCount.toLocaleString()} containers are account-bound, unsellable, or not currently listed on the Trading Post.
            Rows marked “Checking” are being valued in the background; selecting any container loads its full detail page.
          </p>
        ) : null}
      </aside>

      {selectedOpenableBag && selectedOpenableRow ? (
        <section className="detail-panel">
          <ItemDetail
            item={selectedOpenableBag}
            catalog={catalog}
            listings={listings}
            itemTransactions={itemTransactions}
            recipes={recipes}
            usedInRecipes={usedInRecipes}
            recipeUsageState={recipeUsageState}
            wikiGuide={wikiGuide}
            detailState={detailState}
            containerAnalysis={containerAnalysis}
            containerState={containerState}
            accountSnapshot={accountSnapshot}
            marketHistoryRevision={marketHistoryRevision}
            onClose={onCloseDetail}
            onOpenDetail={(detailItem) => onSelectItem(buildMarketItemForDetail(detailItem))}
            extraInfo={
              <OpenableBagInfoPanel
                item={selectedOpenableBag}
                guide={selectedOpenableRow.guide}
                analysis={containerAnalysis}
                analysisState={containerState}
                catalog={catalog}
              />
            }
          />
        </section>
      ) : null}
    </div>
  );
}

function estimateOpenableBagValue(
  item: MarketItem,
  analysis: ContainerAnalysis | null,
  catalog: MarketItem[],
): OpenableBagValue {
  if (!analysis?.drops.length) {
    const fallbackRevenue = item.netSellPrice || item.price.buys.unit_price || 0;
    return {
      revenue: 0,
      profit: null,
      bestChoice: null,
      matchedRows: fallbackRevenue ? 1 : 0,
      exactChancesAvailable: false,
      source: fallbackRevenue ? "market" : analysis ? "unknown" : "pending",
    };
  }

  const valuedDrops = analysis.drops.map((drop) => {
    const marketItem = findMarketItemForDrop(drop, catalog);
    const directUnitValue = drop.coinValue ?? marketItem?.netSellPrice ?? marketItem?.price.buys.unit_price ?? 0;
    const salvageUnitValue = drop.coinValue
      ? drop.coinValue
      : estimateSalvageUnitValue(marketItem, directUnitValue);

    return {
      drop,
      marketItem,
      directUnitValue,
      salvageUnitValue,
    };
  });
  const directStats = summarizeDropValues(valuedDrops, 1, "direct");
  const salvageStats = summarizeDropValues(valuedDrops, 1, "salvage");
  const revenue = Math.max(directStats.avg, salvageStats.avg);
  const marketCost = item.price.sells.unit_price || 0;
  const bestChoice = valuedDrops
    .filter((row) => row.directUnitValue > 0)
    .sort((left, right) => right.directUnitValue - left.directUnitValue)[0];

  return {
    revenue,
    profit: revenue > 0 && marketCost > 0 ? revenue - marketCost : null,
    bestChoice: bestChoice
      ? {
          name: bestChoice.marketItem?.name ?? bestChoice.drop.name,
          value: bestChoice.directUnitValue,
          quantity:
            bestChoice.drop.quantityMin === bestChoice.drop.quantityMax
              ? `${bestChoice.drop.quantityMin}`
              : `${bestChoice.drop.quantityMin}-${bestChoice.drop.quantityMax}`,
          item: bestChoice.marketItem,
        }
      : null,
    matchedRows: valuedDrops.filter((row) => row.directUnitValue > 0).length,
    exactChancesAvailable: analysis.exactChancesAvailable,
    source: "wiki",
  };
}

function sourceClassName(source: string): string {
  return source.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function renderOpenableRevenue(value: OpenableBagValue, state: LoadState): ReactNode {
  if (value.revenue > 0) {
    return <Money value={value.revenue} />;
  }

  if (state === "loading") {
    return "Checking";
  }

  if (value.source === "market") {
    return "Needs loot data";
  }

  return "Unknown";
}

function getOpenableBagGuide(item: Gw2Item): OpenableBagGuide {
  const name = item.name.toLowerCase();

  if (/trick-or-treat|halloween|mad king/.test(name)) {
    return {
      expansion: "Festival",
      sourceKind: "Festival",
      acquisition: "Halloween activities, vendors, and festival rewards.",
    };
  }

  if (/wintersday|snowflake|gift/.test(name)) {
    return {
      expansion: "Festival",
      sourceKind: "Festival",
      acquisition: "Wintersday activities, gifts, vendors, or festival rewards.",
    };
  }

  if (/dragon bash|zephyrite|lunar|festival|four winds|super adventure/.test(name)) {
    return {
      expansion: "Festival",
      sourceKind: "Festival",
      acquisition: "Festival activities, vendors, or seasonal reward tracks.",
    };
  }

  if (/black lion|gem store|claim ticket/.test(name)) {
    return {
      expansion: "Core / Gem Store",
      sourceKind: "Gem Store",
      acquisition: "Black Lion Chest, Gem Store, or Black Lion related rewards.",
    };
  }

  if (/fractal|mistlock|integrated|encrypt/.test(name)) {
    return {
      expansion: "Core / Fractals",
      sourceKind: "Fractal",
      acquisition: "Fractal daily rewards, fractal vendors, or encrypted fractal containers.",
    };
  }

  if (/wvw|world vs|mist war|skirmish|siegemaster|pillager/.test(name)) {
    return {
      expansion: "Core / WvW",
      sourceKind: "WvW",
      acquisition: "World vs. World reward tracks, vendors, skirmish chests, or rank rewards.",
    };
  }

  if (/\bpvp\b|league|glory|tournament/.test(name)) {
    return {
      expansion: "Core / PvP",
      sourceKind: "PvP",
      acquisition: "Structured PvP reward tracks, league chests, or PvP vendors.",
    };
  }

  if (/mordrem|chak|auric|verdant|tangled|dragon's stand|exalted|ley-line|hot/.test(name)) {
    return {
      expansion: "Heart of Thorns",
      sourceKind: "Expansion",
      acquisition: "Heart of Thorns map metas, vendors, events, or reward tracks.",
    };
  }

  if (/elonian|awakened|bounty|crystal|desert|casino|zephyrite lockbox|trade contract|pof/.test(name)) {
    return {
      expansion: "Path of Fire",
      sourceKind: "Expansion",
      acquisition: "Path of Fire maps, bounties, events, vendors, or reward tracks.",
    };
  }

  if (/canthan|jade|imperial|tengu|echovald|kaineng|seitung|dragon's end|eod/.test(name)) {
    return {
      expansion: "End of Dragons",
      sourceKind: "Expansion",
      acquisition: "End of Dragons maps, metas, vendors, or reward tracks.",
    };
  }

  if (/kryptis|rift|astral|skywatch|amnytas|nayos|soto|arcane/.test(name)) {
    return {
      expansion: "Secrets of the Obscure",
      sourceKind: "Expansion",
      acquisition: "SotO rifts, map metas, vendors, Wizard's Vault, or related events.",
    };
  }

  if (/janthir|kodan|lowland|syntri|mursaat|homestead/.test(name)) {
    return {
      expansion: "Janthir Wilds",
      sourceKind: "Expansion",
      acquisition: "Janthir Wilds maps, events, vendors, or reward tracks.",
    };
  }

  if (/drizzlewood|bjora|icebrood|volatile|unbound|istan|sandswept|dragonfall|thunderhead|olmakhan|kourna|joko|jahai|episode/.test(name)) {
    return {
      expansion: "Living World",
      sourceKind: "Living World",
      acquisition: "Living World episode maps, metas, vendors, or achievements.",
    };
  }

  if (/champion|loot bag|bandit|centaur|dredge|flame legion|nightmare|sons of svanir|skritt|troll|ogre|grawl|krait|modniir|risen/.test(name)) {
    return {
      expansion: "Core Tyria",
      sourceKind: "Core",
      acquisition: "Core Tyria enemies, champions, events, bags, or map reward tracks.",
    };
  }

  if (item.flags?.includes("NoSell")) {
    return {
      expansion: "Account reward",
      sourceKind: "Unknown",
      acquisition: "Account-bound reward. Open the wiki guide for the exact source.",
    };
  }

  return {
    expansion: "Multiple / Wiki",
    sourceKind: "Market",
    acquisition: "Loot source varies. The wiki guide in the detail panel lists the exact source when available.",
  };
}

function OpenableBagInfoPanel({
  item,
  guide,
  analysis,
  analysisState,
  catalog,
}: {
  item: MarketItem;
  guide: OpenableBagGuide;
  analysis: ContainerAnalysis | null;
  analysisState: LoadState;
  catalog: MarketItem[];
}) {
  const value = estimateOpenableBagValue(item, analysis, catalog);
  const marketCost = item.price.sells.unit_price || item.price.buys.unit_price || 0;
  const isTradable = hasTradingPostPrice(item);

  return (
    <section className="surface slot-bag-info">
      <div className="section-title">
        <PackageSearch />
        <h3>Container Guide</h3>
      </div>
      <div className="slot-bag-facts">
        <span>
          <small>Expansion</small>
          <strong>{guide.expansion}</strong>
        </span>
        <span>
          <small>Source</small>
          <strong>{guide.sourceKind}</strong>
        </span>
        <span>
          <small>Trading Post</small>
          <strong>{isTradable && marketCost ? <Money value={marketCost} /> : "Not tradable"}</strong>
        </span>
        <span>
          <small>Average Contents</small>
          <strong>{renderOpenableRevenue(value, analysisState)}</strong>
        </span>
      </div>
      <p>{guide.acquisition}</p>
      <div className="best-choice-card">
        <div>
          <small>Best choice / top sellable outcome</small>
          {analysisState === "loading" ? (
            <strong>Checking contents</strong>
          ) : value.bestChoice ? (
            <strong>{value.bestChoice.name}</strong>
          ) : (
            <strong>No sellable choice found</strong>
          )}
        </div>
        {value.bestChoice ? (
          <span>
            {value.bestChoice.quantity}x · <Money value={value.bestChoice.value} />
          </span>
        ) : null}
      </div>
      {analysis ? (
        <p className="muted-copy">
          Matched {value.matchedRows.toLocaleString()} wiki content rows to market prices.
          {value.exactChancesAvailable
            ? " Some exact chances were parsed."
            : " Exact drop chances were not available for every row."}
        </p>
      ) : null}
    </section>
  );
}

function getSlotBagSize(item: Gw2Item): number | null {
  return typeof item.details?.size === "number" ? item.details.size : null;
}

function getSlotBagTypeLabel(item: Gw2Item): string {
  const name = item.name.toLowerCase();

  if (/tengu|olmakhan|bandolier/.test(name)) {
    return "Container";
  }

  if (/siegemaster/.test(name)) {
    return "Consumable";
  }

  if (/fractal|equipment|locker|safe box|marshal/.test(name)) {
    return /invisible|safe box|marshal/.test(name) ? "Invisible equipment" : "Equipment";
  }

  if (/invisible|courier/.test(name)) {
    return "Invisible";
  }

  if (/craftsman|cowrie/.test(name)) {
    return "Craftsman";
  }

  if (/oiled|hamaseen/.test(name)) {
    return "Oiled";
  }

  return "Basic";
}

function getSlotBagAcquisition(item: Gw2Item): SlotBagSourceNote {
  const known = SLOT_BAG_SOURCE_NOTES[item.name];
  if (known) {
    return known;
  }

  const name = item.name.toLowerCase();
  if (/ogre bag|wrangler's bag/.test(name)) {
    return {
      kind: "Crafted",
      source: "Recipe sheet",
      detail: "Crafted after learning the item-specific recipe sheet.",
    };
  }

  if (/boreal|pannier|locker|saddlebag|courier|marshal|hamaseen|cowrie|pact/.test(name)) {
    return {
      kind: "Crafted",
      source: "Crafting or upgrade chain",
      detail: "Crafted or upgraded through a bag recipe chain. Select it to load the official recipe when the API exposes one.",
    };
  }

  if (/\d+[- ]slot|jute|wool|cotton|linen|silk|gossamer|rawhide|thin leather|coarse leather|rugged leather|thick leather|hardened leather|bronze|iron|steel|darksteel|mithril|orichalcum/.test(name)) {
    return {
      kind: "Crafted",
      source: "Crafting discipline",
      detail: "Crafted by Armorsmith, Leatherworker, or Tailor. Basic recipes are learned automatically; specialty bags are usually discovered.",
    };
  }

  if (item.flags?.includes("NoSell")) {
    return {
      kind: "Reward",
      source: "Account or character reward",
      detail: "Account-bound or character-bound bag. Check the wiki guide for the exact reward source.",
    };
  }

  return {
    kind: "Unknown",
    source: "Wiki or item page",
    detail: "The official item record marks this as a slot bag, but this guide does not yet have a specific acquisition source.",
  };
}

function getSlotBagRecipeNote(
  item: Gw2Item,
  acquisition: SlotBagSourceNote,
  recipes: RecipeGuide[],
  detailState: LoadState,
): string {
  if (detailState === "loading") {
    return "Checking official recipe data.";
  }

  if (recipes.length > 0) {
    const autoLearned = recipes.some((guide) => guide.recipe.flags.includes("AutoLearned"));
    const learnedFromItem = recipes.some((guide) => guide.recipe.flags.includes("LearnedFromItem"));
    const wikiRecipe = recipes.some((guide) => guide.recipe.source === "wiki");
    const disciplines = Array.from(new Set(recipes.flatMap((guide) => guide.recipe.disciplines))).join(", ");
    const rating = Math.min(...recipes.map((guide) => guide.recipe.min_rating));

    if (autoLearned) {
      return `Recipe learned automatically by ${disciplines || "the crafting discipline"} at rating ${rating}.`;
    }

    if (learnedFromItem || /ogre bag|wrangler's bag/i.test(item.name)) {
      return `Recipe learned from a recipe sheet for ${item.name}. Open Recipe source for vendor and acquisition details.`;
    }

    if (wikiRecipe) {
      return `Recipe documented by the GW2 Wiki. Open Recipe source for the exact acquisition details.`;
    }

    if (acquisition.kind === "Crafted") {
      return `Discovery recipe through ${disciplines || "crafting"} at rating ${rating}. Use the Discovery tab with the listed ingredients.`;
    }

    return `A direct recipe exists through ${disciplines || "crafting"} at rating ${rating}.`;
  }

  if (acquisition.kind === "Crafted") {
    return "No direct official recipe was returned for this selected bag. It may be upgraded, discovered, recipe-sheet based, or documented only on the wiki page.";
  }

  return "No crafting recipe needed for this acquisition route.";
}

function SlotBagsPage({
  catalog,
  selectedItem,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onProgress,
  onCloseDetail,
  onSelectItem,
}: {
  catalog: MarketItem[];
  selectedItem: MarketItem | null;
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onProgress: (message: string, done?: number, total?: number) => void;
  onCloseDetail: () => void;
  onSelectItem: (item: MarketItem) => void;
}) {
  const [slotBags, setSlotBags] = useState<Gw2Item[]>([]);
  const [slotBagState, setSlotBagState] = useState<LoadState>("idle");
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    let ignore = false;
    setSlotBagState("loading");

    loadSlotBagItems((message, done, total) => onProgressRef.current(message, done, total))
      .then((items) => {
        if (ignore) {
          return;
        }

        setSlotBags(items);
        setSlotBagState("ready");
        onProgressRef.current(`${items.length.toLocaleString()} slot bags loaded`);
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setSlotBagState("error");
        onProgressRef.current(error instanceof Error ? error.message : "Unable to load slot bags");
      });

    return () => {
      ignore = true;
    };
  }, []);

  const catalogById = useMemo(() => new Map(catalog.map((item) => [item.id, item])), [catalog]);
  const rows = useMemo(
    () =>
      slotBags.map((item) => {
        const marketItem = catalogById.get(item.id) ?? buildMarketItemForDetail(item);
        const acquisition = getSlotBagAcquisition(item);
        const size = getSlotBagSize(item);

        return {
          item,
          marketItem,
          acquisition,
          size,
          typeLabel: getSlotBagTypeLabel(item),
          hasMarketPrice: marketItem.price.sells.unit_price > 0 || marketItem.price.buys.unit_price > 0,
        };
      }),
    [catalogById, slotBags],
  );
  const sizes = useMemo(
    () => Array.from(new Set(rows.map((row) => row.size).filter((size): size is number => size !== null))).sort((left, right) => right - left),
    [rows],
  );
  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const selectedSize = sizeFilter === "all" ? null : Number(sizeFilter);

    return rows.filter((row) => {
      const sizeMatches = selectedSize === null || row.size === selectedSize;
      if (!sizeMatches) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        row.item.name.toLowerCase().includes(normalizedSearch) ||
        row.typeLabel.toLowerCase().includes(normalizedSearch) ||
        row.acquisition.kind.toLowerCase().includes(normalizedSearch) ||
        row.acquisition.source.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [rows, search, sizeFilter]);
  const selectedSlotBagRow = rows.find((row) => row.item.id === selectedItem?.id) ?? null;
  const selectedSlotBag = selectedSlotBagRow?.marketItem ?? null;
  const maxSlots = sizes[0] ?? 0;
  const marketCount = rows.filter((row) => row.hasMarketPrice).length;
  const nonMarketCount = Math.max(0, rows.length - marketCount);
  const craftedCount = rows.filter((row) => row.acquisition.kind === "Crafted").length;

  return (
    <div className={`market-workspace slot-bags-workspace ${selectedSlotBag ? "" : "detail-closed"}`}>
      <aside className="market-panel craft-table-panel">
        <section className="page-header compact-page-header">
          <div>
            <span className="eyebrow">Inventory Capacity</span>
            <h2>Slot Bags</h2>
            <p>Every official bag item that increases character inventory slots, including account-bound and non-Trading Post bags.</p>
          </div>
        </section>

        <section className="stat-grid compact-stat-grid">
          <Metric icon={<Boxes />} label="Slot Bags" value={rows.length.toLocaleString()} />
          <Metric icon={<PackageSearch />} label="Max Slots" value={maxSlots ? `${maxSlots}` : "Loading"} />
          <Metric icon={<Coins />} label="Tradeable" value={marketCount.toLocaleString()} tone={marketCount ? "positive" : "muted"} />
          <Metric icon={<ShieldCheck />} label="Not on TP" value={nonMarketCount.toLocaleString()} tone={nonMarketCount ? "muted" : "default"} />
        </section>

        <div className="slot-bag-toolbar">
          <label className="search-box">
            <Search />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search slot bags, source, type"
            />
          </label>
          <select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)} aria-label="Filter by slot count">
            <option value="all">All sizes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size} slots
              </option>
            ))}
          </select>
        </div>

        {slotBagState === "loading" && rows.length === 0 ? <SkeletonRows /> : null}
        {slotBagState === "error" ? (
          <div className="empty-detail inline-empty">
            <AlertCircle />
            <h2>Slot bags could not be loaded</h2>
            <p>The app could not reach the GW2 Wiki item index. Try reopening this page once the API is reachable.</p>
          </div>
        ) : null}

        {visibleRows.length > 0 ? (
          <div className="craft-table-wrap">
            <table className="craft-profit-table slot-bag-table">
              <thead>
                <tr>
                  <th>Bag</th>
                  <th>Slots</th>
                  <th>Type</th>
                  <th>Acquisition</th>
                  <th>Market</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr
                    key={row.item.id}
                    className={selectedSlotBag?.id === row.item.id ? "selected-row" : ""}
                    onClick={() => onSelectItem(row.marketItem)}
                  >
                    <td>
                      <span className="table-item-cell">
                        <ItemIcon item={row.item} />
                        <span className="item-copy">
                          <strong>{row.item.name}</strong>
                          <span>{row.item.rarity} slot bag</span>
                        </span>
                      </span>
                    </td>
                    <td>{row.size ? `${row.size}` : "Unknown"}</td>
                    <td>{row.typeLabel}</td>
                    <td>
                      <span className={`source-pill source-${row.acquisition.kind.toLowerCase()}`}>
                        {row.acquisition.kind}
                      </span>
                      <small>{row.acquisition.source}</small>
                    </td>
                    <td>
                      {row.hasMarketPrice ? (
                        <Money value={row.marketItem.price.sells.unit_price || row.marketItem.price.buys.unit_price} />
                      ) : (
                        <span className="muted-copy">Not listed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : slotBagState === "ready" ? (
          <div className="empty-detail inline-empty">
            <Search />
            <h2>No slot bags match</h2>
            <p>Clear the search or size filter to show the full slot bag guide.</p>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <p className="market-list-note">
            {craftedCount.toLocaleString()} bags are classified as crafted or upgraded when no specific reward/vendor source is listed.
          </p>
        ) : null}
      </aside>

      {selectedSlotBag && selectedSlotBagRow ? (
        <section className="detail-panel">
          <ItemDetail
            item={selectedSlotBag}
            catalog={catalog}
            listings={listings}
            itemTransactions={itemTransactions}
            recipes={recipes}
            usedInRecipes={usedInRecipes}
            recipeUsageState={recipeUsageState}
            wikiGuide={wikiGuide}
            detailState={detailState}
            containerAnalysis={containerAnalysis}
            containerState={containerState}
            accountSnapshot={accountSnapshot}
            marketHistoryRevision={marketHistoryRevision}
            onClose={onCloseDetail}
            onOpenDetail={(detailItem) => onSelectItem(buildMarketItemForDetail(detailItem))}
            extraInfo={
              <SlotBagInfoPanel
                item={selectedSlotBag}
                acquisition={selectedSlotBagRow.acquisition}
                typeLabel={selectedSlotBagRow.typeLabel}
                recipes={recipes}
                detailState={detailState}
              />
            }
          />
        </section>
      ) : null}
    </div>
  );
}

function SlotBagInfoPanel({
  item,
  acquisition,
  typeLabel,
  recipes,
  detailState,
}: {
  item: MarketItem;
  acquisition: SlotBagSourceNote;
  typeLabel: string;
  recipes: RecipeGuide[];
  detailState: LoadState;
}) {
  const size = getSlotBagSize(item);
  const hasMarketPrice = item.price.sells.unit_price > 0 || item.price.buys.unit_price > 0;

  return (
    <section className="surface slot-bag-info">
      <div className="section-title">
        <Boxes />
        <h3>Slot Bag Guide</h3>
      </div>
      <div className="slot-bag-facts">
        <span>
          <small>Slots</small>
          <strong>{size ? `${size}` : "Unknown"}</strong>
        </span>
        <span>
          <small>Type</small>
          <strong>{typeLabel}</strong>
        </span>
        <span>
          <small>Acquisition</small>
          <strong>{acquisition.kind}</strong>
        </span>
        <span>
          <small>Trading Post</small>
          <strong>{hasMarketPrice ? "Available" : "Not listed"}</strong>
        </span>
      </div>
      <p>{acquisition.detail}</p>
      {acquisition.cost ? <p className="muted-copy">{acquisition.cost}</p> : null}
      <div className="recipe-source-note">
        <Hammer />
        <span>{getSlotBagRecipeNote(item, acquisition, recipes, detailState)}</span>
      </div>
    </section>
  );
}

function CraftingPlannerPage({
  marketCrafts,
  craftLoadState,
  craftsUpdatedAt,
  selectedItem,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onLoadCrafts,
  onCloseDetail,
  onSelectCraft,
  onSelectItem,
}: {
  catalog: MarketItem[];
  marketCrafts: CraftOpportunity[];
  craftLoadState: LoadState;
  craftsUpdatedAt: number | null;
  selectedItem: MarketItem | null;
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onLoadCrafts: () => Promise<CraftOpportunity[]>;
  onCloseDetail: () => void;
  onSelectCraft: (opportunity: CraftOpportunity) => void;
  onSelectItem: (item: Gw2Item) => void;
}) {
  useEffect(() => {
    if (craftLoadState === "idle") {
      void onLoadCrafts();
    }
  }, [craftLoadState, onLoadCrafts]);

  return (
    <div className={`market-workspace crafting-workspace ${selectedItem ? "" : "detail-closed"}`}>
      <aside className="market-panel craft-table-panel">
        <CraftProfitHeader
          title="Crafting Planner"
          subtitle="Recipe outputs ranked by market buy-input cost and after-fee sell value."
          count={marketCrafts.length}
          updatedAt={craftsUpdatedAt}
          loadState={craftLoadState}
          onLoadCrafts={onLoadCrafts}
        />
        <CraftProfitTable
          opportunities={marketCrafts}
          loadState={craftLoadState}
          compact
          onSelectCraft={onSelectCraft}
        />
      </aside>

      {selectedItem ? (
        <section className="detail-panel">
          <ItemDetail
            item={selectedItem}
            catalog={[]}
            listings={listings}
            itemTransactions={itemTransactions}
            recipes={recipes}
            usedInRecipes={usedInRecipes}
            recipeUsageState={recipeUsageState}
            wikiGuide={wikiGuide}
            detailState={detailState}
            containerAnalysis={containerAnalysis}
            containerState={containerState}
            accountSnapshot={accountSnapshot}
            marketHistoryRevision={marketHistoryRevision}
            onClose={onCloseDetail}
            onOpenDetail={(detailItem) => onSelectItem(buildMarketItemForDetail(detailItem))}
          />
        </section>
      ) : null}
    </div>
  );
}

function ProfitableCraftsPage({
  accountSnapshot,
  marketCrafts,
  craftLoadState,
  craftsUpdatedAt,
  onLoadCrafts,
  onSelectCraft,
}: {
  accountSnapshot: AccountSnapshot | null;
  marketCrafts: CraftOpportunity[];
  craftLoadState: LoadState;
  craftsUpdatedAt: number | null;
  onLoadCrafts: () => Promise<CraftOpportunity[]>;
  onSelectCraft: (opportunity: CraftOpportunity) => void;
}) {
  const now = useRelativeNow();
  const [recipeFilter, setRecipeFilter] = useState<"all" | "unlocked">("all");
  const [selectedCharacterName, setSelectedCharacterName] = useState("all");
  const characters = accountSnapshot?.characters ?? [];
  const accountRecipeIds = useMemo(
    () => new Set(accountSnapshot?.recipes ?? []),
    [accountSnapshot],
  );
  const selectedCharacter = selectedCharacterName === "all"
    ? null
    : characters.find((character) => character.name === selectedCharacterName) ?? null;
  const filteredCrafts = useMemo(
    () =>
      marketCrafts.filter((craft) => {
        if (recipeFilter === "unlocked" && !accountRecipeIds.has(craft.recipe.id)) {
          return false;
        }

        if (selectedCharacter && !canCharacterCraftRecipe(selectedCharacter, craft.recipe)) {
          return false;
        }

        return true;
      }),
    [accountRecipeIds, marketCrafts, recipeFilter, selectedCharacter],
  );
  const topProfit = filteredCrafts[0]?.marketProfit ?? 0;
  const totalListedProfit = filteredCrafts.reduce((sum, craft) => sum + Math.max(0, craft.marketProfit), 0);
  const hiddenCraftCount = Math.max(0, marketCrafts.length - filteredCrafts.length);

  useEffect(() => {
    if (craftLoadState === "idle") {
      void onLoadCrafts();
    }
  }, [craftLoadState, onLoadCrafts]);

  useEffect(() => {
    if (
      selectedCharacterName !== "all" &&
      !characters.some((character) => character.name === selectedCharacterName)
    ) {
      setSelectedCharacterName("all");
    }
  }, [characters, selectedCharacterName]);

  return (
    <div className="focused-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">Market Crafting</span>
          <h2>Profitable Crafts</h2>
          <p>
            Crafts ranked by buying every ingredient from the Trading Post, crafting the output,
            then selling the result after Trading Post fees.
          </p>
        </div>
        <button className="icon-button primary" onClick={() => void onLoadCrafts()}>
          <RefreshCcw />
          <span>{craftLoadState === "loading" ? "Loading" : "Refresh"}</span>
        </button>
      </section>

      <section className="stat-grid">
        <Metric icon={<TrendingUp />} label="Top Profit" value={<Money value={topProfit} />} tone={topProfit > 0 ? "positive" : "muted"} />
        <Metric icon={<Coins />} label="Ranked Profit" value={<Money value={totalListedProfit} />} tone={totalListedProfit > 0 ? "positive" : "muted"} />
        <Metric icon={<Hammer />} label="Crafts Shown" value={filteredCrafts.length.toLocaleString()} />
        <Metric icon={<Database />} label="Updated" value={craftsUpdatedAt ? formatAge(craftsUpdatedAt, now) : "Not loaded"} tone={craftsUpdatedAt ? "default" : "muted"} />
      </section>

      <section className="surface craft-filter-panel">
        <label>
          Recipe availability
          <select
            value={recipeFilter}
            disabled={!accountSnapshot}
            onChange={(event) => setRecipeFilter(event.target.value as "all" | "unlocked")}
          >
            <option value="all">All profitable recipes</option>
            <option value="unlocked">Unlocked on this account</option>
          </select>
        </label>
        <label>
          Character
          <select
            value={selectedCharacterName}
            disabled={!accountSnapshot || characters.length === 0}
            onChange={(event) => setSelectedCharacterName(event.target.value)}
          >
            <option value="all">Any character</option>
            {characters.map((character) => (
              <option key={character.name} value={character.name}>
                {character.name} · {character.profession}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className="eyebrow">Account Filter</span>
          <strong>{accountSnapshot ? `${hiddenCraftCount.toLocaleString()} hidden by filters` : "Load GW2 API to personalize"}</strong>
        </div>
      </section>

      <section className="surface craft-profit-surface">
        <CraftProfitTable
          opportunities={filteredCrafts}
          loadState={craftLoadState}
          onSelectCraft={onSelectCraft}
        />
      </section>
    </div>
  );
}

function canCharacterCraftRecipe(character: AccountCharacter, recipe: RecipeGuide["recipe"]): boolean {
  if (recipe.disciplines.length === 0) {
    return true;
  }

  const characterCrafting = character.crafting ?? [];
  return recipe.disciplines.some((discipline) =>
    characterCrafting.some((crafting) => {
      const disciplineMatches = crafting.discipline.toLowerCase() === discipline.toLowerCase();
      return disciplineMatches && crafting.active !== false && crafting.rating >= recipe.min_rating;
    }),
  );
}

function CraftProfitHeader({
  title,
  subtitle,
  count,
  updatedAt,
  loadState,
  onLoadCrafts,
}: {
  title: string;
  subtitle: string;
  count: number;
  updatedAt: number | null;
  loadState: LoadState;
  onLoadCrafts: () => Promise<CraftOpportunity[]>;
}) {
  const now = useRelativeNow();

  return (
    <div className="panel-heading craft-panel-heading">
      <div>
        <span className="eyebrow">Recipe Profit</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <small>{updatedAt ? `Updated ${formatAge(updatedAt, now)}` : "Uses current market prices when loaded."}</small>
      </div>
      <div className="craft-panel-actions">
        <span className="metric">{count.toLocaleString()}</span>
        <button className="icon-button" onClick={() => void onLoadCrafts()} disabled={loadState === "loading"}>
          <RefreshCcw />
          <span>{loadState === "loading" ? "Loading" : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}

function CraftProfitTable({
  opportunities,
  loadState,
  compact = false,
  onSelectCraft,
}: {
  opportunities: CraftOpportunity[];
  loadState: LoadState;
  compact?: boolean;
  onSelectCraft: (opportunity: CraftOpportunity) => void;
}) {
  if (loadState === "loading" && opportunities.length === 0) {
    return <SkeletonRows />;
  }

  if (loadState !== "loading" && opportunities.length === 0) {
    return (
      <div className="empty-detail inline-empty">
        <Hammer />
        <h2>No craft profits loaded</h2>
        <p>Load recipe profit data to rank crafts by market ingredient cost and sell value.</p>
      </div>
    );
  }

  return (
    <div className="craft-table-wrap">
      <table className="craft-profit-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Profit / Item</th>
            <th>Profit</th>
            <th>Crafting Cost</th>
            <th>Sell Value</th>
            {!compact ? <th>Recipe</th> : null}
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => {
            const quantity = Math.max(1, opportunity.recipe.output_item_count);
            const grossPrice = getStoredPrice(opportunity.output.id)?.sells.unit_price ?? 0;

            return (
              <tr key={`${opportunity.recipe.id}-${opportunity.output.id}`} onClick={() => onSelectCraft(opportunity)}>
                <td>
                  <span className="table-item-cell">
                    <ItemIcon item={opportunity.output} />
                    <span className="item-copy">
                      <strong>{opportunity.output.name}</strong>
                      <span>
                        {opportunity.output.rarity} {opportunity.output.type} · {getRecipeSourceLabel(opportunity.recipe)}
                      </span>
                    </span>
                  </span>
                </td>
                <td>{quantity.toLocaleString()}</td>
                <td className="profit"><Money value={opportunity.marketProfit / quantity} /></td>
                <td className="profit"><Money value={opportunity.marketProfit} /></td>
                <td><Money value={opportunity.marketCost} /></td>
                <td>
                  <Money value={opportunity.outputValue} />
                  <small>gross <Money value={grossPrice * quantity} /></small>
                </td>
                {!compact ? (
                  <td>
                    <span>{getRecipeSourceLabel(opportunity.recipe)}</span>
                    <small>{opportunity.recipe.min_rating ? `Rating ${opportunity.recipe.min_rating}` : opportunity.recipe.sourceName ?? "Recipe"}</small>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
      {loadState === "loading" ? <p className="market-list-note">Refreshing craft profits in the background.</p> : null}
    </div>
  );
}

function LegendaryReadinessPage({
  accountSnapshot,
  analysis,
  analysisState,
  onAnalyze,
}: {
  accountSnapshot: AccountSnapshot | null;
  analysis: AccountAnalysis | null;
  analysisState: LoadState;
  onAnalyze: () => Promise<void>;
}) {
  if (!accountSnapshot) {
    return (
      <div className="focused-page">
        <section className="surface account-required-panel">
          <KeyRound />
          <span className="eyebrow">GW2 API required</span>
          <h2>Legendary Readiness</h2>
          <p>
            This page needs your GW2 API key because legendary readiness depends on your material
            storage, bank, inventory, wallet, unlocked recipes, and account progress. Save a key in
            the sidebar, then analyze the account to rank the quickest legendary routes for you.
          </p>
          <button className="icon-button primary" onClick={() => void onAnalyze()}>
            <TrendingUp />
            <span>{analysisState === "loading" ? "Analyzing" : "Analyze Account"}</span>
          </button>
        </section>
      </div>
    );
  }

  const legendaries = analysis?.legendaries ?? [];

  return (
    <div className="focused-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">Personal Account Scan</span>
          <h2>Legendary Readiness</h2>
          <p>
            Routes ranked for {accountSnapshot.tokenInfo.name} by owned material coverage, recipe
            unlocks, and remaining personal cost.
          </p>
        </div>
        <button className="icon-button primary" onClick={() => void onAnalyze()}>
          <RefreshCcw />
          <span>{analysisState === "loading" ? "Analyzing" : "Refresh Scan"}</span>
        </button>
      </section>

      <section className="surface craft-profit-surface">
        {analysisState === "loading" && legendaries.length === 0 ? <SkeletonRows /> : null}
        {legendaries.length ? (
          <div className="craft-table-wrap">
            <table className="craft-profit-table">
              <thead>
                <tr>
                  <th>Legendary</th>
                  <th>Owned</th>
                  <th>Remaining Personal Cost</th>
                  <th>Market Cost</th>
                  <th>Recipe</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {legendaries.map((entry) => (
                  <tr key={`${entry.recipe.id}-${entry.item.id}`}>
                    <td>
                      <span className="table-item-cell">
                        <ItemIcon item={entry.item} />
                        <span className="item-copy">
                          <strong>{entry.item.name}</strong>
                          <span>{entry.item.type}</span>
                        </span>
                      </span>
                    </td>
                    <td>{Math.round(entry.ownedCoverage * 100)}%</td>
                    <td><Money value={entry.personalCost} /></td>
                    <td><Money value={entry.marketCost} /></td>
                    <td>{entry.recipeUnlocked ? "Unlocked" : "Recipe locked"}</td>
                    <td>
                      {entry.recipeUnlocked && entry.ownedCoverage >= 0.75
                        ? "Quickest"
                        : entry.ownedCoverage >= 0.4
                          ? "Medium"
                          : "Long-term"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : analysisState !== "loading" ? (
          <div className="empty-detail inline-empty">
            <ShieldCheck />
            <h2>No legendary routes ranked yet</h2>
            <p>Refresh the account scan to compare your unlocked recipes and stored materials.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SalvagingPage({
  catalog,
  loadState,
  selectedItem,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onCloseDetail,
  onSelectItem,
  onLoadMarket,
}: {
  catalog: MarketItem[];
  loadState: LoadState;
  selectedItem: MarketItem | null;
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onCloseDetail: () => void;
  onSelectItem: (item: MarketItem) => void;
  onLoadMarket: () => Promise<MarketItem[]>;
}) {
  const salvageRows = useMemo(() => buildSalvageEstimateRows(catalog), [catalog]);
  const outputRows = useMemo(
    () =>
      SALVAGE_OUTPUT_PRICE_NAMES.map((name) => ({
        name,
        quote: getMarketQuoteForName(catalog, name),
      })).filter((row) => row.quote.item || catalog.length === 0),
    [catalog],
  );
  const modeledRows = salvageRows.filter((row) => row.outputs.length > 0);
  const profitableRows = modeledRows.filter((row) => row.buySalvageProfit > 0);
  const topProfit = profitableRows[0]?.buySalvageProfit ?? 0;
  const selectableItemIds = new Set([
    ...salvageRows.map((row) => row.item.id),
    ...outputRows.map((row) => row.quote.item?.id).filter((id): id is number => typeof id === "number"),
  ]);
  const selectedSalvageItem = selectedItem && selectableItemIds.has(selectedItem.id) ? selectedItem : null;

  return (
    <div className={`market-workspace salvaging-workspace ${selectedSalvageItem ? "" : "detail-closed"}`}>
      <aside className="market-panel craft-table-panel">
        <section className="page-header compact-page-header">
          <div>
            <span className="eyebrow">Market Salvage</span>
            <h2>Salvaging</h2>
            <p>
              Salvageable Trading Post items ranked by buy cost, estimated salvage output value, and
              projected profit. Exact non-rare material families need future drop-rate data, so those
              rows stay visible but marked as unmodeled.
            </p>
          </div>
          <button className="icon-button primary" onClick={() => void onLoadMarket()} disabled={loadState === "loading"}>
            {loadState === "loading" ? <Loader2 className="spin" /> : <RefreshCcw />}
            <span>{loadState === "loading" ? "Loading" : catalog.length ? "Refresh Market" : "Load Market"}</span>
          </button>
        </section>

        <section className="stat-grid compact-stat-grid">
          <Metric icon={<Boxes />} label="Candidates" value={salvageRows.length.toLocaleString()} />
          <Metric icon={<Database />} label="Modeled Rows" value={modeledRows.length.toLocaleString()} />
          <Metric icon={<TrendingUp />} label="Profitable" value={profitableRows.length.toLocaleString()} tone={profitableRows.length ? "positive" : "muted"} />
          <Metric icon={<Coins />} label="Top Profit" value={<Money value={topProfit} />} tone={topProfit ? "positive" : "muted"} />
        </section>

        <section className="surface craft-profit-surface">
          <div className="section-title">
            <Coins />
            <h3>Salvage Output Market Prices</h3>
          </div>
          {catalog.length === 0 && loadState !== "loading" ? (
            <div className="empty-detail inline-empty">
              <Database />
              <h2>Market values not loaded</h2>
              <p>Load the Trading Post to price salvage outputs and rank salvage candidates.</p>
              <button className="icon-button primary" onClick={() => void onLoadMarket()}>
                <RefreshCcw />
                <span>Load Market Values</span>
              </button>
            </div>
          ) : loadState === "loading" && catalog.length === 0 ? (
            <SkeletonRows />
          ) : (
            <div className="craft-table-wrap">
              <table className="craft-profit-table compact-value-table">
                <thead>
                  <tr>
                    <th>Output</th>
                    <th>Buy From Market</th>
                    <th>Instant Sell After Fees</th>
                    <th>Supply</th>
                  </tr>
                </thead>
                <tbody>
                  {outputRows.map((row) => (
                    <tr
                      key={row.name}
                      className={selectedSalvageItem?.id === row.quote.item?.id ? "selected-row" : ""}
                      onClick={() => {
                        if (row.quote.item) {
                          onSelectItem(row.quote.item);
                        }
                      }}
                    >
                      <td>
                        <span className="table-item-cell">
                          <ItemIcon item={row.quote.item ?? { name: row.name }} />
                          <span className="item-copy">
                            <strong>{row.quote.item?.name ?? row.name}</strong>
                            <span>{row.quote.item ? `${row.quote.item.rarity} ${row.quote.item.type}` : "Not in loaded market"}</span>
                          </span>
                        </span>
                      </td>
                      <td>{row.quote.buyCost ? <Money value={row.quote.buyCost} /> : "Unavailable"}</td>
                      <td>{row.quote.instantSellNet ? <Money value={row.quote.instantSellNet} /> : "Unavailable"}</td>
                      <td>{row.quote.item?.price.sells.quantity.toLocaleString() ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="surface craft-profit-surface">
          <div className="section-title">
            <Boxes />
            <h3>Salvage Candidates</h3>
          </div>
          {loadState === "loading" && salvageRows.length === 0 ? <SkeletonRows /> : null}
          {salvageRows.length ? (
            <div className="craft-table-wrap">
              <table className="craft-profit-table salvage-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>TP Cost</th>
                    <th>Direct Sale</th>
                    <th>Est. Salvage Value</th>
                    <th>Buy + Salvage Profit</th>
                    <th>Main Outputs</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {salvageRows.map((row) => (
                    <tr
                      key={row.item.id}
                      className={selectedSalvageItem?.id === row.item.id ? "selected-row" : ""}
                      onClick={() => onSelectItem(row.item)}
                    >
                      <td>
                        <span className="table-item-cell">
                          <ItemIcon item={row.item} />
                          <span className="item-copy">
                            <strong>{row.item.name}</strong>
                            <span>{row.item.rarity} {row.item.type}</span>
                          </span>
                        </span>
                      </td>
                      <td><Money value={row.purchaseCost} /></td>
                      <td>{row.directSellNet ? <Money value={row.directSellNet} /> : "No buy orders"}</td>
                      <td>{row.salvageValue ? <Money value={row.salvageValue} /> : "Unmodeled"}</td>
                      <td className={row.buySalvageProfit > 0 ? "profit" : "muted-money"}>
                        {row.outputs.length ? <Money value={Math.abs(row.buySalvageProfit)} /> : "Output data needed"}
                      </td>
                      <td>
                        <SalvageOutputList outputs={row.outputs} catalog={catalog} />
                      </td>
                      <td>
                        <span>{row.note}</span>
                        <small>{row.confidence} - {row.tierLabel} - {row.familyLabel}</small>
                        {row.outputs.length ? (
                          <small>
                            {row.salvageInsteadOfSell >= 0 ? "Salvage beats direct sale by " : "Direct sale beats salvage by "}
                            <Money value={Math.abs(row.salvageInsteadOfSell)} />
                          </small>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salvageRows.length >= SALVAGE_ROW_LIMIT ? (
                <p className="market-list-note">
                  Showing top {SALVAGE_ROW_LIMIT.toLocaleString()} loaded candidates by modeled salvage value and price spread.
                </p>
              ) : null}
            </div>
          ) : loadState !== "loading" ? (
            <div className="empty-detail inline-empty">
              <Boxes />
              <h2>No salvage candidates loaded</h2>
              <p>Load the market to scan tradeable equipment, upgrades, and unidentified gear.</p>
            </div>
          ) : null}
        </section>
      </aside>

      {selectedSalvageItem ? (
        <section className="detail-panel">
          <ItemDetail
            item={selectedSalvageItem}
            catalog={catalog}
            listings={listings}
            itemTransactions={itemTransactions}
            recipes={recipes}
            usedInRecipes={usedInRecipes}
            recipeUsageState={recipeUsageState}
            wikiGuide={wikiGuide}
            detailState={detailState}
            containerAnalysis={containerAnalysis}
            containerState={containerState}
            accountSnapshot={accountSnapshot}
            marketHistoryRevision={marketHistoryRevision}
            onClose={onCloseDetail}
            onOpenDetail={(detailItem) => onSelectItem(buildMarketItemForDetail(detailItem))}
          />
        </section>
      ) : null}
    </div>
  );
}

function UnidentifiedGearPage({
  catalog,
  loadState,
  selectedItem,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onCloseDetail,
  onSelectItem,
  onLoadMarket,
}: {
  catalog: MarketItem[];
  loadState: LoadState;
  selectedItem: MarketItem | null;
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onCloseDetail: () => void;
  onSelectItem: (item: MarketItem) => void;
  onLoadMarket: () => Promise<MarketItem[]>;
}) {
  const [resolvedGearItems, setResolvedGearItems] = useState<Map<number, Gw2Item>>(new Map());

  useEffect(() => {
    let ignore = false;
    const ids = UNIDENTIFIED_GEAR_DEFINITIONS.map((definition) => definition.itemId);

    loadItems(ids)
      .then((items) => {
        if (ignore) {
          return;
        }

        setResolvedGearItems(new Map(items.map((item) => [item.id, item])));
      })
      .catch((error) => {
        console.warn("Unable to resolve unidentified gear items", error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const rows = useMemo(
    () =>
      UNIDENTIFIED_GEAR_DEFINITIONS.map((definition) => {
        const quote = getMarketQuoteForId(catalog, definition.itemId, definition.aliases);
        const resolvedItem = resolvedGearItems.get(definition.itemId) ?? getStoredItem(definition.itemId);
        const detailItem = quote.item ?? (resolvedItem ? buildMarketItemForDetail(resolvedItem) : null);
        const revenue = estimateSalvageOutputValue(definition.outputs, catalog);
        const directSale = quote.instantSellNet || quote.listedSellNet;

        return {
          definition,
          quote,
          detailItem,
          directSale,
          openSalvageRevenue: revenue,
          buyOpenSalvageProfit: revenue - quote.buyCost,
        };
      }),
    [catalog, resolvedGearItems],
  );
  const modeledRows = rows.filter((row) => row.definition.outputs.length > 0 && row.openSalvageRevenue > 0);
  const bestModeledProfit = Math.max(0, ...modeledRows.map((row) => row.buyOpenSalvageProfit));
  const selectedGearItemIds = new Set(rows.map((row) => row.detailItem?.id).filter((id): id is number => typeof id === "number"));
  const selectedGearItem = selectedItem && selectedGearItemIds.has(selectedItem.id) ? selectedItem : null;

  return (
    <div className={`market-workspace unidentified-workspace ${selectedGearItem ? "" : "detail-closed"}`}>
      <aside className="market-panel craft-table-panel">
        <section className="page-header compact-page-header">
          <div>
            <span className="eyebrow">Open or Sell</span>
            <h2>Unidentified Gear</h2>
            <p>Select a gear tier to inspect possible contents, market value, and salvage estimates.</p>
          </div>
          <button className="icon-button primary" onClick={() => void onLoadMarket()} disabled={loadState === "loading"}>
            {loadState === "loading" ? <Loader2 className="spin" /> : <RefreshCcw />}
            <span>{loadState === "loading" ? "Loading" : catalog.length ? "Refresh" : "Load"}</span>
          </button>
        </section>

        <section className="stat-grid compact-stat-grid">
          <Metric icon={<PackageSearch />} label="Gear Types" value={UNIDENTIFIED_GEAR_DEFINITIONS.length.toLocaleString()} />
          <Metric icon={<Database />} label="Market Matches" value={rows.filter((row) => row.quote.item).length.toLocaleString()} />
          <Metric icon={<Coins />} label="Best Profit" value={<Money value={bestModeledProfit} />} tone={bestModeledProfit ? "positive" : "muted"} />
        </section>

        {loadState === "loading" && catalog.length === 0 ? (
          <SkeletonRows />
        ) : catalog.length === 0 ? (
          <div className="empty-detail inline-empty">
            <PackageSearch />
            <h2>Market values not loaded</h2>
            <p>Load the Trading Post to price unidentified gear.</p>
            <button className="icon-button primary" onClick={() => void onLoadMarket()}>
              <RefreshCcw />
              <span>Load Market Values</span>
            </button>
          </div>
        ) : (
          <div className="craft-table-wrap">
            <table className="craft-profit-table unidentified-table compact-unidentified-table">
              <thead>
                <tr>
                  <th>Gear</th>
                  <th>Market Cost</th>
                  <th>Direct Sale</th>
                  <th>Est. Open + Salvage</th>
                  <th>Profit</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.definition.tier}
                    className={selectedGearItem?.id === row.detailItem?.id ? "selected-row" : ""}
                    onClick={() => {
                      if (row.detailItem) {
                        onSelectItem(row.detailItem);
                      }
                    }}
                  >
                    <td>
                      <span className="table-item-cell">
                        <ItemIcon item={row.detailItem ?? { name: row.definition.label }} />
                        <span className="item-copy">
                          <strong>{row.detailItem?.name ?? row.definition.label}</strong>
                          <span>{row.definition.tier} unidentified gear</span>
                        </span>
                      </span>
                    </td>
                    <td>{row.quote.buyCost ? <Money value={row.quote.buyCost} /> : "Unavailable"}</td>
                    <td>{row.directSale ? <Money value={row.directSale} /> : "Unavailable"}</td>
                    <td>{row.openSalvageRevenue ? <Money value={row.openSalvageRevenue} /> : "Drop data needed"}</td>
                    <td className={row.buyOpenSalvageProfit > 0 ? "profit" : "muted-money"}>
                      {row.openSalvageRevenue ? <Money value={Math.abs(row.buyOpenSalvageProfit)} /> : "Unmodeled"}
                    </td>
                    <td>{row.definition.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </aside>

      {selectedGearItem ? (
        <section className="detail-panel">
          <ItemDetail
            item={selectedGearItem}
            catalog={catalog}
            listings={listings}
            itemTransactions={itemTransactions}
            recipes={recipes}
            usedInRecipes={usedInRecipes}
            recipeUsageState={recipeUsageState}
            wikiGuide={wikiGuide}
            detailState={detailState}
            containerAnalysis={containerAnalysis}
            containerState={containerState}
            accountSnapshot={accountSnapshot}
            marketHistoryRevision={marketHistoryRevision}
            onClose={onCloseDetail}
            onOpenDetail={(detailItem) => onSelectItem(buildMarketItemForDetail(detailItem))}
          />
        </section>
      ) : null}
    </div>
  );
}

type GatheringFilter = "all" | GatheringDiscipline;

interface GatheringRow {
  source: GatherableItemSource;
  marketItem: MarketItem;
  purchasePrice: number;
  salePrice: number;
  difference: number;
  estimatedGatherValue: number;
  permanentNodeCount: number;
  permanentNodeValue: number;
}

function getGatheringYieldUnitValue(
  yieldInfo: GatheringNodeYield,
  catalogById: Map<number, MarketItem>,
): number {
  if (typeof yieldInfo.itemId !== "number") {
    return 0;
  }

  const marketItem = catalogById.get(yieldInfo.itemId);
  if (marketItem) {
    return marketItem.netSellPrice || Math.floor((marketItem.price.buys.unit_price || 0) * 0.85);
  }

  const price = getStoredPrice(yieldInfo.itemId);
  return Math.floor((price?.buys.unit_price || price?.sells.unit_price || 0) * 0.85);
}

function getGatheringYieldValue(
  source: GatherableItemSource,
  catalogById: Map<number, MarketItem>,
): number {
  const yields = [...(source.mainYields ?? []), ...(source.extraYields ?? [])];
  const pricedValue = yields.reduce((sum, yieldInfo) => sum + getGatheringYieldUnitValue(yieldInfo, catalogById), 0);
  if (pricedValue > 0) {
    return pricedValue;
  }

  const fallbackPrice = getStoredPrice(source.item.id);
  return Math.floor((fallbackPrice?.buys.unit_price || fallbackPrice?.sells.unit_price || 0) * 0.85);
}

function getPermanentGatheringDropValue(
  drop: PermanentGatheringNode["items"][number],
  catalogById: Map<number, MarketItem>,
): number {
  const marketItem = catalogById.get(drop.id);
  if (marketItem) {
    return marketItem.netSellPrice || Math.floor((marketItem.price.buys.unit_price || 0) * 0.85);
  }

  const price = getStoredPrice(drop.id);
  return Math.floor((price?.buys.unit_price || price?.sells.unit_price || 0) * 0.85);
}

function getPermanentGatheringNodeValue(
  node: PermanentGatheringNode,
  catalogById: Map<number, MarketItem>,
): number {
  return node.items.reduce((sum, drop) => sum + getPermanentGatheringDropValue(drop, catalogById) * drop.quantity, 0);
}

function formatGatheringChance(chance: GatheringNodeYield["chance"]) {
  switch (chance) {
    case "guaranteed":
      return "Guaranteed";
    case "low_chance":
      return "Low chance";
    case "rare":
      return "Rare";
    case "chance":
      return "Chance";
    default:
      return "Unknown";
  }
}

function getGatheringYieldNames(yields: GatheringNodeYield[], limit = 3) {
  const names = Array.from(new Set(yields.map((yieldInfo) => yieldInfo.itemName).filter(Boolean)));
  return names.length > limit ? `${names.slice(0, limit).join(", ")} +${names.length - limit}` : names.join(", ");
}

function GatheringPage({
  catalog,
  selectedItem,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onProgress,
  onCloseDetail,
  onSelectItem,
}: {
  catalog: MarketItem[];
  selectedItem: MarketItem | null;
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onProgress: (message: string, done?: number, total?: number) => void;
  onCloseDetail: () => void;
  onSelectItem: (item: MarketItem) => void;
}) {
  const [sources, setSources] = useState<GatherableItemSource[]>([]);
  const [permanentNodes, setPermanentNodes] = useState<PermanentGatheringNode[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [query, setQuery] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<GatheringFilter>("all");
  const [locationInfo, setLocationInfo] = useState<GatheringLocationInfo | null>(null);
  const [locationState, setLocationState] = useState<LoadState>("idle");
  const catalogById = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );
  const permanentNodesByItemId = useMemo(() => {
    const grouped = new Map<number, PermanentGatheringNode[]>();
    for (const node of permanentNodes) {
      for (const drop of node.items) {
        const list = grouped.get(drop.id) ?? [];
        list.push(node);
        grouped.set(drop.id, list);
      }
    }
    return grouped;
  }, [permanentNodes]);
  const rows = useMemo<GatheringRow[]>(() => {
    return sources.map((source) => {
      const marketItem =
        catalogById.get(source.item.id) ??
        buildMarketItemFromStoredPrice(source.item) ??
        buildMarketItemForDetail(source.item);
      const purchasePrice = marketItem.price.sells.unit_price;
      const salePrice = marketItem.price.buys.unit_price;
      const matchingPermanentNodes = permanentNodesByItemId.get(source.item.id) ?? [];

      return {
        source,
        marketItem,
        purchasePrice,
        salePrice,
        difference: Math.max(0, purchasePrice - salePrice),
        estimatedGatherValue: getGatheringYieldValue(source, catalogById),
        permanentNodeCount: matchingPermanentNodes.length,
        permanentNodeValue: matchingPermanentNodes.reduce(
          (sum, node) => sum + getPermanentGatheringNodeValue(node, catalogById),
          0,
        ),
      };
    });
  }, [catalogById, permanentNodesByItemId, sources]);
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (disciplineFilter !== "all" && row.source.discipline !== disciplineFilter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return (
        row.marketItem.name.toLowerCase().includes(normalized) ||
        row.source.discipline.toLowerCase().includes(normalized) ||
        row.source.tool.toLowerCase().includes(normalized) ||
        row.source.nodes.some((node) => node.toLowerCase().includes(normalized)) ||
        (row.source.mainYields ?? []).some((yieldInfo) => yieldInfo.itemName.toLowerCase().includes(normalized)) ||
        (row.source.extraYields ?? []).some((yieldInfo) => yieldInfo.itemName.toLowerCase().includes(normalized))
      );
    });
  }, [disciplineFilter, query, rows]);
  const selectedGatheringRow =
    filteredRows.find((row) => row.marketItem.id === selectedItem?.id) ??
    rows.find((row) => row.marketItem.id === selectedItem?.id) ??
    null;
  const selectedGatheringItem = selectedGatheringRow ? selectedItem : null;
  const tradeableCount = rows.filter((row) => row.purchasePrice > 0 || row.salePrice > 0).length;
  const highestPurchase = Math.max(0, ...rows.map((row) => row.purchasePrice));
  const disciplineCounts = useMemo(() => {
    return rows.reduce<Record<GatheringDiscipline, number>>(
      (counts, row) => {
        counts[row.source.discipline] += 1;
        return counts;
      },
      { Harvesting: 0, Logging: 0, Mining: 0 },
    );
  }, [rows]);

  useEffect(() => {
    if (loadState !== "idle") {
      return;
    }

    let ignore = false;
    setLoadState("loading");
    loadGatherableItems(onProgress)
      .then((items) => {
        if (ignore) {
          return;
        }

        setSources(items);
        setLoadState("ready");
        onProgress(`${items.length.toLocaleString()} gatherable items loaded`);
      })
      .catch((loadError) => {
        if (ignore) {
          return;
        }

        setLoadState("error");
        onProgress(loadError instanceof Error ? loadError.message : "Gathering index failed");
      });

    return () => {
      ignore = true;
    };
  }, [loadState, onProgress]);

  useEffect(() => {
    let ignore = false;
    loadPermanentGatheringNodes(onProgress)
      .then((nodes) => {
        if (ignore) {
          return;
        }

        setPermanentNodes(nodes);
      })
      .catch((error) => {
        onProgress(error instanceof Error ? error.message : "Permanent gathering routes failed");
      });

    return () => {
      ignore = true;
    };
  }, [onProgress]);

  useEffect(() => {
    if (!selectedGatheringRow) {
      setLocationInfo(null);
      setLocationState("idle");
      return;
    }

    let ignore = false;
    setLocationInfo(null);
    setLocationState("loading");
    loadGatheringLocations(selectedGatheringRow.marketItem.name, selectedGatheringRow.source.nodes)
      .then((info) => {
        if (ignore) {
          return;
        }

        setLocationInfo(info);
        setLocationState("ready");
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        setLocationState("error");
      });

    return () => {
      ignore = true;
    };
  }, [selectedGatheringRow?.marketItem.id]);

  return (
    <div className={`market-workspace gathering-workspace ${selectedGatheringItem ? "" : "detail-closed"}`}>
      <aside className="market-panel craft-table-panel">
        <section className="page-header compact-page-header">
          <div>
            <span className="eyebrow">Open World Gathering</span>
            <h2>Gathering</h2>
            <p>Gatherable materials grouped by harvesting, logging, and mining tools with live Trading Post values.</p>
          </div>
        </section>

        <section className="stat-grid compact-stat-grid">
          <Metric icon={<Database />} label="Gatherables" value={rows.length.toLocaleString()} />
          <Metric icon={<PackageSearch />} label="Tradeable" value={tradeableCount.toLocaleString()} tone={tradeableCount ? "positive" : "muted"} />
          <Metric icon={<Coins />} label="Highest Purchase" value={<Money value={highestPurchase} />} tone={highestPurchase ? "positive" : "muted"} />
        </section>

        <div className="slot-bag-toolbar">
          <label className="search-box">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item, tool, node, map"
            />
          </label>
          <select
            value={disciplineFilter}
            onChange={(event) => setDisciplineFilter(event.target.value as GatheringFilter)}
            aria-label="Filter by gathering discipline"
          >
            <option value="all">All gathering</option>
            <option value="Harvesting">Harvesting ({disciplineCounts.Harvesting})</option>
            <option value="Logging">Logging ({disciplineCounts.Logging})</option>
            <option value="Mining">Mining ({disciplineCounts.Mining})</option>
          </select>
        </div>

        {loadState === "loading" && rows.length === 0 ? <SkeletonRows /> : null}
        {loadState === "error" ? (
          <div className="empty-detail inline-empty">
            <AlertCircle />
            <h2>Gathering data could not be loaded</h2>
            <p>The app could not reach the GW2 Wiki gathering index. Try reopening this page once the wiki is reachable.</p>
          </div>
        ) : null}

        {filteredRows.length > 0 ? (
          <div className="craft-table-wrap">
            <table className="craft-profit-table gathering-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Profession</th>
                  <th>Tool</th>
                  <th>Permanent spots</th>
                  <th>Nodes</th>
                  <th>Extra yields</th>
                  <th>Est. value</th>
                  <th>Purchase</th>
                  <th>Sale</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={row.marketItem.id}
                    className={selectedGatheringItem?.id === row.marketItem.id ? "selected-row" : ""}
                    onClick={() => onSelectItem(row.marketItem)}
                  >
                    <td>
                      <span className="table-item-cell">
                        <ItemIcon item={row.marketItem} />
                        <span className="item-copy">
                          <strong>{row.marketItem.name}</strong>
                          <span>{row.source.nodes.slice(0, 2).join(", ")}{row.source.nodes.length > 2 ? ` +${row.source.nodes.length - 2}` : ""}</span>
                        </span>
                      </span>
                    </td>
                    <td>{row.source.discipline}</td>
                    <td>
                      {row.source.tool}
                      {row.source.toolTier ? <small>{row.source.toolTier} tier</small> : null}
                    </td>
                    <td>
                      {row.permanentNodeCount ? (
                        <span className="market-value-note">
                          <strong>{row.permanentNodeCount.toLocaleString()}</strong>
                          {row.permanentNodeValue ? <small><Money value={row.permanentNodeValue} /> total</small> : null}
                        </span>
                      ) : (
                        <span className="muted-copy">None listed</span>
                      )}
                    </td>
                    <td>{row.source.nodes.length.toLocaleString()}</td>
                    <td>
                      {row.source.extraYields?.length
                        ? getGatheringYieldNames(row.source.extraYields)
                        : <span className="muted-copy">None listed</span>}
                    </td>
                    <td>{row.estimatedGatherValue ? <Money value={row.estimatedGatherValue} /> : "Unpriced"}</td>
                    <td>{row.purchasePrice ? <Money value={row.purchasePrice} /> : "Unavailable"}</td>
                    <td>{row.salePrice ? <Money value={row.salePrice} /> : "Unavailable"}</td>
                    <td className={row.difference > 0 ? "muted-money" : "profit"}>
                      <Money value={row.difference} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : loadState === "ready" ? (
          <div className="empty-detail inline-empty">
            <Search />
            <h2>No gatherables match</h2>
            <p>Clear the search or profession filter to show the full gathering list.</p>
          </div>
        ) : null}
      </aside>

      {selectedGatheringItem && selectedGatheringRow ? (
        <section className="detail-panel">
          <ItemDetail
            item={selectedGatheringItem}
            catalog={catalog}
            listings={listings}
            itemTransactions={itemTransactions}
            recipes={recipes}
            usedInRecipes={usedInRecipes}
            recipeUsageState={recipeUsageState}
            wikiGuide={wikiGuide}
            detailState={detailState}
            containerAnalysis={containerAnalysis}
            containerState={containerState}
            accountSnapshot={accountSnapshot}
            marketHistoryRevision={marketHistoryRevision}
            onClose={onCloseDetail}
            onOpenDetail={(detailItem) => onSelectItem(buildMarketItemForDetail(detailItem))}
            extraInfo={
              <GatheringSourcePanel
                source={selectedGatheringRow.source}
                locationInfo={locationInfo}
                locationState={locationState}
                catalogById={catalogById}
                permanentNodes={permanentNodesByItemId.get(selectedGatheringRow.source.item.id) ?? []}
              />
            }
          />
        </section>
      ) : null}
    </div>
  );
}

function GatheringSourcePanel({
  source,
  locationInfo,
  locationState,
  catalogById,
  permanentNodes,
}: {
  source: GatherableItemSource;
  locationInfo: GatheringLocationInfo | null;
  locationState: LoadState;
  catalogById: Map<number, MarketItem>;
  permanentNodes: PermanentGatheringNode[];
}) {
  return (
    <section className="surface gathering-source-panel">
      <div className="section-title">
        <Database />
        <h3>Gathering Sources</h3>
      </div>
      <div className="slot-bag-facts gathering-facts">
        <span>
          <small>Profession</small>
          <strong>{source.discipline}</strong>
        </span>
        <span>
          <small>Required tool</small>
          <strong>{source.tool}</strong>
        </span>
        <span>
          <small>Tool tier</small>
          <strong>{source.toolTier ?? "Any valid tier"}</strong>
        </span>
        <span>
          <small>Nodes</small>
          <strong>{source.nodes.length.toLocaleString()}</strong>
        </span>
      </div>

      <GatheringYieldBlock
        title="Main yields"
        yields={source.mainYields?.length ? source.mainYields : [{ itemName: source.item.name, itemId: source.item.id, chance: "guaranteed" }]}
        catalogById={catalogById}
      />
      <GatheringYieldBlock
        title="Extra possible yields"
        yields={source.extraYields ?? []}
        catalogById={catalogById}
        emptyText="The Wiki does not list extra yields for this source."
      />

      <PermanentGatheringNodeBlock
        nodes={permanentNodes}
        catalogById={catalogById}
      />

      {locationState === "loading" ? <SkeletonRows /> : null}
      {locationInfo && locationState === "ready" ? (
        <>
          <div className="gathering-map-list">
            <h4>Maps</h4>
            {locationInfo.maps.length > 0 ? (
              <div className="map-chip-list">
                {locationInfo.maps.map((map) => (
                  <span key={map} className="map-chip">{map}</span>
                ))}
              </div>
            ) : (
              <p className="muted-copy">No structured map list was found on the parsed node pages.</p>
            )}
          </div>

          <details className="recipe-collapsible">
            <summary>
              <span>Node pages</span>
              <strong>{locationInfo.nodes.length.toLocaleString()}</strong>
            </summary>
            <div className="node-source-list">
              {locationInfo.nodes.map((node) => (
                <article key={node.name}>
                  <strong>{node.name}</strong>
                  <p>{node.maps.length ? node.maps.join(", ") : "Map list not structured on wiki."}</p>
                  {node.results?.length ? (
                    <GatheringYieldBlock
                      title="Gathering results"
                      yields={node.results}
                      catalogById={catalogById}
                      compact
                    />
                  ) : null}
                  {node.url ? (
                    <a href={node.url} target="_blank" rel="noreferrer">
                      Open wiki node
                      <ExternalLink />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </details>

          <a className="inline-link" href={locationInfo.sourceUrl} target="_blank" rel="noreferrer">
            Open wiki item
            <ExternalLink />
          </a>
        </>
      ) : null}
      {locationState === "error" ? (
        <p className="muted-copy">Map locations could not be parsed from the wiki node pages right now.</p>
      ) : null}
    </section>
  );
}

function PermanentGatheringNodeBlock({
  nodes,
  catalogById,
}: {
  nodes: PermanentGatheringNode[];
  catalogById: Map<number, MarketItem>;
}) {
  const [expandedNode, setExpandedNode] = useState<PermanentGatheringNode | null>(null);
  const orderedNodes = useMemo(
    () => nodes.slice().sort((left, right) => left.optimal - right.optimal),
    [nodes],
  );

  if (orderedNodes.length === 0) {
    return (
      <div className="gathering-yield-block">
        <h4>Permanent nodes</h4>
        <p className="muted-copy">No permanent gw2efficiency route nodes are listed for this material.</p>
      </div>
    );
  }

  return (
    <div className="gathering-yield-block permanent-node-block">
      <h4>Permanent nodes</h4>
      <div className="permanent-node-list">
        {orderedNodes.map((node) => {
          const nodeValue = getPermanentGatheringNodeValue(node, catalogById);
          return (
            <article key={node.id} className="permanent-node-card">
              <button
                type="button"
                className="permanent-node-image"
                onClick={() => setExpandedNode(node)}
                aria-label={`Expand ${node.materialName} route image`}
              >
                <img src={node.imageUrl} alt="" loading="lazy" />
              </button>
              <div className="permanent-node-content">
                <div>
                  <strong>{node.materialName}</strong>
                  <span>{node.area}, {node.zone}</span>
                </div>
                <div className="permanent-node-meta">
                  {nodeValue ? <Money value={nodeValue} /> : <span className="muted-copy">Unpriced</span>}
                  {node.waypointCode ? <code>{node.waypointCode}</code> : null}
                </div>
                <p>{node.waypointName ? `${node.waypointName}. ` : ""}Permanent route spot from gw2efficiency.</p>
                <div className="permanent-node-drops">
                  {node.items.map((drop) => (
                    <span key={`${node.id}-${drop.id}`}>
                      {drop.item ? <ItemIcon item={drop.item} /> : null}
                      <span>{drop.quantity}x {drop.item?.name ?? `Item ${drop.id}`}</span>
                    </span>
                  ))}
                </div>
                <div className="permanent-node-links">
                  <a href={node.sourceUrl} target="_blank" rel="noreferrer">
                    Open route source
                    <ExternalLink />
                  </a>
                  {node.videoGuide ? (
                    <a href={`https://www.youtube.com/watch?v=${node.videoGuide}`} target="_blank" rel="noreferrer">
                      Video guide
                      <ExternalLink />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {expandedNode ? (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`${expandedNode.materialName} route image`}>
          <button type="button" className="image-lightbox-backdrop" onClick={() => setExpandedNode(null)} aria-label="Close expanded route image" />
          <div className="image-lightbox-content">
            <button type="button" className="icon-button close-button" onClick={() => setExpandedNode(null)} aria-label="Close expanded route image">
              <X />
            </button>
            <img src={expandedNode.imageUrl} alt="" />
            <div>
              <strong>{expandedNode.materialName}</strong>
              <span>{expandedNode.area}, {expandedNode.zone}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GatheringYieldBlock({
  title,
  yields,
  catalogById,
  emptyText = "No structured yields were found.",
  compact = false,
}: {
  title: string;
  yields: GatheringNodeYield[];
  catalogById: Map<number, MarketItem>;
  emptyText?: string;
  compact?: boolean;
}) {
  return (
    <div className={`gathering-yield-block ${compact ? "compact" : ""}`}>
      <h4>{title}</h4>
      {yields.length > 0 ? (
        <div className="gathering-yield-list">
          {yields.map((yieldInfo) => {
            const value = getGatheringYieldUnitValue(yieldInfo, catalogById);
            return (
              <span key={`${yieldInfo.itemName}-${yieldInfo.chance}-${yieldInfo.quantity ?? ""}-${yieldInfo.note ?? ""}`}>
                <strong>{yieldInfo.itemName}</strong>
                <small>
                  {yieldInfo.quantity ? `${yieldInfo.quantity} · ` : ""}
                  {formatGatheringChance(yieldInfo.chance)}
                  {value ? <> · <Money value={value} /></> : null}
                </small>
                {yieldInfo.note ? <em>{yieldInfo.note}</em> : null}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="muted-copy">{emptyText}</p>
      )}
    </div>
  );
}

function SalvageOutputList({
  outputs,
  catalog,
}: {
  outputs: SalvageOutputEstimate[];
  catalog: MarketItem[];
}) {
  if (outputs.length === 0) {
    return <span className="muted-copy">No modeled market output yet</span>;
  }

  return (
    <span className="output-list">
      {outputs.map((output) => {
        const quote = getMarketQuoteForName(catalog, output.name);
        const unitValue = quote.instantSellNet || quote.listedSellNet;

        return (
          <span key={output.name}>
            {formatAverageCount(output.averageCount)}x {quote.item?.name ?? output.name}
            {unitValue ? <small><Money value={unitValue} /> each</small> : null}
          </span>
        );
      })}
    </span>
  );
}

function SalvageProfilePanel({
  item,
  profile,
  catalog,
}: {
  item: MarketItem;
  profile: SalvageProfile;
  catalog: MarketItem[];
}) {
  const salvageValue = estimateSalvageOutputValue(profile.outputs, catalog);
  const directSellNet = item.price.buys.unit_price ? Math.floor(item.price.buys.unit_price * 0.85) : item.netSellPrice;
  const delta = salvageValue - directSellNet;

  return (
    <section className="surface salvage-profile-section">
      <div className="section-title">
        <Boxes />
        <h3>Estimated Salvage Outputs</h3>
      </div>
      <div className="salvage-profile-summary">
        <Metric icon={<Database />} label="Confidence" value={profile.confidence} tone={profile.confidence === "Unmodeled" ? "muted" : "positive"} />
        <Metric icon={<PackageSearch />} label="Tier" value={profile.tierLabel} />
        <Metric icon={<Boxes />} label="Family" value={profile.familyLabel} />
        <Metric icon={<Coins />} label="Est. Value" value={salvageValue ? <Money value={salvageValue} /> : "Unpriced"} tone={salvageValue ? "positive" : "muted"} />
      </div>
      <p className="muted-copy">{profile.note}</p>
      {profile.outputs.length ? (
        <>
          <div className="craft-table-wrap">
            <table className="craft-profit-table salvage-profile-table">
              <thead>
                <tr>
                  <th>Possible Output</th>
                  <th>Average</th>
                  <th>Market Value</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {profile.outputs.map((output) => {
                  const quote = getMarketQuoteForName(catalog, output.name);
                  const unitValue = quote.instantSellNet || quote.listedSellNet;

                  return (
                    <tr key={output.name}>
                      <td>
                        <span className="table-item-cell">
                          <ItemIcon item={quote.item ?? { name: output.name }} />
                          <span className="item-copy">
                            <strong>{quote.item?.name ?? output.name}</strong>
                            <span>{quote.item ? `${quote.item.rarity} ${quote.item.type}` : "Not in loaded market"}</span>
                          </span>
                        </span>
                      </td>
                      <td>{formatAverageCount(output.averageCount)}x</td>
                      <td>{unitValue ? <Money value={Math.round(unitValue * output.averageCount)} /> : "Unavailable"}</td>
                      <td>{output.note ?? "Estimated salvage output"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {directSellNet || salvageValue ? (
            <p className="market-list-note">
              {delta >= 0 ? "Estimated salvage value beats direct sale by " : "Direct sale beats estimated salvage by "}
              <Money value={Math.abs(delta)} />.
            </p>
          ) : null}
        </>
      ) : (
        <p className="muted-copy">No output list is modeled for this item yet.</p>
      )}
    </section>
  );
}

function BuildLibraryPage() {
  const [profession, setProfession] = useState("Any");
  const [mode, setMode] = useState("Any");
  const professions = ["Any", ...Array.from(new Set(BUILD_SOURCES.map((source) => source.profession))).filter((item) => item !== "Any")];
  const modes = ["Any", ...Array.from(new Set(BUILD_SOURCES.map((source) => source.mode)))];
  const filteredSources = BUILD_SOURCES.filter((source) => {
    const professionMatches = profession === "Any" || source.profession === profession || source.profession === "Any";
    const modeMatches = mode === "Any" || source.mode === mode;
    return professionMatches && modeMatches;
  });

  return (
    <div className="focused-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">External Build Sources</span>
          <h2>Farming Builds</h2>
          <p>
            Build sites do not expose a stable public build API, so the app links curated public
            pages and keeps the build data source visible.
          </p>
        </div>
      </section>

      <section className="surface build-filter-panel">
        <label>
          Profession
          <select value={profession} onChange={(event) => setProfession(event.target.value)}>
            {professions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Mode
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            {modes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="surface build-source-grid">
        {filteredSources.map((source) => (
          <a
            key={`${source.source}-${source.profession}-${source.mode}-${source.title}`}
            className="build-source-card"
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="eyebrow">{source.source} · {source.mode}</span>
            <strong>{source.title}</strong>
            <span>{source.profession} · {source.role}</span>
            <p>{source.note}</p>
            <small>Open source page <ExternalLink /></small>
          </a>
        ))}
      </section>
    </div>
  );
}

function FarmingCalculatorPage({
  highValueCrafts,
  highValueCraftLoadState,
  highValueCraftsUpdatedAt,
  onLoadHighValueCrafts,
  onSelectCraft,
}: {
  highValueCrafts: CraftOpportunity[];
  highValueCraftLoadState: LoadState;
  highValueCraftsUpdatedAt: number | null;
  onLoadHighValueCrafts: () => Promise<CraftOpportunity[]>;
  onSelectCraft: (opportunity: CraftOpportunity) => void;
}) {
  const now = useRelativeNow();

  useEffect(() => {
    if (highValueCraftLoadState === "idle") {
      void onLoadHighValueCrafts();
    }
  }, [highValueCraftLoadState, onLoadHighValueCrafts]);

  const highestValueCrafts = useMemo(
    () =>
      [...highValueCrafts]
        .sort((left, right) => right.outputValue - left.outputValue)
        .slice(0, 80),
    [highValueCrafts],
  );
  const topValue = highestValueCrafts[0]?.outputValue ?? 0;
  const mysticForgeCount = highestValueCrafts.filter((craft) => isMysticForgeCraft(craft)).length;

  return (
    <div className="focused-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">Crafted Sell Value</span>
          <h2>Farming Calculator</h2>
          <p>
            Most expensive sellable crafted outputs ranked by current market value, including
            profession recipes and Mystic Forge-style special recipes when the API marks them that way.
          </p>
        </div>
        <button className="icon-button primary" onClick={() => void onLoadHighValueCrafts()} disabled={highValueCraftLoadState === "loading"}>
          {highValueCraftLoadState === "loading" ? <Loader2 className="spin" /> : <RefreshCcw />}
          <span>{highValueCraftLoadState === "loading" ? "Loading" : "Refresh"}</span>
        </button>
      </section>

      <section className="stat-grid">
        <Metric icon={<Coins />} label="Highest Output" value={<Money value={topValue} />} tone={topValue ? "positive" : "muted"} />
        <Metric icon={<Hammer />} label="Crafts Ranked" value={highestValueCrafts.length.toLocaleString()} />
        <Metric icon={<Database />} label="Special Recipes" value={mysticForgeCount.toLocaleString()} />
        <Metric icon={<RefreshCcw />} label="Updated" value={highValueCraftsUpdatedAt ? formatAge(highValueCraftsUpdatedAt, now) : "Not loaded"} tone={highValueCraftsUpdatedAt ? "default" : "muted"} />
      </section>

      <section className="surface craft-profit-surface">
        {highValueCraftLoadState === "loading" && highestValueCrafts.length === 0 ? <SkeletonRows /> : null}
        {highestValueCrafts.length ? (
          <div className="craft-table-wrap">
            <table className="craft-profit-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Sell Value</th>
                  <th>Crafting Cost</th>
                  <th>Profit</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {highestValueCrafts.map((craft) => (
                  <tr key={`${craft.recipe.id}-${craft.output.id}`} onClick={() => onSelectCraft(craft)}>
                    <td>
                      <span className="table-item-cell">
                        <ItemIcon item={craft.output} />
                        <span className="item-copy">
                          <strong>{craft.output.name}</strong>
                          <span>{craft.output.rarity} {craft.output.type}</span>
                        </span>
                      </span>
                    </td>
                    <td>{craft.recipe.output_item_count.toLocaleString()}</td>
                    <td><Money value={craft.outputValue} /></td>
                    <td>{craft.marketCost > 0 ? <Money value={craft.marketCost} /> : "Unknown"}</td>
                    <td className={craft.marketProfit > 0 ? "profit" : "muted-money"}>
                      {craft.marketCost > 0 ? <Money value={Math.abs(craft.marketProfit)} /> : "Cost needed"}
                    </td>
                    <td>
                      <span>{isMysticForgeCraft(craft) ? "Mystic Forge / special" : craft.recipe.disciplines.join(", ") || "Recipe"}</span>
                      <small>Rating {craft.recipe.min_rating}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : highValueCraftLoadState !== "loading" ? (
          <div className="empty-detail inline-empty">
            <Database />
            <h2>No crafted items ranked yet</h2>
            <p>Load crafting data to rank high-value craftable market outputs.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function FarmTrackerPage({
  accountSnapshot,
  accountItems,
  apiKeyRemembered,
  analysisState,
  onAnalyze,
}: {
  accountSnapshot: AccountSnapshot | null;
  accountItems: Map<number, Gw2Item>;
  apiKeyRemembered: boolean;
  analysisState: LoadState;
  onAnalyze: () => Promise<void>;
}) {
  const now = useRelativeNow();
  const [mode, setMode] = useState<FarmTrackerMode>("account");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [revision, setRevision] = useState(0);
  const [trackerItems, setTrackerItems] = useState<Map<number, Gw2Item>>(new Map());
  const characters = accountSnapshot?.characters ?? [];

  useEffect(() => {
    if (!selectedCharacter && characters[0]) {
      setSelectedCharacter(characters[0].name);
    }
  }, [characters, selectedCharacter]);

  const scopeKey = mode === "account"
    ? "account"
    : `character:${selectedCharacter || characters[0]?.name || "unknown"}`;
  const currentHoldings = useMemo(
    () => getFarmTrackerHoldings(accountSnapshot, mode, selectedCharacter),
    [accountSnapshot, mode, selectedCharacter],
  );

  useEffect(() => {
    if (!accountSnapshot || currentHoldings.size === 0) {
      return;
    }

    updateFarmTrackerState(scopeKey, currentHoldings);
    setRevision((current) => current + 1);
  }, [accountSnapshot, currentHoldings, scopeKey]);

  const trackerState = useMemo(() => readFarmTrackerState(scopeKey), [scopeKey, revision]);
  useEffect(() => {
    const ids = Array.from(new Map(trackerState?.gained ?? []).keys()).filter(
      (id) => !accountItems.has(id) && !trackerItems.has(id) && !getStoredItem(id),
    );
    if (ids.length === 0) {
      return;
    }

    let ignore = false;
    loadItems(ids).then((items) => {
      if (ignore) {
        return;
      }

      setTrackerItems((current) => {
        const next = new Map(current);
        for (const item of items) {
          next.set(item.id, item);
        }
        return next;
      });
    });

    return () => {
      ignore = true;
    };
  }, [accountItems, trackerItems, trackerState]);

  const gainedRows = useMemo(() => {
    const gained = new Map(trackerState?.gained ?? []);
    return Array.from(gained.entries())
      .map(([id, count]) => {
        const item = accountItems.get(id) ?? trackerItems.get(id) ?? getStoredItem(id);
        const price = getStoredPrice(id);
        const unitValue = Math.floor((price?.buys.unit_price || price?.sells.unit_price || 0) * 0.85);
        return {
          id,
          count,
          item,
          value: unitValue * count,
        };
      })
      .sort((left, right) => right.value - left.value || right.count - left.count)
      .slice(0, 50);
  }, [accountItems, revision, scopeKey, trackerItems, trackerState]);
  const totalValue = gainedRows.reduce((sum, row) => sum + row.value, 0);
  const totalItems = gainedRows.reduce((sum, row) => sum + row.count, 0);

  function resetTracker() {
    if (!accountSnapshot) {
      return;
    }

    resetFarmTrackerState(scopeKey, currentHoldings);
    setRevision((current) => current + 1);
  }

  if (!accountSnapshot) {
    return (
      <div className="focused-page">
        <section className="surface account-required-panel">
          <KeyRound />
          <span className="eyebrow">GW2 API required</span>
          <h2>Farming Tracker</h2>
          <p>
            The tracker compares account snapshots from your GW2 API key. It can track gathered
            item deltas after a reset, but the official API does not expose a real loot event log.
          </p>
          <button className="icon-button primary" onClick={() => void onAnalyze()} disabled={!apiKeyRemembered && analysisState === "loading"}>
            {analysisState === "loading" ? <Loader2 className="spin" /> : <TrendingUp />}
            <span>{analysisState === "loading" ? "Loading" : "Load Account API"}</span>
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="focused-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">Daily Snapshot Tracker</span>
          <h2>Farming Tracker</h2>
          <p>
            Tracks positive inventory/material deltas since today&apos;s reset baseline for {accountSnapshot.tokenInfo.name}.
          </p>
        </div>
        <div className="page-actions">
          <button className="icon-button" onClick={() => void onAnalyze()}>
            {analysisState === "loading" ? <Loader2 className="spin" /> : <RefreshCcw />}
            <span>Refresh API</span>
          </button>
          <button className="icon-button primary" onClick={resetTracker}>
            <X />
            <span>Reset</span>
          </button>
        </div>
      </section>

      <section className="surface farm-tracker-controls">
        <label>
          Scope
          <select value={mode} onChange={(event) => setMode(event.target.value as FarmTrackerMode)}>
            <option value="account">Entire account</option>
            <option value="character">Per character</option>
          </select>
        </label>
        <label>
          Character
          <select
            value={selectedCharacter}
            disabled={mode !== "character" || characters.length === 0}
            onChange={(event) => setSelectedCharacter(event.target.value)}
          >
            {characters.map((character) => (
              <option key={character.name} value={character.name}>
                {character.name} · {character.profession}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className="eyebrow">Baseline</span>
          <strong>{trackerState ? formatAge(trackerState.startedAt, now) : "Created now"}</strong>
        </div>
      </section>

      <section className="stat-grid">
        <Metric icon={<Coins />} label="Tracked Profit" value={<Money value={totalValue} />} tone={totalValue ? "positive" : "muted"} />
        <Metric icon={<Boxes />} label="Items Gained" value={totalItems.toLocaleString()} />
        <Metric icon={<Database />} label="Stacks" value={gainedRows.length.toLocaleString()} />
        <Metric icon={<RefreshCcw />} label="Last Snapshot" value={trackerState ? formatAge(trackerState.lastUpdatedAt, now) : "Now"} />
      </section>

      <section className="surface craft-profit-surface">
        {gainedRows.length ? (
          <div className="craft-table-wrap">
            <table className="craft-profit-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Gained</th>
                  <th>Est. Sell Value</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {gainedRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="table-item-cell">
                        <ItemIcon item={row.item ?? { name: "Item" }} />
                        <span className="item-copy">
                          <strong>{row.item?.name ?? `Item ${row.id}`}</strong>
                          <span>{row.item?.rarity ?? "Tracked item"}</span>
                        </span>
                      </span>
                    </td>
                    <td>{row.count.toLocaleString()}</td>
                    <td><Money value={row.value} /></td>
                    <td>{row.count ? <Money value={Math.floor(row.value / row.count)} /> : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-detail inline-empty">
            <ListChecks />
            <h2>No gains tracked yet</h2>
            <p>Reset the tracker, farm for a while, then refresh the API to record positive item changes.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function isMysticForgeCraft(craft: CraftOpportunity): boolean {
  return isMysticForgeRecipe(craft.recipe);
}

function isMysticForgeRecipe(recipe: RecipeGuide["recipe"]): boolean {
  const text = `${recipe.type} ${recipe.disciplines.join(" ")} ${recipe.flags.join(" ")}`.toLowerCase();
  return text.includes("mystic") || text.includes("forge") || recipe.disciplines.length === 0;
}

function getRecipeSourceLabel(recipe: RecipeGuide["recipe"]): string {
  if (recipe.source === "wiki") {
    return isMysticForgeRecipe(recipe) ? "GW2 Wiki Mystic Forge" : "GW2 Wiki Crafting";
  }

  if (isMysticForgeRecipe(recipe)) {
    return "Mystic Forge";
  }

  return recipe.disciplines.join(", ") || "Crafting";
}

function getWikiPageUrl(title: string): string {
  return `https://wiki.guildwars2.com/wiki/${encodeURIComponent(title).replace(/%20/g, "_")}`;
}

function getRecipeAcquisitionSummary(recipe: RecipeGuide["recipe"], outputName: string): string {
  if (recipe.source === "wiki") {
    if (!isMysticForgeRecipe(recipe)) {
      return recipe.sourceName
        ? `${recipe.sourceName} from the GW2 Wiki. Open the source for the full profession recipe table and notes.`
        : "Crafting recipe from the GW2 Wiki. Open the source for the full profession recipe table.";
    }

    return recipe.sourceName
      ? `${recipe.sourceName} from the GW2 Wiki. Open the source for the exact forge inputs and acquisition notes.`
      : "Mystic Forge recipe from the GW2 Wiki. Open the source for the exact acquisition notes.";
  }

  if (isMysticForgeRecipe(recipe)) {
    return "Mystic Forge recipe. Combine the listed ingredients in the Mystic Forge; the official API does not expose a recipe sheet for this route.";
  }

  if (recipe.flags.includes("AutoLearned")) {
    return "Automatically learned once the character has the listed discipline and rating.";
  }

  if (recipe.flags.includes("LearnedFromItem")) {
    return "Learned from a recipe sheet. Open the Wiki page to check the current vendors, achievements, or other acquisition sources for that sheet.";
  }

  return `${outputName} is a discovery recipe. Use the crafting station's Discovery tab with the listed ingredients; there is no recipe sheet to buy.`;
}

function getRecipeSourceUrl(recipe: RecipeGuide["recipe"], outputName: string): string {
  return recipe.sourceUrl ?? getWikiPageUrl(outputName);
}

function getFarmTrackerHoldings(
  accountSnapshot: AccountSnapshot | null,
  mode: FarmTrackerMode,
  selectedCharacter: string,
): Map<number, number> {
  if (!accountSnapshot) {
    return new Map();
  }

  if (mode === "account") {
    return new Map(accountSnapshot.holdings);
  }

  const character = accountSnapshot.characters.find((item) => item.name === selectedCharacter) ?? accountSnapshot.characters[0];
  return character ? getCharacterHoldings(character) : new Map();
}

function getCharacterHoldings(character: AccountCharacter): Map<number, number> {
  const holdings = new Map<number, number>();

  for (const bag of character.bags ?? []) {
    for (const stack of bag?.inventory ?? []) {
      if (!stack?.id || !stack.count) {
        continue;
      }

      holdings.set(stack.id, (holdings.get(stack.id) ?? 0) + stack.count);
    }
  }

  return holdings;
}

function readFarmTrackerStore(): Record<string, FarmTrackerStoredState> {
  try {
    const raw = window.localStorage.getItem(FARM_TRACKER_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as Record<string, FarmTrackerStoredState>;
  } catch {
    return {};
  }
}

function writeFarmTrackerStore(store: Record<string, FarmTrackerStoredState>) {
  try {
    window.localStorage.setItem(FARM_TRACKER_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Losing the local tracker state should not break the rest of the app.
  }
}

function readFarmTrackerState(scopeKey: string): FarmTrackerStoredState | null {
  return readFarmTrackerStore()[scopeKey] ?? null;
}

function updateFarmTrackerState(scopeKey: string, currentHoldings: Map<number, number>): FarmTrackerStoredState {
  const store = readFarmTrackerStore();
  const today = getLocalDateKey();
  const existing = store[scopeKey];

  if (!existing || existing.dateKey !== today) {
    const fresh = createFarmTrackerState(scopeKey, currentHoldings);
    store[scopeKey] = fresh;
    writeFarmTrackerStore(store);
    return fresh;
  }

  const gained = new Map(existing.gained);
  const previous = new Map(existing.lastHoldings);

  for (const [id, count] of currentHoldings) {
    const delta = count - (previous.get(id) ?? 0);
    if (delta > 0) {
      gained.set(id, (gained.get(id) ?? 0) + delta);
    }
  }

  const next: FarmTrackerStoredState = {
    ...existing,
    lastUpdatedAt: Date.now(),
    lastHoldings: serializeHoldingMap(currentHoldings),
    gained: serializeHoldingMap(gained),
  };
  store[scopeKey] = next;
  writeFarmTrackerStore(store);
  return next;
}

function resetFarmTrackerState(scopeKey: string, currentHoldings: Map<number, number>): FarmTrackerStoredState {
  const store = readFarmTrackerStore();
  const next = createFarmTrackerState(scopeKey, currentHoldings);
  store[scopeKey] = next;
  writeFarmTrackerStore(store);
  return next;
}

function createFarmTrackerState(scopeKey: string, holdings: Map<number, number>): FarmTrackerStoredState {
  const now = Date.now();
  return {
    scopeKey,
    dateKey: getLocalDateKey(),
    startedAt: now,
    lastUpdatedAt: now,
    lastHoldings: serializeHoldingMap(holdings),
    gained: [],
  };
}

function serializeHoldingMap(map: Map<number, number>): Array<[number, number]> {
  return Array.from(map.entries()).filter(([, count]) => count > 0);
}

function getLocalDateKey(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function CategoryPage({
  activePage,
  catalog,
  maps,
  onLoadMarket,
  onOpenActivity,
}: {
  activePage: ActivePage;
  catalog: MarketItem[];
  maps: Gw2Map[];
  onLoadMarket: () => void;
  onOpenActivity: (suggestion: GoldSuggestion) => void;
}) {
  const guide = getGuideDefinition(activePage);
  const activityValue = getActivityValueDefinition(activePage);
  const valueRows = useMemo(
    () => buildActivityValueRows(activityValue, catalog),
    [activityValue, catalog],
  );
  const suggestions = REPEATABLE_EARNING_OPTIONS.filter((option) => {
    const text = `${option.title} ${option.detail}`.toLowerCase();

    if (isGuideFamily(activePage, "open-world")) return /open world|meta|fishing|alt|map/.test(text);
    if (isGuideFamily(activePage, "instances")) return /fractal|dungeon|instance|home/.test(text);
    if (isGuideFamily(activePage, "salvaging")) return /salvage|gear/.test(text);
    if (isGuideFamily(activePage, "gathering")) return /gather|glyph|node/.test(text);
    if (isGuideFamily(activePage, "bags")) return /bag|gear|material/.test(text);
    if (isGuideFamily(activePage, "conversions")) return /conversion|currency|promote|research/.test(text);
    if (isGuideFamily(activePage, "competitive")) return /pvp|wvw|track/.test(text);
    return false;
  });

  return (
    <div className="category-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">Guide</span>
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
        </div>
      </section>

      <section className="guide-grid">
        <div className="surface guide-steps">
          <div className="section-title">
            <BookOpen />
            <h3>Route</h3>
          </div>
          <ol>
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="surface guide-map-panel">
          <div className="section-title">
            <Database />
            <h3>Map and GW2 Links</h3>
          </div>
          <div className="location-list">
            {guide.locations.map((location) => (
              <LocationCard
                key={`${location.map}-${location.label}`}
                location={location}
                maps={maps}
              />
            ))}
          </div>
        </div>
      </section>

      {activityValue ? (
        <section className="surface activity-value-panel">
          <div className="section-title">
            <Coins />
            <h3>{activityValue.title}</h3>
          </div>
          <p>{activityValue.summary}</p>
          {valueRows.length ? (
            <>
              <div className="craft-table-wrap">
                <table className="craft-profit-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Estimated Value</th>
                      <th>Earned From</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valueRows.map((row) => (
                      <tr key={`${row.name}-${row.source}`}>
                        <td>
                          <span className="table-item-cell">
                            <ItemIcon item={row.item ?? { name: row.name }} />
                            <span className="item-copy">
                              <strong>{row.item?.name ?? row.name}</strong>
                              <span>{row.item ? `${row.item.rarity} ${row.item.type}` : "Market item"}</span>
                            </span>
                          </span>
                        </td>
                        <td>{row.value ? <Money value={row.value} /> : "Load market"}</td>
                        <td>{row.source}</td>
                        <td>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {valueRows.every((row) => row.value <= 0) ? (
                <button className="icon-button primary" onClick={onLoadMarket}>
                  <RefreshCcw />
                  <span>Load Market Values</span>
                </button>
              ) : null}
            </>
          ) : (
            <div className="empty-detail inline-empty">
              <Database />
              <h2>Market values not loaded</h2>
              <p>Load the Trading Post to rank activity rewards by current value.</p>
              <button className="icon-button primary" onClick={onLoadMarket}>
                <RefreshCcw />
                <span>Load Market</span>
              </button>
            </div>
          )}
        </section>
      ) : null}

      {isGuideFamily(activePage, "fishing") || activePage === "fishing" ? (
        <section className="surface activity-value-panel">
          <div className="section-title">
            <BookOpen />
            <h3>Fishing Requirements</h3>
          </div>
          <div className="craft-table-wrap">
            <table className="craft-profit-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Bait</th>
                  <th>Fishing Power</th>
                  <th>Expansion / Map</th>
                  <th>Value Focus</th>
                </tr>
              </thead>
              <tbody>
                {FISHING_ROUTE_INFO.map((route) => (
                  <tr key={route.name}>
                    <td>{route.name}</td>
                    <td>{route.bait}</td>
                    <td>{route.fishingPower}</td>
                    <td>{route.expansion} · {route.map}</td>
                    <td>{route.valueFocus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="surface suggestions-panel">
        <div className="section-title">
          <TrendingUp />
          <h3>Related Money-Making Notes</h3>
        </div>
        <div className="earning-list">
          {(suggestions.length ? suggestions : REPEATABLE_EARNING_OPTIONS).slice(0, 12).map((option) => (
            <button
              key={option.title}
              className="earning-row"
              onClick={() => onOpenActivity(option)}
            >
              <span className={`speed-badge speed-${option.speed.toLowerCase()}`}>
                {option.speed}
              </span>
              <div>
                <strong>{option.title}</strong>
                <span>{option.detail}</span>
              </div>
              <strong>{option.value}</strong>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function getGuideDefinition(activePage: ActivePage): GuideDefinition {
  const exact = GUIDE_DEFINITIONS[activePage];
  if (exact) {
    return exact;
  }

  const navItem = NAV_ITEMS.find((item) => item.id === activePage);
  const parentGroup = SIDEBAR_GROUPS.find((group) =>
    group.items.some((item) => item.id === activePage),
  );
  const parentId = parentGroup?.items[0]?.id;
  const inherited = parentId ? GUIDE_DEFINITIONS[parentId] : undefined;

  if (inherited) {
    return {
      ...inherited,
      title: navItem?.label ?? inherited.title,
      summary: `${navItem?.label ?? inherited.title}: ${inherited.summary}`,
    };
  }

  return {
    title: navItem?.label ?? "Guide",
    summary: "A generalized route view that becomes more specific when tied to account data and live market prices.",
    steps: [
      "Check whether the activity gives liquid gold, materials, account-bound progress, or all three.",
      "Compare the time cost against current Trading Post prices before committing.",
      "Use saved account data to avoid spending materials needed for your nearer crafting goals.",
    ],
    locations: [
      {
        label: "Trading and vendor hub",
        map: "Lion's Arch",
        waypoint: "[&BBAEAAA=]",
        note: "A reliable place to clean up inventory, vendors, bank access, and Trading Post listings.",
        wikiUrl: "https://wiki.guildwars2.com/wiki/Lion%27s_Arch",
      },
    ],
  };
}

function getActivityValueDefinition(activePage: ActivePage): ActivityValueDefinition | null {
  if (ACTIVITY_VALUE_DEFINITIONS[activePage]) {
    return ACTIVITY_VALUE_DEFINITIONS[activePage];
  }

  if (isGuideFamily(activePage, "open-world")) {
    return activePage === "fishing"
      ? ACTIVITY_VALUE_DEFINITIONS.fishing
      : ACTIVITY_VALUE_DEFINITIONS["open-world"];
  }

  if (isGuideFamily(activePage, "instances")) return ACTIVITY_VALUE_DEFINITIONS.instances;
  if (isGuideFamily(activePage, "salvaging")) return ACTIVITY_VALUE_DEFINITIONS.salvaging;
  if (isGuideFamily(activePage, "gathering")) return ACTIVITY_VALUE_DEFINITIONS.gathering;
  if (isGuideFamily(activePage, "bags")) return ACTIVITY_VALUE_DEFINITIONS.bags;
  if (isGuideFamily(activePage, "conversions")) return ACTIVITY_VALUE_DEFINITIONS.conversions;
  if (isGuideFamily(activePage, "competitive")) return ACTIVITY_VALUE_DEFINITIONS.competitive;
  return null;
}

function buildActivityValueRows(definition: ActivityValueDefinition | null, catalog: MarketItem[]) {
  if (!definition) {
    return [];
  }

  return definition.items
    .map((entry) => {
      const item = findMarketItemByName(catalog, entry.name);
      const price = item ? getStoredPrice(item.id) : undefined;
      const value = price?.buys.unit_price || price?.sells.unit_price || 0;
      return {
        ...entry,
        item,
        value,
      };
    })
    .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
}

function buildSalvageEstimateRows(catalog: MarketItem[]): SalvageEstimateRow[] {
  return catalog
    .filter(isSalvageMarketCandidate)
    .map((item) => {
      const quote = getMarketQuoteForItem(item);
      const estimate = getSalvageEstimateForItem(item);
      const salvageValue = estimateSalvageOutputValue(estimate.outputs, catalog);
      const directSellNet = quote.instantSellNet || quote.listedSellNet;

      return {
        item,
        purchaseCost: quote.buyCost,
        directSellNet,
        salvageValue,
        buySalvageProfit: salvageValue - quote.buyCost,
        salvageInsteadOfSell: salvageValue - directSellNet,
        outputs: estimate.outputs,
        confidence: estimate.confidence,
        familyLabel: estimate.familyLabel,
        tierLabel: estimate.tierLabel,
        note: estimate.note,
      };
    })
    .sort((left, right) => {
      const modeledDelta = Number(right.outputs.length > 0) - Number(left.outputs.length > 0);
      if (modeledDelta !== 0) {
        return modeledDelta;
      }

      return (
        right.buySalvageProfit - left.buySalvageProfit ||
        right.salvageInsteadOfSell - left.salvageInsteadOfSell ||
        right.salvageValue - left.salvageValue ||
        left.item.name.localeCompare(right.item.name)
      );
    })
    .slice(0, SALVAGE_ROW_LIMIT);
}

function isSalvageMarketCandidate(item: MarketItem): boolean {
  if (item.flags?.includes("NoSalvage") || item.price.sells.unit_price <= 0) {
    return false;
  }

  const salvageTypes = new Set(["Armor", "Weapon", "Trinket", "Back", "UpgradeComponent"]);
  const name = item.name.toLowerCase();
  return salvageTypes.has(item.type) || /unidentified gear|salvage/.test(name);
}

function getSalvageEstimateForItem(item: MarketItem): SalvageProfile {
  const name = item.name.toLowerCase();
  const salvageableGearTypes = new Set(["Armor", "Weapon", "Trinket", "Back"]);

  if (/rare unidentified gear/.test(name)) {
    return {
      outputs: RARE_GEAR_OUTPUTS,
      confidence: "Estimated from level/rarity",
      familyLabel: "Opened gear mix",
      tierLabel: "Level 80 rare mix",
      note: "Rare unidentified gear modeled with the rare gear ectoplasm estimate.",
    };
  }

  if (/common unidentified gear|uncommon unidentified gear/.test(name)) {
    return {
      outputs: MASTERWORK_GEAR_OUTPUTS,
      confidence: "Estimated from level/rarity",
      familyLabel: "Opened gear mix",
      tierLabel: "Level 80 mixed gear",
      note: "Uncommon unidentified gear modeled as a mixed level-80 open-and-salvage basket.",
    };
  }

  if (/unidentified gear/.test(name)) {
    return {
      outputs: FINE_GEAR_OUTPUTS,
      confidence: "Estimated from level/rarity",
      familyLabel: "Opened gear mix",
      tierLabel: "Level 80 mixed gear",
      note: "Fine unidentified gear modeled as a mixed level-80 open-and-salvage basket.",
    };
  }

  if (salvageableGearTypes.has(item.type)) {
    return getEquipmentSalvageProfile(item);
  }

  if (item.type === "UpgradeComponent") {
    return {
      outputs: getUpgradeComponentSalvageOutputs(item),
      confidence: "Estimated from level/rarity",
      familyLabel: "Upgrade component",
      tierLabel: item.level ? `Level ${item.level}` : "Any level",
      note: "Upgrade component estimate. Exact charm, symbol, and lucent output depends on the specific rune, sigil, relic, or upgrade.",
    };
  }

  return {
    outputs: [],
    confidence: "Unmodeled",
    familyLabel: "Unknown",
    tierLabel: item.level ? `Level ${item.level}` : "Any level",
    note: "Market-salvageable item, but exact material-family outputs are not modeled yet.",
  };
}

function getEquipmentSalvageProfile(item: MarketItem): SalvageProfile {
  const tier = getSalvageMaterialTier(item.level);
  const families = getSalvageMaterialFamilies(item);
  const materialAverage = getBaseSalvageMaterialAverage(item.rarity);
  const outputs: SalvageOutputEstimate[] = [];

  for (const family of families) {
    outputs.push({
      name: tier[family],
      averageCount: materialAverage / families.length,
      note: `${SALVAGE_FAMILY_LABELS[family]} family`,
    });
  }

  if ((item.rarity === "Rare" || item.rarity === "Exotic") && item.level >= 68) {
    outputs.unshift({
      name: "Glob of Ectoplasm",
      averageCount: item.rarity === "Exotic" ? 1.15 : 0.875,
      note: "Only modeled for level 68+ rare/exotic gear",
    });
  }

  if (item.rarity === "Rare" || item.rarity === "Exotic") {
    outputs.push({
      name: tier.dust,
      averageCount: item.rarity === "Exotic" ? 0.28 : 0.12,
      note: "Rarity dust estimate",
    });
  }

  const familyLabel = families.length === 1
    ? SALVAGE_FAMILY_LABELS[families[0]]
    : families.map((family) => SALVAGE_FAMILY_LABELS[family]).join(" / ");
  const lowerRareNote =
    (item.rarity === "Rare" || item.rarity === "Exotic") && item.level < 68
      ? " Low-level rare/exotic gear is not modeled with ectoplasm."
      : "";

  return {
    outputs,
    confidence: "Estimated from level/rarity",
    familyLabel,
    tierLabel: tier.label,
    note: `${item.rarity} ${item.type.toLowerCase()} estimate based on item level and ${familyLabel.toLowerCase()} salvage family.${lowerRareNote}`,
  };
}

function getSalvageMaterialTier(level: number) {
  const normalizedLevel = Math.max(1, Math.min(80, level || 80));
  return SALVAGE_MATERIAL_TIERS.find((tier) => normalizedLevel <= tier.maxLevel) ?? SALVAGE_MATERIAL_TIERS[SALVAGE_MATERIAL_TIERS.length - 1];
}

function getBaseSalvageMaterialAverage(rarity: string): number {
  switch (rarity) {
    case "Exotic":
      return 1.6;
    case "Rare":
      return 1.25;
    case "Masterwork":
      return 1.05;
    case "Fine":
      return 0.85;
    default:
      return 0.65;
  }
}

function getSalvageMaterialFamilies(item: MarketItem): SalvageMaterialFamily[] {
  if (item.type === "Armor") {
    const weightClass = String(item.details?.weight_class ?? "").toLowerCase();
    if (weightClass === "heavy") {
      return ["metal"];
    }
    if (weightClass === "medium") {
      return ["leather"];
    }
    if (weightClass === "light") {
      return ["cloth"];
    }
  }

  if (item.type === "Back" || item.type === "Trinket") {
    return ["metal", "cloth"];
  }

  if (item.type !== "Weapon") {
    return ["metal", "wood", "leather", "cloth"];
  }

  const weaponType = String(item.details?.type ?? "").toLowerCase();
  if (/staff|scepter|focus|torch|warhorn/.test(weaponType)) {
    return ["wood"];
  }
  if (/longbow|shortbow|rifle|pistol|speargun/.test(weaponType)) {
    return ["wood", "metal"];
  }
  if (/trident/.test(weaponType)) {
    return ["wood", "cloth"];
  }
  if (/harpoon|spear/.test(weaponType)) {
    return ["metal", "wood"];
  }

  return ["metal"];
}

function getUpgradeComponentSalvageOutputs(item: MarketItem): SalvageOutputEstimate[] {
  const outputs: SalvageOutputEstimate[] = [
    {
      name: item.rarity === "Exotic" || item.rarity === "Rare" ? "Pile of Lucent Crystal" : "Lucent Mote",
      averageCount: item.rarity === "Exotic" ? 1.35 : item.rarity === "Rare" ? 0.75 : 1,
    },
  ];

  return outputs;
}

function estimateSalvageOutputValue(outputs: SalvageOutputEstimate[], catalog: MarketItem[]): number {
  return Math.round(
    outputs.reduce((sum, output) => {
      const quote = getMarketQuoteForName(catalog, output.name);
      const unitValue = quote.instantSellNet || quote.listedSellNet;
      return sum + unitValue * output.averageCount;
    }, 0),
  );
}

function getMarketQuoteForAliases(catalog: MarketItem[], aliases: string[]): MarketQuote {
  for (const alias of aliases) {
    const item = findMarketItemByName(catalog, alias);
    if (item) {
      return getMarketQuoteForItem(item);
    }
  }

  return getMarketQuoteForItem(undefined);
}

function getMarketQuoteForId(catalog: MarketItem[], itemId: number, fallbackAliases: string[] = []): MarketQuote {
  const idQuote = getMarketQuoteForItem(catalog.find((item) => item.id === itemId));
  return idQuote.item ? idQuote : getMarketQuoteForAliases(catalog, fallbackAliases);
}

function getMarketQuoteForName(catalog: MarketItem[], name: string): MarketQuote {
  return getMarketQuoteForItem(findMarketItemByName(catalog, name));
}

function getMarketQuoteForItem(item: MarketItem | undefined): MarketQuote {
  if (!item) {
    return {
      buyCost: 0,
      instantSellNet: 0,
      listedSellNet: 0,
    };
  }

  return {
    item,
    buyCost: item.price.sells.unit_price,
    instantSellNet: Math.floor((item.price.buys.unit_price || 0) * 0.85),
    listedSellNet: item.netSellPrice,
  };
}

function formatAverageCount(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }

  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function findMarketItemByName(catalog: MarketItem[], name: string): MarketItem | undefined {
  const normalized = normalizeSearchText(name);
  return catalog.find((item) => normalizeSearchText(item.name) === normalized);
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isGuideFamily(activePage: ActivePage, familyId: ActivePage): boolean {
  if (activePage === familyId) {
    return true;
  }

  const group = SIDEBAR_GROUPS.find((entry) => entry.items.some((item) => item.id === activePage));
  return group?.items[0]?.id === familyId;
}

function LocationCard({ location, maps }: { location: GuideLocation; maps: Gw2Map[] }) {
  const preview = getMapPreview(location, maps);

  return (
    <article className="location-card">
      <div
        className={`mini-map ${preview ? "gw2-map" : "fallback-map"}`}
        role="img"
        aria-label={`${location.map} map preview`}
        style={preview?.mapStyle}
      >
        {preview ? (
          <div className="map-tile-mosaic" style={preview.mosaicStyle}>
            {preview.tiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.src}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.classList.add("missing");
                }}
              />
            ))}
          </div>
        ) : null}
        <span>{preview?.map.name ?? location.map}</span>
        <i />
      </div>
      <div className="location-copy">
        <strong>{location.label}</strong>
        <span>{location.note}</span>
        {location.waypoint ? (
          <code title="Copy this code into GW2 chat, then click it in game.">{location.waypoint}</code>
        ) : null}
        {location.wikiUrl ? (
          <a href={location.wikiUrl} target="_blank" rel="noreferrer">
            Open wiki map
            <ExternalLink />
          </a>
        ) : null}
      </div>
    </article>
  );
}

interface MapPreviewTile {
  key: string;
  src: string;
}

interface MapPreviewData {
  map: Gw2Map;
  mapStyle: CSSProperties;
  mosaicStyle: CSSProperties;
  tiles: MapPreviewTile[];
}

function getMapPreview(location: GuideLocation, maps: Gw2Map[]): MapPreviewData | null {
  const mapName = location.map;
  const normalizedMapName = normalizeMapName(mapName);
  if (ABSTRACT_LOCATION_MAPS.has(normalizedMapName)) {
    return null;
  }

  const map = findGw2MapByName(mapName, maps);
  if (!map) {
    return null;
  }

  const [[left, top], [right, bottom]] = map.continent_rect;
  const maxZoom = GW2_CONTINENT_MAX_ZOOM[map.continent_id] ?? 8;
  const maxTileZoom = GW2_TILE_RENDER_MAX_ZOOM[map.continent_id] ?? maxZoom;
  const requestedZoom = location.zoom ?? chooseMapPreviewZoom(map, maxZoom);
  const zoom = Math.max(0, Math.min(requestedZoom, maxZoom, maxTileZoom));
  const scale = 2 ** (maxZoom - zoom);
  const tileWorldSize = GW2_TILE_SIZE * scale;
  const target = location.continentCoord ?? [
    left + (right - left) / 2,
    top + (bottom - top) / 2,
  ];
  const centerTileX = Math.max(0, Math.floor(target[0] / tileWorldSize));
  const centerTileY = Math.max(0, Math.floor(target[1] / tileWorldSize));
  const tileLeft = Math.max(0, centerTileX - Math.floor(MAP_PREVIEW_GRID_SIZE / 2));
  const tileTop = Math.max(0, centerTileY - Math.floor(MAP_PREVIEW_GRID_SIZE / 2));
  const tileRight = tileLeft + MAP_PREVIEW_GRID_SIZE - 1;
  const tileBottom = tileTop + MAP_PREVIEW_GRID_SIZE - 1;
  const targetPixelX = (target[0] / tileWorldSize - tileLeft) * GW2_TILE_SIZE;
  const targetPixelY = (target[1] / tileWorldSize - tileTop) * GW2_TILE_SIZE;
  const floor = map.default_floor ?? map.floors?.[0] ?? 1;
  const tiles: MapPreviewTile[] = [];

  for (let y = tileTop; y <= tileBottom; y += 1) {
    for (let x = tileLeft; x <= tileRight; x += 1) {
      tiles.push({
        key: `${map.id}-${zoom}-${x}-${y}`,
        src: `https://tiles.guildwars2.com/${map.continent_id}/${floor}/${zoom}/${x}/${y}.jpg`,
      });
    }
  }

  return {
    map,
    mapStyle: {},
    mosaicStyle: {
      gridTemplateColumns: `repeat(${MAP_PREVIEW_GRID_SIZE}, ${GW2_TILE_SIZE}px)`,
      gridTemplateRows: `repeat(${MAP_PREVIEW_GRID_SIZE}, ${GW2_TILE_SIZE}px)`,
      width: `${MAP_PREVIEW_GRID_SIZE * GW2_TILE_SIZE}px`,
      height: `${MAP_PREVIEW_GRID_SIZE * GW2_TILE_SIZE}px`,
      left: `calc(50% - ${targetPixelX}px)`,
      top: `calc(50% - ${targetPixelY}px)`,
    },
    tiles,
  };
}

function chooseMapPreviewZoom(map: Gw2Map, maxZoom: number): number {
  const [[left, top], [right, bottom]] = map.continent_rect;
  const maxCandidate = Math.min(maxZoom, 7);

  for (let zoom = maxCandidate; zoom >= 0; zoom -= 1) {
    const scale = 2 ** (maxZoom - zoom);
    const tileWorldSize = GW2_TILE_SIZE * scale;
    const tileLeft = Math.max(0, Math.floor(left / tileWorldSize));
    const tileTop = Math.max(0, Math.floor(top / tileWorldSize));
    const tileRight = Math.max(tileLeft, Math.floor((right - 1) / tileWorldSize));
    const tileBottom = Math.max(tileTop, Math.floor((bottom - 1) / tileWorldSize));
    const tileCount = (tileRight - tileLeft + 1) * (tileBottom - tileTop + 1);

    if (tileCount <= MAX_MAP_PREVIEW_TILES) {
      return zoom;
    }
  }

  return Math.max(0, Math.min(maxZoom, 4));
}

function findGw2MapByName(mapName: string, maps: Gw2Map[]): Gw2Map | undefined {
  const normalizedMapName = normalizeMapName(mapName);
  const exact = maps.find((map) => normalizeMapName(map.name) === normalizedMapName);
  if (exact) {
    return exact;
  }

  return maps.find((map) => {
    const normalizedCandidate = normalizeMapName(map.name);
    return (
      normalizedMapName.includes(normalizedCandidate) ||
      normalizedCandidate.includes(normalizedMapName)
    );
  });
}

function normalizeMapName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function ItemIcon({ item }: { item: { name: string; icon?: string } }) {
  const [iconFailed, setIconFailed] = useState(false);
  const iconUrl = item.icon?.startsWith("http://")
    ? item.icon.replace(/^http:\/\//i, "https://")
    : item.icon;

  useEffect(() => {
    setIconFailed(false);
  }, [iconUrl]);

  return iconUrl && !iconFailed ? (
    <img
      className="item-icon"
      src={iconUrl}
      alt=""
      loading="lazy"
      onError={() => setIconFailed(true)}
    />
  ) : (
    <span className="item-icon fallback">
      <Boxes />
    </span>
  );
}

function ItemDetail({
  item,
  catalog,
  listings,
  itemTransactions,
  recipes,
  usedInRecipes,
  recipeUsageState,
  wikiGuide,
  detailState,
  containerAnalysis,
  containerState,
  accountSnapshot,
  marketHistoryRevision,
  onClose,
  onOpenDetail,
  extraInfo,
}: {
  item: MarketItem;
  catalog: MarketItem[];
  listings: CommerceListings | null;
  itemTransactions: ItemTransactions | null;
  recipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  wikiGuide: WikiGuide | null;
  detailState: LoadState;
  containerAnalysis: ContainerAnalysis | null;
  containerState: LoadState;
  accountSnapshot: AccountSnapshot | null;
  marketHistoryRevision: number;
  onClose: () => void;
  onOpenDetail?: (item: Gw2Item) => void;
  extraInfo?: ReactNode;
}) {
  const topBuy = listings?.buys?.[0];
  const topSell = listings?.sells?.[0];
  const isTradable = hasTradingPostPrice(item);
  const showMarketSections = isTradable;
  const showCraftingSections = recipes.length > 0 || detailState === "loading";
  const salvageProfile = useMemo(() => getSalvageEstimateForItem(item), [item]);
  const showSalvageProfile = salvageProfile.outputs.length > 0 || salvageProfile.confidence !== "Unmodeled";
  const [wikiAcquisition, setWikiAcquisition] = useState<WikiItemAcquisition | null>(null);
  const [wikiAcquisitionState, setWikiAcquisitionState] = useState<LoadState>("idle");

  useEffect(() => {
    let ignore = false;
    setWikiAcquisition(null);
    setWikiAcquisitionState("loading");

    loadWikiItemAcquisition(item.name)
      .then((acquisition) => {
        if (ignore) {
          return;
        }

        setWikiAcquisition(acquisition);
        setWikiAcquisitionState(acquisition ? "ready" : "idle");
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        setWikiAcquisitionState("error");
      });

    return () => {
      ignore = true;
    };
  }, [item.name]);

  return (
    <div className="item-detail">
      <section className="item-title-row">
        <ItemIcon item={item} />
        <div>
          <span className={`rarity rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</span>
          <h2>{item.name}</h2>
          <p>
            {item.type} - Level {item.level || "Any"}
          </p>
        </div>
        <button className="detail-close-button" onClick={onClose} aria-label="Close item details" title="Close item details">
          <X />
        </button>
      </section>

      {extraInfo}

      {!isTradable ? (
        <section className="surface tradeability-note">
          <ShieldCheck />
          <div>
            <strong>Not tradable</strong>
            <span>This item is not currently sellable on the Trading Post. Values shown for containers come from their parsed contents when available.</span>
          </div>
        </section>
      ) : null}

      {wikiAcquisition?.vendorOffers.length ? (
        <VendorAcquisitionPanel
          item={item}
          acquisition={wikiAcquisition}
        />
      ) : wikiAcquisitionState === "loading" ? (
        <section className="surface vendor-source-section">
          <div className="section-title">
            <Coins />
            <h3>Vendor Sources</h3>
          </div>
          <SkeletonRows />
        </section>
      ) : null}

      {showMarketSections ? (
        <section className="stat-grid">
          <Metric icon={<Coins />} label="Lowest Sell" value={<Money value={item.price.sells.unit_price} />} />
          <Metric icon={<TrendingUp />} label="Highest Buy" value={<Money value={item.price.buys.unit_price} />} />
          <Metric icon={<Hammer />} label="After Fees" value={<Money value={item.netSellPrice} />} />
          <Metric
            icon={<Boxes />}
            label="Spread"
            value={<Money value={Math.max(0, item.spread)} />}
            tone={item.spread > 0 ? "positive" : "muted"}
          />
        </section>
      ) : null}

      {showMarketSections ? (
        <ItemHistoryChart
          item={item}
          itemTransactions={itemTransactions}
          marketHistoryRevision={marketHistoryRevision}
        />
      ) : null}

      <RoutePlanner
        item={item}
        recipes={recipes}
        wikiGuide={wikiGuide}
        accountSnapshot={accountSnapshot}
      />

      {recipes.length ? (
        <IngredientMindMap
          item={item}
          recipes={recipes}
          accountSnapshot={accountSnapshot}
          wikiGuide={wikiGuide}
          onOpenDetail={onOpenDetail}
        />
      ) : null}

      {isLikelyContainer(item) ? (
        <ContainerSimulator
          container={item}
          catalog={catalog}
          analysis={containerAnalysis}
          state={containerState}
          onOpenDetail={onOpenDetail}
        />
      ) : null}

      {showSalvageProfile ? (
        <SalvageProfilePanel
          item={item}
          profile={salvageProfile}
          catalog={catalog}
        />
      ) : null}

      <section className={showMarketSections ? "split-section" : "single-section"}>
        {showMarketSections ? (
          <div className="surface">
            <div className="section-title">
              <Coins />
              <h3>Orders</h3>
            </div>
            {detailState === "loading" && !listings ? <SkeletonRows /> : null}
            {topBuy && topSell ? (
              <div className="order-grid">
                <OrderBook title="Buy Orders" rows={listings?.buys ?? []} />
                <OrderBook title="Sell Listings" rows={listings?.sells ?? []} />
              </div>
            ) : detailState !== "loading" ? (
              <p className="muted-copy">Current order book unavailable.</p>
            ) : null}
          </div>
        ) : null}
        <div className="surface">
          <div className="section-title">
            <BookOpen />
            <h3>Wiki Guide</h3>
          </div>
          {wikiGuide ? (
            <div className="wiki-box">
              <p>{wikiGuide.extract || "Wiki page found."}</p>
              <a href={wikiGuide.url} target="_blank" rel="noreferrer">
                Open {wikiGuide.title}
                <ExternalLink />
              </a>
            </div>
          ) : detailState === "loading" ? (
            <SkeletonRows />
          ) : (
            <p className="muted-copy">No wiki extract found for this item.</p>
          )}
        </div>
      </section>

      {showMarketSections ? (
        <section className="surface">
          <div className="section-title">
            <Coins />
            <h3>Personal Transactions</h3>
          </div>
          {itemTransactions ? (
            <TransactionSummary transactions={itemTransactions} />
          ) : (
            <p className="muted-copy">
              Add or analyze a key with tradingpost permission for personal item
              buy/sell history.
            </p>
          )}
        </section>
      ) : null}

      {showCraftingSections ? (
        <section className="surface">
          <div className="section-title">
            <Hammer />
            <h3>Crafting Routes</h3>
          </div>
          {recipes.length ? (
            <div className="recipe-list">
              {recipes.map((guide) => (
                <RecipeCard key={guide.recipe.id} guide={guide} accountSnapshot={accountSnapshot} />
              ))}
            </div>
          ) : detailState === "loading" ? (
            <SkeletonRows />
          ) : null}
        </section>
      ) : null}

      <RecipeUsageSections
        outputRecipes={recipes}
        usedInRecipes={usedInRecipes}
        recipeUsageState={recipeUsageState}
        accountSnapshot={accountSnapshot}
      />

      {showMarketSections ? (
        <section className="surface">
          <div className="section-title">
            <AlertCircle />
            <h3>History Coverage</h3>
          </div>
          <p className="muted-copy">
            The official GW2 API exposes current Trading Post orders and your own
            account transaction history with the right key scope. Global historical price
            charts need a local recorder or a third-party historical feed.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function VendorAcquisitionPanel({
  item,
  acquisition,
}: {
  item: MarketItem;
  acquisition: WikiItemAcquisition;
}) {
  const bestOffer = getBestVendorOffer(acquisition);
  const marketBuy = item.price.sells.unit_price || item.price.buys.unit_price || 0;
  if (!bestOffer) {
    return null;
  }

  const vendorCost = getVendorTotalCost(bestOffer, 1);
  const marketIsHigher = marketBuy > 0 && vendorCost < marketBuy;
  const offers = acquisition.vendorOffers.slice(0, 4);

  return (
    <section className="surface vendor-source-section">
      <div className="section-title">
        <Coins />
        <h3>Vendor Sources</h3>
      </div>
      <div className="vendor-source-summary">
        <div>
          <span>Best vendor</span>
          <VendorWikiLink offer={bestOffer} />
          <small>
            {bestOffer.zone || bestOffer.area || "Vendor location listed on the Wiki"}
          </small>
        </div>
        <div>
          <span>Vendor cost</span>
          <strong><Money value={vendorCost} /></strong>
          <small>{bestOffer.quantity > 1 ? bestOffer.costText : "Coin purchase"}</small>
        </div>
        {marketBuy > 0 ? (
          <div>
            <span>Market comparison</span>
            <strong className={marketIsHigher ? "profit" : ""}>
              {marketIsHigher ? (
                <>
                  Save <Money value={marketBuy - vendorCost} />
                </>
              ) : (
                "Market is cheaper"
              )}
            </strong>
            <small>Compared with current buy-from-listing price</small>
          </div>
        ) : null}
      </div>
      <div className="vendor-offer-list">
        {offers.map((offer) => (
          <div key={`${offer.vendor}-${offer.area ?? ""}-${offer.zone ?? ""}-${offer.cost}`}>
            <VendorWikiLink offer={offer} />
            <span>{offer.zone || offer.area || "Location listed on Wiki"}</span>
            <span>
              <Money value={getVendorTotalCost(offer, 1)} />
              {offer.quantity > 1 ? ` per ${offer.quantity.toLocaleString()}` : ""}
            </span>
          </div>
        ))}
      </div>
      <a className="inline-link" href={acquisition.sourceUrl} target="_blank" rel="noreferrer">
        Open Wiki acquisition
        <ExternalLink />
      </a>
    </section>
  );
}

function VendorWikiLink({ offer }: { offer: WikiVendorOffer }) {
  if (!offer.vendorUrl) {
    return <strong>{offer.vendor}</strong>;
  }

  return (
    <a className="vendor-wiki-link" href={offer.vendorUrl} target="_blank" rel="noreferrer">
      {offer.vendor}
      <ExternalLink />
    </a>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone?: "default" | "positive" | "muted";
}) {
  return (
    <div className={`metric-card ${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function buildMarketItemFromStoredPrice(item: Gw2Item): MarketItem | null {
  const price = getStoredPrice(item.id);
  if (!price) {
    return null;
  }

  const netSellPrice = Math.floor(price.sells.unit_price * 0.85);
  const spread = netSellPrice - price.buys.unit_price;

  return {
    ...item,
    price,
    netSellPrice,
    spread,
    spreadPercent: price.buys.unit_price > 0 ? (spread / price.buys.unit_price) * 100 : 0,
  };
}

function buildMarketItemForDetail(item: Gw2Item): MarketItem {
  const price =
    getStoredPrice(item.id) ?? {
      id: item.id,
      buys: { quantity: 0, unit_price: 0 },
      sells: { quantity: 0, unit_price: 0 },
    };
  const netSellPrice = Math.floor(price.sells.unit_price * 0.85);
  const spread = netSellPrice - price.buys.unit_price;

  return {
    ...item,
    price,
    netSellPrice,
    spread,
    spreadPercent: price.buys.unit_price > 0 ? (spread / price.buys.unit_price) * 100 : 0,
  };
}

function Money({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.round(value));
  const gold = Math.floor(safeValue / 10_000);
  const silver = Math.floor((safeValue % 10_000) / 100);
  const copper = safeValue % 100;

  return (
    <span className="money" aria-label={`${gold} gold ${silver} silver ${copper} copper`}>
      {gold > 0 ? (
        <span className="coin gold">
          <span className="coin-dot" />
          {gold}
        </span>
      ) : null}
      {gold > 0 || silver > 0 ? (
        <span className="coin silver">
          <span className="coin-dot" />
          {silver}
        </span>
      ) : null}
      <span className="coin copper">
        <span className="coin-dot" />
        {copper}
      </span>
    </span>
  );
}

function ItemHistoryChart({
  item,
  itemTransactions,
  marketHistoryRevision,
}: {
  item: MarketItem;
  itemTransactions: ItemTransactions | null;
  marketHistoryRevision: number;
}) {
  const [rangeId, setRangeId] = useState<HistoryRangeId>("6m");
  const [marketHistory, setMarketHistory] = useState<MarketHistoryPoint[]>([]);

  useEffect(() => {
    let ignore = false;

    recordMarketHistorySnapshot(item)
      .then((points) => {
        if (!ignore) {
          setMarketHistory(points);
        }
      })
      .catch(() => {
        if (!ignore) {
          void readMarketHistoryForItem(item.id).then((points) => {
            if (!ignore) {
              setMarketHistory(points);
            }
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [
    item.id,
    item.price.buys.quantity,
    item.price.buys.unit_price,
    item.price.sells.quantity,
    item.price.sells.unit_price,
    marketHistoryRevision,
  ]);

  const range =
    HISTORY_RANGES.find((entry) => entry.id === rangeId) ??
    HISTORY_RANGES.find((entry) => entry.id === "6m") ??
    HISTORY_RANGES[0];
  const visibleSnapshots = useMemo(
    () => filterMarketHistoryByRange(marketHistory, range),
    [marketHistory, range],
  );
  const personalEvents = useMemo(
    () => buildTransactionHistoryPoints(itemTransactions),
    [itemTransactions],
  );
  const chartPoints = useMemo(
    () => buildMarketChartPoints(visibleSnapshots),
    [visibleSnapshots],
  );
  const recentPersonalEvents = useMemo(
    () => filterChartPointsByRange(personalEvents, HISTORY_RANGES[0]),
    [personalEvents],
  );
  const lowestPurchase24h = getHistoryPriceExtreme(recentPersonalEvents, "purchase", "min");
  const highestSale24h = getHistoryPriceExtreme(recentPersonalEvents, "sale", "max");
  const allVisiblePoints = chartPoints.filter((point) => point.value > 0);
  const latestSnapshot = visibleSnapshots[visibleSnapshots.length - 1];
  const coverage = getHistoryCoverageLabel(chartPoints);

  return (
    <section className="surface history-panel">
      <div className="section-title history-title">
        <TrendingUp />
        <h3>Purchase and Posted History</h3>
        <span>
          {marketHistory.length.toLocaleString()} local snapshots -{" "}
          {personalEvents.length.toLocaleString()} personal events
        </span>
      </div>

      <div className="range-tabs" role="group" aria-label="History range">
        {HISTORY_RANGES.map((entry) => (
          <button
            key={entry.id}
            className={rangeId === entry.id ? "active" : ""}
            onClick={() => setRangeId(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="history-stats">
        <Metric
          icon={<TrendingUp />}
          label="Latest Buy"
          value={latestSnapshot ? <Money value={latestSnapshot.buyPrice} /> : "No snapshot"}
          tone={latestSnapshot ? "default" : "muted"}
        />
        <Metric
          icon={<Coins />}
          label="Latest Posted"
          value={latestSnapshot ? <Money value={latestSnapshot.sellPrice} /> : "No snapshot"}
          tone={latestSnapshot ? "default" : "muted"}
        />
        <Metric
          icon={<TrendingUp />}
          label="24H Lowest Purchase"
          value={lowestPurchase24h ? <Money value={lowestPurchase24h.value} /> : "No purchase"}
          tone={lowestPurchase24h ? "default" : "muted"}
        />
        <Metric
          icon={<Coins />}
          label="24H Highest Sale"
          value={highestSale24h ? <Money value={highestSale24h.value} /> : "No sale"}
          tone={highestSale24h ? "positive" : "muted"}
        />
        <Metric
          icon={<ListChecks />}
          label="Snapshots"
          value={visibleSnapshots.length.toLocaleString()}
          tone={visibleSnapshots.length ? "positive" : "muted"}
        />
        <Metric
          icon={<Database />}
          label="Coverage"
          value={coverage}
          tone={coverage === "No range data" ? "muted" : "default"}
        />
      </div>

      {allVisiblePoints.length ? (
        <>
          <HistorySvg snapshots={visibleSnapshots} range={range} />
          <div className="history-legend">
            <span className="legend-buy">Highest buy order</span>
            <span className="legend-sell">Lowest posted listing</span>
          </div>
        </>
      ) : (
        <p className="muted-copy">
          No Trading Post snapshots exist for this range yet. The app records local market snapshots
          when you open an item and during automatic market scans.
        </p>
      )}

      <p className="history-note">
        Global Trading Post history is not exposed by the official GW2 API. This chart uses locally
        observed posted-listing and buy-order snapshots.
      </p>
    </section>
  );
}

function HistorySvg({
  snapshots,
  range,
}: {
  snapshots: MarketHistoryPoint[];
  range: HistoryRange;
}) {
  type HistorySeriesPoint = {
    time: number;
    value: number;
    quantity: number;
    sampleCount: number;
  };
  type HistoryHoverPoint = {
    lineName: string;
    value: number;
    quantity: number;
    sampleCount: number;
    time: number;
    x: number;
    y: number;
    tone: "buy" | "sell";
  };
  type HistoryTooltipLayout = {
    left: number;
    top: number;
    anchorX: number;
    placement: "above" | "below";
  };
  const marketPoints = buildMarketChartPoints(snapshots);
  const points = marketPoints.filter((point) => point.value > 0);
  const [hoverPoint, setHoverPoint] = useState<HistoryHoverPoint | null>(null);
  const [tooltipLayout, setTooltipLayout] = useState<HistoryTooltipLayout | null>(null);
  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const width = 820;
  const height = 300;
  const padding = {
    top: 18,
    right: 22,
    bottom: 32,
    left: 96,
  };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const times = points.map((point) => point.time);
  const values = points.map((point) => point.value);
  const timeMin = Math.min(...times);
  const timeMax = Math.max(...times);
  const valueMin = Math.min(...values);
  const valueMax = Math.max(...values);
  const rangeCutoff = getHistoryRangeCutoff(range);
  const fixedRangeEnd = range.id === "all" ? null : Date.now();
  const timePad = rangeCutoff ? 0 : timeMin === timeMax ? 24 * 60 * 60 * 1000 : 0;
  const valuePad = valueMin === valueMax ? Math.max(1, valueMin * 0.08) : (valueMax - valueMin) * 0.08;
  const xMin = rangeCutoff ?? timeMin - timePad;
  const xMax = fixedRangeEnd ?? timeMax + timePad;
  const yMin = Math.max(0, valueMin - valuePad);
  const yMax = valueMax + valuePad;
  const shouldAverageSeries = shouldAverageHistoryRange(range);
  const xFor = (time: number) => {
    return padding.left + ((time - xMin) / Math.max(1, xMax - xMin)) * plotWidth;
  };
  const yFor = (value: number) => {
    return padding.top + (1 - (value - yMin) / Math.max(1, yMax - yMin)) * plotHeight;
  };
  const buySeries = snapshots
    .filter((point) => point.buyPrice > 0)
    .map((point) => ({
      time: new Date(point.recordedAt).getTime(),
      value: point.buyPrice,
      quantity: point.buyQuantity,
      sampleCount: Math.max(1, point.sampleCount ?? 1),
    }));
  const sellSeries = snapshots
    .filter((point) => point.sellPrice > 0)
    .map((point) => ({
      time: new Date(point.recordedAt).getTime(),
      value: point.sellPrice,
      quantity: point.sellQuantity,
      sampleCount: Math.max(1, point.sampleCount ?? 1),
    }));
  const plottedBuySeries = shouldAverageSeries
    ? averageHistorySeriesToBuckets(buySeries, xMin, xMax)
    : buySeries;
  const plottedSellSeries = shouldAverageSeries
    ? averageHistorySeriesToBuckets(sellSeries, xMin, xMax)
    : sellSeries;
  const axisTicks = buildHistoryAxisTicks(xMin, xMax, range);
  const valueTicks = buildHistoryValueTicks(yMin, yMax, 4);
  const tooltipPlacement = tooltipLayout?.placement ?? (hoverPoint && hoverPoint.y < 82 ? "below" : "above");
  const tooltipStyle = hoverPoint
    ? ({
        left: `${tooltipLayout?.left ?? 0}px`,
        top: `${tooltipLayout?.top ?? 0}px`,
        "--history-tooltip-anchor": `${tooltipLayout?.anchorX ?? 94}px`,
        visibility: tooltipLayout ? "visible" : "hidden",
      } satisfies CSSProperties & { "--history-tooltip-anchor": string })
    : undefined;
  const showHoverPoint = (point: HistoryHoverPoint) => {
    setTooltipLayout(null);
    setHoverPoint(point);
  };

  useLayoutEffect(() => {
    if (!hoverPoint || !chartWrapRef.current || !chartSvgRef.current || !tooltipRef.current) {
      setTooltipLayout(null);
      return;
    }

    const edgePadding = 8;
    const pointerGap = 16;
    const minAnchorPadding = 14;
    const wrapRect = chartWrapRef.current.getBoundingClientRect();
    const svgRect = chartSvgRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const pointX = svgRect.left - wrapRect.left + (hoverPoint.x / width) * svgRect.width;
    const pointY = svgRect.top - wrapRect.top + (hoverPoint.y / height) * svgRect.height;
    const availableAbove = pointY - edgePadding;
    const availableBelow = wrapRect.height - pointY - edgePadding;
    let placement: HistoryTooltipLayout["placement"] =
      availableAbove >= tooltipRect.height + pointerGap || availableAbove >= availableBelow ? "above" : "below";
    let top =
      placement === "above"
        ? pointY - tooltipRect.height - pointerGap
        : pointY + pointerGap;

    if (top < edgePadding) {
      placement = "below";
      top = pointY + pointerGap;
    }
    if (top + tooltipRect.height > wrapRect.height - edgePadding && pointY - tooltipRect.height - pointerGap >= edgePadding) {
      placement = "above";
      top = pointY - tooltipRect.height - pointerGap;
    }

    const left = clampNumber(pointX - tooltipRect.width / 2, edgePadding, wrapRect.width - tooltipRect.width - edgePadding);
    const clampedTop = clampNumber(top, edgePadding, Math.max(edgePadding, wrapRect.height - tooltipRect.height - edgePadding));
    const anchorX = clampNumber(pointX - left, minAnchorPadding, tooltipRect.width - minAnchorPadding);

    setTooltipLayout({
      left,
      top: clampedTop,
      anchorX,
      placement,
    });
  }, [hoverPoint]);

  return (
    <div className="history-chart-wrap" ref={chartWrapRef}>
      <svg
        className="history-chart"
        ref={chartSvgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Item history chart"
      >
        {valueTicks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={`grid-${tick}`}>
              <line className="chart-grid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chart-y-label" x={padding.left - 12} y={y + 4} textAnchor="end">
                {formatCoinText(tick)}
              </text>
            </g>
          );
        })}
        <path className="history-line buy-line" d={buildChartPath(plottedBuySeries, xFor, yFor)} />
        <path className="history-line sell-line" d={buildChartPath(plottedSellSeries, xFor, yFor)} />
        {plottedBuySeries.map((point) => {
          const x = xFor(point.time);
          const y = yFor(point.value);
          return (
            <g
              key={`buy-${point.time}-${point.value}-${point.quantity}`}
              onMouseEnter={() =>
                showHoverPoint({
                  lineName: "Highest buy order",
                  value: point.value,
                  quantity: point.quantity,
                  sampleCount: point.sampleCount,
                  time: point.time,
                  x,
                  y,
                  tone: "buy",
                })
              }
              onMouseLeave={() => setHoverPoint(null)}
              onFocus={() =>
                showHoverPoint({
                  lineName: "Highest buy order",
                  value: point.value,
                  quantity: point.quantity,
                  sampleCount: point.sampleCount,
                  time: point.time,
                  x,
                  y,
                  tone: "buy",
                })
              }
              onBlur={() => setHoverPoint(null)}
              tabIndex={0}
            >
              <circle className="history-dot-hit" cx={x} cy={y} r="12" />
              <circle className="history-dot buy-dot" cx={x} cy={y} r="4" />
            </g>
          );
        })}
        {plottedSellSeries.map((point) => {
          const x = xFor(point.time);
          const y = yFor(point.value);
          return (
            <g
              key={`sell-${point.time}-${point.value}-${point.quantity}`}
              onMouseEnter={() =>
                showHoverPoint({
                  lineName: "Lowest posted listing",
                  value: point.value,
                  quantity: point.quantity,
                  sampleCount: point.sampleCount,
                  time: point.time,
                  x,
                  y,
                  tone: "sell",
                })
              }
              onMouseLeave={() => setHoverPoint(null)}
              onFocus={() =>
                showHoverPoint({
                  lineName: "Lowest posted listing",
                  value: point.value,
                  quantity: point.quantity,
                  sampleCount: point.sampleCount,
                  time: point.time,
                  x,
                  y,
                  tone: "sell",
                })
              }
              onBlur={() => setHoverPoint(null)}
              tabIndex={0}
            >
              <circle className="history-dot-hit" cx={x} cy={y} r="12" />
              <circle className="history-dot sell-dot" cx={x} cy={y} r="4" />
            </g>
          );
        })}
      </svg>
      {hoverPoint ? (
        <div
          className={`history-tooltip ${hoverPoint.tone} ${tooltipPlacement}`}
          ref={tooltipRef}
          style={tooltipStyle}
        >
          <strong>{hoverPoint.lineName}</strong>
          <span><Money value={hoverPoint.value} /></span>
          <small>Quantity {hoverPoint.quantity.toLocaleString()}</small>
          <small>{formatHistoryTooltipDate(hoverPoint.time)}</small>
          {hoverPoint.sampleCount > 1 ? (
            <small>{hoverPoint.sampleCount.toLocaleString()} averaged samples</small>
          ) : null}
        </div>
      ) : null}
      <div className="chart-date-row">
        {axisTicks.map((tick) => (
          <span key={tick.time}>{tick.label}</span>
        ))}
      </div>
    </div>
  );
}

function clampNumber(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function buildChartPath(
  series: Array<{ time: number; value: number }>,
  xFor: (time: number) => number,
  yFor: (value: number) => number,
): string {
  return series
    .sort((left, right) => left.time - right.time)
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xFor(point.time).toFixed(2)} ${yFor(point.value).toFixed(2)}`;
    })
    .join(" ");
}

function shouldAverageHistoryRange(range: HistoryRange): boolean {
  return range.id !== "24h";
}

function averageHistorySeriesToBuckets<T extends { time: number; value: number; quantity: number; sampleCount: number }>(
  series: T[],
  xMin: number,
  xMax: number,
): T[] {
  if (series.length <= 1) {
    return series;
  }

  const bucketCount = 24;
  const span = Math.max(1, xMax - xMin);
  const bucketStep = span / Math.max(1, bucketCount - 1);
  const buckets = new Map<number, T[]>();

  for (const point of series) {
    const bucketIndex = Math.min(
      bucketCount - 1,
      Math.max(0, Math.round((point.time - xMin) / bucketStep)),
    );
    const bucket = buckets.get(bucketIndex) ?? [];
    bucket.push(point);
    buckets.set(bucketIndex, bucket);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([bucketIndex, bucket]) => {
      const totalSamples = bucket.reduce((sum, point) => sum + Math.max(1, point.sampleCount), 0);
      const weightedValue = bucket.reduce(
        (sum, point) => sum + point.value * Math.max(1, point.sampleCount),
        0,
      );
      const weightedQuantity = bucket.reduce(
        (sum, point) => sum + point.quantity * Math.max(1, point.sampleCount),
        0,
      );
      const bucketTime = xMin + bucketIndex * bucketStep;

      return {
        ...bucket[0],
        time: bucketTime,
        value: Math.round(weightedValue / Math.max(1, totalSamples)),
        quantity: Math.round(weightedQuantity / Math.max(1, totalSamples)),
        sampleCount: totalSamples,
      };
    });
}

function buildHistoryAxisTicks(
  xMin: number,
  xMax: number,
  range: HistoryRange,
): Array<{ time: number; label: string }> {
  const tickCount = 12;
  const span = Math.max(1, xMax - xMin);

  return Array.from({ length: tickCount }, (_, index) => {
    const time = xMin + (span * index) / Math.max(1, tickCount - 1);
    return {
      time,
      label: formatHistoryAxisDate(time, range),
    };
  });
}

function buildHistoryValueTicks(yMin: number, yMax: number, tickCount: number): number[] {
  const safeTickCount = Math.max(2, tickCount);
  const span = Math.max(1, yMax - yMin);

  return Array.from({ length: safeTickCount }, (_, index) => {
    const value = yMax - (span * index) / Math.max(1, safeTickCount - 1);
    return Math.max(0, Math.round(value));
  });
}

function formatHistoryAxisDate(time: number, range: HistoryRange): string {
  const date = new Date(time);
  if (range.id === "24h") {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatHistoryTooltipDate(time: number): string {
  const date = new Date(time);
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}, ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

function formatCoinText(value: number): string {
  const safeValue = Math.max(0, Math.round(value));
  const gold = Math.floor(safeValue / 10_000);
  const silver = Math.floor((safeValue % 10_000) / 100);
  const copper = safeValue % 100;
  const parts: string[] = [];

  if (gold > 0) {
    parts.push(`${gold}g`);
  }

  if (gold > 0 || silver > 0) {
    parts.push(`${silver}s`);
  }

  parts.push(`${copper}c`);
  return parts.join(" ");
}

async function migrateLocalStorageMarketHistory() {
  if (!window.gw2Desktop?.migrateMarketHistory) {
    return;
  }

  const raw = window.localStorage.getItem(MARKET_HISTORY_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const points = parseMarketHistoryImport(raw);
    if (points.length > 0) {
      await window.gw2Desktop.migrateMarketHistory(points);
    }

    window.localStorage.removeItem(MARKET_HISTORY_STORAGE_KEY);
  } catch {
    // Keep the old localStorage blob if it cannot be migrated.
  }
}

async function readAllMarketHistory(): Promise<MarketHistoryPoint[]> {
  if (window.gw2Desktop?.listMarketHistory) {
    try {
      const points = await window.gw2Desktop.listMarketHistory();
      return points.filter(isMarketHistoryPoint);
    } catch {
      return readMarketHistoryStore();
    }
  }

  return readMarketHistoryStore();
}

async function readMarketHistoryForItem(itemId: number): Promise<MarketHistoryPoint[]> {
  if (window.gw2Desktop?.loadMarketHistoryForItem) {
    try {
      const points = await window.gw2Desktop.loadMarketHistoryForItem(itemId);
      return points.filter(isMarketHistoryPoint);
    } catch {
      return readMarketHistoryStore()
        .filter((point) => point.itemId === itemId)
        .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime());
    }
  }

  return readMarketHistoryStore()
    .filter((point) => point.itemId === itemId)
    .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime());
}

function readMarketHistoryStore(): MarketHistoryPoint[] {
  try {
    const raw = window.localStorage.getItem(MARKET_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const points = parsed.filter(isMarketHistoryPoint);
    const compacted = trimMarketHistoryStore(points);

    const shouldRewrite =
      compacted.length !== points.length ||
      compacted.some((point, index) => {
        const original = points[index];
        return (
          !original ||
          point.recordedAt !== original.recordedAt ||
          point.rollup !== original.rollup ||
          point.sampleCount !== original.sampleCount
        );
      });

    if (shouldRewrite) {
      writeMarketHistoryStore(compacted);
    }

    return compacted;
  } catch {
    return [];
  }
}

function writeMarketHistoryStore(points: MarketHistoryPoint[]) {
  try {
    window.localStorage.setItem(MARKET_HISTORY_STORAGE_KEY, JSON.stringify(points));
  } catch {
    // A full or blocked localStorage should not break the item detail page.
  }
}

function parseMarketHistoryImport(text: string): MarketHistoryPoint[] {
  const parsed = JSON.parse(text) as unknown;
  const points =
    Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { points?: unknown }).points)
        ? (parsed as { points: unknown[] }).points
        : null;

  if (!points) {
    throw new Error("This file does not look like a Tyria Ledger market history export.");
  }

  return points.filter(isMarketHistoryPoint);
}

function mergeMarketHistoryPoints(
  currentPoints: MarketHistoryPoint[],
  importedPoints: MarketHistoryPoint[],
): { points: MarketHistoryPoint[]; added: number; ignored: number } {
  const currentDayKeys = new Set(
    currentPoints
      .map(getMarketHistoryDayKey)
      .filter((key): key is string => Boolean(key)),
  );
  const importedDayKeys = new Set<string>();
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

  return {
    points: trimMarketHistoryStore(merged),
    added,
    ignored,
  };
}

function importMarketHistoryToLocalStore(importedPoints: MarketHistoryPoint[]): MarketHistoryImportResult {
  const result = mergeMarketHistoryPoints(readMarketHistoryStore(), importedPoints);
  writeMarketHistoryStore(result.points);
  return {
    added: result.added,
    ignored: result.ignored,
    total: result.points.length,
  };
}

function getMarketHistoryDayKey(point: MarketHistoryPoint): string | null {
  const time = new Date(point.recordedAt).getTime();
  if (!Number.isFinite(time)) {
    return null;
  }

  return `${point.itemId}:${new Date(time).toISOString().slice(0, 10)}`;
}

function trimMarketHistoryStore(points: MarketHistoryPoint[]): MarketHistoryPoint[] {
  const compacted = compactMarketHistoryStore(points);
  const groups = new Map<number, MarketHistoryPoint[]>();

  for (const point of compacted) {
    if (!getMarketHistoryDayKey(point)) {
      continue;
    }

    const group = groups.get(point.itemId) ?? [];
    group.push(point);
    groups.set(point.itemId, group);
  }

  return Array.from(groups.values()).flatMap((group) =>
    group
      .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime())
      .slice(-MAX_MARKET_HISTORY_POINTS_PER_ITEM),
  );
}

function compactMarketHistoryStore(points: MarketHistoryPoint[], now = Date.now()): MarketHistoryPoint[] {
  const byItem = new Map<number, MarketHistoryPoint[]>();

  for (const point of points) {
    const time = new Date(point.recordedAt).getTime();
    if (!Number.isFinite(time)) {
      continue;
    }

    const group = byItem.get(point.itemId) ?? [];
    group.push(point);
    byItem.set(point.itemId, group);
  }

  return Array.from(byItem.values()).flatMap((itemPoints) => compactItemHistory(itemPoints, now));
}

function compactItemHistory(points: MarketHistoryPoint[], now: number): MarketHistoryPoint[] {
  const rawPoints: MarketHistoryPoint[] = [];
  const buckets = new Map<string, MarketHistoryPoint[]>();

  for (const point of points) {
    const time = new Date(point.recordedAt).getTime();
    if (!Number.isFinite(time)) {
      continue;
    }

    const rollup = getMarketHistoryRollup(time, now);
    if (rollup === "raw") {
      rawPoints.push({
        ...point,
        rollup: "raw",
        sampleCount: Math.max(1, point.sampleCount ?? 1),
      });
      continue;
    }

    const bucketStart = getMarketHistoryBucketStart(time, rollup);
    const bucketKey = `${point.itemId}:${rollup}:${bucketStart}`;
    const bucket = buckets.get(bucketKey) ?? [];
    bucket.push(point);
    buckets.set(bucketKey, bucket);
  }

  const rolledPoints = Array.from(buckets.entries()).map(([key, bucketPoints]) => {
    const [, rollup, bucketStartText] = key.split(":");
    return averageMarketHistoryBucket(
      bucketPoints[0].itemId,
      Number(bucketStartText),
      rollup as Exclude<MarketHistoryRollup, "raw">,
      bucketPoints,
    );
  });

  return [...rawPoints, ...rolledPoints].sort(
    (left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime(),
  );
}

function getMarketHistoryRollup(time: number, now: number): MarketHistoryRollup {
  const age = Math.max(0, now - time);

  if (age <= MARKET_HISTORY_RAW_WINDOW_MS) {
    return "raw";
  }

  if (age <= MARKET_HISTORY_DAILY_WINDOW_MS) {
    return "day";
  }

  if (age <= MARKET_HISTORY_WEEKLY_WINDOW_MS) {
    return "week";
  }

  return "month";
}

function getMarketHistoryBucketStart(time: number, rollup: Exclude<MarketHistoryRollup, "raw">): number {
  const date = new Date(time);

  if (rollup === "day") {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }

  if (rollup === "week") {
    const day = date.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + mondayOffset);
  }

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function getMarketHistoryBucketRecordedAt(
  bucketStart: number,
  rollup: Exclude<MarketHistoryRollup, "raw">,
): string {
  const offset =
    rollup === "day"
      ? 12 * 60 * 60 * 1000
      : rollup === "week"
        ? 3.5 * 24 * 60 * 60 * 1000
        : 15 * 24 * 60 * 60 * 1000;

  return new Date(bucketStart + offset).toISOString();
}

function averageMarketHistoryBucket(
  itemId: number,
  bucketStart: number,
  rollup: Exclude<MarketHistoryRollup, "raw">,
  points: MarketHistoryPoint[],
): MarketHistoryPoint {
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

function isMarketHistoryPoint(value: unknown): value is MarketHistoryPoint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const point = value as Partial<MarketHistoryPoint>;
  return (
    typeof point.itemId === "number" &&
    typeof point.recordedAt === "string" &&
    typeof point.buyPrice === "number" &&
    typeof point.sellPrice === "number" &&
    typeof point.buyQuantity === "number" &&
    typeof point.sellQuantity === "number" &&
    (point.rollup === undefined ||
      point.rollup === "raw" ||
      point.rollup === "day" ||
      point.rollup === "week" ||
      point.rollup === "month") &&
    (point.sampleCount === undefined ||
      (typeof point.sampleCount === "number" && Number.isFinite(point.sampleCount) && point.sampleCount > 0))
  );
}

async function recordMarketHistorySnapshot(item: MarketItem): Promise<MarketHistoryPoint[]> {
  const now = Date.now();
  const nextPoint: MarketHistoryPoint = {
    itemId: item.id,
    recordedAt: new Date(now).toISOString(),
    buyPrice: item.price.buys.unit_price,
    sellPrice: item.price.sells.unit_price,
    buyQuantity: item.price.buys.quantity,
    sellQuantity: item.price.sells.quantity,
    rollup: "raw",
    sampleCount: 1,
  };

  if (window.gw2Desktop?.recordMarketHistory) {
    try {
      const points = await window.gw2Desktop.recordMarketHistory(nextPoint);
      return points.filter(isMarketHistoryPoint);
    } catch {
      return recordMarketHistorySnapshotToLocalStore(item, nextPoint, now);
    }
  }

  return recordMarketHistorySnapshotToLocalStore(item, nextPoint, now);
}

function recordMarketHistorySnapshotToLocalStore(
  item: MarketItem,
  nextPoint: MarketHistoryPoint,
  now: number,
): MarketHistoryPoint[] {
  const store = readMarketHistoryStore();
  const otherItems = store.filter((point) => point.itemId !== item.id);
  const itemPoints = store
    .filter((point) => point.itemId === item.id)
    .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime());
  const lastPoint = itemPoints[itemPoints.length - 1];

  if (lastPoint) {
    const lastTime = new Date(lastPoint.recordedAt).getTime();
    const samePrice =
      lastPoint.buyPrice === nextPoint.buyPrice &&
      lastPoint.sellPrice === nextPoint.sellPrice &&
      lastPoint.buyQuantity === nextPoint.buyQuantity &&
      lastPoint.sellQuantity === nextPoint.sellQuantity;

    if (samePrice && now - lastTime < 6 * 60 * 60 * 1000) {
      return itemPoints;
    }

    if (now - lastTime < MARKET_HISTORY_REPLACE_WINDOW_MS) {
      itemPoints[itemPoints.length - 1] = nextPoint;
    } else {
      itemPoints.push(nextPoint);
    }
  } else {
    itemPoints.push(nextPoint);
  }

  const compactedStore = trimMarketHistoryStore([...otherItems, ...itemPoints]);
  writeMarketHistoryStore(compactedStore);
  return compactedStore
    .filter((point) => point.itemId === item.id)
    .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime());
}

function filterMarketHistoryByRange(
  points: MarketHistoryPoint[],
  range: HistoryRange,
): MarketHistoryPoint[] {
  const cutoff = getHistoryRangeCutoff(range);
  if (!cutoff) {
    return points;
  }

  return points.filter((point) => new Date(point.recordedAt).getTime() >= cutoff);
}

function filterChartPointsByRange(points: ChartPoint[], range: HistoryRange): ChartPoint[] {
  const cutoff = getHistoryRangeCutoff(range);
  if (!cutoff) {
    return points;
  }

  return points.filter((point) => point.time >= cutoff);
}

function getHistoryRangeCutoff(range: HistoryRange): number | null {
  if (range.hours) {
    return Date.now() - range.hours * 60 * 60 * 1000;
  }

  if (range.days) {
    return Date.now() - range.days * 24 * 60 * 60 * 1000;
  }

  return null;
}

function buildMarketChartPoints(points: MarketHistoryPoint[]): ChartPoint[] {
  return points.flatMap((point) => {
    const time = new Date(point.recordedAt).getTime();
    return [
      {
        id: `${point.itemId}-${point.recordedAt}-buy`,
        label: "Highest buy order",
        kind: "buy" as const,
        time,
        value: point.buyPrice,
        quantity: point.buyQuantity,
      },
      {
        id: `${point.itemId}-${point.recordedAt}-sell`,
        label: "Lowest posted listing",
        kind: "sell" as const,
        time,
        value: point.sellPrice,
        quantity: point.sellQuantity,
      },
    ];
  });
}

function buildTransactionHistoryPoints(transactions: ItemTransactions | null): ChartPoint[] {
  if (!transactions) {
    return [];
  }

  const groups = [
    { rows: transactions.historyBuys, label: "Your purchase", kind: "purchase" as const },
    { rows: transactions.historySells, label: "Your sale", kind: "sale" as const },
    { rows: transactions.currentBuys, label: "Posted buy order", kind: "posted-buy" as const },
    { rows: transactions.currentSells, label: "Posted sell listing", kind: "posted-sell" as const },
  ];

  return groups.flatMap((group) => {
    const points: ChartPoint[] = [];

    for (const transaction of group.rows) {
      const time = new Date(transaction.purchased ?? transaction.created).getTime();
      if (!Number.isFinite(time) || transaction.price <= 0) {
        continue;
      }

      points.push({
        id: `${group.kind}-${transaction.id}`,
        label: group.label,
        kind: group.kind,
        time,
        value: transaction.price,
        quantity: transaction.quantity,
      });
    }

    return points;
  });
}

function getHistoryPriceExtreme(
  points: ChartPoint[],
  kind: ChartPoint["kind"],
  mode: "min" | "max",
): ChartPoint | null {
  const candidates = points.filter((point) => point.kind === kind && point.value > 0);
  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((best, point) =>
    mode === "min"
      ? point.value < best.value
        ? point
        : best
      : point.value > best.value
        ? point
        : best,
  );
}

function getHistoryCoverageLabel(points: ChartPoint[]): string {
  const valid = points.filter((point) => Number.isFinite(point.time));
  if (valid.length === 0) {
    return "No range data";
  }

  const times = valid.map((point) => point.time);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const days = Math.max(1, Math.ceil((max - min) / (24 * 60 * 60 * 1000)));

  if (days >= 365) {
    return `${(days / 365).toFixed(1)} years`;
  }

  if (days >= 31) {
    return `${Math.round(days / 31)} months`;
  }

  return days === 1 ? "1 day" : `${days} days`;
}

function OrderBook({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ listings: number; unit_price: number; quantity: number }>;
}) {
  return (
    <div className="order-book">
      <h4>{title}</h4>
      <div className="order-heading" aria-hidden="true">
        <span>Price</span>
        <span>Qty</span>
        <span>Listings</span>
      </div>
      <div className="order-list">
        {rows.slice(0, 60).map((row) => (
          <div key={`${title}-${row.unit_price}-${row.quantity}`} className="order-row">
            <span className="order-price"><Money value={row.unit_price} /></span>
            <span title="Quantity available at this price">{row.quantity.toLocaleString()}</span>
            <span title="Number of listings at this price">{row.listings.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionSummary({ transactions }: { transactions: ItemTransactions }) {
  const groups = [
    { label: "Current Buys", rows: transactions.currentBuys },
    { label: "Current Sells", rows: transactions.currentSells },
    { label: "Bought", rows: transactions.historyBuys },
    { label: "Sold", rows: transactions.historySells },
  ];
  const hasRows = groups.some((group) => group.rows.length > 0);

  if (!hasRows) {
    return <p className="muted-copy">No matching personal Trading Post transactions found.</p>;
  }

  return (
    <div className="transaction-grid">
      {groups.map((group) => (
        <div key={group.label} className="transaction-group">
          <h4>{group.label}</h4>
          {group.rows.slice(0, 5).map((transaction) => (
            <div key={`${group.label}-${transaction.id}`} className="transaction-row">
              <span><Money value={transaction.price} /></span>
              <span>{transaction.quantity.toLocaleString()}</span>
              <span>
                {new Date(transaction.purchased ?? transaction.created).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function isLikelyContainer(item: Gw2Item): boolean {
  const name = item.name.toLowerCase();
  return (
    item.type === "Container" ||
    /unidentified gear/.test(name) ||
    /\b(bag|box|cache|chest|container|coffer|crate|package|sack|satchel)\b/.test(name)
  );
}

function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+\(.+?\)$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findMarketItemForDrop(drop: ContainerDrop, catalog: MarketItem[]): MarketItem | undefined {
  if (typeof drop.itemId === "number") {
    const byId = catalog.find((item) => item.id === drop.itemId);
    if (byId) {
      return byId;
    }
  }

  const normalized = normalizeItemName(drop.name);
  const exact = catalog.find((item) => normalizeItemName(item.name) === normalized);
  if (exact) {
    return exact;
  }

  return catalog.find((item) => {
    const itemName = normalizeItemName(item.name);
    return itemName.includes(normalized) || normalized.includes(itemName);
  });
}

function findDetailItemForDrop(drop: ContainerDrop, marketItem: MarketItem | undefined): Gw2Item | MarketItem | { name: string } {
  if (marketItem) {
    return marketItem;
  }

  if (typeof drop.itemId === "number") {
    const storedItem = getStoredItem(drop.itemId);
    if (storedItem) {
      return storedItem;
    }
  }

  return {
    name: drop.officialName ?? drop.name,
  };
}

function hasTradingPostPrice(item: MarketItem): boolean {
  return item.price.sells.unit_price > 0 || item.price.buys.unit_price > 0;
}

function estimateSalvageUnitValue(item: MarketItem | undefined, directUnitValue: number): number {
  if (!item || item.flags?.includes("NoSalvage")) {
    return 0;
  }

  const salvageTypes = new Set(["Armor", "Weapon", "Trinket", "UpgradeComponent"]);
  const likelySalvageable =
    salvageTypes.has(item.type) || /unidentified gear|salvage/i.test(item.name);
  if (!likelySalvageable) {
    return 0;
  }

  const rarityMultiplier: Record<string, number> = {
    Basic: 0.35,
    Fine: 0.55,
    Masterwork: 0.65,
    Rare: 0.75,
    Exotic: 0.82,
    Ascended: 0,
    Legendary: 0,
  };

  return Math.floor(directUnitValue * (rarityMultiplier[item.rarity] ?? 0.55));
}

function dropQuantityAverage(drop: ContainerDrop): number {
  return (drop.quantityMin + drop.quantityMax) / 2;
}

function summarizeDropValues(
  rows: Array<{
    drop: ContainerDrop;
    directUnitValue: number;
    salvageUnitValue: number;
  }>,
  openingCount: number,
  mode: "direct" | "salvage",
) {
  const values = rows
    .map((row) => {
      const unit = mode === "direct" ? row.directUnitValue : row.salvageUnitValue;
      return {
        min: row.drop.quantityMin * unit,
        avg: dropQuantityAverage(row.drop) * unit,
        max: row.drop.quantityMax * unit,
        chancePct: row.drop.chancePct,
        unit,
      };
    })
    .filter((row) => row.unit > 0);

  if (values.length === 0) {
    return {
      min: 0,
      avg: 0,
      max: 0,
    };
  }

  const hasAnyChance = values.some((row) => row.chancePct !== undefined);

  if (hasAnyChance) {
    return {
      min: 0,
      avg:
        values.reduce((sum, row) => {
          const chance = (row.chancePct ?? 0) / 100;
          return sum + row.avg * chance;
        }, 0) * openingCount,
      max: values.reduce((sum, row) => sum + row.max, 0) * openingCount,
    };
  }

  return {
    min: Math.min(...values.map((row) => row.min)) * openingCount,
    avg: (values.reduce((sum, row) => sum + row.avg, 0) / values.length) * openingCount,
    max: Math.max(...values.map((row) => row.max)) * openingCount,
  };
}

function ContainerSimulator({
  container,
  catalog,
  analysis,
  state,
  onOpenDetail,
}: {
  container: MarketItem;
  catalog: MarketItem[];
  analysis: ContainerAnalysis | null;
  state: LoadState;
  onOpenDetail?: (item: Gw2Item) => void;
}) {
  const [openingCount, setOpeningCount] = useState(100);
  const valuedDrops = useMemo(() => {
    const drops = analysis?.drops ?? [];
    return drops.map((drop) => {
      const marketItem = findMarketItemForDrop(drop, catalog);
      const detailItem = findDetailItemForDrop(drop, marketItem);
      const directUnitValue = drop.coinValue ?? marketItem?.netSellPrice ?? marketItem?.price.buys.unit_price ?? 0;
      const salvageUnitValue = drop.coinValue
        ? drop.coinValue
        : estimateSalvageUnitValue(marketItem, directUnitValue);

      return {
        drop,
        marketItem,
        detailItem,
        directUnitValue,
        salvageUnitValue,
      };
    });
  }, [analysis, catalog]);
  const directStats = summarizeDropValues(valuedDrops, openingCount, "direct");
  const salvageStats = summarizeDropValues(valuedDrops, openingCount, "salvage");
  const pricedRows = valuedDrops.filter((row) => row.directUnitValue > 0).length;
  const resolvedRows = valuedDrops.filter((row) => "id" in row.detailItem).length;

  return (
    <section className="surface container-simulator">
      <div className="section-title">
        <PackageSearch />
        <h3>Container / Bag Simulator</h3>
      </div>

      {state === "loading" ? (
        <SkeletonRows />
      ) : analysis ? (
        <>
          <div className="simulator-head">
            <div>
              <strong>{analysis.title}</strong>
              <span>
                {analysis.exactChancesAvailable
                  ? "Some drop chances were parsed from the wiki."
                  : "Exact chances were not available; averages use listed market-matched drops."}
              </span>
            </div>
            <label className="opening-input">
              Opens
              <input
                type="number"
                min="1"
                step="1"
                value={openingCount}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setOpeningCount(Number.isFinite(nextValue) ? Math.max(1, nextValue) : 1);
                }}
              />
            </label>
          </div>

          <div className="preset-row">
            {[1, 100, 250, 1000].map((count) => (
              <button key={count} onClick={() => setOpeningCount(count)}>
                {count.toLocaleString()}
              </button>
            ))}
            <a href={analysis.sourceUrl} target="_blank" rel="noreferrer">
              Wiki source
              <ExternalLink />
            </a>
          </div>

          <div className="simulator-stats">
            <LootStat title="Sell drops" stats={directStats} />
            <LootStat title="Salvage then sell" stats={salvageStats} />
          </div>

          <p className="simulator-note">
            Resolved {resolvedRows.toLocaleString()} of {valuedDrops.length.toLocaleString()} parsed rows to official item records.
            {" "}
            {pricedRows.toLocaleString()} rows currently have Trading Post value.
            Salvage values are estimates unless exact salvage outputs are available from a future data source.
          </p>

          <div className="loot-table">
            <div className="loot-row loot-header">
              <span>Possible drop</span>
              <span>Chance</span>
              <span>Sell value</span>
              <span>Salvage estimate</span>
            </div>
            {valuedDrops.length ? (
              valuedDrops.map((row) => {
                const canOpenDetail = "id" in row.detailItem && typeof row.detailItem.id === "number";
                return (
                <div
                  key={`${row.drop.name}-${row.drop.quantityMin}-${row.drop.quantityMax}`}
                  className={`loot-row ${canOpenDetail ? "selectable-loot-row" : ""}`}
                  onClick={() => {
                    if (canOpenDetail) {
                      onOpenDetail?.(row.detailItem as Gw2Item);
                    }
                  }}
                >
                  <span className="loot-item">
                    <ItemIcon item={row.detailItem} />
                    <span>
                      <strong>{row.marketItem?.name ?? row.drop.officialName ?? row.drop.name}</strong>
                      <small>
                        {row.drop.quantityMin === row.drop.quantityMax
                          ? `${row.drop.quantityMin} per open`
                          : `${row.drop.quantityMin}-${row.drop.quantityMax} per open`}
                      </small>
                    </span>
                  </span>
                  <span>{row.drop.chancePct !== undefined ? `${row.drop.chancePct}%` : "Unknown"}</span>
                  <span>{row.directUnitValue ? <Money value={row.directUnitValue} /> : "Not tradable"}</span>
                  <span>{row.salvageUnitValue ? <Money value={row.salvageUnitValue} /> : "Unavailable"}</span>
                </div>
                );
              })
            ) : (
              <p className="muted-copy">
                No structured loot rows were found. The wiki guide may still describe this container in prose.
              </p>
            )}
          </div>

          <div className="parser-notes">
            {analysis.parserNotes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>
        </>
      ) : (
        <p className="muted-copy">
          No structured loot table was found for {container.name}. If the wiki only lists the
          contents in prose, the app will show market data once a structured parser can identify it.
        </p>
      )}
    </section>
  );
}

function LootStat({
  title,
  stats,
}: {
  title: string;
  stats: {
    min: number;
    avg: number;
    max: number;
  };
}) {
  return (
    <article className="loot-stat">
      <h4>{title}</h4>
      <div>
        <span>Min</span>
        <strong><Money value={stats.min} /></strong>
      </div>
      <div>
        <span>Average</span>
        <strong><Money value={stats.avg} /></strong>
      </div>
      <div>
        <span>Max</span>
        <strong><Money value={stats.max} /></strong>
      </div>
    </article>
  );
}

function RecipeCard({
  guide,
  accountSnapshot,
}: {
  guide: RecipeGuide;
  accountSnapshot: AccountSnapshot | null;
}) {
  const outputItem = guide.recipe.output_item_id ? getStoredItem(guide.recipe.output_item_id) : undefined;
  const outputName = guide.recipe.output_item_id
    ? (outputItem?.name ?? "Recipe output")
    : "Recipe output";
  const sourceLabel = getRecipeSourceLabel(guide.recipe);
  const sourceUrl = getRecipeSourceUrl(guide.recipe, outputName);
  const sourceSummary = getRecipeAcquisitionSummary(guide.recipe, outputName);
  const pricedIngredientCount = guide.ingredients.filter((ingredient) => ingredient.totalPrice > 0).length;
  const hasCompleteMarketCost = pricedIngredientCount === guide.ingredients.length;
  const marketCostLabel = hasCompleteMarketCost ? "TP ingredient cost" : pricedIngredientCount > 0 ? "Priced TP cost" : "TP ingredient cost";

  return (
    <article className="recipe-card">
      <div className="recipe-head">
        <div className="recipe-output-title">
          <ItemIcon item={outputItem ?? { name: outputName }} />
          <span>
            <h4>{outputName}</h4>
            <span>
              {sourceLabel}
              {guide.recipe.min_rating ? ` - Rating ${guide.recipe.min_rating}` : ""}
            </span>
          </span>
        </div>
        <strong className={`recipe-profit ${guide.personalProfit > 0 ? "profit" : ""}`}>
          <Money value={Math.abs(guide.personalProfit)} />
          {guide.personalProfit >= 0 ? " profit" : " cost"}
        </strong>
      </div>

      <div className="cost-line">
        <span className="cost-price">
          {marketCostLabel} {guide.marketCost > 0 ? <Money value={guide.marketCost} /> : "Unavailable"}
        </span>
        <span>Owned coverage {Math.round(guide.ownedCoverage * 100)}%</span>
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          Source
          <ExternalLink />
        </a>
      </div>

      <details className="recipe-source-details">
        <summary>Recipe source</summary>
        <div>
          <p>{sourceSummary}</p>
          <dl>
            <div>
              <dt>Recipe API</dt>
              <dd>{guide.recipe.id}</dd>
            </div>
            <div>
              <dt>Discipline</dt>
              <dd>{guide.recipe.disciplines.join(", ") || "Mystic Forge"}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{guide.recipe.min_rating || "None"}</dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd>{guide.recipe.output_item_count.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </details>

      <div className="ingredient-list">
        {guide.ingredients.map((ingredient) => (
          <RecipeIngredientRow
            key={`${guide.recipe.id}-${ingredient.item_id}`}
            ingredient={ingredient}
            accountSnapshot={accountSnapshot}
          />
        ))}
      </div>
    </article>
  );
}

function RecipeIngredientRow({
  ingredient,
  accountSnapshot,
}: {
  ingredient: RecipeGuide["ingredients"][number];
  accountSnapshot: AccountSnapshot | null;
}) {
  const [routeSummary, setRouteSummary] = useState<IngredientCraftRouteSummary | null>(null);
  const [routeState, setRouteState] = useState<LoadState>("idle");
  const marketCost = ingredient.totalPrice;
  const ownedCount = accountSnapshot?.holdings.get(ingredient.item_id) ?? ingredient.ownedCount;
  const bestRoute = getBestIngredientPriceRoute(routeSummary, marketCost);
  const displayCost = bestRoute?.cost ?? 0;
  const routeNote = getIngredientRouteNote(routeSummary, marketCost, bestRoute, ingredient.item);

  useEffect(() => {
    let ignore = false;
    setRouteSummary(null);
    setRouteState("loading");

    loadIngredientCraftRouteSummary(ingredient, accountSnapshot)
      .then((summary) => {
        if (ignore) {
          return;
        }

        setRouteSummary(summary);
        setRouteState("ready");
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        setRouteSummary(null);
        setRouteState("error");
      });

    return () => {
      ignore = true;
    };
  }, [accountSnapshot, ingredient.count, ingredient.item_id, marketCost]);

  return (
    <div className="ingredient-row">
      <ItemIcon item={ingredient.item ?? { name: "Ingredient" }} />
      <div className="ingredient-copy">
        <strong>{ingredient.item?.name ?? `Item ${ingredient.item_id}`}</strong>
        <small>
          {ingredient.count.toLocaleString()} needed -{" "}
          {ownedCount.toLocaleString()} owned
        </small>
      </div>
      <div className="ingredient-route">
        <strong className="ingredient-price">
          {displayCost > 0 ? <Money value={displayCost} /> : routeState === "loading" ? "Checking" : "Unavailable"}
        </strong>
        <small>{routeNote}</small>
      </div>
    </div>
  );
}

type IngredientPriceRoute = {
  kind: "market" | "vendor" | "craft";
  label: string;
  cost: number;
};

function getBestIngredientPriceRoute(
  summary: IngredientCraftRouteSummary | null,
  marketCost: number,
): IngredientPriceRoute | null {
  const routes: IngredientPriceRoute[] = [];

  if (marketCost > 0) {
    routes.push({
      kind: "market",
      label: "Trading Post total",
      cost: marketCost,
    });
  }

  if (summary?.vendorCost && summary.vendorCost > 0) {
    routes.push({
      kind: "vendor",
      label: "Vendor total",
      cost: summary.vendorCost,
    });
  }

  if (summary?.craftCost && summary.craftCost > 0) {
    routes.push({
      kind: "craft",
      label: "Craft total",
      cost: summary.craftCost,
    });
  }

  return routes.sort((left, right) => left.cost - right.cost)[0] ?? null;
}

function getIngredientRouteNote(
  summary: IngredientCraftRouteSummary | null,
  marketCost: number,
  bestRoute: IngredientPriceRoute | null,
  item?: Gw2Item,
): ReactNode {
  const craftCost = summary?.craftCost ?? 0;
  const vendorCost = summary?.vendorCost ?? 0;

  if (bestRoute?.kind === "vendor") {
    return (
      <>
        Vendor total
        {marketCost > 0 ? (
          <>
            ; TP <Money value={marketCost} />
          </>
        ) : null}
        {craftCost > 0 && craftCost !== bestRoute.cost ? (
          <>
            ; craft <Money value={craftCost} />
          </>
        ) : null}
      </>
    );
  }

  if (bestRoute?.kind === "craft") {
    if (marketCost > 0) {
      return (
        <>
          Craft cheaper; TP <Money value={marketCost} />
        </>
      );
    }

    if (vendorCost > 0) {
      return (
        <>
          Craft cheaper; vendor <Money value={vendorCost} />
        </>
      );
    }

    return "Craft total";
  }

  if (bestRoute?.kind === "market") {
    if (craftCost > 0) {
      return (
        <>
          Buy cheaper; craft <Money value={craftCost} />
        </>
      );
    }

    if (vendorCost > 0) {
      return (
        <>
          Trading Post total; vendor <Money value={vendorCost} />
        </>
      );
    }

    return "Trading Post total";
  }

  if (summary?.hasCraftRoute) {
    return "Craft route has unpriced parts";
  }

  if (item?.flags?.some((flag) => /accountbound|soulbind/i.test(flag))) {
    return "Not tradable; check source";
  }

  return "No priced route";
}

function loadIngredientCraftRouteSummary(
  ingredient: RecipeGuide["ingredients"][number],
  accountSnapshot: AccountSnapshot | null,
): Promise<IngredientCraftRouteSummary | null> {
  const cacheKey = [
    ingredient.item_id,
    ingredient.count,
    accountSnapshot?.tokenInfo.id ?? "general",
  ].join(":");
  const cached = ingredientCraftRouteCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = buildIngredientCraftRouteSummary(ingredient, accountSnapshot);
  ingredientCraftRouteCache.set(cacheKey, promise);
  return promise;
}

async function buildIngredientCraftRouteSummary(
  ingredient: RecipeGuide["ingredients"][number],
  accountSnapshot: AccountSnapshot | null,
): Promise<IngredientCraftRouteSummary | null> {
  const item = ingredient.item ?? getStoredItem(ingredient.item_id);
  if (!item) {
    return null;
  }

  const [guides, wikiAcquisition] = await Promise.all([
    loadRecipesForOutput(ingredient.item_id, accountSnapshot?.holdings).catch(() => []),
    loadWikiItemAcquisition(item.name).catch(() => null),
  ]);
  const vendorOffer = getBestVendorOffer(wikiAcquisition);
  const vendorCost = vendorOffer ? getVendorTotalCost(vendorOffer, ingredient.count) : 0;
  const bestRecipe = selectBestRecipeGuide(guides, accountSnapshot);
  if (!bestRecipe) {
    return {
      craftCost: 0,
      marketCost: ingredient.totalPrice,
      vendorCost,
      vendorOffer: vendorOffer ?? undefined,
      hasCraftRoute: false,
    };
  }

  const nestedRecipes = await loadNestedCraftRecipes(bestRecipe, accountSnapshot).catch(() => new Map<number, RecipeGuide[]>());
  const tree = buildCraftMapTreeNode(
    item,
    ingredient.count,
    bestRecipe,
    nestedRecipes,
    accountSnapshot,
    new Map(),
    new Set([item.id]),
    0,
    `ingredient-${item.id}`,
  );
  const recipeRuns = Math.max(
    1,
    Math.ceil(ingredient.count / Math.max(1, bestRecipe.recipe.output_item_count)),
  );
  const nestedCraftCost = tree.children.reduce((sum, child) => sum + child.acquisition.totalCost, 0);
  const directCraftCost = (accountSnapshot ? bestRecipe.personalCost : bestRecipe.marketCost) * recipeRuns;

  return {
    craftCost: nestedCraftCost || directCraftCost,
    marketCost: ingredient.totalPrice,
    vendorCost,
    vendorOffer: vendorOffer ?? undefined,
    hasCraftRoute: true,
  };
}

function RecipeUsageSections({
  outputRecipes,
  usedInRecipes,
  recipeUsageState,
  accountSnapshot,
}: {
  outputRecipes: RecipeGuide[];
  usedInRecipes: RecipeGuide[];
  recipeUsageState: LoadState;
  accountSnapshot: AccountSnapshot | null;
}) {
  const standardOutputs = outputRecipes.filter((guide) => !isMysticForgeRecipe(guide.recipe));
  const standardUsedIn = usedInRecipes.filter((guide) => !isMysticForgeRecipe(guide.recipe));
  const mysticOutputs = outputRecipes.filter((guide) => isMysticForgeRecipe(guide.recipe));
  const mysticInputs = usedInRecipes.filter((guide) => isMysticForgeRecipe(guide.recipe));

  return (
    <section className="surface recipe-usage-section">
      <div className="section-title">
        <ListChecks />
        <h3>Recipe Usage</h3>
      </div>

      <details className="recipe-collapsible">
        <summary>
          <span>How to Make This Item</span>
          <strong>{recipeUsageState === "loading" ? "Loading" : standardOutputs.length.toLocaleString()}</strong>
        </summary>
        {recipeUsageState === "loading" ? (
          <SkeletonRows />
        ) : standardOutputs.length > 0 ? (
          <div className="recipe-list">
            {standardOutputs.map((guide) => (
              <RecipeCard key={`output-${guide.recipe.id}`} guide={guide} accountSnapshot={accountSnapshot} />
            ))}
          </div>
        ) : (
          <p className="muted-copy">No standard crafting recipe currently outputs this item.</p>
        )}
      </details>

      <details className="recipe-collapsible">
        <summary>
          <span>Recipes Using This Item</span>
          <strong>{recipeUsageState === "loading" ? "Loading" : standardUsedIn.length.toLocaleString()}</strong>
        </summary>
        {recipeUsageState === "loading" ? (
          <SkeletonRows />
        ) : standardUsedIn.length > 0 ? (
          <div className="recipe-list">
            {standardUsedIn.map((guide) => (
              <RecipeCard key={`used-${guide.recipe.id}`} guide={guide} accountSnapshot={accountSnapshot} />
            ))}
          </div>
        ) : (
          <p className="muted-copy">No standard crafting recipes currently list this item as an ingredient.</p>
        )}
      </details>

      <details className="recipe-collapsible">
        <summary>
          <span>Mystic Forge Recipes</span>
          <strong>{recipeUsageState === "loading" ? "Loading" : mysticOutputs.length.toLocaleString()}</strong>
        </summary>
        {recipeUsageState === "loading" ? (
          <SkeletonRows />
        ) : mysticOutputs.length > 0 ? (
          <div className="recipe-list">
            {mysticOutputs.map((guide) => (
              <RecipeCard key={`mystic-output-${guide.recipe.id}`} guide={guide} accountSnapshot={accountSnapshot} />
            ))}
          </div>
        ) : (
          <p className="muted-copy">
            No Mystic Forge recipe from the GW2 Wiki or official recipe data currently creates this item.
          </p>
        )}
      </details>

      <details className="recipe-collapsible">
        <summary>
          <span>Used In Mystic Forge Recipes</span>
          <strong>{recipeUsageState === "loading" ? "Loading" : mysticInputs.length.toLocaleString()}</strong>
        </summary>
        {recipeUsageState === "loading" ? (
          <SkeletonRows />
        ) : mysticInputs.length > 0 ? (
          <div className="recipe-list">
            {mysticInputs.map((guide) => (
              <RecipeCard key={`mystic-input-${guide.recipe.id}`} guide={guide} accountSnapshot={accountSnapshot} />
            ))}
          </div>
        ) : (
          <p className="muted-copy">
            No Mystic Forge recipe from the GW2 Wiki or official recipe data currently lists this item as an ingredient.
          </p>
        )}
      </details>
    </section>
  );
}

function RoutePlanner({
  item,
  recipes,
  wikiGuide,
  accountSnapshot,
}: {
  item: MarketItem;
  recipes: RecipeGuide[];
  wikiGuide: WikiGuide | null;
  accountSnapshot: AccountSnapshot | null;
}) {
  const bestRecipe = [...recipes].sort((left, right) => {
    const leftCost = accountSnapshot ? left.personalCost : left.marketCost;
    const rightCost = accountSnapshot ? right.personalCost : right.marketCost;
    return leftCost - rightCost;
  })[0];
  const ownedCount = accountSnapshot?.holdings.get(item.id) ?? 0;
  const buyCost = item.price.sells.unit_price;
  const hasBuyPrice = hasTradingPostPrice(item);
  const craftCost = bestRecipe
    ? accountSnapshot
      ? bestRecipe.personalCost
      : bestRecipe.marketCost
    : Number.POSITIVE_INFINITY;
  const hasEnoughGold = accountSnapshot ? accountSnapshot.coins >= buyCost : false;

  let route = hasBuyPrice ? "Use the Trading Post" : "Follow direct acquisition";
  let detail: ReactNode = (
    <>
      Buy cost <Money value={buyCost} />.
    </>
  );

  if (!hasBuyPrice) {
    detail = wikiGuide
      ? `This item is not tradable. Use the wiki route for ${wikiGuide.title}.`
      : "This item is not tradable. Use direct acquisition or crafting information when available.";
  }

  if (accountSnapshot && ownedCount > 0) {
    route = "Already available";
    detail = `${ownedCount.toLocaleString()} in account storage.`;
  } else if (bestRecipe && (!hasBuyPrice || craftCost < buyCost)) {
    route = accountSnapshot ? "Craft with current materials" : "Craft from market materials";
    detail = (
      <>
        <Money value={craftCost} /> estimated {accountSnapshot ? "personal" : "market"} cost.
      </>
    );
  } else if (accountSnapshot && hasBuyPrice && !hasEnoughGold) {
    route = "Grind gold, then buy";
    detail = (
      <>
        <Money value={Math.max(0, buyCost - accountSnapshot.coins)} /> remaining gold value.
      </>
    );
  } else if (!hasBuyPrice && wikiGuide) {
    route = "Follow direct acquisition";
    detail = `Use the wiki route for ${wikiGuide.title}.`;
  }

  return (
    <section className="route-planner surface">
      <div className="section-title">
        <TrendingUp />
        <h3>Quickest Route</h3>
      </div>
      <div className="route-grid">
        <div className="route-result">
          <span>{accountSnapshot ? "Personalized" : "Generalized"}</span>
          <strong>{route}</strong>
          <p>{detail}</p>
        </div>
        <div className="route-options">
          {hasBuyPrice ? (
            <RouteOption
              label="Buy"
              value={<Money value={buyCost} />}
              active={!bestRecipe || buyCost <= craftCost}
            />
          ) : null}
          <RouteOption
            label="Craft"
            value={bestRecipe ? <Money value={craftCost} /> : "No recipe"}
            active={Boolean(bestRecipe && (!hasBuyPrice || craftCost < buyCost))}
          />
          <RouteOption
            label="Direct"
            value={wikiGuide ? "Wiki route" : "Unknown"}
            active={!item.price.sells.unit_price && Boolean(wikiGuide)}
          />
        </div>
      </div>
    </section>
  );
}

function RouteOption({
  label,
  value,
  active,
}: {
  label: string;
  value: ReactNode;
  active: boolean;
}) {
  return (
    <div className={`route-option ${active ? "active" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getBestVendorOffer(acquisition?: WikiItemAcquisition | null): WikiVendorOffer | null {
  return [...(acquisition?.vendorOffers ?? [])]
    .filter((offer) => offer.cost > 0 && offer.quantity > 0)
    .sort((left, right) => getVendorUnitCost(left) - getVendorUnitCost(right))[0] ?? null;
}

function getVendorUnitCost(offer: WikiVendorOffer): number {
  return offer.cost / Math.max(1, offer.quantity);
}

function getVendorTotalCost(offer: WikiVendorOffer, quantity: number): number {
  return Math.ceil(getVendorUnitCost(offer) * Math.max(1, quantity));
}

function getAcquisitionSourceUrl(acquisition?: WikiItemAcquisition | null): string | undefined {
  return acquisition?.sourceUrl;
}

interface CraftMapAcquisition {
  kind: "craft" | "vendor" | "market" | "unknown";
  label: string;
  totalCost: number;
  vendorOffer?: WikiVendorOffer;
  sourceUrl?: string;
}

function chooseCraftMapAcquisition({
  item,
  requiredCount,
  recipe,
  children,
  wikiAcquisition,
}: {
  item: Gw2Item;
  requiredCount: number;
  recipe: RecipeGuide | null;
  children: CraftMapTreeNode[];
  wikiAcquisition?: WikiItemAcquisition | null;
}): CraftMapAcquisition {
  const price = getStoredPrice(item.id);
  const marketUnitCost = price?.sells.unit_price || price?.buys.unit_price || 0;
  const marketTotal = marketUnitCost * requiredCount;
  const vendorOffer = getBestVendorOffer(wikiAcquisition);
  const vendorTotal = vendorOffer ? getVendorTotalCost(vendorOffer, requiredCount) : 0;
  const craftTotal = recipe
    ? children.length > 0
      ? children.reduce((sum, child) => sum + child.acquisition.totalCost, 0)
      : recipe.marketCost * Math.max(1, Math.ceil(requiredCount / Math.max(1, recipe.recipe.output_item_count)))
    : 0;
  const options: CraftMapAcquisition[] = [];

  if (marketTotal > 0) {
    options.push({
      kind: "market",
      label: "Market",
      totalCost: marketTotal,
    });
  }

  if (vendorOffer && vendorTotal > 0) {
    options.push({
      kind: "vendor",
      label: "Vendor",
      totalCost: vendorTotal,
      vendorOffer,
      sourceUrl: wikiAcquisition?.sourceUrl,
    });
  }

  if (recipe && craftTotal > 0) {
    options.push({
      kind: "craft",
      label: "Craft",
      totalCost: craftTotal,
    });
  }

  return options.sort((left, right) => left.totalCost - right.totalCost)[0] ?? {
    kind: "unknown",
    label: "Source",
    totalCost: 0,
    sourceUrl: getAcquisitionSourceUrl(wikiAcquisition),
  };
}

function IngredientMindMap({
  item,
  recipes,
  accountSnapshot,
  wikiGuide,
  onOpenDetail,
}: {
  item: MarketItem;
  recipes: RecipeGuide[];
  accountSnapshot: AccountSnapshot | null;
  wikiGuide: WikiGuide | null;
  onOpenDetail?: (item: Gw2Item) => void;
}) {
  const [selectedNode, setSelectedNode] = useState<PositionedCraftMapNode | null>(null);
  const [nestedRecipes, setNestedRecipes] = useState<Map<number, RecipeGuide[]>>(new Map());
  const [wikiAcquisitions, setWikiAcquisitions] = useState<Map<number, WikiItemAcquisition | null>>(new Map());
  const [mapState, setMapState] = useState<LoadState>("idle");
  const recipe = recipes[0];
  const tree = useMemo(
    () =>
      recipe
        ? buildCraftMapTree(item, recipe, nestedRecipes, accountSnapshot, wikiAcquisitions)
        : null,
    [accountSnapshot, item, nestedRecipes, recipe, wikiAcquisitions],
  );
  const layout = useMemo(() => (tree ? layoutCraftMap(tree) : null), [tree]);
  const visibleNodeKey = useMemo(
    () => (layout ? layout.nodes.map((node) => `${node.item.id}:${node.item.name}`).join("|") : ""),
    [layout],
  );

  useEffect(() => {
    if (!recipe) {
      setNestedRecipes(new Map());
      setMapState("idle");
      return;
    }

    let ignore = false;
    setMapState("loading");

    loadNestedCraftRecipes(recipe, accountSnapshot)
      .then((loadedRecipes) => {
        if (ignore) {
          return;
        }

        setNestedRecipes(loadedRecipes);
        setMapState("ready");
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        setNestedRecipes(new Map());
        setMapState("error");
      });

    return () => {
      ignore = true;
    };
  }, [accountSnapshot, recipe]);

  useEffect(() => {
    if (!layout) {
      return;
    }

    const missingNodes = layout.nodes.filter((node) => !wikiAcquisitions.has(node.item.id)).slice(0, 60);
    if (missingNodes.length === 0) {
      return;
    }

    let ignore = false;
    Promise.allSettled(missingNodes.map((node) => loadWikiItemAcquisition(node.item.name))).then((results) => {
      if (ignore) {
        return;
      }

      setWikiAcquisitions((current) => {
        const next = new Map(current);
        results.forEach((result, index) => {
          next.set(
            missingNodes[index].item.id,
            result.status === "fulfilled" ? result.value : null,
          );
        });
        return next;
      });
    });

    return () => {
      ignore = true;
    };
  }, [layout, visibleNodeKey, wikiAcquisitions]);

  return (
    <section className="surface mind-map-section">
      <div className="section-title">
        <Boxes />
        <h3>Craft Map</h3>
      </div>
      {layout ? (
        <>
          {mapState === "loading" ? (
            <p className="market-list-note">Checking craftable sub-ingredients.</p>
          ) : null}
          {mapState === "error" ? (
            <p className="market-list-note">Some deeper recipe steps could not be loaded right now.</p>
          ) : null}
          <div className="mind-map" style={{ ["--map-width" as string]: `${layout.width}px` }}>
            <div className="map-canvas" style={{ width: layout.width, height: layout.height }}>
              <svg className="map-lines" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
                {layout.connectors.map((connector) => (
                  <path
                    key={`connector-${connector.key}`}
                    d={buildRecipeConnector(connector)}
                  />
                ))}
              </svg>

              {layout.nodes.map((node) => (
                <button
                  key={node.key}
                  className={`map-node ${node.depth === 0 ? "output-node" : "ingredient-node"} ${
                    node.recipe ? "craftable-node" : ""
                  }`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => setSelectedNode(node)}
                >
                  <ItemIcon item={node.item} />
                  <strong>{node.item.name}</strong>
                  <span className="node-required-count">
                    {node.requiredCount.toLocaleString()} needed
                  </span>
                  <span className={accountSnapshot ? "node-owned-count" : "node-owned-count muted"}>
                    {accountSnapshot
                      ? `${node.ownedCount.toLocaleString()} owned`
                      : "Owned not loaded"}
                  </span>
                  <span className="node-total-price">
                    {node.acquisition.totalCost > 0 ? (
                      <>
                        {node.acquisition.label} <Money value={node.acquisition.totalCost} />
                      </>
                    ) : (
                      "Check source"
                    )}
                  </span>
                </button>
              ))}

              {selectedNode ? (
                <NodeInfoWindow
                  node={selectedNode}
                  item={selectedNode.item}
                  anchor={{ x: selectedNode.x, y: selectedNode.y }}
                  canvas={{ width: layout.width, height: layout.height }}
                  accountSnapshot={accountSnapshot}
                  wikiAcquisition={wikiAcquisitions.get(selectedNode.item.id)}
                  onClose={() => setSelectedNode(null)}
                  onOpenDetail={onOpenDetail}
                />
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <p className="muted-copy">
          {wikiGuide
            ? "No craft recipe found. The direct acquisition route is linked in the wiki guide."
            : "No craft recipe or direct route loaded for this item."}
        </p>
      )}
    </section>
  );
}

const CRAFT_MAP_MAX_DEPTH = 5;
const CRAFT_MAP_MAX_NESTED_RECIPES = 80;

interface CraftMapTreeNode {
  key: string;
  item: Gw2Item;
  requiredCount: number;
  ownedCount: number;
  acquisition: CraftMapAcquisition;
  depth: number;
  recipe: RecipeGuide | null;
  children: CraftMapTreeNode[];
}

interface PositionedCraftMapNode extends CraftMapTreeNode {
  x: number;
  y: number;
}

interface CraftMapConnector {
  key: string;
  parent: PositionedCraftMapNode;
  children: PositionedCraftMapNode[];
}

function buildCraftMapTree(
  item: Gw2Item,
  recipe: RecipeGuide,
  nestedRecipes: Map<number, RecipeGuide[]>,
  accountSnapshot: AccountSnapshot | null,
  wikiAcquisitions: Map<number, WikiItemAcquisition | null>,
): CraftMapTreeNode {
  return buildCraftMapTreeNode(
    item,
    1,
    recipe,
    nestedRecipes,
    accountSnapshot,
    wikiAcquisitions,
    new Set([item.id]),
    0,
    `${item.id}`,
  );
}

function buildCraftMapTreeNode(
  item: Gw2Item,
  requiredCount: number,
  recipe: RecipeGuide | null,
  nestedRecipes: Map<number, RecipeGuide[]>,
  accountSnapshot: AccountSnapshot | null,
  wikiAcquisitions: Map<number, WikiItemAcquisition | null>,
  path: Set<number>,
  depth: number,
  key: string,
): CraftMapTreeNode {
  const ownedCount = accountSnapshot?.holdings.get(item.id) ?? 0;
  const recipeRuns = recipe ? Math.ceil(requiredCount / Math.max(1, recipe.recipe.output_item_count)) : 0;
  const children =
    recipe && depth < CRAFT_MAP_MAX_DEPTH
      ? recipe.ingredients
          .map((ingredient) => {
            const ingredientItem = ingredient.item ?? getStoredItem(ingredient.item_id);
            if (!ingredientItem || path.has(ingredient.item_id)) {
              return null;
            }

            const nextPath = new Set(path);
            nextPath.add(ingredient.item_id);
            const childRequiredCount = ingredient.count * Math.max(1, recipeRuns);
            const childRecipe = selectBestRecipeGuide(
              nestedRecipes.get(ingredient.item_id) ?? [],
              accountSnapshot,
            );

            return buildCraftMapTreeNode(
              ingredientItem,
              childRequiredCount,
              childRecipe,
              nestedRecipes,
              accountSnapshot,
              wikiAcquisitions,
              nextPath,
              depth + 1,
              `${key}-${ingredient.item_id}`,
            );
          })
          .filter((node): node is CraftMapTreeNode => Boolean(node))
      : [];

  return {
    key,
    item,
    requiredCount,
    ownedCount,
    acquisition: chooseCraftMapAcquisition({
      item,
      requiredCount,
      recipe,
      children,
      wikiAcquisition: wikiAcquisitions.get(item.id),
    }),
    depth,
    recipe,
    children,
  };
}

async function loadNestedCraftRecipes(
  rootRecipe: RecipeGuide,
  accountSnapshot: AccountSnapshot | null,
): Promise<Map<number, RecipeGuide[]>> {
  const holdings = accountSnapshot?.holdings;
  const loadedRecipes = new Map<number, RecipeGuide[]>();
  const queue = rootRecipe.ingredients.map((ingredient) => ({
    itemId: ingredient.item_id,
    depth: 1,
    path: new Set<number>([
      rootRecipe.recipe.output_item_id ?? 0,
      ingredient.item_id,
    ]),
  }));
  const visited = new Set<number>();

  while (queue.length > 0 && visited.size < CRAFT_MAP_MAX_NESTED_RECIPES) {
    const next = queue.shift()!;
    if (visited.has(next.itemId) || next.depth >= CRAFT_MAP_MAX_DEPTH) {
      continue;
    }

    visited.add(next.itemId);
    const guides = await loadRecipesForOutput(next.itemId, holdings).catch(() => []);
    if (guides.length === 0) {
      continue;
    }

    loadedRecipes.set(next.itemId, guides);
    const bestGuide = selectBestRecipeGuide(guides, accountSnapshot);
    if (!bestGuide) {
      continue;
    }

    for (const ingredient of bestGuide.ingredients) {
      if (next.path.has(ingredient.item_id)) {
        continue;
      }

      queue.push({
        itemId: ingredient.item_id,
        depth: next.depth + 1,
        path: new Set([...next.path, ingredient.item_id]),
      });
    }
  }

  return loadedRecipes;
}

function selectBestRecipeGuide(
  guides: RecipeGuide[],
  accountSnapshot: AccountSnapshot | null,
): RecipeGuide | null {
  return [...guides].sort((left, right) => {
    const leftCost = accountSnapshot ? left.personalCost : left.marketCost;
    const rightCost = accountSnapshot ? right.personalCost : right.marketCost;
    return leftCost - rightCost || left.marketCost - right.marketCost;
  })[0] ?? null;
}

function countCraftMapLeaves(node: CraftMapTreeNode): number {
  if (node.children.length === 0) {
    return 1;
  }

  return node.children.reduce((sum, child) => sum + countCraftMapLeaves(child), 0);
}

function getCraftMapDepth(node: CraftMapTreeNode): number {
  return node.children.reduce((maxDepth, child) => Math.max(maxDepth, getCraftMapDepth(child)), node.depth);
}

function layoutCraftMap(root: CraftMapTreeNode): {
  width: number;
  height: number;
  nodes: PositionedCraftMapNode[];
  connectors: CraftMapConnector[];
} {
  const leafCount = countCraftMapLeaves(root);
  const maxDepth = getCraftMapDepth(root);
  const leafSpacing = 190;
  const top = 86;
  const levelSpacing = 162;
  const width = Math.max(760, leafCount * leafSpacing + 120);
  const height = Math.max(360, top + maxDepth * levelSpacing + 130);
  const nodes: PositionedCraftMapNode[] = [];
  const connectors: CraftMapConnector[] = [];
  let leafIndex = 0;

  const place = (node: CraftMapTreeNode): PositionedCraftMapNode => {
    const childNodes = node.children.map(place);
    const x =
      childNodes.length > 0
        ? childNodes.reduce((sum, child) => sum + child.x, 0) / childNodes.length
        : 60 + leafIndex++ * leafSpacing;
    const positionedNode = {
      ...node,
      x,
      y: top + node.depth * levelSpacing,
    };

    nodes.push(positionedNode);
    if (childNodes.length > 0) {
      connectors.push({
        key: node.key,
        parent: positionedNode,
        children: childNodes,
      });
    }

    return positionedNode;
  };

  place(root);

  return {
    width,
    height,
    nodes,
    connectors,
  };
}

function buildRecipeConnector(connector: CraftMapConnector): string {
  const startY = connector.parent.y + 58;
  const endY = connector.children[0].y - 58;
  const busY = startY + Math.max(28, (endY - startY) * 0.42);
  const minX = Math.min(...connector.children.map((child) => child.x));
  const maxX = Math.max(...connector.children.map((child) => child.x));
  const childDrops = connector.children
    .map((child) => `M ${child.x} ${busY} V ${endY}`)
    .join(" ");

  return `M ${connector.parent.x} ${startY} V ${busY} M ${minX} ${busY} H ${maxX} ${childDrops}`;
}

function NodeInfoWindow({
  node,
  item,
  anchor,
  canvas,
  accountSnapshot,
  wikiAcquisition,
  onClose,
  onOpenDetail,
}: {
  node: PositionedCraftMapNode;
  item: Gw2Item;
  anchor: { x: number; y: number };
  canvas: { width: number; height: number };
  accountSnapshot: AccountSnapshot | null;
  wikiAcquisition?: WikiItemAcquisition | null;
  onClose: () => void;
  onOpenDetail?: (item: Gw2Item) => void;
}) {
  const infoWidth = 300;
  const estimatedInfoHeight = 190;
  const nodeHalfWidth = 77;
  const gap = 12;
  const canOpenRight = anchor.x + nodeHalfWidth + gap + infoWidth <= canvas.width - 12;
  const left = canOpenRight
    ? anchor.x + nodeHalfWidth + gap
    : Math.max(12, anchor.x - nodeHalfWidth - gap - infoWidth);
  const top = Math.min(
    Math.max(12, anchor.y - estimatedInfoHeight / 2),
    Math.max(12, canvas.height - estimatedInfoHeight - 12),
  );
  const price = getStoredPrice(item.id);
  const owned = accountSnapshot?.holdings.get(item.id) ?? 0;
  const buyCost = price?.sells.unit_price ?? 0;
  const sellValue = price?.buys.unit_price ?? 0;
  const vendorOffer = getBestVendorOffer(wikiAcquisition);
  const vendorTotal = vendorOffer ? getVendorTotalCost(vendorOffer, node.requiredCount) : 0;
  const personalRoute =
    accountSnapshot && owned > 0
      ? "Use owned stack"
      : node.acquisition.kind === "vendor"
        ? `Buy from ${node.acquisition.vendorOffer?.vendor ?? "vendor"}`
        : buyCost > 0
        ? accountSnapshot && accountSnapshot.coins < buyCost
          ? "Grind gold, then buy"
          : "Buy from Trading Post"
        : "Check direct acquisition";

  return (
    <div
      className="node-info"
      style={{ left, top }}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="node-close"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close item info"
      >
        <X />
      </button>
      <div className="node-info-head">
        <ItemIcon item={item} />
        <div>
          <strong>{item.name}</strong>
          <span>
            {item.rarity} {item.type}
          </span>
        </div>
      </div>
      <div className="node-info-grid">
        <span>Buy</span>
        <strong>{buyCost ? <Money value={buyCost} /> : "Unavailable"}</strong>
        {vendorOffer ? (
          <>
            <span>Vendor</span>
            <strong><Money value={vendorTotal || vendorOffer.cost} /></strong>
          </>
        ) : null}
        <span>Sell</span>
        <strong>{sellValue ? <Money value={sellValue} /> : "Unavailable"}</strong>
        <span>Owned</span>
        <strong>{accountSnapshot ? owned.toLocaleString() : "General"}</strong>
      </div>
      <p>{accountSnapshot ? personalRoute : "General route uses market price and wiki data."}</p>
      {vendorOffer ? (
        <p className="node-vendor-note">
          <VendorWikiLink offer={vendorOffer} />
          {vendorOffer.zone ? ` - ${vendorOffer.zone}` : ""}
          {vendorOffer.quantity > 1 ? `, ${vendorOffer.costText}` : ""}
        </p>
      ) : null}
      <button
        type="button"
        className="node-detail-button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenDetail?.(item);
          onClose();
        }}
        disabled={!onOpenDetail}
      >
        Open Detail Page
      </button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export default App;
