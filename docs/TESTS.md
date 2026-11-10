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

---

# Persona test (10 nov 2026)

**Método:** un chat nuevo de Claude, fuera del proyecto, haciendo de **Andrés** (19 años, estudiante foráneo de Hermosillo), con 7 capturas de https://semana14.menuyamx.xyz tomadas en iPad (Safari, navegación privada). El detalle y la tabla completa están en `docs/PERSONA_semana14.md`.

**La confusión más grave:** nunca entendió qué hace el plan de $49, porque el día del depósito, el día 9 y el día 13 no se explicaban en ninguna pantalla. Se habría salido en el simulador ("parece tarea de emprendimiento") y al final no habría escrito por WhatsApp.

## Qué se arregló

| Hallazgo | Gravedad | Arreglo | Commit |
|---|---|---|---|
| No entiende los 3 beneficios de Student (en /pricing y otra vez en /apartar); teme que "reserva" toque su cuenta | Alta | Cada beneficio con una línea simple ("Día que te llega el dinero: … Nunca tocamos tu cuenta." · "Día 9: …" · "Día 13: …"), igual en las dos pantallas (`src/lib/planes.ts`) | `5ae5ac7` |
| "La lista de súper" (Free): ¿me la hacen o la escribo? | Baja | "Te damos la lista; tú la sigues solo." | `5ae5ac7` |
| Tarjeta "Estudiantes foráneos" vacía | Media | Una línea de qué resuelve | `5ae5ac7` |
| El simulador parece para el negocio; se habría salido | Alta | Sección plegable "Para el curso: ¿cuándo se sostiene MenúYA?", cerrada por defecto y después de los límites. Funciona igual al abrirla | `fcef5c7` |
| "Para diciembre" choca con que se va a Hermosillo | Media | "Para el primer grupo" (botón, título y mensaje de WhatsApp) | `bc70ed9` |
| No hay confirmación de que ya apartó | Alta | "✓ Listo, quedaste en la lista." | `bc70ed9` |
| "Avísanos por WhatsApp": ¿yo escribo?, ¿qué digo? | Alta | "Último paso: mándanos un WhatsApp para confirmar tu lugar (ya va escrito, solo dale enviar)." + botón "Confirmar por WhatsApp" | `bc70ed9` |
| No sabe cuándo le cobrarían; "No se te cargó nada" lo asusta | Media / Baja | "Todavía no cobramos. Antes de cobrar te preguntamos; si no dices que sí, no se te cobra nada. Cancelas mandando BAJA." | `bc70ed9` |
| "Estamos midiendo interés" = conejillo de indias | Media | Se quitó; la honestidad queda en "Todavía no cobramos" | `bc70ed9` |

**Sin arreglar todavía:** "hipótesis, aún no a la venta" en la tarjeta de papás (lo hizo pensar que la app no existe); "$49/mes, ¿cómo lo cancelo?" solo se contesta en Límites y en /apartar; el aviso "no pide tarjeta" de /pricing sigue chico.

## Cómo se verificó

- Pruebas automáticas: 65/65 (`tests/planes.test.ts` nuevo; `tests/apartar.test.ts` actualizado).
- Chrome a 375 px contra el sitio local:
  - /pricing muestra los beneficios explicados, y la sección "Para el curso" carga cerrada. Al abrirla, el simulador da $43.47 y equilibrio v2 = 28.
  - /apartar dice "para el primer grupo". Al picar sale "Listo, quedaste en la lista" con "Confirmar por WhatsApp", y el mensaje ya va escrito.
  - Nada se sale por los lados.
- Redespliegue: preview de `semana-14` en https://semana14.menuyamx.xyz. Producción sin cambios (`2f61acb`).

## Pendientes del persona test, también arreglados (10 nov 2026)

| Hallazgo | Gravedad | Arreglo |
|---|---|---|
| "Hipótesis, aún no a la venta" (tarjeta de papás) le hizo pensar que la app no existe | Media | Ahora dice "Próximamente · únete a la lista de espera". El precio de **$69 sigue siendo una hipótesis** (no se ha probado con ningún papá); eso queda solo en docs, ya no en la página. |
| "$49/mes = suscripción, ¿cómo lo cancelo?" | Media | Abajo del precio de Student: "Cancelas cuando quieras mandando BAJA por WhatsApp. Antes de cobrar te preguntamos." |
| El aviso "no pide tarjeta" lo calma, pero casi no lo ve | Baja | Mismo texto, pero más grande (sm en lugar de xs), con fondo verde claro y un candado, abajo del botón "Apartar mi lugar". |

Verificado: 68/68 pruebas (3 nuevas en `tests/planes.test.ts`) y captura a 375 px. Nada se sale por los lados y el aviso no tapa el botón. Con esto, todos los hallazgos de la tabla del persona test tienen un arreglo.
