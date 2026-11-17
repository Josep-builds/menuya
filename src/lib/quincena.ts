// /quincena: página a donde llevan las piezas de la Semana 15 (prueba de distribución).
// No guarda nada: el único paso siguiente es un WhatsApp con el mensaje ya escrito.
// La etiqueta [Q-EST] / [Q-TRAB] / [Q-WEB] dice de qué pieza llegó la persona, sin pedir datos.
import { WHATSAPP_NUMERO } from "@/lib/apartar";

export type Grupo = "est" | "trab" | "web";

/** Solo ?g=est o ?g=trab cuentan; cualquier otra cosa (o nada) es "web". */
export function grupoDesdeParam(g: string | string[] | undefined): Grupo {
  return g === "est" || g === "trab" ? g : "web";
}

export const ETIQUETA: Record<Grupo, string> = { est: "Q-EST", trab: "Q-TRAB", web: "Q-WEB" };

export const TITULO: Record<Grupo, string> = {
  est: "¿Se te acaba lo que te mandan antes de que te vuelva a llegar?",
  trab: "¿La quincena se te acaba antes de la quincena?",
  web: "Que el súper te alcance hasta que te vuelva a llegar dinero.",
};

export function mensajeWhatsAppQuincena(g: Grupo): string {
  return `Hola, vengo de la página de MenúYA [${ETIQUETA[g]}] y quiero entrar al primer grupo de enero.`;
}

export function enlaceWhatsAppQuincena(g: Grupo): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensajeWhatsAppQuincena(g))}`;
}

// Ejemplo real de entrada → método → salida. Precios vistos en walmart.com.mx el 9 nov 2026
// (docs/precios-frescos-2026-11-09.md), mostrados como rango (regla del equipo). Solo lo fresco.
export const EJEMPLO_ENTRADA = "Me llegaron $1,500 y me vuelve a llegar en 15 días.";
export const EJEMPLO_FECHA = "9 nov 2026";

export type ItemEjemplo = { nombre: string; cantidad: string; min: number; max: number };

export const EJEMPLO_FRESCOS: readonly ItemEjemplo[] = [
  { nombre: "Pechuga de pollo sin hueso", cantidad: "1 kg", min: 146, max: 198 },
  { nombre: "Huevo", cantidad: "30 piezas", min: 65, max: 87 },
  { nombre: "Jitomate saladet", cantidad: "1 kg", min: 33, max: 45 },
  { nombre: "Plátano", cantidad: "1 kg", min: 20, max: 28 },
  { nombre: "Tortilla de maíz", cantidad: "2 kg", min: 23, max: 31 },
];

/** Planeamos con el máximo del rango, nunca con el mínimo: quedarse corto es lo que rompe la promesa. */
export const maximoFrescos = (items: readonly ItemEjemplo[]) => items.reduce((s, i) => s + i.max, 0);

export const NO_PROMETEMOS =
  "No prometemos cuánto vas a ahorrar ni precios exactos: los precios cambian y todavía no medimos qué tanto le atinamos.";
