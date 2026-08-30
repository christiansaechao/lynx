import { create } from 'zustand';

import { MOCK_CONTACTS, MOCK_FOLDERS } from '@/constants/rolodexMock';
import { syncActiveFolder, syncAddFolder } from '@/utils/foldersSync';
import { localId } from '@/utils/localId';
import { saveRolodexCache } from '@/utils/rolodexCache';
import { syncAddContact, syncUpdateContact } from '@/utils/contactsSync';
import type { ContactCard, RolodexFolder } from '@/types/card';

/**
 * The collected-contacts store. Local-first: every mutation updates state
 * immediately, then best-effort persists to AsyncStorage (rolodexCache.ts)
 * and, for a real capture, to Supabase (contactsSync.ts / foldersSync.ts) --
 * same pattern as useCardStore. `ownerUserId` gates persistence: until
 * AuthProvider/hydrate sets it, this is the seeded mock and nothing is
 * written anywhere.
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
  /**
   * Resolves one card out of the post-meetup swipe stack: stamps `sortedAt`
   * and applies the swipe's outcome (right = star, up = star + note, left =
   * file as-is). Idempotent-ish -- re-sorting just re-stamps.
   */
  sortContact: (id: string, outcome: { starred?: boolean; note?: string | null }) => void;
  setActiveFolder: (id: string | null) => void;
  /** Creates a folder and returns its (client-generated UUID) id. */
  addFolder: (name: string) => string;
  /** Files one contact into a folder (or clears it with null). One folder per contact. */
  setContactFolder: (id: string, folderId: string | null) => void;
  /** Bulk-files several contacts into one folder (the folder-side multi-select add). */
  addContactsToFolder: (ids: string[], folderId: string) => void;
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
    const state = get();
    persist(state);
    const updated = state.contacts.find((c) => c.id === id);
    if (state.ownerUserId && updated) syncUpdateContact(state.ownerUserId, updated);
  },

  setNote: (id, note) => {
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, note } : c)),
    }));
    const state = get();
    persist(state);
    const updated = state.contacts.find((c) => c.id === id);
    if (state.ownerUserId && updated) syncUpdateContact(state.ownerUserId, updated);
  },

  sortContact: (id, outcome) => {
    const sortedAt = new Date().toISOString();
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id
          ? {
              ...c,
              sortedAt,
              starred: outcome.starred ?? c.starred,
              note: outcome.note !== undefined ? outcome.note : c.note,
            }
          : c,
      ),
    }));
    const state = get();
    persist(state);
    const updated = state.contacts.find((c) => c.id === id);
    if (state.ownerUserId && updated) syncUpdateContact(state.ownerUserId, updated);
  },

  // Exactly one active folder at a time -- activating one clears any other.
  setActiveFolder: (id) => {
    set((state) => ({
      folders: state.folders.map((f) => ({ ...f, isActive: f.id === id })),
    }));
    const state = get();
    persist(state);
    if (state.ownerUserId) syncActiveFolder(state.ownerUserId, id);
  },

  addFolder: (name) => {
    // uuid, not `folder-<ts>`: folders.id is Postgres `uuid` and syncAddFolder
    // writes it straight into the column (see localId.ts).
    const folder: RolodexFolder = { id: localId(), name, isActive: false };
    set((state) => ({ folders: [...state.folders, folder] }));
    const state = get();
    persist(state);
    if (state.ownerUserId) syncAddFolder(state.ownerUserId, folder);
    return folder.id;
  },

  setContactFolder: (id, folderId) => {
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, folderId } : c)),
    }));
    const state = get();
    persist(state);
    const updated = state.contacts.find((c) => c.id === id);
    if (state.ownerUserId && updated) syncUpdateContact(state.ownerUserId, updated);
  },

  addContactsToFolder: (ids, folderId) => {
    const idSet = new Set(ids);
    set((state) => ({
      contacts: state.contacts.map((c) => (idSet.has(c.id) ? { ...c, folderId } : c)),
    }));
    const state = get();
    persist(state);
    if (state.ownerUserId) {
      for (const c of state.contacts) {
        if (idSet.has(c.id)) syncUpdateContact(state.ownerUserId, c);
      }
    }
  },
}));
