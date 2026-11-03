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
