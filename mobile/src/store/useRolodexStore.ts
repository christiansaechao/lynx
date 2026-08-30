import { create } from 'zustand';

import { MOCK_CONTACTS, MOCK_FOLDERS } from '@/constants/rolodexMock';
import { saveRolodexCache } from '@/utils/rolodexCache';
import { syncAddContact } from '@/utils/contactsSync';
import type { ContactCard, RolodexFolder } from '@/types/card';

/**
 * The collected-contacts store. Local-first: every mutation updates state
 * immediately, then best-effort persists to AsyncStorage (rolodexCache.ts)
 * and, for a real capture, to Supabase (contactsSync.ts) -- same pattern as
 * useCardStore. `ownerUserId` gates persistence: until AuthProvider/hydrate
 * sets it, this is the seeded mock and nothing is written anywhere.
 */
interface RolodexStore {
  contacts: ContactCard[];
  folders: RolodexFolder[];
  ownerUserId: string | null;
  /** Loads cached (or fresh) contacts/folders for a signed-in user, replacing the mock seed. */
  hydrate: (userId: string, data: { contacts: ContactCard[]; folders: RolodexFolder[] }) => void;
  /** A real capture: persists locally and syncs to the backend. */
  addContact: (contact: ContactCard) => void;
  toggleStarred: (id: string) => void;
  setNote: (id: string, note: string | null) => void;
  setActiveFolder: (id: string | null) => void;
  addFolder: (name: string) => void;
}

function persist(state: Pick<RolodexStore, 'ownerUserId' | 'contacts' | 'folders'>) {
  if (!state.ownerUserId) return;
  saveRolodexCache(state.ownerUserId, { contacts: state.contacts, folders: state.folders });
}

export const useRolodexStore = create<RolodexStore>((set, get) => ({
  contacts: MOCK_CONTACTS,
  folders: MOCK_FOLDERS,
  ownerUserId: null,

  hydrate: (userId, data) => {
    set({ ownerUserId: userId, contacts: data.contacts, folders: data.folders });
  },

  addContact: (contact) => {
    set((state) => ({ contacts: [contact, ...state.contacts] }));
    const state = get();
    persist(state);
    if (state.ownerUserId) syncAddContact(state.ownerUserId, contact);
  },

  toggleStarred: (id) => {
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c)),
    }));
    persist(get());
  },

  setNote: (id, note) => {
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, note } : c)),
    }));
    persist(get());
  },

  // Exactly one active folder at a time — activating one clears any other.
  setActiveFolder: (id) => {
    set((state) => ({
      folders: state.folders.map((f) => ({ ...f, isActive: f.id === id })),
    }));
    persist(get());
  },

  addFolder: (name) => {
    set((state) => ({
      folders: [...state.folders, { id: `folder-${Date.now().toString(36)}`, name, isActive: false }],
    }));
    persist(get());
  },
}));
