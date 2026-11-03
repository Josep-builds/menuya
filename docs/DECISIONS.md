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
- ⚠️ Cross-app risk (not changed, rule 2), re-checked read-only 2026-11-02:
  - mapa-tandeo has **no** triggers on any `auth` table, no event triggers, no triggers in `public`, and no functions that reference `auth.users`. So signing in to MenúYA creates **no** rows in mapa-tandeo tables by itself (only the shared `auth.users` / `auth.identities` / `auth.sessions` rows).
  - But a signed-in MenúYA user *could* write to mapa-tandeo on purpose with the public anon key + their session: `authenticated` has full grants, `devices` policy is `ALL` with `owner = auth.uid()` (`owner` defaults to `auth.uid()`, `blocks` is publicly readable), and once they own a device they can insert `readings`, insert `flags` and insert/update `block_week_stats` for that block. MenúYA's code never touches those tables. Owner decides whether to tighten mapa-tandeo's policies.
  - **Known risk, accepted by owner (2026-11-03): do NOT change mapa-tandeo's policies yet. Fix after Week 11 is graded.**
- Stray: the Supabase CLI's `db query --linked` initialises a temporary CLI login role on each run (Supabase-managed, not a schema change).

## 2026-11-02 — Feature 2: Google sign-in + consent + RLS

