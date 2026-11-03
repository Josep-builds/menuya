"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ElcsaLevel } from "@/lib/elcsa";
import { needsReferral } from "@/lib/elcsa";

// El resultado vive SOLO en la memoria de esta pestaña. Al recargar se pierde.
type Ctx = { level: ElcsaLevel | null; setLevel: (l: ElcsaLevel) => void };
const ElcsaContext = createContext<Ctx>({ level: null, setLevel: () => {} });

export function ElcsaProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<ElcsaLevel | null>(null);
  return <ElcsaContext.Provider value={{ level, setLevel }}>{children}</ElcsaContext.Provider>;
}

export function useElcsa() {
  return useContext(ElcsaContext);
}

/**
 * ¿Se puede mostrar cualquier precio o botón de pago en esta sesión?
 * Solo si en ESTA pestaña se contestó ELCSA y salió seguridad o leve.
 * Por defecto (recarga, otra pestaña, no contestó) es false: no se ofrece pago.
 */
export function useCanShowPay() {
  const { level } = useElcsa();
  return level !== null && !needsReferral(level);
}
