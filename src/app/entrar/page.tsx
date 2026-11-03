import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DemoLabel } from "@/components/DemoLabel";
import { GoogleButton } from "./GoogleButton";

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/inicio");

  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">MenúYA</p>
      <h1 className="text-2xl font-bold">Entra para guardar tu registro</h1>
      <p className="text-neutral-700">
        Usamos tu cuenta de Google solo para que tus registros sean tuyos. Antes de guardar
        cualquier dato te mostramos el aviso de privacidad.
      </p>
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          No se pudo completar el acceso. Intenta otra vez.
        </p>
      )}
      <GoogleButton />
      <DemoLabel />
    </main>
  );
}
