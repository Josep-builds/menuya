import { requireConsent } from "@/lib/session";

// Ninguna pantalla de este grupo es accesible sin sesión y consentimiento.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireConsent();
  return <>{children}</>;
}
