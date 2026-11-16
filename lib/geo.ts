import { incidents, type Incident } from "./incidents";

export type LngLat = [number, number];

/** Kejadian dalam radius ini ditawarkan untuk digabung. */
export const NEARBY_KM = 5;

export function distanceKm([lon1, lat1]: LngLat, [lon2, lat2]: LngLat) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/** Kejadian aktif terdekat dari sebuah titik, kalau ada dalam radius tertentu. */
export function nearestIncident(point: LngLat, radiusKm = NEARBY_KM): { incident: Incident; km: number } | undefined {
  let best: { incident: Incident; km: number } | undefined;
  for (const incident of incidents) {
    if (incident.condition === "selesai") continue;
    const km = distanceKm(point, [incident.lon, incident.lat]);
    if (km <= radiusKm && (!best || km < best.km)) best = { incident, km };
  }
  return best;
}

export function formatLngLat([lon, lat]: LngLat) {
  return `${Math.abs(lat).toFixed(3)}° ${lat < 0 ? "LS" : "LU"} · ${Math.abs(lon).toFixed(3)}° ${lon < 0 ? "BB" : "BT"}`;
}
