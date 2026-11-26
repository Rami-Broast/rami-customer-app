import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Offer } from '../../api/types';
import { FadeIn, PressableScale } from '../../motion';
import { STAGGER_STEP } from '../../motion/tokens';
import { useTheme } from '../../theme/theme';
import { formatMinSpend, formatOfferDiscount } from './offer-format';

export interface OffersCarouselProps {
  offers: Offer[];
  /** The coupon code currently applied to the cart, if any. */
  appliedCode?: string;
  /** Apply (or re-apply) an offer's code. */
  onApply: (code: string) => void;
}

/**
 * A horizontal strip of published offers.
 *
 * Each card shows the headline discount, any spend condition and the code.
 * Tapping applies the code to the cart (the checkout then re-prices through the
 * server, which is the only authority on whether it is valid and what it is
 * worth). The currently applied offer reads "Applied", so tapping twice is a
 * no-op the customer can see rather than a silent repeat.
 *
 * Cards fade in on first paint via the shared motion system, so this is
 * automatically still under reduced motion. Nothing here depends on an image —
 * the card is legible as text, which also means an offer with no artwork still
 * renders correctly.
 */
export function OffersCarousel({ offers, appliedCode, onApply }: OffersCarouselProps): React.JSX.Element | null {
  const theme = useTheme();
  if (offers.length === 0) {
    return null;
  }

  return (
    <View style={{ paddingTop: 12 }}>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: '800',
          paddingHorizontal: 16,
          marginBottom: 8,
        }}
      >
        Offers
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}
      >
        {offers.map((offer, i) => {
          const applied = appliedCode === offer.code;
          const condition = formatMinSpend(offer);
          return (
            <FadeIn key={offer.id} delay={Math.min(i, 6) * STAGGER_STEP} translateY={6}>
              <PressableScale
                accessibilityRole="button"
                accessibilityState={{ selected: applied }}
                accessibilityLabel={`${offer.name}, ${formatOfferDiscount(offer)}. ${applied ? 'Applied' : `Tap to apply code ${offer.code}`}`}
                onPress={() => onApply(offer.code)}
                style={{
                  width: 220,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: applied ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.radius.lg,
                  padding: 14,
                }}
              >
                <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '800' }}>
                  {formatOfferDiscount(offer)}
                </Text>
                <Text
                  style={{ color: theme.colors.text, fontWeight: '700', marginTop: 4 }}
                  numberOfLines={1}
                >
                  {offer.name}
                </Text>
                {condition ? (
                  <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {condition}
                  </Text>
                ) : null}
                <View
                  style={{
                    marginTop: 10,
                    alignSelf: 'flex-start',
                    backgroundColor: applied ? theme.colors.primary : theme.colors.surfaceAlt,
                    borderRadius: theme.radius.pill,
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      color: applied ? theme.colors.onPrimary : theme.colors.text,
                      fontWeight: '800',
                      fontSize: 12,
                    }}
                  >
                    {applied ? '✓ Applied' : offer.code}
                  </Text>
                </View>
              </PressableScale>
            </FadeIn>
          );
        })}
      </ScrollView>
    </View>
  );
}
