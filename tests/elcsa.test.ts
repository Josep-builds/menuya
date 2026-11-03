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
