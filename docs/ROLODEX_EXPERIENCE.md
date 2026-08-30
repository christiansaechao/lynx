# The Rolodex Experience (Contact Management)

The Rolodex is how users view and manage the digital business cards they have collected from others. To prevent it from feeling like a boring spreadsheet or traditional address book, the Rolodex employs gamified micro-interactions.

## Implementation Status

**Screen: built, seeded with mock data.** `mobile/src/app/rolodex.tsx` renders three interchangeable views over the collection — Grid, List, and a Wheel picker (drag up/down to spin through contacts, native-picker-style: the centered card scales up, neighbors shrink/fade by distance, release snaps to nearest) — plus search and folder-filter chips. Each contact renders in its own saved material via `ContactTile.tsx` (reuses `CardMaterial`, same as the real card). Reached from the back of the user's own card via a small cog icon (`CardBack.tsx`'s `onOpenRolodex`) — the "secret door" from section 1 below.

Data model: `ContactCard`/`RolodexFolder` in `mobile/src/types/card.ts`. Store: `mobile/src/store/useRolodexStore.ts` (Zustand, **in-memory only** — no AsyncStorage cache, no Supabase table). Seed data: `mobile/src/constants/rolodexMock.ts`, 8 contacts across 8 materials.

**Not built — everything below this line is still spec, not code:**
- **No capture flow.** There is no way to actually collect a real contact yet. `expo-camera` and `react-native-nfc-manager` are already dependencies but unused for this — QR scanning and NFC receive both need to be built and wired to `useRolodexStore.addContact`.
- **No persistence.** The store resets to the mock seed on every relaunch. No `collected_cards`/`folders` Supabase tables or RLS policies exist.
- **Active Folders (section 1 below) is unimplemented.** The store has `setActiveFolder`/`addFolder`, but nothing in the UI calls them, and there's no auto-routing logic on capture (because there's no capture yet).
- **Post-Meetup Sorting (section 2 below) does not exist.** No swipe-stack screen, no push notification trigger.
- **Starred/notes are wired in the store but not exposed in the UI.** `toggleStarred`/`setNote` exist on `useRolodexStore`; no tap target in `rolodex.tsx` calls them yet.

See [Product Requirements](./PRODUCT_REQUIREMENTS.md) for how this fits into the rest of Phase 1, and [Roadmap](./ROADMAP.md) for what's planned beyond it.

## 1. Active Folders (During the Event)
- When a user attends an event (e.g., "Tech Fair 2026"), they create a folder and mark it as **Active**.
- While they are on the convention floor, any card they scan or receive via NFC is silently and automatically routed into this folder. 
- *The Goal:* Keep the user focused entirely on the human conversation, not on data entry or manual sorting.

## 2. The "Post-Meetup" Sorting (Tinder-Style UX)
When the user gets home or back to their hotel room, they receive a push notification: *"View the 45 Lynx connections you made today."*

Clicking this opens the **Post-Meetup Sorting UI**:
- **The Visuals:** The screen displays a stack of the massive, beautiful 3D digital cards they collected that day, one at a time, exactly as the original user designed them (preserving the Holographic, Obsidian, or Bone materials).
- **The Mechanics (Tinder-Style Swiping):**
  - **Swipe Left (File to General):** The user swipes the card to the left. The card flies off-screen and is filed into the general event folder. It is saved, but not prioritized.
  - **Swipe Right (Star & Prioritize):** The user swipes the card to the right. The card gets a "Starred" badge. These are the high-value contacts (the VIP recruiters, the hot leads). 
  - **Swipe Up (Add Private Note):** Swiping up pauses the stack and opens a quick keyboard prompt to add a private note: *"Met at the Google booth, loves React Native."*

## 3. The Power of the Swipe
Why this interaction works:
1. **Gamification:** It turns the incredibly tedious chore of organizing contacts into a highly satisfying, tactile mini-game.
2. **Context Preservation:** Looking at the *actual visual design* of the card they received triggers memory recall much better than looking at a standard list of names. If they remember the guy who had the "Carbon Fiber" card, they will instantly recognize it when it pops up in the stack. 
3. **Action-Oriented:** By forcing a Left/Right decision on every card, it acts as a filter. When they wake up the next morning, they know exactly which 5 "Starred" (Right-Swiped) contacts they need to send follow-up emails to using their Personal CRM tools.
