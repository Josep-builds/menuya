import { redirect } from "next/navigation";
import { DemoLabel } from "@/components/DemoLabel";
import { hasBaseline, requireElcsa } from "@/lib/onboarding";
import { BaselineForm } from "./BaselineForm";

export default async function LineaBasePage() {
  const { supabase } = await requireElcsa();
  if (await hasBaseline(supabase)) redirect("/inicio");

  return (
    <main className="flex flex-col gap-5 py-8">
      <h1 className="text-2xl font-bold">Tus últimos 10 pedidos</h1>
      <p className="text-neutral-700">
        Abre tu app de comida a domicilio (Rappi, Uber Eats, DiDi Food…) y revisa tu historial. Para
        cada uno de tus últimos 10 pedidos, elige por qué lo hiciste y cuánto pagaste.
      </p>
      <p className="text-sm text-neutral-500">Si tienes menos de 10, llena los que tengas.</p>
      <BaselineForm />
      <DemoLabel className="pb-6" />
    </main>
  );
}
