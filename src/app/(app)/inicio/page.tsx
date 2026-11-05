import Link from "next/link";
import { DemoLabel } from "@/components/DemoLabel";
import { requireBaseline } from "@/lib/onboarding";
import { getTracking } from "@/lib/tracking";
import { IMPULSE_KIND_TEXT } from "@/lib/validation";
import { addNothingToday, deleteLog } from "../registrar/actions";

const peso = (n: number) => `$${n.toLocaleString("es-MX")}`;

export default async function InicioPage() {
  const { supabase } = await requireBaseline();
  const t = await getTracking(supabase);

  const entries = [
    ...t.todayWaste.map((l) => ({ table: "waste" as const, id: l.id, text: l.item, amount: l.amount_mxn })),
    ...t.todayImpulse.map((l) => ({ table: "impulse" as const, id: l.id, text: IMPULSE_KIND_TEXT[l.kind], amount: l.amount_mxn })),
  ];

  return (
    <main className="flex flex-1 flex-col gap-5 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">MenúYA</p>
        {t.finished ? (
          <h1 className="text-2xl font-bold">Terminaste tus 14 días 🎉</h1>
        ) : (
          <>
            <h1 className="text-2xl font-bold">
              Tu semana {t.currentWeek} · {t.daysLoggedThisWeek} de 7 días registrados
            </h1>
            <p className="text-sm text-neutral-500">Día {(t.dayIndex ?? 0) + 1} de 14</p>
          </>
        )}
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
          <div className="h-2 rounded-full bg-brand" style={{ width: `${(t.daysLoggedThisWeek / 7) * 100}%` }} />
        </div>
      </header>

      {!t.hasBaseline && (
        <Link href="/linea-base" className="rounded-xl bg-white px-3 py-2 text-sm text-brand ring-1 ring-brand/40">
          Completa tu línea base →
        </Link>
      )}

      {!t.finished && !t.loggedToday && (
        <div className="rounded-2xl bg-amber-100 p-4 text-amber-900">
          <p className="font-semibold">Registrar hoy</p>
          <p className="text-sm">Aún no registras nada hoy. Toma 10 segundos.</p>
        </div>
      )}

      {t.finished ? (
        <Link href="/ahorro" className="rounded-2xl bg-brand py-5 text-center text-lg font-semibold text-white">
          Ver mi ahorro
        </Link>
      ) : (
        <div className="flex flex-col gap-3">
          <Link href="/registrar?tipo=tire" className="rounded-2xl bg-white py-6 text-center text-xl font-semibold ring-1 ring-neutral-300">
            🗑 Tiré comida
          </Link>
          <Link href="/registrar?tipo=pedi" className="rounded-2xl bg-white py-6 text-center text-xl font-semibold ring-1 ring-neutral-300">
            🛵 Pedí algo / compra no planeada
          </Link>
          {!t.loggedToday && (
            <form action={addNothingToday}>
              <button className="w-full rounded-2xl py-3 text-brand underline">✅ Hoy no tiré nada ni compré de más</button>
            </form>
          )}
        </div>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Hoy</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin registros todavía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((e) => (
              <li key={`${e.table}-${e.id}`} className="flex items-center justify-between rounded-xl bg-white p-3">
                <span>
                  {e.text} <span className="text-neutral-500">({peso(e.amount)})</span>
                </span>
                <form action={deleteLog}>
                  <input type="hidden" name="table" value={e.table} />
                  <input type="hidden" name="id" value={e.id} />
                  <button className="text-sm text-neutral-500 underline" aria-label={`Borrar ${e.text}`}>
                    Borrar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DemoLabel className="mt-auto pb-4" />
    </main>
  );
}
