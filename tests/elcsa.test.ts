import { test } from "node:test";
import assert from "node:assert/strict";
import { ELCSA_QUESTIONS, needsReferral, scoreElcsa } from "../src/lib/elcsa";

test("ELCSA tiene 8 preguntas", () => assert.equal(ELCSA_QUESTIONS.length, 8));

test("umbrales: 0 seguridad, 1–3 leve, 4–6 moderada, 7–8 severa", () => {
  const expected = ["seguridad", "leve", "leve", "leve", "moderada", "moderada", "moderada", "severa", "severa"];
  for (let n = 0; n <= 8; n++) {
    const answers = Array.from({ length: 8 }, (_, i) => i < n);
    assert.equal(scoreElcsa(answers), expected[n], `${n} respuestas «sí»`);
  }
});

test("moderada y severa mandan a comedores; seguridad y leve no", () => {
  assert.equal(needsReferral("moderada"), true);
  assert.equal(needsReferral("severa"), true);
  assert.equal(needsReferral("leve"), false);
  assert.equal(needsReferral("seguridad"), false);
  assert.equal(needsReferral(null), false);
});

test("ELCSA incompleta se rechaza", () => assert.throws(() => scoreElcsa([true, false])));

import { payButtonMode } from "../src/lib/elcsa";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

test("11A.5: moderada/severa → botón de pago oculto; sin resultado → solo invitación, sin precio", () => {
  assert.equal(payButtonMode("severa"), "hidden");
  assert.equal(payButtonMode("moderada"), "hidden");
  assert.equal(payButtonMode(null), "retake");
  assert.equal(payButtonMode("leve"), "show");
  assert.equal(payButtonMode("seguridad"), "show");
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const SRC = walk("src").filter((f) => /\.(ts|tsx)$/.test(f));
const read = (f: string) => readFileSync(f, "utf8");

// Semana 14: el precio viejo ($149 por semestre) desaparece de la app. Solo se busca en src/;
// docs/ guarda la historia y no se revisa aquí.
test("11A.5: ya no queda el precio viejo $149 en src/", () => {
  const withPrice = SRC.filter((f) => /\$149|149 por semestre/.test(read(f)));
  assert.deepEqual(withPrice, []);
});

test("11A.5: PayButton dice «Ver planes», lleva a /pricing y sigue protegido por ELCSA", () => {
  const code = read("src/components/PayButton.tsx");
  assert.match(code, /href="\/pricing"/);
  assert.match(code, /Ver planes/);
  assert.match(code, /payButtonMode\(level\)/);
  assert.match(code, /if \(mode !== "show"\) return null;/);
  assert.doesNotMatch(code, /\$\s?\d/); // el botón no muestra ningún precio
});

test("no hay checkout real: nadie usa NEXT_PUBLIC_PAY_LINK ni pide datos de tarjeta", () => {
  assert.deepEqual(SRC.filter((f) => read(f).includes("NEXT_PUBLIC_PAY_LINK")), []);
  assert.deepEqual(SRC.filter((f) => /tarjeta de cr[eé]dito|card-?number|cc-number|cvv/i.test(read(f))), []);
});

test("11A.5: la pantalla de comedores no muestra precios", () => {
  assert.doesNotMatch(read("src/app/(app)/preguntas/Comedores.tsx"), /\$\s?\d/);
});

test("11A.4: ELCSA no usa red ni almacenamiento; la acción del servidor no recibe argumentos", () => {
  for (const f of ["src/lib/elcsa.ts", "src/app/(app)/preguntas/ElcsaForm.tsx", "src/components/ElcsaProvider.tsx"]) {
    const code = read(f).replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(code, /fetch\(|localStorage|sessionStorage|document\.cookie|indexedDB|sendBeacon|XMLHttpRequest/, f);
  }
  assert.match(read("src/app/(app)/preguntas/actions.ts"), /export async function markElcsaCompleted\(\)/);
  assert.match(read("src/app/(app)/preguntas/ElcsaForm.tsx"), /markElcsaCompleted\(\)/);
});

test("11A.7: cada evento tiene exactamente un punto de escritura por acción", () => {
  const calls = SRC.flatMap((f) => [...read(f).matchAll(/logEvent\(supabase, "([a-z_]+)"(?:, \{ (?:type: "([a-z]+)"|orders: (0)))?/g)].map((m) => `${m[1]}${m[2] ? ":" + m[2] : ""}${m[3] ? ":skip" : ""}`));
  const count = (k: string) => calls.filter((c) => c === k).length;
  for (const k of ["signed_in", "consent_given", "elcsa_completed", "baseline_done", "baseline_done:skip", "log_added:waste", "log_added:impulse", "log_added:nothing", "saving_viewed", "pay_link_clicked"]) {
    assert.equal(count(k), 1, k);
  }
});
