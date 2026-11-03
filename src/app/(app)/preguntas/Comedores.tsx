export function Comedores() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Hay apoyos gratuitos o de muy bajo costo cerca de ti</h2>
      <p className="text-neutral-700">
        Gracias por contestar con honestidad. Antes de cualquier plan, te compartimos opciones para
        comer bien en la Ciudad de México.
      </p>
      <ul className="flex flex-col gap-3">
        <li className="rounded-2xl bg-white p-4">
          <p className="font-semibold">Comedores sociales y comunitarios de la CDMX</p>
          <p className="text-sm text-neutral-700">
            Comida caliente en todas las alcaldías. Busca el más cercano en el sitio de la
            Secretaría de Inclusión y Bienestar Social (SIBISO).
          </p>
          <a className="text-sm text-brand underline" href="https://www.sibiso.cdmx.gob.mx" target="_blank" rel="noopener noreferrer">
            sibiso.cdmx.gob.mx
          </a>
        </li>
        <li className="rounded-2xl bg-white p-4">
          <p className="font-semibold">Locatel — orientación sobre programas sociales</p>
          <p className="text-sm text-neutral-700">
            Te dicen qué apoyos alimentarios te tocan y dónde están. Llamada sin costo.
          </p>
          <a className="text-sm text-brand underline" href="tel:5556581111">
            55 5658 1111
          </a>
        </li>
        <li className="rounded-2xl bg-white p-4">
          <p className="font-semibold">Bancos de alimentos (Red BAMX)</p>
          <p className="text-sm text-neutral-700">
            Red de bancos de alimentos con despensas para hogares que lo necesitan.
          </p>
          <a className="text-sm text-brand underline" href="https://bamx.org.mx" target="_blank" rel="noopener noreferrer">
            bamx.org.mx
          </a>
        </li>
      </ul>
      <p className="text-xs text-neutral-500">
        Verifica horarios y ubicaciones en los sitios oficiales antes de ir. Puedes seguir usando
        MenúYA gratis para registrar lo que tiras, si te sirve.
      </p>
    </section>
  );
}
