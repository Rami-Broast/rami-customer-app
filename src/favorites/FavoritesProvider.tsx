/**
 * Favourites — a per-device set of favourited product ids.
 *
 * There is no backend favourites endpoint, so this is stored **locally** on the
 * device (secure store), best-effort: a read or write that fails never breaks a
 * screen, it just means the heart does not persist across a reinstall. When a
 * backend endpoint exists, swap the load/save for API calls and nothing else
 * changes.
 */

import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'favorite_product_ids';

interface FavoritesValue {
  ids: string[];
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(KEY)
      .then((raw) => {
        if (mounted && raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setIds(parsed.filter((x): x is string => typeof x === 'string'));
          }
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<FavoritesValue>(() => {
    const persist = (next: string[]): void => {
      SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => {});
    };
    return {
      ids,
      isFavorite: (id: string) => ids.includes(id),
      toggle: (id: string) =>
        setIds((prev) => {
          const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
          persist(next);
          return next;
        }),
    };
  }, [ids]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
