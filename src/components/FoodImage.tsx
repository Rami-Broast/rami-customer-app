/**
 * A product image that resolves the stored path and degrades gracefully.
 *
 * Many products have no photo (`imageUrl` null) and an uploaded path needs
 * resolving against the API host — both are handled here, so no screen renders
 * a broken-image box. When there is no usable image it shows a branded gold
 * tile with the dish's initial, which reads as intentional rather than missing.
 */

import React, { useState } from 'react';
import { Image, StyleProp, Text, View, ViewStyle } from 'react-native';

import { API_BASE_URL } from '../api/config';
import { resolveImageUrl } from '../util/imageUrl';
import { useTheme } from '../theme/theme';

export function FoodImage({
  uri,
  name,
  radius,
  style,
}: {
  uri: string | null | undefined;
  name?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(uri, API_BASE_URL);
  const r = radius ?? theme.radius.md;

  if (!resolved || failed) {
    const initial = (name ?? '').trim().charAt(0).toUpperCase() || '🍗';
    return (
      <View
        style={[
          { backgroundColor: theme.colors.goldSoft, borderRadius: r, alignItems: 'center', justifyContent: 'center' },
          style,
        ]}
      >
        <Text style={{ fontSize: 26, fontWeight: '900', color: theme.colors.gold }}>{initial}</Text>
      </View>
    );
  }

  return (
    <View style={[{ borderRadius: r, overflow: 'hidden', backgroundColor: theme.colors.surfaceAlt }, style]}>
      <Image
        source={{ uri: resolved }}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );
}
