/**
 * Metas de ahorro simples: nombre, cantidad objetivo y cuánto se lleva ahorrado.
 * El progreso se lleva a mano ("abonar"), sin planeación financiera compleja.
 * Persiste en localStorage y es reactivo (mismo patrón que las transacciones).
 */

export type Meta = {
  id: string;
  nombre: string;
  objetivo: number; // cuánto se quiere juntar
  ahorrado: number; // cuánto se lleva
};

const CLAVE = 'cafecito.metas.v1';
const VACIO: Meta[] = [];

let cache: Meta[] | null = null;
const oyentes = new Set<() => void>();

function cargar(): Meta[] {
  if (typeof window === 'undefined') return VACIO;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos = crudo ? (JSON.parse(crudo) as Meta[]) : [];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function persistir(datos: Meta[]) {
  cache = datos;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CLAVE, JSON.stringify(datos));
  }
  oyentes.forEach((fn) => fn());
}

function nuevoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

export const metasStore = {
  subscribe(oyente: () => void): () => void {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
  },
  getSnapshot(): Meta[] {
    if (cache === null) cache = cargar();
    return cache;
  },
  getServerSnapshot(): Meta[] {
    return VACIO;
  },
  crear(nombre: string, objetivo: number) {
    const meta: Meta = { id: nuevoId(), nombre: nombre.trim() || 'Mi meta', objetivo, ahorrado: 0 };
    persistir([...metasStore.getSnapshot(), meta]);
  },
  /** Suma un abono al ahorrado (no baja de 0). */
  abonar(id: string, monto: number) {
    persistir(
      metasStore.getSnapshot().map((m) =>
        m.id === id ? { ...m, ahorrado: Math.max(0, m.ahorrado + monto) } : m
      )
    );
  },
  eliminar(id: string) {
    persistir(metasStore.getSnapshot().filter((m) => m.id !== id));
  },
};
