"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ELCSA_PREFIX, ELCSA_QUESTIONS, needsReferral, scoreElcsa, type ElcsaLevel } from "@/lib/elcsa";
import { useElcsa } from "@/components/ElcsaProvider";
import { markElcsaCompleted } from "./actions";
import { Comedores } from "./Comedores";

export function ElcsaForm() {
  // Respuestas solo en memoria (estado de React). Nada de storage, nada de red.
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [result, setResult] = useState<ElcsaLevel | null>(null);
  const [pending, startTransition] = useTransition();
  const { setLevel } = useElcsa();
  const router = useRouter();

  const i = answers.length;

  function answer(value: boolean) {
    const next = [...answers, value];
    setAnswers(next);
    if (next.length === ELCSA_QUESTIONS.length) {
      const level = scoreElcsa(next);
      setLevel(level);
      setResult(level);
      setAnswers([]); // ya no hacen falta las respuestas, solo el nivel en memoria
      startTransition(() => markElcsaCompleted()); // solo «completó», sin puntaje
    }
  }

  // Mismo botón y mismo destino para todos los resultados: la navegación no revela nada.
  const continueButton = (
    <button
      type="button"
      disabled={pending}
      onClick={() => router.push("/inicio")}
      className="w-full rounded-2xl bg-brand py-4 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
    >
      Continuar
    </button>
  );

  if (result) {
    return (
      <div className="flex flex-col gap-6">
        {needsReferral(result) ? (
          <Comedores />
        ) : (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">¡Gracias!</h2>
            <p className="text-neutral-700">
              Tus respuestas ya se borraron de la pantalla. Ahora vamos a ver cuánto se te va en
              comida que tiras.
            </p>
          </section>
        )}
        {continueButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-neutral-500">
        Pregunta {i + 1} de {ELCSA_QUESTIONS.length}
      </p>
      <div className="h-2 w-full rounded-full bg-neutral-200">
        <div className="h-2 rounded-full bg-brand" style={{ width: `${(i / ELCSA_QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="text-neutral-600">{ELCSA_PREFIX}</p>
      <p className="text-xl font-semibold">{ELCSA_QUESTIONS[i]}</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => answer(true)} className="rounded-2xl bg-white py-4 text-lg font-semibold ring-1 ring-neutral-300">
          Sí
        </button>
        <button type="button" onClick={() => answer(false)} className="rounded-2xl bg-white py-4 text-lg font-semibold ring-1 ring-neutral-300">
          No
        </button>
      </div>
      {i > 0 && (
        <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="text-sm text-neutral-500 underline">
          Volver a la pregunta anterior
        </button>
      )}
    </div>
  );
}
