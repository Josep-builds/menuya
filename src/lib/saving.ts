// Cálculo del ahorro: función pura (sin red, sin base de datos) para poder probarla con datos sembrados.
import { weekFor, daysBetween } from "./dates";

export const GOAL_MXN = 60;

type Log = { log_date: string; amount_mxn: number };
type Baseline = { label: string; amount_mxn: number };

export type Saving = {
  status: "sin_inicio" | "semana1" | "semana2_parcial" | "final";
  week1Total: number;
  week2Total: number;
  /** Días comparados (en semana 2 parcial se comparan los mismos días de ambas semanas). */
  daysCompared: number;
  /** semana 1 − semana 2, en pesos. Puede ser negativo. */
  saving: number;
  goalMet: boolean;
  /** 0–1 para la barra. */
  progress: number;
  alcoholTabaco: { count: number; amount: number };
};

export function computeSaving(input: {
  startDate: string | null;
  today: string;
  waste: Log[];
  impulse: Log[];
  baseline: Baseline[];
}): Saving {
  const alcohol = input.baseline.filter((b) => b.label === "alcohol_tabaco");
  const alcoholTabaco = { count: alcohol.length, amount: alcohol.reduce((s, b) => s + b.amount_mxn, 0) };
  const empty = { week1Total: 0, week2Total: 0, daysCompared: 0, saving: 0, goalMet: false, progress: 0, alcoholTabaco };

  if (!input.startDate) return { status: "sin_inicio", ...empty };
  const start = input.startDate;
  const dayIdx = daysBetween(start, input.today); // 0 = día 1
  const all = [...input.waste, ...input.impulse];

  // Día de la semana (0–6) de cada registro, y su semana.
  const sum = (week: 1 | 2, maxDay: number) =>
    all
      .filter((l) => weekFor(start, l.log_date) === week && daysBetween(start, l.log_date) % 7 < maxDay)
      .reduce((s, l) => s + l.amount_mxn, 0);

  if (dayIdx < 7) {
    return { status: "semana1", ...empty, week1Total: sum(1, 7), daysCompared: 0 };
  }

  // Semana 2 en curso: compara solo los días completos que ya pasaron de la semana 2
  // contra los mismos días de la semana 1, para no inflar el ahorro.
  const final = dayIdx > 13;
  const daysCompared = final ? 7 : dayIdx - 7 + 1; // incluye hoy
  const week1Total = sum(1, daysCompared);
  const week2Total = sum(2, daysCompared);
  const saving = week1Total - week2Total;
  return {
    status: final ? "final" : "semana2_parcial",
    week1Total,
    week2Total,
    daysCompared,
    saving,
    goalMet: saving >= GOAL_MXN,
    progress: Math.max(0, Math.min(1, saving / GOAL_MXN)),
    alcoholTabaco,
  };
}
