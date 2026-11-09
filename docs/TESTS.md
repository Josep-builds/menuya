# MenúYA · Semana 14 — Pasada mecánica de /pricing

**Fecha:** 9 nov 2026 · **Rama:** `semana-14` · **Dónde:** sitio local (`next build` + `next start`) a 375 px de ancho (iPhone), luego https://semana14.menuyamx.xyz

## Qué se revisó

- `/pricing`, `/about` y `/pago-pendiente` abren sin login; las pantallas con sesión siguen mandando a `/entrar`.
- Orden de `/pricing`: promesa → Free / Student → "La lista sola es gratis…" → ¿Para quién? → simulador → límites.
- Cuentas del simulador a $49 (pruebas automáticas en `tests/pricing.test.ts`): neto $43.47, equilibrio v1 = 12, v2 = 28, meta $9,343 = 215.
- Nada se sale por los lados a 375 px.

## Bugs encontrados y cómo se corrigieron

| # | Bug | Dónde se vio | Causa | Arreglo |
|---|---|---|---|---|
| 1 | El campo de comisión decía **"3.5999999%"** en vez de 3.6% | Simulador → Comisión del procesador | 0.036 × 100 en punto flotante da 3.5999999999999996 | El valor inicial se redondea a 2 decimales antes de mostrarlo (`Math.round(f × 10000) / 100`). Hoy vive en `CAMPOS_BASE` de `src/lib/simulador.ts`. |
| 2 | Un resultado negativo se veía **"$-136"** | Resultado → "Después de costos: v2" | El formato ponía el signo de pesos antes del número negativo | `peso()` escribe "−$136": el signo menos va antes del "$" y el número se formatea en valor absoluto. |
| 3 | **Casillas desalineadas**: cuando una etiqueta ocupaba 2 renglones ("Conversión free → paid", "+ Proveedor WhatsApp"), su casilla quedaba más abajo que la de al lado | Simulador, filas de 2 y 3 casillas | La cuadrícula alineaba por arriba | Las filas usan `items-end`: las casillas quedan alineadas por abajo aunque las etiquetas midan distinto. |

## Redespliegue

- Los 3 arreglos están en el commit `a094444` y se redesplegaron en el **preview de `semana-14`** (https://semana14.menuyamx.xyz/pricing). Se verificó ahí sin login.
- **Producción (menuyamx.xyz) no se redesplegó**: sigue en `2f61acb` hasta que califiquen la Semana 13.

## Pruebas automáticas que se agregaron hoy

- `tests/pricing.test.ts`: comprobación obligatoria, redondeo hacia arriba y que el ingreso no depende de cuánto gasta el usuario.
- `tests/simulador.test.ts`: escenarios predefinidos y guardados (localStorage alterado se ignora; solo números, sin datos personales), y validación de cada campo (mínimo, máximo, decimales, largo; nunca NaN ni Infinity).
- `tests/apartar.test.ts`: $49 / $69 según `?p=69`, mensaje y número de WhatsApp exactos, sin campos de tarjeta.
