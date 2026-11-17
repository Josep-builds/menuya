import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  EJEMPLO_FRESCOS,
  enlaceWhatsAppQuincena,
  grupoDesdeParam,
  maximoFrescos,
  mensajeWhatsAppQuincena,
} from "../src/lib/quincena";

test("/quincena: solo ?g=est y ?g=trab cuentan; lo demás es web", () => {
  assert.equal(grupoDesdeParam("est"), "est");
  assert.equal(grupoDesdeParam("trab"), "trab");
  assert.equal(grupoDesdeParam(undefined), "web");
  assert.equal(grupoDesdeParam("EST"), "web");
  assert.equal(grupoDesdeParam(["est"]), "web");
  assert.equal(grupoDesdeParam("est<script>"), "web");
});

test("el WhatsApp lleva la etiqueta del grupo y va al número de MenúYA", () => {
  assert.match(mensajeWhatsAppQuincena("est"), /\[Q-EST\]/);
  assert.match(mensajeWhatsAppQuincena("trab"), /\[Q-TRAB\]/);
  const u = new URL(enlaceWhatsAppQuincena("web"));
  assert.equal(u.origin + u.pathname, "https://wa.me/525545022101");
  assert.equal(u.searchParams.get("text"), mensajeWhatsAppQuincena("web"));
});

test("el ejemplo planea con el máximo de cada rango", () => {
  assert.equal(maximoFrescos(EJEMPLO_FRESCOS), 389);
  for (const i of EJEMPLO_FRESCOS) assert.ok(i.min < i.max);
});

test("/quincena no tiene formulario, no pide datos y no promete ahorro", () => {
  const code = ["src/app/quincena/page.tsx", "src/lib/quincena.ts"].map((f) => readFileSync(f, "utf8")).join("\n");
  assert.doesNotMatch(code, /<input|<form|tarjeta de cr[eé]dito|±15%|vas a ahorrar \$/i);
  assert.match(code, /Todavía no cobramos/);
  assert.match(code, /Lo que no prometemos:.*\n?.*\{NO_PROMETEMOS\}[\s\S]*cuánto vas a ahorrar ni precios exactos/);
});

test("/quincena es pública", () => {
  assert.match(readFileSync("src/proxy.ts", "utf8"), /"\/quincena"/);
});
