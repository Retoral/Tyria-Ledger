import { ArrowLeft, BarChart3, CheckCircle2, Database, Heart, Loader2, RefreshCcw, Search, Smartphone } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  buildChanges,
  fetchItems,
  fetchMarketPrices,
  money,
  priceToPoint,
  type ItemSummary,
  type MarketHistoryPoint,
} from "./market";
import { getItemMarketHistory, getItems, getValue, putItems, putMarketHistory, setValue } from "./storage";

type Tab = "importer" | "market" | "favorites";
type LoadState = "idle" | "loading" | "ready" | "error";

interface PairingInfo {
  baseUrl: string;
  token: string;
}

interface ScanEntry {
  id: string;
  scannedAt: string;
  itemCount: number;
}

const SNAPSHOT_KEY = "tyria-ledger.android.snapshot.v1";
const PREVIOUS_SNAPSHOT_KEY = "tyria-ledger.android.previous-snapshot.v1";
const ITEMS_KEY = "tyria-ledger.android.items.v1";
const PAIRING_KEY = "tyria-ledger.android.pairing.v1";
const FAVORITES_KEY = "tyria-ledger.android.favorites.v1";
const SCAN_HISTORY_KEY = "tyria-ledger.android.scan-history.v1";
const MARKET_LIST_LIMIT = 500;

function readJson<T>(key: string, fallback: T): T {
  try {
    const text = window.localStorage.getItem(key);
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Small preferences should fit. Heavy market data is stored in IndexedDB.
  }
}

