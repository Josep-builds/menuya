import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import Link from "next/link";
import { DemoLabel } from "@/components/DemoLabel";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { ConsentForm } from "./ConsentForm";

export default async function AvisoPage() {
  const { profile } = await requireUser();
  if (profile?.consent_at) redirect("/inicio");

  return (
    <main className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold">Aviso de privacidad</h1>
      <p className="text-neutral-700">Corto y en palabras simples. Léelo antes de seguir.</p>

      <PrivacyNotice />
      <p className="text-sm text-neutral-600">
        También puedes leerlo cuando quieras en{" "}
        <Link href="/privacidad" className="text-brand underline">
          menuyamx.xyz/privacidad
        </Link>
        .
      </p>

      <ConsentForm />
      <DemoLabel className="pb-6" />
    </main>
  );
}
