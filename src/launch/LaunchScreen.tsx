import React, { useEffect } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useMotion } from '../motion';
import { useTheme } from '../theme/theme';

// The Rami Broast logo. 902×821 → aspect ratio ~1.10.
// React Native resolves image assets through require(); this is the idiomatic form.
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const LOGO = require('../../assets/logo.jpeg');
const LOGO_ASPECT = 902 / 821;

/** How long the fully-revealed logo is held before the screen hands off, in ms. */
const HOLD_MS = 850;

export interface LaunchScreenProps {
  /** Called once the launch animation has finished and the app can be revealed. */
  onFinish: () => void;
}

/**
 * The app-launch screen.
 *
 * Purpose: brand the first moment and cover the app's initial mount, then get
 * out of the way quickly. The logo fades and springs in gently, holds briefly,
 * and the whole screen fades out to reveal the app — a single, short sequence,
 * never a loop.
 *
 * It sits on the fixed brand maroon (the same field the logo artwork is on, so
 * the JPEG's background merges into the screen and only the gold mark floats),
 * matching the native splash's `backgroundColor`. Launch screens are brand-fixed
 * by convention rather than following the OS theme, so this reads identically in
 * light and dark mode; the hand-off underline is gold, the one colour that shows
 * on maroon.
 *
 * Under reduced motion the logo simply appears (no fade, no scale), is held for
 * the same brief moment, and the screen is dismissed instantly. The hold is
 * timing, not motion, so the brand is still seen. Whatever happens, `onFinish`
 * is always called, so the app can never get stuck behind the launch screen.
 */
export function LaunchScreen({ onFinish }: LaunchScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { timing, spring, reduceMotion } = useMotion();
  const { width } = useWindowDimensions();

  const logoWidth = Math.min(width * 0.72, 420);
  const logoHeight = logoWidth / LOGO_ASPECT;

  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const overlay = useSharedValue(1);

  useEffect(() => {
    enter.value = reduceMotion ? 1 : withSpring(1, spring('emphasized'));
    overlay.value = withDelay(
      HOLD_MS,
      withTiming(0, timing('normal', 'exit'), (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
    // Runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.94 + enter.value * 0.06 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.launch,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        },
        overlayStyle,
      ]}
    >
      <Animated.View style={logoStyle}>
        <Image
          source={LOGO}
          resizeMode="contain"
          style={{ width: logoWidth, height: logoHeight }}
          accessible
          accessibilityRole="image"
          accessibilityLabel="Rami Broast — for fast food"
        />
      </Animated.View>
      {/* A slim brand underline that draws in with the logo. */}
      <Animated.View style={logoStyle}>
        <View
          style={{
            marginTop: 16,
            width: logoWidth * 0.36,
            height: 3,
            borderRadius: 2,
            backgroundColor: theme.colors.gold,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}
