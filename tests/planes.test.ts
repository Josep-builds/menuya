import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  AVISO_SIN_COBRO,
  BENEFICIOS_STUDENT,
  BENEFICIO_FREE,
  CANCELAR_STUDENT,
  PAPAS_ESTADO,
  PARA_FORANEOS,
} from "../src/lib/planes";

const read = (f: string) => readFileSync(f, "utf8");
const linea = (b: { cuando: string; que: string }) => `${b.cuando}: ${b.que}`;

test("persona test: cada beneficio Student se explica en lenguaje simple", () => {
  assert.deepEqual(BENEFICIOS_STUDENT.map(linea), [
    "Día que te llega el dinero: nos dices cuánto te llegó y te mandamos tu lista del súper y cuánto apartar para los últimos días. Nunca tocamos tu cuenta.",
    "Día 9: te preguntamos qué te queda en el refri (10 segundos).",
    "Día 13: si no te va a alcanzar, te ajustamos el plan y te mandamos opciones baratas cerca.",
  ]);
  assert.equal(BENEFICIO_FREE, "Te damos la lista; tú la sigues solo.");
  assert.ok(PARA_FORANEOS.length > 20);
});

test("/pricing y /apartar usan los mismos beneficios explicados (no los nombres viejos)", () => {
  for (const f of ["src/app/pricing/page.tsx", "src/app/apartar/page.tsx"]) {
    const code = read(f);
    assert.match(code, /<BeneficiosStudent \/>/, f);
    assert.doesNotMatch(code, /Reserva el día del depósito|Chequeo del día 9|Recálculo del día 13/, f);
  }
  const pricing = read("src/app/pricing/page.tsx");
  assert.match(pricing, /\{BENEFICIO_FREE\}/);
  assert.match(pricing, /\{PARA_FORANEOS\}/);
});

test("el beneficio del día del depósito aclara que nunca tocamos la cuenta", () => {
  assert.match(BENEFICIOS_STUDENT[0].que, /Nunca tocamos tu cuenta\./);
});

test("el simulador está en /pricing dentro de un <details> cerrado, después de los límites", () => {
  const code = read("src/app/pricing/page.tsx");
  const det = code.indexOf("<details");
  assert.ok(det > code.indexOf("Límites"), "va después de Límites");
  assert.doesNotMatch(code.slice(det, code.indexOf(">", det)), /\bopen\b/, "cerrado por defecto");
  assert.ok(code.indexOf("<Simulador />") > det && code.indexOf("<Simulador />") < code.indexOf("</details>"));
  assert.match(code, /Para el curso: ¿cuándo se sostiene MenúYA\?/);
  assert.equal(code.match(/<Simulador \/>/g)?.length, 1);
});

// --- Pendientes del persona test (arreglados) ---

test("tarjeta de papás: «Próximamente · únete a la lista de espera», ya no «hipótesis, aún no a la venta»", () => {
  const code = read("src/app/pricing/page.tsx");
  assert.equal(PAPAS_ESTADO, "Próximamente · únete a la lista de espera");
  assert.match(code, /\{PAPAS_ESTADO\}/);
  assert.doesNotMatch(code, /hipótesis|aún no a la venta/);
  assert.match(code, /Paga: el papá o la mamá · \$69 MXN\/mes/);
});

test("Student en /pricing dice cómo cancelar y que antes de cobrar se pregunta, justo abajo del precio", () => {
  const code = read("src/app/pricing/page.tsx");
  assert.equal(CANCELAR_STUDENT, "Cancelas cuando quieras mandando BAJA por WhatsApp. Antes de cobrar te preguntamos.");
  const precio = code.indexOf("MXN/mes</span>");
  const cancelar = code.indexOf("{CANCELAR_STUDENT}");
  assert.ok(precio > 0 && cancelar > precio && cancelar < code.indexOf("<BeneficiosStudent />"));
});

test("el aviso de no cobro se ve más: texto sm (no xs) y con fondo", () => {
  const code = read("src/app/pricing/page.tsx");
  assert.equal(AVISO_SIN_COBRO, "Todavía no cobramos. Apartar no pide tarjeta ni datos de pago.");
  const i = code.indexOf("{AVISO_SIN_COBRO}");
  const p = code.lastIndexOf("<p ", i);
  const clases = code.slice(p, i);
  assert.match(clases, /text-sm/);
  assert.doesNotMatch(clases, /text-xs/);
  assert.match(clases, /bg-green-50/);
});
