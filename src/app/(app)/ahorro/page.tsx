import { DemoLabel } from "@/components/DemoLabel";
import { PayButton } from "@/components/PayButton";
import { SavingViewed } from "@/components/SavingViewed";
import { requireBaseline } from "@/lib/onboarding";
import { getTracking } from "@/lib/tracking";
import { computeSaving, GOAL_MXN } from "@/lib/saving";

const peso = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("es-MX")}`;

export default async function AhorroPage() {
  const { supabase } = await requireBaseline();
  const t = await getTracking(supabase);
  const s = computeSaving({ startDate: t.startDate, today: t.today, waste: t.wasteLogs, impulse: t.impulseLogs, baseline: t.baseline });

  return (
    <main className="flex flex-1 flex-col gap-5 py-6">
      <SavingViewed />
      <h1 className="text-2xl font-bold">Tu ahorro</h1>

      {s.status === "semana1" ? (
        <section className="rounded-2xl bg-white p-5">
          <p className="font-semibold">Semana 1: estamos midiendo</p>
          <p className="mt-1 text-neutral-700">
            Esta semana solo registras, sin plan. Llevas {peso(s.week1Total)} entre comida tirada y
            compras no planeadas. Tu ahorro se calcula comparando con la semana 2.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl bg-white p-5">
          <p className="text-sm text-neutral-500">
            {s.status === "final" || s.daysCompared === 7 ? "Semana 2 vs. semana 1" : `Primeros ${s.daysCompared} días de la semana 2 vs. los mismos días de la semana 1`}
          </p>
          <p className="mt-1 text-2xl font-bold">
            Ahorro esta semana: {peso(s.saving)} de {peso(GOAL_MXN)}
          </p>
          <div className="mt-3 h-3 w-full rounded-full bg-neutral-200">
            <div className="h-3 rounded-full bg-brand" style={{ width: `${s.progress * 100}%` }} />
          </div>
          <p className="mt-3 text-neutral-700">
            {s.goalMet
              ? "¡Pasaste la meta! 🎉"
              : s.saving < 0
                ? `Esta semana gastaste ${peso(-s.saving)} más que en la semana 1. Así salió, y está bien saberlo.`
                : `Te faltaron ${peso(GOAL_MXN - s.saving)} para la meta de ${peso(GOAL_MXN)}. Es tu número real, no uno inventado.`}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-background p-3">
              <dt className="text-neutral-500">Semana 1</dt>
              <dd className="font-semibold">{peso(s.week1Total)}</dd>
            </div>
            <div className="rounded-xl bg-background p-3">
              <dt className="text-neutral-500">Semana 2</dt>
              <dd className="font-semibold">{peso(s.week2Total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-neutral-500">Suma de comida tirada + compras no planeadas.</p>
        </section>
      )}

      {s.alcoholTabaco.count > 0 && (
        <section className="rounded-2xl bg-white p-5">
          <p className="font-semibold">Lo que un plan de comidas no arregla</p>
          <p className="mt-1 text-neutral-700">
            De tus últimos pedidos, {s.alcoholTabaco.count} fueron de alcohol o tabaco ({peso(s.alcoholTabaco.amount)}).
            No los contamos como ahorro posible.
          </p>
        </section>
      )}

      <PayButton />
      <DemoLabel className="mt-auto pb-2" />
    </main>
  );
}
