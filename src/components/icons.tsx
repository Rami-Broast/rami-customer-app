/**
 * A small, dependency-light icon set drawn with react-native-svg.
 *
 * Line icons (the tab bar, list rows) take a `color` and `size` and render as
 * monochrome strokes so they read at any tint — active brand maroon, inactive
 * muted. Keeping them here as inline SVG avoids pulling a whole icon font for a
 * dozen glyphs, and every icon looks identical on iOS and Android (emoji do
 * not).
 *
 * The payment marks (card / mada / Apple Pay) are deliberately *approximations*
 * of the brands' real logos — we do not ship the trademarked assets — but they
 * are recognisable and on-shape for the demo. Swap in the licensed marks when
 * they are available.
 */

import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  /** Some icons render a filled variant (e.g. a favourited heart). */
  filled?: boolean;
  strokeWidth?: number;
}

const DEFAULTS = { size: 24, color: '#1E1A1C', strokeWidth: 2 };

function base(p: IconProps): { size: number; color: string; sw: number } {
  return { size: p.size ?? DEFAULTS.size, color: p.color ?? DEFAULTS.color, sw: p.strokeWidth ?? DEFAULTS.strokeWidth };
}

export function HomeIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5 12 3l9 7.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 9.5V20h14V9.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {p.filled ? <Path d="M5 9.5V20h14V9.5L12 4z" fill={color} /> : null}
      <Path d="M9.5 20v-5h5v5" stroke={p.filled ? '#FFFFFF' : color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={sw} />
      <Path d="m20 20-3.5-3.5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function ReceiptIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h12v18l-2.2-1.4L13.6 21 12 19.6 10.4 21 8.2 19.6 6 21z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      <Path d="M9 8h6M9 12h6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function TagIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h7l9 9-7 7-9-9V4z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      <Circle cx={8.5} cy={8.5} r={1.4} fill={color} />
    </Svg>
  );
}

export function UserIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={sw} />
      <Path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function HeartIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={p.filled ? color : 'none'}>
      <Path
        d="M12 20s-7-4.35-9.2-8.3C1.3 9 2.4 5.8 5.4 5.1 7.3 4.65 9 5.6 12 8c3-2.4 4.7-3.35 6.6-2.9 3 .7 4.1 3.9 2.6 6.6C19 15.65 12 20 12 20z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BellIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRightIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m9 5 7 7-7 7" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ClockIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={sw} />
      <Path d="M12 7v5l3.5 2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PinIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={sw} />
    </Svg>
  );
}

export function PhoneIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L19 12l4 1.5V17a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 0-2z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlusIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={sw + 0.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps): React.JSX.Element {
  const { size, color, sw } = base(p);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m5 12.5 4.5 4.5L19 7" stroke={color} strokeWidth={sw + 0.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** A credit/debit card mark. */
export function CardMark({ size = 36, color = '#1E1A1C' }: { size?: number; color?: string }): React.JSX.Element {
  const h = size * 0.72;
  return (
    <Svg width={size} height={h} viewBox="0 0 36 26" fill="none">
      <Rect x={1.5} y={2.5} width={33} height={21} rx={4} stroke={color} strokeWidth={2} />
      <Rect x={1.5} y={7} width={33} height={4} fill={color} />
      <Rect x={6} y={16} width={10} height={3} rx={1.5} fill={color} />
    </Svg>
  );
}

/** A stand-in "mada" badge (approximation — not the trademarked logo). */
export function MadaMark({ size = 36 }: { size?: number }): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size * 0.72,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DED7D0',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}
    >
      <Text style={{ fontSize: size * 0.3, fontWeight: '900', color: '#00AEEF' }}>ma</Text>
      <Text style={{ fontSize: size * 0.3, fontWeight: '900', color: '#84BD00' }}>da</Text>
    </View>
  );
}

/** A stand-in Apple Pay badge (approximation — cross-platform, not the trademarked mark). */
export function ApplePayMark({ size = 48 }: { size?: number }): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size * 0.62,
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

/** A cash/wallet mark for cash-on-delivery. */
export function CashMark({ size = 36, color = '#1E1A1C' }: { size?: number; color?: string }): React.JSX.Element {
  const h = size * 0.72;
  return (
    <Svg width={size} height={h} viewBox="0 0 36 26" fill="none">
      <Rect x={1.5} y={4} width={33} height={18} rx={3} stroke={color} strokeWidth={2} />
      <Circle cx={18} cy={13} r={4} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
