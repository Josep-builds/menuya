import Link from "next/link";
import { DemoLabel } from "@/components/DemoLabel";

export default function InicioPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold">¡Listo! Ya puedes empezar</h1>
      <p className="text-neutral-700">Aquí verás tu registro diario.</p>
      <Link href="/perfil" className="text-brand underline">
        Perfil
      </Link>
      <DemoLabel />
    </main>
  );
}
