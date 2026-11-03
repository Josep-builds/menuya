import { redirect } from "next/navigation";
import { requireBaseline } from "@/lib/onboarding";
import { LogForm } from "./LogForm";

export default async function RegistrarPage({ searchParams }: PageProps<"/registrar">) {
  await requireBaseline();
  const { tipo } = await searchParams;
  if (tipo !== "tire" && tipo !== "pedi") redirect("/inicio");

  return (
    <main className="flex flex-col gap-5 py-8">
      <h1 className="text-2xl font-bold">{tipo === "tire" ? "🗑 Tiré comida" : "🛵 Pedí algo / compra no planeada"}</h1>
      <LogForm tipo={tipo} />
    </main>
  );
}