function formatAge(timestamp?: string): string {
  if (!timestamp) {
    return "Never";
  }

  const ageMs = Date.now() - new Date(timestamp).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) {
    return "just now";
  }

  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function formatScanTime(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function parsePairingPayload(text: string): PairingInfo | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as { baseUrl?: string; url?: string; token?: string };
    const baseUrl = parsed.baseUrl ?? parsed.url;
    if (baseUrl && parsed.token) {
      return {
        baseUrl: baseUrl.replace(/\/$/, ""),
        token: parsed.token,
      };
    }
  } catch {
    // Fall through to URL mode.
  }

  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get("token");
    if (token) {
      return {
        baseUrl: `${url.protocol}//${url.host}`,
        token,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function itemLabel(item: ItemSummary | undefined, id: number): string {
  return item?.name ?? `Item ${id}`;
}

function App() {
  const [tab, setTab] = useState<Tab>("importer");
  const [snapshot, setSnapshot] = useState<MarketHistoryPoint[]>([]);
  const [previousSnapshot, setPreviousSnapshot] = useState<MarketHistoryPoint[] | null>(null);
  const [itemsById, setItemsById] = useState<Map<number, ItemSummary>>(() => new Map());
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set(readJson<number[]>(FAVORITES_KEY, [])));
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [pairing, setPairing] = useState<PairingInfo | null>(() => readJson(PAIRING_KEY, null));
  const [pairingText, setPairingText] = useState("");
  const [scanState, setScanState] = useState<LoadState>("idle");
  const [syncState, setSyncState] = useState<LoadState>("idle");
  const [scanProgress, setScanProgress] = useState<{ loaded: number; total: number; label: string } | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<MarketHistoryPoint[]>([]);
  const [pullDistance, setPullDistance] = useState(0);
  const marketScrollRef = useRef<HTMLElement | null>(null);
  const pullStartY = useRef<number | null>(null);
  const itemHydrationStarted = useRef(false);

  const snapshotById = useMemo(() => new Map(snapshot.map((point) => [point.itemId, point])), [snapshot]);
  const selectedPoint = selectedId ? snapshotById.get(selectedId) : null;
  const selectedItem = selectedId ? itemsById.get(selectedId) : undefined;
  const latestScanAt = snapshot[0]?.recordedAt;
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    writeJson(FAVORITES_KEY, Array.from(favorites));
  }, [favorites]);

  useEffect(() => {
    let mounted = true;

    async function loadStoredData() {
      try {
        const [storedSnapshot, storedPreviousSnapshot, storedHistory, storedItems] = await Promise.all([
          getValue<MarketHistoryPoint[]>(SNAPSHOT_KEY, readJson(SNAPSHOT_KEY, [])),
          getValue<MarketHistoryPoint[] | null>(PREVIOUS_SNAPSHOT_KEY, readJson(PREVIOUS_SNAPSHOT_KEY, null)),
          getValue<ScanEntry[]>(SCAN_HISTORY_KEY, readJson(SCAN_HISTORY_KEY, [])),
          getItems(),
        ]);

        if (!mounted) {
          return;
        }

        const legacyItems = readJson<ItemSummary[]>(ITEMS_KEY, []);
        const mergedItems = new Map([...legacyItems, ...storedItems].map((item) => [item.id, item] as const));
        setSnapshot(storedSnapshot);
        setPreviousSnapshot(storedPreviousSnapshot);
        setScanHistory(storedHistory);
        setItemsById(mergedItems);

        window.localStorage.removeItem(SNAPSHOT_KEY);
        window.localStorage.removeItem(PREVIOUS_SNAPSHOT_KEY);
        window.localStorage.removeItem(ITEMS_KEY);
        window.localStorage.removeItem(SCAN_HISTORY_KEY);
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load stored Android market data.");
        }
      }
    }

    void loadStoredData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }
    const timeout = window.setTimeout(() => setError(""), 8000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    let mounted = true;
    if (!selectedId) {
      setSelectedHistory([]);
      return undefined;
    }

    void getItemMarketHistory(selectedId).then((history) => {
      if (mounted) {
        setSelectedHistory(history);
      }
    });

    return () => {
      mounted = false;
    };
  }, [selectedId, snapshot]);

  useEffect(() => {
    if (itemHydrationStarted.current || snapshot.length === 0 || itemsById.size >= snapshot.length * 0.8) {
      return;
    }

    itemHydrationStarted.current = true;
    setScanProgress({ loaded: itemsById.size, total: snapshot.length, label: "Loading item entries" });
    void enrichItems(
      snapshot.map((point) => point.itemId),
      (loaded, total) => {
        setScanProgress({ loaded, total, label: "Loading item entries" });
        setProgress(`${loaded.toLocaleString()} / ${total.toLocaleString()} item entries`);
      },
    )
      .then(() => {
        setProgress(`${snapshot.length.toLocaleString()} cached market items ready`);
        window.setTimeout(() => setScanProgress(null), 900);
      })
      .catch((hydrateError) => {
        setScanProgress(null);
        setError(hydrateError instanceof Error ? hydrateError.message : "Could not load item entries.");
      });
  }, [itemsById.size, snapshot]);

  async function enrichItems(ids: number[], onBatch?: (loaded: number, total: number) => void) {
    const missingIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id) && !itemsById.has(id))));
    if (missingIds.length === 0) {
      return;
    }

    const nextItems = new Map(itemsById);
    for (let offset = 0; offset < missingIds.length; offset += 200) {
      const loaded = await fetchItems(missingIds.slice(offset, offset + 200));
      loaded.forEach((item) => nextItems.set(item.id, item));
      onBatch?.(Math.min(offset + 200, missingIds.length), missingIds.length);
    }
    setItemsById(nextItems);
    await putItems(Array.from(nextItems.values()));
  }

  async function scanMarket() {
    setScanState("loading");
    setError("");
    setProgress("Starting market scan");

    try {
      const recordedAt = new Date().toISOString();
      const prices = await fetchMarketPrices((loaded, total) => {
        setScanProgress({ loaded, total, label: "Downloading prices" });
        setProgress(`${loaded.toLocaleString()} / ${total.toLocaleString()} prices`);
      });
      const points = prices.map((price) => priceToPoint(price, recordedAt));
      await Promise.all([
        setValue(PREVIOUS_SNAPSHOT_KEY, snapshot),
        setValue(SNAPSHOT_KEY, points),
        putMarketHistory(points),
      ]);
      setPreviousSnapshot(snapshot);
      setSnapshot(points);

      const highSignalIds = buildChanges(points, snapshot, itemsById)
        .slice(0, 120)
        .map((change) => change.id);
      const marketIds = points.map((point) => point.itemId);
      await enrichItems([...marketIds, ...highSignalIds, ...Array.from(favorites)], (loaded, total) => {
        setScanProgress({ loaded, total, label: "Loading item entries" });
        setProgress(`${loaded.toLocaleString()} / ${total.toLocaleString()} item entries`);
      });

      setScanState("ready");
      setProgress(`${points.length.toLocaleString()} Trading Post items scanned`);
      const nextHistory = [{ id: recordedAt, scannedAt: recordedAt, itemCount: points.length }, ...scanHistory].slice(0, 20);
      setScanHistory(nextHistory);
      await setValue(SCAN_HISTORY_KEY, nextHistory);
      window.setTimeout(() => setScanProgress(null), 900);
    } catch (scanError) {
      setScanState("error");
      setScanProgress(null);
      setError(scanError instanceof Error ? scanError.message : "Market scan failed.");
    }
  }

  async function savePairing() {
    const parsed = parsePairingPayload(pairingText);
    if (!parsed) {
      setError("Paste the QR payload or desktop sync URL from Tyria Ledger.");
      return;
    }

    setPairing(parsed);
    writeJson(PAIRING_KEY, parsed);
    setPairingText("");
    setError("");
  }

  async function syncToDesktop() {
    if (!pairing) {
      setError("Pair with the desktop app first.");
      return;
    }
    if (snapshot.length === 0) {
      setError("Scan the market before syncing.");
      return;
    }

    setSyncState("loading");
    setError("");
    try {
      const response = await fetch(`${pairing.baseUrl}/market-history?token=${encodeURIComponent(pairing.token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tyria-Ledger-Token": pairing.token,
        },
        body: JSON.stringify({
          kind: "tyria-ledger.market-history.v1",
          points: snapshot,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; recorded?: number; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? `Desktop sync returned ${response.status}`);
      }
      setSyncState("ready");
      setProgress(`Synced ${Number(result.recorded ?? 0).toLocaleString()} market points to desktop`);
    } catch (syncError) {
      setSyncState("error");
      setError(syncError instanceof Error ? syncError.message : "Desktop sync failed.");
    }
  }

  function toggleFavorite(id: number) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        void enrichItems([id]);
      }
      return next;
    });
  }

  const marketRows = useMemo(
    () =>
      snapshot
        .map((point) => ({
          id: point.itemId,
          item: itemsById.get(point.itemId),
          point,
        }))
        .sort((left, right) => right.point.buyQuantity - left.point.buyQuantity),
    [itemsById, snapshot],
  );

  const filteredMarketRows = marketRows.filter((row) => {
    const item = row.item;
    const haystack = [
      itemLabel(item, row.id),
      item?.rarity ?? "",
      item?.type ?? "",
      String(row.id),
    ].join(" ").toLowerCase();
    return !normalizedQuery || haystack.includes(normalizedQuery);
  });

  const favoriteRows = Array.from(favorites)
    .map((id) => ({
      id,
      item: itemsById.get(id),
      point: snapshotById.get(id),
    }))
    .filter((row) => {
      const label = itemLabel(row.item, row.id).toLowerCase();
      return !normalizedQuery || label.includes(normalizedQuery) || String(row.id).includes(normalizedQuery);
    });

  function beginMarketPull(event: React.TouchEvent<HTMLElement>) {
    if (tab !== "market" || scanState === "loading" || marketScrollRef.current?.scrollTop) {
      return;
    }
    pullStartY.current = event.touches[0]?.clientY ?? null;
  }

  function moveMarketPull(event: React.TouchEvent<HTMLElement>) {
    if (pullStartY.current === null || scanState === "loading") {
      return;
    }
    const delta = (event.touches[0]?.clientY ?? 0) - pullStartY.current;
    setPullDistance(delta > 0 ? Math.min(86, Math.round(delta * 0.42)) : 0);
  }

  function endMarketPull() {
    if (pullDistance >= 54 && scanState !== "loading") {
      void scanMarket();
    }
    pullStartY.current = null;
    setPullDistance(0);
  }

  if (selectedId) {
    return (
      <main className="app-shell">
        <header className="top-bar">
          <button className="ghost-button" onClick={() => setSelectedId(null)}>
            <ArrowLeft />
            Back
          </button>
          <button
            className={`favorite-button ${favorites.has(selectedId) ? "active" : ""}`}
            onClick={() => toggleFavorite(selectedId)}
          >
            <Heart />
          </button>
        </header>
        <section className="detail-hero">
          {selectedItem?.icon ? <img src={selectedItem.icon} alt="" /> : <div className="item-icon-fallback" />}
          <div>
            <span>{selectedItem?.rarity ?? "Item"}</span>
            <h1>{itemLabel(selectedItem, selectedId)}</h1>
            <p>
              {selectedItem?.type ?? "Market item"}
              {selectedItem?.level ? ` - Level ${selectedItem.level}` : ""}
            </p>
          </div>
        </section>
        <section className="metric-grid">
          <Metric label="Buy" value={selectedPoint ? money(selectedPoint.buyPrice) : "-"} />
          <Metric label="Sell" value={selectedPoint ? money(selectedPoint.sellPrice) : "-"} />
          <Metric label="Demand" value={selectedPoint ? selectedPoint.buyQuantity.toLocaleString() : "-"} />
          <Metric label="Supply" value={selectedPoint ? selectedPoint.sellQuantity.toLocaleString() : "-"} />
        </section>
        <MarketChart
          points={selectedHistory.length ? selectedHistory : selectedPoint ? [selectedPoint] : []}
        />
        <section className="surface">
          <h2>Sync Status</h2>
          <p>This phone stores the latest market snapshot locally and sends it to the desktop app when synced.</p>
          <button className="primary-button" onClick={syncToDesktop} disabled={syncState === "loading" || !pairing}>
            {syncState === "loading" ? <Loader2 className="spin" /> : <Smartphone />}
            Sync item data
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span>Tyria Ledger</span>
          <h1>{tab === "importer" ? "Market Importer" : tab === "market" ? "Market" : "Favourites"}</h1>
        </div>
        <span className="status-pill">{formatAge(latestScanAt)}</span>
      </header>

      {scanProgress ? (
        <aside className="download-toast" role="status">
          <Loader2 className="spin" />
          <div>
            <strong>{scanProgress.label}</strong>
            <span>
              {scanProgress.loaded.toLocaleString()} / {scanProgress.total.toLocaleString()}
            </span>
          </div>
        </aside>
      ) : null}

      {tab === "importer" ? (
        <section className="page-stack">
          <section className="surface">
            <div className="section-heading">
              <div>
                <h2>Collect Market Data</h2>
                <p>Scan the live GW2 Trading Post, then sync the snapshot to your desktop app.</p>
              </div>
              <Database />
            </div>
            <button className="primary-button" onClick={scanMarket} disabled={scanState === "loading"}>
              {scanState === "loading" ? <Loader2 className="spin" /> : <RefreshCcw />}
              {scanState === "loading" ? "Scanning" : "Scan market"}
            </button>
            <p className="muted">{progress || `${snapshot.length.toLocaleString()} items cached on this phone.`}</p>
          </section>

          <section className="surface">
            <div className="section-heading">
              <div>
                <h2>Scan History</h2>
                <p>Completed market scans stored on this phone.</p>
              </div>
              <span className="count-pill">{scanHistory.length}</span>
            </div>
            {scanHistory.length ? (
              <ol className="scan-history">
                {scanHistory.map((entry) => (
                  <li key={entry.id}>
                    <strong>{formatScanTime(entry.scannedAt)}</strong>
                    <span>{entry.itemCount.toLocaleString()} items</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">No scans yet.</p>
            )}
          </section>

          <section className="surface">
            <div className="section-heading">
              <div>
                <h2>Desktop Pairing</h2>
                <p>Paste the QR payload or sync URL from the desktop account page.</p>
              </div>
              {pairing ? <CheckCircle2 className="ok" /> : <Smartphone />}
            </div>
            <textarea
              value={pairingText}
              onChange={(event) => setPairingText(event.target.value)}
              placeholder="Paste QR payload or desktop sync URL"
            />
            <div className="button-row">
              <button className="ghost-button" onClick={savePairing}>
                Save pairing
              </button>
              <button className="primary-button" onClick={syncToDesktop} disabled={syncState === "loading" || !pairing}>
                {syncState === "loading" ? <Loader2 className="spin" /> : <Smartphone />}
                Sync desktop
              </button>
            </div>
            <p className="muted">{pairing ? `Paired to ${pairing.baseUrl}` : "Not paired yet."}</p>
          </section>
        </section>
      ) : (
        <section
          ref={tab === "market" ? marketScrollRef : undefined}
          className="page-stack"
          onTouchStart={beginMarketPull}
          onTouchMove={moveMarketPull}
          onTouchEnd={endMarketPull}
          onTouchCancel={endMarketPull}
        >
          {tab === "market" ? (
            <div className={`pull-indicator ${pullDistance ? "visible" : ""}`} style={{ height: pullDistance }}>
              <Loader2 className={pullDistance >= 54 || scanState === "loading" ? "spin" : ""} />
              <span>{pullDistance >= 54 ? "Release to refresh" : "Pull to refresh"}</span>
            </div>
          ) : null}
          <label className="search-box">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item name or ID"
            />
          </label>
          {tab === "market" ? (
            <>
              <p className="muted list-summary">
                Showing {Math.min(filteredMarketRows.length, MARKET_LIST_LIMIT).toLocaleString()} of{" "}
                {filteredMarketRows.length.toLocaleString()} market items.
              </p>
              <ItemList
                rows={filteredMarketRows.slice(0, MARKET_LIST_LIMIT).map((row) => ({
                  id: row.id,
                  item: row.item,
                  meta: `${row.point.buyQuantity.toLocaleString()} wanted / ${row.point.sellQuantity.toLocaleString()} listed`,
                  value: money(row.point.sellPrice),
                }))}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onSelect={setSelectedId}
              />
            </>
          ) : (
            <ItemList
              rows={favoriteRows.map((row) => ({
                id: row.id,
                item: row.item,
                meta: row.point ? `${row.point.buyQuantity.toLocaleString()} wanted` : "No scan data",
                value: row.point ? money(row.point.sellPrice) : "-",
              }))}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelect={setSelectedId}
            />
          )}
        </section>
      )}

      {error ? (
        <button className="error-banner" onClick={() => setError("")}>
          {error}
        </button>
      ) : null}

      <nav className="bottom-tabs">
        <TabButton active={tab === "importer"} icon={<Database />} label="Importer" onClick={() => setTab("importer")} />
        <TabButton active={tab === "market"} icon={<BarChart3 />} label="Market" onClick={() => setTab("market")} />
        <TabButton active={tab === "favorites"} icon={<Heart />} label="Favourites" onClick={() => setTab("favorites")} />
      </nav>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MarketChart({ points }: { points: MarketHistoryPoint[] }) {
  const chartPoints = points.slice(-24);
  const values = chartPoints.flatMap((point) => [point.buyPrice, point.sellPrice]).filter((value) => value > 0);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const range = Math.max(1, max - min);
  const width = 320;
  const height = 150;
  const padding = 18;

  const pathFor = (selector: (point: MarketHistoryPoint) => number) =>
    chartPoints
      .map((point, index) => {
        const x =
          chartPoints.length === 1
            ? width / 2
            : padding + (index / (chartPoints.length - 1)) * (width - padding * 2);
        const y = height - padding - ((selector(point) - min) / range) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

  return (
    <section className="surface chart-card">
      <div className="section-heading">
        <div>
          <h2>Market Graph</h2>
          <p>{chartPoints.length ? `${chartPoints.length} local scan points` : "No scan data for this item yet."}</p>
        </div>
        <BarChart3 />
      </div>
      {chartPoints.length ? (
        <>
          <svg className="market-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Market price graph">
            <line x1={padding} x2={width - padding} y1={padding} y2={padding} />
            <line x1={padding} x2={width - padding} y1={height / 2} y2={height / 2} />
            <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} />
            <path className="buy-line" d={pathFor((point) => point.buyPrice)} />
            <path className="sell-line" d={pathFor((point) => point.sellPrice)} />
          </svg>
          <div className="chart-legend">
            <span><i className="buy-dot" /> Buy</span>
            <span><i className="sell-dot" /> Sell</span>
          </div>
        </>
      ) : null}
    </section>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ItemList({
  rows,
  favorites,
  onToggleFavorite,
  onSelect,
}: {
  rows: Array<{ id: number; item?: ItemSummary; meta: string; value: string }>;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  onSelect: (id: number) => void;
}) {
  if (rows.length === 0) {
    return (
      <section className="surface empty-state">
        <p>No items to show yet.</p>
      </section>
    );
  }

  return (
    <section className="item-list">
      {rows.map((row) => (
        <article key={row.id} className="item-row" onClick={() => onSelect(row.id)}>
          {row.item?.icon ? <img src={row.item.icon} alt="" /> : <div className="item-icon-fallback" />}
          <div>
            <h2>{itemLabel(row.item, row.id)}</h2>
            <p>{row.item?.rarity ?? "Unknown"} {row.item?.type ?? ""}</p>
            <span>{row.meta}</span>
          </div>
          <div className="item-row-side">
            <strong>{row.value}</strong>
            <button
              className={`favorite-button ${favorites.has(row.id) ? "active" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(row.id);
              }}
            >
              <Heart />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

export default App;
