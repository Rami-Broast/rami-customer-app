import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OrderType } from '../types/backend';

/** The bottom tabs shown after sign-in. */
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Orders: undefined;
  Offers: undefined;
  Account: undefined;
};

/** The app's stack screens and their params. One source of truth for typing. */
export type RootStackParamList = {
  // Auth flow
  Phone: undefined;
  Otp: { phone: string };
  // Main flow
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  BranchPicker: undefined;
  Menu: { branchId: string; branchName: string };
  Cart: undefined;
  Checkout: { type: OrderType; couponCode?: string; notes?: string };
  AddAddress: undefined;
  Favorites: undefined;
  PaymentProcessing: { orderId: string };
  OrderTracking: { orderId: string };
};

/** Props for a tab screen that can also push onto the root stack. */
export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
