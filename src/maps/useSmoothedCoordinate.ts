import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '../motion';
import { Coordinate, interpolateCoordinate, sameCoordinate } from './smoothCoordinate';

/**
 * Eases a marker coordinate toward each newly-reported position.
 *
 * The driver's location updates once per poll; without this the pin jumps. When
 * the target changes, the rendered coordinate animates from its previous value
 * to the new one over `durationMs`, so the marker glides between polls.
 *
 * - A null target (no driver yet) renders null — no marker, no animation.
 * - The first non-null target appears immediately (there is nothing to ease
 *   from), as does any change under reduced motion.
 * - Uses requestAnimationFrame, which exists in both React Native and the web
 *   build; the frame loop is always cancelled on cleanup, so it cannot outlive
 *   the screen or stack up across polls.
 */
export function useSmoothedCoordinate(target: Coordinate | null, durationMs = 1200): Coordinate | null {
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState<Coordinate | null>(target);
  const fromRef = useRef<Coordinate | null>(target);
  const rafRef = useRef<number | null>(null);

  const targetLat = target?.latitude ?? null;
  const targetLng = target?.longitude ?? null;

  useEffect(() => {
    const cancel = (): void => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (!target) {
      cancel();
      fromRef.current = null;
      setCurrent(null);
      return;
    }

    const from = fromRef.current;
    // Snap: first fix, reduced motion, no duration, or an unchanged point.
    if (!from || reduceMotion || durationMs <= 0 || sameCoordinate(from, target)) {
      cancel();
      fromRef.current = target;
      setCurrent(target);
      return;
    }

    const start = Date.now();
    const step = (): void => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      setCurrent(interpolateCoordinate(from, target, t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return cancel;
    // Depend on the primitive coordinates, not the object identity, so a new
    // object with the same numbers does not restart the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLat, targetLng, reduceMotion, durationMs]);

  return current;
}
