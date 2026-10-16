import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Order } from '../../api/types';
import { CheckIcon } from '../../components/icons';
import { useReducedMotion } from '../../motion';
import { useTheme } from '../../theme/theme';
import { isDeliveryOrder, readyTimeState } from './ready-time';

const SIZE = 184;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * "Your order will be ready in ~X min", as a depleting ring with a gentle
 * breathing pulse. Shown on the tracking screen while the kitchen is working.
 *
 * It renders nothing unless there is an honest estimate to show (see
 * `readyTimeState`): no prep time, not yet accepted, or past the kitchen's part
 * all return null and leave the timeline to tell the story. The estimate is
 * phrased as "ready to collect / leave", never as an arrival time — there is no
 * travel ETA to promise.
 *
 * Ticks once a second while counting so the ring and the minutes stay live; the
 * breathing pulse is decorative and collapses to static under reduced motion.
 */
export function ReadyCountdown({ order }: { order: Order }): React.JSX.Element | null {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [nowMs, setNowMs] = useState(() => Date.now());

  const prepTimeMinutes = order.branch?.settings?.prepTimeMinutes ?? null;
  const state = readyTimeState({
    status: order.status,
    type: order.type,
    placedAt: order.placedAt,
    confirmedAt: order.confirmedAt,
    preparingAt: order.preparingAt,
    prepTimeMinutes,
    nowMs,
  });

  const live = state.kind === 'counting' || state.kind === 'imminent';

  // Tick every second only while a live countdown is on screen.
  useEffect(() => {
    if (!live) {
      return;
    }
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live]);

  // Breathing halo — a decorative pulse while cooking, static under reduced motion.
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (!live || reduceMotion) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(pulse);
  }, [live, reduceMotion, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.16,
    transform: [{ scale: 1 + pulse.value * 0.08 }],
  }));

  if (state.kind === 'unknown' || state.kind === 'done') {
    return null;
  }

  const delivery = isDeliveryOrder(order.type);
  const isReady = state.kind === 'ready';
  const ringColor = isReady ? theme.colors.success : theme.colors.primary;
  // Elapsed fraction fills the ring; a ready/imminent ring is full.
  const progress = state.kind === 'counting' ? state.progress : 1;
  const dashoffset = CIRCUMFERENCE * (1 - progress);

  const heading = isReady
    ? delivery
      ? 'Ready — on its way soon'
      : 'Ready to collect'
    : delivery
      ? 'Ready to leave the kitchen in'
      : 'Ready to collect in';

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={
        state.kind === 'counting'
          ? `${heading} about ${state.remainingMinutes} ${state.remainingMinutes === 1 ? 'minute' : 'minutes'}`
          : state.kind === 'imminent'
            ? 'Your order will be ready any moment now'
            : heading
      }
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 24,
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Text style={{ color: theme.colors.textMuted, fontWeight: '700', fontSize: 14 }}>{heading}</Text>

      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        {/* Breathing halo behind the ring. */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: SIZE - 8,
              height: SIZE - 8,
              borderRadius: (SIZE - 8) / 2,
              backgroundColor: ringColor,
            },
            haloStyle,
          ]}
        />
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={theme.colors.border} strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={ringColor}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            // Start the arc at 12 o'clock and sweep clockwise.
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>

        {/* Center content */}
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
          {isReady ? (
            <>
              <CheckIcon size={44} color={theme.colors.success} />
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 18, marginTop: 4 }}>Ready!</Text>
            </>
          ) : state.kind === 'imminent' ? (
            <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 20, textAlign: 'center' }}>
              Any{'\n'}moment
            </Text>
          ) : (
            <>
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 48, lineHeight: 52 }}>
                {state.remainingMinutes}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontWeight: '700', fontSize: 15, marginTop: -2 }}>
                {state.remainingMinutes === 1 ? 'minute' : 'minutes'}
              </Text>
            </>
          )}
        </View>
      </View>

      <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', paddingHorizontal: 16 }}>
        An estimate from the branch — we’ll update it as your order moves.
      </Text>
    </View>
  );
}
