export type Coin = number;

export interface CommercePrice {
  id: number;
  whitelisted?: boolean;
  buys: {
    quantity: number;
    unit_price: Coin;
  };
  sells: {
    quantity: number;
    unit_price: Coin;
  };
}

export interface CommerceListing {
  listings: number;
  unit_price: Coin;
  quantity: number;
}

export interface CommerceListings {
  id: number;
  buys: CommerceListing[];
  sells: CommerceListing[];
}

export interface AccountTransaction {
  id: number;
  item_id: number;
  price: Coin;
  quantity: number;
  created: string;
  purchased?: string;
}

export interface ItemTransactions {
  currentBuys: AccountTransaction[];
  currentSells: AccountTransaction[];
  historyBuys: AccountTransaction[];
  historySells: AccountTransaction[];
}

export interface ApiStatusResult {
  group: "GW2 API" | "User GW2 API";
  label: string;
  ok: boolean;
  state: "operational" | "issue" | "not_configured";
  latencyMs?: number;
  status: number | null;
  error?: string;
}

export interface Gw2Item {
  id: number;
  chat_link?: string;
  name: string;
  icon?: string;
  description?: string;
  type: string;
  rarity: string;
  level: number;
  vendor_value: Coin;
  default_skin?: number;
  flags?: string[];
  game_types?: string[];
  restrictions?: string[];
  details?: Record<string, unknown>;
}

export interface Gw2World {
  id: number;
  name: string;
  population: "Low" | "Medium" | "High" | "VeryHigh" | "Full" | string;
}

export interface Gw2Map {
  id: number;
  name: string;
  min_level?: number;
  max_level?: number;
  default_floor: number;
  type: string;
  floors?: number[];
  region_id?: number;
  region_name?: string;
  continent_id: number;
  continent_name: string;
  map_rect: [[number, number], [number, number]];
  continent_rect: [[number, number], [number, number]];
}

export interface MarketItem extends Gw2Item {
  price: CommercePrice;
  netSellPrice: Coin;
  spread: Coin;
  spreadPercent: number;
}

export type GatheringDiscipline = "Harvesting" | "Logging" | "Mining";

export interface GatheringNodeYield {
  itemName: string;
  itemId?: number;
  chance: "guaranteed" | "chance" | "low_chance" | "rare" | "unknown";
  quantity?: string;
  note?: string;
}

export interface GatherableItemSource {
  item: Gw2Item;
  discipline: GatheringDiscipline;
  tool: string;
  toolTier?: string;
  nodes: string[];
  mainYields?: GatheringNodeYield[];
  extraYields?: GatheringNodeYield[];
}

export interface GatheringLocationInfo {
  itemName: string;
  sourceUrl: string;
  nodes: Array<{
    name: string;
    maps: string[];
    url?: string;
    results?: GatheringNodeYield[];
  }>;
  maps: string[];
  gatheredFromNodes?: string[];
}

export interface PermanentGatheringNodeDrop {
  id: number;
  quantity: number;
  ore?: boolean;
  item?: Gw2Item;
}

export interface PermanentGatheringNode {
  id: number;
  image: string;
  imageUrl: string;
  area: string;
  zone: string;
  region: string;
  materialName: string;
  waypointName?: string;
  waypointCode?: string;
  optimal: number;
  videoGuide?: string;
  sourceUrl: string;
  items: PermanentGatheringNodeDrop[];
}

export interface Gw2Recipe {
  id: number;
  type: string;
  output_item_id?: number;
  output_item_count: number;
  time_to_craft_ms: number;
  disciplines: string[];
  min_rating: number;
  flags: string[];
  ingredients: RecipeIngredient[];
  source?: "api" | "wiki";
  sourceUrl?: string;
  sourceName?: string;
}

export interface RecipeIngredient {
  item_id: number;
  count: number;
}

export interface RecipeIngredientLine extends RecipeIngredient {
  item?: Gw2Item;
  unitPrice: Coin;
  totalPrice: Coin;
  ownedCount: number;
}

export interface RecipeGuide {
  recipe: Gw2Recipe;
  ingredients: RecipeIngredientLine[];
  outputValue: Coin;
  marketCost: Coin;
  netProfit: Coin;
  personalCost: Coin;
  personalProfit: Coin;
  ownedCoverage: number;
}

export interface WikiGuide {
  title: string;
  extract: string;
  url: string;
}

export interface WikiVendorOffer {
  vendor: string;
  vendorUrl?: string;
  area?: string;
  zone?: string;
  cost: Coin;
  quantity: number;
  costText: string;
  sourceUrl: string;
}

export interface WikiRecipeUnlock {
  title: string;
  url: string;
}

export interface WikiItemAcquisition {
  itemName: string;
  sourceUrl: string;
  vendorOffers: WikiVendorOffer[];
  acquisitionNotes: string[];
  teachesRecipe?: WikiRecipeUnlock;
}

export interface ContainerDrop {
  name: string;
  itemId?: number;
  officialName?: string;
  quantityMin: number;
  quantityMax: number;
  chancePct?: number;
  note?: string;
  coinValue?: Coin;
}

