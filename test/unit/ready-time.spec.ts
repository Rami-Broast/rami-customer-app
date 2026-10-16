import { readyTimeState } from '../../src/features/order/ready-time';
import { ORDER_STATUS, ORDER_TYPE } from '../../src/types/backend';

const BASE = {
  type: ORDER_TYPE.PICKUP,
  placedAt: '2026-10-16T12:00:00.000Z',
  confirmedAt: null,
  preparingAt: null,
  prepTimeMinutes: 20,
  nowMs: Date.parse('2026-10-16T12:00:00.000Z'),
};

describe('readyTimeState', () => {
  it('is unknown before cooking starts (no promise before accept)', () => {
    expect(readyTimeState({ ...BASE, status: ORDER_STATUS.PENDING_PAYMENT }).kind).toBe('unknown');
  });

  it('is unknown when the branch has no configured prep time — never invents a number', () => {
    expect(
      readyTimeState({ ...BASE, status: ORDER_STATUS.PREPARING, prepTimeMinutes: null, preparingAt: BASE.placedAt }).kind,
    ).toBe('unknown');
    expect(
      readyTimeState({ ...BASE, status: ORDER_STATUS.PREPARING, prepTimeMinutes: 0, preparingAt: BASE.placedAt }).kind,
    ).toBe('unknown');
  });

  it('counts down from when preparing started', () => {
    const start = Date.parse('2026-10-16T12:00:00.000Z');
    const state = readyTimeState({
      ...BASE,
      status: ORDER_STATUS.PREPARING,
      preparingAt: '2026-10-16T12:00:00.000Z',
      prepTimeMinutes: 20,
      nowMs: start + 5 * 60_000, // 5 min in
    });
    expect(state.kind).toBe('counting');
    if (state.kind === 'counting') {
      expect(state.remainingMinutes).toBe(15);
      expect(state.readyAtMs).toBe(start + 20 * 60_000);
      expect(state.progress).toBeCloseTo(0.25, 5);
    }
  });

  it('prefers preparingAt, then confirmedAt, then placedAt as the start', () => {
    // Only confirmedAt set: counts from confirmedAt.
    const confirmed = Date.parse('2026-10-16T12:10:00.000Z');
    const s = readyTimeState({
      ...BASE,
      status: ORDER_STATUS.CONFIRMED,
      confirmedAt: '2026-10-16T12:10:00.000Z',
      preparingAt: null,
      prepTimeMinutes: 10,
      nowMs: confirmed + 2 * 60_000,
    });
    expect(s.kind).toBe('counting');
    if (s.kind === 'counting') {
      expect(s.remainingMinutes).toBe(8);
    }
  });

  it('rounds remaining minutes up, and never shows 0 while counting', () => {
    const start = Date.parse('2026-10-16T12:00:00.000Z');
    const state = readyTimeState({
      ...BASE,
      status: ORDER_STATUS.PREPARING,
      preparingAt: '2026-10-16T12:00:00.000Z',
      prepTimeMinutes: 20,
      nowMs: start + 20 * 60_000 - 1_000, // 1 second left
    });
    expect(state.kind).toBe('counting');
    if (state.kind === 'counting') {
      expect(state.remainingMinutes).toBe(1);
    }
  });

  it('is imminent (not negative) once the estimate elapses but the order is still cooking', () => {
    const start = Date.parse('2026-10-16T12:00:00.000Z');
    const state = readyTimeState({
      ...BASE,
      status: ORDER_STATUS.PREPARING,
      preparingAt: '2026-10-16T12:00:00.000Z',
      prepTimeMinutes: 20,
      nowMs: start + 25 * 60_000, // 5 min past estimate
    });
    expect(state.kind).toBe('imminent');
  });

  it('is ready once the order is READY', () => {
    expect(readyTimeState({ ...BASE, status: ORDER_STATUS.READY, preparingAt: BASE.placedAt }).kind).toBe('ready');
  });

  it('is done once past ready (out for delivery, delivered, etc.)', () => {
    for (const status of [
      ORDER_STATUS.DRIVER_ASSIGNED,
      ORDER_STATUS.PICKED_UP,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
    ]) {
      expect(readyTimeState({ ...BASE, status, preparingAt: BASE.placedAt }).kind).toBe('done');
    }
  });

  it('is unknown for cancelled / refunded / failed — no countdown', () => {
    for (const status of [
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.REFUNDED,
      ORDER_STATUS.PAYMENT_FAILED,
    ]) {
      expect(readyTimeState({ ...BASE, status, preparingAt: BASE.placedAt }).kind).toBe('unknown');
    }
  });

  it('progress is clamped to 1 and remaining stays whole when the window is nearly done', () => {
    const start = Date.parse('2026-10-16T12:00:00.000Z');
    const state = readyTimeState({
      ...BASE,
      status: ORDER_STATUS.PREPARING,
      preparingAt: '2026-10-16T12:00:00.000Z',
      prepTimeMinutes: 20,
      nowMs: start + 19 * 60_000 + 30_000, // 30s left
    });
    if (state.kind === 'counting') {
      expect(state.progress).toBeLessThanOrEqual(1);
      expect(state.progress).toBeGreaterThan(0.9);
      expect(state.remainingMinutes).toBe(1);
    } else {
      throw new Error(`expected counting, got ${state.kind}`);
    }
  });
});
