export function DemoLabel({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-xs text-neutral-500 ${className}`}>
      Versión de prueba · Datos de demostración
    </p>
  );
}
