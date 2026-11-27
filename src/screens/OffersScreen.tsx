import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TagIcon } from '../components/icons';
import { PressableScale } from '../motion';
import { TabScreenProps } from '../navigation/types';
import { useTheme } from '../theme/theme';

/**
 * Offers.
 *
 * There is no public offers/coupons API wired into this app yet (the backend
 * serves published coupons via `/customer/config`, which the client does not
 * call). Rather than invent deals, this shows how offers work and sends the
 * customer to order; the promo-code box on the cart is where a real code is
 * applied. Wire the list here once `api.offers()` exists.
 */
export function OffersScreen({ navigation }: TabScreenProps<'Offers'>): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>Offers</Text>

        {/* Branded hero */}
        <View style={{ backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl, padding: 22, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.gold, alignItems: 'center', justifyContent: 'center' }}>
              <TagIcon size={20} color={theme.colors.onGold} />
            </View>
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 18 }}>Deals on Rami Broast</Text>
          </View>
          <Text style={{ color: theme.colors.onPrimary, opacity: 0.9, lineHeight: 20 }}>
            Got a promo code? Add it in your cart before checkout and the discount is applied to your order.
          </Text>
        </View>

        <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 16, gap: 10 }}>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>How offers work</Text>
          <Text style={{ color: theme.colors.textMuted, lineHeight: 20 }}>
            • Promo codes apply to your basket at checkout.{'\n'}
            • The final discount, VAT and any delivery fee are always confirmed by our server before you pay.
          </Text>
        </View>

        <PressableScale
          accessibilityRole="button"
          onPress={() => navigation.navigate('Home')}
          style={{ backgroundColor: theme.colors.gold, borderRadius: theme.radius.pill, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: theme.colors.onGold, fontWeight: '900', fontSize: 16 }}>Start an order</Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}
