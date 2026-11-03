import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSaving } from "../src/lib/saving";
import { addDays } from "../src/lib/dates";

// Datos de demostración sembrados (PACKET 11A.6): semana 1 = $200, semana 2 = $120.
const start = "2026-11-01";
const waste = [
  { log_date: addDays(start, 0), amount_mxn: 50 },
  { log_date: addDays(start, 3), amount_mxn: 30 },
  { log_date: addDays(start, 8), amount_mxn: 40 },
];
const impulse = [
  { log_date: addDays(start, 5), amount_mxn: 120 },
  { log_date: addDays(start, 12), amount_mxn: 80 },
];
const baseline = [
  { label: "alcohol_tabaco", amount_mxn: 180 },
  { label: "alcohol_tabaco", amount_mxn: 95 },
  { label: "antojo", amount_mxn: 150 },
];

test("11A.6: semana 1 $200 vs semana 2 $120 → $80 y pasa la meta", () => {
  const s = computeSaving({ startDate: start, today: addDays(start, 14), waste, impulse, baseline });
  assert.equal(s.status, "final");
  assert.equal(s.week1Total, 200);
  assert.equal(s.week2Total, 120);
  assert.equal(s.saving, 80);
  assert.equal(s.goalMet, true);
  assert.equal(s.progress, 1);
});

test("alcohol/tabaco se cuenta aparte", () => {
  const s = computeSaving({ startDate: start, today: addDays(start, 14), waste, impulse, baseline });
  assert.deepEqual(s.alcoholTabaco, { count: 2, amount: 275 });
});

test("debajo de la meta se reporta tal cual ($30)", () => {
  const s = computeSaving({
    startDate: start, today: addDays(start, 14), baseline: [], impulse: [],
    waste: [{ log_date: start, amount_mxn: 100 }, { log_date: addDays(start, 7), amount_mxn: 70 }],
  });
  assert.equal(s.saving, 30);
  assert.equal(s.goalMet, false);
  assert.equal(s.progress, 0.5);
});

test("si gastó más en semana 2, el ahorro es negativo y la barra queda en 0", () => {
  const s = computeSaving({
    startDate: start, today: addDays(start, 14), baseline: [], impulse: [],
    waste: [{ log_date: start, amount_mxn: 50 }, { log_date: addDays(start, 7), amount_mxn: 90 }],
  });
  assert.equal(s.saving, -40);
  assert.equal(s.progress, 0);
});

test("semana 2 en curso compara solo los mismos días (no infla el ahorro)", () => {
  // Día 9: se comparan días 1–2 de cada semana. Semana 1 días 1–2 = $50; semana 2 días 1–2 = $40.
  const s = computeSaving({ startDate: start, today: addDays(start, 8), waste, impulse, baseline });
  assert.equal(s.status, "semana2_parcial");
  assert.equal(s.daysCompared, 2);
  assert.equal(s.week1Total, 50);
  assert.equal(s.week2Total, 40);
  assert.equal(s.saving, 10);
});

test("durante la semana 1 no hay ahorro todavía", () => {
  const s = computeSaving({ startDate: start, today: addDays(start, 3), waste, impulse, baseline });
  assert.equal(s.status, "semana1");
  assert.equal(s.saving, 0);
});

test("sin línea base no hay prueba", () => {
  const s = computeSaving({ startDate: null, today: start, waste: [], impulse: [], baseline: [] });
  assert.equal(s.status, "sin_inicio");
});
