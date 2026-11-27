import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ApiError } from '../api/http';
import { Address } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { useBranch } from '../branch/BranchProvider';
import { useCart } from '../cart/CartProvider';
import { toOrderItems } from '../cart/cart';
import { ApplePayMark, CardMark, CashMark, ChevronRightIcon, ClockIcon, MadaMark, PhoneIcon, PinIcon, ReceiptIcon } from '../components/icons';
import { Card, PrimaryButton, Screen } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, PressableScale, Skeleton, Toast } from '../motion';
import { ORDER_TYPE, OrderType, PAYMENT_METHOD, PaymentMethod } from '../types/backend';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';

type MethodMeta = { label: string; mark: React.ReactNode };

/** Choose pickup or delivery, review the server quote, pick payment, place order. */
export function CheckoutScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Checkout'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const { cart, dispatch } = useCart();
  const { selected: selectedBranch } = useBranch();
  const { couponCode, notes } = route.params;

  const items = toOrderItems(cart);
  const branchId = cart.branchId ?? '';
  const branch = selectedBranch && selectedBranch.id === branchId ? selectedBranch : null;
  const [type, setType] = useState<OrderType>(route.params.type);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CARD);
  const [busy, setBusy] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('customer_phone').then(setPhone).catch(() => {});
  }, []);

  const { data: quote, loading, error, reload } = useAsync(
    () => api.quote({ branchId, type, items }),
    [branchId, JSON.stringify(items), type],
  );

  const addresses = useAsync<Address[]>(() => api.listAddresses(), []);
  const reloadAddresses = addresses.reload;
  useFocusEffect(useCallback(() => reloadAddresses(), [reloadAddresses]));

  useEffect(() => {
    if (type === ORDER_TYPE.DELIVERY && !addressId && addresses.data && addresses.data.length > 0) {
      setAddressId((addresses.data.find((a) => a.isDefault) ?? addresses.data[0])?.id ?? null);
    }
  }, [addresses.data, type, addressId]);

  const isDelivery = type === ORDER_TYPE.DELIVERY;
  const needsAddress = isDelivery && !addressId;
  const codAvailable = isDelivery && (branch?.acceptsCashOnDelivery ?? false);

  // If COD was selected then it became unavailable (switched to pickup), fall back.
  useEffect(() => {
    if (method === PAYMENT_METHOD.CASH_ON_DELIVERY && !codAvailable) {
      setMethod(PAYMENT_METHOD.CARD);
    }
  }, [codAvailable, method]);

  const methodMeta: Record<string, MethodMeta> = {
    [PAYMENT_METHOD.CARD]: { label: 'Credit / debit card', mark: <CardMark size={38} color={theme.colors.text} /> },
    [PAYMENT_METHOD.MADA]: { label: 'mada', mark: <MadaMark size={38} /> },
    [PAYMENT_METHOD.APPLE_PAY]: { label: 'Apple Pay', mark: <ApplePayMark size={52} /> },
    [PAYMENT_METHOD.CASH_ON_DELIVERY]: { label: 'Cash on delivery', mark: <CashMark size={38} color={theme.colors.text} /> },
  };

  const methodOrder: PaymentMethod[] = [
    PAYMENT_METHOD.CARD,
    PAYMENT_METHOD.MADA,
    PAYMENT_METHOD.APPLE_PAY,
    ...(codAvailable ? [PAYMENT_METHOD.CASH_ON_DELIVERY] : []),
  ];

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
        customerAddressId: isDelivery ? addressId ?? undefined : undefined,
        couponCode,
        customerNotes: notes,
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

  const typeTab = (t: OrderType, label: string, icon: string) => {
    const active = type === t;
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => setType(t)}
        style={{
          flex: 1,
          flexDirection: 'row',
          gap: 8,
          paddingVertical: 14,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          backgroundColor: active ? theme.colors.goldSoft : theme.colors.surface,
        }}
      >
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={{ color: active ? theme.colors.primary : theme.colors.text, fontWeight: '800' }}>{label}</Text>
      </PressableScale>
    );
  };

  const infoRow = (icon: React.ReactNode, title: string, subtitle: string, onPress?: () => void) => (
    <PressableScale
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}
    >
      <View style={{ width: 28, alignItems: 'center' }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{title}</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>{subtitle}</Text>
      </View>
      {onPress ? <ChevronRightIcon size={20} color={theme.colors.textMuted} /> : null}
    </PressableScale>
  );

  const prepMins = branch?.prepTimeMinutes ?? 20;
  const selectedAddress = addresses.data?.find((a) => a.id === addressId) ?? null;

  const methodRow = (m: PaymentMethod) => {
    const active = method === m;
    const meta = methodMeta[m];
    if (!meta) {
      return null;
    }
    return (
      <PressableScale
        key={m}
        accessibilityRole="button"
        accessibilityLabel={meta.label}
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
          backgroundColor: active ? theme.colors.goldSoft : theme.colors.surface,
        }}
      >
        <View style={{ width: 52, alignItems: 'center' }}>{meta.mark}</View>
        <Text style={{ flex: 1, color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{meta.label}</Text>
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
    <Screen title={branch?.name ?? 'Checkout'} onBack={() => navigation.goBack()}>
      <Toast visible={!!placeError} message={placeError ?? ''} tone="danger" onHide={() => setPlaceError(null)} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {typeTab(ORDER_TYPE.PICKUP, 'Pickup', '🛍️')}
          {typeTab(ORDER_TYPE.DELIVERY, 'Delivery', '🛵')}
        </View>

        {/* Fulfilment + contact + total */}
        <Card style={{ paddingVertical: 2 }}>
          {infoRow(
            <ClockIcon size={22} color={theme.colors.textMuted} />,
            isDelivery ? `Delivery in about ${prepMins + 15} mins` : `Ready in about ${prepMins} mins`,
            isDelivery ? 'We’ll send it out as soon as it’s ready' : 'We will hold it warm at the counter',
          )}
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
          {isDelivery
            ? infoRow(
                <PinIcon size={22} color={theme.colors.textMuted} />,
                selectedAddress ? selectedAddress.label ?? 'Deliver to' : 'Add a delivery address',
                selectedAddress ? [selectedAddress.line1, selectedAddress.city].filter(Boolean).join(', ') : 'Tap to choose where we deliver',
                () => navigation.navigate('AddAddress'),
              )
            : infoRow(
                <PinIcon size={22} color={theme.colors.textMuted} />,
                `Collect from ${branch?.name ?? 'the branch'}`,
                branch?.addressLine ?? [branch?.district, branch?.city].filter(Boolean).join(', ') ?? 'At the branch',
              )}
          {phone ? (
            <>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              {infoRow(<PhoneIcon size={22} color={theme.colors.textMuted} />, 'Your contact number', phone)}
            </>
          ) : null}
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
            <View style={{ width: 28, alignItems: 'center' }}>
              <ReceiptIcon size={22} color={theme.colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              {loading ? (
                <Skeleton height={18} width="60%" />
              ) : error ? (
                <ErrorState title="Couldn’t price your order" message={error.message} actionLabel="Retry" onAction={reload} />
              ) : quote ? (
                <>
                  <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 16 }}>Total bill {formatSar(quote.totalMinor)}</Text>
                  <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>
                    Includes {formatSar(quote.vatMinor)} VAT at 15%
                    {quote.discountMinor > 0 ? ` · ${formatSar(quote.discountMinor)} off` : ''}
                    {quote.deliveryFeeMinor > 0 ? ` · ${formatSar(quote.deliveryFeeMinor)} delivery` : ''}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </Card>

        {/* Delivery address picker (delivery only) */}
        {isDelivery ? (
          <Card>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Deliver to</Text>
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
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 }}
                  >
                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: active ? theme.colors.primary : theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
                      {active ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary }} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{a.label ?? 'Address'}</Text>
                      <Text style={{ color: theme.colors.textMuted }} numberOfLines={1}>{[a.line1, a.city].filter(Boolean).join(', ')}</Text>
                    </View>
                  </PressableScale>
                );
              })
            ) : (
              <Text style={{ color: theme.colors.textMuted, marginBottom: 8 }}>No saved address yet.</Text>
            )}
            <PressableScale accessibilityRole="button" onPress={() => navigation.navigate('AddAddress')} style={{ marginTop: 6 }}>
              <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>+ Add a new address</Text>
            </PressableScale>
          </Card>
        ) : null}

        {/* Payment method — rows, tap to choose */}
        <View style={{ gap: 10 }}>
          <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 18 }}>Payment method</Text>
          {methodOrder.map(methodRow)}
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 2 }}>
            Your card information is never stored by us. Payment is confirmed by our server.
          </Text>
        </View>
      </ScrollView>

      {/* Footer: pay using + CTA */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <View>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Pay using</Text>
          <Text style={{ color: theme.colors.text, fontWeight: '800', maxWidth: 120 }} numberOfLines={1}>{methodMeta[method]?.label}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={needsAddress ? 'Add a delivery address' : quote ? `${formatSar(quote.totalMinor)} · Pay` : 'Place order'}
            onPress={needsAddress ? () => navigation.navigate('AddAddress') : placeOrder}
            busy={busy}
            disabled={!quote || !!error}
          />
        </View>
      </View>
    </Screen>
  );
}
