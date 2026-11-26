import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import type { Branch } from '../api/types';
import { ChevronRightIcon, PinIcon, StorefrontIcon } from '../components/icons';
import { BottomSheet, EmptyState, PressableScale } from '../motion';
import { Coords, filterBranches, formatDistance, sortBranchesByDistance } from '../util/geo';
import { useTheme } from '../theme/theme';

export interface BranchListProps {
  branches: Branch[];
  coords: Coords | null;
  selectedId?: string;
  onSelect: (branch: Branch) => void;
  autoFocusSearch?: boolean;
}

/**
 * Search + nearest-first branch list. The customer never browses a full list as
 * a landing screen; this is the one place branches appear, reached by searching
 * or by opening the switcher. Nearest is first (when location is known), typing
 * filters by name/area, and the current branch is marked.
 */
export function BranchList({ branches, coords, selectedId, onSelect, autoFocusSearch }: BranchListProps): React.JSX.Element {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const ordered = useMemo(
    () => sortBranchesByDistance(filterBranches(branches, query), coords),
    [branches, coords, query],
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 16, color: theme.colors.textMuted }}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search a branch or area"
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Search a branch or area"
          autoFocus={autoFocusSearch}
          autoCorrect={false}
          returnKeyType="search"
          style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 16, color: theme.colors.text }}
        />
      </View>

      {ordered.length === 0 ? (
        <EmptyState title="No branches" message={query.trim() ? `Nothing matches “${query.trim()}”.` : 'Please check back soon.'} />
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8, gap: 8 }}>
          {ordered.map((branch) => {
            const active = branch.id === selectedId;
            const dist = formatDistance(branch.distanceKm);
            const area = [branch.district, branch.city].filter(Boolean).join(', ');
            return (
              <PressableScale
                key={branch.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${branch.name}${area ? `, ${area}` : ''}${dist ? `, ${dist} away` : ''}${branch.isAcceptingOrders ? '' : ', closed now'}`}
                onPress={() => onSelect(branch)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StorefrontIcon size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>
                    {branch.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <PinIcon size={12} color={theme.colors.textMuted} />
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }} numberOfLines={1}>
                      {[area || 'Rami Broast branch', dist].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
                {!branch.isAcceptingOrders ? (
                  <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '700' }}>Closed</Text>
                ) : (
                  <ChevronRightIcon size={18} color={theme.colors.textMuted} />
                )}
              </PressableScale>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export interface BranchPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  branches: Branch[];
  coords: Coords | null;
  selectedId?: string;
  onSelect: (branch: Branch) => void;
}

/** The branch switcher as a bottom sheet — opened from the menu's branch chip. */
export function BranchPickerSheet({ visible, onClose, branches, coords, selectedId, onSelect }: BranchPickerSheetProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Choose a branch</Text>
      <View style={{ height: 420 }}>
        <BranchList
          branches={branches}
          coords={coords}
          selectedId={selectedId}
          onSelect={(b) => {
            onSelect(b);
            onClose();
          }}
          autoFocusSearch={false}
        />
      </View>
    </BottomSheet>
  );
}
