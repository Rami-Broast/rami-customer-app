import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardTypeOptions,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '../motion';
import { useTheme } from '../theme/theme';
import { ChevronLeftIcon } from './icons';

// The logo artwork (gold mark on a maroon field).
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const LOGO = require('../../assets/logo.jpeg');
const LOGO_ASPECT = 902 / 821;

/**
 * The brand mark on a maroon tile.
 *
 * The logo JPEG carries its own maroon background, so it is placed on a maroon
 * rounded tile of the same colour — the artwork's field merges into the tile and
 * only the gold mark shows, giving a clean brand lockup on any screen background
 * (including the warm cream one, where the bare JPEG would read as a maroon box).
 */
export function BrandMark({ size = 96 }: { size?: number }): React.JSX.Element {
  const theme = useTheme();
  const pad = Math.round(size * 0.14);
  const imgW = size - pad * 2;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Rami Broast"
      style={[
        {
          width: size,
          height: size,
          borderRadius: theme.radius.xl,
          backgroundColor: '#752E2A',
          alignItems: 'center',
          justifyContent: 'center',
        },
        theme.elevation(2),
      ]}
    >
      <Image source={LOGO} resizeMode="contain" style={{ width: imgW, height: imgW / LOGO_ASPECT }} />
    </View>
  );
}

/** A labelled text input with a brand focus ring. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  autoFocus,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoFocus?: boolean;
  multiline?: boolean;
}): React.JSX.Element {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: theme.colors.textMuted, ...theme.type.label, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoFocus={autoFocus}
        multiline={multiline}
        style={{
          backgroundColor: theme.colors.surface,
          borderWidth: 1.5,
          borderColor: focused ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: 14,
          paddingVertical: 13,
          minHeight: multiline ? 88 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          fontSize: 16,
          color: theme.colors.text,
        }}
      />
    </View>
  );
}

/** A screen container: themed background + top safe-area padding + optional header. */
export function Screen({
  children,
  title,
  subtitle,
  onBack,
  right,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      {title !== undefined ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 6,
            paddingBottom: 12,
            gap: 10,
          }}
        >
          {onBack ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              hitSlop={8}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeftIcon size={22} color={theme.colors.text} />
            </PressableScale>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, ...theme.type.title }} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={{ color: theme.colors.textMuted, ...theme.type.caption, marginTop: 2 }} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** The primary call-to-action. Brand-filled, elevated, with a busy state. */
export function PrimaryButton({
  label,
  onPress,
  busy,
  disabled,
  leftIcon,
  style,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const theme = useTheme();
  const off = disabled || busy;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      disabled={off}
      onPress={onPress}
      style={[
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.pill,
          paddingVertical: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: off ? 0.55 : 1,
        },
        off ? {} : theme.elevation(2),
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        <>
          {leftIcon}
          <Text style={{ color: theme.colors.onPrimary, fontWeight: '800', fontSize: 16 }}>{label}</Text>
        </>
      )}
    </PressableScale>
  );
}

/** A secondary action: maroon outline on the surface, for the lesser of two choices. */
export function SecondaryButton({
  label,
  onPress,
  disabled,
  leftIcon,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          borderRadius: theme.radius.pill,
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {leftIcon}
      <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 16 }}>{label}</Text>
    </PressableScale>
  );
}

/** A low-emphasis inline text action (a link). */
export function LinkButton({
  label,
  onPress,
  leftIcon,
  color,
  style,
}: {
  label: string;
  onPress: () => void;
  leftIcon?: React.ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={6}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }, style]}
    >
      {leftIcon}
      <Text style={{ color: color ?? theme.colors.accent, fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </PressableScale>
  );
}

/** A surface card — soft elevation, hairline border, generous radius. */
export function Card({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: padded ? 16 : 0,
        },
        theme.elevation(1),
        style,
      ]}
    >
      {children}
    </View>
  );
}

export type PillTone = 'neutral' | 'brand' | 'gold' | 'success' | 'danger' | 'warning' | 'progress';

/** A small status/label pill: a tinted ground with its own text colour. */
export function Pill({
  label,
  tone = 'neutral',
  solid,
  style,
}: {
  label: string;
  tone?: PillTone;
  /** Filled (solid colour) rather than the default soft tint. */
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const theme = useTheme();
  const c = theme.colors;
  // In dark mode the status hues are already light, so a soft tint is just the
  // alt surface; in light mode they are medium-dark and get a pale hue wash.
  const isDark = theme.scheme === 'dark';
  const softStatus = (kind: 'success' | 'danger' | 'warning'): string =>
    isDark ? c.surfaceAlt : { success: '#E3F3E9', danger: '#FBE6E3', warning: '#FBEFD6' }[kind];

  const spec: Record<PillTone, { fg: string; soft: string; solidBg: string; solidFg: string }> = {
    neutral: { fg: c.textMuted, soft: c.surfaceAlt, solidBg: c.textMuted, solidFg: c.onPrimary },
    brand: { fg: c.primary, soft: c.primarySoft, solidBg: c.primary, solidFg: c.onPrimary },
    progress: { fg: c.primary, soft: c.primarySoft, solidBg: c.primary, solidFg: c.onPrimary },
    gold: { fg: c.onGold, soft: c.goldSoft, solidBg: c.gold, solidFg: c.onGold },
    success: { fg: c.success, soft: softStatus('success'), solidBg: c.success, solidFg: c.onPrimary },
    danger: { fg: c.danger, soft: softStatus('danger'), solidBg: c.danger, solidFg: c.onPrimary },
    warning: { fg: c.warning, soft: softStatus('warning'), solidBg: c.warning, solidFg: c.onPrimary },
  };
  const t = spec[tone];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          borderRadius: theme.radius.pill,
          paddingVertical: 4,
          paddingHorizontal: 11,
          backgroundColor: solid ? t.solidBg : t.soft,
        },
        style,
      ]}
    >
      <Text style={{ color: solid ? t.solidFg : t.fg, fontSize: 12, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

/** A left-aligned section heading used above a group of cards. */
export function SectionTitle({
  label,
  right,
  style,
}: {
  label: string;
  right?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <Text style={[{ color: theme.colors.text, ...theme.type.heading }, style]}>{label}</Text>
      {right}
    </View>
  );
}

/** The price shown on a gold pill — the one rationed brand highlight per card. */
export function PriceTag({ label, style }: { label: string; style?: StyleProp<ViewStyle> }): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.goldSoft,
          borderRadius: theme.radius.sm,
          paddingVertical: 3,
          paddingHorizontal: 8,
        },
        style,
      ]}
    >
      <Text style={{ color: theme.colors.onGold, fontWeight: '800', fontSize: 14 }}>{label}</Text>
    </View>
  );
}
