import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useCart } from '../cart/CartProvider';
import { estimatedTotalMinor } from '../cart/cart';
import { Card, LinkButton, PrimaryButton, Screen } from '../components/ui';
import { EmptyState, PressableScale, QuantityStepper } from '../motion';
import { ORDER_TYPE } from '../types/backend';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';

/** The cart: adjust quantities, remove, and go to checkout. Pickup-only for now. */
export function CartScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Cart'>): React.JSX.Element {
  const theme = useTheme();
  const { cart, count, dispatch } = useCart();

  if (count === 0) {
    return (
      <Screen title="Your cart" onBack={() => navigation.goBack()}>
        <EmptyState
          glyph="🛍️"
          title="Your cart is empty"
          message="Add something from the menu to get started."
          actionLabel="Browse menu"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Your cart" subtitle={`${count} item${count === 1 ? '' : 's'}`} onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 24, gap: 10 }}>
        {cart.lines.map((line) => (
          <Card key={line.key}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>{line.productName}</Text>
                <Text style={{ color: theme.colors.textMuted, ...theme.type.caption, marginTop: 2 }}>
                  {formatSar(line.unitPriceMinor)} each
                </Text>
                <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 16, marginTop: 8 }}>
                  {formatSar(line.unitPriceMinor * line.quantity)}
                </Text>
              </View>
              <QuantityStepper
                value={line.quantity}
                onChange={(q) => dispatch({ type: 'SET_QTY', key: line.key, quantity: q })}
                min={0}
              />
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12, paddingTop: 10 }}>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={`Remove ${line.productName}`}
                onPress={() => dispatch({ type: 'REMOVE', key: line.key })}
              >
                <Text style={{ color: theme.colors.danger, fontWeight: '700', fontSize: 14 }}>Remove</Text>
              </PressableScale>
            </View>
          </Card>
        ))}

        <LinkButton label="+ Add more items" onPress={() => navigation.goBack()} style={{ alignSelf: 'center', marginTop: 4 }} />
      </ScrollView>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 15 }}>Estimated subtotal</Text>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>{formatSar(estimatedTotalMinor(cart))}</Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, ...theme.type.caption, marginBottom: 12 }}>
          Final total, VAT and any delivery fee are confirmed at checkout.
        </Text>
        <PrimaryButton label="Checkout" onPress={() => navigation.navigate('Checkout', { type: ORDER_TYPE.PICKUP })} />
      </View>
    </Screen>
  );
}
