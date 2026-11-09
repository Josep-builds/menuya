import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Por qué $49 · MenúYA",
  description: "Memo 10:1: lo que cuesta quedarse sin comida antes del depósito vs. $49 al mes.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col gap-8 py-10">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-brand">
          MenúYA
        </Link>
        <p className="text-sm text-neutral-500">Memo · 9 de noviembre de 2026</p>
        <h1 className="text-3xl font-bold leading-tight">Por qué $49: la cuenta 10:1</h1>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Hoy</h2>
        <p className="text-neutral-700">
          Entre el día 12 y el 15 del mes se acaba el dinero y se pide delivery solo. Un pedido real costó{" "}
          <b>$610.11</b>. La comida planeada para esa misma comida cuesta alrededor de <b>$60</b> (entre $51 y
          $69). Cada pedido así que se evita son unos <b>$550 ahorrados</b> (entre $541 y $559).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">El costo real</h2>
        <ul className="flex flex-col gap-1 text-neutral-700">
          <li>
            • <b>Dinero:</b> el pedido de delivery.
          </li>
          <li>
            • <b>Tiempo:</b> pedir y esperar, en lugar de cocinar algo que ya estaba planeado.
          </li>
          <li>
            • <b>Riesgo:</b> quedarse sin comida antes del siguiente depósito.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border-2 border-brand bg-white p-5">
        <h2 className="text-lg font-semibold">El precio</h2>
        <p className="mt-2 text-neutral-700">
          MenúYA Student cuesta <b>$49 MXN al mes</b>. Con evitar <b>un solo pedido</b> al mes, el ahorro es de
          unos $550 contra $49:
        </p>
        <p className="mt-3 text-center text-4xl font-bold text-brand">≈ 11 : 1</p>
        <p className="mt-2 text-center text-xs text-neutral-500">$541–$559 ahorrados ÷ $49 = 11.0 a 11.4</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Honestidad: lo que todavía no sabemos</h2>
        <ul className="flex flex-col gap-2 text-neutral-700">
          <li>
            • Entrevistamos a <b>2 amigos</b>, a <b>0 desconocidos</b>, y hay <b>0 pagos</b>. Nadie ha pagado todavía.
          </li>
          <li>
            • Los precios que da la IA fallan. En mi prueba de 10 productos el error fue de <b>24.9%</b> (9 de 10
            quedaron más caros de lo real). En frescos, un chatbot quedó hasta <b>31% más barato</b> de lo real.
          </li>
          <li>
            • Por eso <b>los precios se revisan a mano</b>, y siempre los mostramos como rango, nunca
            como un precio único.
          </li>
        </ul>
      </section>

      <footer className="flex flex-col items-center gap-2 text-sm text-neutral-600">
        <Link href="/pricing" className="font-semibold text-brand underline">
          Ver planes
        </Link>
        <Link href="/privacidad" className="underline">
          Aviso de privacidad
        </Link>
      </footer>
    </main>
  );
}
