import * as AppleAuthentication from 'expo-apple-authentication';

import { formatAppleName, savePendingFullName } from './pendingFullName';
import { supabase } from './supabase';

/**
 * Native Sign in with Apple.
 *
 * Returns true on success. The session is not returned: AuthProvider's
 * onAuthStateChange subscription picks it up and drives routing from there,
 * so callers only need to know whether to surface an error.
 */
export async function signInWithApple(): Promise<{ ok: boolean; error?: string }> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Apple only returns an identityToken for a genuine sign-in. Without it
    // there is nothing to exchange, so fail loudly rather than calling
    // Supabase with an empty token and getting a vaguer error back.
    if (!credential.identityToken) {
      return { ok: false, error: 'Apple did not return an identity token.' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) return { ok: false, error: error.message };

    // Only populated on the very first authorization for this app, so capture
    // it now or lose it for good. Held for the onboarding screen to prefill.
    // Deliberately after the sign-in succeeded: storing a name for a sign-in
    // that then failed would prefill onboarding for the wrong session.
    const appleName = formatAppleName(credential.fullName);
    if (appleName) await savePendingFullName(appleName);

    return { ok: true };
  } catch (e) {
    // The user dismissing the Apple sheet throws rather than returning a
    // result. That is a normal cancellation, not a failure worth showing.
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
      return { ok: false };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Sign in failed.' };
  }
}
