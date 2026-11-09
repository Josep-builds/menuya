import Link from "next/link";

// Página provisional: antes era el destino del botón de pago. Hoy no hay checkout real.
export default function PagoPendientePage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">El pago aún no está activo</h1>
      <p className="text-neutral-700">
        Gracias por querer apoyar a MenúYA. En esta versión de prueba el pago todavía no está
        disponible, y no se te cobró nada.
      </p>
      <p className="text-neutral-700">
        MenúYA Student costará $49 MXN al mes cuando abramos. Hoy no cobramos.
      </p>
      <Link href="/pricing" className="text-brand underline">
        Ver planes
      </Link>
    </main>
  );
}
