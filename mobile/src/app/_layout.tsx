import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/components/AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const session = useAuthStore((s) => s.session);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider />
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />

            {/* Declarative guards rather than redirects inside the screens:
                an unauthenticated user cannot reach a signed-in route even
                for one frame, so there is no flicker to chase. */}
            <Stack.Protected guard={!session}>
              <Stack.Screen name="login" />
            </Stack.Protected>

            <Stack.Protected guard={!!session}>
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="transition" />
              <Stack.Screen name="card" />
              <Stack.Screen name="editor" options={{ presentation: 'modal' }} />
            </Stack.Protected>
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
