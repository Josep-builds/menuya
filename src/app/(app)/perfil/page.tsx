import { requireConsent } from "@/lib/session";
import { DemoLabel } from "@/components/DemoLabel";
import { deleteMyData, signOut } from "./actions";

export default async function PerfilPage() {
  const { user, profile } = await requireConsent();
  return (
    <main className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold">Perfil</h1>
      <div className="rounded-2xl bg-white p-5">
        <p className="text-sm text-neutral-500">Cuenta</p>
        <p className="font-medium">{user.email}</p>
        <p className="mt-3 text-sm text-neutral-500">Ciudad</p>
        <p className="font-medium">{profile.city}</p>
      </div>
      <form action={signOut}>
        <button className="w-full rounded-2xl border border-neutral-300 py-3 font-semibold">Salir</button>
      </form>
      <form action={deleteMyData} className="flex flex-col gap-2">
        <button className="w-full rounded-2xl bg-red-700 py-3 font-semibold text-white">
          Borrar mis datos
        </button>
        <p className="text-center text-xs text-neutral-500">
          Elimina todo lo que MenúYA guardó de ti y cierra tu sesión.
        </p>
      </form>
      <DemoLabel />
    </main>
  );
}
