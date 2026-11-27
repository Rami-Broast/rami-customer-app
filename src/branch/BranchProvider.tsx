/**
 * The selected branch + order mode (pickup/delivery), shared app-wide.
 *
 * The home dashboard, search and checkout all need to know *which* branch the
 * customer is ordering from and whether it is pickup or delivery — and the
 * customer must be able to change both from the top of the home screen. Keeping
 * them here, rather than threading them through navigation params, is what lets
 * the branch chip on Home and the toggle on Checkout stay in step.
 *
 * The branch list is public, so this loads with no auth. The choice is
 * persisted (best-effort) so the app reopens on the branch you last used.
 */

import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { Branch } from '../api/types';
import { ORDER_TYPE, OrderType } from '../types/backend';
import { useAsync } from '../hooks/useAsync';

const BRANCH_KEY = 'selected_branch_id';
const MODE_KEY = 'order_mode';

interface BranchValue {
  branches: Branch[];
  selected: Branch | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
  selectBranch: (id: string) => void;
  mode: OrderType;
  setMode: (mode: OrderType) => void;
}

const BranchContext = createContext<BranchValue | null>(null);

export function BranchProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { api } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.listBranches(), []);
  const branches = useMemo(() => data ?? [], [data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setModeState] = useState<OrderType>(ORDER_TYPE.PICKUP);

  // Restore the last choice.
  useEffect(() => {
    SecureStore.getItemAsync(BRANCH_KEY).then((v) => v && setSelectedId((prev) => prev ?? v)).catch(() => {});
    SecureStore.getItemAsync(MODE_KEY)
      .then((v) => {
        if (v === ORDER_TYPE.DELIVERY || v === ORDER_TYPE.PICKUP) {
          setModeState(v);
        }
      })
      .catch(() => {});
  }, []);

  // Default to the first order-accepting branch once loaded (or the first).
  useEffect(() => {
    if (!selectedId && branches.length > 0) {
      const preferred = branches.find((b) => b.isAcceptingOrders) ?? branches[0];
      if (preferred) {
        setSelectedId(preferred.id);
      }
    }
  }, [branches, selectedId]);

  // If the restored id is no longer in the list, fall back.
  const selected = useMemo(() => branches.find((b) => b.id === selectedId) ?? null, [branches, selectedId]);

  const value = useMemo<BranchValue>(
    () => ({
      branches,
      selected,
      loading,
      error,
      reload,
      selectBranch: (id: string) => {
        setSelectedId(id);
        SecureStore.setItemAsync(BRANCH_KEY, id).catch(() => {});
      },
      mode,
      setMode: (m: OrderType) => {
        setModeState(m);
        SecureStore.setItemAsync(MODE_KEY, m).catch(() => {});
      },
    }),
    [branches, selected, loading, error, reload, mode],
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch(): BranchValue {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return ctx;
}
