"use client";

import { useState } from "react";
import { WHATSAPP_TEXTO_VISIBLE, enlaceWhatsApp, type PrecioApartar } from "@/lib/apartar";

const NO_COBRAMOS =
  "Antes de cobrar te preguntamos; si no dices que sí, no se te cobra nada. Cancelas mandando BAJA.";

export function Apartar({ precio }: { precio: PrecioApartar }) {
  const [apartado, setApartado] = useState(false);

  if (!apartado) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setApartado(true)}
          className="block w-full rounded-2xl bg-brand py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark"
        >
          Apartar mi lugar para el primer grupo
        </button>
        <p className="text-center text-xs text-neutral-500">No te pedimos tarjeta ni datos bancarios.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="status" className="rounded-2xl bg-green-50 p-5">
        <p className="text-lg font-semibold">✓ Listo, quedaste en la lista.</p>
        <p className="mt-1 text-neutral-700">
          Último paso: mándanos un WhatsApp para confirmar tu lugar (ya va escrito, solo dale enviar).
        </p>
      </div>
      <a
        href={enlaceWhatsApp(precio)}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-2xl bg-brand py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark"
      >
        Confirmar por WhatsApp
      </a>
      <p className="text-center text-sm text-neutral-700">
        WhatsApp: <span className="font-semibold tabular-nums">{WHATSAPP_TEXTO_VISIBLE}</span>
      </p>
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        <p className="font-semibold text-neutral-900">Todavía no cobramos.</p>
        <p className="mt-1">{NO_COBRAMOS}</p>
      </div>
    </div>
  );
}
