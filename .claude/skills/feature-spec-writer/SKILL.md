---
name: feature-spec-writer
description: Use when the user asks to draft, add, or update a feature/product spec doc for Lynx (new docs/*.md page, or a new Roadmap/PRD entry) — keeps new spec docs consistent in structure and tone with the existing docs/ set.
---

# Writing Lynx Feature Specs

Lynx's `docs/` directory is the product's single source of truth (see `docs/README.md` for the index). New spec docs should match the existing style so they read as part of the same set, not bolted on.

## Before writing

1. Read `docs/README.md` to see where the new doc fits in the numbered table of contents, and add an entry there.
2. Skim 1-2 existing docs most similar to what you're writing (e.g., `EDITOR_SPEC.md` for a UI feature, `ONBOARDING_EXPERIENCE.md` for a flow, `ROADMAP.md` for a not-yet-built idea) to match heading depth and tone.
3. Check whether the feature already has a stub or related mention in `PRODUCT_REQUIREMENTS.md` or `ROADMAP.md` — don't create a duplicate, extend the existing section if so.

## Structure conventions observed across existing docs

- Title as `# Feature Name`, no author/date metadata.
- Open with a short **Overview** or **Philosophy** paragraph stating the problem/why before the how.
- Prefer numbered flows (`### Step 1: ...`) for sequential UX, and `##` subsections for feature clusters (see `PRODUCT_REQUIREMENTS.md`'s numbered core features).
- Bold the concept name inline the first time it's introduced (e.g., **Active Folders**, **The Master QR Code**) — these become the vocabulary reused across other docs. Reuse existing bolded terms verbatim rather than renaming them.
- Concrete, evocative examples over abstract description — every doc uses named examples ("Tech Fair 2026", "Patrick Bateman", specific dollar amounts/percentages) rather than placeholders like "Company X".
- End major strategy docs with a **Why this works** / **Conclusion** section connecting the feature back to the core thesis (viral growth, frictionless onboarding, or the "American Psycho" premium aesthetic) — not required for pure spec/reference docs like `DATA_MODEL.md`.
- Roadmap entries (`ROADMAP.md`) additionally include a **What needs to be true first** subsection for anything with real dependencies — use this for features that aren't safe to build yet.

## Cross-doc consistency to check

- Terminology: "Rolodex" (not "contacts list"), "Active Folder" (not "event folder"), "Master QR Code", "the flip" — reuse exact terms.
- If the feature touches monetization, cross-check `MONETIZATION_STRATEGY.md`'s free-core-experience philosophy before proposing any paywall.
- If the feature touches the card front/back fields, cross-check `DATA_MODEL.md` (see [[card-data-model]] skill) so the spec doesn't invent fields that conflict with the existing schema.
- If the feature is aspirational/not-yet-scheduled, it belongs in `ROADMAP.md`, not `PRODUCT_REQUIREMENTS.md`.

## Output

Write the new doc to `docs/<UPPER_SNAKE_CASE>.md` and add its entry to the numbered list in `docs/README.md`.
