/**
 * Dynamic Expo config.
 *
 * `app.json` holds the static, committable configuration. The two values that
 * change per environment — the API base URL and the Google Maps key — are
 * injected here at build time instead of being hard-coded in a committed file.
 * This lets Vercel (and EAS) set them from the build environment, exactly like
 * `admin-app`/`kitchen-pos` read `VITE_API_BASE_URL` and the driver app reads
 * `API_BASE_URL`. A Maps key must never be committed (it is a live credential).
 *
 * Supply the values through the Vercel project's Environment Variables, an EAS
 * secret (`eas secret:create`), or the shell:
 *
 *   API_BASE_URL=... GOOGLE_MAPS_API_KEY=... npx expo start
 *
 * A missing value is deliberately not fatal: with no `API_BASE_URL` the app
 * falls back to `app.json`'s placeholder (and then to the fallback in
 * `src/api/config.ts`), and with no Maps key the map degrades to the
 * "map unavailable" card — so the app still builds. See
 * `../backend/DEMO_DECISIONS.md` and `../infrastructure/docs/`.
 */
module.exports = ({ config }) => {
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';
  const apiBaseUrl = process.env.API_BASE_URL ?? config.extra?.apiBaseUrl ?? '';

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: { apiKey: mapsApiKey },
      },
    },
    extra: {
      ...config.extra,
      apiBaseUrl,
      googleMapsApiKey: mapsApiKey,
    },
  };
};
