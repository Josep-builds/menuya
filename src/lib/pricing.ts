// Cuentas del simulador de /pricing. Funciones puras (con pruebas en tests/pricing.test.ts).
//
// Regla del equipo: el ingreso depende SOLO de cuántos usuarios pagan y del precio fijo.
// Nunca de cuánto gasta el usuario en el súper (nada de % de la compra ni venta de datos).
// Por eso ninguna función recibe el gasto del usuario.

export type Comision = {
  /** Porcentaje del procesador, como fracción (0.036 = 3.6%). */
  pct: number;
  /** Cargo fijo por cobro, en pesos. */
  fijo: number;
  /** IVA que se cobra SOBRE la comisión, como fracción (0.16 = 16%). */
  iva: number;
};

export type Supuestos = {
  usuariosFree: number;
  /** Conversión free → paid, como fracción (0.03 = 3%). */
  conversion: number;
  precio: number;
  /** Haircut "dijo vs pagó", como fracción (0.2 = 20%). */
  haircut: number;
  comision: Comision;
  horasV1: number;
  tarifaHoraV1: number;
  cupoV1: number;
  proveedorWhatsAppV2: number;
  metaMensual: number;
};

export const PRECIOS = [49, 69] as const;

export const SUPUESTOS_INICIALES: Supuestos = {
  usuariosFree: 1000,
  conversion: 0.03,
  precio: 49,
  haircut: 0.2,
  comision: { pct: 0.036, fijo: 3, iva: 0.16 },
  horasV1: 4,
  tarifaHoraV1: 120,
  cupoV1: 25,
  proveedorWhatsAppV2: 699,
  metaMensual: 9343,
};

// Evita que un error de punto flotante (p. ej. 12.000000001) suba un usuario de más.
const EPS = 1e-9;
const techo = (x: number) => Math.ceil(x - EPS);

/** Comisión del procesador por cobro: (% × precio + fijo) × (1 + IVA). */
export function comisionPorCobro(precio: number, c: Comision): number {
  return (precio * c.pct + c.fijo) * (1 + c.iva);
}

/** Lo que queda de cada pago después de la comisión. */
export function netoPorUsuario(precio: number, c: Comision): number {
  return precio - comisionPorCobro(precio, c);
}

/** Usuarios que pagan, redondeando hacia arriba. null = no se alcanza nunca (neto ≤ 0). */
export function usuariosParaCubrir(costoMensual: number, neto: number): number | null {
  if (costoMensual <= 0) return 0;
  if (neto <= 0) return null;
  return techo(costoMensual / neto);
}

/** Usuarios free que hacen falta para tener `pagando` usuarios que pagan, hacia arriba. */
export function freeNecesarios(pagando: number | null, conversion: number, haircut: number): number | null {
  if (pagando === null) return null;
  const tasa = conversion * (1 - haircut);
  if (pagando === 0) return 0;
  if (tasa <= 0) return null;
  return techo(pagando / tasa);
}

/**
 * Usuarios que de verdad pagan: free × conversión × (1 − haircut).
 * Se redondea hacia ABAJO: no existe medio usuario pagando, y así no inflamos el ingreso.
 */
export function usuariosPagando(usuariosFree: number, conversion: number, haircut: number): number {
  return Math.max(0, Math.floor(usuariosFree * conversion * (1 - haircut) + EPS));
}

export function costoV1(s: Supuestos): number {
  return s.horasV1 * s.tarifaHoraV1;
}

export function costoV2(s: Supuestos): number {
  return costoV1(s) + s.proveedorWhatsAppV2;
}

export function simular(s: Supuestos) {
  const comision = comisionPorCobro(s.precio, s.comision);
  const neto = s.precio - comision;
  const pagando = usuariosPagando(s.usuariosFree, s.conversion, s.haircut);
  const ingresoMensual = pagando * neto;
  const v1 = costoV1(s);
  const v2 = costoV2(s);
  const eqV1 = usuariosParaCubrir(v1, neto);
  const eqV2 = usuariosParaCubrir(v2, neto);
  const meta = usuariosParaCubrir(s.metaMensual, neto);
  return {
    comision,
    neto,
    pagando,
    ingresoMensual,
    ingresoAnual: ingresoMensual * 12,
    costoV1: v1,
    costoV2: v2,
    /** v1 es manual: solo atiende hasta `cupoV1` usuarios que pagan. */
    caben: pagando <= s.cupoV1,
    resultadoV1: ingresoMensual - v1,
    resultadoV2: ingresoMensual - v2,
    equilibrioV1: { pagando: eqV1, free: freeNecesarios(eqV1, s.conversion, s.haircut) },
    equilibrioV2: { pagando: eqV2, free: freeNecesarios(eqV2, s.conversion, s.haircut) },
    meta: { pagando: meta, free: freeNecesarios(meta, s.conversion, s.haircut) },
  };
}
