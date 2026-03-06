# Feature: Profile Page

## Goal
Add a `/profile` page where authenticated users can view and update their profile information (first name, last name). Email is shown read-only as it is tied to auth identity.

## Background & Context
- Users currently complete their profile once via `/auth/complete-profile` (onboarding-only, INSERT only)
- There is no way to edit profile info after initial setup
- The auth-status dropdown in the navbar already has a "Profile" link pointing at `/auth/complete-profile` — this will be updated to `/profile`
- `/profile` must be a protected route requiring authentication and a completed profile

## Research Summary
- **Profile schema** (`lib/supabase/database.types.ts`): `id`, `first_name`, `last_name`, `email`, `created_at`, `updated_at`
- **Profile interface** (`lib/types.ts`): matches schema exactly
- **Existing form pattern** (`app/auth/complete-profile/page.tsx`): client component, uses `createClient()` from `lib/supabase/client.ts`, ShadCN `Card`/`Input`/`Button`/`Label`, local state for fields + error + loading
- **Route protection** (`lib/supabase/middleware.ts`): `PROTECTED_ROUTES` array — add `"/profile"` here; middleware handles redirect to sign-in (unauthenticated) and to `/auth/complete-profile` (no profile)
- **Auth-status dropdown** (`components/auth-status.tsx`): Profile link currently points to `/auth/complete-profile`

## Approach
Create a new `/profile` page that pre-fetches the current user's profile and allows editing first/last name. Use `supabase.from("profiles").update(...)` on submit. Keep `/auth/complete-profile` unchanged for the onboarding flow.

Alternatives considered:
- **Merge into `/auth/complete-profile`**: Rejected — keeps onboarding and editing concerns separate and avoids changing a working auth flow.

## Implementation Tasks
- [ ] Create `app/profile/page.tsx` — client component; fetch user + profile on mount; form with read-only email, editable first/last name; `update()` on submit; success/error feedback
- [ ] Add `"/profile"` to `PROTECTED_ROUTES` in `lib/supabase/middleware.ts`
- [ ] Update the Profile link in `components/auth-status.tsx` from `/auth/complete-profile` to `/profile`

## Files to Create / Modify
- `app/profile/page.tsx` — **new file**: profile view/edit page
- `lib/supabase/middleware.ts` — add `"/profile"` to `PROTECTED_ROUTES`
- `components/auth-status.tsx` — update Profile link href to `/profile`

## Constraints & Hard Rules
- Do not modify `/auth/complete-profile` — it must remain as the onboarding INSERT flow
- Email must be read-only (not editable); changing email requires a separate Supabase auth flow
- Use `getUser()` (not `getSession()`) for auth checks, consistent with existing patterns
- Follow existing ShadCN + `cn` utility patterns; no new dependencies
- Use `import type` for type-only imports (ESLint rule enforced)

## Testing Plan
1. `npm run build` — no type or build errors
2. `npm run lint` — ESLint passes
3. Manual:
   - Sign in → open user dropdown → click "Profile" → navigates to `/profile`
   - Form pre-fills with current first name, last name; email is displayed read-only
   - Edit first/last name → submit → success message shown
   - Refresh → updated values persist
   - Sign out → navigate to `/profile` → redirected to sign-in

## Open Questions
None — requirements confirmed.
