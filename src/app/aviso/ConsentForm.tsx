"use client";

import { useActionState } from "react";
import { giveConsent, type ConsentState } from "./actions";

export function ConsentForm() {
  const [state, action, pending] = useActionState<ConsentState, FormData>(giveConsent, undefined);
  const e = state?.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1">
        <span className="font-medium">¿En qué ciudad o alcaldía vives?</span>
        <input
          name="city"
          maxLength={60}
          placeholder="Ej. Benito Juárez, CDMX"
          className="rounded-xl border border-neutral-300 bg-white p-3"
        />
        {e.city && <span className="text-sm text-red-700">{e.city}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">¿Cuánto gastas al mes en súper, más o menos?</span>
        <select name="grocery_band" defaultValue="" className="rounded-xl border border-neutral-300 bg-white p-3">
          <option value="" disabled>
            Elige una opción
          </option>
          <option value="<2500">Menos de $2,500</option>
          <option value="2500-3500">Entre $2,500 y $3,500</option>
          <option value=">3500">Más de $3,500</option>
        </select>
        {e.grocery_band && <span className="text-sm text-red-700">{e.grocery_band}</span>}
      </label>

      <label className="flex items-start gap-3 rounded-xl bg-white p-4">
        <input type="checkbox" name="acepto" className="mt-1 h-5 w-5 accent-[#2f7d4f]" />
        <span>
          <strong>Acepto</strong> el aviso de privacidad y que MenúYA guarde los datos descritos
          arriba.
        </span>
      </label>
      {e.acepto && <span className="text-sm text-red-700">{e.acepto}</span>}
      {e.form && <span className="text-sm text-red-700">{e.form}</span>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-brand py-4 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Continuar"}
      </button>
    </form>
  );
}
