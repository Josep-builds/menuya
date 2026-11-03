"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

// Tablas de MenúYA con datos del usuario. Se borran con RLS (solo filas propias).
const USER_TABLES = ["menuya_profiles"] as const;

export async function deleteMyData() {
  const { supabase, user } = await requireUser();
  for (const table of USER_TABLES) {
    await supabase.from(table).delete().eq("user_id", user.id);
  }
  await supabase.auth.signOut();
  redirect("/?borrado=1");
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/");
}
