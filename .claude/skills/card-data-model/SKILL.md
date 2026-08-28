---
name: card-data-model
description: Use whenever building or modifying features that touch a user's card fields, profile data, or links (front/back of card, editor, Rolodex display, API/DB schema) — ensures the dual Employed/Job-Seeker context and Link object model stay consistent with docs/DATA_MODEL.md.
---

# Lynx Card Data Model

Lynx cards render the same minimalist layout for two mutually exclusive user contexts. Never assume only one context exists — always check which profile type a card uses before reading/writing its fields.

## Two profile contexts (front of card)

A card is **either** Employed/Business **or** Job Seeker/Student — not both. The layout slots are shared, but the underlying field differs:

| Layout slot | Employed / Business | Job Seeker / Student |
|---|---|---|
| Top | `companyName` | `headline` |
| Center | `fullName` | `fullName` |
| Below name | `jobTitle` | `targetRole` |
| Below title | `department` | `education` |
| Bottom corner | `location`, `phone`, `email` | `location`, `phone`, `email` |

When adding a new field or feature, decide explicitly which context(s) it applies to. Don't hardcode "companyName" as if every user has one — job seekers don't.

## Back of card: Links

Links are a dynamic array, not fixed fields. Each entry:

```
{
  id: string        // unique identifier
  platform: string  // e.g. "LinkedIn", "GitHub", "Personal Portfolio"
  url: string
  isActive: boolean // hide without deleting
}
```

Rules to preserve:
- Order is user-controlled (drag to reorder) — don't silently re-sort.
- `isActive: false` means hidden, not deleted — never filter these out of storage/sync, only out of the rendered card/QR grid.
- The Master QR Code is a distinct, always-present concept — it's not just another Link entry; it renders a downloadable snapshot of the full card (front+back), separate from the App Grid of individual link icons.

## When extending the schema

- New profile fields must be added to **both** contexts explicitly, or clearly scoped to one with a plan for how the other context's card handles its absence (e.g., hide the slot, don't render an empty label).
- Job Seeker fields (work history, education, portfolio links) are the fields most likely to be consumed by future ATS/Universal-Apply integrations (`docs/ROADMAP.md`) — keep them structured/typed rather than free-text where feasible, since that roadmap item depends on clean field mapping.
- Check `shared/types` for the canonical TypeScript definitions before adding a parallel/duplicate type in `mobile` or `web`.
