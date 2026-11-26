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
