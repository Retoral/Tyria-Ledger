/// <reference types="vite/client" />

export {};

interface DesktopMarketHistoryPoint {
  itemId: number;
  recordedAt: string;
  buyPrice: number;
  sellPrice: number;
  buyQuantity: number;
  sellQuantity: number;
  rollup?: "raw" | "day" | "week" | "month";
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

declare global {
  interface Window {
    gw2Desktop?: {
      loadApiKey: () => Promise<string | null>;
      saveApiKey: (apiKey: string) => Promise<boolean>;
      deleteApiKey: () => Promise<boolean>;
      listMarketHistory: () => Promise<DesktopMarketHistoryPoint[]>;
      loadMarketHistoryForItem: (itemId: number) => Promise<DesktopMarketHistoryPoint[]>;
      recordMarketHistory: (point: DesktopMarketHistoryPoint) => Promise<DesktopMarketHistoryPoint[]>;
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
    };
  }
}
