// Estado del simulador de /pricing: campos, escenarios predefinidos y escenarios guardados.
// Los escenarios guardados viven SOLO en el localStorage del navegador de quien los guarda.
// No guardan datos personales: solo números y un nombre automático ("Mi escenario N").

import { PRECIOS, SUPUESTOS_INICIALES as S0, simular, type Supuestos } from "./pricing";

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

// --- Validación (security floor): cada campo tiene mínimo, máximo, decimales y largo máximo ---

export type Limite = { etiqueta: string; min: number; max: number; decimales: number; unidad?: "%" | "$" };

/** Largo máximo de texto en cualquier campo del simulador. */
export const MAX_CARACTERES = 9;

export const LIMITES: Record<Campo, Limite> = {
  usuariosFree: { etiqueta: "Usuarios free", min: 0, max: 10000, decimales: 0 },
  conversion: { etiqueta: "Conversión", min: 0, max: 100, decimales: 2, unidad: "%" },
  haircut: { etiqueta: "Haircut", min: 0, max: 100, decimales: 2, unidad: "%" },
  pct: { etiqueta: "Comisión %", min: 0, max: 20, decimales: 2, unidad: "%" },
  fijo: { etiqueta: "Comisión fija", min: 0, max: 50, decimales: 2, unidad: "$" },
  iva: { etiqueta: "IVA", min: 0, max: 30, decimales: 2, unidad: "%" },
  horasV1: { etiqueta: "Horas", min: 0, max: 200, decimales: 1 },
  tarifaHoraV1: { etiqueta: "Pago por hora", min: 0, max: 2000, decimales: 2, unidad: "$" },
  cupoV1: { etiqueta: "Cupo", min: 1, max: 1000, decimales: 0 },
  proveedorWhatsAppV2: { etiqueta: "Proveedor WhatsApp", min: 0, max: 50000, decimales: 2, unidad: "$" },
  metaMensual: { etiqueta: "Meta mensual", min: 0, max: 1000000, decimales: 2, unidad: "$" },
};

export type Validado = { valor: number; aviso: string | null };

const fmt = (n: number, l: Limite) =>
  l.unidad === "$" ? `$${n.toLocaleString("es-MX")}` : `${n.toLocaleString("es-MX")}${l.unidad === "%" ? "%" : ""}`;

/** Convierte el texto de un campo en un número dentro de su rango. Si tuvo que corregir, dice por qué. */
export function validarCampo(campo: Campo, texto: string): Validado {
  const l = LIMITES[campo];
  const limpio = texto.slice(0, MAX_CARACTERES).replace(/[$,\s%]/g, "");
  if (texto.length > MAX_CARACTERES) {
    const n = Number(limpio);
    const valor = Number.isFinite(n) ? Math.min(Math.max(n, l.min), l.max) : l.min;
    return { valor, aviso: `${l.etiqueta}: máximo ${MAX_CARACTERES} caracteres. Usamos ${fmt(valor, l)}.` };
  }
  if (limpio === "") return { valor: l.min, aviso: `${l.etiqueta}: está vacío. Usamos ${fmt(l.min, l)}.` };
  const n = Number(limpio);
  if (!Number.isFinite(n) || !/^-?\d*\.?\d*$/.test(limpio)) {
    return { valor: l.min, aviso: `${l.etiqueta}: no es un número. Usamos ${fmt(l.min, l)}.` };
  }
  if (n < l.min) return { valor: l.min, aviso: `${l.etiqueta}: el mínimo es ${fmt(l.min, l)}. Lo ajustamos.` };
  if (n > l.max) return { valor: l.max, aviso: `${l.etiqueta}: el máximo es ${fmt(l.max, l)}. Lo ajustamos.` };
  const f = 10 ** l.decimales;
  const redondeado = Math.round(n * f) / f;
  if (redondeado !== n) {
    const txt = l.decimales === 0 ? "sin decimales" : `con ${l.decimales} decimal${l.decimales > 1 ? "es" : ""}`;
    return { valor: redondeado, aviso: `${l.etiqueta}: va ${txt}. Usamos ${fmt(redondeado, l)}.` };
  }
  return { valor: n, aviso: null };
}

export function aSupuestos(c: Campos, precio: number): Supuestos {
  const n = (k: Campo) => validarCampo(k, c[k]).valor;
  return {
    usuariosFree: n("usuariosFree"),
    conversion: n("conversion") / 100,
    precio,
    haircut: n("haircut") / 100,
    comision: { pct: n("pct") / 100, fijo: n("fijo"), iva: n("iva") / 100 },
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
    // Aunque tenga la forma correcta, cada valor vuelve a pasar por sus límites.
    out.push({
      nombre,
      precio: precio as Precio,
      campos: Object.fromEntries(CAMPOS.map((k) => [k, String(validarCampo(k, c[k] as string).valor)])) as Campos,
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
      campos: Object.fromEntries(CAMPOS.map((k) => [k, String(validarCampo(k, e.campos[k]).valor)])),
    })),
  );
}

// --- Avisos del resultado (plan de pruebas, PACKET §11) ---

/** Abajo de este precio, la comisión fija ($3 + IVA) se come ~un tercio de cada cobro. */
export const PRECIO_MINIMO_SANO = 15;

export type AvisoResultado = {
  id: "precio-bajo" | "equilibrio-v1-sobre-cupo" | "pagando-sobre-cupo" | "meta-necesita-v2";
  texto: string;
};

const pesos = (n: number) => `$${Math.round(n).toLocaleString("es-MX")}`;
const enteros = (n: number) => n.toLocaleString("es-MX");

export function avisosResultado(s: Supuestos): AvisoResultado[] {
  const r = simular(s);
  const out: AvisoResultado[] = [];
  if (s.precio < PRECIO_MINIMO_SANO) {
    const parte = s.precio > 0 ? Math.round((r.comision / s.precio) * 100) : 100;
    out.push({
      id: "precio-bajo",
      texto: `Con un precio menor a $${PRECIO_MINIMO_SANO}, la comisión fija se come ~un tercio (aquí, ${parte}% de cada cobro).`,
    });
  }
  const eq = r.equilibrioV1.pagando;
  if (eq === null || eq > s.cupoV1) {
    out.push({
      id: "equilibrio-v1-sobre-cupo",
      texto:
        eq === null
          ? `v1 nunca llega al equilibrio: la comisión se come todo el precio.`
          : `Para cubrir v1 (${pesos(r.costoV1)}/mes) se necesitan ${enteros(eq)} usuarios que pagan, más que el cupo de ${enteros(s.cupoV1)}. v1 no llega al equilibrio.`,
    });
  }
  if (!r.caben) {
    out.push({
      id: "pagando-sobre-cupo",
      texto: `Con ${enteros(r.pagando)} usuarios que pagan ya no cabes en v1 (cupo ${enteros(s.cupoV1)}).`,
    });
  }
  if (r.meta.pagando !== null && r.meta.pagando > s.cupoV1) {
    out.push({
      id: "meta-necesita-v2",
      texto: `Ojo: v1 es manual y solo atiende ${enteros(s.cupoV1)} usuarios. Llegar a ${pesos(s.metaMensual)}/mes necesita v2.`,
    });
  }
  return out;
}
