import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { ChevronRightIcon } from '../components/icons';
import { PressableScale, Toast } from '../motion';
import { TabScreenProps } from '../navigation/types';
import { useTheme } from '../theme/theme';

interface Row {
  key: string;
  icon: string;
  label: string;
  onPress: () => void;
}

/** The account tab: profile, activity, preferences, support — matching the brief. */
export function AccountScreen({ navigation }: TabScreenProps<'Account'>): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [phone, setPhone] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('customer_phone').then(setPhone).catch(() => {});
  }, []);

  const soon = (what: string) => () => setToast(`${what} is coming soon.`);

  const doSignOut = (): void => {
    SecureStore.deleteItemAsync('customer_phone').catch(() => {});
    void signOut();
  };

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'Orders & activity',
      rows: [
        { key: 'orders', icon: '🧾', label: 'My orders', onPress: () => navigation.navigate('Orders') },
        { key: 'notifs', icon: '🔔', label: 'Notifications', onPress: () => navigation.navigate('Orders') },
        { key: 'favs', icon: '❤️', label: 'Favorites', onPress: () => navigation.navigate('Favorites') },
        { key: 'rewards', icon: '⭐', label: 'Rewards', onPress: soon('Rewards') },
        { key: 'offers', icon: '🎁', label: 'Offers & coupons', onPress: () => navigation.navigate('Offers') },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { key: 'addr', icon: '📍', label: 'Saved addresses', onPress: () => navigation.navigate('AddAddress') },
        { key: 'pay', icon: '💳', label: 'Payment methods', onPress: soon('Saved payment methods') },
        { key: 'notifset', icon: '🔔', label: 'Notification settings', onPress: soon('Notification settings') },
      ],
    },
    {
      title: 'Support & legal',
      rows: [
        { key: 'help', icon: '💬', label: 'Help & support', onPress: soon('Help & support') },
        { key: 'privacy', icon: '🔒', label: 'Privacy policy', onPress: soon('Privacy policy') },
        { key: 'terms', icon: '📄', label: 'Terms of service', onPress: soon('Terms of service') },
      ],
    },
  ];

  const rowView = (row: Row, last: boolean) => (
    <PressableScale
      key={row.key}
      accessibilityRole="button"
      accessibilityLabel={row.label}
      onPress={row.onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 20, width: 26, textAlign: 'center' }}>{row.icon}</Text>
      <Text style={{ flex: 1, color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>{row.label}</Text>
      <ChevronRightIcon size={20} color={theme.colors.textMuted} />
    </PressableScale>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <Toast visible={!!toast} message={toast ?? ''} tone="neutral" onHide={() => setToast(null)} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '900' }}>Account</Text>

        {/* Profile header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>🙂</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 20 }}>My account</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>{phone ?? 'Signed in'}</Text>
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 }}>
              {section.title}
            </Text>
            <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
              {section.rows.map((row, i) => rowView(row, i === section.rows.length - 1))}
            </View>
          </View>
        ))}

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={doSignOut}
          style={{ marginTop: 4, paddingVertical: 16, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', backgroundColor: theme.colors.surface }}
        >
          <Text style={{ color: theme.colors.danger, fontWeight: '800', fontSize: 16 }}>Sign out</Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}
