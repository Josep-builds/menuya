import type { Metadata } from "next";
import Link from "next/link";
import { DemoLabel } from "@/components/DemoLabel";
import { PRIVACY_UPDATED, PrivacyNotice } from "@/components/PrivacyNotice";

export const metadata: Metadata = {
  title: "Aviso de privacidad · MenúYA",
  description: "Qué datos guarda MenúYA, para qué y cómo borrarlos.",
};

// Página pública: no pide sesión.
export default function PrivacidadPage() {
  return (
    <main className="flex flex-col gap-6 py-8">
      <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-brand">
        MenúYA
      </Link>
      <h1 className="text-2xl font-bold">Aviso de privacidad</h1>
      <p className="text-sm text-neutral-500">Última actualización: {PRIVACY_UPDATED}</p>
      <PrivacyNotice />
      <Link href="/" className="text-center text-brand underline">
        Volver al inicio
      </Link>
      <DemoLabel className="pb-6" />
    </main>
  );
}
