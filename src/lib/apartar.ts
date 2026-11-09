// /apartar: medimos interés. No hay checkout, no se cobra nada y no se piden datos bancarios.

export const WHATSAPP_NUMERO = "525545022101";
export const WHATSAPP_TEXTO_VISIBLE = "+52 55 4502 2101";

export type PrecioApartar = 49 | 69;

/** $69 solo si la URL dice exactamente ?p=69. Cualquier otra cosa (o nada) es $49. */
export function precioDesdeParam(p: string | string[] | undefined): PrecioApartar {
  return p === "69" ? 69 : 49;
}

export function mensajeWhatsApp(precio: PrecioApartar): string {
  return `Hola, quiero apartar mi lugar en MenúYA (plan Student $${precio}/mes) para diciembre.`;
}

export function enlaceWhatsApp(precio: PrecioApartar): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensajeWhatsApp(precio))}`;
}
