export type GoalStrategy = "balanced" | "cheapest" | "fastest" | "owned";
export type GoalStatus = "active" | "paused" | "complete";

export interface ProjectGoal {
  id: string;
  itemId: number;
  itemName: string;
  icon?: string;
  rarity: string;
  itemType: string;
  quantity: number;
  strategy: GoalStrategy;
  status: GoalStatus;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export type PriceAlertMetric = "buy" | "sell" | "spread";
export type PriceAlertDirection = "above" | "below";

export interface PriceAlertRule {
  id: string;
  itemId: number;
  itemName: string;
  icon?: string;
  rarity: string;
  metric: PriceAlertMetric;
  direction: PriceAlertDirection;
  target: number;
  enabled: boolean;
  createdAt: number;
  lastTriggeredAt?: number;
  wasMatching?: boolean;
}

export interface PlannedMetaStop {
  eventId: string;
  enabled: boolean;
  order: number;
}

export interface FarmSessionItem {
  itemId: number;
  name: string;
  icon?: string;
  rarity?: string;
  count: number;
  value: number;
}

export interface FarmSessionRecord {
  id: string;
  name: string;
  scope: string;
  startedAt: number;
  endedAt: number;
  activeDurationMs: number;
  totalValue: number;
  totalItems: number;
  removedItems: number;
  items: FarmSessionItem[];
}

const PROJECT_GOALS_STORAGE_KEY = "tyria-ledger:projects:v1";
const PRICE_ALERTS_STORAGE_KEY = "tyria-ledger:price-alerts:v1";
const DAILY_CHECKS_STORAGE_KEY = "tyria-ledger:daily-checks:v1";
const META_TRAIN_STORAGE_KEY = "tyria-ledger:meta-train:v1";
const FARM_SESSION_HISTORY_STORAGE_KEY = "tyria-ledger:farm-sessions:v1";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Planning records are conveniences; storage failure must not break the app.
  }
}

export function createPlanningId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function readProjectGoals(): ProjectGoal[] {
  return readJson<unknown[]>(PROJECT_GOALS_STORAGE_KEY, [])
    .filter((value): value is ProjectGoal => {
      const goal = value as Partial<ProjectGoal>;
      return (
        typeof goal.id === "string" &&
        Number.isInteger(goal.itemId) &&
        typeof goal.itemName === "string" &&
        Number.isFinite(goal.quantity)
      );
    })
    .map((goal) => ({
      ...goal,
      quantity: Math.max(1, Math.round(goal.quantity)),
      strategy: goal.strategy ?? "balanced",
      status: goal.status ?? "active",
      note: goal.note ?? "",
    }));
}

export function writeProjectGoals(goals: ProjectGoal[]) {
  writeJson(PROJECT_GOALS_STORAGE_KEY, goals);
}

export function readPriceAlerts(): PriceAlertRule[] {
  return readJson<unknown[]>(PRICE_ALERTS_STORAGE_KEY, []).filter((value): value is PriceAlertRule => {
    const alert = value as Partial<PriceAlertRule>;
    return (
      typeof alert.id === "string" &&
      Number.isInteger(alert.itemId) &&
      typeof alert.itemName === "string" &&
      Number.isFinite(alert.target)
    );
  });
}

export function writePriceAlerts(alerts: PriceAlertRule[]) {
  writeJson(PRICE_ALERTS_STORAGE_KEY, alerts);
}

export function getDailyStorageKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function readDailyChecks(dateKey = getDailyStorageKey()): Set<string> {
  const store = readJson<Record<string, string[]>>(DAILY_CHECKS_STORAGE_KEY, {});
  return new Set(store[dateKey] ?? []);
}

export function writeDailyChecks(checks: Set<string>, dateKey = getDailyStorageKey()) {
  const store = readJson<Record<string, string[]>>(DAILY_CHECKS_STORAGE_KEY, {});
  store[dateKey] = Array.from(checks);

  const recentEntries = Object.entries(store)
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, 21);
  writeJson(DAILY_CHECKS_STORAGE_KEY, Object.fromEntries(recentEntries));
}

export function readPlannedMetaStops(): PlannedMetaStop[] {
  return readJson<unknown[]>(META_TRAIN_STORAGE_KEY, []).filter((value): value is PlannedMetaStop => {
    const stop = value as Partial<PlannedMetaStop>;
    return typeof stop.eventId === "string" && typeof stop.enabled === "boolean" && Number.isFinite(stop.order);
  });
}

export function writePlannedMetaStops(stops: PlannedMetaStop[]) {
  writeJson(META_TRAIN_STORAGE_KEY, stops);
}

export function readFarmSessionHistory(): FarmSessionRecord[] {
  return readJson<unknown[]>(FARM_SESSION_HISTORY_STORAGE_KEY, [])
    .filter((value): value is FarmSessionRecord => {
      const session = value as Partial<FarmSessionRecord>;
      return (
        typeof session.id === "string" &&
        typeof session.name === "string" &&
        Number.isFinite(session.startedAt) &&
        Number.isFinite(session.endedAt) &&
        Number.isFinite(session.totalValue) &&
        Array.isArray(session.items)
      );
    })
    .sort((left, right) => right.endedAt - left.endedAt);
}

export function writeFarmSessionHistory(sessions: FarmSessionRecord[]) {
  writeJson(FARM_SESSION_HISTORY_STORAGE_KEY, sessions.slice(0, 100));
}
