import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../cart/CartProvider';
import { TagIcon } from '../components/icons';
import { formatMinSpend, formatOfferDiscount } from '../features/offers/offer-format';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, PressableScale, Skeleton } from '../motion';
import { TabScreenProps } from '../navigation/types';
import { useTheme } from '../theme/theme';

/** Offers tab: the published coupons from /customer/config, applied to the cart. */
export function OffersScreen({ navigation }: TabScreenProps<'Offers'>): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { api } = useAuth();
  const { cart, dispatch } = useCart();
  const { data, loading, error, reload } = useAsync(() => api.config(), []);
  const offers = data?.offers ?? [];

  const apply = (code: string): void => {
    dispatch({ type: 'SET_COUPON', code });
    navigation.navigate('Home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <Text style={{ color: theme.colors.text, ...theme.type.title }}>Offers</Text>
      </View>

      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={120} radius={theme.radius.lg} />)}</View>
      ) : error ? (
        <ErrorState title="Couldn’t load offers" message={error.message} actionLabel="Retry" onAction={reload} />
      ) : offers.length === 0 ? (
        <EmptyState title="No offers right now" message="Check back soon — new deals show up here." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          {offers.map((offer) => {
            const applied = cart.couponCode === offer.code;
            const minSpend = formatMinSpend(offer);
            return (
              <View key={offer.id} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
                <View style={{ backgroundColor: theme.colors.primary, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.gold, alignItems: 'center', justifyContent: 'center' }}>
                    <TagIcon size={22} color={theme.colors.onGold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 18 }}>{formatOfferDiscount(offer)}</Text>
                    <Text style={{ color: theme.colors.onPrimary, opacity: 0.9 }} numberOfLines={1}>{offer.name}</Text>
                  </View>
                </View>
                <View style={{ padding: 16, gap: 10 }}>
                  {offer.description ? <Text style={{ color: theme.colors.textMuted }}>{offer.description}</Text> : null}
                  {minSpend ? <Text style={{ color: theme.colors.textMuted, ...theme.type.caption }}>{minSpend}</Text> : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    <View style={{ backgroundColor: theme.colors.goldSoft, borderRadius: theme.radius.sm, paddingVertical: 6, paddingHorizontal: 12 }}>
                      <Text style={{ color: theme.colors.onGold, fontWeight: '900', letterSpacing: 1 }}>{offer.code}</Text>
                    </View>
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={applied ? `${offer.code} applied` : `Apply ${offer.code}`}
                      onPress={() => apply(offer.code)}
                      disabled={applied}
                      style={{ backgroundColor: applied ? theme.colors.surfaceAlt : theme.colors.primary, borderRadius: theme.radius.pill, paddingVertical: 10, paddingHorizontal: 20 }}
                    >
                      <Text style={{ color: applied ? theme.colors.textMuted : theme.colors.onPrimary, fontWeight: '800' }}>{applied ? 'Applied' : 'Apply'}</Text>
                    </PressableScale>
                  </View>
                </View>
              </View>
            );
          })}
          <Text style={{ color: theme.colors.textMuted, ...theme.type.caption, textAlign: 'center', paddingHorizontal: 12 }}>
            The final discount is always confirmed by our server at checkout.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
