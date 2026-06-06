/**
 * Presupuestos mensuales de gasto, uno por modo ("Mi casa" / "El negocio").
 * Es la meta contra la que se llena la taza. Persiste en localStorage y es
 * reactivo (mismo patrón que el store de transacciones).
 */
import type { Modo } from './theme';

export type Presupuestos = Partial<Record<Modo, number>>;

const CLAVE = 'cafecito.presupuestos.v1';
const VACIO: Presupuestos = {};

let cache: Presupuestos | null = null;
const oyentes = new Set<() => void>();

function cargar(): Presupuestos {
  if (typeof window === 'undefined') return VACIO;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos = crudo ? (JSON.parse(crudo) as Presupuestos) : {};
    return datos && typeof datos === 'object' ? datos : {};
  } catch {
    return {};
  }
}

export const presupuestoStore = {
  subscribe(oyente: () => void): () => void {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
  },
  getSnapshot(): Presupuestos {
    if (cache === null) cache = cargar();
    return cache;
  },
  getServerSnapshot(): Presupuestos {
    return VACIO;
  },
  fijar(modo: Modo, monto: number) {
    const actual = presupuestoStore.getSnapshot();
    const siguiente: Presupuestos = { ...actual };
    if (monto > 0) siguiente[modo] = monto;
    else delete siguiente[modo];
    cache = siguiente;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    }
    oyentes.forEach((fn) => fn());
  },
};
