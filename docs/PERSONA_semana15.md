# Persona test · Semana 15 · `/quincena`

> **SIMULACIÓN.** "Karla" es una persona sintética, no una usuaria real. No reemplaza evidencia de la audiencia real (ver entrevistas en la Ibero y la prueba de distribución). La conversación original está en un chat separado de Claude ("Persona test semana 15"); este archivo resume las confusiones y mi respuesta.

**Fecha:** 17 nov 2026 · **Pantallas:** `menuyamx.xyz/quincena?g=trab` (ronda 1, producción) y el preview de `semana-15` (ronda 2)

**Persona (basada en investigación):** 23 años, de Puebla, vive con una roomie en Del Valle, atención a clientes, cobra por quincena (~$7,000). Compra en Walmart y tiendita; los últimos días pide delivery. Vive en WhatsApp; desconfía de apps que piden datos bancarios. Contexto dado: Fintonic (~$140 por pedido, menores de 25) y la cita de U2 ("normalmente pido más entre el 12 y el 15").

## Ronda 1 — resultado: **no le picó** (Cancelar)

| Confusión | ¿Se reprodujo en la página? | Respuesta (commit `1a4d13f`) |
|---|---|---|
| ¿Para quién es? "Solo Santa Fe" estaba casi al final | Sí | "Para 1 persona que compra en el Walmart de Santa Fe" arriba, antes de los pasos |
| "Primer grupo" = grupo de WhatsApp con extraños | Sí | Botón "Apartar mi lugar para enero (gratis)" + "chat 1 a 1, nadie más ve tu número" |
| Precio escondido en "Ver planes" | Sí | "$49 al mes: menos que un pedido de delivery. Antes de cobrarte te preguntamos" junto al botón |
| $389 de $1,500 no cuadra | Sí | "Lo fresco (1 persona, 15 días)", "Esto es solo lo fresco…" y por qué hay rango |
| Delivery sin números; no se sabe quién está detrás | Sí | "3 pedidos de ~$140 son ~$420" (Fintonic) y "Hecho por Josep, estudiante en CDMX" |
| Empezar antes de enero | — | **No cambia:** en diciembre los foráneos se van y solo puedo atender a 10 |
| El nombre MenúYA y el dominio .xyz | — | **No cambia** esta semana |

## Ronda 2 — resultado: **sí le picaría** ("Abrir")

Grupo y costo: resuelto. Para quién: casi. Ejemplo: a medias.

| Confusión que siguió | Respuesta (rama `semana-15`) |
|---|---|
| ¿Aparto lugar o solo me anoto si soy de otra zona? | "¿Otra zona? El botón te anota en la lista de espera (no ocupa uno de los 10 lugares)" |
| "Revisamos a mano" sonaba a que alguien va al Walmart | "Precios que revisamos a mano en walmart.com.mx cada semana" |
| ¿Qué pasa después de mandar el mensaje? | "Te contesta Josep por WhatsApp y te escribimos el 2 de enero para empezar" |
| Ejemplo completo de los $1,500 | **No arreglado:** no tengo una lista completa medida. Llega después de la prueba con ticket real (antes del 5 dic) |
| ¿Qué voy a comer? No hay menú | **No arreglado:** v1 es lista, no menú. Anotado como riesgo del nombre |
| "$49 al mes" vs. ciclos de quincena (¿2 listas?) | **Sin decidir** (decisión del dueño, 17 nov). Anotado en DECISIONS |
| Riesgo del silencio hasta enero | La línea de "después" lo responde en parte; respuesta automática pendiente |
| URL del preview da desconfianza | Las piezas usan solo `menuyamx.xyz/quincena` (producción) |

**Lo que sobrevivió:** "Lo que no prometemos" fue lo más creíble para Karla en las dos rondas. El dato de ~$420 en delivery le pegó.
