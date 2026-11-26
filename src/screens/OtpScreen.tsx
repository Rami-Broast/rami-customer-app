import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ApiError } from '../api/http';
import { useAuth } from '../auth/AuthProvider';
import { PrimaryButton, Screen, TextField } from '../components/ui';
import { PhoneIcon } from '../components/icons';
import { FadeIn, Toast } from '../motion';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/theme';

/** Step 2 of OTP login: enter the code, verify, sign in. */
export function OtpScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Otp'>): React.JSX.Element {
  const theme = useTheme();
  const { api, signIn } = useAuth();
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^\d{4,8}$/.test(code);

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const tokens = await api.verifyOtp(phone, code);
      await signIn(tokens);
      // On sign-in the root switches to the main stack automatically.
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Wrong or expired code. Try again.');
      setBusy(false);
    }
  };

  return (
    <Screen title="Enter code" onBack={() => navigation.goBack()}>
      <Toast visible={!!error} message={error ?? ''} tone="danger" onHide={() => setError(null)} />
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <FadeIn translateY={14}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: theme.colors.primarySoft,
              borderRadius: theme.radius.lg,
              padding: 14,
              marginBottom: 24,
            }}
          >
            <PhoneIcon size={22} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, ...theme.type.body, flex: 1 }}>
              We sent a code to{' '}
              <Text style={{ fontWeight: '800' }}>{phone}</Text>.
            </Text>
          </View>

          <TextField label="Login code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={8} autoFocus />
          <PrimaryButton label="Verify" onPress={submit} busy={busy} disabled={!valid} />
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}
