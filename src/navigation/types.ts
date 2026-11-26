import { OrderType } from '../types/backend';

/** The app's screens and their params. One source of truth for navigation typing. */
export type RootStackParamList = {
  // Auth flow
  Phone: undefined;
  Otp: { phone: string };
  // Main flow — Menu is home; the branch comes from BranchProvider, so params
  // are optional (an explicit branch may still be passed to override).
  Menu: { branchId?: string; branchName?: string } | undefined;
  Cart: undefined;
  Checkout: { type: OrderType };
  AddAddress: undefined;
  PaymentProcessing: { orderId: string };
  OrderTracking: { orderId: string };
  Orders: undefined;
};
