import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  BrandMark,
  Card,
  LinkButton,
  Pill,
  PillTone,
  PriceTag,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  TextField,
} from '../../src/components/ui';
import {
  BagIcon,
  BikeIcon,
  CardIcon,
  CartIcon,
  CashIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  LogoutIcon,
  MinusIcon,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  ReceiptIcon,
  StorefrontIcon,
  TagIcon,
  UserIcon,
} from '../../src/components/icons';
import { MotionProvider } from '../../src/motion';

// A fixed frame so SafeAreaProvider yields insets without a native measure pass.
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

describe('UI kit (mount)', () => {
  it('mounts the brand mark and the Screen chrome (with and without a back button)', () => {
    expect(() => wrap(<BrandMark />)).not.toThrow();
    const withHeader = wrap(
      <Screen title="Rami Broast" subtitle="Choose a branch" onBack={() => undefined} right={<Text>R</Text>}>
        <Text>body</Text>
      </Screen>,
    );
    expect(withHeader.getByText('Rami Broast')).toBeTruthy();
    expect(withHeader.getByText('Choose a branch')).toBeTruthy();
    expect(() =>
      wrap(
        <Screen>
          <Text>no header</Text>
        </Screen>,
      ),
    ).not.toThrow();
  });

  it('mounts all button variants and a text field', () => {
    expect(() =>
      wrap(
        <>
          <PrimaryButton label="Place order" onPress={() => undefined} />
          <PrimaryButton label="Busy" onPress={() => undefined} busy />
          <SecondaryButton label="Back" onPress={() => undefined} />
          <LinkButton label="Add address" onPress={() => undefined} />
        </>,
      ),
    ).not.toThrow();
    const field = wrap(<TextField label="Mobile" value="+9665" onChangeText={() => undefined} />);
    expect(field.getByText('Mobile')).toBeTruthy();
  });

  it('mounts a card, section title, price tag and every pill tone (soft and solid)', () => {
    const tones: PillTone[] = ['neutral', 'brand', 'gold', 'success', 'danger', 'warning', 'progress'];
    expect(() =>
      wrap(
        <Card>
          <SectionTitle label="Burgers" />
          <PriceTag label="SAR 25.00" />
          {tones.map((t) => (
            <React.Fragment key={t}>
              <Pill label={t} tone={t} />
              <Pill label={`${t} solid`} tone={t} solid />
            </React.Fragment>
          ))}
        </Card>,
      ),
    ).not.toThrow();
  });

  it('renders every icon in the set without throwing', () => {
    const icons = [
      ChevronLeftIcon,
      ChevronRightIcon,
      PlusIcon,
      MinusIcon,
      CheckIcon,
      CartIcon,
      BagIcon,
      ReceiptIcon,
      StorefrontIcon,
      PinIcon,
      ClockIcon,
      CardIcon,
      CashIcon,
      PhoneIcon,
      UserIcon,
      LogoutIcon,
      TagIcon,
      BikeIcon,
    ];
    expect(() =>
      wrap(
        <>
          {icons.map((Icon, i) => (
            <Icon key={i} size={20} color="#752E2A" />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
});
