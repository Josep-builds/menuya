"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { consentSchema } from "@/lib/validation";

export type ConsentState = { errors?: Record<string, string> } | undefined;

export async function giveConsent(_prev: ConsentState, formData: FormData): Promise<ConsentState> {
  const parsed = consentSchema.safeParse({
    acepto: formData.get("acepto") ?? undefined,
    city: formData.get("city") ?? undefined,
    grocery_band: formData.get("grocery_band") ?? undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { errors };
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("menuya_profiles").upsert(
    {
      user_id: user.id,
      city: parsed.data.city,
      grocery_band: parsed.data.grocery_band,
      consent_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return { errors: { form: "No pudimos guardar. Intenta de nuevo." } };

  redirect("/inicio");
}
