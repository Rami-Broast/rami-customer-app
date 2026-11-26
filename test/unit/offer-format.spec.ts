import { formatMinSpend, formatOfferDiscount } from '../../src/features/offers/offer-format';

describe('formatOfferDiscount', () => {
  it('formats a percentage discount', () => {
    expect(formatOfferDiscount({ discountType: 'PERCENTAGE', discountValue: 20 })).toBe('20% off');
  });

  it('formats a fixed-amount discount as SAR from minor units', () => {
    expect(formatOfferDiscount({ discountType: 'FIXED_AMOUNT', discountValue: 1500 })).toBe(
      'SAR 15.00 off',
    );
  });
});

describe('formatMinSpend', () => {
  it('states a minimum spend when present', () => {
    expect(formatMinSpend({ minSpendMinor: 5000 })).toBe('On orders over SAR 50.00');
  });

  it('returns null when there is no minimum', () => {
    expect(formatMinSpend({ minSpendMinor: undefined })).toBeNull();
    expect(formatMinSpend({ minSpendMinor: 0 })).toBeNull();
  });
});
