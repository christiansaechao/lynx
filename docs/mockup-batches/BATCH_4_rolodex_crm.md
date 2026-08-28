## LYNX — STYLE CORE (applies to every screen in this batch)

**Product:** Lynx is an electronic business card app for iOS/Android. Users design a beautifully typeset, physically-textured digital card and share it by QR or NFC tap at job fairs and meetups. We are not selling a contact app — we are selling a **digital status symbol**.

**Aesthetic — "American Psycho":** premium, obsessively clean, driven by typography and subtle texture. Restraint above all; whitespace is the primary design element. If a screen looks empty, it is correct. Perfect kerning, exact alignment, generous letter-spacing on small-caps labels. Surfaces carry paper grain, linen, embossing, and light glare — the card reads as a held object, not a rectangle.

**Do NOT include:** bottom tab bars on the card screen, hamburger menus, illustration-heavy empty states, mascots, emoji, bright accent colors as decoration, drop shadows on flat UI, or any "friendly SaaS" voice.

**Wordmark:** `Lynx.` — always with the trailing period, in an elegant high-contrast serif (Garamond/Didot/Canela). Loose, optically balanced kerning. No accompanying icon or symbol.

**App UI palette (strict monochrome — all color comes from card materials, never the interface):**

| Token | Light | Dark |
|---|---|---|
| background | `#FFFFFF` | `#000000` |
| text | `#000000` | `#FFFFFF` |
| textSecondary | `#60646C` | `#B0B4BA` |
| backgroundElement (sheets, inputs, chips) | `#F0F0F3` | `#212225` |
| backgroundSelected (active row) | `#E0E1E6` | `#2E3135` |

**Render all screens in DARK MODE** unless a light variant is explicitly requested.

**Card "Bone" default material:** diagonal gradient `#FBFAF5` → `#E9E3D6`; primary ink `#1C1A14`; secondary ink `#4A463C`; name letter-spacing 0.5; labels all-caps at letter-spacing 2.5.

**Card geometry:** business-card aspect ratio 1.75:1 landscape, corner radius 12–16pt (a real die-cut card, never a pill).

**Spacing scale:** 2 / 4 / 8 / 16 / 24 / 32 / 64 pt, used strictly.

**Motion feel:** tactile and damped, never bouncy. The signature interaction is a realistic 3D flip with a light-glare sweep across the material.

---

# BATCH 4 of 5 — Rolodex, Sorting & CRM

These screens use the **conventional app layout** — header, scrollable lists — reached through "the secret door" (the cog on the card's back). This is the CRM software that stays hidden until the user is alone and actually wants it.

Design these **6 screens**.

### 1. The Secret Door — Transition
A 3-frame sequence on one artboard: card back with cog → cog tapped, card shrinking away → the app shell resolving into a conventional header + list layout. This transition is the product's most important structural idea.

### 2. Rolodex — Collection
Searchable grid of cards collected from other people, **each preserved in its original high-fidelity design** — someone's Carbon Fiber card still renders as Carbon Fiber, someone's Holographic as Holographic. Visual recall beats a list of names; that is the entire point of this screen. Show a mix of materials.

### 3. Rolodex — List View, Search & Empty State
One artboard, three states: compact list view, active search with results, and the empty state (typographic and restrained — no illustration).

### 4. Folders
Event folders ("Tech Fair 2026") with one marked **Active** via a clear but understated indicator. While a folder is active, every card scanned or tapped is silently auto-routed into it, so the user never sorts mid-conversation. Include the create/activate flow.

### 5. Post-Meetup Sorting (Tinder-style)
Entered from a push notification: *"View the 45 Lynx connections you made today."* A stack of large, beautiful 3D cards in their original materials, one at a time. Show on one artboard: the resting stack, a mid-swipe state with directional affordance, and the completion summary.
- **Swipe left** — file to the general event folder (saved, not prioritized)
- **Swipe right** — Star & prioritize; card gets a "Starred" badge (VIP recruiters, hot leads)
- **Swipe up** — pauses the stack, opens a quick note prompt: *"Met at the Google booth, loves React Native."*

### 6. Personal CRM / Analytics
Lightweight, typographic, chart-minimal — a quiet report, not a dashboard.
- Portfolio analytics: *"GitHub — 4 clicks today. Portfolio — 1."*
- Scan counts: *"Your card was scanned 12 times this week."*
- Follow-Up Nudges: swipe a collected card to set a reminder (*"email this person in 48 hours"*); show the nudge-setting UI and the nudge list.
- An **Intro** button that auto-drafts a contextual follow-up: *"Hi [Name], it was great meeting you at [Event]…"*
