// Fechas siempre en hora de la Ciudad de México (no en UTC del servidor).
export const TZ = "America/Mexico_City";

/** 'YYYY-MM-DD' de un instante en hora CDMX. */
export function mxDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Días entre dos fechas 'YYYY-MM-DD' (b - a). */
export function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function addDays(date: string, n: number): string {
  const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10) + n));
  return d.toISOString().slice(0, 10);
}

/** Semana de la prueba (1 o 2) para una fecha, contando desde el día de inicio. null = fuera de la prueba. */
export function weekFor(startDate: string, logDate: string): 1 | 2 | null {
  const day = daysBetween(startDate, logDate); // 0 = primer día
  if (day < 0 || day > 13) return null;
  return day < 7 ? 1 : 2;
}
