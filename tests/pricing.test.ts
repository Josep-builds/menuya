import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SUPUESTOS_INICIALES as S,
  comisionPorCobro,
  costoV1,
  costoV2,
  freeNecesarios,
  netoPorUsuario,
  simular,
  usuariosPagando,
  usuariosParaCubrir,
} from "../src/lib/pricing";

test("comprobación a $49: comisión ≈ $5.53 y neto ≈ $43.47", () => {
  assert.equal(comisionPorCobro(49, S.comision).toFixed(2), "5.53");
  assert.equal(netoPorUsuario(49, S.comision).toFixed(2), "43.47");
});

test("costos fijos: v1 = 4 h × $120 = $480; v2 = $480 + $699 = $1,179", () => {
  assert.equal(costoV1(S), 480);
  assert.equal(costoV2(S), 1179);
});

test("comprobación a $49: equilibrio v1 = 12, v2 = 28, meta $9,343 = 215 (hacia arriba)", () => {
  const r = simular({ ...S, precio: 49 });
  assert.equal(r.equilibrioV1.pagando, 12); // 480 / 43.47 = 11.04
  assert.equal(r.equilibrioV2.pagando, 28); // 1179 / 43.47 = 27.12
  assert.equal(r.meta.pagando, 215); // 9343 / 43.47 = 214.91
});

test("con 27 usuarios a $49 todavía no se cubre v2; con 28 sí", () => {
  const neto = netoPorUsuario(49, S.comision);
  assert.ok(27 * neto < 1179);
  assert.ok(28 * neto >= 1179);
});

test("siempre redondea hacia arriba, pero no sube de más en divisiones exactas", () => {
  assert.equal(usuariosParaCubrir(100, 50), 2);
  assert.equal(usuariosParaCubrir(100.01, 50), 3);
  assert.equal(usuariosParaCubrir(0.3, 0.1), 3); // 0.3 / 0.1 = 2.9999999999999996
  assert.equal(usuariosParaCubrir(480, 0), null);
  assert.equal(freeNecesarios(12, 0.03, 0.2), 500);
  assert.equal(freeNecesarios(28, 0.03, 0.2), 1167);
  assert.equal(freeNecesarios(5, 0, 0.2), null);
});

test("usuarios que pagan = free × conversión × (1 − haircut), hacia abajo", () => {
  assert.equal(usuariosPagando(1000, 0.03, 0.2), 24);
  assert.equal(usuariosPagando(10000, 0.03, 0.2), 240);
  assert.equal(usuariosPagando(99, 0.03, 0.2), 2); // 2.376 → 2
});

test("a $69 el neto es mayor y se necesitan menos usuarios", () => {
  const r49 = simular({ ...S, precio: 49 });
  const r69 = simular({ ...S, precio: 69 });
  assert.ok(r69.neto > r49.neto);
  assert.ok(r69.meta.pagando! < r49.meta.pagando!);
});

test("el ingreso no crece si el usuario gasta más en el súper", () => {
  // simular() no recibe el gasto del usuario: aunque se lo pasemos, el resultado es igual.
  const poco = simular({ ...S, gastoSuper: 500 } as typeof S);
  const mucho = simular({ ...S, gastoSuper: 5000 } as typeof S);
  assert.deepEqual(poco, mucho);
});
