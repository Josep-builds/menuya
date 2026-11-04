#!/usr/bin/env bash
# Prueba de humo contra producción (sin sesión). Uso: bash tests/smoke.sh [https://menuyamx.xyz]
# Lee la anon key de .env.local sin imprimirla.
BASE="${1:-https://menuyamx.xyz}"
fail=0
ok()  { echo "✅ $1"; }
bad() { echo "❌ $1"; fail=1; }

for p in / /entrar /privacidad /pago-pendiente; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$p"); [ "$c" = 200 ] && ok "$p pública ($c)" || bad "$p → $c"
done
for p in /aviso /preguntas /linea-base /inicio /registrar /ahorro /lista /perfil; do
  r=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$BASE$p")
  [[ "$r" == 307*"/entrar" ]] && ok "$p sin sesión → /entrar" || bad "$p → $r"
done
r=$(curl -s -o /dev/null -w "%{redirect_url}" "$BASE/auth/callback"); [[ "$r" == *"/entrar?error=1" ]] && ok "/auth/callback sin código → /entrar?error=1" || bad "/auth/callback → $r"

home=$(curl -s "$BASE/")
grep -q "¿Cuánto se te va en comida que tiras?" <<<"$home" && ok "landing: título" || bad "landing: título"
grep -q "Empezar" <<<"$home" && ok "landing: botón Empezar" || bad "landing: Empezar"
grep -q "Versión de prueba · datos de demostración" <<<"$home" && ok "landing: etiqueta demo" || bad "landing: etiqueta demo"
grep -q 'href="/privacidad"' <<<"$home" && ok "landing: enlace a /privacidad" || bad "landing: enlace privacidad"
priv=$(curl -s "$BASE/privacidad")
grep -q "josepferre.g@icloud.com" <<<"$priv" && ok "privacidad: contacto ARCO" || bad "privacidad: contacto"
grep -q "nunca salen de tu teléfono" <<<"$priv" && ok "privacidad: ELCSA no sale del teléfono" || bad "privacidad: ELCSA"
grep -qi "INAI" <<<"$priv" && bad "privacidad menciona INAI" || ok "privacidad: no menciona INAI"
for p in / /entrar /privacidad; do grep -q '149' <<<"$(curl -s "$BASE$p")" && bad "$p muestra 149" || ok "$p sin precio \$149"; done

URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2-)
KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2-)
for t in menuya_profiles menuya_baseline_orders menuya_waste_logs menuya_impulse_logs menuya_events; do
  body=$(curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rest/v1/$t?select=*")
  [[ "$body" == *"42501"* || "$body" == *"permission denied"* ]] && ok "API anon $t: sin permiso" || bad "API anon $t: $(head -c 120 <<<"$body")"
  ins=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{}' "$URL/rest/v1/$t")
  [[ "$ins" == 401 || "$ins" == 403 ]] && ok "API anon insert $t: bloqueado ($ins)" || bad "API anon insert $t: $ins"
done
exit $fail
