const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gw2Desktop", {
  loadApiKey: () => ipcRenderer.invoke("gw2-api-key:load"),
  saveApiKey: (apiKey) => ipcRenderer.invoke("gw2-api-key:save", apiKey),
  deleteApiKey: () => ipcRenderer.invoke("gw2-api-key:delete"),
  listMarketHistory: () => ipcRenderer.invoke("market-history:list"),
  loadMarketHistoryForItem: (itemId) => ipcRenderer.invoke("market-history:item", itemId),
  recordMarketHistory: (point) => ipcRenderer.invoke("market-history:record", point),
  importMarketHistory: (points) => ipcRenderer.invoke("market-history:import", points),
  migrateMarketHistory: (points) => ipcRenderer.invoke("market-history:migrate", points),
  loadMarketCatalog: (scopeId) => ipcRenderer.invoke("market-catalog:load", scopeId),
  saveMarketCatalog: (scopeId, items) => ipcRenderer.invoke("market-catalog:save", scopeId, items),
  loadRecipeCache: () => ipcRenderer.invoke("recipe-cache:load"),
  saveRecipeCache: (recipes) => ipcRenderer.invoke("recipe-cache:save", recipes),
  loadItemCache: (ids) => ipcRenderer.invoke("item-cache:load", ids),
  loadItemCacheByType: (type) => ipcRenderer.invoke("item-cache:load-by-type", type),
  saveItemCache: (items) => ipcRenderer.invoke("item-cache:save", items),
  loadWikiContainerCache: (cacheKey) => ipcRenderer.invoke("wiki-container-cache:load", cacheKey),
  saveWikiContainerCache: (cacheKey, analysis) => ipcRenderer.invoke("wiki-container-cache:save", cacheKey, analysis),
  loadAppCache: (cacheKey) => ipcRenderer.invoke("app-cache:load", cacheKey),
  saveAppCache: (cacheKey, value) => ipcRenderer.invoke("app-cache:save", cacheKey, value),
  deleteAppCachePrefix: (prefix) => ipcRenderer.invoke("app-cache:delete-prefix", prefix),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  openUpdateDownload: (updateInfo) => ipcRenderer.invoke("updates:open-download", updateInfo),
  onNavigateHistory: (callback) => {
    const listener = (_event, direction) => callback(direction);
    ipcRenderer.on("navigation:history", listener);
    return () => ipcRenderer.removeListener("navigation:history", listener);
  },
});
