import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

/**
 * Web stand-in for the native map (`AppMap.tsx`).
 *
 * `react-native-maps` has no web implementation and throws at import, so Metro
 * picks this `.web` variant for the browser build and the native module never
 * enters the web bundle. The web build shows a neutral placeholder instead of a
 * map; address entry still works through the manual fields and the browser's
 * own geolocation ("use my location"). The exports mirror `AppMap.tsx` exactly,
 * so no caller needs a web-specific branch.
 */
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  kind?: 'customer' | 'driver' | 'branch';
}

export interface AppMapProps {
  region: Region;
  markers?: MapMarker[];
  onPress?: (coord: { latitude: number; longitude: number }) => void;
  onRegionChangeComplete?: (region: Region) => void;
  scrollEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppMap({ style }: AppMapProps): React.JSX.Element {
  return (
    <View
      style={[
        {
          width: '100%',
          height: '100%',
          minHeight: 160,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EFEAE6',
          borderRadius: 12,
          padding: 16,
        },
        style,
      ]}
    >
      <Text style={{ color: '#6B6460', textAlign: 'center' }}>
        The map isn’t available on the web app. Enter your address below, or use
        “Use my location”.
      </Text>
    </View>
  );
}

/** A sensible default region (Riyadh) when we have no coordinate yet. */
export const DEFAULT_REGION: Region = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
