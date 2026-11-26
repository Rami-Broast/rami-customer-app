import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Order } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../cart/CartProvider';
import { Card, Screen } from '../components/ui';
import { buildReorder } from '../features/order/reorder';
import { STATUS_META } from '../features/order/order-status.model';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, PressableScale, Skeleton, Toast } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { StatusTone } from '../features/order/order-status.model';
import { useTheme } from '../theme/theme';

function toneColor(theme: ReturnType<typeof useTheme>, tone: StatusTone): string {
  return tone === 'success'
    ? theme.colors.success
    : tone === 'danger'
      ? theme.colors.danger
      : tone === 'warning'
        ? theme.colors.warning
        : tone === 'progress'
          ? theme.colors.primary
          : theme.colors.textMuted;
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
            <Skeleton key={i} height={80} radius={theme.radius.lg} />
          ))}
        </View>
      ) : error ? (
        <ErrorState title="Couldn’t load your orders" message={error.message} actionLabel="Retry" onAction={reload} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" message="Your orders will show up here." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {orders.map((order) => {
            const meta = STATUS_META[order.status];
            return (
              <PressableScale key={order.id} accessibilityRole="button" onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}>
                <Card>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{order.orderNumber}</Text>
                    <View style={{ backgroundColor: toneColor(theme, meta.tone), borderRadius: theme.radius.pill, paddingVertical: 3, paddingHorizontal: 10 }}>
                      <Text style={{ color: theme.colors.onPrimary, fontSize: 12, fontWeight: '700' }}>{meta.label}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <Text style={{ color: theme.colors.textMuted }}>{formatSar(order.totalMinor)}</Text>
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
        </ScrollView>
      )}
    </Screen>
  );
}
