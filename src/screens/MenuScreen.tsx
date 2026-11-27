import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';

import { API_BASE_URL } from '../api/config';
import { useAuth } from '../auth/AuthProvider';
import { useBranch } from '../branch/BranchProvider';
import { BranchList, BranchPickerSheet } from '../branch/BranchPicker';
import { useCart } from '../cart/CartProvider';
import { AddToCartButton, useFlyToCart } from '../cart/FlyToCart';
import { Card, PriceTag, Screen, SectionTitle } from '../components/ui';
import { CartIcon, LogoutIcon, PinIcon, PlusIcon, ReceiptIcon } from '../components/icons';
import { filterMenuCategories } from '../features/menu/menu-filter';
import { OffersCarousel } from '../features/offers/OffersCarousel';
import { useAsync } from '../hooks/useAsync';
import { CartBadge, EmptyState, ErrorState, FadeIn, PressableScale, Skeleton, Stagger, Toast } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { resolveImageUrl } from '../util/imageUrl';
import { useTheme } from '../theme/theme';
import type { MenuProduct } from '../api/types';

/** Home: the selected branch's menu, with a branch switcher at the top. */
export function MenuScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Menu'>): React.JSX.Element {
  const theme = useTheme();
  const { api, signOut } = useAuth();
  const { cart, count, dispatch } = useCart();
  const branch = useBranch();
  const { registerCartTarget } = useFlyToCart();
  const cartTargetRef = useRef<View>(null);
  useEffect(() => {
    registerCartTarget(cartTargetRef.current);
  }, [registerCartTarget]);

  // An explicit branch param (rare, e.g. a deep link) overrides the resolved one.
  const activeBranchId = route.params?.branchId ?? branch.selected?.id ?? null;
  const activeBranchName = route.params?.branchName ?? branch.selected?.name ?? 'Rami Broast';

  const { data, loading, error, reload } = useAsync(
    () => (activeBranchId ? api.menu(activeBranchId) : Promise.resolve(null)),
    [activeBranchId],
  );
  // Offers are published coupons, served app-wide (not per branch).
  const offersState = useAsync(() => api.config(), []);
  const offers = offersState.data?.offers ?? [];

  const [query, setQuery] = useState('');
  const [appliedToast, setAppliedToast] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
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
    if (!product.isAvailable || !activeBranchId) {
      return;
    }
    dispatch({
      type: 'ADD',
      branchId: activeBranchId,
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

  const roundButton = (label: string, icon: React.ReactNode, onPress: () => void) => (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
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
      {icon}
    </PressableScale>
  );

  const cartButton = (
    <View ref={cartTargetRef} collapsable={false}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${count} item${count === 1 ? '' : 's'}`}
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
    </View>
  );

  const headerRight = (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      {roundButton('My orders', <ReceiptIcon size={20} color={theme.colors.text} />, () => navigation.navigate('Main', { screen: 'Orders' }))}
      {roundButton('Sign out', <LogoutIcon size={20} color={theme.colors.text} />, () => signOut())}
      {cartButton}
    </View>
  );

  const branchSelector = (
    <FadeIn translateY={6}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Ordering from ${activeBranchName}. Change branch`}
          onPress={() => setPickerOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            padding: 12,
          }}
        >
          <View style={{ width: 36, height: 36, borderRadius: theme.radius.sm, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <PinIcon size={18} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>ORDERING FROM</Text>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>{activeBranchName}</Text>
          </View>
          <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Change</Text>
        </PressableScale>
      </View>
    </FadeIn>
  );

  // --- Branch resolution gates (before the menu can load) -------------------
  let body: React.ReactNode;
  if (!activeBranchId) {
    if (branch.resolving || branch.loading) {
      body = (
        <View style={{ padding: 20, gap: 12 }}>
          <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginBottom: 4 }}>Finding your nearest branch…</Text>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={72} radius={theme.radius.lg} />
          ))}
        </View>
      );
    } else if (branch.error) {
      body = <ErrorState title="Couldn’t load branches" message={branch.error.message} actionLabel="Retry" onAction={branch.reload} />;
    } else {
      // needsPick — ask once, inline and mandatory.
      body = (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800' }}>Choose your branch</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 4, marginBottom: 14 }}>
            We couldn’t detect your location. Pick the branch nearest you — you can change it any time.
          </Text>
          <BranchList branches={branch.branches} coords={branch.coords} onSelect={branch.select} autoFocusSearch={false} />
        </View>
      );
    }
  } else {
    body = (
      <>
        {branchSelector}
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
            {!searching ? <OffersCarousel offers={offers} appliedCode={cart.couponCode} onApply={applyOffer} /> : null}

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
                    style={{ backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill, paddingVertical: 8, paddingHorizontal: 14 }}
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
                          const photo = resolveImageUrl(product.imageUrl, API_BASE_URL);
                          return (
                            <Card key={product.id}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', opacity: soldOut ? 0.55 : 1 }}>
                                {photo ? (
                                  <Image
                                    source={{ uri: photo }}
                                    resizeMode="cover"
                                    accessibilityIgnoresInvertColors
                                    style={{ width: 56, height: 56, borderRadius: theme.radius.md, marginRight: 12, backgroundColor: theme.colors.surfaceAlt }}
                                  />
                                ) : null}
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
                                    style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}
                                  >
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 20 }}>×</Text>
                                  </View>
                                ) : (
                                  <AddToCartButton
                                    accessibilityLabel={`Add ${product.name}`}
                                    onAdd={() => add(product)}
                                    imageUri={photo}
                                    style={[
                                      { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
                                      theme.elevation(1),
                                    ]}
                                  >
                                    <PlusIcon size={22} color={theme.colors.onPrimary} />
                                  </AddToCartButton>
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
      </>
    );
  }

  return (
    <Screen title="Rami Broast" right={headerRight}>
      <Toast visible={!!appliedToast} message={appliedToast ?? ''} tone="success" onHide={() => setAppliedToast(null)} />
      {body}

      {count > 0 && activeBranchId && cart.branchId === activeBranchId ? (
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

      <BranchPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        branches={branch.branches}
        coords={branch.coords}
        selectedId={branch.selected?.id}
        onSelect={branch.select}
      />
    </Screen>
  );
}
