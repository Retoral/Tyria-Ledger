import rawWikiMapPoints from "./gw2WikiMapPoints.json";

export interface Gw2WikiMapPoint {
  type: string;
  name: string;
  coord: [number, number];
  id?: number;
  chatLink?: string;
  floors?: number[];
  level?: number;
  region?: string;
}

export interface Gw2WikiMapPointMap {
  mapId: number;
  mapName: string;
  continentId: number;
  defaultFloor: number;
  floors: number[];
  continentRect: [[number, number], [number, number]];
  points: Gw2WikiMapPoint[];
}

export interface Gw2WikiResolvedMapPoint extends Gw2WikiMapPoint {
  mapId: number;
  mapName: string;
  continentId: number;
  defaultFloor: number;
  mapFloors: number[];
}

export const GW2_WIKI_MAP_POINTS = rawWikiMapPoints as Gw2WikiMapPointMap[];

const WIKI_MAP_POINTS_BY_CHAT_LINK = new Map<string, Gw2WikiResolvedMapPoint>();
const WIKI_MAP_POINTS_BY_MAP_AND_NAME = new Map<string, Gw2WikiResolvedMapPoint[]>();

for (const map of GW2_WIKI_MAP_POINTS) {
  for (const point of map.points) {
    const resolvedPoint: Gw2WikiResolvedMapPoint = {
      ...point,
      mapId: map.mapId,
      mapName: map.mapName,
      continentId: map.continentId,
      defaultFloor: map.defaultFloor,
      mapFloors: map.floors,
    };

    if (point.chatLink) {
      WIKI_MAP_POINTS_BY_CHAT_LINK.set(point.chatLink, resolvedPoint);
    }

    const nameKey = buildWikiMapPointNameKey(map.mapName, point.name);
    const existing = WIKI_MAP_POINTS_BY_MAP_AND_NAME.get(nameKey);
    if (existing) {
      existing.push(resolvedPoint);
    } else {
      WIKI_MAP_POINTS_BY_MAP_AND_NAME.set(nameKey, [resolvedPoint]);
    }
  }
}

export function findGw2WikiMapPointByChatLink(chatLink?: string): Gw2WikiResolvedMapPoint | null {
  const normalizedChatLink = chatLink?.match(/\[&[A-Za-z0-9+/=]+]/)?.[0];
  return normalizedChatLink ? WIKI_MAP_POINTS_BY_CHAT_LINK.get(normalizedChatLink) ?? null : null;
}

export function findGw2WikiMapPointByName(mapName: string, pointName: string, type?: string): Gw2WikiResolvedMapPoint | null {
  const matches = WIKI_MAP_POINTS_BY_MAP_AND_NAME.get(buildWikiMapPointNameKey(mapName, pointName)) ?? [];
  if (!type) {
    return matches[0] ?? null;
  }

  return matches.find((point) => point.type === type) ?? null;
}

export function findNearestGw2WikiWaypoint(mapName: string, coord?: [number, number]): Gw2WikiResolvedMapPoint | null {
  if (!coord) {
    return null;
  }

  const normalizedMapName = normalizeWikiMapPointText(mapName);
  let nearest: Gw2WikiResolvedMapPoint | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const map of GW2_WIKI_MAP_POINTS) {
    if (normalizeWikiMapPointText(map.mapName) !== normalizedMapName) {
      continue;
    }

    for (const point of map.points) {
      if (point.type !== "waypoint" || !point.chatLink) {
        continue;
      }

      const dx = point.coord[0] - coord[0];
      const dy = point.coord[1] - coord[1];
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = {
          ...point,
          mapId: map.mapId,
          mapName: map.mapName,
          continentId: map.continentId,
          defaultFloor: map.defaultFloor,
          mapFloors: map.floors,
        };
      }
    }
  }

  return nearest;
}

function buildWikiMapPointNameKey(mapName: string, pointName: string): string {
  return `${normalizeWikiMapPointText(mapName)}:${normalizeWikiMapPointText(pointName)}`;
}

function normalizeWikiMapPointText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
