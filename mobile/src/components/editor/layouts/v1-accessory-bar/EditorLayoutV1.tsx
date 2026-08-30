import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { AddLinkSheet } from '@/components/editor/AddLinkSheet';
import { GlobalSettingsSheet } from '@/components/editor/GlobalSettingsSheet';
import type { EditorLayoutProps } from '@/components/editor/layouts/EditorLayout';
import { AccessoryBarHost, AccessoryBarInline, dismissKeyboard } from './AccessoryBar';
import { KerningSheet } from './KerningSheet';

/**
 * v1: thin accessory bar docked above the keyboard (Canva/CapCut pattern --
 * see the editor UX research) with the high-frequency toggles (bold, italic,
 * all-caps, visibility). The one control that needs more room, Kerning,
 * dismisses the keyboard and swaps in a bottom sheet rather than trying to
 * show a full sheet and the keyboard at once.
 *
 * On Android, InputAccessoryView doesn't exist, so the same bar renders
 * inline just above the card instead of docked to the keyboard.
 */
export function EditorLayoutV1({
  selectedField,
  onCloseFieldSettings,
  globalSettingsOpen,
  onCloseGlobalSettings,
  addLinkOpen,
  onCloseAddLink,
  editLinkId,
  onCloseEditLink,
}: EditorLayoutProps) {
  const [kerningField, setKerningField] = useKerningField(selectedField, onCloseFieldSettings);

  const openKerning = () => {
    dismissKeyboard();
    setKerningField(selectedField);
  };

  return (
    <>
      {Platform.OS === 'android' && selectedField && !kerningField && (
        <AccessoryBarInline field={selectedField} onOpenKerning={openKerning} />
      )}
      {/*
        Mounted for the whole editor session on iOS, not just while a field
        is selected -- InputAccessoryView has to already exist in the tree
        before a TextInput becomes first responder, or iOS just shows the
        plain keyboard and never attaches it. AccessoryBarHost renders an
        empty bar itself when `field` is null; see its docs.
      */}
      {Platform.OS === 'ios' && (
        <AccessoryBarHost field={selectedField} onOpenKerning={openKerning} />
      )}

      <KerningSheet
        field={kerningField}
        onClose={() => {
          setKerningField(null);
          onCloseFieldSettings();
        }}
      />

      <GlobalSettingsSheet visible={globalSettingsOpen} onClose={onCloseGlobalSettings} />
      <AddLinkSheet visible={addLinkOpen} onClose={onCloseAddLink} />
      <AddLinkSheet visible={!!editLinkId} editLinkId={editLinkId} onClose={onCloseEditLink} />
    </>
  );
}

// Kept local rather than lifted into editor.tsx: which field the Kerning
// sheet is showing is v1-specific state, not something other layout
// versions need to know about. Clears itself when the parent deselects the
// field entirely (e.g. tapping "Done").
function useKerningField(selectedField: EditorLayoutProps['selectedField'], _onCloseFieldSettings: () => void) {
  const [kerningField, setKerningField] = useState<EditorLayoutProps['selectedField']>(null);

  useEffect(() => {
    if (!selectedField) {
      setKerningField(null);
      // _onCloseFieldSettings is intentionally not called here -- it's the
      // parent's own deselect that triggered this branch, calling it back
      // would be a redundant no-op state update.
    }
  }, [selectedField]);

  return [kerningField, setKerningField] as const;
}
