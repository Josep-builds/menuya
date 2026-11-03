// Texto único del aviso de privacidad: se usa en /privacidad (pública) y en /aviso (consentimiento).
export const PRIVACY_UPDATED = "3 de noviembre de 2026";

export function PrivacyNotice() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 text-[15px] leading-relaxed">
      <div>
        <h2 className="font-semibold">Quién es responsable</h2>
        <p>
          MenúYA, proyecto en versión de prueba, es responsable de tus datos personales conforme
          a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares
          (2025).
        </p>
      </div>
      <div>
        <h2 className="font-semibold">Qué guardamos</h2>
        <ul className="list-disc pl-5">
          <li>Tu nombre y correo de Google (para que tu cuenta sea tuya).</li>
          <li>Tu ciudad y un rango de cuánto gastas en súper al mes.</li>
          <li>
            Lo que registres: comida que tiraste y compras no planeadas, con su monto en pesos.
          </li>
          <li>Qué pantallas usas (por ejemplo, «vio su ahorro»), sin tus respuestas personales.</li>
        </ul>
      </div>
      <div>
        <h2 className="font-semibold">Para qué</h2>
        <p>
          Para calcular cuánto ahorras y saber si MenúYA de verdad sirve. No vendemos tus datos,
          no los usamos para publicidad y no los compartimos con nadie más que los servicios que
          hospedan la app (Supabase y Vercel).
        </p>
      </div>
      <div>
        <h2 className="font-semibold">Las preguntas sobre tu alimentación</h2>
        <p>
          Después te haremos unas preguntas sobre si te ha alcanzado para comer. Esas respuestas{" "}
          <strong>nunca salen de tu teléfono</strong>: no se envían ni se guardan en ningún lado.
        </p>
      </div>
      <div>
        <h2 className="font-semibold">Cómo borrar tus datos</h2>
        <p>
          En <strong>Perfil → Borrar mis datos</strong> eliminas todo lo que guardamos de ti, en
          un toque. También puedes pedir acceso, corrección, cancelación u oposición (derechos
          ARCO) o retirar tu consentimiento escribiendo a{" "}
          <a href="mailto:josepferre.g@icloud.com" className="text-brand underline">
            josepferre.g@icloud.com
          </a>
          ; si lo pides, también borramos tu cuenta de acceso.
        </p>
      </div>
    </section>
  );
}
