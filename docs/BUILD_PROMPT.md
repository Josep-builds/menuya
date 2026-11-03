# MenúYA · Week 13 — Implementation prompt for Claude Code

You are building MenúYA's Week 13 slice, the "Contador de Ahorro". `docs/PACKET.md` is the spec: build only what it describes. Work as autonomously as possible, and stop ONLY at the 🛑 points below.

## Hard rules
- **Never ask me for a password, and never type, print or commit a secret.** Logins happen in my browser through each CLI's own login flow. Keys go only into `.env.local` (gitignored) and Vercel environment variables.
- The Supabase **service role key is never used in client code**. Use the anon key + RLS.
- Every table holding user data has **RLS ON** with policies on `auth.uid() = user_id`.
- Every form is validated with **zod** (types, lengths, ranges) and the DB has matching `check` constraints.
- All visible data is invented and labeled **"Datos de demostración"**. Prices are labeled **"Precio de referencia (demo) · captura: dic 2025"**. Never show one "exact" total.
- UI text in Spanish (Mexico), mobile-first, simple.
- After each feature: run the app, check it compiles, commit with the message given, push. Update `docs/DECISIONS.md` (date, decisions, tomorrow's first move).
- If a command fails twice, stop and show me the error.

## Feature 1 — Scaffold + first deploy
1. Next.js (App Router, TypeScript, Tailwind) in this folder. `.gitignore` includes `.env*`, `node_modules`, `.vercel`.
2. Landing: "MenúYA — ¿Cuánto se te va en comida que tiras?", button "Empezar", label "Versión de prueba · datos de demostración".
3. `docs/DECISIONS.md` created.
4. `git init`, commit: `chore: scaffold Next.js + Tailwind, landing, .gitignore`.
5. 🛑 **Pause for logins.** Check whether `gh`, `vercel` and `supabase` CLIs are installed (install with npm/brew if not), then tell me to run, one at a time: `gh auth login`, `vercel login`, `supabase login`. Wait until I say "listo".
6. Create a **private** GitHub repo `menuya` with `gh`, push.
7. Deploy with `vercel --prod`, link it to the GitHub repo. Give me the URL. → **Deploy 1**
8. 🛑 Ask me if I already bought a domain. If yes, add it with `vercel domains add` and show me the exact DNS records I must set, if any.

## Feature 2 — Google sign-in + consent + RLS
1. Create a Supabase project with the CLI (region closest to Mexico). Generate a strong DB password yourself and store it ONLY in `.env.local`; don't show it to me.
2. Add `@supabase/supabase-js` and `@supabase/ssr`. Put URL + anon key in `.env.local` and in Vercel env vars (`vercel env add`, all environments).
3. 🛑 **Pause for Google OAuth.** Give me short numbered click-by-click steps to: (a) create an OAuth client in Google Cloud Console (type "Web application"), with the Supabase callback URL as authorized redirect URI; (b) paste the Client ID and Secret into Supabase → Authentication → Providers → Google; (c) add my Vercel URL and domain to Supabase → Authentication → URL Configuration. Wait for "listo". I paste secrets only into those dashboards, never here.
4. Migration `profiles`: `user_id uuid pk references auth.users`, `city text`, `grocery_band text check in ('<2500','2500-3500','>3500')`, `consent_at timestamptz`, `created_at`. RLS on.
5. Screens: "Entrar con Google" → privacy notice (plain Spanish, 2025 LFPDPPP, no mention of INAI; says what is stored, why, that ELCSA answers never leave the phone, how to delete data) → checkbox "Acepto" (stores `consent_at`). No other screen is reachable without consent.
6. Commit: `feat: Google sign-in + consent screen + profiles with RLS`.

## Feature 3 — On-device ELCSA + comedores referral
1. Adult-household ELCSA (8 yes/no questions, last 3 months). One-line intro: "Estas preguntas existen para no venderte algo si no te alcanza. Tus respuestas no salen de tu teléfono."
2. Scoring **in browser memory only**: 0 = seguridad, 1–3 leve, 4–6 moderada, 7–8 severa. Never sent, never stored (no localStorage either). Only the event `elcsa_completed` with NO score is logged.
3. Moderate or severe → screen with CDMX comedores info and free resources, no price, no pay button anywhere in the app for that session.
4. Commit: `feat: on-device ELCSA + comedores referral`.

## Feature 4 — Baseline + daily logs
1. Tables (RLS on, `user_id` default `auth.uid()`):
   - `baseline_orders`: `label check in ('antojo','no_planee','no_tuve_tiempo','alcohol_tabaco','otro')`, `amount_mxn int check 0..2000`.
   - `waste_logs`: `log_date date`, `item text check length 1..60`, `amount_mxn int check 0..2000`, `week smallint check in (1,2)`.
   - `impulse_logs`: `log_date date`, `kind check in ('delivery','oxxo','otro')`, `amount_mxn int check 0..2000`, `week smallint check in (1,2)`.
2. Baseline screen: label your last 10 orders (from your delivery app history).
3. Home: progress "X de 7 días registrados", two big buttons "🗑 Tiré comida" and "🛵 Pedí algo / compra no planeada", today's entries list, and a "Registrar hoy" banner if nothing logged today.
4. zod validation with Spanish error messages.
5. Commit: `feat: baseline orders + waste/impulse logs with validation`.

## Feature 5 — Saving screen + price trust + event log
1. `events` table: `user_id`, `name text check length ≤ 40`, `props jsonb`, `created_at`. RLS: insert/select own rows only. Log: `signed_in`, `consent_given`, `elcsa_completed`, `baseline_done`, `log_added`, `saving_viewed`, `pay_link_clicked`.
2. Saving screen: week 1 total vs week 2 total (waste + impulse), "Ahorro esta semana: $X de $60" with a bar. If below $60, say so honestly. Show the counts that plans can't fix (alcohol/tabaco) separately.
3. "Mi lista" page (price-trust fix): a static list of whitelisted basics only (frijol, tortilla, huevo, arroz, seasonal produce; no sealed products), each with a price range and capture date, and a total shown as **"Máximo esperado: $___"**, never one exact number. Label: "Precio de referencia (demo)".
4. Pay button (only if ELCSA screen didn't trigger): "Apoyar MenúYA · $149 por semestre, sin renovación automática" → opens a placeholder URL from env var `NEXT_PUBLIC_PAY_LINK` (I'll set the Mercado Pago link later). Logs `pay_link_clicked`.
5. Commit: `feat: weekly saving screen, price ranges, event log`, then `vercel --prod`. → **Deploy 2**

## Feature 6 — Mechanical test pass
Run every test in PACKET.md section 11A that you can automate (RLS with a second test user, validation edge cases, no ELCSA data in network requests, saving math with seeded demo data, one event per action). Write results to `docs/TEST_RESULTS.md`. Fix at least one real bug found, commit `fix: <bug>`, redeploy. → **Deploy 3**

## Then
🛑 Stop. Give me: the live URL, the GitHub link, a list of each screen in order (for screenshots for the persona test), and anything still pending.
