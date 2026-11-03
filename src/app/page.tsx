import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-8 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">MenúYA</p>
      <h1 className="text-3xl font-bold leading-tight">
        MenúYA — ¿Cuánto se te va en comida que tiras?
      </h1>
      <p className="text-lg text-neutral-700">
        Registra en un toque lo que tiras y lo que compras sin planear. En dos semanas ves
        cuántos pesos ahorraste, sin adivinar.
      </p>
      <Link
        href="/entrar"
        className="block w-full rounded-2xl bg-brand py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark"
      >
        Empezar
      </Link>
      <p className="text-center text-sm text-neutral-500">
        Versión de prueba · datos de demostración
      </p>
      <Link href="/privacidad" className="text-center text-sm text-neutral-600 underline">
        Aviso de privacidad
      </Link>
    </main>
  );
}
