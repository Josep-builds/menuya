import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  user_id: string;
  city: string | null;
  grocery_band: "<2500" | "2500-3500" | ">3500" | null;
  consent_at: string | null;
};

/** Usuario + perfil. Redirige a /entrar si no hay sesión. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("menuya_profiles")
    .select("user_id, city, grocery_band, consent_at")
    .eq("user_id", user.id)
    .maybeSingle<Profile>();

  return { supabase, user, profile };
}

/** Igual que requireUser, pero además exige consentimiento. */
export async function requireConsent() {
  const ctx = await requireUser();
  if (!ctx.profile?.consent_at) redirect("/aviso");
  return ctx as typeof ctx & { profile: Profile };
}
