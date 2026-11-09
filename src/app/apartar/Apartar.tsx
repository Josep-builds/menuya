"use client";

import { useState } from "react";
import { WHATSAPP_TEXTO_VISIBLE, enlaceWhatsApp, type PrecioApartar } from "@/lib/apartar";

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
          Apartar mi lugar para diciembre
        </button>
        <p className="text-center text-xs text-neutral-500">No te pedimos tarjeta ni datos bancarios.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="status" className="rounded-2xl bg-green-50 p-5 text-center">
        <p className="text-lg font-semibold">Todavía no cobramos.</p>
        <p className="mt-1 text-neutral-700">No se te cargó nada. Estamos midiendo interés.</p>
      </div>
      <a
        href={enlaceWhatsApp(precio)}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-2xl bg-brand py-4 text-center text-lg font-semibold text-white hover:bg-brand-dark"
      >
        Avísanos por WhatsApp
      </a>
      <p className="text-center text-sm text-neutral-700">
        WhatsApp: <span className="font-semibold tabular-nums">{WHATSAPP_TEXTO_VISIBLE}</span>
      </p>
    </div>
  );
}
