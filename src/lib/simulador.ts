// Estado del simulador de /pricing: campos, escenarios predefinidos y escenarios guardados.
// Los escenarios guardados viven SOLO en el localStorage del navegador de quien los guarda.
// No guardan datos personales: solo números y un nombre automático ("Mi escenario N").

import { PRECIOS, SUPUESTOS_INICIALES as S0, type Supuestos } from "./pricing";

export const CAMPOS = [
  "usuariosFree",
  "conversion",
  "haircut",
  "pct",
  "fijo",
  "iva",
  "horasV1",
  "tarifaHoraV1",
  "cupoV1",
  "proveedorWhatsAppV2",
  "metaMensual",
] as const;
export type Campo = (typeof CAMPOS)[number];

// Se guardan como texto para poder borrar y reescribir sin que salte a 0.
export type Campos = Record<Campo, string>;
export type Precio = (typeof PRECIOS)[number];
export type Escenario = { nombre: string; campos: Campos; precio: Precio };

// Fracción → texto en %, sin basura de punto flotante (0.036 × 100 = 3.5999999999999996).
const pct = (f: number) => String(Math.round(f * 10000) / 100);

export const CAMPOS_BASE: Campos = {
  usuariosFree: String(S0.usuariosFree),
  conversion: pct(S0.conversion),
  haircut: pct(S0.haircut),
  pct: pct(S0.comision.pct),
  fijo: String(S0.comision.fijo),
  iva: pct(S0.comision.iva),
  horasV1: String(S0.horasV1),
  tarifaHoraV1: String(S0.tarifaHoraV1),
  cupoV1: String(S0.cupoV1),
  proveedorWhatsAppV2: String(S0.proveedorWhatsAppV2),
  metaMensual: String(S0.metaMensual),
};

/** Solo cambian usuarios, conversión y haircut. Precio, comisión y costos son los mismos en los tres. */
export const ESCENARIOS_PREDEFINIDOS: readonly Escenario[] = [
  { nombre: "Conservador", campos: { ...CAMPOS_BASE, usuariosFree: "500", conversion: "2", haircut: "30" }, precio: 49 },
  { nombre: "Base", campos: CAMPOS_BASE, precio: 49 },
  { nombre: "Optimista", campos: { ...CAMPOS_BASE, usuariosFree: "3000", conversion: "5", haircut: "10" }, precio: 49 },
];

export function leerNumero(v: string): number {
  const n = Number(v.replace(/[$,\s%]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export function aSupuestos(c: Campos, precio: number): Supuestos {
  const n = (k: Campo, max = Infinity) => clamp(leerNumero(c[k]), 0, max);
  return {
    usuariosFree: n("usuariosFree", 10000),
    conversion: n("conversion", 100) / 100,
    precio,
    haircut: n("haircut", 100) / 100,
    comision: { pct: n("pct", 100) / 100, fijo: n("fijo"), iva: n("iva", 100) / 100 },
    horasV1: n("horasV1"),
    tarifaHoraV1: n("tarifaHoraV1"),
    cupoV1: n("cupoV1"),
    proveedorWhatsAppV2: n("proveedorWhatsAppV2"),
    metaMensual: n("metaMensual"),
  };
}

// --- Escenarios guardados (localStorage) ---

export const STORAGE_KEY = "menuya-simulador-escenarios-v1";
export const MAX_GUARDADOS = 10;
const NOMBRE_GUARDADO = /^Mi escenario \d{1,3}$/;
const VALOR_GUARDADO = /^[0-9.]{1,12}$/;

export function nombreNuevo(guardados: readonly Escenario[]): string {
  const usados = new Set(guardados.map((e) => e.nombre));
  let n = 1;
  while (usados.has(`Mi escenario ${n}`)) n++;
  return `Mi escenario ${n}`;
}

/**
 * Lee lo que haya en localStorage. Todo lo que no tenga la forma exacta se descarta:
 * el contenido puede venir alterado (otra pestaña, extensiones, la consola).
 */
export function parseGuardados(raw: string | null): Escenario[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: Escenario[] = [];
  for (const e of data.slice(0, MAX_GUARDADOS)) {
    if (!e || typeof e !== "object") continue;
    const { nombre, campos, precio } = e as Record<string, unknown>;
    if (typeof nombre !== "string" || !NOMBRE_GUARDADO.test(nombre)) continue;
    if (!PRECIOS.includes(precio as Precio)) continue;
    if (!campos || typeof campos !== "object") continue;
    const c = campos as Record<string, unknown>;
    if (!CAMPOS.every((k) => typeof c[k] === "string" && VALOR_GUARDADO.test(c[k] as string))) continue;
    out.push({
      nombre,
      precio: precio as Precio,
      campos: Object.fromEntries(CAMPOS.map((k) => [k, c[k] as string])) as Campos,
    });
  }
  return out;
}

/** Lo que se guarda: solo el nombre automático, el precio y los campos numéricos normalizados. */
export function serializarGuardados(lista: readonly Escenario[]): string {
  return JSON.stringify(
    lista.slice(0, MAX_GUARDADOS).map((e) => ({
      nombre: e.nombre,
      precio: e.precio,
      campos: Object.fromEntries(CAMPOS.map((k) => [k, String(leerNumero(e.campos[k]))])),
    })),
  );
}
