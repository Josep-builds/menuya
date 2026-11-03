"use client";

import { useActionState } from "react";
import Link from "next/link";
import { IMPULSE_KINDS, IMPULSE_KIND_TEXT } from "@/lib/validation";
import { addImpulse, addWaste, type LogState } from "./actions";

const input = "rounded-xl border border-neutral-300 bg-white p-3";

export function LogForm({ tipo }: { tipo: "tire" | "pedi" }) {
  const [state, action, pending] = useActionState<LogState, FormData>(
    tipo === "tire" ? addWaste : addImpulse,
    undefined,
  );
  const e = state?.errors ?? {};
  const err = (k: string) => e[k] && <span className="text-sm text-red-700">{e[k]}</span>;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {tipo === "tire" ? (
        <label className="flex flex-col gap-1">
          <span className="font-medium">¿Qué tiraste?</span>
          <input name="item" maxLength={60} placeholder="Ej. 1 bolsa de espinaca" className={input} />
          {err("item")}
        </label>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-medium">¿Qué fue?</legend>
          {IMPULSE_KINDS.map((k, i) => (
            <label key={k} className="flex items-center gap-3 rounded-xl bg-white p-3">
              <input type="radio" name="kind" value={k} defaultChecked={i === 0} className="h-5 w-5 accent-[#2f7d4f]" />
              {IMPULSE_KIND_TEXT[k]}
            </label>
          ))}
          {err("kind")}
        </fieldset>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-medium">{tipo === "tire" ? "¿Cuánto costó, más o menos?" : "¿Cuánto pagaste?"}</span>
        <div className={`flex items-center ${input}`}>
          <span className="pr-1 text-neutral-500">$</span>
          <input name="amount_mxn" inputMode="numeric" maxLength={7} placeholder="0" className="w-full outline-none" />
        </div>
        {err("amount_mxn")}
      </label>

      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-1 font-medium">¿Cuándo?</legend>
        {(["hoy", "ayer"] as const).map((w) => (
          <label key={w} className="flex items-center justify-center gap-2 rounded-xl bg-white p-3">
            <input type="radio" name="when" value={w} defaultChecked={w === "hoy"} className="accent-[#2f7d4f]" />
            {w === "hoy" ? "Hoy" : "Ayer"}
          </label>
        ))}
      </fieldset>
      {err("when")}
      {err("form")}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-brand py-4 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      <Link href="/inicio" className="text-center text-neutral-600 underline">
        Cancelar
      </Link>
    </form>
  );
}
