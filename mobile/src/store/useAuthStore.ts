import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

/**
 * Whether the signed-in user has already minted their card.
 *
 * 'unknown' is the pre-resolution state and is meaningful: it is what keeps
 * the router from sending a user with an existing card through onboarding
 * during the window between the session resolving and the cards query
 * returning. Only 'missing' routes to onboarding.
 */
export type CardStatus = 'unknown' | 'missing' | 'exists';

interface AuthStore {
  session: Session | null;
  /** True until the initial getSession() call has settled. */
  isLoading: boolean;
  cardStatus: CardStatus;
  setSession: (session: Session | null) => void;
  setLoaded: () => void;
  setCardStatus: (status: CardStatus) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isLoading: true,
  cardStatus: 'unknown',

  // Signing out has to reset cardStatus too, otherwise the next user to sign
  // in on the same device inherits the previous user's answer and skips
  // onboarding they have never actually completed.
  setSession: (session) =>
    set((state) => ({
      session,
      cardStatus: session ? state.cardStatus : 'unknown',
    })),

  setLoaded: () => set({ isLoading: false }),

  setCardStatus: (cardStatus) => set({ cardStatus }),
}));
