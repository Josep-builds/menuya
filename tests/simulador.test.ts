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
import {
  LIMITES,
  LIMITE_PRECIO,
  MAX_CARACTERES,
  PRECIO_MINIMO_SANO,
  avisosResultado,
  esPrecioFijo,
  validarCampo,
  validarPrecio,
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
    { nombre: "Mi escenario 1", campos: CAMPOS_BASE, precio: "caro" }, // precio que no es número
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

// --- Avisos del resultado (PACKET §11) ---
const base = aSupuestos(CAMPOS_BASE, 49);
const ids = (s: typeof base) => avisosResultado(s).map((a) => a.id);

test("Base a $49: solo avisa que la meta de $9,343 necesita v2", () => {
  assert.deepEqual(ids(base), ["meta-necesita-v2"]);
});

test("precio menor a $15 avisa que la comisión fija se come ~un tercio", () => {
  assert.ok(ids({ ...base, precio: 10 }).includes("precio-bajo"));
  assert.match(avisosResultado({ ...base, precio: 10 })[0].texto, /menor a \$15, la comisión fija se come ~un tercio \(aquí, 39% de cada cobro\)/);
  assert.ok(!ids({ ...base, precio: PRECIO_MINIMO_SANO }).includes("precio-bajo"));
  assert.ok(!ids({ ...base, precio: 49 }).includes("precio-bajo"));
});

test("avisa si el equilibrio de v1 necesita más usuarios que el cupo de 25", () => {
  // 20 h × $120 = $2,400 → ⌈2400 / 43.47⌉ = 56 usuarios > 25
  const caro = { ...base, horasV1: 20 };
  assert.ok(ids(caro).includes("equilibrio-v1-sobre-cupo"));
  assert.match(avisosResultado(caro).find((a) => a.id === "equilibrio-v1-sobre-cupo")!.texto, /se necesitan 56 usuarios que pagan, más que el cupo de 25/);
  assert.ok(!ids(base).includes("equilibrio-v1-sobre-cupo")); // 12 ≤ 25
  // 25 exactos no avisa: 25 × 43.47 = $1,086.84 de costo
  assert.ok(!ids({ ...base, horasV1: 1, tarifaHoraV1: 1086 }).includes("equilibrio-v1-sobre-cupo"));
});

test("si la comisión se come todo el precio, v1 nunca llega al equilibrio y lo dice", () => {
  const s = { ...base, precio: 3 };
  assert.match(avisosResultado(s).find((a) => a.id === "equilibrio-v1-sobre-cupo")!.texto, /nunca llega al equilibrio/);
});

test("más de 25 usuarios que pagan marca el tope de v1", () => {
  assert.ok(!ids(base).includes("pagando-sobre-cupo")); // 24
  assert.ok(ids({ ...base, usuariosFree: 1100 }).includes("pagando-sobre-cupo")); // 26
});

test("cada aviso aparece una sola vez", () => {
  const peor = { ...base, precio: 10, horasV1: 200, usuariosFree: 10000 };
  const lista = ids(peor);
  assert.equal(new Set(lista).size, lista.length);
  assert.deepEqual([...lista].sort(), ["equilibrio-v1-sobre-cupo", "meta-necesita-v2", "pagando-sobre-cupo", "precio-bajo"]);
});

// --- "Otro precio" ($1 a $999) ---

test("Otro precio va de $1 a $999: fuera de rango se corrige y avisa", () => {
  assert.equal(LIMITE_PRECIO.min, 1);
  assert.equal(LIMITE_PRECIO.max, 999);
  assert.deepEqual(validarPrecio("29"), { valor: 29, aviso: null });
  assert.deepEqual(validarPrecio("$12.50"), { valor: 12.5, aviso: null });
  assert.deepEqual(validarPrecio("0"), { valor: 1, aviso: "Otro precio: el mínimo es $1. Lo ajustamos." });
  assert.deepEqual(validarPrecio("-20"), { valor: 1, aviso: "Otro precio: el mínimo es $1. Lo ajustamos." });
  assert.deepEqual(validarPrecio("1000"), { valor: 999, aviso: "Otro precio: el máximo es $999. Lo ajustamos." });
  assert.deepEqual(validarPrecio(""), { valor: 1, aviso: "Otro precio: está vacío. Usamos $1." });
  assert.deepEqual(validarPrecio("gratis"), { valor: 1, aviso: "Otro precio: no es un número. Usamos $1." });
  assert.equal(validarPrecio("12.345").valor, 12.35);
});

test("con Otro precio = $10 se ve el aviso de menor a $15; con $15 ya no", () => {
  const conPrecio = (t: string) => aSupuestos(CAMPOS_BASE, validarPrecio(t).valor);
  assert.ok(avisosResultado(conPrecio("10")).some((a) => a.id === "precio-bajo"));
  assert.ok(avisosResultado(conPrecio("14.99")).some((a) => a.id === "precio-bajo"));
  assert.ok(!avisosResultado(conPrecio("15")).some((a) => a.id === "precio-bajo"));
  assert.ok(!avisosResultado(conPrecio("29")).some((a) => a.id === "precio-bajo"));
});

test("$49 y $69 son los precios con botón; cualquier otro va en Otro precio", () => {
  assert.ok(esPrecioFijo(49) && esPrecioFijo(69));
  assert.ok(!esPrecioFijo(29) && !esPrecioFijo(10));
});

test("escenarios guardados con Otro precio: se guardan y el precio se vuelve a validar al cargar", () => {
  const lista = [{ ...esc("Mi escenario 1"), precio: 29 }];
  assert.deepEqual(parseGuardados(serializarGuardados(lista)), lista);
  const raw = (precio: unknown) => JSON.stringify([{ nombre: "Mi escenario 1", precio, campos: CAMPOS_BASE }]);
  assert.equal(parseGuardados(raw(5000))[0].precio, 999);
  assert.equal(parseGuardados(raw(0))[0].precio, 1);
  assert.deepEqual(parseGuardados(raw("49")), []); // texto en vez de número: se descarta
  assert.deepEqual(parseGuardados(raw(null)), []);
  assert.equal(parseGuardados(raw(69))[0].precio, 69); // los escenarios viejos a $49/$69 siguen cargando
});
