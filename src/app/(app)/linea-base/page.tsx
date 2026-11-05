import { redirect } from "next/navigation";
import { DemoLabel } from "@/components/DemoLabel";
import { hasBaseline, requireElcsa } from "@/lib/onboarding";
import { BaselineForm } from "./BaselineForm";

export default async function LineaBasePage() {
  const { supabase } = await requireElcsa();
  if (await hasBaseline(supabase)) redirect("/inicio");

  return (
    <main className="flex flex-col gap-5 py-8">
      <p className="rounded-xl bg-amber-100 p-3 text-amber-900">
        Esto nos deja comparar después cuánto ahorraste. Pon solo los que recuerdes.
      </p>
      <h1 className="text-2xl font-bold">Tus últimos pedidos</h1>
      <p className="text-neutral-700">
        Si quieres, abre tu app de comida a domicilio (Rappi, Uber Eats, DiDi Food…) y revisa tu
        historial. Para cada pedido, elige por qué lo hiciste y cuánto pagaste.
      </p>
      <BaselineForm />
      <DemoLabel className="pb-6" />
    </main>
  );
}
