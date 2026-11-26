import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Branch } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { Coords, nearestBranch } from '../util/geo';
import { getDeviceCoords } from './location';
import { loadSelectedBranchId, saveSelectedBranchId } from './prefStore';

export interface BranchContextValue {
  /** Every branch the customer could order from (loaded once per session). */
  branches: Branch[];
  /** The branch whose menu is shown, or null until one is chosen. */
  selected: Branch | null;
  /** Branches are still loading. */
  loading: boolean;
  /** The initial choice (remembered → nearest → ask) is still being decided. */
  resolving: boolean;
  /** Resolved with branches available but nothing selected → ask the customer. */
  needsPick: boolean;
  /** Device coordinates, if we obtained them (for distance labels). */
  coords: Coords | null;
  error: Error | null;
  select: (branch: Branch) => void;
  reload: () => void;
}

const BranchContext = createContext<BranchContextValue | null>(null);

/**
 * Owns which branch the customer is ordering from.
 *
 * The customer never meets a full branch list on open. This resolves one branch
 * — a remembered choice first, then the nearest by device location, and only if
 * neither is available does it fall back to asking (`needsPick`). The chosen
 * branch is remembered, and can be changed any time through the branch switcher.
 * Everything here is best-effort: a failed branch load surfaces as `error` with
 * a retry, and a denied/failed location is simply "no nearest", never a crash.
 */
export function BranchProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { api, isAuthenticated } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(true);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (): Promise<Branch[]> => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listBranches();
      setBranches(list);
      return list;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Could not load branches.'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [api]);

  const select = useCallback((branch: Branch): void => {
    setSelected(branch);
    void saveSelectedBranchId(branch.id);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSelected(null);
      setBranches([]);
      setResolving(true);
      return;
    }

    let active = true;
    (async () => {
      setResolving(true);
      const list = await load();
      if (!active) return;
      if (list.length === 0) {
        setResolving(false);
        return;
      }

      // 1) A remembered choice wins — no location prompt for a returning customer.
      const savedId = await loadSelectedBranchId();
      if (!active) return;
      const saved = savedId ? list.find((b) => b.id === savedId) : undefined;
      if (saved) {
        setSelected(saved);
        setResolving(false);
        return;
      }

      // 2) Otherwise, the nearest branch by device location.
      const c = await getDeviceCoords();
      if (!active) return;
      setCoords(c);
      const near = nearestBranch(list, c);
      if (near) {
        select(near);
        setResolving(false);
        return;
      }

      // 3) Nothing to go on → ask the customer (needsPick becomes true).
      setResolving(false);
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, load, select]);

  const needsPick =
    isAuthenticated && !resolving && !loading && branches.length > 0 && selected === null;

  const reload = useCallback(() => {
    void load();
  }, [load]);

  const value = useMemo<BranchContextValue>(
    () => ({ branches, selected, loading, resolving, needsPick, coords, error, select, reload }),
    [branches, selected, loading, resolving, needsPick, coords, error, select, reload],
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch(): BranchContextValue {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return ctx;
}
