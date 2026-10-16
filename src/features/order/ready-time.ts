import { ORDER_STATUS, ORDER_TYPE, OrderStatus, OrderType } from '../../types/backend';

/**
 * The "ready in ~X min" estimate shown on order tracking.
 *
 * Grounded, never fabricated: the estimate exists only when the branch has a
 * configured prep time AND the order has actually started (confirmed/preparing).
 * The window counts from when the kitchen began, not from placement, so a
 * manual-accept branch's accept delay does not eat into the estimate.
 *
 * Pure and `now` is an argument, so a day/clock boundary is testable rather than
 * only wrong at the one minute nobody is looking. Same discipline as the
 * backend's soldOutWindow / reportRange.
 *
 * Honesty rules encoded here:
 *  - No prep time configured  -> 'unknown' (a neutral message, never a number).
 *  - Not yet started cooking   -> 'unknown' (we promise nothing before accept).
 *  - Estimate elapsed, still cooking -> 'imminent' ("any moment"), never negative.
 *  - Delivery is prep-only: this is "ready to leave the kitchen", not arrival —
 *    the caller words it so; there is no travel-ETA data to promise arrival.
 */

export type ReadyTimeState =
  | { kind: 'unknown' }
  | {
      kind: 'counting';
      /** When the food is estimated ready (epoch ms). */
      readyAtMs: number;
      /** Whole minutes remaining, rounded up, never below 1 while counting. */
      remainingMinutes: number;
      /** Elapsed fraction of the prep window, clamped 0..1 — drives the ring. */
      progress: number;
    }
  | { kind: 'imminent' }
  | { kind: 'ready' }
  | { kind: 'done' };

export interface ReadyTimeInput {
  status: OrderStatus;
  type: OrderType;
  placedAt: string;
  confirmedAt?: string | null;
  preparingAt?: string | null;
  prepTimeMinutes?: number | null;
  /** Current time as epoch ms — always passed in, never read from the clock. */
  nowMs: number;
}

/** Statuses during which the kitchen is actively working toward "ready". */
const COOKING_STATUSES: OrderStatus[] = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING];

/** Statuses at or past READY where the countdown's job is over. */
const PAST_READY: OrderStatus[] = [
  ORDER_STATUS.DRIVER_ASSIGNED,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

function parseMs(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

export function readyTimeState(input: ReadyTimeInput): ReadyTimeState {
  const { status } = input;

  if (status === ORDER_STATUS.READY) {
    return { kind: 'ready' };
  }
  // Delivered / out for delivery / cancelled / refunded / failed / pending: the
  // countdown does not apply. Tracking's timeline tells the rest of the story.
  if (!COOKING_STATUSES.includes(status)) {
    return PAST_READY.includes(status) ? { kind: 'done' } : { kind: 'unknown' };
  }

  const prep = input.prepTimeMinutes;
  if (prep == null || !Number.isFinite(prep) || prep <= 0) {
    return { kind: 'unknown' };
  }

  // Count from when cooking actually began; fall back outward only as needed.
  const startMs = parseMs(input.preparingAt) ?? parseMs(input.confirmedAt) ?? parseMs(input.placedAt);
  if (startMs == null) {
    return { kind: 'unknown' };
  }

  const totalMs = prep * 60_000;
  const readyAtMs = startMs + totalMs;
  const remainingMs = readyAtMs - input.nowMs;

  if (remainingMs <= 0) {
    // The estimate has passed but the kitchen has not marked it ready — say
    // "any moment", never a negative or zero countdown.
    return { kind: 'imminent' };
  }

  const elapsed = input.nowMs - startMs;
  const progress = Math.min(1, Math.max(0, elapsed / totalMs));
  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));

  return { kind: 'counting', readyAtMs, remainingMinutes, progress };
}

/** True when the order is for delivery — the caller words "ready" accordingly. */
export function isDeliveryOrder(type: OrderType): boolean {
  return type === ORDER_TYPE.DELIVERY;
}
