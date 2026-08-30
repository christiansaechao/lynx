import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useOrientationLock } from '@/hooks/use-orientation-lock';
import { useTheme } from '@/hooks/use-theme';
import { captureCardById, resolveCardId } from '@/utils/captureCard';
import { useAuthStore } from '@/store/useAuthStore';
import { useCardStore } from '@/store/useCardStore';
import { useRolodexStore } from '@/store/useRolodexStore';

type ScanState = 'scanning' | 'capturing' | 'success' | 'error';

/**
 * QR half of the capture flow (see docs/ROLODEX_EXPERIENCE.md). Reads the
 * same Master QR another user's card already displays -- captureCard.ts
 * pulls the card id straight out of its snapshot image URL, so no second
 * QR code or payload format is needed.
 */
export default function ScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Set the instant a return trip starts (Close or Done), so CameraView
  // unmounts on its own render pass before router.back() fires on the
  // next one, and so this screen's own PORTRAIT_UP lock stops re-applying
  // itself -- see useOrientationLock's `enabled` doc. Camera teardown can
  // trigger a spurious AppState "active" blip on iOS; without suppressing
  // this hook during that window, its relock could land after card.tsx has
  // already relocked LANDSCAPE on focus and fight it, producing a third,
  // out-of-order rotation.
  const [closing, setClosing] = useState(false);
  useOrientationLock(ScreenOrientation.OrientationLock.PORTRAIT_UP, !closing);

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>('scanning');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Guards against onBarcodeScanned firing repeatedly for the same frame
  // while a capture is already in flight.
  const scannedRef = useRef(false);

  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const ownCardId = useCardStore((s) => s.cardId);
  const folders = useRolodexStore((s) => s.folders);
  const addContact = useRolodexStore((s) => s.addContact);

  const handleScan = async ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    const cardId = resolveCardId(data);
    if (!cardId) return; // Not a Lynx card -- ignore and keep scanning.

    scannedRef.current = true;
    setState('capturing');

    const activeFolder = folders.find((f) => f.isActive) ?? null;
    const result = await captureCardById(cardId, ownCardId, 'qr', activeFolder?.id ?? null);

    if (!result.ok || !result.contact) {
      setErrorMessage(
        result.error === 'self'
          ? "That's your own card."
          : result.error === 'not_found'
            ? 'Card not found.'
            : 'Could not reach the network — try again.',
      );
      setState('error');
      return;
    }

    addContact(result.contact);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setState('success');
  };

  const reset = () => {
    scannedRef.current = false;
    setErrorMessage(null);
    setState('scanning');
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <ThemedText variant="body" themeColor="text" style={styles.permissionText}>
          Lynx needs camera access to scan a card.
        </ThemedText>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <ThemedText variant="body" style={{ color: '#000000' }}>
            Allow Camera
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {(state === 'scanning' || state === 'capturing') && (
        <CameraView
          active={!closing}
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={state === 'scanning' ? handleScan : undefined}
        />
      )}

      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable
          onPress={() => {
            // active={false} stops the native AVCaptureSession while
            // CameraView stays mounted -- decoupling session teardown from
            // both the React unmount and the navigation transition, unlike
            // conditionally unmounting CameraView outright (which combines
            // session stop + view removal + navigation all at once and was
            // still producing a stray landscape -> portrait -> landscape
            // dip only on this screen, never on rolodex, which has no
            // camera). Give the session a beat to actually stop before
            // navigating.
            // Physical device orientation never moved during the scan flow
            // (this screen force-locks PORTRAIT_UP the whole time), so
            // there's nothing to rotate back from -- relock LANDSCAPE here,
            // before navigating, so it's already settled by the time
            // card.tsx regains focus instead of card.tsx's own relock
            // needing to move the OS at all.
            setClosing(true);
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            setTimeout(() => {
              router.back();
            }, 300);
          }}
          hitSlop={Spacing.md}
          style={styles.closeButton}>
          <ThemedText variant="body" style={styles.closeText}>
            Close
          </ThemedText>
        </Pressable>

        <View style={styles.frame} />

        <View style={styles.statusArea}>
          {state === 'scanning' && (
            <ThemedText variant="body" style={styles.statusText}>
              Point at another Lynx card
            </ThemedText>
          )}
          {state === 'capturing' && (
            <ThemedText variant="body" style={styles.statusText}>
              Saving to your Rolodex…
            </ThemedText>
          )}
          {state === 'success' && (
            <>
              <ThemedText variant="body" style={styles.statusText}>
                Saved to your Rolodex
              </ThemedText>
              <Pressable
                onPress={() => {
                  // Same as Close above -- relock LANDSCAPE here so it's
                  // already settled before card.tsx regains focus, rather
                  // than leaving it to card.tsx's relock to move the OS.
                  setClosing(true);
                  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                  router.back();
                }}
                style={styles.actionButton}>
                <ThemedText variant="body" style={{ color: '#000000' }}>
                  Done
                </ThemedText>
              </Pressable>
            </>
          )}
          {state === 'error' && (
            <>
              <ThemedText variant="body" style={styles.statusText}>
                {errorMessage}
              </ThemedText>
              <Pressable onPress={reset} style={styles.actionButton}>
                <ThemedText variant="body" style={{ color: '#000000' }}>
                  Try Again
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  permissionText: {
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
  },
  closeText: {
    color: '#ffffff',
  },
  frame: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: '75%',
    marginTop: Spacing.xxl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: Spacing.md,
  },
  statusArea: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  statusText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
  },
});
