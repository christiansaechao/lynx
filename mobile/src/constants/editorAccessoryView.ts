/**
 * iOS InputAccessoryView id linking CardFront's TextInputs to whichever
 * layout version renders an accessory bar. Kept in its own module (not
 * editorLayout.ts) because AccessoryBar.tsx needs it and editorLayout.ts
 * imports EditorLayoutV1.tsx -> AccessoryBar.tsx, which would otherwise
 * create a require cycle.
 */
export const EDITOR_ACCESSORY_VIEW_ID = 'lynx-editor-accessory-bar';
