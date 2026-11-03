import { requireConsent } from "@/lib/session";
import { NavBar } from "@/components/NavBar";

// Ninguna pantalla de este grupo es accesible sin sesión y consentimiento.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireConsent();
  return (
    <>
      {children}
      <NavBar />
    </>
  );
}
