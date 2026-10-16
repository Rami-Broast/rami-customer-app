import {
  availablePaymentMethods,
  defaultPaymentMethod,
  resolveOnlinePaymentsEnabled,
} from '../../src/features/payment/payment-availability';
import { PAYMENT_METHOD } from '../../src/types/backend';

describe('payment availability (closed-pilot gating)', () => {
  describe('resolveOnlinePaymentsEnabled', () => {
    it('is true only for the exact boolean true', () => {
      expect(resolveOnlinePaymentsEnabled({ onlinePaymentsEnabled: true })).toBe(true);
    });

    it('is false when unset, so the forgot-to-configure state takes no card payments', () => {
      expect(resolveOnlinePaymentsEnabled({})).toBe(false);
      expect(resolveOnlinePaymentsEnabled(undefined)).toBe(false);
      expect(resolveOnlinePaymentsEnabled(null)).toBe(false);
    });

    it('never treats a truthy non-boolean as enabled — a stray string must not switch real payments on', () => {
      expect(resolveOnlinePaymentsEnabled({ onlinePaymentsEnabled: 'true' })).toBe(false);
      expect(resolveOnlinePaymentsEnabled({ onlinePaymentsEnabled: 1 })).toBe(false);
    });
  });

  describe('availablePaymentMethods', () => {
    it('offers cash on delivery only when online is off (the pilot)', () => {
      expect(availablePaymentMethods(false)).toEqual([PAYMENT_METHOD.CASH_ON_DELIVERY]);
    });

    it('never offers an online method when off', () => {
      const methods = availablePaymentMethods(false);
      expect(methods).not.toContain(PAYMENT_METHOD.CARD);
      expect(methods).not.toContain(PAYMENT_METHOD.MADA);
      expect(methods).not.toContain(PAYMENT_METHOD.APPLE_PAY);
    });

    it('offers card, mada, apple pay and cash when online is on', () => {
      expect(availablePaymentMethods(true)).toEqual([
        PAYMENT_METHOD.CARD,
        PAYMENT_METHOD.MADA,
        PAYMENT_METHOD.APPLE_PAY,
        PAYMENT_METHOD.CASH_ON_DELIVERY,
      ]);
    });
  });

  describe('defaultPaymentMethod', () => {
    it('defaults to cash on delivery when online is off', () => {
      expect(defaultPaymentMethod(false)).toBe(PAYMENT_METHOD.CASH_ON_DELIVERY);
    });

    it('defaults to card when online is on', () => {
      expect(defaultPaymentMethod(true)).toBe(PAYMENT_METHOD.CARD);
    });

    it('always returns a method the list actually offers', () => {
      for (const enabled of [true, false]) {
        expect(availablePaymentMethods(enabled)).toContain(defaultPaymentMethod(enabled));
      }
    });
  });
});
