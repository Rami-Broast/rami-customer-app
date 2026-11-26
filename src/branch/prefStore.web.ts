/**
 * Web branch-preference store (localStorage), the `.web` variant Metro picks for
 * the browser build — `expo-secure-store` has no web implementation. Same
 * defensive contract as the native `prefStore.ts`.
 */
const BRANCH_KEY = 'rami.selectedBranchId';

function store(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Access to localStorage can itself throw (blocked site data).
  }
  return null;
}

export async function saveSelectedBranchId(id: string): Promise<void> {
  try {
    store()?.setItem(BRANCH_KEY, id);
  } catch {
    // Non-fatal.
  }
}

export async function loadSelectedBranchId(): Promise<string | null> {
  try {
    return store()?.getItem(BRANCH_KEY) ?? null;
  } catch {
    return null;
  }
}

export async function clearSelectedBranchId(): Promise<void> {
  try {
    store()?.removeItem(BRANCH_KEY);
  } catch {
    // Ignore.
  }
}
