# Architecture & Tech Stack

## System Architecture Overview
The Lynx ecosystem is structured around four macroscopic pillars, utilizing a Backend-as-a-Service (BaaS) and Offline-First Sync model:

1. **The Mobile Application (End-User):** Built with React Native (Expo) for iOS and Android. This is the primary interface where individuals design their cards, share via NFC/QR, and manage their Rolodex.
2. **The Web Application (B2B Admin):** A companion desktop-first web application (Next.js/React). This is where companies log in to design corporate templates, manage employee seats, and view networking analytics.
3. **The Cloud Backend (Supabase):** The centralized source of truth. It provides PostgreSQL for relational data (Companies -> Employees -> Cards), user authentication, and Edge Functions (for external API calls like CRM syncs). Both the Mobile and Web apps communicate directly with Supabase via its client SDKs, bypassing the need for a custom monolithic server.
4. **Offline-First Sync Engine:** The mobile app treats its local storage (`MMKV` or `AsyncStorage`) as the primary data layer. When an action occurs (e.g., scanning a card), it saves locally instantly. A background worker then silently syncs the data to Supabase when an internet connection is available, ensuring flawless operation in offline environments (like convention centers).

## Core Technologies
- **Framework:** React Native / Expo
- **Navigation:** Expo Router (file-based routing) or React Navigation
- **Styling:** StyleSheet, NativeWind (Tailwind), or styled-components (TBD based on preference)
- **Animations:** React Native Reanimated (crucial for smooth 3D flip animations and micro-interactions).
- **QR Code Generation:** A library such as `react-native-qrcode-svg`.
- **NFC Integration:** A library such as `react-native-nfc-manager` to handle the physical "tap to share" interactions between devices.

## Data Management & Backend
- **State Management:** React Context or a lightweight library like Zustand for managing the card's active state and user preferences.
- **Backend & Database:** To support the Enterprise Web Dashboard and cross-device syncing, the application requires a centralized cloud database.
  - **Proposed Solution:** Supabase (PostgreSQL) or Firebase. Supabase is highly recommended because its relational data model is perfect for managing hierarchies (Companies -> Departments -> Employees -> Cards) and it has excellent authentication built-in.
- **Offline-First Caching:** `AsyncStorage` or `MMKV` will still be used heavily to cache the user's card and their Rolodex locally. This is a critical requirement so the app still functions perfectly offline (e.g., in a basement convention center with poor cell service) and syncs to the cloud in the background once a connection is re-established.

## Component Structure
- `CardFront`: The highly customizable front face.
- `CardBack`: The reverse side containing links and QR codes.
- `CardContainer`: Manages the flip animation and state between front and back.
- `CardMaterial`: Owns gyroscope-driven tilt input and per-material rendering (gradients, and eventually Skia shaders) sitting beneath `CardFront`/`CardBack`. See [Card Materials: Technical Implementation](./CARD_MATERIALS_IMPLEMENTATION.md).
- `Editor`: The UI for modifying card details.
