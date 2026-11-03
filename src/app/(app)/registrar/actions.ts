"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireBaseline } from "@/lib/onboarding";
import { getTracking } from "@/lib/tracking";
import { logEvent } from "@/lib/events";
import { weekFor } from "@/lib/dates";
import { fieldErrors, impulseSchema, wasteSchema } from "@/lib/validation";

export type LogState = { errors?: Record<string, string> } | undefined;

/** Fecha + semana del registro (hoy o ayer, dentro de los 14 días). */
async function resolveDate(when: "hoy" | "ayer") {
  const ctx = await requireBaseline();
  const t = await getTracking(ctx.supabase);
  const log_date = when === "hoy" ? t.today : t.yesterday;
  const week = t.startDate ? weekFor(t.startDate, log_date) : null;
  return { ...ctx, log_date, week };
}

const OUT_OF_RANGE = {
  errors: { when: "Esa fecha está fuera de tus 14 días de prueba." },
};

export async function addWaste(_prev: LogState, formData: FormData): Promise<LogState> {
  const parsed = wasteSchema.safeParse({
    item: formData.get("item") ?? undefined,
    amount_mxn: formData.get("amount_mxn") ?? undefined,
    when: formData.get("when") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { supabase, log_date, week } = await resolveDate(parsed.data.when);
  if (!week) return OUT_OF_RANGE;
  const { error } = await supabase
    .from("menuya_waste_logs")
    .insert({ log_date, week, item: parsed.data.item, amount_mxn: parsed.data.amount_mxn });
  if (error) return { errors: { form: "No pudimos guardar. Intenta de nuevo." } };
  await logEvent(supabase, "log_added", { type: "waste", week });
  revalidatePath("/inicio");
  redirect("/inicio");
}

export async function addImpulse(_prev: LogState, formData: FormData): Promise<LogState> {
  const parsed = impulseSchema.safeParse({
    kind: formData.get("kind") ?? undefined,
    amount_mxn: formData.get("amount_mxn") ?? undefined,
    when: formData.get("when") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { supabase, log_date, week } = await resolveDate(parsed.data.when);
  if (!week) return OUT_OF_RANGE;
  const { error } = await supabase
    .from("menuya_impulse_logs")
    .insert({ log_date, week, kind: parsed.data.kind, amount_mxn: parsed.data.amount_mxn });
  if (error) return { errors: { form: "No pudimos guardar. Intenta de nuevo." } };
  await logEvent(supabase, "log_added", { type: "impulse", week });
  revalidatePath("/inicio");
  redirect("/inicio");
}

/** "Hoy no tiré nada ni compré de más": cuenta como día registrado con $0. */
export async function addNothingToday() {
  const { supabase, log_date, week } = await resolveDate("hoy");
  if (!week) redirect("/inicio");
  const t = await getTracking(supabase);
  if (!t.loggedToday) {
    await supabase.from("menuya_waste_logs").insert({ log_date, week, item: "Nada hoy", amount_mxn: 0 });
    await logEvent(supabase, "log_added", { type: "nothing", week });
  }
  revalidatePath("/inicio");
  redirect("/inicio");
}

const deleteSchema = z.object({ table: z.enum(["waste", "impulse"]), id: z.coerce.number().int().positive() });

export async function deleteLog(formData: FormData) {
  const parsed = deleteSchema.safeParse({ table: formData.get("table"), id: formData.get("id") });
  if (!parsed.success) return;
  const { supabase } = await requireBaseline();
  const table = parsed.data.table === "waste" ? "menuya_waste_logs" : "menuya_impulse_logs";
  await supabase.from(table).delete().eq("id", parsed.data.id); // RLS: solo filas propias
  revalidatePath("/inicio");
}
