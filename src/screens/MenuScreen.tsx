import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../cart/CartProvider';
import { Card, PriceTag, Screen, SectionTitle } from '../components/ui';
import { CartIcon, PlusIcon } from '../components/icons';
import { useAsync } from '../hooks/useAsync';
import { CartBadge, EmptyState, ErrorState, PressableScale, Skeleton, Stagger } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';
import type { MenuProduct } from '../api/types';

/** A branch menu: browse categories/products and add to cart. */
export function MenuScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Menu'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const { cart, count, dispatch } = useCart();
  const { branchId, branchName } = route.params;
  const { data, loading, error, reload } = useAsync(() => api.menu(branchId), [branchId]);

  const add = (product: MenuProduct): void => {
    dispatch({
      type: 'ADD',
      branchId,
      line: {
        productId: product.id,
        productName: product.name,
        unitPriceMinor: product.priceMinor,
        addonIds: [],
        addonNames: [],
      },
    });
  };

  const cartButton = (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="View cart"
      onPress={() => navigation.navigate('Cart')}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CartIcon size={21} color={theme.colors.text} />
      <View style={{ position: 'absolute', top: -5, right: -6 }}>
        <CartBadge count={count} />
      </View>
    </PressableScale>
  );

  return (
    <Screen title={branchName} subtitle="Tap + to add to your cart" onBack={() => navigation.goBack()} right={cartButton}>
      {loading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={84} radius={theme.radius.lg} />
          ))}
        </View>
      ) : error ? (
        <ErrorState title="Couldn’t load the menu" message={error.message} actionLabel="Retry" onAction={reload} />
      ) : !data || data.categories.length === 0 ? (
        <EmptyState title="Menu is empty" message="This branch has nothing available right now." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: count > 0 ? 104 : 24 }}>
          {data.categories.map((category) => (
            <View key={category.id} style={{ marginBottom: 22 }}>
              <SectionTitle label={category.name} />
              <View style={{ gap: 10 }}>
                <Stagger>
                  {category.products.map((product) => (
                    <Card key={product.id}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>{product.name}</Text>
                          {product.description ? (
                            <Text style={{ color: theme.colors.textMuted, ...theme.type.caption, marginTop: 3 }} numberOfLines={2}>
                              {product.description}
                            </Text>
                          ) : null}
                          <PriceTag label={formatSar(product.priceMinor)} style={{ marginTop: 8 }} />
                        </View>
                        <PressableScale
                          accessibilityRole="button"
                          accessibilityLabel={`Add ${product.name}`}
                          onPress={() => add(product)}
                          style={[
                            {
                              backgroundColor: theme.colors.primary,
                              width: 44,
                              height: 44,
                              borderRadius: 22,
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            theme.elevation(1),
                          ]}
                        >
                          <PlusIcon size={22} color={theme.colors.onPrimary} />
                        </PressableScale>
                      </View>
                    </Card>
                  ))}
                </Stagger>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {count > 0 && cart.branchId === branchId ? (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 20 }}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`View cart, ${count} item${count === 1 ? '' : 's'}`}
            onPress={() => navigation.navigate('Cart')}
            style={[
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.pill,
                paddingVertical: 16,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              theme.elevation(3),
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <CartIcon size={20} color={theme.colors.onPrimary} />
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '800', fontSize: 16 }}>View cart</Text>
            </View>
            <View style={{ backgroundColor: theme.colors.gold, borderRadius: theme.radius.pill, paddingVertical: 3, paddingHorizontal: 12 }}>
              <Text style={{ color: theme.colors.onGold, fontWeight: '800', fontSize: 14 }}>
                {count} item{count === 1 ? '' : 's'}
              </Text>
            </View>
          </PressableScale>
        </View>
      ) : null}
    </Screen>
  );
}
