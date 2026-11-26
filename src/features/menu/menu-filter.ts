/**
 * Menu search + category filtering — pure logic, no React Native.
 *
 * Turns a raw search string into the subset of categories/products to show.
 * It is deliberately pure so the matching rules (what counts as a hit, how a
 * category-name match behaves, how empty input is treated) are unit-tested in
 * plain Node, independent of the RN render — the same discipline as the cart
 * reducer and the order-status model.
 *
 * Matching rules, each chosen against a concrete failure:
 *  - Case-insensitive and trimmed, so "  Burger " finds "burger".
 *  - Matches a product's English name, its Arabic name (`nameAr`) and its
 *    description — an Arabic-reading customer searching Arabic must get hits,
 *    and a dish is often remembered by a word in its description.
 *  - A matching *category name* keeps all of that category's products ("drinks"
 *    shows every drink), because the customer is narrowing to a section, not a
 *    single item.
 *  - A category with no surviving products is dropped entirely, so the list
 *    never shows an empty heading.
 *  - Empty/whitespace query returns the original categories unchanged (same
 *    reference), so the no-search path costs nothing.
 */

import type { MenuCategory, MenuProduct } from '../../api/types';

/** Lower-cased, trimmed query. Exported so the screen and tests share one rule. */
export function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase();
}

function haystack(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ').toLowerCase();
}

/** Whether a single product matches an already-normalized query. */
export function productMatches(product: MenuProduct, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }
  return haystack(product.name, product.nameAr, product.description).includes(normalizedQuery);
}

/** Whether a category's own name matches (which keeps all its products). */
function categoryNameMatches(category: MenuCategory, normalizedQuery: string): boolean {
  return haystack(category.name, category.nameAr).includes(normalizedQuery);
}

/**
 * The categories to render for a given search string.
 *
 * Returns the original array unchanged when the query is empty, otherwise a new
 * array of categories (new objects) carrying only the matching products, with
 * empty categories removed.
 */
export function filterMenuCategories(
  categories: readonly MenuCategory[],
  rawQuery: string,
): MenuCategory[] {
  const q = normalizeQuery(rawQuery);
  if (!q) {
    return categories as MenuCategory[];
  }

  const result: MenuCategory[] = [];
  for (const category of categories) {
    const keepAll = categoryNameMatches(category, q);
    const products = keepAll
      ? category.products
      : category.products.filter((p) => productMatches(p, q));
    if (products.length > 0) {
      result.push({ ...category, products });
    }
  }
  return result;
}

/** Total number of products across categories — used to decide the empty state. */
export function countProducts(categories: readonly MenuCategory[]): number {
  return categories.reduce((sum, c) => sum + c.products.length, 0);
}
