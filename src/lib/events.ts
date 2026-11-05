import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

export const EVENT_NAMES = [
  "signed_in",
  "consent_given",
  "elcsa_completed",
  "baseline_done",
  "log_added",
  "saving_viewed",
  "pay_link_clicked",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

const eventSchema = z.object({
  name: z.enum(EVENT_NAMES),
  // Mismas llaves y valores que el check de la base (migración 005). Nada más entra.
  props: z
    .strictObject({
      type: z.enum(["waste", "impulse", "nothing"]).optional(),
      week: z.union([z.literal(1), z.literal(2)]).optional(),
      orders: z.number().int().min(0).max(10).optional(), // 0 = saltó la línea base
    })
    .default({}),
});

/** Escribe un evento propio (RLS). Nunca recibe respuestas ni puntaje de ELCSA. */
export async function logEvent(
  supabase: SupabaseClient,
  name: EventName,
  props: { type?: "waste" | "impulse" | "nothing"; week?: 1 | 2; orders?: number } = {},
) {
  const parsed = eventSchema.parse({ name, props });
  await supabase.from("menuya_events").insert({ name: parsed.name, props: parsed.props });
}

export async function hasEvent(supabase: SupabaseClient, name: EventName) {
  const { count } = await supabase
    .from("menuya_events")
    .select("id", { count: "exact", head: true })
    .eq("name", name);
  return (count ?? 0) > 0;
}
