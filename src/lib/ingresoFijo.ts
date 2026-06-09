/**
 * Ingreso fijo mensual del hogar (sueldo / pensión / renta que entra cada mes).
 * Es un solo número para la parte "Casa" (PERSONAL). Persiste en localStorage,
 * es reactivo y se suma a los ingresos del mes en los cálculos.
 */

const CLAVE = 'cafecito.ingresoFijo.v1';

let cache: number | null = null;
const oyentes = new Set<() => void>();

function cargar(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const n = crudo ? Number(JSON.parse(crudo)) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export const ingresoFijoStore = {
  subscribe(oyente: () => void): () => void {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
  },
  getSnapshot(): number {
    if (cache === null) cache = cargar();
    return cache;
  },
  getServerSnapshot(): number {
    return 0;
  },
  fijar(monto: number) {
    cache = monto > 0 ? monto : 0;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CLAVE, JSON.stringify(cache));
    }
    oyentes.forEach((fn) => fn());
  },
};
