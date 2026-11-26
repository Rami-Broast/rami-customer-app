/**
 * Offer display formatting — pure, no React Native.
 *
 * Turns an `Offer` (a published coupon) into the short strings the carousel
 * card shows: the headline discount and the spend condition. Pure so the
 * percentage-vs-minor-units distinction — the one thing easy to get wrong here
 * — is unit-tested rather than eyeballed on a card.
 */

import type { Offer } from '../../api/types';
import { formatSar } from '../../util/money';

/**
 * The headline, e.g. "20% off" or "SAR 15.00 off".
 *
 * PERCENTAGE `discountValue` is a whole percent (the backend divides it by 100);
 * FIXED_AMOUNT `discountValue` is already in minor units, so it goes through the
 * same `formatSar` as every other amount.
 */
export function formatOfferDiscount(offer: Pick<Offer, 'discountType' | 'discountValue'>): string {
  if (offer.discountType === 'PERCENTAGE') {
    return `${offer.discountValue}% off`;
  }
  return `${formatSar(offer.discountValue)} off`;
}

/**
 * The spend condition, e.g. "On orders over SAR 50.00", or null when there is
 * none — so the card omits the line rather than printing an empty one.
 */
export function formatMinSpend(offer: Pick<Offer, 'minSpendMinor'>): string | null {
  if (!offer.minSpendMinor || offer.minSpendMinor <= 0) {
    return null;
  }
  return `On orders over ${formatSar(offer.minSpendMinor)}`;
}
