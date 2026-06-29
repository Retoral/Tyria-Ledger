import type { ItemSummary, MarketHistoryPoint } from "./market";

const DB_NAME = "tyria-ledger-android";
const DB_VERSION = 1;

interface KeyValueRecord<T = unknown> {
  key: string;
  value: T;
}

interface StoredMarketPoint extends MarketHistoryPoint {
  id: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("items")) {
        db.createObjectStore("items", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("marketHistory")) {
        const store = db.createObjectStore("marketHistory", { keyPath: "id" });
        store.createIndex("itemId", "itemId", { unique: false });
        store.createIndex("recordedAt", "recordedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open Android data store."));
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Android data store request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Android data store transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Android data store transaction aborted."));
  });
}

export async function getValue<T>(key: string, fallback: T): Promise<T> {
  const db = await openDatabase();
  const transaction = db.transaction("kv", "readonly");
  const record = (await requestToPromise(transaction.objectStore("kv").get(key))) as KeyValueRecord<T> | undefined;
  return record?.value ?? fallback;
}

export async function setValue<T>(key: string, value: T): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction("kv", "readwrite");
  transaction.objectStore("kv").put({ key, value } satisfies KeyValueRecord<T>);
  await transactionDone(transaction);
}

export async function getItems(): Promise<ItemSummary[]> {
  const db = await openDatabase();
  const transaction = db.transaction("items", "readonly");
  return requestToPromise(transaction.objectStore("items").getAll()) as Promise<ItemSummary[]>;
}

export async function putItems(items: ItemSummary[]): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const db = await openDatabase();
  const transaction = db.transaction("items", "readwrite");
  const store = transaction.objectStore("items");
  items.forEach((item) => store.put(item));
  await transactionDone(transaction);
}

export async function putMarketHistory(points: MarketHistoryPoint[]): Promise<void> {
  if (points.length === 0) {
    return;
  }

  const db = await openDatabase();
  const transaction = db.transaction("marketHistory", "readwrite");
  const store = transaction.objectStore("marketHistory");
  points.forEach((point) => {
    store.put({ ...point, id: `${point.itemId}:${point.recordedAt}` } satisfies StoredMarketPoint);
  });
  await transactionDone(transaction);
}

export async function getItemMarketHistory(itemId: number): Promise<MarketHistoryPoint[]> {
  const db = await openDatabase();
  const transaction = db.transaction("marketHistory", "readonly");
  const records = (await requestToPromise(transaction.objectStore("marketHistory").index("itemId").getAll(itemId))) as StoredMarketPoint[];
  return records
    .map(({ id: _id, ...point }) => point)
    .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime());
}