export interface ContainerAnalysis {
  title: string;
  sourceUrl: string;
  dropRateUrl?: string;
  drops: ContainerDrop[];
  exactChancesAvailable: boolean;
  parserNotes: string[];
}

export interface TokenInfo {
  id: string;
  name: string;
  permissions: string[];
}

export interface AccountMaterial {
  id: number;
  category: number;
  count: number;
  binding?: string;
}

export interface AccountItemStack {
  id: number;
  count: number;
  binding?: string;
  charges?: number;
  upgrades?: number[];
  infusions?: number[];
  skin?: number;
  stats?: {
    id: number;
    attributes?: Record<string, number>;
  };
}

export interface AccountCharacterBag {
  id?: number;
  size?: number;
  inventory?: Array<AccountItemStack | null>;
}

export interface AccountCharacter {
  name: string;
  race?: string;
  gender?: string;
  profession: string;
  level: number;
  guild?: string;
  age?: number;
  created?: string;
  deaths?: number;
  title?: number;
  crafting?: Array<{
    discipline: string;
    rating: number;
    active?: boolean;
  }>;
  bags?: Array<AccountCharacterBag | null>;
}

export interface AccountAchievement {
  id: number;
  current?: number;
  max?: number;
  done?: boolean;
  repeated?: number;
  bits?: number[];
}

export interface WizardVaultObjectiveDefinition {
  id: number;
  title: string;
  track: string;
  acclaim: number;
}

export interface WizardVaultObjectiveProgress {
  id: number;
  title: string;
  track: string;
  acclaim: number;
  completed: boolean;
  claimed: boolean;
  current: number | null;
  complete: number | null;
}

export interface WizardVaultObjectiveGuide {
  objectiveTitle: string;
  track: string;
  summary: string;
  steps: string[];
  wikiLinks: WikiGuide[];
  chatLinks: string[];
  searchTerms: string[];
}

export interface WizardVaultObjectiveSection {
  id: "daily" | "weekly" | "special";
  label: string;
  objectives: WizardVaultObjectiveProgress[];
  metaCurrent: number | null;
  metaComplete: number | null;
  metaClaimed: boolean;
}

export interface WizardVaultListing {
  id: number;
  item_id: number;
  item_count: number;
  type: string;
  cost: number;
}

export interface WizardVaultListingValue {
  listing: WizardVaultListing;
  item?: Gw2Item;
  value: Coin;
  valuePerAcclaim: number;
  purchased: number | null;
  purchaseLimit: number | null;
  purchaseSource: "api" | "remembered" | "unavailable";
  purchaseReliable: boolean;
}

export interface WizardVaultSnapshot {
  sections: WizardVaultObjectiveSection[];
  listings: WizardVaultListingValue[];
  objectiveCatalog: WizardVaultObjectiveDefinition[];
  hasAccountProgress: boolean;
  publicObjectiveRotationAvailable: boolean;
  purchaseCountWarning?: string;
  updatedAt: number;
}

export interface AchievementTier {
  count: number;
  points: number;
}

export interface AchievementBit {
  type: "Text" | "Item" | "Minipet" | "Skin" | string;
  id?: number;
  text?: string;
}

export interface AchievementReward {
  type: string;
  id?: number;
  count?: number;
  region?: string;
}

export interface Gw2Achievement {
  id: number;
  icon?: string;
  name: string;
  description?: string;
  requirement?: string;
  locked_text?: string;
  type?: string;
  flags?: string[];
  tiers: AchievementTier[];
  prerequisites?: number[];
  rewards?: AchievementReward[];
  bits?: AchievementBit[];
  point_cap?: number;
}

export interface AchievementCategory {
  id: number;
  name: string;
  description?: string;
  order: number;
  icon?: string;
  achievements: number[];
}

export interface AchievementGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
  categories: number[];
}

export interface AchievementCatalog {
  groups: AchievementGroup[];
  categories: AchievementCategory[];
  achievements: Gw2Achievement[];
  groupMap: Map<string, AchievementGroup>;
  categoryMap: Map<number, AchievementCategory>;
  achievementMap: Map<number, Gw2Achievement>;
}

export interface AccountWalletEntry {
  id: number;
  value: number;
}

export interface AccountSnapshot {
  tokenInfo: TokenInfo;
  materials: AccountMaterial[];
  bank: AccountItemStack[];
  inventory: AccountItemStack[];
  characters: AccountCharacter[];
  wallet: AccountWalletEntry[];
  coins: Coin;
  recipes: number[];
  achievements: AccountAchievement[];
  holdings: Map<number, number>;
}

export interface CraftOpportunity {
  recipe: Gw2Recipe;
  output: Gw2Item;
  outputValue: Coin;
  marketCost: Coin;
  marketProfit: Coin;
  personalCost: Coin;
  personalProfit: Coin;
  ownedCoverage: number;
}

export interface LegendaryReadiness {
  item: Gw2Item;
  recipe: Gw2Recipe;
  outputValue: Coin;
  marketCost: Coin;
  personalCost: Coin;
  ownedCoverage: number;
  recipeUnlocked: boolean;
}

export interface AccountAnalysis {
  account: AccountSnapshot;
  opportunities: CraftOpportunity[];
  legendaries: LegendaryReadiness[];
}
