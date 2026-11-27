import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/auth/AuthProvider';
import { BranchProvider } from './src/branch/BranchProvider';
import { CartProvider } from './src/cart/CartProvider';
import { FlyToCartProvider } from './src/cart/FlyToCart';
import { FavoritesProvider } from './src/favorites/FavoritesProvider';
import { OrderModeProvider } from './src/order/OrderModeProvider';
import { MotionProvider } from './src/motion';
import { LaunchScreen } from './src/launch/LaunchScreen';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * App root.
 *
 * Providers nest in the order they must: gesture handler (top, for
 * gesture-driven animation), safe-area, motion (resolves reduce-motion once),
 * auth (owns the session + API client), cart. The launch screen brands the
 * first moment, then hands off to the navigator, which shows the OTP flow when
 * signed out and the ordering flow when signed in.
 */
export default function App(): React.JSX.Element {
  const [launched, setLaunched] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MotionProvider>
          <AuthProvider>
            <BranchProvider>
              <OrderModeProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <FlyToCartProvider>
                      <StatusBar style="auto" />
                      <RootNavigator />
                      {!launched ? <LaunchScreen onFinish={() => setLaunched(true)} /> : null}
                    </FlyToCartProvider>
                  </CartProvider>
                </FavoritesProvider>
              </OrderModeProvider>
            </BranchProvider>
          </AuthProvider>
        </MotionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
