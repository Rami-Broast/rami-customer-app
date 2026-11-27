import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { useBranch } from '../branch/BranchProvider';
import { useCart } from '../cart/CartProvider';
import { useFavorites } from '../favorites/FavoritesProvider';
import { FoodImage } from '../components/FoodImage';
import { HeartIcon, PlusIcon } from '../components/icons';
import { Screen } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, PressableScale, Skeleton } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';
import type { MenuProduct } from '../api/types';

/** Favourited items, resolved against the selected branch's menu. */
export function FavoritesScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Favorites'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const { selected } = useBranch();
  const { dispatch } = useCart();
  const favorites = useFavorites();

  const branchId = selected?.id ?? '';
  const menu = useAsync(() => (branchId ? api.menu(branchId) : Promise.resolve(null)), [branchId]);

  const products = useMemo<MenuProduct[]>(() => {
    if (!menu.data) {
      return [];
    }
    const all = menu.data.categories.flatMap((c) => c.products);
    return all.filter((p) => favorites.ids.includes(p.id));
  }, [menu.data, favorites.ids]);

  const add = (p: MenuProduct): void => {
    if (!selected) {
      return;
    }
    dispatch({
      type: 'ADD',
      branchId: selected.id,
      line: { productId: p.id, productName: p.name, unitPriceMinor: p.priceMinor, addonIds: [], addonNames: [], imageUrl: p.imageUrl },
    });
  };

  return (
    <Screen title="Favorites" onBack={() => navigation.goBack()}>
      {favorites.ids.length === 0 ? (
        <EmptyState title="No favourites yet" message="Tap the heart on any dish to save it here." />
      ) : menu.loading ? (
        <View style={{ padding: 16, gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={76} radius={theme.radius.lg} />)}</View>
      ) : products.length === 0 ? (
        <EmptyState
          title="Not on this branch's menu"
          message={selected ? `Your favourites aren't available at ${selected.name}. Try another branch.` : 'Choose a branch to see your favourites.'}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {products.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 10, gap: 12 }}>
              <FoodImage uri={p.imageUrl} name={p.name} radius={theme.radius.md} style={{ width: 60, height: 60 }} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
                <Text style={{ color: theme.colors.primary, fontWeight: '900', marginTop: 4 }}>{formatSar(p.priceMinor)}</Text>
              </View>
              <PressableScale accessibilityRole="button" accessibilityLabel={`Remove ${p.name} from favourites`} onPress={() => favorites.toggle(p.id)} style={{ padding: 6 }}>
                <HeartIcon size={22} color={theme.colors.primary} filled />
              </PressableScale>
              <PressableScale accessibilityRole="button" accessibilityLabel={`Add ${p.name}`} onPress={() => add(p)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <PlusIcon size={20} color={theme.colors.onPrimary} />
              </PressableScale>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
