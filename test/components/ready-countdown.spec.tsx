import { render } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Order } from '../../src/api/types';
import { ReadyCountdown } from '../../src/features/order/ReadyCountdown';
import { MotionProvider } from '../../src/motion';
import { ORDER_STATUS, ORDER_TYPE, OrderStatus } from '../../src/types/backend';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <MotionProvider>{ui}</MotionProvider>
    </SafeAreaProvider>,
  );

// A minimal order; override per case. prepTimeMinutes lives on branch.settings.
function makeOrder(overrides: Partial<Order> & { status: OrderStatus }): Order {
  return {
    id: 'o1',
    orderNumber: '1000001',
    branchId: 'b1',
    type: ORDER_TYPE.PICKUP,
    paymentStatus: 'PENDING' as Order['paymentStatus'],
    subtotalMinor: 5000,
    discountMinor: 0,
    deliveryFeeMinor: 0,
    vatMinor: 652,
    totalMinor: 5000,
    items: [],
    placedAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    confirmedAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    preparingAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    branch: { settings: { prepTimeMinutes: 20 } },
    ...overrides,
  };
}

describe('ReadyCountdown (mount)', () => {
  it('renders a live countdown while preparing', () => {
    const { getByText } = wrap(<ReadyCountdown order={makeOrder({ status: ORDER_STATUS.PREPARING })} />);
    expect(getByText('Ready to collect in')).toBeTruthy();
    // 20 min window, ~2 min elapsed -> 18 minutes shown.
    expect(getByText('18')).toBeTruthy();
  });

  it('words a delivery order as leaving the kitchen, not arriving', () => {
    const { getByText } = wrap(
      <ReadyCountdown order={makeOrder({ status: ORDER_STATUS.PREPARING, type: ORDER_TYPE.DELIVERY })} />,
    );
    expect(getByText('Ready to leave the kitchen in')).toBeTruthy();
  });

  it('shows the ready state once the order is READY', () => {
    const { getByText } = wrap(<ReadyCountdown order={makeOrder({ status: ORDER_STATUS.READY })} />);
    expect(getByText('Ready!')).toBeTruthy();
  });

  const SENTINEL = /An estimate from the branch/;

  it('renders nothing (no fabricated estimate) when the branch has no prep time', () => {
    const { queryByText } = wrap(
      <ReadyCountdown
        order={makeOrder({ status: ORDER_STATUS.PREPARING, branch: { settings: { prepTimeMinutes: null } } })}
      />,
    );
    expect(queryByText(SENTINEL)).toBeNull();
  });

  it('renders nothing before the order is accepted', () => {
    const { queryByText } = wrap(<ReadyCountdown order={makeOrder({ status: ORDER_STATUS.PENDING_PAYMENT })} />);
    expect(queryByText(SENTINEL)).toBeNull();
  });

  it('renders nothing once out for delivery', () => {
    const { queryByText } = wrap(<ReadyCountdown order={makeOrder({ status: ORDER_STATUS.OUT_FOR_DELIVERY })} />);
    expect(queryByText(SENTINEL)).toBeNull();
  });
});
