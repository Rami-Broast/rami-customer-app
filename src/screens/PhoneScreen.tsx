import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ApiError } from '../api/http';
import { useAuth } from '../auth/AuthProvider';
import { BrandMark, PrimaryButton, Screen, TextField } from '../components/ui';
import { ChevronRightIcon } from '../components/icons';
import { FadeIn, Toast } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/theme';

/** Step 1 of OTP login: enter phone, request a code. */
export function PhoneScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Phone'>): React.JSX.Element {
  const theme = useTheme();
  const { api } = useAuth();
  const [phone, setPhone] = useState('+9665');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^\+9665\d{8}$/.test(phone);

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await api.requestOtp(phone);
      navigation.navigate('Otp', { phone });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send the code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Toast visible={!!error} message={error ?? ''} tone="danger" onHide={() => setError(null)} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <FadeIn translateY={14}>
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <BrandMark size={104} />
            <Text style={{ color: theme.colors.text, ...theme.type.display, marginTop: 20, textAlign: 'center' }}>
              Rami Broast
            </Text>
            <Text style={{ color: theme.colors.textMuted, ...theme.type.body, marginTop: 6, textAlign: 'center' }}>
              Sign in to order your favourites for pickup or delivery.
            </Text>
          </View>

          <TextField
            label="Mobile number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={13}
            autoFocus
            placeholder="+9665XXXXXXXX"
          />
          <PrimaryButton label="Send code" onPress={submit} busy={busy} disabled={!valid} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 4 }}>
            <Text style={{ color: theme.colors.textMuted, ...theme.type.caption }}>
              We’ll text you a one-time login code
            </Text>
            <ChevronRightIcon size={14} color={theme.colors.textMuted} />
          </View>
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}
