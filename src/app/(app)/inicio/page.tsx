import Link from "next/link";
import { redirect } from "next/navigation";
import { DemoLabel } from "@/components/DemoLabel";
import { requireConsent } from "@/lib/session";
import { hasEvent } from "@/lib/events";

export default async function InicioPage() {
  const { supabase } = await requireConsent();
  if (!(await hasEvent(supabase, "elcsa_completed"))) redirect("/preguntas");

  return (
    <main className="flex flex-1 flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold">Tu semana</h1>
      <p className="text-neutral-700">Aquí verás tu registro diario.</p>
      <Link href="/perfil" className="text-brand underline">
        Perfil
      </Link>
      <DemoLabel />
    </main>
  );
}
