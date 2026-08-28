import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

const HOLD_DURATION = 1000;

/**
 * A plain black, portrait-locked buffer between onboarding and the card
 * screen. Onboarding and card.tsx each lock to a different orientation
 * (portrait vs. landscape); jumping straight from one to the other could
 * race the two in-flight `lockAsync` calls and occasionally leave the app
 * stuck showing portrait chrome around landscape card content. Routing
 * through this screen first means the portrait lock is fully settled and
 * nothing else is mid-transition before card.tsx ever starts locking to
 * landscape — the two never overlap.
 */
export default function TransitionScreen() {
  const router = useRouter();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/card?welcome=1'), HOLD_DURATION);
    return () => clearTimeout(timer);
  }, [router]);

  return <View style={styles.screen} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
