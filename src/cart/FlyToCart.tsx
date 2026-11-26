import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useMotion } from '../motion/MotionProvider';
import { PressableScale } from '../motion';
import { useTheme } from '../theme/theme';

/**
 * A small "fly to cart" flourish: tapping add sends a token from the product to
 * the cart icon, which then pops (the badge already animates on count change).
 *
 * It is deliberately a provider + overlay rather than per-screen state: the
 * flying token must render above the header (where the cart icon lives) and the
 * nav, so it lives once at the app root. Positions are read with
 * `measureInWindow` at tap time, so it follows whatever layout the screen has.
 *
 * Accessibility: under reduced motion nothing flies — the add still happens and
 * the badge updates. The overlay never captures touches (`pointerEvents none`),
 * so it can never swallow a tap, and a missing cart target simply means no
 * flourish, never a broken add.
 */
interface Flight {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  uri?: string | null;
}

type Measurable = { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null;

interface FlyToCartValue {
  registerCartTarget: (node: Measurable) => void;
  fly: (source: Measurable, uri?: string | null) => void;
}

const FlyToCartContext = createContext<FlyToCartValue | null>(null);

export function FlyToCartProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const target = useRef<Measurable>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const nextId = useRef(0);

  const registerCartTarget = useCallback((node: Measurable) => {
    target.current = node;
  }, []);

  const fly = useCallback((source: Measurable, uri?: string | null) => {
    const t = target.current;
    if (!source || !t) {
      return;
    }
    // Two async measures; if either fails to fire we simply skip the flourish.
    source.measureInWindow((sx, sy, sw, sh) => {
      t.measureInWindow((tx, ty, tw, th) => {
        const id = nextId.current++;
        setFlights((f) => [
          ...f,
          { id, startX: sx + sw / 2, startY: sy + sh / 2, endX: tx + tw / 2, endY: ty + th / 2, size: 30, uri },
        ]);
      });
    });
  }, []);

  const remove = useCallback((id: number) => {
    setFlights((f) => f.filter((x) => x.id !== id));
  }, []);

  return (
    <FlyToCartContext.Provider value={{ registerCartTarget, fly }}>
      {children}
      {flights.map((flight) => (
        <Flight key={flight.id} flight={flight} onDone={remove} />
      ))}
    </FlyToCartContext.Provider>
  );
}

function Flight({ flight, onDone }: { flight: Flight; onDone: (id: number) => void }): React.JSX.Element | null {
  const theme = useTheme();
  const { reduceMotion } = useMotion();
  const p = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      onDone(flight.id);
      return;
    }
    p.value = withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(onDone)(flight.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dx = flight.endX - flight.startX;
  const dy = flight.endY - flight.startY;

  const style = useAnimatedStyle(() => {
    const t = p.value;
    // A gentle upward arc so the token lifts off and settles into the cart.
    const arc = -70 * Math.sin(Math.PI * t);
    return {
      transform: [{ translateX: dx * t }, { translateY: dy * t + arc }, { scale: 1 - 0.55 * t }],
      opacity: t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.15),
    };
  });

  if (reduceMotion) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: flight.startX - flight.size / 2,
          top: flight.startY - flight.size / 2,
          width: flight.size,
          height: flight.size,
          borderRadius: flight.size / 2,
          overflow: 'hidden',
          backgroundColor: theme.colors.primary,
          zIndex: 3000,
        },
        style,
      ]}
    >
      {flight.uri ? (
        <Image source={{ uri: flight.uri }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      ) : null}
    </Animated.View>
  );
}

export function useFlyToCart(): FlyToCartValue {
  const ctx = useContext(FlyToCartContext);
  // Non-throwing: a screen without the provider (e.g. an isolated test) still
  // works — add buttons just don't animate.
  return ctx ?? { registerCartTarget: () => {}, fly: () => {} };
}

/**
 * An add button that launches the fly-to-cart token from its own position.
 * Wraps the tappable in a measured view so the flight starts exactly here.
 */
export function AddToCartButton({
  onAdd,
  imageUri,
  accessibilityLabel,
  children,
  style,
}: {
  onAdd: () => void;
  imageUri?: string | null;
  accessibilityLabel: string;
  children: React.ReactNode;
  style?: React.ComponentProps<typeof View>['style'];
}): React.JSX.Element {
  const { fly } = useFlyToCart();
  const ref = useRef<View>(null);
  return (
    <View ref={ref} collapsable={false}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => {
          fly(ref.current, imageUri);
          onAdd();
        }}
        style={style}
      >
        {children}
      </PressableScale>
    </View>
  );
}
