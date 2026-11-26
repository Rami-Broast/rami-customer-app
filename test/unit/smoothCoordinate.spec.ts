import {
  clamp01,
  easeInOut,
  interpolateCoordinate,
  lerp,
  sameCoordinate,
} from '../../src/maps/smoothCoordinate';

describe('clamp01', () => {
  it('clamps to [0, 1]', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.3)).toBe(0.3);
  });
});

describe('easeInOut', () => {
  it('pins the endpoints and the midpoint', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 5);
  });
  it('is monotonic', () => {
    expect(easeInOut(0.25)).toBeLessThan(easeInOut(0.75));
  });
});

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
  });
});

describe('interpolateCoordinate', () => {
  const a = { latitude: 24.0, longitude: 46.0 };
  const b = { latitude: 24.4, longitude: 46.8 };

  it('returns the start at t=0 and the end at t=1', () => {
    expect(interpolateCoordinate(a, b, 0)).toEqual(a);
    expect(interpolateCoordinate(a, b, 1)).toEqual(b);
  });
  it('lands on the midpoint at t=0.5 (ease is symmetric there)', () => {
    const mid = interpolateCoordinate(a, b, 0.5);
    expect(mid.latitude).toBeCloseTo(24.2, 5);
    expect(mid.longitude).toBeCloseTo(46.4, 5);
  });
  it('stays within the segment for intermediate t', () => {
    const c = interpolateCoordinate(a, b, 0.25);
    expect(c.latitude).toBeGreaterThan(a.latitude);
    expect(c.latitude).toBeLessThan(b.latitude);
  });
});

describe('sameCoordinate', () => {
  it('compares by value', () => {
    expect(sameCoordinate({ latitude: 1, longitude: 2 }, { latitude: 1, longitude: 2 })).toBe(true);
    expect(sameCoordinate({ latitude: 1, longitude: 2 }, { latitude: 1, longitude: 3 })).toBe(false);
  });
  it('handles nulls', () => {
    expect(sameCoordinate(null, null)).toBe(true);
    expect(sameCoordinate(null, { latitude: 1, longitude: 2 })).toBe(false);
  });
});
