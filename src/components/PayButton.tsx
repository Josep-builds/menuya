"use client";

import Link from "next/link";
import { useElcsa } from "./ElcsaProvider";
import { payButtonMode } from "@/lib/elcsa";
import { trackPayLinkClicked } from "@/lib/event-actions";

const PAY_LINK = process.env.NEXT_PUBLIC_PAY_LINK ?? "";

/**
 * Botón de pago. Solo aparece si en ESTA pestaña ELCSA salió seguridad o leve.
 * - Moderada/severa en esta sesión: no se muestra nada (ni precio, ni botón, ni pista).
 * - Sin resultado en memoria (recargó / volvió otro día): se invita a contestar de nuevo.
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
  if (mode !== "show" || !PAY_LINK) return null;

  return (
    <a
      href={PAY_LINK}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => void trackPayLinkClicked()}
      className="block w-full rounded-2xl bg-brand px-4 py-4 text-center font-semibold text-white hover:bg-brand-dark"
    >
      Apoyar MenúYA · $149 por semestre, sin renovación automática
    </a>
  );
}
