import type { Metadata } from "next";
import Link from "next/link";
import { BeneficiosStudent } from "@/components/BeneficiosStudent";
import { BENEFICIO_FREE, PARA_FORANEOS } from "@/lib/planes";
import { Simulador } from "./Simulador";

export const metadata: Metadata = {
  title: "Planes · MenúYA",
  description: "Que el súper te alcance hasta el siguiente depósito. Free $0 o Student $49 MXN al mes.",
};

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden className="text-brand">✓</span>
      <span>{children}</span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <main className="flex flex-col gap-10 py-10">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-brand">
          MenúYA
        </Link>
        <h1 className="text-3xl font-bold leading-tight">Que el súper te alcance hasta el siguiente depósito.</h1>
      </header>

      <section aria-label="Planes" className="flex flex-col gap-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="mt-1 text-3xl font-bold">$0</p>
          <ul className="mt-4 flex flex-col gap-2 text-neutral-700">
            <Check>
              <b className="text-neutral-900">La lista de súper:</b> {BENEFICIO_FREE}
            </Check>
          </ul>
        </article>

        <article className="rounded-2xl border-2 border-brand bg-white p-5">
          <h2 className="text-lg font-semibold">Student</h2>
          <p className="mt-1 text-3xl font-bold">
            $49 <span className="text-base font-medium text-neutral-600">MXN/mes</span>
          </p>
          <div className="mt-4">
            <BeneficiosStudent />
          </div>
          <Link
            href="/apartar"
            className="mt-5 block w-full rounded-2xl bg-brand py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark"
          >
            Apartar mi lugar
          </Link>
          <p className="mt-2 text-center text-xs text-neutral-500">
            Todavía no cobramos. Apartar no pide tarjeta ni datos de pago.
          </p>
        </article>

        <p className="text-center text-lg font-medium">La lista sola es gratis. Lo que pagas es que te alcance.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">¿Para quién es MenúYA?</h2>
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-brand-dark">
              Disponible
            </span>
            <p className="mt-2 font-semibold">Estudiantes foráneos</p>
            <p className="mt-1 text-sm text-neutral-600">{PARA_FORANEOS}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <span className="inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-700">
              Lista de espera · v2
            </span>
            <p className="mt-2 font-semibold">Papás que pagan por su hijo</p>
            <p className="mt-1 text-sm text-neutral-600">
              Paga: el papá o la mamá · $69 MXN/mes (hipótesis, aún no a la venta)
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Simulador: ¿cuándo se sostiene MenúYA?</h2>
        <Simulador />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Límites</h2>
        <ul className="flex flex-col gap-2 rounded-2xl bg-white p-5 text-neutral-700">
          <li>• Solo Walmart.</li>
          <li>• Solo Santa Fe, CDMX.</li>
          <li>• 25 lugares.</li>
          <li>• Cancelas mandando «BAJA» por WhatsApp.</li>
          <li>• Nunca nos conectamos a tu banco.</li>
        </ul>
      </section>

      <footer className="flex flex-col items-center gap-2 text-sm text-neutral-600">
        <Link href="/about" className="underline">
          ¿Por qué $49? Lee el memo
        </Link>
        <Link href="/privacidad" className="underline">
          Aviso de privacidad
        </Link>
      </footer>
    </main>
  );
}
