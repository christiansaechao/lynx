import { DEFAULT_TEMPLATE_ID } from '@/constants/cardTemplates';
import type { Card, CardFontColorId, CardFontId, CardMaterialId, Link } from '@/types/card';
import type { Database } from '../../../shared/types/supabase';

type CardRow = Database['public']['Tables']['cards']['Row'];
type LinkRow = Database['public']['Tables']['links']['Row'];

/**
 * Maps a Supabase `cards` row (+ its `links` rows) onto the client Card
 * shape. This is the inverse of onboarding.tsx's insert -- it's what lets a
 * returning user (app relaunch, new device) see their own data on the card
 * screen instead of the store's seeded mockup default.
 */
export function mapCardRow(row: CardRow, links: LinkRow[]): Card {
  const fields =
    row.context === 'jobSeeker'
      ? {
          context: 'jobSeeker' as const,
          headline: row.headline ?? '',
          fullName: row.full_name,
          targetRole: row.target_role ?? '',
          education: row.education ?? '',
          location: row.location ?? '',
          phone: row.phone ?? '',
          email: row.email ?? '',
        }
      : {
          context: 'employed' as const,
          companyName: row.company_name ?? '',
          fullName: row.full_name,
          jobTitle: row.job_title ?? '',
          department: row.department ?? '',
          location: row.location ?? '',
          phone: row.phone ?? '',
          email: row.email ?? '',
        };

  return {
    fields,
    links: links
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(
        (link): Link => ({
          id: link.id,
          platform: link.platform,
          url: link.url,
          isActive: link.is_active,
        }),
      ),
    // material_id and style.templateId are both free-form text columns (no
    // enum), so an unrecognized value here falls back to the default template
    // rather than crashing the card screen -- see getCardTemplate.
    materialId: (row.material_id as CardMaterialId) || 'bone',
    templateId: (row.style as { templateId?: string } | null)?.templateId ?? DEFAULT_TEMPLATE_ID,
    // fontId/fontColorId are optional overrides -- absent means "use the
    // template's own font/colors", same as a freshly-minted card with
    // neither set. See getCardTemplate / useCardTemplateStyle.
    fontId: (row.style as { fontId?: CardFontId } | null)?.fontId,
    fontColorId: (row.style as { fontColorId?: CardFontColorId } | null)?.fontColorId,
    fieldStyles: (row.style as { fieldStyles?: Card['fieldStyles'] } | null)?.fieldStyles ?? {},
  };
}
