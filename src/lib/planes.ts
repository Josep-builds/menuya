// Textos de los planes, en lenguaje simple. Un solo lugar para /pricing y /apartar,
// así las dos pantallas explican lo mismo (persona test 10 nov 2026: nadie entendía
// "Reserva el día del depósito", "Chequeo del día 9" ni "Recálculo del día 13").

export type Beneficio = { cuando: string; que: string };

export const BENEFICIOS_STUDENT: readonly Beneficio[] = [
  {
    cuando: "Día que te llega el dinero",
    que: "nos dices cuánto te llegó y te mandamos tu lista del súper y cuánto apartar para los últimos días. Nunca tocamos tu cuenta.",
  },
  { cuando: "Día 9", que: "te preguntamos qué te queda en el refri (10 segundos)." },
  {
    cuando: "Día 13",
    que: "si no te va a alcanzar, te ajustamos el plan y te mandamos opciones baratas cerca.",
  },
];

export const BENEFICIO_FREE = "Te damos la lista; tú la sigues solo.";

export const PARA_FORANEOS = "Para que el dinero que te mandan te alcance hasta el siguiente depósito, sin pedir delivery los últimos días.";
