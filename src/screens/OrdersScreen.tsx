import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Order } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../cart/CartProvider';
import { Card, Pill, PillTone, Screen } from '../components/ui';
import { ChevronRightIcon, ReceiptIcon } from '../components/icons';
import { buildReorder } from '../features/order/reorder';
import { STATUS_META } from '../features/order/order-status.model';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, PressableScale, Skeleton, Stagger, Toast } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { StatusTone } from '../features/order/order-status.model';
import { useTheme } from '../theme/theme';

/** A status tone maps straight onto a Pill tone. */
function pillTone(tone: StatusTone): PillTone {
  return tone;
}

/** My past and current orders. */
export function OrdersScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Orders'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const { dispatch } = useCart();
  const { data, loading, error, reload } = useAsync(() => api.myOrders(), []);
  const orders = data?.data ?? [];
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'warning' } | null>(null);

  const reorder = (order: Order): void => {
    const { lines, skipped } = buildReorder(order);
    if (lines.length === 0) {
      setToast({ message: 'Those items are no longer available.', tone: 'warning' });
      return;
    }
    dispatch({ type: 'CLEAR' });
    for (const line of lines) {
      const { productId, productName, unitPriceMinor, addonIds, addonNames } = line;
      dispatch({
        type: 'ADD',
        branchId: order.branchId,
        line: { productId, productName, unitPriceMinor, addonIds, addonNames },
        quantity: line.quantity,
      });
    }
    setToast({
      message: skipped > 0 ? 'Added to cart — some items were unavailable.' : 'Added to cart.',
      tone: skipped > 0 ? 'warning' : 'success',
    });
    navigation.navigate('Cart');
  };

  return (
    <Screen title="My orders" onBack={() => navigation.goBack()}>
      <Toast
        visible={!!toast}
        message={toast?.message ?? ''}
        tone={toast?.tone ?? 'success'}
        onHide={() => setToast(null)}
      />
      {loading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={84} radius={theme.radius.lg} />
          ))}
        </View>
      ) : error ? (
        <ErrorState title="Couldn’t load your orders" message={error.message} actionLabel="Retry" onAction={reload} />
      ) : orders.length === 0 ? (
        <EmptyState glyph="🧾" title="No orders yet" message="Your orders will show up here." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}>
          <Stagger>
            {orders.map((order) => {
              const meta = STATUS_META[order.status];
              return (
                <PressableScale
                  key={order.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Order ${order.orderNumber}, ${meta.label}, ${formatSar(order.totalMinor)}`}
                  onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
                >
                  <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: theme.radius.md,
                          backgroundColor: theme.colors.surfaceAlt,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ReceiptIcon size={22} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>Order {order.orderNumber}</Text>
                        <Text style={{ color: theme.colors.textMuted, marginTop: 3, fontSize: 14, fontWeight: '700' }}>
                          {formatSar(order.totalMinor)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 8 }}>
                        <Pill label={meta.label} tone={pillTone(meta.tone)} />
                        <ChevronRightIcon size={18} color={theme.colors.textMuted} />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={`Reorder ${order.orderNumber}`}
                        onPress={() => reorder(order)}
                        style={{
                          backgroundColor: theme.colors.surfaceAlt,
                          borderRadius: theme.radius.pill,
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                        }}
                      >
                        <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 13 }}>Reorder</Text>
                      </PressableScale>
                    </View>
                  </Card>
                </PressableScale>
              );
            })}
          </Stagger>
        </ScrollView>
      )}
    </Screen>
  );
}
