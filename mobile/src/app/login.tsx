import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOrientationLock } from '@/hooks/use-orientation-lock';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { signInWithApple } from '@/utils/signInWithApple';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Apple sign-in exists only on iOS 13+, so the button is hidden rather than
  // shown-and-broken elsewhere. Starts null so nothing flashes before we know.
  const [appleAvailable, setAppleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  useOrientationLock(ScreenOrientation.OrientationLock.PORTRAIT_UP);

  const handleApple = async () => {
    setBusy(true);
    setError(null);
    const result = await signInWithApple();
    // On success we deliberately do not navigate: AuthProvider observes the new
    // session and index.tsx routes to onboarding or the card. Pushing here too
    // would race that.
    if (!result.ok && result.error) setError(result.error);
    setBusy(false);
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + Spacing.xxl }]}>
      <View style={styles.wordmarkWrap}>
        <ThemedText variant="wordmark" themeColor="text" style={styles.wordmark}>
          Lynx.
        </ThemedText>
      </View>

      <View style={styles.buttons}>
        {error ? (
          <ThemedText variant="body" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        {appleAvailable ? (
          <Pressable style={styles.appleButton} onPress={handleApple} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <ThemedText variant="button" style={styles.appleButtonText}>
                CONTINUE WITH APPLE
              </ThemedText>
            )}
          </Pressable>
        ) : null}
        <Pressable style={styles.googleButton} onPress={() => router.push('/onboarding')} disabled={busy}>
          <ThemedText variant="button" themeColor="text" style={styles.googleButtonText}>
            CONTINUE WITH GOOGLE
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: Spacing.xl,
  },
  wordmarkWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 64,
    lineHeight: 72,
    color: '#FFFFFF',
  },
  buttons: {
    gap: Spacing.lg,
  },
  appleButton: {
    height: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#000000',
    textAlign: 'center',
  },
  googleButton: {
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  error: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
});
