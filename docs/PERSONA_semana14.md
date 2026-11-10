# MenúYA · Semana 14 — Persona test de /pricing y /apartar

## Método

- **Herramienta:** un chat nuevo de Claude, fuera del proyecto (sin el contexto de MenúYA), haciendo de la persona.
- **Material:** 7 capturas de https://semana14.menuyamx.xyz tomadas en iPad (Safari, navegación privada).
- **Fecha:** 10 de noviembre de 2026.
- **Rama probada:** `semana-14` (todavía no está en producción).

## Perfil

**Andrés, 19 años, estudiante foráneo de Hermosillo.** En diciembre se regresa a Hermosillo.

## Resultado

| Pantalla | Dónde se confundió | Gravedad | ¿Se habría salido? |
|---|---|---|---|
| 1. Planes | No entiende "Reserva el día del depósito", "Chequeo del día 9", "Recálculo del día 13"; teme que "reserva" signifique que le apartan dinero de su cuenta | Alta | No |
| 1. Planes | "$49/mes" = suscripción; "¿cómo lo cancelo?" | Media | No |
| 1. Planes | "Apartar mi lugar": no sabe en qué fila se apunta | Media | No |
| 1. Planes | "La lista de súper" (Free): no sabe si se la hacen o la escribe él | Baja | No |
| 1. Planes | El aviso "no pide tarjeta" lo calma pero casi no lo ve | Baja | No |
| 2. Simulador | No entiende conversión, haircut, free→paid ni escenarios; siente que es para el negocio ("parece tarea de emprendimiento") | Alta | Sí |
| 2. Para quién | Tarjeta "Estudiantes foráneos" vacía; "hipótesis, aún no a la venta" le hace pensar que la app no existe | Media | Contribuye |
| 3. Apartar | "Para diciembre" choca con que en diciembre se va a Hermosillo | Media | No |
| 3. Apartar | Los 3 beneficios siguen sin explicarse (segunda vez) | Alta | No |
| 3. Apartar | No sabe cuándo le cobrarían los $49 | Media | No |
| 4. Confirmación | "No se te cargó nada" lo asusta un segundo | Baja | No |
| 4. Confirmación | No hay confirmación de que ya apartó | Alta | No completa |
| 4. Confirmación | "Avísanos por WhatsApp": no sabe si él escribe ni qué decir; miedo al spam | Alta | Sí (no escribe) |
| 4. Confirmación | "Estamos midiendo interés" = conejillo de indias | Media | — |

## La confusión más grave

**Nunca entendió qué hace el plan de $49**, porque el día del depósito, el día 9 y el día 13 no se explican en ninguna pantalla.

## Qué se arregló

1. **Arreglo principal: cada beneficio se explica en lenguaje simple, en `/pricing` y en `/apartar`.**
   - **Día que te llega el dinero:** nos dices cuánto te llegó y te mandamos tu lista del súper y cuánto apartar para los últimos días. Nunca tocamos tu cuenta.
   - **Día 9:** te preguntamos qué te queda en el refri (10 segundos).
   - **Día 13:** si no te va a alcanzar, te ajustamos el plan y te mandamos opciones baratas cerca.
   - **Free:** "Te damos la lista; tú la sigues solo."
   - La tarjeta "Estudiantes foráneos" ya dice qué resuelve.
2. **Simulador:** sigue en `/pricing`, pero dentro de una sección plegable "Para el curso: ¿cuándo se sostiene MenúYA?", cerrada por defecto y después de los límites. Así el usuario ya no se topa con números de negocio.
3. **`/apartar`:**
   - "Para diciembre" cambió a "para el primer grupo", también en el mensaje de WhatsApp.
   - Al picar, ahora se confirma que quedó en la lista y se explica el último paso: mandar un WhatsApp que ya va escrito ("Confirmar por WhatsApp").
   - El aviso de cobro ahora dice cuándo se cobraría: "Antes de cobrar te preguntamos; si no dices que sí, no se te cobra nada. Cancelas mandando BAJA."
   - Se quitó "Estamos midiendo interés".

**Arreglado después, el mismo día** (commit `06ce7fa`):
- La tarjeta de papás ahora dice "Próximamente · únete a la lista de espera" en lugar de "hipótesis, aún no a la venta". El $69 sigue siendo hipótesis y eso queda en docs.
- Abajo del precio de Student: "Cancelas cuando quieras mandando BAJA por WhatsApp. Antes de cobrar te preguntamos."
- El aviso "no pide tarjeta" es más grande y tiene fondo.
- La duda de en qué fila se apunta la cubren el título "Aparta tu lugar para el primer grupo" y la confirmación "Listo, quedaste en la lista".
