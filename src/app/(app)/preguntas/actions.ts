"use server";

import { requireConsent } from "@/lib/session";
import { logEvent } from "@/lib/events";

// No recibe argumentos a propósito: el servidor solo sabe que se completó, no el resultado.
export async function markElcsaCompleted() {
  const { supabase } = await requireConsent();
  await logEvent(supabase, "elcsa_completed");
}
