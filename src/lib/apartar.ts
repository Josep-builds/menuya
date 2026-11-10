// /apartar: medimos interés. No hay checkout, no se cobra nada y no se piden datos bancarios.

export const WHATSAPP_NUMERO = "525545022101";
export const WHATSAPP_TEXTO_VISIBLE = "+52 55 4502 2101";

export type PrecioApartar = 49 | 69;

/** $69 solo si la URL dice exactamente ?p=69. Cualquier otra cosa (o nada) es $49. */
export function precioDesdeParam(p: string | string[] | undefined): PrecioApartar {
  return p === "69" ? 69 : 49;
}

export function mensajeWhatsApp(precio: PrecioApartar): string {
  return `Hola, quiero apartar mi lugar en MenúYA (plan Student $${precio}/mes) para el primer grupo.`;
}

export function enlaceWhatsApp(precio: PrecioApartar): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensajeWhatsApp(precio))}`;
}

/** Lista de espera de papás (v2). Solo abre WhatsApp con el mensaje escrito; no guardamos nada. */
export const MENSAJE_WHATSAPP_PAPAS =
  "Hola, soy papá/mamá de un estudiante foráneo y quiero estar en la lista de espera de MenúYA.";

export function enlaceWhatsAppPapas(): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE_WHATSAPP_PAPAS)}`;
}
