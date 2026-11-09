"use client";

import { useId, useState } from "react";
import { PRECIOS, SUPUESTOS_INICIALES as S0, simular, type Supuestos } from "@/lib/pricing";

const peso = (n: number, dec = 0) =>
  (n < 0 ? "−$" : "$") +
  Math.abs(n).toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const num = (n: number) => n.toLocaleString("es-MX");
const cuantos = (n: number | null) => (n === null ? "nunca" : num(n));

// Los campos se guardan como texto para poder borrar y reescribir sin que salte a 0.
type Campos = Record<
  "usuariosFree" | "conversion" | "haircut" | "pct" | "fijo" | "iva" | "horasV1" | "tarifaHoraV1" | "cupoV1" | "proveedorWhatsAppV2" | "metaMensual",
  string
>;

// Fracción → texto en %, sin basura de punto flotante (0.036 × 100 = 3.5999999999999996).
const pct = (f: number) => String(Math.round(f * 10000) / 100);

const INICIALES: Campos = {
  usuariosFree: String(S0.usuariosFree),
  conversion: pct(S0.conversion),
  haircut: pct(S0.haircut),
  pct: pct(S0.comision.pct),
  fijo: String(S0.comision.fijo),
  iva: pct(S0.comision.iva),
  horasV1: String(S0.horasV1),
  tarifaHoraV1: String(S0.tarifaHoraV1),
  cupoV1: String(S0.cupoV1),
  proveedorWhatsAppV2: String(S0.proveedorWhatsAppV2),
  metaMensual: String(S0.metaMensual),
};

