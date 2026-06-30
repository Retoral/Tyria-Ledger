/// <reference types="vite/client" />

export {};

interface DesktopMarketHistoryPoint {
  itemId: number;
  recordedAt: string;
  buyPrice: number;
  sellPrice: number;
  buyQuantity: number;
  sellQuantity: number;
  buyPriceOpen?: number;
  buyPriceClose?: number;
  buyPriceMin?: number;
  buyPriceMax?: number;
  sellPriceOpen?: number;
  sellPriceClose?: number;
  sellPriceMin?: number;
  sellPriceMax?: number;
  buyQuantityMin?: number;
  buyQuantityMax?: number;
  sellQuantityMin?: number;
  sellQuantityMax?: number;
  rollup?: "raw" | "day" | "week" | "month" | "bimonth";
  sampleCount?: number;
}

interface DesktopMarketHistoryImportResult {
  added: number;
  ignored: number;
  total: number;
}

interface DesktopMarketCatalogResult {
  scopeId: string;
  updatedAt: string;
  items: unknown[];
}

interface DesktopMarketCatalogSaveResult {
  scopeId: string;
  updatedAt: string;
  total: number;
}

interface DesktopRecipeCacheResult {
  updatedAt: string;
  recipes: unknown[];
}

interface DesktopRecipeCacheSaveResult {
  updatedAt: string;
  total: number;
}

interface DesktopItemCacheResult {
  updatedAt: string | null;
  items: unknown[];
}

interface DesktopItemCacheSaveResult {
  updatedAt: string;
  total: number;
}

interface DesktopWikiContainerCacheResult {
  updatedAt: string;
  analysis: unknown;
}

interface DesktopWikiContainerCacheSaveResult {
  updatedAt: string;
  title: string;
}

interface DesktopAppCacheResult {
  key: string;
  updatedAt: string;
  value: unknown;
}

interface DesktopAppCacheSaveResult {
  key: string;
  updatedAt: string;
}

interface DesktopAppCacheDeleteResult {
  deleted: number;
}

interface DesktopUpdateCheckResult {
  state: "available" | "current" | "error" | "not_configured";
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  checkedAt: string;
  releaseName?: string;
  releaseNotes?: string;
  releaseUrl?: string;
  assetName?: string;
  assetUrl?: string;
  message?: string;
}

interface DesktopOpenUpdateResult {
  opened: boolean;
  target: "asset" | "release" | "cancelled";
}

interface DesktopStartupSettings {
  openAtLogin: boolean;
  openAsHidden: boolean;
}

declare global {
  interface Window {
    gw2Desktop?: {
      loadApiKey: () => Promise<string | null>;
      saveApiKey: (apiKey: string) => Promise<boolean>;
      deleteApiKey: () => Promise<boolean>;
      listMarketHistory: () => Promise<DesktopMarketHistoryPoint[]>;
      loadMarketHistoryForItem: (itemId: number) => Promise<DesktopMarketHistoryPoint[]>;
      recordMarketHistoryBatch: (points: DesktopMarketHistoryPoint[]) => Promise<{ recorded: number }>;
      importMarketHistory: (points: DesktopMarketHistoryPoint[]) => Promise<DesktopMarketHistoryImportResult>;
      migrateMarketHistory: (points: DesktopMarketHistoryPoint[]) => Promise<DesktopMarketHistoryImportResult>;
      loadMarketCatalog: (scopeId: string) => Promise<DesktopMarketCatalogResult | null>;
      saveMarketCatalog: (scopeId: string, items: unknown[]) => Promise<DesktopMarketCatalogSaveResult>;
      loadRecipeCache: () => Promise<DesktopRecipeCacheResult | null>;
      saveRecipeCache: (recipes: unknown[]) => Promise<DesktopRecipeCacheSaveResult>;
      loadItemCache: (ids: number[]) => Promise<DesktopItemCacheResult>;
      loadItemCacheByType: (type: string) => Promise<DesktopItemCacheResult>;
      saveItemCache: (items: unknown[]) => Promise<DesktopItemCacheSaveResult>;
      loadWikiContainerCache: (cacheKey: string) => Promise<DesktopWikiContainerCacheResult | null>;
      saveWikiContainerCache: (cacheKey: string, analysis: unknown) => Promise<DesktopWikiContainerCacheSaveResult>;
      loadAppCache: (cacheKey: string) => Promise<DesktopAppCacheResult | null>;
      saveAppCache: (cacheKey: string, value: unknown) => Promise<DesktopAppCacheSaveResult>;
      deleteAppCachePrefix: (prefix: string) => Promise<DesktopAppCacheDeleteResult>;
      checkForUpdates: () => Promise<DesktopUpdateCheckResult>;
      openUpdateDownload: (updateInfo: DesktopUpdateCheckResult) => Promise<DesktopOpenUpdateResult>;
      getStartupSettings: () => Promise<DesktopStartupSettings>;
      setStartupSettings: (settings: { openAtLogin: boolean }) => Promise<DesktopStartupSettings>;
      onNavigateHistory: (callback: (direction: "back" | "forward") => void) => () => void;
    };
  }
}
