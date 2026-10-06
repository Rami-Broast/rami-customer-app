/**
 * The Rami Broast design-token layer.
 *
 * Everything visual in the app renders against these tokens — colours, radii,
 * spacing, elevation and a small type ramp. There is one source of truth so a
 * brand change is a change here, not across forty screens.
 *
 * ## The brand is two colours, taken from the logo
 *
 * The logo is a gold wordmark/monogram on a deep maroon field. Sampling the
 * artwork gives exactly two brand colours plus a shadow tone:
 *
 *   - **maroon**  `#752E2A` — the dominant brand colour (the logo's field)
 *   - **gold**    `#F6D456` — the mark itself; the one accent
 *   - gold-deep   `#CCA548` — the gold's own shading in the logo
 *
 * That is the whole palette. An earlier version of this file invented a
 * "shawarma orange" and a "for-fast-food blue" that appear nowhere in the
 * artwork; they are gone. Maroon leads, gold is rationed to the one thing on a
 * screen that should be looked at (a price, a selected chip, a badge), and
 * everything else is a warm neutral so food and order text are what carry the
 * colour — the same discipline the POS palette settled on.
 *
 * Gold on a light background fails contrast for text, so gold is used as a
 * *surface* (chips, badges, the price pill) with maroon text on it, never as
 * link text on white. Interactive text is maroon.
 */

import { useColorScheme } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    textMuted: string;
    /** Brand primary — the Rami Broast maroon from the logo. */
    primary: string;
    /** A deeper maroon for pressed states and maroon-on-maroon edges. */
    primaryDeep: string;
    /** A pale maroon wash for selected rows and hero backgrounds (light). */
    primarySoft: string;
    /** Text/icons that sit on a filled primary surface. */
    onPrimary: string;
    /** Brand accent — the gold of the logo mark. The one rationed highlight. */
    secondary: string;
    /** The gold, named plainly for new call sites. Same value as `secondary`. */
    gold: string;
    /** Text/icons that sit on a gold surface (maroon). */
    onGold: string;
    /** A pale gold wash for highlight chips and callouts. */
    goldSoft: string;
    /** Interactive text (links, inline actions). Maroon, clearly tappable. */
    accent: string;
    /** Text/icons on a maroon (dark brand) surface — a warm off-white. */
    onDark: string;
    success: string;
    danger: string;
    warning: string;
    progress: string;
    skeleton: string;
    skeletonHighlight: string;
    backdrop: string;
    /** Colour cast of elevation shadows. */
    shadow: string;
    /** Fixed brand background for the launch screen (theme-independent). */
    launch: string;
  };
  radius: { sm: number; md: number; lg: number; xl: number; pill: number };
  spacing: (n: number) => number;
  /** A small type ramp — sizes and the line-heights that go with them. */
  type: {
    display: TextStyle;
    title: TextStyle;
    heading: TextStyle;
    body: TextStyle;
    label: TextStyle;
    caption: TextStyle;
  };
  /** A soft, warm elevation shadow at four steps (0 = flat). */
  elevation: (level: 0 | 1 | 2 | 3) => ViewStyle;
}

// Sampled from the logo artwork.
const MAROON = '#752E2A';
const MAROON_DEEP = '#5E2422';
const GOLD = '#F6D456';
const CREAM = '#FFF7EA';

const light: Theme['colors'] = {
  background: '#FCF6EC',
  surface: '#FFFFFF',
  surfaceAlt: '#F6EEDF',
  border: '#EADECB',
  text: '#2A1A14',
  textMuted: '#8A756A',
  primary: MAROON,
  primaryDeep: MAROON_DEEP,
  primarySoft: '#F3E4DF',
  onPrimary: CREAM,
  secondary: GOLD,
  gold: GOLD,
  onGold: MAROON,
  goldSoft: '#FCEFC2',
  accent: '#9A3B33',
  onDark: CREAM,
  success: '#2E9E5B',
  danger: '#CE4034',
  warning: '#DE9526',
  progress: MAROON,
  skeleton: '#F0E7D6',
  skeletonHighlight: '#F8F2E6',
  backdrop: 'rgba(42,26,20,0.5)',
  shadow: '#5E2422',
  launch: MAROON,
};

const dark: Theme['colors'] = {
  background: '#17120F',
  surface: '#211A16',
  surfaceAlt: '#2C231D',
  border: '#3A2E26',
  text: '#F6EEE6',
  textMuted: '#B6A596',
  primary: '#C8695D',
  primaryDeep: '#9A4A41',
  primarySoft: '#33211D',
  onPrimary: '#FFFFFF',
  secondary: GOLD,
  gold: GOLD,
  onGold: '#2A1208',
  goldSoft: '#3B3016',
  accent: '#F0B7A8',
  onDark: CREAM,
  success: '#3CC06E',
  danger: '#F0655B',
  warning: '#E6AE4A',
  progress: '#C8695D',
  skeleton: '#2C231D',
  skeletonHighlight: '#352A22',
  backdrop: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
  launch: MAROON,
};

const TYPE: Theme['type'] = {
  display: { fontSize: 30, fontWeight: '800', lineHeight: 36 },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heading: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
};

function makeElevation(shadow: string): Theme['elevation'] {
  return (level) => {
    if (level === 0) {
      return {};
    }
    const map = {
      1: { radius: 8, opacity: 0.1, dy: 2, el: 2 },
      2: { radius: 16, opacity: 0.13, dy: 6, el: 5 },
      3: { radius: 28, opacity: 0.17, dy: 12, el: 10 },
    } as const;
    const s = map[level];
    return {
      shadowColor: shadow,
      shadowOpacity: s.opacity,
      shadowRadius: s.radius,
      shadowOffset: { width: 0, height: s.dy },
      elevation: s.el,
    };
  };
}

const BASE = {
  radius: { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 },
  spacing: (n: number) => n * 4,
  type: TYPE,
};

export function buildTheme(scheme: 'light' | 'dark'): Theme {
  const colors = scheme === 'dark' ? dark : light;
  return { scheme, colors, ...BASE, elevation: makeElevation(colors.shadow) };
}

/** The active theme, following the OS light/dark setting. */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return buildTheme(scheme === 'dark' ? 'dark' : 'light');
}
