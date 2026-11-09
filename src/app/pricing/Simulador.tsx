"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { PRECIOS, simular } from "@/lib/pricing";
import {
  CAMPOS_BASE,
  ESCENARIOS_PREDEFINIDOS,
  MAX_GUARDADOS,
  STORAGE_KEY,
  aSupuestos,
  nombreNuevo,
  parseGuardados,
  serializarGuardados,
  type Campo,
  type Campos,
  type Escenario,
  type Precio,
} from "@/lib/simulador";

const peso = (n: number, dec = 0) =>
  (n < 0 ? "−$" : "$") +
  Math.abs(n).toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const num = (n: number) => n.toLocaleString("es-MX");
const cuantos = (n: number | null) => (n === null ? "nunca" : num(n));

// localStorage puede no existir o lanzar error (modo privado, bloqueado): siempre con try/catch.
const EVENTO = "menuya-escenarios";
function leerRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function suscribir(cb: () => void) {
  window.addEventListener("storage", cb); // otras pestañas
  window.addEventListener(EVENTO, cb); // esta pestaña
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENTO, cb);
  };
}
function escribirStorage(lista: Escenario[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializarGuardados(lista));
    window.dispatchEvent(new Event(EVENTO));
    return true;
  } catch {
    return false;
  }
}

function CampoNum({
  label,
  value,
  onChange,
  pre,
  suf,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  pre?: string;
  suf?: string;
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
  const [c, setC] = useState<Campos>(CAMPOS_BASE);
  const [precio, setPrecio] = useState<Precio>(49);
  const [activo, setActivo] = useState<string | null>("Base");
  const [aviso, setAviso] = useState<string | null>(null);
  // En el servidor no hay localStorage: se lee solo en el navegador (null en el servidor).
  const raw = useSyncExternalStore(suscribir, leerRaw, () => null);
  const guardados = useMemo(() => parseGuardados(raw), [raw]);

  const set = (k: Campo) => (v: string) => {
    setC((prev) => ({ ...prev, [k]: v }));
    setActivo(null);
  };
  const cargar = (e: Escenario) => {
    setC(e.campos);
    setPrecio(e.precio);
    setActivo(e.nombre);
    setAviso(null);
  };
  const guardar = () => {
    if (guardados.length >= MAX_GUARDADOS) {
      setAviso(`Ya tienes ${MAX_GUARDADOS} escenarios guardados. Borra uno para guardar otro.`);
      return;
    }
    const nuevo: Escenario = { nombre: nombreNuevo(guardados), campos: c, precio };
    const lista = [...guardados, nuevo];
    if (escribirStorage(lista)) {
      setActivo(nuevo.nombre);
      setAviso(`Guardado como «${nuevo.nombre}» en este navegador.`);
    } else {
      setAviso("Este navegador no deja guardar (¿modo privado?). Tus números siguen aquí, pero no se guardaron.");
    }
  };
  const borrar = (nombre: string) => {
    const lista = guardados.filter((e) => e.nombre !== nombre);
    escribirStorage(lista);
    if (activo === nombre) setActivo(null);
    setAviso(null);
  };

  const s = aSupuestos(c, precio);
  const r = simular(s);
  const free = s.usuariosFree;

  const chip = (sel: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-semibold ${
      sel ? "border-brand bg-brand text-white" : "border-neutral-300 bg-white text-neutral-800"
    }`;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-600">
        Todos los números de abajo son supuestos. Cámbialos y mira qué pasa. Los usuarios necesarios
        siempre se redondean hacia arriba.
      </p>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-4" aria-label="Escenarios">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">Escenarios</h3>
        <div className="flex flex-wrap gap-2">
          {ESCENARIOS_PREDEFINIDOS.map((e) => (
            <button key={e.nombre} type="button" aria-pressed={activo === e.nombre} onClick={() => cargar(e)} className={chip(activo === e.nombre)}>
              {e.nombre}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500">
          Conservador: 500 free, 2%, haircut 30%. Base: 1,000 free, 3%, haircut 20%. Optimista: 3,000 free, 5%,
          haircut 10%. Los tres a $49.
        </p>

        <button
          type="button"
          onClick={guardar}
          className="rounded-xl border-2 border-brand py-2 font-semibold text-brand hover:bg-green-50"
        >
          Guardar escenario
        </button>
        {aviso && (
          <p role="status" className="text-sm text-neutral-700">
            {aviso}
          </p>
        )}

        {guardados.length > 0 && (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {guardados.map((e) => (
              <li key={e.nombre} className="flex items-center justify-between gap-2 py-2">
                <span className={`text-sm ${activo === e.nombre ? "font-semibold" : ""}`}>
                  {e.nombre} · ${e.precio}
                </span>
                <span className="flex gap-3 text-sm">
                  <button type="button" onClick={() => cargar(e)} className="font-semibold text-brand underline">
                    Cargar
                  </button>
                  <button type="button" onClick={() => borrar(e.nombre)} className="text-neutral-600 underline">
                    Borrar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-neutral-500">
          Se guardan solo en este navegador y solo números. No guardamos datos personales.
        </p>
      </section>

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
          <CampoNum label="Conversión free → paid" value={c.conversion} onChange={set("conversion")} suf="%" />
          <CampoNum label="Haircut «dijo vs pagó»" value={c.haircut} onChange={set("haircut")} suf="%" />
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
                onClick={() => {
                  setPrecio(p);
                  setActivo(null);
                }}
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
          <CampoNum label="%" value={c.pct} onChange={set("pct")} suf="%" />
          <CampoNum label="Fijo" value={c.fijo} onChange={set("fijo")} pre="$" />
          <CampoNum label="IVA" value={c.iva} onChange={set("iva")} suf="%" />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand">Costos fijos al mes</legend>
        <p className="text-sm font-medium">
          v1 manual: {peso(r.costoV1)}/mes{" "}
          <span className="font-normal text-neutral-500">· cupo {num(s.cupoV1)} usuarios</span>
        </p>
        <div className="grid grid-cols-3 items-end gap-3">
          <CampoNum label="Horas" value={c.horasV1} onChange={set("horasV1")} suf="h" />
          <CampoNum label="Por hora" value={c.tarifaHoraV1} onChange={set("tarifaHoraV1")} pre="$" />
          <CampoNum label="Cupo" value={c.cupoV1} onChange={set("cupoV1")} />
        </div>
        <p className="mt-2 text-sm font-medium">v2: {peso(r.costoV2)}/mes</p>
        <div className="grid grid-cols-2 items-end gap-3">
          <CampoNum label="+ Proveedor WhatsApp" value={c.proveedorWhatsAppV2} onChange={set("proveedorWhatsAppV2")} pre="$" />
          <CampoNum label="Meta mensual" value={c.metaMensual} onChange={set("metaMensual")} pre="$" />
        </div>
      </fieldset>

      <section aria-live="polite" className="rounded-2xl border-2 border-brand bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Resultado{activo ? ` · ${activo}` : ""}
        </h3>
        <dl className="mt-2 divide-y divide-neutral-100">
          <Fila k="Neto por usuario" v={peso(r.neto, 2)} fuerte />
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

      <button type="button" onClick={() => cargar(ESCENARIOS_PREDEFINIDOS[1])} className="self-center text-sm text-neutral-600 underline">
        Volver al escenario Base
      </button>
    </div>
  );
}
