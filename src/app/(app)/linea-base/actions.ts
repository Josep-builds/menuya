"use server";

import { redirect } from "next/navigation";
import { requireElcsa, hasBaseline } from "@/lib/onboarding";
import { hasEvent, logEvent } from "@/lib/events";
import { BASELINE_MAX, baselineSchema, fieldErrors } from "@/lib/validation";

export type BaselineState = { errors?: Record<string, string> } | undefined;

export async function saveBaseline(_prev: BaselineState, formData: FormData): Promise<BaselineState> {
  const rows: { label: FormDataEntryValue | null; amount_mxn: FormDataEntryValue | null }[] = [];
  for (let i = 0; i < BASELINE_MAX; i++) {
    const label = formData.get(`label_${i}`);
    const amount = formData.get(`amount_${i}`);
    const empty = !label && !String(amount ?? "").trim();
    if (!empty) rows.push({ label: label || null, amount_mxn: amount ?? "" });
  }
  const parsed = baselineSchema.safeParse(rows.map((r) => ({ label: r.label ?? undefined, amount_mxn: r.amount_mxn })));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { supabase } = await requireElcsa();
  if (await hasBaseline(supabase)) redirect("/inicio"); // ya estaba hecha: no duplicar

  const { error } = await supabase.from("menuya_baseline_orders").insert(parsed.data);
  if (error) return { errors: { form: "No pudimos guardar. Intenta de nuevo." } };
  await logEvent(supabase, "baseline_done", { orders: parsed.data.length });
  redirect("/inicio");
}

/** "Saltar por ahora": marca el día 1 de la prueba sin pedidos (orders 0). Se puede llenar después desde el inicio. */
export async function skipBaseline(): Promise<void> {
  const { supabase } = await requireElcsa();
  if (!(await hasEvent(supabase, "baseline_done")) && !(await hasBaseline(supabase))) {
    await logEvent(supabase, "baseline_done", { orders: 0 });
  }
  redirect("/inicio");
}
