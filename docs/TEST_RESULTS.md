# MenúYA · Week 13 — TEST_RESULTS (mechanical pass, PACKET §11A)

**Date:** 2026-11-04 · **Build tested:** Deploy 3, commit `1f568ea` (includes fix `da05a70`) on https://menuyamx.xyz
**How to re-run:** `npm test` (unit/static) · `bash tests/smoke.sh` (production, no session) · `supabase db query --linked --project-ref icohpikxtlqhkpvmvtuv -f tests/rls_test.sql` (two-user RLS, always rolled back)

## Summary

| # | PACKET 11A test | Result | How |
|---|---|---|---|
| 1 | Google sign-in on a fresh browser → profile row created, consent required before any log screen | ✅ PASS | Owner signed in on menuyamx.xyz with a real Google account (2026-11-04). DB: 1 `menuya_profiles` row with `consent_at`, exactly 1 `signed_in`, 1 `consent_given`. Smoke test: all 8 app screens redirect to `/entrar` without a session; the `(app)` layout requires `consent_at`. |
| 2 | RLS: user B tries to read user A's rows → 0 rows | ✅ PASS | `tests/rls_test.sql`: B reads 0 rows, deletes 0 rows and edits 0 rows of A's in all 5 `menuya_` tables. Inserting as A is blocked. `anon` has no permission on any table (SQL + REST API). |
| 3 | Validation: "-5", "abc", "999999", 500-char text → rejected with a Spanish message | ✅ PASS | zod unit tests + DB check constraints (both layers). |
| 4 | ELCSA: no request contains answers | ✅ PASS (static + DB) · ⏳ manual DevTools check pending | The server action takes no arguments, and the ELCSA code has no fetch/storage/cookies. Owner's real run left 1 `elcsa_completed` event with **empty props**. |
| 5 | ELCSA moderate/severe → comedores screen, no price or pay button anywhere | ✅ PASS (unit + static) | `payButtonMode`: moderada/severa → hidden. `$149` and the pay link exist only in `PayButton`. The comedores screen has no prices. |
| 6 | Saving math: seed week 1 = $200, week 2 = $120 → $80 and "pasaste la meta" | ✅ PASS | `tests/saving.test.ts`, with seeded demo data, plus below-goal, negative and partial week 2 cases. |
| 7 | Event log: each action writes exactly one event row | ✅ PASS (static + DB) | Static test: exactly one write site per event/action. DB after the owner's real run: exactly 1 of each event. |
| 8 | Real domain loads on mobile data, not just Wi-Fi | ⏳ MANUAL | Needs a phone with Wi-Fi off. Over the internet: menuyamx.xyz serves HTTPS 200 from Vercel. |

**Bug found and fixed (≥ 1 required):** see the "Bug" section. **Deploy 3** done.

## Bug found → fixed

**`menuya_events` accepted any event name and any `props`** (found by `tests/rls_test.sql`, row "DB evento inventado elcsa_score: ACEPTADO ❌").
- Impact: with only their own session and the public anon key, any user could call the REST API and store, for example, `{"name": "elcsa_score", "props": {"score": 8}}`. That breaks the "ELCSA never leaves the phone" promise and the "zod + matching DB checks" rule. The DB only checked `length(name) ≤ 40`.
- Fix (`da05a70`, migration `db/migrations/005_menuya_events_whitelist.sql`):
  - Check constraints: `name` must be one of the 7 events, and `props` can only hold `type` (waste/impulse/nothing), `week` (1/2) and `orders` (1–10).
  - The server's zod schema is now strict with the same keys.
- Verified: the re-run now rejects both the invented event and the `{"score": 8}` props, and still accepts a valid `log_added`.
- Before the fix: 0 bad rows in production (checked), so nothing to clean up.

## Detail

### Unit + static tests (`npm test`) — 21/21
```
✔ ELCSA tiene 8 preguntas
✔ umbrales: 0 seguridad, 1–3 leve, 4–6 moderada, 7–8 severa
✔ moderada y severa mandan a comedores; seguridad y leve no
✔ ELCSA incompleta se rechaza
✔ 11A.5: moderada/severa → botón de pago oculto; sin resultado → solo invitación, sin precio
✔ 11A.5: el precio $149 y el enlace de pago solo existen en PayButton
✔ 11A.5: la pantalla de comedores no muestra precios
✔ 11A.4: ELCSA no usa red ni almacenamiento; la acción del servidor no recibe argumentos
✔ 11A.7: cada evento tiene exactamente un punto de escritura por acción
✔ 11A.6: semana 1 $200 vs semana 2 $120 → $80 y pasa la meta
✔ alcohol/tabaco se cuenta aparte
✔ debajo de la meta se reporta tal cual ($30)
✔ si gastó más en semana 2, el ahorro es negativo y la barra queda en 0
✔ semana 2 en curso compara solo los mismos días (no infla el ahorro)
✔ durante la semana 1 no hay ahorro todavía
✔ sin línea base no hay prueba
✔ 11A.3: montos inválidos se rechazan con mensaje en español
✔ montos válidos (incl. $ y comas)
✔ 11A.3: texto de 500 caracteres se rechaza
✔ texto vacío, tipo y fecha inválidos se rechazan
✔ línea base: 1–10 pedidos con etiqueta válida
```

