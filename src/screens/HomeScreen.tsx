import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { useBranch } from '../branch/BranchProvider';
import { useCart } from '../cart/CartProvider';
import { useFavorites } from '../favorites/FavoritesProvider';
import { FoodImage } from '../components/FoodImage';
import { BellIcon, ChevronRightIcon, HeartIcon, PlusIcon, SearchIcon } from '../components/icons';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, PressableScale, Skeleton } from '../motion';
import { ORDER_TYPE, OrderType } from '../types/backend';
import { TabScreenProps } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';
import type { MenuProduct } from '../api/types';

/** The home dashboard: branch, mode, categories, popular items and a menu peek. */
export function HomeScreen({ navigation }: TabScreenProps<'Home'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const { selected, mode, setMode, loading: branchLoading } = useBranch();
  const { cart, count, dispatch } = useCart();
  const favorites = useFavorites();
  const insets = useSafeAreaInsets();

  const branchId = selected?.id ?? '';
  const menu = useAsync(() => (branchId ? api.menu(branchId) : Promise.resolve(null)), [branchId]);

  const allProducts = useMemo<MenuProduct[]>(
    () => (menu.data ? menu.data.categories.flatMap((c) => c.products) : []),
    [menu.data],
  );
  const popular = allProducts.slice(0, 8);
  const menuPeek = allProducts.slice(0, 4);

  const add = (p: MenuProduct): void => {
    if (!selected) {
      return;
    }
    dispatch({
      type: 'ADD',
      branchId: selected.id,
      line: {
        productId: p.id,
        productName: p.name,
        unitPriceMinor: p.priceMinor,
        addonIds: [],
        addonNames: [],
        imageUrl: p.imageUrl,
      },
    });
  };

  const openMenu = (): void => {
    if (selected) {
      navigation.navigate('Menu', { branchId: selected.id, branchName: selected.name });
    }
  };

  const modeTab = (m: OrderType, label: string, icon: string, enabled: boolean) => {
    const active = mode === m;
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ selected: active, disabled: !enabled }}
        disabled={!enabled}
        onPress={() => setMode(m)}
        style={{
          flex: 1,
          flexDirection: 'row',
          gap: 8,
          paddingVertical: 12,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? theme.colors.surface : 'transparent',
          opacity: enabled ? 1 : 0.4,
          shadowColor: '#000',
          shadowOpacity: active ? 0.08 : 0,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: active ? 2 : 0,
        }}
      >
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={{ color: active ? theme.colors.primary : theme.colors.textMuted, fontWeight: '800' }}>{label}</Text>
      </PressableScale>
    );
  };

  const sectionHead = (title: string, actionLabel: string, onAction: () => void) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900' }}>{title}</Text>
      <PressableScale accessibilityRole="button" onPress={onAction}>
        <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>{actionLabel}</Text>
      </PressableScale>
    </View>
  );

  const productCard = (p: MenuProduct) => {
    const fav = favorites.isFavorite(p.id);
    return (
      <View key={p.id} style={{ width: 170, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
        <View>
          <FoodImage uri={p.imageUrl} name={p.name} radius={0} style={{ width: '100%', height: 120 }} />
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={fav ? `Remove ${p.name} from favourites` : `Favourite ${p.name}`}
            onPress={() => favorites.toggle(p.id)}
            style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}
          >
            <HeartIcon size={18} color={fav ? theme.colors.primary : theme.colors.textMuted} filled={fav} />
          </PressableScale>
        </View>
        <View style={{ padding: 10, gap: 6 }}>
          <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '900' }}>{formatSar(p.priceMinor)}</Text>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Add ${p.name}`}
              onPress={() => add(p)}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}
            >
              <PlusIcon size={20} color={theme.colors.onPrimary} />
            </PressableScale>
          </View>
        </View>
      </View>
    );
  };

  const canDelivery = selected?.acceptsDelivery ?? true;
  const canPickup = selected?.acceptsPickup ?? true;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingBottom: count > 0 ? 110 : 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <PressableScale accessibilityRole="button" accessibilityLabel="Change branch" onPress={() => navigation.navigate('BranchPicker')} style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' }}>
              {mode === ORDER_TYPE.DELIVERY ? 'Deliver from' : 'Collect from'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Text style={{ color: theme.colors.gold, fontSize: 18 }}>📍</Text>
              <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 19, fontWeight: '900', maxWidth: 220 }}>
                {selected ? selected.name : branchLoading ? 'Loading…' : 'Choose a branch'}
              </Text>
              <ChevronRightIcon size={18} color={theme.colors.text} />
            </View>
          </PressableScale>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <PressableScale accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => navigation.navigate('Orders')} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <BellIcon size={22} color={theme.colors.text} />
            </PressableScale>
            <PressableScale accessibilityRole="button" accessibilityLabel="Account" onPress={() => navigation.navigate('Account')} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🙂</Text>
            </PressableScale>
          </View>
        </View>

        {/* Search entry */}
        <View style={{ paddingHorizontal: 16 }}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Search the menu"
            onPress={() => navigation.navigate('Search')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.pill, paddingVertical: 14, paddingHorizontal: 16 }}
          >
            <SearchIcon size={20} color={theme.colors.textMuted} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 15 }}>Search burgers, chicken, fries…</Text>
          </PressableScale>
        </View>

        {/* Mode toggle */}
        <View style={{ margin: 16, flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill, padding: 4 }}>
          {modeTab(ORDER_TYPE.DELIVERY, 'Delivery', '🛵', canDelivery)}
          {modeTab(ORDER_TYPE.PICKUP, 'Pickup', '🛍️', canPickup)}
        </View>

        {/* Branch card */}
        {selected ? (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 14, gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: theme.colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>🏬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 16 }}>{selected.name}</Text>
                <Text style={{ color: theme.colors.textMuted }} numberOfLines={1}>
                  {[selected.district, selected.city].filter(Boolean).join(', ')}
                </Text>
              </View>
              <PressableScale accessibilityRole="button" onPress={() => navigation.navigate('BranchPicker')}>
                <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Change</Text>
              </PressableScale>
            </View>
          </View>
        ) : null}

        {/* Categories — names only, per owner preference */}
        {menu.loading ? (
          <View style={{ padding: 16, gap: 12 }}>
            <Skeleton height={28} width="40%" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[0, 1, 2].map((i) => <Skeleton key={i} height={44} width={120} radius={theme.radius.pill} />)}
            </View>
            <Skeleton height={150} radius={theme.radius.lg} />
          </View>
        ) : menu.error ? (
          <View style={{ padding: 16 }}>
            <ErrorState title="Couldn’t load the menu" message={menu.error.message} actionLabel="Retry" onAction={menu.reload} />
          </View>
        ) : menu.data && allProducts.length > 0 ? (
          <>
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              {sectionHead('Categories', 'See menu', openMenu)}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                {menu.data.categories.map((c) => (
                  <PressableScale
                    key={c.id}
                    accessibilityRole="button"
                    onPress={openMenu}
                    style={{ paddingVertical: 12, paddingHorizontal: 18, borderRadius: theme.radius.pill, backgroundColor: theme.colors.goldSoft, borderWidth: 1, borderColor: theme.colors.border }}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: '800' }}>{c.name}</Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>

            {/* Popular */}
            {popular.length > 0 ? (
              <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
                {sectionHead('Popular right now', 'See all', openMenu)}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
                  {popular.map(productCard)}
                </ScrollView>
              </View>
            ) : null}

            {/* From the menu */}
            <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
              {sectionHead('From the menu', 'See full menu', openMenu)}
              <View style={{ gap: 10 }}>
                {menuPeek.map((p) => (
                  <PressableScale key={p.id} accessibilityRole="button" onPress={openMenu} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 10, gap: 12 }}>
                    <FoodImage uri={p.imageUrl} name={p.name} radius={theme.radius.md} style={{ width: 64, height: 64 }} />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
                      {p.description ? (
                        <Text numberOfLines={1} style={{ color: theme.colors.textMuted, marginTop: 2 }}>{p.description}</Text>
                      ) : null}
                      <Text style={{ color: theme.colors.primary, fontWeight: '900', marginTop: 4 }}>{formatSar(p.priceMinor)}</Text>
                    </View>
                    <PressableScale accessibilityRole="button" accessibilityLabel={`Add ${p.name}`} onPress={() => add(p)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <PlusIcon size={20} color={theme.colors.onPrimary} />
                    </PressableScale>
                  </PressableScale>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
              {selected ? 'This branch has nothing available right now.' : 'Choose a branch to see the menu.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating cart bar */}
      {count > 0 && cart.branchId === branchId ? (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 94 }}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="View cart"
            onPress={() => navigation.navigate('Cart')}
            style={{ backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 16 }}>View cart</Text>
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 16 }}>{count} item{count === 1 ? '' : 's'}</Text>
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
}
