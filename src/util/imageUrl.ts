import { joinUrl } from '../api/http';

/**
 * Turns whatever is stored in an `imageUrl` column into a URL an `<Image>` can
 * load. Mirrors `admin-app/src/util/imageUrl.ts` — the same column is written
 * by the admin app and must read back the same way here.
 *
 * Two kinds of value live in that column: images uploaded through the admin app
 * are stored as the **path** the backend returns (`/assets/<id>`), resolved
 * against the API base (so one row works from the admin panel and the customer
 * app alike); and absolute URLs pasted before uploading existed, which address
 * themselves and pass through untouched.
 *
 * `base` is passed in (not imported) so this stays pure and unit-testable in
 * Node — the call sites pass `API_BASE_URL`. Getting it wrong shows up as a
 * blank image on a menu, not an error in a log, which is exactly the bug this
 * fixes: the customer app rendered none of these images and had no resolver, so
 * a `/assets/<id>` path would have pointed at the app's own origin, not the API.
 */
export function resolveImageUrl(stored: string | null | undefined, base: string): string | null {
  const value = stored?.trim();
  if (!value) {
    return null;
  }
  // Absolute, protocol-relative, or a data URI: it already addresses itself.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }
  return joinUrl(base, value);
}
