import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_BASE_URL } from '../api/config';
import { useAuth } from '../auth/AuthProvider';
import { useBranch } from '../branch/BranchProvider';
import { useCart } from '../cart/CartProvider';
import { useFavorites } from '../favorites/FavoritesProvider';
import { HeartIcon, PlusIcon, SearchIcon } from '../components/icons';
import { filterMenuCategories } from '../features/menu/menu-filter';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, PressableScale, Skeleton } from '../motion';
import { formatSar } from '../util/money';
import { resolveImageUrl } from '../util/imageUrl';
import { useTheme } from '../theme/theme';
import type { MenuProduct } from '../api/types';

/** Search the selected branch's menu (reuses the shared menu filter). */
export function SearchScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { api } = useAuth();
  const { selected } = useBranch();
  const { dispatch } = useCart();
  const favorites = useFavorites();
  const [term, setTerm] = useState('');

  const branchId = selected?.id ?? null;
  const menu = useAsync(() => (branchId ? api.menu(branchId) : Promise.resolve(null)), [branchId]);

  const results = useMemo<MenuProduct[]>(() => {
    if (!menu.data) {
      return [];
    }
    return filterMenuCategories(menu.data.categories, term).flatMap((c) => c.products);
  }, [menu.data, term]);

  const add = (p: MenuProduct): void => {
    if (!p.isAvailable || !branchId) {
      return;
    }
    dispatch({ type: 'ADD', branchId, line: { productId: p.id, productName: p.name, unitPriceMinor: p.priceMinor, addonIds: [], addonNames: [] } });
  };

  const image = (p: MenuProduct) => {
    const uri = resolveImageUrl(p.imageUrl, API_BASE_URL);
    if (!uri) {
      return (
        <View style={{ width: 60, height: 60, borderRadius: theme.radius.md, backgroundColor: theme.colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: theme.colors.gold }}>{p.name.trim().charAt(0).toUpperCase() || '🍗'}</Text>
        </View>
      );
    }
    return <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }} resizeMode="cover" />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ color: theme.colors.text, ...theme.type.title, marginBottom: 12 }}>Search</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.pill, paddingHorizontal: 16 }}>
          <SearchIcon size={20} color={theme.colors.textMuted} />
          <TextInput
            value={term}
            onChangeText={setTerm}
            placeholder={selected ? `Search ${selected.name}…` : 'Search the menu…'}
            placeholderTextColor={theme.colors.textMuted}
            autoFocus
            returnKeyType="search"
            style={{ flex: 1, paddingVertical: 14, fontSize: 16, color: theme.colors.text }}
          />
          {term.length > 0 ? (
            <PressableScale accessibilityRole="button" accessibilityLabel="Clear" onPress={() => setTerm('')}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>✕</Text>
            </PressableScale>
          ) : null}
        </View>
      </View>

      {menu.loading ? (
        <View style={{ padding: 16, gap: 10 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={76} radius={theme.radius.lg} />)}</View>
      ) : menu.error ? (
        <ErrorState title="Couldn’t load the menu" message={menu.error.message} actionLabel="Retry" onAction={menu.reload} />
      ) : !selected ? (
        <EmptyState title="Choose a branch first" message="Pick a branch on the Home tab to search its menu." />
      ) : results.length === 0 ? (
        <EmptyState title="No matches" message={term.trim() ? `Nothing matches “${term.trim()}”.` : 'Start typing to search the menu.'} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
          {results.map((p) => {
            const fav = favorites.isFavorite(p.id);
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 10, gap: 12 }}>
                {image(p)}
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
                  <Text style={{ color: theme.colors.primary, fontWeight: '900', marginTop: 4 }}>{formatSar(p.priceMinor)}</Text>
                </View>
                <PressableScale accessibilityRole="button" accessibilityLabel={fav ? 'Unfavourite' : 'Favourite'} onPress={() => favorites.toggle(p.id)} style={{ padding: 6 }}>
                  <HeartIcon size={22} color={fav ? theme.colors.primary : theme.colors.textMuted} filled={fav} />
                </PressableScale>
                <PressableScale accessibilityRole="button" accessibilityLabel={`Add ${p.name}`} onPress={() => add(p)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', opacity: p.isAvailable ? 1 : 0.4 }}>
                  <PlusIcon size={20} color={theme.colors.onPrimary} />
                </PressableScale>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
