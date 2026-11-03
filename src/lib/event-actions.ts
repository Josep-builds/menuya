"use server";

import { requireConsent } from "./session";
import { logEvent } from "./events";

// Acciones de eventos que dispara el cliente. Nombres fijos: el cliente no elige qué se guarda.
export async function trackSavingViewed() {
  const { supabase } = await requireConsent();
  await logEvent(supabase, "saving_viewed");
}

export async function trackPayLinkClicked() {
  const { supabase } = await requireConsent();
  await logEvent(supabase, "pay_link_clicked");
}
