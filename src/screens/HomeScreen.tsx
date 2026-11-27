import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_BASE_URL } from '../api/config';
import { useAuth } from '../auth/AuthProvider';
import { useBranch } from '../branch/BranchProvider';
import { BranchList, BranchPickerSheet } from '../branch/BranchPicker';
import { useCart } from '../cart/CartProvider';
import { useFavorites } from '../favorites/FavoritesProvider';
import { useOrderMode } from '../order/OrderModeProvider';
import { Card, SectionTitle } from '../components/ui';
import { BellIcon, BikeIcon, ChevronRightIcon, HeartIcon, PinIcon, PlusIcon, SearchIcon, StorefrontIcon, UserIcon } from '../components/icons';
import { OffersCarousel } from '../features/offers/OffersCarousel';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, FadeIn, PressableScale, Skeleton } from '../motion';
import { ORDER_TYPE, OrderType } from '../types/backend';
import { TabScreenProps } from '../navigation/types';
import { formatSar } from '../util/money';
import { resolveImageUrl } from '../util/imageUrl';
import { useTheme } from '../theme/theme';
import type { MenuProduct } from '../api/types';

/** The home dashboard: branch, mode, offers, categories, popular and a menu peek. */
export function HomeScreen({ navigation }: TabScreenProps<'Home'>): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { api } = useAuth();
  const branch = useBranch();
  const { cart, count, dispatch } = useCart();
  const favorites = useFavorites();
  const { mode, setMode } = useOrderMode();
  const [pickerOpen, setPickerOpen] = useState(false);

  const branchId = branch.selected?.id ?? null;
  const branchName = branch.selected?.name ?? 'Rami Broast';

  const menu = useAsync(() => (branchId ? api.menu(branchId) : Promise.resolve(null)), [branchId]);
  const offersState = useAsync(() => api.config(), []);
  const offers = offersState.data?.offers ?? [];

  const allProducts = useMemo<MenuProduct[]>(
    () => (menu.data ? menu.data.categories.flatMap((c) => c.products) : []),
    [menu.data],
  );
  const popular = allProducts.filter((p) => p.isAvailable).slice(0, 8);
  const menuPeek = allProducts.slice(0, 4);

  const add = (p: MenuProduct): void => {
    if (!p.isAvailable || !branchId) {
      return;
    }
    dispatch({
      type: 'ADD',
      branchId,
      line: { productId: p.id, productName: p.name, unitPriceMinor: p.priceMinor, addonIds: [], addonNames: [] },
    });
  };

  const openMenu = (): void => navigation.navigate('Menu');
  const applyOffer = (code: string): void => dispatch({ type: 'SET_COUPON', code });

  const image = (p: MenuProduct, size: number, radius: number) => {
    const uri = resolveImageUrl(p.imageUrl, API_BASE_URL);
    if (!uri) {
      return (
        <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: theme.colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.4, fontWeight: '900', color: theme.colors.gold }}>{p.name.trim().charAt(0).toUpperCase() || '🍗'}</Text>
        </View>
      );
    }
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius, backgroundColor: theme.colors.surfaceAlt }} resizeMode="cover" />;
  };

  const modeTab = (m: OrderType, label: string, icon: React.ReactNode, enabled: boolean) => {
    const active = mode === m;
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ selected: active, disabled: !enabled }}
        disabled={!enabled}
        onPress={() => setMode(m)}
        style={{ flex: 1, flexDirection: 'row', gap: 8, paddingVertical: 12, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? theme.colors.primary : 'transparent', opacity: enabled ? 1 : 0.4 }}
      >
        {icon}
        <Text style={{ color: active ? theme.colors.onPrimary : theme.colors.text, fontWeight: '800' }}>{label}</Text>
      </PressableScale>
    );
  };

  const productCard = (p: MenuProduct) => {
    const fav = favorites.isFavorite(p.id);
    return (
      <View key={p.id} style={{ width: 168, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
        <View>
          {image(p, 168, 0)}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={fav ? `Remove ${p.name} from favourites` : `Favourite ${p.name}`}
            onPress={() => favorites.toggle(p.id)}
            style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
          >
            <HeartIcon size={18} color={fav ? theme.colors.primary : theme.colors.textMuted} filled={fav} />
          </PressableScale>
        </View>
        <View style={{ padding: 10, gap: 8 }}>
          <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '900' }}>{formatSar(p.priceMinor)}</Text>
            <PressableScale accessibilityRole="button" accessibilityLabel={`Add ${p.name}`} onPress={() => add(p)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <PlusIcon size={20} color={theme.colors.onPrimary} />
            </PressableScale>
          </View>
        </View>
      </View>
    );
  };

  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
      <PressableScale accessibilityRole="button" accessibilityLabel={`Ordering from ${branchName}. Change branch`} onPress={() => setPickerOpen(true)} style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
          {mode === ORDER_TYPE.DELIVERY ? 'DELIVER FROM' : 'COLLECT FROM'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <PinIcon size={18} color={theme.colors.primary} />
          <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 19, fontWeight: '900', maxWidth: 210 }}>{branchName}</Text>
          <ChevronRightIcon size={18} color={theme.colors.text} />
        </View>
      </PressableScale>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Orders" onPress={() => navigation.navigate('Orders')} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <BellIcon size={22} color={theme.colors.text} />
        </PressableScale>
        <PressableScale accessibilityRole="button" accessibilityLabel="Account" onPress={() => navigation.navigate('Account')} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
          <UserIcon size={22} color={theme.colors.primary} />
        </PressableScale>
      </View>
    </View>
  );

  // --- Branch resolution gate (reuses the BranchProvider states) -----------
  if (!branchId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
        {branch.resolving || branch.loading ? (
          <View style={{ padding: 20, gap: 12 }}>
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginBottom: 4 }}>Finding your nearest branch…</Text>
            {[0, 1, 2].map((i) => <Skeleton key={i} height={72} radius={theme.radius.lg} />)}
          </View>
        ) : branch.error ? (
          <ErrorState title="Couldn’t load branches" message={branch.error.message} actionLabel="Retry" onAction={branch.reload} />
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800' }}>Choose your branch</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 4, marginBottom: 14 }}>
              Pick the branch nearest you — you can change it any time.
            </Text>
            <BranchList branches={branch.branches} coords={branch.coords} onSelect={branch.select} autoFocusSearch={false} />
          </View>
        )}
      </View>
    );
  }

  const canDelivery = branch.selected?.acceptsDelivery ?? true;
  const canPickup = branch.selected?.acceptsPickup ?? true;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingBottom: count > 0 ? 112 : 24 }} showsVerticalScrollIndicator={false}>
        {header}

        {/* Search entry */}
        <View style={{ paddingHorizontal: 16 }}>
          <PressableScale accessibilityRole="button" accessibilityLabel="Search the menu" onPress={() => navigation.navigate('Search')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.pill, paddingVertical: 14, paddingHorizontal: 16 }}>
            <SearchIcon size={20} color={theme.colors.textMuted} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 15 }}>Search burgers, chicken, fries…</Text>
          </PressableScale>
        </View>

        {/* Mode toggle */}
        <View style={{ margin: 16, flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill, padding: 4 }}>
          {modeTab(ORDER_TYPE.DELIVERY, 'Delivery', <BikeIcon size={18} color={mode === ORDER_TYPE.DELIVERY ? theme.colors.onPrimary : theme.colors.textMuted} />, canDelivery)}
          {modeTab(ORDER_TYPE.PICKUP, 'Pickup', <StorefrontIcon size={18} color={mode === ORDER_TYPE.PICKUP ? theme.colors.onPrimary : theme.colors.textMuted} />, canPickup)}
        </View>

        {/* Branch card */}
        {branch.selected ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <StorefrontIcon size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 16 }}>{branch.selected.name}</Text>
                  <Text style={{ color: theme.colors.textMuted }} numberOfLines={1}>{[branch.selected.district, branch.selected.city].filter(Boolean).join(', ')}</Text>
                </View>
                <PressableScale accessibilityRole="button" onPress={() => setPickerOpen(true)}>
                  <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Change</Text>
                </PressableScale>
              </View>
            </Card>
          </View>
        ) : null}

        {/* Offers */}
        {offers.length > 0 ? (
          <View style={{ marginTop: 16 }}>
            <OffersCarousel offers={offers} appliedCode={cart.couponCode} onApply={applyOffer} />
          </View>
        ) : null}

        {/* Menu content */}
        {menu.loading ? (
          <View style={{ padding: 16, gap: 12 }}>
            <Skeleton height={28} width="40%" />
            <View style={{ flexDirection: 'row', gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={44} width={120} radius={theme.radius.pill} />)}</View>
            <Skeleton height={170} radius={theme.radius.lg} />
          </View>
        ) : menu.error ? (
          <View style={{ padding: 16 }}>
            <ErrorState title="Couldn’t load the menu" message={menu.error.message} actionLabel="Retry" onAction={menu.reload} />
          </View>
        ) : menu.data && allProducts.length > 0 ? (
          <FadeIn translateY={8}>
            {/* Categories — names only */}
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              <SectionTitle label="Categories" right={<PressableScale accessibilityRole="button" onPress={openMenu}><Text style={{ color: theme.colors.primary, fontWeight: '800' }}>See menu</Text></PressableScale>} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8, paddingTop: 4 }}>
                {menu.data.categories.map((c) => (
                  <PressableScale key={c.id} accessibilityRole="button" onPress={openMenu} style={{ paddingVertical: 12, paddingHorizontal: 18, borderRadius: theme.radius.pill, backgroundColor: theme.colors.goldSoft, borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '800' }}>{c.name}</Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>

            {/* Popular */}
            {popular.length > 0 ? (
              <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
                <SectionTitle label="Popular right now" right={<PressableScale accessibilityRole="button" onPress={openMenu}><Text style={{ color: theme.colors.primary, fontWeight: '800' }}>See all</Text></PressableScale>} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8, paddingTop: 4 }}>
                  {popular.map(productCard)}
                </ScrollView>
              </View>
            ) : null}

            {/* From the menu */}
            <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
              <SectionTitle label="From the menu" right={<PressableScale accessibilityRole="button" onPress={openMenu}><Text style={{ color: theme.colors.primary, fontWeight: '800' }}>See full menu</Text></PressableScale>} />
              <View style={{ gap: 10, marginTop: 4 }}>
                {menuPeek.map((p) => (
                  <PressableScale key={p.id} accessibilityRole="button" onPress={openMenu} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 10, gap: 12 }}>
                    {image(p, 64, theme.radius.md)}
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
                      {p.description ? <Text numberOfLines={1} style={{ color: theme.colors.textMuted, marginTop: 2 }}>{p.description}</Text> : null}
                      <Text style={{ color: theme.colors.primary, fontWeight: '900', marginTop: 4 }}>{formatSar(p.priceMinor)}</Text>
                    </View>
                    <PressableScale accessibilityRole="button" accessibilityLabel={`Add ${p.name}`} onPress={() => add(p)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <PlusIcon size={20} color={theme.colors.onPrimary} />
                    </PressableScale>
                  </PressableScale>
                ))}
              </View>
            </View>
          </FadeIn>
        ) : (
          <View style={{ padding: 24 }}>
            <EmptyState title="Menu is empty" message="This branch has nothing available right now." />
          </View>
        )}
      </ScrollView>

      {count > 0 && cart.branchId === branchId ? (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 96 }}>
          <PressableScale accessibilityRole="button" accessibilityLabel="View cart" onPress={() => navigation.navigate('Cart')} style={{ backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 16 }}>View cart</Text>
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 16 }}>{count} item{count === 1 ? '' : 's'}</Text>
          </PressableScale>
        </View>
      ) : null}

      <BranchPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        branches={branch.branches}
        coords={branch.coords}
        selectedId={branch.selected?.id}
        onSelect={(b) => {
          branch.select(b);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}
