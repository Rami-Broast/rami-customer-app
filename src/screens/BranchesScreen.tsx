import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { Card, Pill, Screen } from '../components/ui';
import { ChevronRightIcon, LogoutIcon, PinIcon, ReceiptIcon, StorefrontIcon } from '../components/icons';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, PressableScale, Skeleton, Stagger } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { formatSar } from '../util/money';
import { useTheme } from '../theme/theme';

/** Home: choose a branch to order from. */
export function BranchesScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Branches'>): React.JSX.Element {
  const theme = useTheme();
  const { api, signOut } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.listBranches(), []);

  const roundButton = (label: string, icon: React.ReactNode, onPress: () => void) => (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </PressableScale>
  );

  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      {roundButton('My orders', <ReceiptIcon size={20} color={theme.colors.text} />, () => navigation.navigate('Orders'))}
      {roundButton('Sign out', <LogoutIcon size={20} color={theme.colors.text} />, () => signOut())}
    </View>
  );

  return (
    <Screen title="Rami Broast" subtitle="Choose a branch to order from" right={headerActions}>
      {loading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={96} radius={theme.radius.lg} />
          ))}
        </View>
      ) : error ? (
        <ErrorState title="Couldn’t load branches" message={error.message} actionLabel="Retry" onAction={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No branches yet" message="Please check back soon." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 12 }}>
          <Stagger>
            {data.map((branch) => {
              const open = branch.isAcceptingOrders;
              return (
                <PressableScale
                  key={branch.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${branch.name}${open ? '' : ', closed now'}`}
                  onPress={() => navigation.navigate('Menu', { branchId: branch.id, branchName: branch.name })}
                >
                  <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: theme.radius.md,
                          backgroundColor: theme.colors.primarySoft,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <StorefrontIcon size={26} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '800' }}>{branch.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <PinIcon size={13} color={theme.colors.textMuted} />
                          <Text style={{ color: theme.colors.textMuted, ...theme.type.caption }} numberOfLines={1}>
                            {[branch.district, branch.city].filter(Boolean).join(', ') || 'Rami Broast branch'}
                          </Text>
                        </View>
                      </View>
                      <ChevronRightIcon size={20} color={theme.colors.textMuted} />
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: 14,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.border,
                      }}
                    >
                      {open ? (
                        <>
                          <Pill label="Open now" tone="success" />
                          <Pill label={`Delivery ${formatSar(branch.deliveryFeeMinor)}`} tone="neutral" />
                          <Pill label={`Min ${formatSar(branch.minOrderMinor)}`} tone="neutral" />
                        </>
                      ) : (
                        <Pill label="Closed now" tone="danger" />
                      )}
                    </View>
                  </Card>
                </PressableScale>
              );
            })}
          </Stagger>
        </ScrollView>
      )}
    </Screen>
  );
}
