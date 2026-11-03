# MenúYA · Week 13 — DECISIONS

## 2026-11-02 — Feature 1: scaffold + landing + Deploy 1

**Decisions**
- Next.js 16.4 (App Router, TypeScript, Tailwind v4, `src/` dir) generated with `create-next-app`.
- Mobile-first layout: single column, `max-w-md`, warm green (#2f7d4f) on off-white (#fbf8f1), as in the PACKET mockup prompt.
- `.gitignore` covers `.env*`, `node_modules`, `.vercel`, `supabase/.temp`.
- UI language: `es-MX`.
- Private repo: https://github.com/Josep-builds/menuya · Vercel project `menuya` (team josepbuilds), linked to the repo.
- Production URL: https://menuya-theta.vercel.app (`menuya.vercel.app` belongs to another account). Real domain: pending.

## 2026-11-02 — Shared Supabase project (owner's rules)

Owner stays on the free plan (2 active projects max). Paused `peldano-venture`, reactivated `quien-rompe-paga`. **MenúYA does NOT get its own Supabase project: it uses `mapa-tandeo` (`icohpikxtlqhkpvmvtuv`).**

Rules for working inside `mapa-tandeo`:
1. Every new MenúYA table has the prefix `menuya_` (`menuya_profiles`, `menuya_baseline_orders`, `menuya_waste_logs`, `menuya_impulse_logs`, `menuya_events`).
2. Never modify or delete anything that already exists (mapa-tandeo tables, policies, functions, triggers, migration history).
3. Do not change Auth **Site URL**. Only **add** MenúYA URLs to Auth → Redirect URLs.
4. Google is already enabled as a provider → reuse it as-is, do not change its configuration.

What mapa-tandeo had before MenúYA (read-only check, 2026-11-02):
- Tables (`public`): `block_week_stats`, `blocks`, `devices`, `flags`, `readings` (all RLS on) + view `readings_public`. Migration history: `0001 init`, `0002 street_label`.
- No triggers on `auth.users`, no functions in `public`.
- Auth providers enabled: `google`, `email`. 1 existing Google identity.

Consequences / how we work with it:
- MenúYA migrations live in `db/migrations/` and are applied with `supabase db query --linked -f …`. They are **not** written to `supabase_migrations.schema_migrations` (that history is mapa-tandeo's). Do not run `supabase db push` from this repo.
- No trigger on `auth.users` (that would touch a shared table): the `menuya_profiles` row is created by the app in `/auth/callback` (RLS: own row only).
- Since Site URL points to mapa-tandeo, every OAuth call passes an explicit `redirectTo` to `<origin>/auth/callback`; if that URL is not in Redirect URLs, Supabase would fall back to mapa-tandeo's Site URL.
- The Google consent screen will show mapa-tandeo's OAuth app name (we can't change it without touching its config). Logged for the persona test.
- "Borrar mis datos" deletes MenúYA rows only. The `auth.users` row is shared with mapa-tandeo and can only be deleted from the dashboard on request (no service role key in the app).
- ⚠️ Cross-app risk (not changed, rule 2): mapa-tandeo's `devices` policy is `ALL` for `owner = auth.uid()`, so any signed-in MenúYA user could create rows in mapa-tandeo's `devices`/`readings`/`flags` using the anon key. Owner should decide whether to tighten it in mapa-tandeo.
- Stray: the Supabase CLI's `db query --linked` initialises a temporary CLI login role on each run (Supabase-managed, not a schema change).

## 2026-11-02 — Feature 2: Google sign-in + consent + RLS

**Decisions**
- `@supabase/ssr` + `@supabase/supabase-js`, anon key only (browser and server). No service role key anywhere.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and in Vercel (production, preview, development). `NEXT_PUBLIC_PAY_LINK` placeholder only in `.env.local` for now.
- `cacheComponents` turned off: almost every screen depends on the session cookie.
- `src/proxy.ts` (Next 16's name for middleware) refreshes the session and sends signed-out users to `/entrar`. Real checks happen on the server: the `(app)` route group layout calls `requireConsent()`, so no app screen is reachable without sign-in **and** `consent_at`.
- `menuya_profiles`: `user_id` pk → `auth.users` (on delete cascade), `city` (2–60 chars), `grocery_band` check in `('<2500','2500-3500','>3500')`, `consent_at`, `created_at`. RLS on, select/insert/update/delete only where `auth.uid() = user_id`; no grants to `anon`.
- Consent screen asks city + monthly grocery band (zod, Spanish messages) + "Acepto" checkbox → stores `consent_at`.
- Privacy notice: plain Spanish, cites the 2025 LFPDPPP, no mention of INAI; says what is stored, why, that ELCSA answers never leave the phone, and how to delete data (Perfil → Borrar mis datos). ARCO requests go "through the chat/group where you got the link". A real contact email is pending.
- `signed_in` / `consent_given` events will be written once `menuya_events` exists (Feature 5).

**Pending from the owner**
- Add MenúYA URLs to mapa-tandeo → Authentication → URL Configuration → Redirect URLs.
- Domain: bought or not?

**Tomorrow's first move**
- After the Redirect URLs are in, sign in end-to-end on https://menuya-theta.vercel.app, then Feature 3 (on-device ELCSA).
