import { DemoLabel } from "@/components/DemoLabel";
import { ElcsaForm } from "./ElcsaForm";

export default function PreguntasPage() {
  return (
    <main className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-bold">8 preguntas rápidas</h1>
      <p className="rounded-2xl bg-white p-4 text-neutral-700">
        Estas preguntas existen para no venderte algo si no te alcanza. Tus respuestas no salen de
        tu teléfono.
      </p>
      <ElcsaForm />
      <DemoLabel />
    </main>
  );
}
