import Constants from 'expo-constants';

import { resolveOnlinePaymentsEnabled } from '../features/payment/payment-availability';

/**
 * Resolves the API base URL. Pure so it can be tested; the runtime value comes
 * from `app.json → expo.extra.apiBaseUrl` per environment. No secret is ever
 * read here — only a URL.
 */
export function resolveBaseUrl(extra: unknown): string {
  const fallback = 'https://rami-api.example.com/api/v1';
  if (extra && typeof extra === 'object') {
    const url = (extra as Record<string, unknown>).apiBaseUrl;
    if (typeof url === 'string' && url.length > 0) {
      return url;
    }
  }
  return fallback;
}

export const API_BASE_URL = resolveBaseUrl(Constants.expoConfig?.extra);

/**
 * Whether online card payment is offered at checkout. OFF for the closed pilot
 * (cash on delivery / pickup only); turned on by `ONLINE_PAYMENTS_ENABLED=true`
 * once a real gateway exists. See `features/payment/payment-availability.ts`.
 */
export const ONLINE_PAYMENTS_ENABLED = resolveOnlinePaymentsEnabled(Constants.expoConfig?.extra);
