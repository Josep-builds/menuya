import type { Metadata } from "next";
import Link from "next/link";
import {
  EJEMPLO_ENTRADA,
  EJEMPLO_FECHA,
  EJEMPLO_FRESCOS,
  CHAT_1A1,
  DESPUES,
  DELIVERY,
  NO_PROMETEMOS,
  PARA_QUIEN,
  PRECIO_CLARO,
  TITULO,
  enlaceWhatsAppQuincena,
  grupoDesdeParam,
  maximoFrescos,
} from "@/lib/quincena";

export const metadata: Metadata = {
  title: "MenúYA · Que el súper te alcance",
  description: "Te mandamos por WhatsApp una lista de Walmart que alcance hasta que te vuelva a llegar dinero. Empieza en enero. Apartar es gratis.",
};

const PASOS = [
  { n: "1", t: "Te llega el dinero", d: "Nos dices cuánto te llegó y cuándo te vuelve a llegar. Nunca tocamos tu cuenta." },
  { n: "2", t: "Te mandamos tu lista", d: "Por WhatsApp: qué comprar en Walmart, con precios que revisamos a mano en walmart.com.mx cada semana." },
  { n: "3", t: "A media quincena revisamos", d: "Te preguntamos qué te queda. Si no te va a alcanzar, ajustamos antes de que se acabe." },
];

export default async function QuincenaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const grupo = grupoDesdeParam((await searchParams).g);
  const max = maximoFrescos(EJEMPLO_FRESCOS);

  return (
    <main className="flex flex-col gap-8 py-10">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-brand">
          MenúYA
        </Link>
        <h1 className="text-3xl font-bold leading-tight">{TITULO[grupo]}</h1>
        <p className="text-lg text-neutral-700">
          Te ayudamos a planear el súper para que el dinero dure hasta el siguiente depósito, sin pedir delivery los
          últimos días.
        </p>
        <p className="text-neutral-700">
          {DELIVERY} <span className="text-xs text-neutral-500">(promedio para menores de 25, Fintonic)</span>
        </p>
        <p className="rounded-xl bg-green-50 px-3 py-2 font-medium text-brand-dark">{PARA_QUIEN}</p>
      </header>

      <section aria-label="Cómo funciona" className="flex flex-col gap-3">
        {PASOS.map((p) => (
          <div key={p.n} className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white">
              {p.n}
            </span>
            <div>
              <p className="font-semibold">{p.t}</p>
              <p className="text-neutral-700">{p.d}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-label="Ejemplo" className="rounded-2xl border-2 border-brand bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Ejemplo</p>
        <p className="mt-2 rounded-xl bg-neutral-100 px-3 py-2 italic">“{EJEMPLO_ENTRADA}”</p>
        <p className="mt-4 font-semibold">Lo fresco de tu lista (1 persona, 15 días):</p>
        <ul className="mt-2 flex flex-col gap-1 text-neutral-700">
          {EJEMPLO_FRESCOS.map((i) => (
            <li key={i.nombre} className="flex justify-between gap-3">
              <span>
                {i.nombre} · {i.cantidad}
              </span>
              <span className="tabular-nums">
                ${i.min}–${i.max}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-neutral-200 pt-3 font-semibold">
          Calculamos con el precio más caro, para que no te quedes corto: hasta{" "}
          <span className="tabular-nums">${max}</span> en frescos.
        </p>
        <p className="mt-2 text-neutral-700">
          Esto es solo lo fresco. Con tu monto completo armamos la lista entera (frijol, arroz y básicos) y te decimos cuánto
          apartar para los últimos días.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Precios vistos en walmart.com.mx el {EJEMPLO_FECHA}. Damos rango porque el precio cambia de semana a semana y
          todavía no lo medimos en tienda.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <a
          href={enlaceWhatsAppQuincena(grupo)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-2xl bg-brand py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark"
        >
          Apartar mi lugar para enero (gratis)
        </a>
        <p className="text-center text-sm text-neutral-700">{PRECIO_CLARO}</p>
        <p className="text-center text-sm text-neutral-700">{DESPUES}</p>
        <p className="text-center text-sm text-neutral-600">
          {CHAT_1A1} Se abre WhatsApp con el mensaje ya escrito; no te pedimos tarjeta.
        </p>
      </section>

      <section className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-700">
        <p>
          <b className="text-neutral-900">Por ahora:</b> solo Walmart · solo Santa Fe, CDMX · 10 lugares en enero, porque cada
          lista se revisa a mano.
        </p>
        <p className="mt-2">
          <b className="text-neutral-900">Lo que no prometemos:</b> {NO_PROMETEMOS}
        </p>
      </section>

      <footer className="flex flex-col items-center gap-2 text-sm text-neutral-600">
        <p>Hecho por Josep, estudiante en CDMX.</p>
        <Link href="/pricing" className="underline">
          Ver planes
        </Link>
        <Link href="/privacidad" className="underline">
          Aviso de privacidad
        </Link>
      </footer>
    </main>
  );
}
