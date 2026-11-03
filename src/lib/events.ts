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
  props: z.record(z.string().max(40), z.union([z.string().max(60), z.number(), z.boolean()])).default({}),
});

/** Escribe un evento propio (RLS). Nunca recibe respuestas ni puntaje de ELCSA. */
export async function logEvent(
  supabase: SupabaseClient,
  name: EventName,
  props: Record<string, string | number | boolean> = {},
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
