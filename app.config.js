/**
 * Dynamic Expo config.
 *
 * `app.json` holds the static, committable configuration. The API base URL and
 * the Google Maps key are injected here from the environment at build time, so
 * no deployment URL or credential is committed to the repo. On Vercel these
 * come from the project's Environment Variables; locally from the shell:
 *
 *   API_BASE_URL=... GOOGLE_MAPS_API_KEY=... npx expo start
 *
 * A missing value is deliberately not fatal: it falls back to app.json's
 * placeholder and the map degrades to its "unavailable" state, so the rest of
 * the app still builds and runs. Mirrors the driver app's app.config.js.
 */
module.exports = ({ config }) => {
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? config.extra?.googleMapsApiKey ?? '';
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
