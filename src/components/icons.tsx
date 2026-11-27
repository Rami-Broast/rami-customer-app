/**
 * The app's icon set — small, inline, stroke-based SVGs.
 *
 * Why these live here rather than an icon font or an emoji: emoji render
 * differently on every platform (and some, like 🛒, carry their own colour), so
 * they cannot be tinted to the brand or sized predictably. A font pulls in a
 * binary asset and a licence. These are a dozen hand-drawn paths on a 24×24
 * grid that take a `color` and a `size`, so every glyph on every screen is the
 * same weight and the same brand colour, and tree-shakes to only what is used.
 *
 * All icons share one API: `{ size?, color?, strokeWidth? }`. `color` defaults
 * to `currentColor`-style inheritance is not available in RN SVG, so callers
 * pass the themed colour explicitly (usually `theme.colors.text` or `primary`).
 */

import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = '#2A1A14';
const DEFAULT_STROKE = 2;

/** Shared frame + stroke defaults so every glyph reads at the same weight. */
function Frame({
  size = DEFAULT_SIZE,
  children,
}: {
  size?: number;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

function strokeProps(color: string, strokeWidth: number) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function ChevronLeftIcon({ size, color = DEFAULT_COLOR, strokeWidth = 2.4 }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M15 5l-7 7 7 7" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function ChevronRightIcon({ size, color = DEFAULT_COLOR, strokeWidth = 2.4 }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M9 5l7 7-7 7" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function PlusIcon({ size, color = DEFAULT_COLOR, strokeWidth = 2.6 }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M12 5v14M5 12h14" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function MinusIcon({ size, color = DEFAULT_COLOR, strokeWidth = 2.6 }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M5 12h14" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function CheckIcon({ size, color = DEFAULT_COLOR, strokeWidth = 2.8 }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M20 6L9 17l-5-5" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function CartIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path
        d="M4 5h2l1.2 10.2a1.5 1.5 0 001.5 1.3h7.9a1.5 1.5 0 001.5-1.2L20 8H7"
        {...strokeProps(color, strokeWidth)}
      />
      <Circle cx={9.5} cy={20} r={1.4} fill={color} />
      <Circle cx={17.5} cy={20} r={1.4} fill={color} />
    </Frame>
  );
}

export function BagIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M6 8h12l-1 11a1.5 1.5 0 01-1.5 1.4H8.5A1.5 1.5 0 017 19L6 8z" {...strokeProps(color, strokeWidth)} />
      <Path d="M9 8V6.5a3 3 0 016 0V8" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function ReceiptIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M6 3h12v18l-2.2-1.4L13.6 21l-2.2-1.4L9.2 21 7 19.6 6 21V3z" {...strokeProps(color, strokeWidth)} />
      <Path d="M9 8h6M9 12h6" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function StorefrontIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M4 9.5L5.2 5h13.6L20 9.5" {...strokeProps(color, strokeWidth)} />
      <Path d="M4 9.5a2.2 2.2 0 004 0 2.2 2.2 0 004 0 2.2 2.2 0 004 0 2.2 2.2 0 004 0" {...strokeProps(color, strokeWidth)} />
      <Path d="M5.5 11.5V19h13v-7.5" {...strokeProps(color, strokeWidth)} />
      <Path d="M10 19v-4h4v4" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function PinIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" {...strokeProps(color, strokeWidth)} />
      <Circle cx={12} cy={10} r={2.4} {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function ClockIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Circle cx={12} cy={12} r={8} {...strokeProps(color, strokeWidth)} />
      <Path d="M12 8v4.2l3 1.8" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function CardIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Rect x={3} y={6} width={18} height={12} rx={2.4} {...strokeProps(color, strokeWidth)} />
      <Path d="M3 10h18M6.5 14.5h3" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function CashIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Rect x={3} y={7} width={18} height={10} rx={2} {...strokeProps(color, strokeWidth)} />
      <Circle cx={12} cy={12} r={2.4} {...strokeProps(color, strokeWidth)} />
      <Path d="M6 10v4M18 10v4" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function PhoneIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path
        d="M6.5 4h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a2 2 0 01-2.2 2A16 16 0 014.5 6.2 2 2 0 016.5 4z"
        {...strokeProps(color, strokeWidth)}
      />
    </Frame>
  );
}

export function UserIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Circle cx={12} cy={8} r={3.4} {...strokeProps(color, strokeWidth)} />
      <Path d="M5.5 20a6.5 6.5 0 0113 0" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function LogoutIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M14 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" {...strokeProps(color, strokeWidth)} />
      <Path d="M9 8l-4 4 4 4M5 12h10" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function TagIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M4 4h7l9 9-7 7-9-9V4z" {...strokeProps(color, strokeWidth)} />
      <Circle cx={8.5} cy={8.5} r={1.4} fill={color} />
    </Frame>
  );
}

