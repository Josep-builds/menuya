import { z } from "zod";

export const GROCERY_BANDS = ["<2500", "2500-3500", ">3500"] as const;

export const consentSchema = z.object({
  acepto: z.literal("on", { error: "Necesitas marcar «Acepto» para continuar." }),
  city: z
    .string({ error: "Escribe tu ciudad o alcaldía." })
    .trim()
    .min(2, { error: "La ciudad debe tener al menos 2 letras." })
    .max(60, { error: "La ciudad puede tener máximo 60 caracteres." }),
  grocery_band: z.enum(GROCERY_BANDS, { error: "Elige cuánto gastas al mes en súper." }),
});

// ---------- Montos y registros (Feature 4) ----------

/** Monto en pesos enteros 0–2000, recibido como texto del formulario. */
export const amountSchema = z
  .string({ error: "Escribe el monto en pesos." })
  .trim()
  .transform((v) => v.replace(/[$,\s]/g, "")) // acepta "$150" o "1,500"
  .pipe(z.string().min(1, { error: "Escribe el monto en pesos." }))
  .refine((v) => !v.startsWith("-"), { error: "El monto no puede ser negativo." })
  .refine((v) => /^\d+$/.test(v), { error: "Escribe solo números enteros, sin decimales ni letras." })
  .transform((v) => Number(v))
  .pipe(z.number().int().min(0).max(2000, { error: "El máximo por registro es $2,000." }));

export const BASELINE_LABELS = ["antojo", "no_planee", "no_tuve_tiempo", "alcohol_tabaco", "otro"] as const;
export const BASELINE_LABEL_TEXT: Record<(typeof BASELINE_LABELS)[number], string> = {
  antojo: "Antojo",
  no_planee: "No planeé",
  no_tuve_tiempo: "No tuve tiempo",
  alcohol_tabaco: "Alcohol o tabaco",
  otro: "Otro",
};

export const baselineOrderSchema = z.object({
  label: z.enum(BASELINE_LABELS, { error: "Elige por qué hiciste ese pedido." }),
  amount_mxn: amountSchema,
});
/** Renglones sugeridos al abrir la pantalla y máximo permitido (persona test: 10 → mínimo 0 / sugeridos 3). */
export const BASELINE_SUGGESTED = 3;
export const BASELINE_MAX = 10;

export const baselineSchema = z
  .array(baselineOrderSchema)
  .min(1, { error: "Llena al menos un pedido, o toca «Saltar por ahora»." })
  .max(BASELINE_MAX, { error: "Máximo 10 pedidos." });

export const IMPULSE_KINDS = ["delivery", "oxxo", "otro"] as const;
export const IMPULSE_KIND_TEXT: Record<(typeof IMPULSE_KINDS)[number], string> = {
  delivery: "Pedido a domicilio",
  oxxo: "OXXO / tiendita",
  otro: "Otra compra no planeada",
};

const whenSchema = z.enum(["hoy", "ayer"], { error: "Elige si fue hoy o ayer." });

export const wasteSchema = z.object({
  item: z
    .string({ error: "Escribe qué tiraste." })
    .trim()
    .min(1, { error: "Escribe qué tiraste." })
    .max(60, { error: "Máximo 60 caracteres." }),
  amount_mxn: amountSchema,
  when: whenSchema,
});

export const impulseSchema = z.object({
  kind: z.enum(IMPULSE_KINDS, { error: "Elige qué tipo de compra fue." }),
  amount_mxn: amountSchema,
  when: whenSchema,
});

/** Convierte issues de zod en { campo: primer mensaje }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "form";
    out[key] ??= issue.message;
  }
  return out;
}
