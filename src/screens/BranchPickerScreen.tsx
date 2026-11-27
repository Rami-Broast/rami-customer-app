import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useBranch } from '../branch/BranchProvider';
import { CheckIcon, PinIcon } from '../components/icons';
import { Screen } from '../components/ui';
import { EmptyState, ErrorState, PressableScale, Skeleton } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';

/** Choose which branch to order from. Opens from the Home header. */
export function BranchPickerScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'BranchPicker'>): React.JSX.Element {
  const theme = useTheme();
  const { branches, selected, loading, error, reload, selectBranch } = useBranch();

  const choose = (id: string): void => {
    selectBranch(id);
    navigation.goBack();
  };

  return (
    <Screen title="Choose a branch" onBack={() => navigation.goBack()}>
      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={88} radius={theme.radius.lg} />)}</View>
      ) : error ? (
        <ErrorState title="Couldn’t load branches" message={error.message} actionLabel="Retry" onAction={reload} />
      ) : branches.length === 0 ? (
        <EmptyState title="No branches yet" message="Please check back soon." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {branches.map((b) => {
            const active = b.id === selected?.id;
            return (
              <PressableScale
                key={b.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => choose(b.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: active ? theme.colors.goldSoft : theme.colors.surface,
                  borderRadius: theme.radius.lg,
                  borderWidth: 2,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  padding: 14,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <PinIcon size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 16 }}>{b.name}</Text>
                  <Text style={{ color: theme.colors.textMuted, marginTop: 2 }} numberOfLines={1}>
                    {[b.district, b.city].filter(Boolean).join(', ')}
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 6, gap: 10, flexWrap: 'wrap' }}>
                    {!b.isAcceptingOrders ? (
                      <Text style={{ color: theme.colors.danger, fontWeight: '700', fontSize: 13 }}>Closed now</Text>
                    ) : (
                      <>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>Delivery {formatSar(b.deliveryFeeMinor)}</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>· Min {formatSar(b.minOrderMinor)}</Text>
                      </>
                    )}
                  </View>
                </View>
                {active ? (
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <CheckIcon size={16} color={theme.colors.onPrimary} />
                  </View>
                ) : null}
              </PressableScale>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}
