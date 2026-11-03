import { test } from "node:test";
import assert from "node:assert/strict";
import { amountSchema, baselineSchema, impulseSchema, wasteSchema } from "../src/lib/validation";

const firstMessage = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

test("11A.3: montos inválidos se rechazan con mensaje en español", () => {
  for (const [v, msg] of [
    ["-5", "El monto no puede ser negativo."],
    ["abc", "Escribe solo números enteros, sin decimales ni letras."],
    ["999999", "El máximo por registro es $2,000."],
    ["12.5", "Escribe solo números enteros, sin decimales ni letras."],
    ["", "Escribe el monto en pesos."],
  ] as const) {
    const r = amountSchema.safeParse(v);
    assert.equal(r.success, false, v);
    assert.equal(firstMessage(r), msg, v);
  }
});

test("montos válidos (incl. $ y comas)", () => {
  for (const [v, n] of [["0", 0], ["2000", 2000], ["$150", 150], ["1,500", 1500], [" 28 ", 28]] as const) {
    const r = amountSchema.safeParse(v);
    assert.equal(r.success && r.data, n, v);
  }
});

test("11A.3: texto de 500 caracteres se rechaza", () => {
  const r = wasteSchema.safeParse({ item: "x".repeat(500), amount_mxn: "20", when: "hoy" });
  assert.equal(r.success, false);
  assert.equal(firstMessage(r), "Máximo 60 caracteres.");
});

test("texto vacío, tipo y fecha inválidos se rechazan", () => {
  assert.equal(wasteSchema.safeParse({ item: "  ", amount_mxn: "20", when: "hoy" }).success, false);
  assert.equal(wasteSchema.safeParse({ item: "pan", amount_mxn: "20", when: "mañana" }).success, false);
  assert.equal(impulseSchema.safeParse({ kind: "rappi", amount_mxn: "20", when: "hoy" }).success, false);
});

test("línea base: 1–10 pedidos con etiqueta válida", () => {
  assert.equal(baselineSchema.safeParse([]).success, false);
  assert.equal(baselineSchema.safeParse(Array(11).fill({ label: "antojo", amount_mxn: "100" })).success, false);
  assert.equal(baselineSchema.safeParse([{ label: "hambre", amount_mxn: "100" }]).success, false);
  assert.equal(baselineSchema.safeParse(Array(10).fill({ label: "alcohol_tabaco", amount_mxn: "100" })).success, true);
});
