// ELCSA — versión para hogares integrados solo por adultos (8 preguntas, últimos 3 meses).
// Este módulo se usa SOLO en el navegador. Las respuestas y el puntaje nunca se envían
// ni se guardan (ni en la base de datos, ni en localStorage/sessionStorage, ni en cookies).

export const ELCSA_PREFIX =
  "En los últimos 3 meses, por falta de dinero u otros recursos, alguna vez…";

export const ELCSA_QUESTIONS = [
  "¿te preocupó que la comida se acabara en tu hogar?",
  "¿en tu hogar se quedaron sin comida?",
  "¿en tu hogar dejaron de tener una alimentación sana y variada?",
  "¿tú o algún adulto de tu hogar comieron casi siempre lo mismo, con muy poca variedad?",
  "¿tú o algún adulto de tu hogar dejaron de desayunar, comer o cenar?",
  "¿tú o algún adulto de tu hogar comieron menos de lo que debían comer?",
  "¿tú o algún adulto de tu hogar sintieron hambre pero no comieron?",
  "¿tú o algún adulto de tu hogar comieron solo una vez al día o dejaron de comer todo un día?",
] as const;

export type ElcsaLevel = "seguridad" | "leve" | "moderada" | "severa";

/** 0 = seguridad, 1–3 leve, 4–6 moderada, 7–8 severa. */
export function scoreElcsa(answers: readonly boolean[]): ElcsaLevel {
  if (answers.length !== ELCSA_QUESTIONS.length) throw new Error("ELCSA incompleta");
  const yes = answers.filter(Boolean).length;
  if (yes === 0) return "seguridad";
  if (yes <= 3) return "leve";
  if (yes <= 6) return "moderada";
  return "severa";
}

export function needsReferral(level: ElcsaLevel | null): boolean {
  return level === "moderada" || level === "severa";
}

/**
 * Qué hacer con el botón de pago según el resultado EN MEMORIA de esta pestaña.
 * - null (no contestó aquí / recargó): "retake" → invitar a contestar otra vez, sin precio.
 * - moderada/severa: "hidden" → nada (ni precio, ni botón, ni pista).
 * - seguridad/leve: "show".
 */
export function payButtonMode(level: ElcsaLevel | null): "retake" | "hidden" | "show" {
  if (level === null) return "retake";
  return needsReferral(level) ? "hidden" : "show";
}
