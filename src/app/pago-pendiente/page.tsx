import Link from "next/link";

// Destino provisional de NEXT_PUBLIC_PAY_LINK hasta que exista el enlace de Mercado Pago.
export default function PagoPendientePage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">El pago aún no está activo</h1>
      <p className="text-neutral-700">
        Gracias por querer apoyar a MenúYA. En esta versión de prueba el pago todavía no está
        disponible, y no se te cobró nada.
      </p>
      <Link href="/inicio" className="text-brand underline">
        Volver
      </Link>
    </main>
  );
}
