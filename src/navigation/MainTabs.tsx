import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { HomeIcon, ReceiptIcon, SearchIcon, TagIcon, UserIcon } from '../components/icons';
import { AccountScreen } from '../screens/AccountScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OffersScreen } from '../screens/OffersScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { MainTabParamList } from './types';
import { useTheme } from '../theme/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** The five bottom tabs: Home, Search, Orders, Offers, Account. */
export function MainTabs(): React.JSX.Element {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 86,
          paddingBottom: 26,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} /> }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: ({ color }) => <SearchIcon color={color} size={24} /> }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: ({ color }) => <ReceiptIcon color={color} size={24} /> }} />
      <Tab.Screen name="Offers" component={OffersScreen} options={{ tabBarIcon: ({ color }) => <TagIcon color={color} size={24} /> }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarIcon: ({ color }) => <UserIcon color={color} size={24} /> }} />
    </Tab.Navigator>
  );
}
