/**
 * Cart state — a pure reducer, no React Native.
 *
 * The cart holds only what the customer wants to buy: product ids, quantities
 * and chosen add-ons, plus a *display* price copied from the menu. It never
 * decides the payable total — that is the backend's job (`/pricing/quote` and
 * order placement). The `estimatedTotalMinor` here is a local preview only, and
 * the checkout always shows the server quote before payment.
 *
 * Being pure, every transition is unit-tested, which is what keeps cart maths
 * from silently drifting.
 */

export interface CartLine {
  /** Stable key for the line: product + sorted addon ids. */
  key: string;
  productId: string;
  productName: string;
  /** Per-unit display price in minor units, from the menu (product + addons). */
  unitPriceMinor: number;
  quantity: number;
  addonIds: string[];
  addonNames: string[];
}

export interface Cart {
  branchId: string | null;
  lines: CartLine[];
  /**
   * A coupon code the customer applied from the Offers carousel or typed at
   * checkout. The backend is the authority — it re-validates the code at
   * `/pricing/quote` and at placement — so this is only *which code to send*,
   * never proof it is valid or what it is worth.
   */
  couponCode?: string;
}

export const EMPTY_CART: Cart = { branchId: null, lines: [] };

export type CartAction =
  | { type: 'ADD'; branchId: string; line: Omit<CartLine, 'key' | 'quantity'>; quantity?: number }
  | { type: 'SET_QTY'; key: string; quantity: number }
  | { type: 'REMOVE'; key: string }
  | { type: 'SET_COUPON'; code: string }
  | { type: 'CLEAR' };

/** A stable line key so the same product+addons stacks instead of duplicating. */
export function lineKey(productId: string, addonIds: readonly string[]): string {
  return [productId, ...[...addonIds].sort()].join('|');
}

export function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD': {
      // Adding from a different branch replaces the cart — an order is always
      // for one branch, and mixing would be meaningless. A coupon is dropped on
      // that switch: it may be a code for the branch being left behind, and
      // carrying it to a new branch would send a code the checkout then refuses.
      const sameBranch = state.branchId === action.branchId;
      const base = sameBranch ? state : { branchId: action.branchId, lines: [] };
      const key = lineKey(action.line.productId, action.line.addonIds);
      const qty = Math.max(1, action.quantity ?? 1);
      const existing = base.lines.find((l) => l.key === key);
      const lines = existing
        ? base.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + qty } : l))
        : [...base.lines, { ...action.line, key, quantity: qty }];
      return { branchId: action.branchId, lines, couponCode: sameBranch ? state.couponCode : undefined };
    }
    case 'SET_COUPON': {
      const code = action.code.trim().toUpperCase();
      return { ...state, couponCode: code === '' ? undefined : code };
    }
    case 'SET_QTY': {
      if (action.quantity <= 0) {
        return removeLine(state, action.key);
      }
      return {
        ...state,
        lines: state.lines.map((l) => (l.key === action.key ? { ...l, quantity: action.quantity } : l)),
      };
    }
    case 'REMOVE':
      return removeLine(state, action.key);
    case 'CLEAR':
      return EMPTY_CART;
    default:
      return state;
  }
}

function removeLine(state: Cart, key: string): Cart {
  const lines = state.lines.filter((l) => l.key !== key);
  // An empty cart resets fully (branch and coupon); otherwise keep the rest of
  // the cart — including any applied coupon — and just drop the line.
  if (lines.length === 0) {
    return EMPTY_CART;
  }
  return { ...state, lines };
}

/** Total item count across all lines — what the cart badge shows. */
export function cartCount(cart: Cart): number {
  return cart.lines.reduce((sum, l) => sum + l.quantity, 0);
}

/** Local price preview only. The server quote is authoritative at checkout. */
export function estimatedTotalMinor(cart: Cart): number {
  return cart.lines.reduce((sum, l) => sum + l.unitPriceMinor * l.quantity, 0);
}

/** The cart as the order/quote API expects it: product ids, quantities, addons. */
export function toOrderItems(cart: Cart): { productId: string; quantity: number; addonIds: string[] }[] {
  return cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, addonIds: l.addonIds }));
}
