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
