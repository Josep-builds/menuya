"use client";

import Link from "next/link";
import { useElcsa } from "./ElcsaProvider";
import { payButtonMode } from "@/lib/elcsa";
import { trackPayLinkClicked } from "@/lib/event-actions";

/**
 * Botón "Ver planes" → /pricing. Solo aparece si en ESTA pestaña ELCSA salió seguridad o leve.
 * - Moderada/severa en esta sesión: no se muestra nada (ni botón, ni pista).
 * - Sin resultado en memoria (recargó / volvió otro día): se invita a contestar de nuevo.
 * El botón no muestra precio y no cobra: solo lleva a la página de planes.
 */
export function PayButton() {
  const { level } = useElcsa();
  const mode = payButtonMode(level);

  if (mode === "retake") {
    return (
      <Link href="/preguntas" className="block text-center text-sm text-neutral-600 underline">
        ¿Quieres apoyar a MenúYA? Contesta otra vez las 8 preguntas (no salen de tu teléfono).
      </Link>
    );
  }
  if (mode !== "show") return null;

  return (
    <Link
      href="/pricing"
      onClick={() => void trackPayLinkClicked()}
      className="block w-full rounded-2xl bg-brand px-4 py-4 text-center font-semibold text-white hover:bg-brand-dark"
    >
      Ver planes
    </Link>
  );
}
