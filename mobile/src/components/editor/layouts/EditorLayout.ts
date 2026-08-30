import type { EditableFieldKey } from '@/types/card';

/**
 * Contract every editor layout version implements, so editor.tsx can swap
 * between them by changing ACTIVE_EDITOR_LAYOUT (see constants/editorLayout.ts)
 * without touching the screen itself. Each version owns its own bottom-sheet /
 * accessory-bar / card-docking behavior internally -- this is the only
 * surface editor.tsx depends on.
 */
export interface EditorLayoutProps {
  /** Which field is currently selected for element-specific editing, if any. */
  selectedField: EditableFieldKey | null;
  onCloseFieldSettings: () => void;

  globalSettingsOpen: boolean;
  onCloseGlobalSettings: () => void;

  addLinkOpen: boolean;
  onCloseAddLink: () => void;

  /** When set, the add-link sheet opens in edit mode for this link. */
  editLinkId: string | null;
  onCloseEditLink: () => void;
}
