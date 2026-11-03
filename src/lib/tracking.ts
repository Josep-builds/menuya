import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, daysBetween, mxDate, weekFor } from "./dates";

export type WasteLog = { id: number; log_date: string; item: string; amount_mxn: number; week: 1 | 2 };
export type ImpulseLog = { id: number; log_date: string; kind: "delivery" | "oxxo" | "otro"; amount_mxn: number; week: 1 | 2 };
export type BaselineOrder = { label: string; amount_mxn: number };

/** Estado de la prueba de 14 días del usuario (todo vía RLS, solo filas propias). */
export async function getTracking(supabase: SupabaseClient) {
  const [{ data: baseline }, { data: waste }, { data: impulse }] = await Promise.all([
    supabase.from("menuya_baseline_orders").select("label, amount_mxn, created_at").order("created_at"),
    supabase.from("menuya_waste_logs").select("id, log_date, item, amount_mxn, week").order("created_at"),
    supabase.from("menuya_impulse_logs").select("id, log_date, kind, amount_mxn, week").order("created_at"),
  ]);

  const today = mxDate();
  // Día 1 de la prueba = día (CDMX) en que etiquetó su línea base.
  const startDate = baseline?.length ? mxDate(new Date(baseline[0].created_at)) : null;
  const dayIndex = startDate ? daysBetween(startDate, today) : null; // 0 = día 1
  const currentWeek = startDate ? weekFor(startDate, today) : null;
  const finished = dayIndex !== null && dayIndex > 13;

  const wasteLogs = (waste ?? []) as WasteLog[];
  const impulseLogs = (impulse ?? []) as ImpulseLog[];
  const loggedDates = new Set([...wasteLogs, ...impulseLogs].map((l) => l.log_date));
  const weekDays = (w: 1 | 2) => [...loggedDates].filter((d) => startDate && weekFor(startDate, d) === w).length;

  return {
    today,
    startDate,
    dayIndex,
    currentWeek,
    finished,
    baseline: (baseline ?? []) as BaselineOrder[],
    wasteLogs,
    impulseLogs,
    loggedToday: loggedDates.has(today),
    daysLoggedThisWeek: currentWeek ? weekDays(currentWeek) : 0,
    daysLogged: { 1: weekDays(1), 2: weekDays(2) },
    todayWaste: wasteLogs.filter((l) => l.log_date === today),
    todayImpulse: impulseLogs.filter((l) => l.log_date === today),
    yesterday: addDays(today, -1),
  };
}
