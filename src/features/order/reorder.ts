/**
 * Reorder — rebuild a cart from a past order. Pure, no React Native.
 *
 * A past order snapshots `productId` and its add-ons (`modifiers`), so a cart
 * can be reconstructed from it and re-priced at checkout by the server (which
 * stays the only authority on current prices and availability). An item whose
 * product was deleted since the order has a null `productId` and cannot be
 * reordered — it is skipped and counted, so the screen can tell the customer
 * "some items are no longer available" instead of silently dropping them.
 *
 * Pure so the skip/addon reconstruction is unit-tested rather than discovered
 * when a reorder quietly loses a line.
 */

import type { Order } from '../../api/types';
import type { CartLine } from '../../cart/cart';

/** A line ready to dispatch as a cart ADD (no key/quantity-less shape). */
export type ReorderLine = Omit<CartLine, 'key'>;

export interface ReorderResult {
  branchId: string;
  lines: ReorderLine[];
  /** Items dropped because their product no longer exists. */
  skipped: number;
}

export function buildReorder(order: Order): ReorderResult {
  const lines: ReorderLine[] = [];
  let skipped = 0;

  for (const item of order.items) {
    if (!item.productId) {
      skipped += 1;
      continue;
    }
    const modifiers = item.modifiers ?? [];
    const addonIds = modifiers
      .map((m) => m.addonId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    const addonNames = modifiers.map((m) => m.addonName);

    lines.push({
      productId: item.productId,
      productName: item.productName,
      unitPriceMinor: item.unitPriceMinor,
      quantity: Math.max(1, item.quantity),
      addonIds,
      addonNames,
    });
  }

  return { branchId: order.branchId, lines, skipped };
}
