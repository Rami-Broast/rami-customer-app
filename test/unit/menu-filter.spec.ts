import {
  countProducts,
  filterMenuCategories,
  normalizeQuery,
  productMatches,
} from '../../src/features/menu/menu-filter';
import type { MenuCategory, MenuProduct } from '../../src/api/types';

function product(partial: Partial<MenuProduct> & { id: string; name: string }): MenuProduct {
  return {
    nameAr: null,
    description: null,
    imageUrl: null,
    priceMinor: 1000,
    taxClass: 'standard',
    isAvailable: true,
    variants: [],
    modifierGroups: [],
    ...partial,
  };
}

function category(
  partial: Partial<MenuCategory> & { id: string; name: string; products: MenuProduct[] },
): MenuCategory {
  return { nameAr: null, imageUrl: null, ...partial };
}

const burger = product({ id: 'p1', name: 'Classic Burger', description: 'Beef patty' });
const fries = product({ id: 'p2', name: 'Fries' });
const cola = product({ id: 'p3', name: 'Cola', nameAr: 'كولا' });
const water = product({ id: 'p4', name: 'Water' });

const menu: MenuCategory[] = [
  category({ id: 'c1', name: 'Mains', products: [burger, fries] }),
  category({ id: 'c2', name: 'Drinks', nameAr: 'مشروبات', products: [cola, water] }),
];

describe('normalizeQuery', () => {
  it('trims and lowercases', () => {
    expect(normalizeQuery('  BurGer ')).toBe('burger');
  });
});

describe('productMatches', () => {
  it('matches on name, case-insensitively', () => {
    expect(productMatches(burger, 'burger')).toBe(true);
  });
  it('matches on description', () => {
    expect(productMatches(burger, 'beef')).toBe(true);
  });
  it('matches on Arabic name', () => {
    expect(productMatches(cola, 'كولا')).toBe(true);
  });
  it('does not match unrelated text', () => {
    expect(productMatches(fries, 'burger')).toBe(false);
  });
  it('an empty query matches everything', () => {
    expect(productMatches(water, '')).toBe(true);
  });
});

describe('filterMenuCategories', () => {
  it('returns the original array (same reference) for an empty query', () => {
    expect(filterMenuCategories(menu, '   ')).toBe(menu);
  });

  it('keeps only categories with a matching product', () => {
    const out = filterMenuCategories(menu, 'burger');
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe('c1');
    expect(out[0]?.products.map((p) => p.id)).toEqual(['p1']);
  });

  it('a matching category name keeps all its products', () => {
    const out = filterMenuCategories(menu, 'drinks');
    expect(out).toHaveLength(1);
    expect(out[0]?.products.map((p) => p.id)).toEqual(['p3', 'p4']);
  });

  it('matches a category by its Arabic name', () => {
    const out = filterMenuCategories(menu, 'مشروبات');
    expect(out.map((c) => c.id)).toEqual(['c2']);
    expect(out[0]?.products).toHaveLength(2);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterMenuCategories(menu, 'pizza')).toEqual([]);
  });

  it('does not mutate the input categories', () => {
    filterMenuCategories(menu, 'burger');
    expect(menu[0]?.products).toHaveLength(2);
  });
});

describe('countProducts', () => {
  it('sums products across categories', () => {
    expect(countProducts(menu)).toBe(4);
  });
  it('is zero for an empty menu', () => {
    expect(countProducts([])).toBe(0);
  });
});
