/**
 * Geo helpers for branch selection — pure, no React Native, no expo.
 *
 * Distance drives "nearest branch" and the branch-switcher's ordering, and the
 * search filter drives finding a branch by name or area. Both are pure so they
 * are unit-tested rather than discovered wrong on a map — the same discipline as
 * the rest of this app's logic layer.
 */

export interface Coords {
  latitude: number;
  longitude: number;
}

/** Anything with (possibly missing) coordinates and the text we search on. */
export interface BranchGeo {
  latitude: number | null;
  longitude: number | null;
  name: string;
  nameAr?: string | null;
  city?: string;
  district?: string | null;
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: Coords, b: Coords): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** A branch's distance from `coords`, or null when either side lacks coordinates. */
export function branchDistanceKm(branch: BranchGeo, coords: Coords | null): number | null {
  if (!coords || branch.latitude === null || branch.longitude === null) {
    return null;
  }
  return haversineKm(coords, { latitude: branch.latitude, longitude: branch.longitude });
}

/**
 * Branches ordered nearest-first, each tagged with `distanceKm`.
 *
 * Branches with a known distance come first (ascending); branches with no
 * distance (no device location, or a branch with no pin) keep their original
 * order at the end. With no `coords` at all the order is unchanged — there is no
 * basis to reorder, and reshuffling the list on every render would move the row
 * under a finger.
 */
export function sortBranchesByDistance<T extends BranchGeo>(
  branches: readonly T[],
  coords: Coords | null,
): (T & { distanceKm: number | null })[] {
  const tagged = branches.map((b) => ({ ...b, distanceKm: branchDistanceKm(b, coords) }));
  return tagged
    .map((b, i) => ({ b, i }))
    .sort((x, y) => {
      const dx = x.b.distanceKm;
      const dy = y.b.distanceKm;
      if (dx === null && dy === null) return x.i - y.i; // stable
      if (dx === null) return 1;
      if (dy === null) return -1;
      return dx - dy || x.i - y.i;
    })
    .map(({ b }) => b);
}

/** The single nearest branch to `coords`, or null when none has a distance. */
export function nearestBranch<T extends BranchGeo>(
  branches: readonly T[],
  coords: Coords | null,
): T | null {
  let best: T | null = null;
  let bestKm = Infinity;
  for (const b of branches) {
    const d = branchDistanceKm(b, coords);
    if (d !== null && d < bestKm) {
      bestKm = d;
      best = b;
    }
  }
  return best;
}

/** Case-insensitive search over name, Arabic name, district and city. */
export function filterBranches<T extends BranchGeo>(branches: readonly T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return branches as T[];
  }
  return branches.filter((b) =>
    [b.name, b.nameAr, b.district, b.city]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

/** A short distance label, e.g. "1.2 km" or "850 m", or null when unknown. */
export function formatDistance(distanceKm: number | null): string | null {
  if (distanceKm === null) {
    return null;
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
