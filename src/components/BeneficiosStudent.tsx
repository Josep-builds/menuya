import { BENEFICIOS_STUDENT } from "@/lib/planes";

/** Los 3 beneficios del plan Student, cada uno con su explicación. Se usa en /pricing y /apartar. */
export function BeneficiosStudent() {
  return (
    <ul className="flex flex-col gap-3 text-neutral-700">
      {BENEFICIOS_STUDENT.map((b) => (
        <li key={b.cuando} className="flex gap-2">
          <span aria-hidden className="text-brand">
            ✓
          </span>
          <span>
            <b className="text-neutral-900">{b.cuando}:</b> {b.que}
          </span>
        </li>
      ))}
    </ul>
  );
}
