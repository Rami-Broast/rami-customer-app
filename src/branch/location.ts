import * as Location from 'expo-location';

import { Coords } from '../util/geo';

/**
 * One best-effort read of the device's coordinates.
 *
 * Requests foreground permission and returns a position, or null if permission
 * is denied or anything throws — the caller then falls back to asking the
 * customer to pick a branch. It never throws and never blocks the UI behind a
 * dialog loop: a denied prompt is a null, not an error, and the app carries on.
 */
export async function getDeviceCoords(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}
