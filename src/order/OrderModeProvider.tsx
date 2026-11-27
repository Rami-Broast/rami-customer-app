/**
 * The customer's pickup/delivery choice, shared app-wide.
 *
 * The home dashboard shows a Delivery/Pickup toggle, and the choice has to
 * reach checkout (which still lets you switch). Keeping it here — rather than
 * threading it through navigation — is what lets the toggle on Home decide the
 * order type the cart hands to checkout. Persisted best-effort so the app
 * reopens on the mode you last used.
 */

import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ORDER_TYPE, OrderType } from '../types/backend';

const KEY = 'order_mode';

interface OrderModeValue {
  mode: OrderType;
  setMode: (mode: OrderType) => void;
}

const OrderModeContext = createContext<OrderModeValue | null>(null);

export function OrderModeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [mode, setModeState] = useState<OrderType>(ORDER_TYPE.PICKUP);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((v) => {
        if (v === ORDER_TYPE.DELIVERY || v === ORDER_TYPE.PICKUP) {
          setModeState(v);
        }
      })
      .catch(() => {});
  }, []);

  const value = useMemo<OrderModeValue>(
    () => ({
      mode,
      setMode: (m: OrderType) => {
        setModeState(m);
        SecureStore.setItemAsync(KEY, m).catch(() => {});
      },
    }),
    [mode],
  );

  return <OrderModeContext.Provider value={value}>{children}</OrderModeContext.Provider>;
}

export function useOrderMode(): OrderModeValue {
  const ctx = useContext(OrderModeContext);
  if (!ctx) {
    throw new Error('useOrderMode must be used within OrderModeProvider');
  }
  return ctx;
}
