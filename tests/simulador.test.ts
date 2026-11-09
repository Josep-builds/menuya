import { test } from "node:test";
import assert from "node:assert/strict";
import { simular } from "../src/lib/pricing";
import {
  CAMPOS,
  CAMPOS_BASE,
  ESCENARIOS_PREDEFINIDOS,
  MAX_GUARDADOS,
  aSupuestos,
  nombreNuevo,
  parseGuardados,
  serializarGuardados,
  type Escenario,
} from "../src/lib/simulador";
import { LIMITES, MAX_CARACTERES, validarCampo } from "../src/lib/simulador";

const esc = (nombre: string): Escenario => ({ nombre, campos: CAMPOS_BASE, precio: 49 });

test("hay 3 escenarios predefinidos: Conservador, Base, Optimista", () => {
  assert.deepEqual(ESCENARIOS_PREDEFINIDOS.map((e) => e.nombre), ["Conservador", "Base", "Optimista"]);
});

test("el escenario Base da la comprobación obligatoria a $49", () => {
  const base = ESCENARIOS_PREDEFINIDOS[1];
  const r = simular(aSupuestos(base.campos, base.precio));
  assert.equal(r.neto.toFixed(2), "43.47");
  assert.equal(r.equilibrioV1.pagando, 12);
  assert.equal(r.equilibrioV2.pagando, 28);
  assert.equal(r.meta.pagando, 215);
});

test("Conservador < Base < Optimista en usuarios que pagan", () => {
  const [c, b, o] = ESCENARIOS_PREDEFINIDOS.map((e) => simular(aSupuestos(e.campos, e.precio)).pagando);
  assert.equal(c, 7); // 500 × 2% × 70%
  assert.equal(b, 24); // 1,000 × 3% × 80%
  assert.equal(o, 135); // 3,000 × 5% × 90%
});

test("guardar y volver a leer da lo mismo", () => {
  const lista = [esc("Mi escenario 1"), { ...esc("Mi escenario 2"), precio: 69 as const }];
  assert.deepEqual(parseGuardados(serializarGuardados(lista)), lista);
});

test("lo guardado solo trae nombre automático, precio y números (sin datos personales)", () => {
  const conExtra = { ...esc("Mi escenario 1"), correo: "alguien@ejemplo.com" } as Escenario;
  const raw = serializarGuardados([conExtra]);
  assert.doesNotMatch(raw, /correo|@/);
  const obj = JSON.parse(raw)[0];
  assert.deepEqual(Object.keys(obj).sort(), ["campos", "nombre", "precio"]);
  assert.deepEqual(Object.keys(obj.campos).sort(), [...CAMPOS].sort());
});

test("localStorage alterado o roto se ignora sin tronar", () => {
  assert.deepEqual(parseGuardados(null), []);
  assert.deepEqual(parseGuardados("{no es json"), []);
  assert.deepEqual(parseGuardados('{"a":1}'), []);
  const malos = [
    { nombre: "<script>alert(1)</script>", campos: CAMPOS_BASE, precio: 49 },
    { nombre: "Mi escenario 1", campos: CAMPOS_BASE, precio: 1 },
    { nombre: "Mi escenario 2", campos: { ...CAMPOS_BASE, conversion: "javascript:" }, precio: 49 },
    { nombre: "Mi escenario 3", campos: { conversion: "3" }, precio: 49 },
    null,
  ];
  assert.deepEqual(parseGuardados(JSON.stringify(malos)), []);
});

test(`máximo ${MAX_GUARDADOS} escenarios guardados`, () => {
  const muchos = Array.from({ length: 15 }, (_, i) => esc(`Mi escenario ${i + 1}`));
  assert.equal(parseGuardados(serializarGuardados(muchos)).length, MAX_GUARDADOS);
});

test("el nombre nuevo usa el primer número libre", () => {
  assert.equal(nombreNuevo([]), "Mi escenario 1");
  assert.equal(nombreNuevo([esc("Mi escenario 1"), esc("Mi escenario 3")]), "Mi escenario 2");
});

// --- Validación (security floor) ---

test("cada campo tiene mínimo < máximo y los valores Base están dentro de rango sin aviso", () => {
  for (const k of CAMPOS) {
    assert.ok(LIMITES[k].min < LIMITES[k].max, k);
    assert.deepEqual(validarCampo(k, CAMPOS_BASE[k]).aviso, null, k);
  }
});

test("fuera de rango se corrige al límite y avisa", () => {
  assert.deepEqual(validarCampo("conversion", "150"), { valor: 100, aviso: "Conversión: el máximo es 100%. Lo ajustamos." });
  assert.deepEqual(validarCampo("conversion", "-5"), { valor: 0, aviso: "Conversión: el mínimo es 0%. Lo ajustamos." });
  assert.equal(validarCampo("usuariosFree", "50000").valor, 10000);
  assert.equal(validarCampo("cupoV1", "0").valor, 1);
  assert.equal(validarCampo("pct", "99").valor, 20);
  assert.equal(validarCampo("metaMensual", "5000000").valor, 1000000);
});

test("texto que no es número, vacío o con decimales de más se corrige y avisa", () => {
  assert.deepEqual(validarCampo("haircut", "abc"), { valor: 0, aviso: "Haircut: no es un número. Usamos 0%." });
  assert.deepEqual(validarCampo("haircut", "1e2"), { valor: 0, aviso: "Haircut: no es un número. Usamos 0%." });
  assert.deepEqual(validarCampo("fijo", ""), { valor: 0, aviso: "Comisión fija: está vacío. Usamos $0." });
  assert.deepEqual(validarCampo("cupoV1", "25.5"), { valor: 26, aviso: "Cupo: va sin decimales. Usamos 26." });
  assert.equal(validarCampo("pct", "3.6789").valor, 3.68);
});

test("acepta $, comas, espacios y % (se limpian sin aviso)", () => {
  assert.deepEqual(validarCampo("metaMensual", "$9,343"), { valor: 9343, aviso: null });
  assert.deepEqual(validarCampo("conversion", " 3 %"), { valor: 3, aviso: null });
});

test(`más de ${MAX_CARACTERES} caracteres se recorta y avisa`, () => {
  const r = validarCampo("usuariosFree", "1".repeat(50));
  assert.equal(r.valor, 10000);
  assert.match(r.aviso!, /máximo 9 caracteres/);
});

test("ningún valor tecleado saca al simulador de sus límites (sin NaN ni Infinity)", () => {
  const raros = ["", "abc", "-1", "1e309", "Infinity", "NaN", "999999999", "0x10", "<b>"];
  for (const k of CAMPOS) {
    for (const t of raros) {
      const { valor } = validarCampo(k, t);
      assert.ok(Number.isFinite(valor) && valor >= LIMITES[k].min && valor <= LIMITES[k].max, `${k} «${t}» → ${valor}`);
    }
  }
  const r = simular(aSupuestos(Object.fromEntries(CAMPOS.map((k) => [k, "abc"])) as typeof CAMPOS_BASE, 49));
  assert.ok(Object.values(r).every((v) => typeof v !== "number" || Number.isFinite(v)));
});

test("un escenario guardado con valores fuera de rango se carga ya corregido", () => {
  const raw = JSON.stringify([{ nombre: "Mi escenario 1", precio: 49, campos: { ...CAMPOS_BASE, conversion: "500", cupoV1: "0" } }]);
  const [e] = parseGuardados(raw);
  assert.equal(e.campos.conversion, "100");
  assert.equal(e.campos.cupoV1, "1");
});
