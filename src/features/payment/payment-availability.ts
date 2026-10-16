import { PAYMENT_METHOD, PaymentMethod } from '../../types/backend';

/**
 * Which payment methods the checkout offers, and the default.
 *
 * Online card payment (Tap) is not yet contracted, and the closed pilot takes
 * **cash on delivery / pickup only** — so online methods are OFF by default and
 * turned on by a single build-time flag once a real gateway exists. This mirrors
 * the backend's own posture: a demo/pilot affordance is opt-IN, and the
 * forgot-to-configure state is the safe one.
 *
 * Pure and dependency-free so it is unit-tested without the Expo/RN toolchain.
 * The runtime flag is resolved once in `src/api/config.ts` from
 * `expo.extra.onlinePaymentsEnabled` (injected by `app.config.js` from the
 * `ONLINE_PAYMENTS_ENABLED` environment variable); nothing else reads it.
 */

/** The online methods, offered only when the gateway is live. Order is display order. */
const ONLINE_METHODS: PaymentMethod[] = [
  PAYMENT_METHOD.CARD,
  PAYMENT_METHOD.MADA,
  PAYMENT_METHOD.APPLE_PAY,
];

/**
 * Reads the online-payments flag off Expo's `extra`. Anything that is not the
 * exact boolean `true` means OFF — an unset, malformed or string value must not
 * accidentally switch real card payments on. `app.config.js` injects a real
 * boolean; this guard defends the build that forgets to.
 */
export function resolveOnlinePaymentsEnabled(extra: unknown): boolean {
  if (extra && typeof extra === 'object') {
    return (extra as Record<string, unknown>).onlinePaymentsEnabled === true;
  }
  return false;
}

/**
 * The methods the checkout may offer. Cash on delivery is always available (the
 * backend still gates it per branch at placement); online methods are appended
 * only when enabled. COD is last when online is on (card is the common choice
 * then) and the only option when it is off.
 */
export function availablePaymentMethods(onlineEnabled: boolean): PaymentMethod[] {
  return onlineEnabled
    ? [...ONLINE_METHODS, PAYMENT_METHOD.CASH_ON_DELIVERY]
    : [PAYMENT_METHOD.CASH_ON_DELIVERY];
}

/**
 * The method selected when checkout opens: card when online is on, cash on
 * delivery otherwise. Never defaults to a method the list does not offer.
 */
export function defaultPaymentMethod(onlineEnabled: boolean): PaymentMethod {
  return onlineEnabled ? PAYMENT_METHOD.CARD : PAYMENT_METHOD.CASH_ON_DELIVERY;
}
