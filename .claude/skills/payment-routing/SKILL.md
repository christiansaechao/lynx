---
name: payment-routing
description: Use whenever adding or reviewing any payment, purchase, subscription, or checkout code in Lynx (mobile or web) — determines whether a product must go through RevenueCat (Apple/Google IAP) or Stripe, to avoid App Store rejection and unnecessary 30% platform tax.
---

# Payment Routing (RevenueCat vs. Stripe)

Lynx splits its payment stack strictly by product type, per `docs/MONETIZATION_STRATEGY.md`. Getting this wrong risks App Store rejection (using Stripe for a digital good) or needlessly giving up margin (using IAP for something that qualifies for Stripe).

## The rule

**If the product is a digital good consumed inside the mobile app → RevenueCat (native IAP).**
**If the product is a physical good, or a subscription/service purchased on the web dashboard → Stripe.**

Apple/Google mandate native IAP only for digital goods *purchased and consumed inside the app*. Everything else can legally bypass the App Store tax.

## Decision checklist

Before writing checkout/purchase code, answer:

1. **Is this a physical, shippable item?** (e.g., metal/carbon-fiber NFC card) → **Stripe** (`Stripe React Native SDK`, mobile-initiated but physical-goods exception applies).
2. **Is this a recurring subscription purchased through the web dashboard** (Pro Individual, Enterprise/B2B seats)? → **Stripe Billing** on the Next.js web app. Never build these as mobile IAP.
3. **Is this a one-off cosmetic or digital unlock consumed in the mobile app** (premium layout template, 3D material/texture like Holographic Prism)? → **RevenueCat**.
4. **Is this a B2B add-on sold to companies on the web** (Salesforce/HubSpot CRM sync add-on)? → **Stripe Billing** on web.

## Reference table

| Product | Platform | Payment rail |
|---|---|---|
| Premium layout template ($2.99) | Mobile | RevenueCat |
| Cosmetic 3D material / texture | Mobile | RevenueCat |
| Physical metal/carbon NFC card ($50-100) | Mobile-initiated | Stripe (physical goods exception) |
| Pro Individual subscription ($4.99/mo) | Web dashboard only | Stripe Billing |
| Enterprise seats ($10/seat/mo) | Web dashboard only | Stripe Billing |
| CRM integration add-on ($200/mo) | Web dashboard only | Stripe Billing |

## Red flags to catch in review

- Any mobile-app UI selling a subscription or recurring plan directly (should deep-link/redirect to the web dashboard instead — Apple prohibits linking out to purchase digital subscriptions from within the app in most cases, so subscription upsells should be presented as "manage on web" rather than an in-app checkout flow).
- Stripe SDK used for a cosmetic/digital unlock inside the mobile app — this is an Apple guideline violation.
- RevenueCat used for physical goods or web-only subscriptions — unnecessarily gives up margin (see the $13.25/card margin difference worked out in `MONETIZATION_STRATEGY.md`).

## When in doubt

Re-read `docs/MONETIZATION_STRATEGY.md` section 5 ("Payment Infrastructure Stack") before implementing, and ask the user to confirm the product classification if it doesn't clearly fit one of the four checklist buckets above.
