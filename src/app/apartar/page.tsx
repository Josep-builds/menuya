import type { Metadata } from "next";
import Link from "next/link";
import { precioDesdeParam } from "@/lib/apartar";
import { Apartar } from "./Apartar";

export const metadata: Metadata = {
  title: "Apartar mi lugar · MenúYA",
  description: "Aparta tu lugar en MenúYA Student para diciembre. Todavía no cobramos.",
};

export default async function ApartarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const precio = precioDesdeParam((await searchParams).p);

  return (
    <main className="flex flex-col gap-6 py-10">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-brand">
          MenúYA
        </Link>
        <h1 className="text-3xl font-bold leading-tight">Aparta tu lugar para diciembre</h1>
      </header>

      <section className="rounded-2xl border-2 border-brand bg-white p-5">
        <h2 className="text-lg font-semibold">Student</h2>
        <p className="mt-1 text-3xl font-bold">
          ${precio} <span className="text-base font-medium text-neutral-600">MXN/mes</span>
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-neutral-700">
          <li>✓ Reserva el día del depósito</li>
          <li>✓ Chequeo del día 9</li>
          <li>✓ Recálculo del día 13</li>
        </ul>
        <p className="mt-4 text-sm text-neutral-600">Solo Walmart · Solo Santa Fe, CDMX · 25 lugares.</p>
      </section>

      <Apartar precio={precio} />

      <footer className="flex flex-col items-center gap-2 text-sm text-neutral-600">
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
