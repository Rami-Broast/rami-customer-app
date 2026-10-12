import { AuthTokens } from '../api/types';

/**
 * Web token store (localStorage).
 *
 * The native build keeps tokens in the OS secure store (`tokenStore.ts`), but
 * `expo-secure-store` has no web implementation and throws there, so Metro
 * picks this `.web` variant for the browser build. localStorage is the closest
 * web equivalent. Every call is defensive: a storage failure (private mode,
 * blocked site data) degrades to "logged out" rather than crashing — the same
 * contract as the native store.
 */
const ACCESS_KEY = 'rami.accessToken';
const REFRESH_KEY = 'rami.refreshToken';

function store(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Access to localStorage can itself throw (blocked cookies / site data).
  }
  return null;
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  try {
    const s = store();
    if (!s) return;
    s.setItem(ACCESS_KEY, tokens.accessToken);
    s.setItem(REFRESH_KEY, tokens.refreshToken);
  } catch {
    // Non-fatal: the session simply won't survive a reload.
  }
}

export async function loadTokens(): Promise<AuthTokens | null> {
  try {
    const s = store();
    if (!s) return null;
    const accessToken = s.getItem(ACCESS_KEY);
    const refreshToken = s.getItem(REFRESH_KEY);
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
  } catch {
    // Ignore — treat as no stored session.
  }
  return null;
}

export async function clearTokens(): Promise<void> {
  try {
    const s = store();
    if (!s) return;
    s.removeItem(ACCESS_KEY);
    s.removeItem(REFRESH_KEY);
  } catch {
    // Ignore.
  }
}
