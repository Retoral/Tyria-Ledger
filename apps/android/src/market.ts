export interface MarketPrice {
  id: number;
  buys: {
    unit_price: number;
    quantity: number;
  };
  sells: {
    unit_price: number;
    quantity: number;
  };
}

export interface ItemSummary {
  id: number;
  name: string;
  icon?: string;
  rarity?: string;
  type?: string;
  level?: number;
}

export interface MarketHistoryPoint {
  itemId: number;
  recordedAt: string;
  buyPrice: number;
  sellPrice: number;
  buyQuantity: number;
  sellQuantity: number;
  sampleCount: number;
}

export interface MarketChange {
  id: number;
  buyDelta: number;
  sellDelta: number;
  demandDelta: number;
  absoluteChange: number;
  current: MarketHistoryPoint;
  previous?: MarketHistoryPoint;
  item?: ItemSummary;
}

const API_BASE = "https://api.guildwars2.com";
const PAGE_SIZE = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function priceToPoint(price: MarketPrice, recordedAt: string): MarketHistoryPoint {
  return {
    itemId: price.id,
    recordedAt,
    buyPrice: price.buys?.unit_price ?? 0,
    sellPrice: price.sells?.unit_price ?? 0,
    buyQuantity: price.buys?.quantity ?? 0,
    sellQuantity: price.sells?.quantity ?? 0,
    sampleCount: 1,
  };
}

export async function fetchMarketPrices(onProgress?: (loaded: number, total: number) => void): Promise<MarketPrice[]> {
  const firstResponse = await fetch(`${API_BASE}/v2/commerce/prices?page=0&page_size=${PAGE_SIZE}`);
  if (!firstResponse.ok) {
    throw new Error(`GW2 API returned ${firstResponse.status}`);
  }

  const totalPages = Number(firstResponse.headers.get("X-Page-Total") ?? "1");
  const firstPage = (await firstResponse.json()) as MarketPrice[];
  const prices = [...firstPage];
  onProgress?.(prices.length, Math.max(firstPage.length, totalPages * PAGE_SIZE));

  for (let page = 1; page < totalPages; page += 1) {
    await sleep(65);
    const response = await fetch(`${API_BASE}/v2/commerce/prices?page=${page}&page_size=${PAGE_SIZE}`);
    if (!response.ok) {
      throw new Error(`GW2 API returned ${response.status} on page ${page + 1}`);
    }
    const pagePrices = (await response.json()) as MarketPrice[];
    prices.push(...pagePrices);
    onProgress?.(prices.length, totalPages * PAGE_SIZE);
  }

  return prices;
}

export async function fetchItems(ids: number[]): Promise<ItemSummary[]> {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id)))).slice(0, 200);
  if (uniqueIds.length === 0) {
    return [];
  }

  const response = await fetch(`${API_BASE}/v2/items?ids=${uniqueIds.join(",")}`);
  if (!response.ok) {
    return [];
  }

  return (await response.json()) as ItemSummary[];
}

export function buildChanges(
  current: MarketHistoryPoint[],
  previous: MarketHistoryPoint[] | null,
  itemsById: Map<number, ItemSummary>,
): MarketChange[] {
  const previousById = new Map((previous ?? []).map((point) => [point.itemId, point]));

  return current
    .map((point) => {
      const oldPoint = previousById.get(point.itemId);
      const buyDelta = point.buyPrice - (oldPoint?.buyPrice ?? point.buyPrice);
      const sellDelta = point.sellPrice - (oldPoint?.sellPrice ?? point.sellPrice);
      const demandDelta = point.buyQuantity - (oldPoint?.buyQuantity ?? point.buyQuantity);

      return {
        id: point.itemId,
        buyDelta,
        sellDelta,
        demandDelta,
        absoluteChange: Math.abs(buyDelta) + Math.abs(sellDelta) + Math.abs(demandDelta / 100),
        current: point,
        previous: oldPoint,
        item: itemsById.get(point.itemId),
      };
    })
    .filter((change) => change.absoluteChange > 0)
    .sort((left, right) => right.absoluteChange - left.absoluteChange)
    .slice(0, 120);
}

export function money(value: number): string {
  const copper = Math.max(0, Math.round(value));
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperRemainder = copper % 100;
  const parts = [];

  if (gold) {
    parts.push(`${gold}g`);
  }
  if (silver || gold) {
    parts.push(`${silver}s`);
  }
  parts.push(`${copperRemainder}c`);
  return parts.join(" ");
}