export function BikeIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Circle cx={6} cy={17} r={3} {...strokeProps(color, strokeWidth)} />
      <Circle cx={18} cy={17} r={3} {...strokeProps(color, strokeWidth)} />
      <Path d="M6 17l4-7h5l2 7M10 10l-1-3H7m8 3h3" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function HomeIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M3 10.5 12 3l9 7.5" {...strokeProps(color, strokeWidth)} />
      <Path d="M5 9.5V20h14V9.5" {...strokeProps(color, strokeWidth)} />
      <Path d="M9.5 20v-5h5v5" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function SearchIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Circle cx={11} cy={11} r={7} {...strokeProps(color, strokeWidth)} />
      <Path d="m20 20-3.5-3.5" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

export function HeartIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE, filled = false }: IconProps & { filled?: boolean }): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path
        d="M12 20s-7-4.35-9.2-8.3C1.3 9 2.4 5.8 5.4 5.1 7.3 4.65 9 5.6 12 8c3-2.4 4.7-3.35 6.6-2.9 3 .7 4.1 3.9 2.6 6.6C19 15.65 12 20 12 20z"
        fill={filled ? color : 'none'}
        {...strokeProps(color, strokeWidth)}
      />
    </Frame>
  );
}

export function BellIcon({ size, color = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE }: IconProps): React.JSX.Element {
  return (
    <Frame size={size}>
      <Path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" {...strokeProps(color, strokeWidth)} />
      <Path d="M10 19a2 2 0 0 0 4 0" {...strokeProps(color, strokeWidth)} />
    </Frame>
  );
}

/** A stand-in "mada" badge (approximation — not the trademarked logo). */
export function MadaMark({ size = 40 }: { size?: number }): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size * 0.66,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DED7D0',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}
    >
      <Text style={{ fontSize: size * 0.28, fontWeight: '900', color: '#00AEEF' }}>ma</Text>
      <Text style={{ fontSize: size * 0.28, fontWeight: '900', color: '#84BD00' }}>da</Text>
    </View>
  );
}

/** A stand-in Apple Pay badge (approximation — cross-platform, not the trademarked mark). */
export function ApplePayMark({ size = 52 }: { size?: number }): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size * 0.6,
        borderRadius: 6,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 4,
      }}
    >
      <Svg width={size * 0.22} height={size * 0.28} viewBox="0 0 16 20" fill="none">
        <Path
          d="M13.5 15.2c-.3.7-.5 1-.9 1.6-.6.9-1.4 2-2.4 2-.9 0-1.1-.6-2.3-.6s-1.5.6-2.3.6c-1 0-1.8-1-2.4-1.9C-.6 14.1-.8 10.1 1 7.9c.8-1.1 2-1.7 3.1-1.7 1 0 1.7.6 2.6.6.8 0 1.3-.6 2.5-.6 1 0 2 .5 2.8 1.4-2.5 1.3-2.1 4.8.5 5.6zM9.3 4.3C9.8 3.7 10.1 2.9 10 2c-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.3-.8 2.1.9.1 1.8-.4 2.3-1z"
          fill="#FFFFFF"
        />
      </Svg>
      <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: size * 0.26, marginLeft: 2 }}>Pay</Text>
    </View>
  );
}
