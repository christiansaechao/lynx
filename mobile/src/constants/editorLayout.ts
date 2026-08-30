import type { ComponentType } from 'react';

import { EditorLayoutV1 } from '@/components/editor/layouts/v1-accessory-bar/EditorLayoutV1';
import type { EditorLayoutProps } from '@/components/editor/layouts/EditorLayout';

/**
 * Which editor control layout is active. Change this constant and reload to
 * compare versions -- see docs on EditorLayoutProps for the contract every
 * version implements. Once a version is picked, delete the others and this
 * indirection along with them rather than keeping dead code around.
 */
export const ACTIVE_EDITOR_LAYOUT: keyof typeof EDITOR_LAYOUTS = 'v1-accessory-bar';

export const EDITOR_LAYOUTS: Record<string, ComponentType<EditorLayoutProps>> = {
  'v1-accessory-bar': EditorLayoutV1,
};

export function getActiveEditorLayout(): ComponentType<EditorLayoutProps> {
  return EDITOR_LAYOUTS[ACTIVE_EDITOR_LAYOUT];
}
