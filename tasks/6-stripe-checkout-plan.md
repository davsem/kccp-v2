# Stripe Checkout Journey — Implementation Plan

## Context

The KCCP-v2 app lets supporters sponsor 1m² sections of a hockey pitch (200 sections, £50/£100 each). Currently, users can select sections and view them in a basket, but there's no way to purchase. This plan adds a full checkout flow using Stripe Elements, with per-section owner names, GiftAid declaration, and real-time section availability.

---

## Phase 1: Foundation

### 1.1 Install packages
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npx shadcn@latest add checkbox switch alert steps -y
```

### 1.2 Environment variables (`.env.local`)
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 1.3 Database migration (Supabase)
Create tables via `mcp__supabase__apply_migration`:

**`orders`** — one row per checkout
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| stripe_payment_intent_id | TEXT UNIQUE | |
| amount_total | INTEGER | pence |
| currency | TEXT | default 'gbp' |
| status | order_status enum | pending / completed / failed |
| gift_aid | BOOLEAN | |
| billing_name, billing_address_line1, billing_address_line2, billing_city, billing_postal_code, billing_country | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

**`order_items`** — one row per section in an order
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK→orders | CASCADE delete |
| section_id | TEXT | e.g. "3-7" |
| price | INTEGER | pence |
| owner_name | TEXT | |
| show_owner_name | BOOLEAN | default true |

**`purchased_sections`** — populated by webhook, queried by pitch grid
| Column | Type | Notes |
|---|---|---|
| section_id | TEXT PK | uniqueness enforced |
| order_id | UUID FK→orders | |
| user_id | UUID FK→auth.users | |
| owner_name | TEXT | |
| show_owner_name | BOOLEAN | |
| purchased_at | TIMESTAMPTZ | |

RLS policies:
- `orders` / `order_items`: users SELECT/INSERT own rows
- `purchased_sections`: anyone can SELECT (pitch needs it), only service_role can INSERT
- Webhook uses service_role key to bypass RLS for updates

### 1.4 New utility files
- **`lib/stripe/server.ts`** — Stripe Node.js client singleton
- **`lib/stripe/client.ts`** — `loadStripe()` promise export
- **`lib/supabase/admin.ts`** — service_role Supabase client for webhook
- **`lib/types.ts`** — add `BillingAddress`, `SectionOwnerConfig`, `Order`, `OrderItem`, `PurchasedSection` interfaces

---

## Phase 2: Pitch Grid — Show Sold Sections

### Files to modify:
- **`app/pitch/page.tsx`** — fetch `purchased_sections` server-side, pass as prop
- **`components/pitch-grid.tsx`** — accept `purchasedSections` prop, mark sections unavailable
- **`components/pitch-section-cell.tsx`** — new "sold" state (muted + optional owner name on hover when `show_owner_name` is true)

---

## Phase 3: Basket → Checkout CTA

### Files to modify:
- **`components/basket-content.tsx`** — add "Proceed to Checkout" button (Link to `/checkout`), detect stale basket items (sections bought while user was browsing)
- **`lib/basket-context.tsx`** — add `removeMultiple(ids: string[])` for removing stale items

---

## Phase 4: API Routes

### `app/api/checkout/create-payment-intent/route.ts` (POST)
1. Authenticate user via server Supabase client + `getUser()`
2. Validate section IDs exist in `pitch-data.ts`
3. Check `purchased_sections` table — reject if any are already sold (409)
4. Calculate total server-side from `pitch-data.ts` prices (never trust client)
5. Create Stripe PaymentIntent (amount in pence, GBP, metadata with orderId + sectionIds)
6. Insert `orders` (pending) + `order_items` rows
7. Return `{ clientSecret, orderId }`

### `app/api/webhooks/stripe/route.ts` (POST)
1. Verify Stripe signature (`stripe.webhooks.constructEvent`)
2. `payment_intent.succeeded`: update order to `completed`, insert into `purchased_sections` in a transaction. If section PK conflict → refund via Stripe API, mark order `failed`
3. `payment_intent.payment_failed`: update order to `failed`
4. Uses `supabaseAdmin` (service_role) to bypass RLS

**Race condition strategy**: Two users selecting the same section → both can create PaymentIntents, but only the first successful webhook insert into `purchased_sections` wins (PK constraint). The loser gets an automatic refund.

---

## Phase 5: Checkout UI

### `app/checkout/page.tsx` — server component
- Already a protected route (middleware)
- Fetch user profile, pass to client component

### `components/checkout-content.tsx` — client orchestrator
Multi-step flow: **Names → Billing → Review & Pay**

### Step 1: `components/checkout/section-owner-names.tsx`
- Switch toggle: "Use my name for all sections" (default ON, prefills `${profile.first_name} ${profile.last_name}`)
- Per section: label, price, owner name input (disabled when bulk toggle is on), "Show name publicly" checkbox
- "Name this section differently" button per row to enable override
- "Continue to Billing" button

### Step 2: `components/checkout/billing-payment.tsx`
- Billing address form (name prefilled from profile)
- Fields: name, address line 1, address line 2, city, postcode, country
- Full HMRC GiftAid declaration text with explicit consent checkbox
- "Review Order" button → calls `create-payment-intent` API

### Step 3: `components/checkout/order-review.tsx`
- Summary of sections with owner names + visibility
- Billing address, GiftAid status, total
- Stripe `<Elements>` + `<PaymentElement>` for card input
- "Pay £X" button → `stripe.confirmPayment()` with `return_url` to confirmation page
- Back button to edit details

### `components/checkout/payment-form.tsx`
- Stripe `PaymentElement` wrapper with error display
- Handles `confirmPayment` and loading states

---

## Phase 6: Confirmation Page

### `app/checkout/confirmation/page.tsx`
- Reads `payment_intent` from URL params (Stripe redirects here)
- Verifies PaymentIntent status server-side
- Fetches order + items from Supabase
- Displays: order number, sections with owner names, total, GiftAid, billing address
- Handles "processing" state (webhook may not have fired yet)
- "Return to Pitch" CTA
- Clear basket on successful confirmation

---

## Phase 7: Existing File Modifications Summary

| File | Change |
|---|---|
| `lib/types.ts` | Add `BillingAddress`, `SectionOwnerConfig`, `Order`, `OrderItem`, `PurchasedSection` |
| `app/pitch/page.tsx` | Fetch purchased sections server-side, pass to grid |
| `components/pitch-grid.tsx` | Accept `purchasedSections` prop, disable sold cells |
| `components/pitch-section-cell.tsx` | Add "sold" visual state, optional owner name hover |
| `components/basket-content.tsx` | Add "Proceed to Checkout" CTA, stale item detection |
| `lib/basket-context.tsx` | Add `removeMultiple()` method |
| `lib/supabase/database.types.ts` | Regenerate after migration |

---

## Verification Plan

1. **Unit tests**: `create-payment-intent` route (mock Stripe + Supabase), webhook route (mock signature verification), checkout components
2. **Manual E2E flow**: Select sections → basket → checkout → fill names → billing + GiftAid → review → pay with Stripe test card `4242 4242 4242 4242` → confirmation
3. **Race condition test**: Open two browsers, select same section, pay in both — verify one succeeds and the other gets refunded
4. **Pitch grid**: After purchase, verify section shows as sold with owner name (when public)
5. **Stripe webhook**: Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local testing
