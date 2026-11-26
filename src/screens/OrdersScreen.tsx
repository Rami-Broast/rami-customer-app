import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { Card, Pill, PillTone, Screen } from '../components/ui';
import { ChevronRightIcon, ReceiptIcon } from '../components/icons';
import { STATUS_META } from '../features/order/order-status.model';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, PressableScale, Skeleton, Stagger } from '../motion';
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
  const { data, loading, error, reload } = useAsync(() => api.myOrders(), []);
  const orders = data?.data ?? [];

  return (
    <Screen title="My orders" onBack={() => navigation.goBack()}>
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
