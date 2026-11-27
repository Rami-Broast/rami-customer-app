import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { useBranch } from '../branch/BranchProvider';
import { useCart } from '../cart/CartProvider';
import { estimatedTotalMinor } from '../cart/cart';
import { FoodImage } from '../components/FoodImage';
import { Card, PrimaryButton, Screen } from '../components/ui';
import { EmptyState, PressableScale, QuantityStepper } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';

/** The cart: adjust quantities, add a coupon and kitchen note, go to checkout. */
export function CartScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Cart'>): React.JSX.Element {
  const theme = useTheme();
  const { cart, count, dispatch } = useCart();
  const { mode } = useBranch();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  if (count === 0) {
    return (
      <Screen title="Cart" onBack={() => navigation.goBack()}>
        <EmptyState
          title="Your cart is empty"
          message="Add something from the menu to get started."
          actionLabel="Browse menu"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const applyCoupon = (): void => {
    const code = couponInput.trim().toUpperCase();
    if (code.length > 0) {
      setAppliedCoupon(code);
    }
  };

  const goCheckout = (): void => {
    navigation.navigate('Checkout', {
      type: mode,
      couponCode: appliedCoupon ?? undefined,
      notes: notes.trim().length > 0 ? notes.trim() : undefined,
    });
  };

  return (
    <Screen title="Cart" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}>
        <Text style={{ color: theme.colors.textMuted, fontWeight: '600' }}>{count} item{count === 1 ? '' : 's'}</Text>

        {cart.lines.map((line) => (
          <Card key={line.key}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <FoodImage uri={line.imageUrl} name={line.productName} radius={theme.radius.md} style={{ width: 64, height: 64 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }} numberOfLines={2}>{line.productName}</Text>
                {line.addonNames.length > 0 ? (
                  <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>{line.addonNames.join(', ')}</Text>
                ) : null}
                <Text style={{ color: theme.colors.primary, fontWeight: '900', marginTop: 6 }}>
                  {formatSar(line.unitPriceMinor * line.quantity)}
                </Text>
              </View>
              <QuantityStepper
                value={line.quantity}
                onChange={(q) => dispatch({ type: 'SET_QTY', key: line.key, quantity: q })}
                min={0}
              />
            </View>
          </Card>
        ))}

        {/* Coupon */}
        <Card>
          <Text style={{ color: theme.colors.text, fontWeight: '800', marginBottom: 8 }}>Have a coupon?</Text>
          {appliedCoupon ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: theme.colors.goldSoft, borderRadius: theme.radius.sm, paddingVertical: 4, paddingHorizontal: 10 }}>
                  <Text style={{ color: theme.colors.onGold, fontWeight: '900' }}>{appliedCoupon}</Text>
                </View>
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>applied at checkout</Text>
              </View>
              <PressableScale accessibilityRole="button" onPress={() => { setAppliedCoupon(null); setCouponInput(''); }}>
                <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>Remove</Text>
              </PressableScale>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                value={couponInput}
                onChangeText={setCouponInput}
                placeholder="Enter code"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="characters"
                style={{ flex: 1, backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text, fontSize: 15 }}
              />
              <PressableScale
                accessibilityRole="button"
                onPress={applyCoupon}
                disabled={couponInput.trim().length === 0}
                style={{ backgroundColor: theme.colors.goldSoft, borderRadius: theme.radius.md, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', opacity: couponInput.trim().length === 0 ? 0.5 : 1 }}
              >
                <Text style={{ color: theme.colors.onGold, fontWeight: '900' }}>Apply</Text>
              </PressableScale>
            </View>
          )}
        </Card>

        {/* Kitchen notes */}
        <Card>
          <Text style={{ color: theme.colors.text, fontWeight: '800', marginBottom: 8 }}>Notes for the kitchen (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note…"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={{ backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 12, minHeight: 72, color: theme.colors.text, fontSize: 15, textAlignVertical: 'top' }}
          />
        </Card>

        {/* Total preview */}
        <Card>
          <Text style={{ color: theme.colors.textMuted, fontWeight: '700', marginBottom: 10 }}>Estimated total</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 18 }}>Subtotal</Text>
            <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 18 }}>{formatSar(estimatedTotalMinor(cart))}</Text>
          </View>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 8 }}>
            Final total, VAT, any discount and delivery fee are confirmed by our server at checkout.
          </Text>
        </Card>
      </ScrollView>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <PrimaryButton label={`Go to checkout · ${formatSar(estimatedTotalMinor(cart))}`} onPress={goCheckout} />
      </View>
    </Screen>
  );
}
