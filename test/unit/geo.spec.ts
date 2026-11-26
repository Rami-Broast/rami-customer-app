import {
  branchDistanceKm,
  Coords,
  filterBranches,
  formatDistance,
  haversineKm,
  nearestBranch,
  sortBranchesByDistance,
} from '../../src/util/geo';

type B = {
  id: string;
  name: string;
  nameAr?: string | null;
  city?: string;
  district?: string | null;
  latitude: number | null;
  longitude: number | null;
};

const riyadh: Coords = { latitude: 24.7136, longitude: 46.6753 };

const branches: B[] = [
  { id: 'far', name: 'Jeddah Branch', city: 'Jeddah', district: null, latitude: 21.4858, longitude: 39.1925 },
  { id: 'near', name: 'Olaya', nameAr: 'العليا', city: 'Riyadh', district: 'Olaya', latitude: 24.69, longitude: 46.68 },
  { id: 'mid', name: 'Dammam', city: 'Dammam', district: null, latitude: 26.4207, longitude: 50.0888 },
  { id: 'nopin', name: 'Pop-up', city: 'Riyadh', district: 'Nowhere', latitude: null, longitude: null },
];

describe('haversineKm', () => {
  it('is ~0 for the same point', () => {
    expect(haversineKm(riyadh, riyadh)).toBeCloseTo(0, 5);
  });
  it('approximates a known distance (Riyadh↔Jeddah ≈ 850 km)', () => {
    const d = haversineKm(riyadh, { latitude: 21.4858, longitude: 39.1925 });
    expect(d).toBeGreaterThan(800);
    expect(d).toBeLessThan(900);
  });
});

describe('branchDistanceKm', () => {
  it('is null without coords or without a branch pin', () => {
    expect(branchDistanceKm(branches[1]!, null)).toBeNull();
    expect(branchDistanceKm(branches[3]!, riyadh)).toBeNull();
  });
});

describe('sortBranchesByDistance', () => {
  it('orders nearest-first with un-pinned branches last', () => {
    const out = sortBranchesByDistance(branches, riyadh);
    expect(out.map((b) => b.id)).toEqual(['near', 'mid', 'far', 'nopin']);
    expect(out[0]!.distanceKm).toBeGreaterThan(0);
    expect(out[3]!.distanceKm).toBeNull();
  });
  it('leaves order unchanged when there are no coords', () => {
    const out = sortBranchesByDistance(branches, null);
    expect(out.map((b) => b.id)).toEqual(['far', 'near', 'mid', 'nopin']);
  });
});

describe('nearestBranch', () => {
  it('returns the closest pinned branch', () => {
    expect(nearestBranch(branches, riyadh)?.id).toBe('near');
  });
  it('returns null when nothing can be measured', () => {
    expect(nearestBranch(branches, null)).toBeNull();
    expect(nearestBranch([branches[3]!], riyadh)).toBeNull();
  });
});

describe('filterBranches', () => {
  it('matches name, Arabic name, district and city', () => {
    expect(filterBranches(branches, 'olaya').map((b) => b.id)).toEqual(['near']);
    expect(filterBranches(branches, 'العليا').map((b) => b.id)).toEqual(['near']);
    expect(filterBranches(branches, 'jeddah').map((b) => b.id)).toEqual(['far']);
  });
  it('returns all for an empty query', () => {
    expect(filterBranches(branches, '  ')).toHaveLength(4);
  });
});

describe('formatDistance', () => {
  it('formats metres under 1 km and km above', () => {
    expect(formatDistance(0.85)).toBe('850 m');
    expect(formatDistance(1.23)).toBe('1.2 km');
    expect(formatDistance(null)).toBeNull();
  });
});
