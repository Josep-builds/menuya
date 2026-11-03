"use client";

import { useActionState } from "react";
import { BASELINE_LABELS, BASELINE_LABEL_TEXT } from "@/lib/validation";
import { saveBaseline, type BaselineState } from "./actions";

export function BaselineForm() {
  const [state, action, pending] = useActionState<BaselineState, FormData>(saveBaseline, undefined);
  const e = state?.errors ?? {};
  // Los errores de zod vienen como "<fila>.<campo>" (solo cuentan las filas llenas, en orden).

  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl bg-white p-3">
          <span className="w-6 text-sm text-neutral-500">{i + 1}</span>
          <select name={`label_${i}`} defaultValue="" className="flex-1 rounded-lg border border-neutral-300 bg-white p-2 text-sm">
            <option value="">¿Por qué lo pediste?</option>
            {BASELINE_LABELS.map((l) => (
              <option key={l} value={l}>
                {BASELINE_LABEL_TEXT[l]}
              </option>
            ))}
          </select>
          <div className="flex w-24 items-center rounded-lg border border-neutral-300 bg-white px-2">
            <span className="text-neutral-500">$</span>
            <input name={`amount_${i}`} inputMode="numeric" maxLength={6} placeholder="0" className="w-full p-2 text-sm outline-none" />
          </div>
        </div>
      ))}
      {Object.entries(e).map(([k, msg]) => (
        <p key={k} className="text-sm text-red-700">
          {/^\d+\./.test(k) ? `Pedido ${Number(k.split(".")[0]) + 1} lleno: ` : ""}
          {msg}
        </p>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-2xl bg-brand py-4 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar y empezar"}
      </button>
    </form>
  );
}
