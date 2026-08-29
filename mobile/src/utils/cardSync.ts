import type { Card } from '@/types/card';
import { supabase } from '@/utils/supabase';
import type { Json } from '../../../shared/types/supabase';

/**
 * Direct writes to the `cards` row for front-of-card edits: the identity
 * fields, chosen material, and the `style` JSON blob (template, font,
 * font color, per-field style overrides).
 *
 * Mirrors linksSync: best-effort, returns `{ ok }` rather than throwing.
 * The store has already updated in memory and written the local cache, so
 * a failure here (offline, RLS, transient) just marks the cache dirty and
 * the DB catches up later via AuthProvider's dirty re-push.
 *
 * `setField` / `setFieldStyle` fire on every keystroke and slider tick, so
 * callers debounce via `scheduleCardSync` rather than calling `syncCard`
 * directly.
 */
export interface SyncResult {
  ok: boolean;
}

const ok: SyncResult = { ok: true };
const failed: SyncResult = { ok: false };

/** Flatten the client Card onto `cards` columns + the `style` JSON blob. */
function cardToRow(card: Card) {
  const { fields } = card;

  const identity =
    fields.context === 'jobSeeker'
      ? {
          context: 'jobSeeker',
          full_name: fields.fullName,
          headline: fields.headline || null,
          target_role: fields.targetRole || null,
          education: fields.education || null,
          location: fields.location || null,
          phone: fields.phone || null,
          email: fields.email || null,
          // null the employed-only columns so a context switch doesn't
          // leave stale values that trip cards_context_fields_check.
          company_name: null,
          job_title: null,
          department: null,
        }
      : {
          context: 'employed',
          full_name: fields.fullName,
          company_name: fields.companyName || null,
          job_title: fields.jobTitle || null,
          department: fields.department || null,
          location: fields.location || null,
          phone: fields.phone || null,
          email: fields.email || null,
          headline: null,
          target_role: null,
          education: null,
        };

  return {
    ...identity,
    material_id: card.materialId,
    style: {
      templateId: card.templateId,
      ...(card.fontId !== undefined && { fontId: card.fontId }),
      ...(card.fontColorId !== undefined && { fontColorId: card.fontColorId }),
      ...(card.fontColorHex !== undefined && { fontColorHex: card.fontColorHex }),
      fieldStyles: card.fieldStyles ?? {},
    } as unknown as Json,
    updated_at: new Date().toISOString(),
  };
}

export async function syncCard(cardId: string, card: Card): Promise<SyncResult> {
  try {
    const { error } = await supabase.from('cards').update(cardToRow(card)).eq('id', cardId);
    return error ? failed : ok;
  } catch {
    return failed;
  }
}

const DEBOUNCE_MS = 600;
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Coalesce a burst of card edits into one DB write. `onResult` runs with
 * the write's outcome so the store can mirror it to the local cache
 * (dirty on failure).
 */
export function scheduleCardSync(
  cardId: string,
  getCard: () => Card,
  onResult: (synced: boolean) => void,
): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void syncCard(cardId, getCard()).then((r) => onResult(r.ok));
  }, DEBOUNCE_MS);
}

/** Flush a pending debounced sync immediately (e.g. on screen blur / sign-out). */
export function flushCardSync(
  cardId: string,
  getCard: () => Card,
  onResult: (synced: boolean) => void,
): void {
  if (!timer) return;
  clearTimeout(timer);
  timer = null;
  void syncCard(cardId, getCard()).then((r) => onResult(r.ok));
}
