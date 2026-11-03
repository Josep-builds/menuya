import "server-only";
import { redirect } from "next/navigation";
import { requireConsent } from "./session";
import { hasEvent } from "./events";

/** Orden obligatorio: sesión → consentimiento → ELCSA → línea base. */
export async function requireElcsa() {
  const ctx = await requireConsent();
  if (!(await hasEvent(ctx.supabase, "elcsa_completed"))) redirect("/preguntas");
  return ctx;
}

export async function hasBaseline(supabase: Awaited<ReturnType<typeof requireConsent>>["supabase"]) {
  const { count } = await supabase.from("menuya_baseline_orders").select("id", { count: "exact", head: true });
  return (count ?? 0) > 0;
}

export async function requireBaseline() {
  const ctx = await requireElcsa();
  if (!(await hasBaseline(ctx.supabase))) redirect("/linea-base");
  return ctx;
}
