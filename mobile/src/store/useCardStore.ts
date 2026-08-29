import { create } from 'zustand';

import { DEFAULT_TEMPLATE_ID } from '@/constants/cardTemplates';
import { saveCardCache } from '@/utils/cardCache';
import { scheduleCardSync } from '@/utils/cardSync';
import { localId } from '@/utils/localId';
import {
  syncAddLink,
  syncRemoveLink,
  syncReorderLinks,
  syncUpdateLink,
} from '@/utils/linksSync';
import type {
  Card,
  CardFontColorId,
  CardFontId,
  CardMaterialId,
  CardTemplateId,
  EditableFieldKey,
  FieldStyle,
  Link,
} from '@/types/card';

interface CardStore {
  card: Card;
  /**
   * The backend row id for `card`, and the signed-in user it belongs to.
   * Both null until a real card is loaded (setIdentity, called from
   * AuthProvider / onboarding). Link writes and the local cache are keyed
   * off these; while they're null the app is on the seeded mockup and
   * nothing is persisted.
   */
  cardId: string | null;
  userId: string | null;
  setIdentity: (identity: { cardId: string | null; userId: string | null }) => void;
  /**
   * Public URL of the rendered front+back PNG in the `card-snapshots`
   * bucket -- the value the back-of-card Master QR encodes. Null until the
   * first successful capture (see useCardSnapshot); while null the Master
   * QR is suppressed rather than pointed at a placeholder. Hydrated from
   * cards.master_qr_asset_url on load, refreshed after every capture.
   */
  snapshotUrl: string | null;
  /**
   * A cheap fingerprint of the card content that `snapshotUrl`'s image was
   * captured from. useCardSnapshot compares the current card's fingerprint
   * against this to decide whether a re-capture is actually needed -- it
   * lives in the store rather than a hook ref so navigating between the
   * card and editor screens (which remount the hook) can't trigger a
   * redundant capture of unchanged content.
   */
  snapshotStamp: string | null;
  setSnapshot: (snapshot: { url: string; stamp: string }) => void;
  /**
   * Replaces the whole card. Used when a real card arrives from the backend
   * (mint, or a future load-on-launch) and must displace the mockup default
   * below -- without this, a user who just minted their own card would land on
   * the card screen looking at the seeded Patrick Bateman content.
   */
  setCard: (card: Card) => void;
  setField: (key: EditableFieldKey, value: string) => void;
  /** Merges `updates` onto the field's existing style -- pass `undefined` for a key to clear just that override. */
  setFieldStyle: (key: EditableFieldKey, updates: Partial<FieldStyle>) => void;
  setMaterial: (materialId: CardMaterialId) => void;
  setTemplate: (templateId: CardTemplateId) => void;
  /** Pass undefined to fall back to the template's own font. */
  setFont: (fontId: CardFontId | undefined) => void;
  /** Pass undefined to fall back to the template's own text/label colors. Clears any custom hex. */
  setFontColor: (fontColorId: CardFontColorId | undefined) => void;
  /** A custom `#rrggbb` ink. Pass undefined to clear it. Clears any preset fontColorId. */
  setFontColorHex: (hex: string | undefined) => void;
  addLink: (link: Omit<Link, 'id'>) => void;
  updateLink: (id: string, updates: Partial<Omit<Link, 'id'>>) => void;
  removeLink: (id: string) => void;
  reorderLinks: (links: Link[]) => void;
}

const defaultCard: Card = {
  fields: {
    context: 'employed',
    companyName: 'Pierce & Pierce',
    fullName: 'Patrick Bateman',
    jobTitle: 'Vice President',
    department: 'Mergers & Acquisitions',
    location: 'New York, NY',
    phone: '212 555 0148',
    email: '',
  },
  // Mockup content, matching the examples in docs/MOCKUP_BRIEF.md §7.5.
  // Replace with [] once cards are loaded from the backend.
  links: [
    { id: 'seed-linkedin', platform: 'LinkedIn', url: 'https://www.linkedin.com', isActive: true },
    { id: 'seed-github', platform: 'GitHub', url: 'https://github.com', isActive: true },
    { id: 'seed-portfolio', platform: 'Portfolio', url: 'https://www.showthereceipts.app', isActive: true },
    { id: 'seed-demo', platform: 'Live Demo', url: 'https://www.showthereceipts.app', isActive: true },
  ],
  materialId: 'bone',
  templateId: DEFAULT_TEMPLATE_ID,
  fieldStyles: {},
};

