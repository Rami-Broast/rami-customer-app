import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../cart/CartProvider';
import { Card, PriceTag, Screen, SectionTitle } from '../components/ui';
import { CartIcon, PlusIcon } from '../components/icons';
import { filterMenuCategories } from '../features/menu/menu-filter';
import { OffersCarousel } from '../features/offers/OffersCarousel';
import { useAsync } from '../hooks/useAsync';
import { CartBadge, EmptyState, ErrorState, PressableScale, Skeleton, Stagger, Toast } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';
import type { MenuProduct } from '../api/types';

/** A branch menu: browse categories/products, search, and add to cart. */
export function MenuScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Menu'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const { cart, count, dispatch } = useCart();
  const { branchId, branchName } = route.params;
  const { data, loading, error, reload } = useAsync(() => api.menu(branchId), [branchId]);
  // Offers are published coupons, served app-wide (not per branch). Failure is
  // non-fatal — the menu is the point, so the carousel simply does not render.
  const offersState = useAsync(() => api.config(), []);
  const offers = offersState.data?.offers ?? [];

  const [query, setQuery] = useState('');
  const [appliedToast, setAppliedToast] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  // Y offset of each category section within the scroll view, for category jump.
  const sectionY = useRef<Record<string, number>>({});

  const categories = useMemo(
    () => (data ? filterMenuCategories(data.categories, query) : []),
    [data, query],
  );
  const searching = query.trim().length > 0;

  const applyOffer = (code: string): void => {
    dispatch({ type: 'SET_COUPON', code });
    setAppliedToast(`Offer applied · ${code}`);
  };

  const add = (product: MenuProduct): void => {
    // Honour the branch's sell/don't-sell gate: the backend rejects an
    // unavailable item at placement, so adding one here only produces a cart
    // that fails at checkout with the customer waiting.
    if (!product.isAvailable) {
      return;
    }
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

  const jumpTo = (categoryId: string): void => {
    const y = sectionY.current[categoryId];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
    }
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
      <Toast
        visible={!!appliedToast}
        message={appliedToast ?? ''}
        tone="success"
        onHide={() => setAppliedToast(null)}
      />
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
        <>
          {/* Offers — published coupons; tapping applies the code to the cart. */}
          {!searching ? (
            <OffersCarousel offers={offers} appliedCode={cart.couponCode} onApply={applyOffer} />
          ) : null}

          {/* Search box — filters the whole menu as you type. */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 16, color: theme.colors.textMuted }}>🔍</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search the menu"
                placeholderTextColor={theme.colors.textMuted}
                accessibilityLabel="Search the menu"
                returnKeyType="search"
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 16, color: theme.colors.text }}
              />
              {searching ? (
                <PressableScale accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')}>
                  <Text style={{ fontSize: 18, color: theme.colors.textMuted, paddingHorizontal: 4 }}>✕</Text>
                </PressableScale>
              ) : null}
            </View>
          </View>

          {/* Category chips — jump to a section. Reflects the current (filtered) list. */}
          {categories.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
            >
              {categories.map((category) => (
                <PressableScale
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Jump to ${category.name}`}
                  onPress={() => jumpTo(category.id)}
                  style={{
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radius.pill,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 14 }}>{category.name}</Text>
                </PressableScale>
              ))}
            </ScrollView>
          ) : null}

          {categories.length === 0 ? (
            <EmptyState title="No matches" message={`Nothing on the menu matches “${query.trim()}”.`} />
          ) : (
            <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: count > 0 ? 104 : 24 }}>
              {categories.map((category) => (
                <View
                  key={category.id}
                  onLayout={(e) => {
                    sectionY.current[category.id] = e.nativeEvent.layout.y;
                  }}
                  style={{ marginBottom: 22 }}
                >
                  <SectionTitle label={category.name} />
                  <View style={{ gap: 10 }}>
                    <Stagger>
                      {category.products.map((product) => {
                        const soldOut = !product.isAvailable;
                        return (
                          <Card key={product.id}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', opacity: soldOut ? 0.55 : 1 }}>
                              <View style={{ flex: 1, paddingRight: 12 }}>
                                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>{product.name}</Text>
                                {product.description ? (
                                  <Text style={{ color: theme.colors.textMuted, ...theme.type.caption, marginTop: 3 }} numberOfLines={2}>
                                    {product.description}
                                  </Text>
                                ) : null}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                  <PriceTag label={formatSar(product.priceMinor)} />
                                  {soldOut ? (
                                    <View style={{ backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill, paddingVertical: 2, paddingHorizontal: 8 }}>
                                      <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' }}>Sold out</Text>
                                    </View>
                                  ) : null}
                                </View>
                              </View>
                              {soldOut ? (
                                <View
                                  accessibilityLabel={`${product.name} is sold out`}
                                  style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Text style={{ color: theme.colors.textMuted, fontSize: 20 }}>×</Text>
                                </View>
                              ) : (
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
                              )}
                            </View>
                          </Card>
                        );
                      })}
                    </Stagger>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </>
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
