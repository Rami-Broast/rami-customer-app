import * as SecureStore from 'expo-secure-store';

/**
 * Persists the customer's chosen branch id (native: secure store).
 *
 * Not sensitive, but it rides the same defensive contract as the token store:
 * every call swallows failure, so a storage error degrades to "no remembered
 * branch" (we re-detect or ask) rather than crashing. Mirrored for web in
 * `prefStore.web.ts`.
 */
const BRANCH_KEY = 'rami.selectedBranchId';

export async function saveSelectedBranchId(id: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(BRANCH_KEY, id);
  } catch {
    // Non-fatal: the choice simply won't survive a restart.
  }
}

export async function loadSelectedBranchId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(BRANCH_KEY);
  } catch {
    return null;
  }
}

export async function clearSelectedBranchId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BRANCH_KEY);
  } catch {
    // Ignore.
  }
}