**Decisions**
- `@supabase/ssr` + `@supabase/supabase-js`, anon key only (browser and server). No service role key anywhere.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and in Vercel (production, preview, development). `NEXT_PUBLIC_PAY_LINK` placeholder only in `.env.local` for now.
- `cacheComponents` turned off: almost every screen depends on the session cookie.
- `src/proxy.ts` (Next 16's name for middleware) refreshes the session and sends signed-out users to `/entrar`. Real checks happen on the server: the `(app)` route group layout calls `requireConsent()`, so no app screen is reachable without sign-in **and** `consent_at`.
- `menuya_profiles`: `user_id` pk → `auth.users` (on delete cascade), `city` (2–60 chars), `grocery_band` check in `('<2500','2500-3500','>3500')`, `consent_at`, `created_at`. RLS on, select/insert/update/delete only where `auth.uid() = user_id`; no grants to `anon`.
- Consent screen asks city + monthly grocery band (zod, Spanish messages) + "Acepto" checkbox → stores `consent_at`.
- Privacy notice: plain Spanish, cites the 2025 LFPDPPP, no mention of INAI; says what is stored, why, that ELCSA answers never leave the phone, and how to delete data (Perfil → Borrar mis datos). ARCO requests / consent withdrawal: josepferre.g@icloud.com.
- `signed_in` / `consent_given` events will be written once `menuya_events` exists (Feature 5).

## 2026-11-02 — Deploy fix + Session Close

**What happened today**
- Feature 1 done (scaffold, landing, private repo, Deploy 1). Feature 2 done in code (Google sign-in, consent, `menuya_profiles` with RLS) and live.
- Vercel blocked the Feature 2 deploys twice: "couldn't find a Git account for the commit author" (`dulcefg@hotmail.com` is not linked to GitHub Josep-builds). Fix (owner chose option B): rewrote the author of every commit to `Josep-builds <315989793+Josep-builds@users.noreply.github.com>`, set that as this repo's local git identity, `git push --force-with-lease`. The next deploy came out Ready.
- No domain yet → continue with https://menuya-theta.vercel.app as the URL of record.
- Privacy notice ARCO contact: josepferre.g@icloud.com.

**Pending**
- Owner: add to mapa-tandeo → Authentication → URL Configuration → **Redirect URLs** (do not touch Site URL): `https://menuya-theta.vercel.app/**`, `https://menuya-*-josepbuilds.vercel.app/**`, `http://localhost:3000/**`. Until then Google sign-in lands on mapa-tandeo's Site URL.
- End-to-end sign-in test with a real Google account (not done yet: needs the Redirect URLs).
- Owner decision on mapa-tandeo's permissive `devices`/`readings`/`flags` policies (see above).
- Real domain (not bought yet).
- Features 3–6 of BUILD_PROMPT (ELCSA, logs, saving screen + events, mechanical test pass).

**Tomorrow's first move**
- Confirm the Redirect URLs are in, sign in end-to-end on https://menuya-theta.vercel.app (profile row created, consent required), then start Feature 3 (on-device ELCSA + comedores referral).

## 2026-11-03 — Domain, Supabase Pro, grants, Google branding check, Feature 3

**Domain**
- `menuyamx.xyz` bought in Vercel (Vercel DNS, expires 2027-11-03), attached to project `menuya`. Verified it serves the latest production deploy (`menuya-qqaalb76v…`, commit `e3ef780`). **URL of record: https://menuyamx.xyz.** `www.menuyamx.xyz` is not configured.
- Owner added MenúYA's Redirect URLs in mapa-tandeo (incl. `https://menuyamx.xyz/**`).

**Supabase Pro**
- Owner is on Pro. Asked to reactivate only `peldano`, `mi-total`, `peldano-venture`. Not done by Claude: the CLI has no restore command and the Management API token lives in the macOS keychain (access denied). Owner restores them from the dashboard.

**Grants (Supabase Data API change, enforced on existing projects from 2026-10-30)**
- New tables in `public` need explicit `GRANT`s. MenúYA tables: `authenticated` gets only `select, insert, update, delete` (events: no update), `anon` gets nothing, `service_role` full, RLS on.
- Found and fixed: `menuya_profiles` had inherited `TRUNCATE/TRIGGER/REFERENCES` for `authenticated` from the project's default privileges (`TRUNCATE` ignores RLS) → `db/migrations/002_menuya_grants.sql`. Default privileges and mapa-tandeo tables untouched (mapa-tandeo tables still grant everything to `anon` and `authenticated`, part of the known risk above).
- Every future `menuya_` migration starts with `revoke all … from anon, authenticated` + explicit grants.

**Google login check (read-only)** — see the session summary for the per-project table. Two Google Cloud projects identified by Client ID prefix (project number): `703858706779` (quien-rompe-paga), `1092950307708` (mapa-tandeo, also used by MenúYA). peldano / mi-total / peldano-venture could not be read while paused. Only peldano.xyz has a public `/privacidad` page.

**Feature 3 — on-device ELCSA + comedores referral**
- `menuya_events` created early (it's Feature 5's table) because Feature 3 must log `elcsa_completed`. RLS: insert/select/delete own rows; `name` 1–40 chars; `props` must be an object ≤ 2 KB. Also logging `signed_in` (callback) and `consent_given` (consent).
- Flow: consent → `/preguntas` (ELCSA) → `/inicio`. `/inicio` redirects to `/preguntas` until an `elcsa_completed` event exists.
- ELCSA: FAO/ELCSA adult-household version, 8 yes/no, last 3 months. Answers live only in React state; cleared as soon as the level is computed. Scoring 0 seguridad / 1–3 leve / 4–6 moderada / 7–8 severa (tested 0–8).
- Server learns only "completed": the server action takes **no arguments**. Both outcomes call the same action and end with the same "Continuar" → `/inicio`; the comedores screen is rendered inside the same client component (no route change), so URLs, requests and server logs don't reveal the result.
- The level lives in a React context (`ElcsaProvider`) in tab memory only. `useCanShowPay()` is true **only** if ELCSA was answered in this tab with seguridad/leve. Default (reload, new tab, not answered) = no price, no pay button. Feature 5 must use `useCanShowPay()` for every price/pay element; if hidden, offer "answer the 8 questions again".
- Comedores screen: no prices. SIBISO comedores sociales/comunitarios, Locatel 55 5658 1111, Red BAMX, with "verifica en los sitios oficiales".
- "Borrar mis datos" now also deletes `menuya_events`.

**Pending**
- Owner: restore `peldano`, `mi-total`, `peldano-venture` in the Supabase dashboard; then re-read their Google Client IDs.
- End-to-end sign-in test with a real Google account on https://menuyamx.xyz.
- Google branding fixes per project (privacy policy pages missing on 4 sites; weeks 8–12 code must not change → owner decides).

**Tomorrow's first move**
- Sign in end-to-end on https://menuyamx.xyz (profile row, `signed_in`, `consent_given`, `elcsa_completed` with empty props), then Feature 4 (baseline + daily logs).

## 2026-11-03 — Public privacy page + Feature 4

**Public privacy page**
- https://menuyamx.xyz/privacidad, no sign-in (added to the proxy's public paths). Same text as the consent screen (`src/components/PrivacyNotice.tsx`, single source). Linked from the landing and the consent screen. This is MenúYA's privacy policy URL for Google Branding. Nothing changed in Google for any older project (owner's rule).

**Feature 4 — baseline + daily logs**
- Tables (migration `004`): `menuya_baseline_orders`, `menuya_waste_logs`, `menuya_impulse_logs`. `user_id default auth.uid()`, the check constraints from BUILD_PROMPT, RLS select/insert/delete own rows, explicit GRANTs (authenticated: select/insert/delete; no anon; no update: a wrong entry is deleted and re-entered).
- Flow: consent → ELCSA → `/linea-base` → `/inicio`. Guards in `src/lib/onboarding.ts`. ELCSA "Continuar" goes to `/linea-base` for every outcome.
- Baseline: 10 rows (label + amount). Accepts 1–10 filled rows ("si tienes menos de 10, llena los que tengas"), so nobody gets stuck. Saved only once; logs `baseline_done` with `{orders: n}`.
- **14-day test window: day 1 = the CDMX date the baseline was saved.** Days 1–7 = week 1, 8–14 = week 2. `week` is computed on the server, never sent by the client. Logs outside the window are rejected.
- All dates use America/Mexico_City (not the server's UTC), so a log at 11 pm CDMX lands on the right day.
- Log forms: "🗑 Tiré comida" (item 1–60 chars + amount) and "🛵 Pedí algo / compra no planeada" (delivery / OXXO / otro + amount), each for "hoy" or "ayer".
- Added "✅ Hoy no tiré nada ni compré de más": stores a $0 waste row ("Nada hoy") so a clean day counts toward "X de 7 días registrados". Without it, the adherence bar would punish people who didn't waste anything.
- Amounts: whole pesos 0–2000. "$150" and "1,500" are accepted (the `$` and commas are stripped); "-5", "abc", "12.5", "999999" are rejected with Spanish messages. Item > 60 chars rejected. The DB checks back up the same limits.
- Home: "Tu semana N · X de 7 días registrados", "Día N de 14", progress bar, "Registrar hoy" banner when nothing is logged today, the two big buttons, today's list with "Borrar".
- "Borrar mis datos" now covers all 5 `menuya_` tables.

**Tomorrow's first move**
- Feature 5 (saving screen, Mi lista, pay button gated by `useCanShowPay()`).

## 2026-11-03 — Feature 5: saving screen + price trust + event log (Deploy 2)

**Decisions**
- `menuya_events` already existed (created in Feature 3). Events now written: `signed_in`, `consent_given`, `elcsa_completed`, `baseline_done`, `log_added` (`{type: waste|impulse|nothing, week}`), `saving_viewed`, `pay_link_clicked`. Names are a fixed zod enum on the server; the client can't pick what gets logged. `saving_viewed` fires once per screen visit from a client effect (a ref guard stops duplicates), not on render, so prefetching can't log it.
- Saving math is a pure function (`src/lib/saving.ts`) with unit tests (`npm test`). Saving = week 1 total − week 2 total (waste + impulse). **During week 2 it compares only the same number of days from both weeks**, so an early, half-empty week 2 can't fake a big saving. The final number appears from day 15.
- Honest copy: ≥ $60 "¡Pasaste la meta!"; below $60 "Te faltaron $X…"; negative "gastaste $X más…". The bar never goes below 0.
- Alcohol/tabaco: count + amount from the baseline orders labeled `alcohol_tabaco`, shown in its own card ("Lo que un plan de comidas no arregla") and never counted as possible saving.
- Mi lista: static, whitelisted basics only (frijol, tortilla, huevo, arroz, jitomate, calabacita, cebolla, naranja and guayaba as seasonal produce). No NOM-051 sealed products. Each item shows a price range + "captura: dic 2025". Bottom line is "Máximo esperado: $X" (sum of the maximums), never one exact total. Labeled "Precio de referencia (demo)". Prices are **invented**.
- Pay button: "Apoyar MenúYA · $149 por semestre, sin renovación automática" → `NEXT_PUBLIC_PAY_LINK` (set in `.env.local` + Vercel for all environments to the placeholder https://menuyamx.xyz/pago-pendiente, which is public and says "no se te cobró nada"). Owner swaps in the Mercado Pago link later with `vercel env add NEXT_PUBLIC_PAY_LINK … --force` + redeploy.
- Pay button gating (`useCanShowPay()`):
  - Shown only if this tab's memory holds an ELCSA result of seguridad/leve.
  - Moderada/severa in this session: nothing at all (no price, no button, no hint).
  - No result in memory (reload, new day): a link "contesta otra vez las 8 preguntas" instead of the price.
- ⚠️ Interpretation for the owner to confirm: "no price anywhere" for moderate/severe is read as **no MenúYA price ($149) and no pay button**. Reference grocery price ranges in Mi lista stay visible to everyone (they sell nothing and help a tight budget). If you want them hidden too, it's a one-line change in `lista/page.tsx`.
- Bottom nav (Inicio, Lista, Ahorro, Perfil) only on those 4 screens, not during onboarding or the forms. "Plan" from the mockup is left out: no plan feature this week (scope cut).

**Tomorrow's first move**
- Feature 6: mechanical test pass → `docs/TEST_RESULTS.md`, fix ≥ 1 bug, Deploy 3.
