/**
 * Resolve a stored image reference to a loadable URL. Pure, no React Native.
 *
 * The backend's `imageUrl` holds two kinds of value, and will for a long time:
 *   - an uploaded path like `/assets/<id>`, relative to the API host, and
 *   - an absolute URL pasted before uploads existed, which must pass through
 *     untouched.
 * A raw `<Image source={{ uri: imageUrl }} />` breaks every uploaded path, so
 * every stored image is resolved here first. `null`/empty returns null so the
 * caller can show a branded placeholder rather than a broken-image box.
 *
 * RN's `URL` is only partially implemented, so this uses plain string logic.
 */

/** The scheme+host of the API base, e.g. "https://host" from "https://host/api/v1". */
function originOf(apiBaseUrl: string): string {
  const m = /^(https?:\/\/[^/]+)/.exec(apiBaseUrl);
  return m ? m[1]! : apiBaseUrl.replace(/\/+$/, '');
}

export function resolveImageUrl(imageUrl: string | null | undefined, apiBaseUrl: string): string | null {
  if (!imageUrl) {
    return null;
  }
  const trimmed = imageUrl.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${originOf(apiBaseUrl)}${path}`;
}