const leer = (v: string, max = Infinity) => {
  const n = Number(v.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};

function aSupuestos(c: Campos, precio: number): Supuestos {
  return {
    usuariosFree: leer(c.usuariosFree, 10000),
    conversion: leer(c.conversion, 100) / 100,
    precio,
    haircut: leer(c.haircut, 100) / 100,
    comision: { pct: leer(c.pct, 100) / 100, fijo: leer(c.fijo), iva: leer(c.iva, 100) / 100 },
    horasV1: leer(c.horasV1),
    tarifaHoraV1: leer(c.tarifaHoraV1),
    cupoV1: leer(c.cupoV1),
    proveedorWhatsAppV2: leer(c.proveedorWhatsAppV2),
    metaMensual: leer(c.metaMensual),
  };
}

function Campo({
  label,
  value,
  onChange,
  pre,
  suf,
  ayuda,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  pre?: string;
  suf?: string;
  ayuda?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <div className="mt-1 flex items-center rounded-xl border border-neutral-300 bg-white px-3 focus-within:border-brand">
        {pre && <span className="text-neutral-500">{pre}</span>}
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent py-2 text-base outline-none"
        />
        {suf && <span className="text-neutral-500">{suf}</span>}
      </div>
      {ayuda && <p className="mt-1 text-xs text-neutral-500">{ayuda}</p>}
    </div>
  );
}

function Fila({ k, v, fuerte }: { k: string; v: string; fuerte?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-neutral-700">{k}</dt>
      <dd className={`text-right tabular-nums ${fuerte ? "text-lg font-bold" : "font-semibold"}`}>{v}</dd>
    </div>
  );
}

export function Simulador() {
  const [c, setC] = useState<Campos>(INICIALES);
  const [precio, setPrecio] = useState<number>(S0.precio);
  const set = (k: keyof Campos) => (v: string) => setC((prev) => ({ ...prev, [k]: v }));

  const s = aSupuestos(c, precio);
  const r = simular(s);
  const free = s.usuariosFree;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-600">
        Todos los números de abajo son supuestos. Cámbialos y mira qué pasa. Los usuarios necesarios
        siempre se redondean hacia arriba.
      </p>

      <fieldset className="flex flex-col gap-4 rounded-2xl bg-white p-4">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand">Usuarios y precio</legend>

        <div>
          <label htmlFor="sim-free" className="flex items-baseline justify-between text-sm font-medium text-neutral-800">
            <span>Usuarios free</span>
            <span className="tabular-nums text-base font-semibold">{num(free)}</span>
          </label>
          <input
            id="sim-free"
            type="range"
            min={0}
            max={10000}
            step={50}
            value={free}
            onChange={(e) => set("usuariosFree")(e.target.value)}
            className="mt-2 w-full accent-[#2f7d4f]"
          />
          <div className="flex justify-between text-xs text-neutral-500">
            <span>0</span>
            <span>10,000</span>
          </div>
        </div>

        <div className="grid grid-cols-2 items-end gap-3">
          <Campo label="Conversión free → paid" value={c.conversion} onChange={set("conversion")} suf="%" />
          <Campo
            label="Haircut «dijo vs pagó»"
            value={c.haircut}
            onChange={set("haircut")}
            suf="%"
          />
        </div>
        <p className="-mt-2 text-xs text-neutral-500">
          Haircut: de los que dicen que sí pagarían, qué parte al final no paga.
        </p>

        <div>
          <p className="text-sm font-medium text-neutral-800">Precio Student al mes</p>
          <div className="mt-1 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Precio Student al mes">
            {PRECIOS.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={precio === p}
                onClick={() => setPrecio(p)}
                className={`rounded-xl border py-2 font-semibold ${
                  precio === p ? "border-brand bg-brand text-white" : "border-neutral-300 bg-white text-neutral-800"
                }`}
              >
                ${p} MXN
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand">Comisión del procesador</legend>
        <p className="text-xs text-neutral-500">Procesador todavía no decidido. Comisión = (% × precio + fijo) + IVA sobre la comisión.</p>
        <div className="grid grid-cols-3 items-end gap-3">
          <Campo label="%" value={c.pct} onChange={set("pct")} suf="%" />
          <Campo label="Fijo" value={c.fijo} onChange={set("fijo")} pre="$" />
          <Campo label="IVA" value={c.iva} onChange={set("iva")} suf="%" />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand">Costos fijos al mes</legend>
        <p className="text-sm font-medium">
          v1 manual: {peso(r.costoV1)}/mes{" "}
          <span className="font-normal text-neutral-500">· cupo {num(s.cupoV1)} usuarios</span>
        </p>
        <div className="grid grid-cols-3 items-end gap-3">
          <Campo label="Horas" value={c.horasV1} onChange={set("horasV1")} suf="h" />
          <Campo label="Por hora" value={c.tarifaHoraV1} onChange={set("tarifaHoraV1")} pre="$" />
          <Campo label="Cupo" value={c.cupoV1} onChange={set("cupoV1")} />
        </div>
        <p className="mt-2 text-sm font-medium">v2: {peso(r.costoV2)}/mes</p>
        <div className="grid grid-cols-2 items-end gap-3">
          <Campo label="+ Proveedor WhatsApp" value={c.proveedorWhatsAppV2} onChange={set("proveedorWhatsAppV2")} pre="$" />
          <Campo label="Meta mensual" value={c.metaMensual} onChange={set("metaMensual")} pre="$" />
        </div>
      </fieldset>

      <section aria-live="polite" className="rounded-2xl border-2 border-brand bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">Resultado</h3>
        <dl className="mt-2 divide-y divide-neutral-100">
          <Fila k="Neto por usuario" v={`${peso(r.neto, 2)}`} fuerte />
          <Fila k="Comisión por cobro" v={peso(r.comision, 2)} />
          <Fila k="Usuarios que pagan" v={num(r.pagando)} />
          <Fila k="Ingreso neto mensual" v={peso(r.ingresoMensual)} fuerte />
          <Fila k="Ingreso neto anual" v={peso(r.ingresoAnual)} />
        </dl>

        <h4 className="mt-4 text-sm font-semibold">Usuarios que pagan para…</h4>
        <dl className="mt-1 divide-y divide-neutral-100">
          <Fila k={`Equilibrio v1 (${peso(r.costoV1)})`} v={cuantos(r.equilibrioV1.pagando)} />
          <Fila k={`Equilibrio v2 (${peso(r.costoV2)})`} v={cuantos(r.equilibrioV2.pagando)} />
          <Fila k={`Cubrir ${peso(s.metaMensual)}/mes`} v={cuantos(r.meta.pagando)} />
        </dl>
        <p className="mt-2 text-xs text-neutral-500">
          Con tu conversión y haircut eso equivale a {cuantos(r.equilibrioV1.free)}, {cuantos(r.equilibrioV2.free)} y{" "}
          {cuantos(r.meta.free)} usuarios free.
        </p>

        {r.meta.pagando !== null && r.meta.pagando > s.cupoV1 && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Ojo: v1 es manual y solo atiende {num(s.cupoV1)} usuarios. Llegar a {peso(s.metaMensual)}/mes necesita v2.
          </p>
        )}
        {!r.caben && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Con {num(r.pagando)} usuarios que pagan ya no cabes en v1 (cupo {num(s.cupoV1)}).
          </p>
        )}
        <p className="mt-3 text-sm">
          Después de costos: v1 <b className="tabular-nums">{peso(r.resultadoV1)}</b> · v2{" "}
          <b className="tabular-nums">{peso(r.resultadoV2)}</b> al mes.
        </p>
      </section>

      <button
        type="button"
        onClick={() => {
          setC(INICIALES);
          setPrecio(S0.precio);
        }}
        className="self-center text-sm text-neutral-600 underline"
      >
        Volver a los supuestos iniciales
      </button>
    </div>
  );
}
