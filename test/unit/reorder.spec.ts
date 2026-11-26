import { buildReorder } from '../../src/features/order/reorder';
import type { Order, OrderItem } from '../../src/api/types';

function item(partial: Partial<OrderItem> & { id: string; productName: string }): OrderItem {
  return {
    productId: 'prod-1',
    variantName: null,
    quantity: 1,
    unitPriceMinor: 1000,
    lineTotalMinor: 1000,
    ...partial,
  };
}

function order(items: OrderItem[]): Order {
  return {
    id: 'o1',
    orderNumber: '1000001',
    branchId: 'b1',
    type: 'DELIVERY',
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    subtotalMinor: 0,
    discountMinor: 0,
    deliveryFeeMinor: 0,
    vatMinor: 0,
    totalMinor: 0,
    items,
    placedAt: '2026-01-01T00:00:00.000Z',
  } as Order;
}

describe('buildReorder', () => {
  it('rebuilds lines from a past order, carrying the branch', () => {
    const result = buildReorder(
      order([item({ id: 'i1', productName: 'Burger', productId: 'p1', quantity: 2, unitPriceMinor: 3000 })]),
    );
    expect(result.branchId).toBe('b1');
    expect(result.skipped).toBe(0);
    expect(result.lines).toEqual([
      {
        productId: 'p1',
        productName: 'Burger',
        unitPriceMinor: 3000,
        quantity: 2,
        addonIds: [],
        addonNames: [],
      },
    ]);
  });

  it('reconstructs add-ons from modifiers, dropping deleted add-ons', () => {
    const result = buildReorder(
      order([
        item({
          id: 'i1',
          productName: 'Burger',
          productId: 'p1',
          modifiers: [
            { addonId: 'a1', addonName: 'Cheese' },
            { addonId: null, addonName: 'Removed add-on' },
          ],
        }),
      ]),
    );
    expect(result.lines[0]?.addonIds).toEqual(['a1']);
    expect(result.lines[0]?.addonNames).toEqual(['Cheese', 'Removed add-on']);
  });

  it('skips items whose product was deleted (null productId) and counts them', () => {
    const result = buildReorder(
      order([
        item({ id: 'i1', productName: 'Burger', productId: 'p1' }),
        item({ id: 'i2', productName: 'Discontinued', productId: null }),
      ]),
    );
    expect(result.lines).toHaveLength(1);
    expect(result.skipped).toBe(1);
  });

  it('returns no lines when every item is unreorderable', () => {
    const result = buildReorder(order([item({ id: 'i1', productName: 'Gone', productId: null })]));
    expect(result.lines).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('floors quantity at 1', () => {
    const result = buildReorder(order([item({ id: 'i1', productName: 'Burger', productId: 'p1', quantity: 0 })]));
    expect(result.lines[0]?.quantity).toBe(1);
  });
});