### Two-user RLS + DB constraints (`tests/rls_test.sql`) — 31 checks, 0 ❌, everything rolled back (0 test users left in `auth.users`)
```
[A ve sus filas en menuya_profiles: 1]
[A ve sus filas en menuya_baseline_orders: 1]
[A ve sus filas en menuya_waste_logs: 1]
[A ve sus filas en menuya_impulse_logs: 1]
[A ve sus filas en menuya_events: 1]
[B lee menuya_profiles de A: 0 filas]
[B borra menuya_profiles de A: 0]
[B lee menuya_baseline_orders de A: 0 filas]
[B borra menuya_baseline_orders de A: 0]
[B lee menuya_waste_logs de A: 0 filas]
[B borra menuya_waste_logs de A: 0]
[B lee menuya_impulse_logs de A: 0 filas]
[B borra menuya_impulse_logs de A: 0]
[B lee menuya_events de A: 0 filas]
[B borra menuya_events de A: 0]
[B edita perfil de A: 0]
[B inserta a nombre de A: bloqueado]
[B inserta evento a nombre de A: bloqueado]
[DB monto -5: rechazado]
[DB monto 999999: rechazado]
[DB texto 500: rechazado]
[DB kind rappi: rechazado]
[DB semana 3: rechazado]
[DB evento inventado elcsa_score: rechazado]
[DB evento con props score: rechazado]
[DB evento válido log_added: aceptado]
[anon menuya_profiles: sin permiso]
[anon menuya_baseline_orders: sin permiso]
[anon menuya_waste_logs: sin permiso]
[anon menuya_impulse_logs: sin permiso]
[anon menuya_events: sin permiso] \
```

### Production smoke test (`tests/smoke.sh`, no session) — 33/33
```
✅ / pública (200)
✅ /entrar pública (200)
✅ /privacidad pública (200)
✅ /pago-pendiente pública (200)
✅ /aviso sin sesión → /entrar
✅ /preguntas sin sesión → /entrar
✅ /linea-base sin sesión → /entrar
✅ /inicio sin sesión → /entrar
✅ /registrar sin sesión → /entrar
✅ /ahorro sin sesión → /entrar
✅ /lista sin sesión → /entrar
✅ /perfil sin sesión → /entrar
✅ /auth/callback sin código → /entrar?error=1
✅ landing: título
✅ landing: botón Empezar
✅ landing: etiqueta demo
✅ landing: enlace a /privacidad
✅ privacidad: contacto ARCO
✅ privacidad: ELCSA no sale del teléfono
✅ privacidad: no menciona INAI
✅ / sin precio $149
✅ /entrar sin precio $149
✅ /privacidad sin precio $149
✅ API anon menuya_profiles: sin permiso
✅ API anon insert menuya_profiles: bloqueado (401)
✅ API anon menuya_baseline_orders: sin permiso
✅ API anon insert menuya_baseline_orders: bloqueado (401)
✅ API anon menuya_waste_logs: sin permiso
✅ API anon insert menuya_waste_logs: bloqueado (401)
✅ API anon menuya_impulse_logs: sin permiso
✅ API anon insert menuya_impulse_logs: bloqueado (401)
✅ API anon menuya_events: sin permiso
✅ API anon insert menuya_events: bloqueado (401)
```

## Not automated / pending (manual)
- **11A.4 in a real browser:** answer ELCSA with DevTools → Network open; confirm the only request is the server action with an empty body `[]`.
- **11A.5 end to end:** answer ≥ 4 "sí" → comedores screen; then open Ahorro: no $149, no button, no hint.
- **11A.8:** open https://menuyamx.xyz on a phone with Wi-Fi off.
- Sign-in with a **second real Google account** (RLS was tested at DB level with two simulated users inside a rolled-back transaction).

## Known risks (not bugs in MenúYA, not changed)
- mapa-tandeo's own tables (`devices`, `readings`, `flags`, `block_week_stats`) are writable by any signed-in user of the shared Supabase project, MenúYA users included. Accepted by owner; fix after Week 11 is graded.
- A user can write their own `menuya_waste_logs`/`menuya_impulse_logs` directly through the API with any `week`/`log_date`, which would skew only *their own* saving number. A DB trigger to recompute `week` could close it later.