export const useCardStore = create<CardStore>((set, get) => {
  /**
   * After a link mutation: mirror the new card to the local cache. `synced`
   * is the result of the matching DB write -- false (offline, RLS, error)
   * marks the cache dirty so AuthProvider re-pushes the whole link set on
   * the next foreground-with-network. No identity yet = seeded mockup,
   * nothing to persist.
   */
  const persist = (synced: boolean) => {
    const { cardId, userId, card, snapshotUrl } = get();
    if (!userId) return;
    void saveCardCache(userId, { cardId, card, dirty: !synced, snapshotUrl });
  };

  /**
   * After a front-of-card edit (fields, styles, material, template, font):
   * mirror to the local cache immediately, and debounce a write of the
   * whole `cards` row to the backend. No identity yet = seeded mockup,
   * nothing to persist. Without a cardId we can still cache locally.
   */
  const persistCard = () => {
    const { cardId, userId } = get();
    if (!userId) return;
    if (cardId) {
      persist(true); // optimistic; scheduleCardSync's result re-marks on failure
      scheduleCardSync(cardId, () => get().card, persist);
    } else {
      persist(false);
    }
  };

  return {
    card: defaultCard,
    cardId: null,
    userId: null,
    snapshotUrl: null,
    snapshotStamp: null,

    setIdentity: ({ cardId, userId }) => set({ cardId, userId }),
    setSnapshot: ({ url, stamp }) => set({ snapshotUrl: url, snapshotStamp: stamp }),

    setCard: (card) => set({ card }),

    setField: (key, value) => {
      set((state) => ({
        card: {
          ...state.card,
          fields: { ...state.card.fields, [key]: value } as typeof state.card.fields,
        },
      }));
      persistCard();
    },

    setFieldStyle: (key, updates) => {
      set((state) => ({
        card: {
          ...state.card,
          fieldStyles: {
            ...state.card.fieldStyles,
            [key]: { ...state.card.fieldStyles[key], ...updates },
          },
        },
      }));
      persistCard();
    },

    setMaterial: (materialId) => {
      set((state) => ({ card: { ...state.card, materialId } }));
      persistCard();
    },

    setTemplate: (templateId) => {
      set((state) => ({ card: { ...state.card, templateId } }));
      persistCard();
    },

    setFont: (fontId) => {
      set((state) => ({ card: { ...state.card, fontId } }));
      persistCard();
    },

    setFontColor: (fontColorId) => {
      set((state) => ({ card: { ...state.card, fontColorId, fontColorHex: undefined } }));
      persistCard();
    },

    setFontColorHex: (hex) => {
      set((state) => ({ card: { ...state.card, fontColorHex: hex, fontColorId: undefined } }));
      persistCard();
    },

    addLink: (link) => {
      const created: Link = { ...link, id: localId() };
      set((state) => ({ card: { ...state.card, links: [...state.card.links, created] } }));

      const { cardId } = get();
      if (cardId) {
        void syncAddLink(cardId, created, get().card.links.length - 1).then((r) => persist(r.ok));
      } else {
        persist(false);
      }
    },

    updateLink: (id, updates) => {
      set((state) => ({
        card: {
          ...state.card,
          links: state.card.links.map((link) => (link.id === id ? { ...link, ...updates } : link)),
        },
      }));

      if (get().cardId) {
        void syncUpdateLink(id, updates).then((r) => persist(r.ok));
      } else {
        persist(false);
      }
    },

    removeLink: (id) => {
      set((state) => ({
        card: { ...state.card, links: state.card.links.filter((link) => link.id !== id) },
      }));

      if (get().cardId) {
        void syncRemoveLink(id).then((r) => persist(r.ok));
      } else {
        persist(false);
      }
    },

    reorderLinks: (links) => {
      set((state) => ({ card: { ...state.card, links } }));

      const { cardId } = get();
      if (cardId) {
        void syncReorderLinks(cardId, links).then((r) => persist(r.ok));
      } else {
        persist(false);
      }
    },
  };
});
