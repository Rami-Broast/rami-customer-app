import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { ApiError } from '../api/http';
import { Address } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../cart/CartProvider';
import { toOrderItems } from '../cart/cart';
import { Card, LinkButton, PrimaryButton, Screen } from '../components/ui';
import { ApplePayMark, BikeIcon, CardIcon, CashIcon, MadaMark, PinIcon, StorefrontIcon } from '../components/icons';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, PressableScale, Skeleton, Toast } from '../motion';
import { ORDER_TYPE, OrderType, PAYMENT_METHOD, PaymentMethod } from '../types/backend';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';

const METHOD_LABELS: Record<string, string> = {
  [PAYMENT_METHOD.CARD]: 'Credit / debit card',
  [PAYMENT_METHOD.MADA]: 'mada',
  [PAYMENT_METHOD.APPLE_PAY]: 'Apple Pay',
  [PAYMENT_METHOD.CASH_ON_DELIVERY]: 'Cash on delivery',
};

const METHOD_ORDER: PaymentMethod[] = [
  PAYMENT_METHOD.CARD,
  PAYMENT_METHOD.MADA,
  PAYMENT_METHOD.APPLE_PAY,
  PAYMENT_METHOD.CASH_ON_DELIVERY,
];

/** Choose pickup or delivery, review the server quote, pick payment, place order. */
export function CheckoutScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Checkout'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const { cart, dispatch } = useCart();

  const items = toOrderItems(cart);
  const branchId = cart.branchId ?? '';
  const [type, setType] = useState<OrderType>(route.params.type);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CARD);
  const [busy, setBusy] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const { data: quote, loading, error, reload } = useAsync(
    () => api.quote({ branchId, type, items, couponCode: cart.couponCode }),
    [branchId, JSON.stringify(items), type, cart.couponCode],
  );

  // The coupon field mirrors the cart's applied code; "Apply" commits it so the
  // quote above re-prices through the server, the only authority on validity.
  const [couponInput, setCouponInput] = useState(cart.couponCode ?? '');

  // Addresses, reloaded whenever the screen regains focus (e.g. after adding one).
  const addresses = useAsync<Address[]>(() => api.listAddresses(), []);
  const reloadAddresses = addresses.reload;
  useFocusEffect(useCallback(() => reloadAddresses(), [reloadAddresses]));

  // Auto-select the default (or first) address once loaded.
  useEffect(() => {
    if (type === ORDER_TYPE.DELIVERY && !addressId && addresses.data && addresses.data.length > 0) {
      setAddressId((addresses.data.find((a) => a.isDefault) ?? addresses.data[0])?.id ?? null);
    }
  }, [addresses.data, type, addressId]);

  const isDelivery = type === ORDER_TYPE.DELIVERY;
  const needsAddress = isDelivery && !addressId;

  const placeOrder = async (): Promise<void> => {
    if (!branchId || needsAddress) {
      return;
    }
    setBusy(true);
    setPlaceError(null);
    try {
      const order = await api.placeOrder({
        branchId,
        type,
        paymentMethod: method,
        items,
        couponCode: cart.couponCode,
        customerAddressId: isDelivery ? addressId ?? undefined : undefined,
      });
      dispatch({ type: 'CLEAR' });
      if (method === PAYMENT_METHOD.CASH_ON_DELIVERY) {
        navigation.replace('OrderTracking', { orderId: order.id });
      } else {
        navigation.replace('PaymentProcessing', { orderId: order.id });
      }
    } catch (e) {
      setPlaceError(e instanceof ApiError ? e.message : 'Could not place the order. Try again.');
      setBusy(false);
    }
  };

  const row = (label: string, value: string, bold?: boolean) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ color: bold ? theme.colors.text : theme.colors.textMuted, fontWeight: bold ? '800' : '400', fontSize: bold ? 17 : 15 }}>
        {label}
      </Text>
      <Text style={{ color: theme.colors.text, fontWeight: bold ? '800' : '600', fontSize: bold ? 17 : 15 }}>{value}</Text>
    </View>
  );

  const typeTab = (t: OrderType, label: string, icon: (c: string) => React.ReactNode) => {
    const active = type === t;
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => setType(t)}
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: theme.radius.md,
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? theme.colors.primary : 'transparent',
        }}
      >
        {icon(active ? theme.colors.onPrimary : theme.colors.textMuted)}
        <Text style={{ color: active ? theme.colors.onPrimary : theme.colors.text, fontWeight: '800' }}>{label}</Text>
      </PressableScale>
    );
  };

  const methodMark = (m: PaymentMethod): React.ReactNode => {
    if (m === PAYMENT_METHOD.MADA) {
      return <MadaMark size={40} />;
    }
    if (m === PAYMENT_METHOD.APPLE_PAY) {
      return <ApplePayMark size={52} />;
    }
    if (m === PAYMENT_METHOD.CASH_ON_DELIVERY) {
      return <CashIcon size={22} color={theme.colors.text} />;
    }
    return <CardIcon size={24} color={theme.colors.text} />;
  };

  const methodRow = (m: PaymentMethod) => {
    const active = method === m;
    return (
      <PressableScale
        key={m}
        accessibilityRole="button"
        accessibilityLabel={METHOD_LABELS[m]}
        accessibilityState={{ selected: active }}
        onPress={() => setMethod(m)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderRadius: theme.radius.lg,
          borderWidth: 2,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
        }}
      >
        <View style={{ width: 52, alignItems: 'center' }}>{methodMark(m)}</View>
        <Text style={{ flex: 1, color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{METHOD_LABELS[m]}</Text>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: active ? theme.colors.primary : theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {active ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary }} /> : null}
        </View>
      </PressableScale>
    );
  };

  return (
    <Screen title="Checkout" onBack={() => navigation.goBack()}>
      <Toast visible={!!placeError} message={placeError ?? ''} tone="danger" onHide={() => setPlaceError(null)} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md + 4,
            padding: 4,
          }}
        >
          {typeTab(ORDER_TYPE.PICKUP, 'Pickup', (c) => <StorefrontIcon size={18} color={c} />)}
          {typeTab(ORDER_TYPE.DELIVERY, 'Delivery', (c) => <BikeIcon size={18} color={c} />)}
        </View>

        {isDelivery ? (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <PinIcon size={18} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>Deliver to</Text>
            </View>
            {addresses.loading ? (
              <Skeleton height={40} />
            ) : addresses.data && addresses.data.length > 0 ? (
              addresses.data.map((a) => {
                const active = a.id === addressId;
                return (
                  <PressableScale
                    key={a.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setAddressId(a.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      marginBottom: 6,
                      borderRadius: theme.radius.md,
                      gap: 10,
                      backgroundColor: active ? theme.colors.primarySoft : 'transparent',
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary }} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{a.label ?? 'Address'}</Text>
                      <Text style={{ color: theme.colors.textMuted, ...theme.type.caption }} numberOfLines={1}>
                        {[a.line1, a.city].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })
            ) : (
              <Text style={{ color: theme.colors.textMuted, marginBottom: 8 }}>No saved address yet.</Text>
            )}
            <LinkButton
              label="Add a new address"
              leftIcon={<PinIcon size={15} color={theme.colors.accent} />}
              onPress={() => navigation.navigate('AddAddress')}
              style={{ marginTop: 6 }}
            />
          </Card>
        ) : null}

        <Card>
          <Text style={{ color: theme.colors.textMuted, ...theme.type.label, marginBottom: 10 }}>PROMO CODE</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={couponInput}
              onChangeText={setCouponInput}
              placeholder="Enter a code"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Promo code"
              style={{
                flex: 1,
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
                color: theme.colors.text,
              }}
            />
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Apply promo code"
              onPress={() => dispatch({ type: 'SET_COUPON', code: couponInput })}
              style={{ backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: 12, paddingHorizontal: 18 }}
            >
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '800' }}>Apply</Text>
            </PressableScale>
          </View>
          {cart.couponCode ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <Text style={{ color: theme.colors.success, fontWeight: '700' }}>Applied: {cart.couponCode}</Text>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Remove promo code"
                onPress={() => {
                  dispatch({ type: 'SET_COUPON', code: '' });
                  setCouponInput('');
                }}
              >
                <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>Remove</Text>
              </PressableScale>
            </View>
          ) : null}
        </Card>

        <Card>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16, marginBottom: 14 }}>Order total</Text>
          {loading ? (
            <View style={{ gap: 8 }}>
              <Skeleton height={16} />
              <Skeleton width="70%" height={16} />
              <Skeleton width="50%" height={20} />
            </View>
          ) : error ? (
            <ErrorState title="Couldn’t price your order" message={error.message} actionLabel="Retry" onAction={reload} />
          ) : quote ? (
            <>
              {row('Subtotal', formatSar(quote.subtotalMinor))}
              {quote.discountMinor > 0 ? row('Discount', `- ${formatSar(quote.discountMinor)}`) : null}
              {quote.deliveryFeeMinor > 0 ? row('Delivery', formatSar(quote.deliveryFeeMinor)) : null}
              {row('VAT (incl.)', formatSar(quote.vatMinor))}
              <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />
              {row('Total', formatSar(quote.totalMinor), true)}
            </>
          ) : null}
        </Card>

        <View style={{ gap: 10 }}>
          <Text style={{ color: theme.colors.textMuted, ...theme.type.label }}>PAYMENT METHOD</Text>
          {METHOD_ORDER.map(methodRow)}
        </View>

        <Text style={{ color: theme.colors.textMuted, ...theme.type.caption, textAlign: 'center', paddingHorizontal: 12 }}>
          Your card information is never stored by us. Payment is confirmed by our server — never by this screen alone.
        </Text>
      </ScrollView>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
        <PrimaryButton
          label={needsAddress ? 'Add a delivery address' : quote ? `Place order · ${formatSar(quote.totalMinor)}` : 'Place order'}
          onPress={needsAddress ? () => navigation.navigate('AddAddress') : placeOrder}
          busy={busy}
          disabled={!quote || !!error}
        />
      </View>
    </Screen>
  );
}
