import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WHATSAPP_TEXTO_VISIBLE, enlaceWhatsApp, mensajeWhatsApp, precioDesdeParam } from "../src/lib/apartar";

test("/apartar: $49 por defecto, $69 solo con ?p=69", () => {
  assert.equal(precioDesdeParam(undefined), 49);
  assert.equal(precioDesdeParam("69"), 69);
  assert.equal(precioDesdeParam("49"), 49);
  assert.equal(precioDesdeParam("1"), 49);
  assert.equal(precioDesdeParam(["69", "49"]), 49);
  assert.equal(precioDesdeParam("69abc"), 49);
});

test("mensaje de WhatsApp exacto para $49 y $69", () => {
  assert.equal(mensajeWhatsApp(49), "Hola, quiero apartar mi lugar en MenúYA (plan Student $49/mes) para diciembre.");
  assert.equal(mensajeWhatsApp(69), "Hola, quiero apartar mi lugar en MenúYA (plan Student $69/mes) para diciembre.");
});

test("enlace wa.me al número correcto con el texto codificado", () => {
  const u = new URL(enlaceWhatsApp(69));
  assert.equal(u.origin + u.pathname, "https://wa.me/525545022101");
  assert.equal(u.searchParams.get("text"), mensajeWhatsApp(69));
  assert.equal(WHATSAPP_TEXTO_VISIBLE.replace(/\D/g, ""), "525545022101");
});

test("/apartar no pide tarjeta ni datos bancarios y dice que no se cobró", () => {
  const code = ["src/app/apartar/page.tsx", "src/app/apartar/Apartar.tsx"].map((f) => readFileSync(f, "utf8")).join("\n");
  assert.doesNotMatch(code, /<input|<form|cc-number|cvv|clabe|tarjeta de cr[eé]dito/i);
  assert.match(code, /Todavía no cobramos\./);
  assert.match(code, /No se te cargó nada\. Estamos midiendo interés\./);
  assert.match(code, /Apartar mi lugar para diciembre/);
});

test("/pricing lleva a /apartar y /apartar es pública", () => {
  assert.match(readFileSync("src/app/pricing/page.tsx", "utf8"), /href="\/apartar"/);
  assert.match(readFileSync("src/proxy.ts", "utf8"), /"\/apartar"/);
});
