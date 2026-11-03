import { DemoLabel } from "@/components/DemoLabel";
import { LISTA_CAPTURA, LISTA_DEMO, maximoEsperado } from "@/data/lista";

const peso = (n: number) => `$${n.toLocaleString("es-MX")}`;

export default function ListaPage() {
  return (
    <main className="flex flex-1 flex-col gap-5 py-6">
      <h1 className="text-2xl font-bold">Mi lista</h1>
      <p className="text-neutral-700">Solo básicos: frijol, tortilla, huevo, arroz y fruta y verdura de temporada.</p>

      <ul className="flex flex-col gap-2">
        {LISTA_DEMO.map((i) => (
          <li key={i.nombre} className="flex items-center justify-between rounded-xl bg-white p-3">
            <span>
              {i.nombre} <span className="text-sm text-neutral-500">· {i.cantidad}</span>
            </span>
            <span className="text-right">
              <span className="font-medium">
                {peso(i.min)}–{peso(i.max)}
              </span>
              <span className="block text-xs text-neutral-500">captura: {LISTA_CAPTURA}</span>
            </span>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl bg-white p-5">
        <p className="text-xl font-bold">Máximo esperado: {peso(maximoEsperado(LISTA_DEMO))}</p>
        <p className="mt-1 text-sm text-neutral-600">
          Es un tope, no un total exacto: según la tienda y el día, puedes pagar menos.
        </p>
      </section>

      <p className="text-center text-xs text-neutral-500">Precio de referencia (demo) · captura: {LISTA_CAPTURA}</p>
      <DemoLabel className="mt-auto pb-2" />
    </main>
  );
}
