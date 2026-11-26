/**
 * Coordinate interpolation — pure, no React Native.
 *
 * The driver's position arrives once per poll (every 8s), so the marker would
 * otherwise jump in big steps on the one screen a customer watches *because*
 * they want to see where their food is. These helpers ease a marker from its
 * last position to the newly-reported one; the hook (`useSmoothedCoordinate`)
 * drives them over time. Pure so the easing is unit-tested, not eyeballed on a
 * map that is hard to test at all.
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/** Clamp to [0, 1]. */
export function clamp01(t: number): number {
  if (t < 0) return 0;
  if (t > 1) return 1;
  return t;
}

/** Standard ease-in-out (cubic). Gentle start and settle, no overshoot. */
export function easeInOut(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Linear interpolation between two numbers. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** The eased coordinate a fraction `t` of the way from `from` to `to`. */
export function interpolateCoordinate(from: Coordinate, to: Coordinate, t: number): Coordinate {
  const e = easeInOut(t);
  return {
    latitude: lerp(from.latitude, to.latitude, e),
    longitude: lerp(from.longitude, to.longitude, e),
  };
}

/** Whether two coordinates are the same point (so no animation is needed). */
export function sameCoordinate(a: Coordinate | null, b: Coordinate | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return a.latitude === b.latitude && a.longitude === b.longitude;
}
