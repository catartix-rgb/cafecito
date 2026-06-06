/**
 * Almacén de transacciones de Cafecito.
 * --------------------------------------
 * Persiste en localStorage (estructurado y versionado) y notifica a los
 * componentes cuando cambia, para que la interfaz reaccione al instante.
 * El hook React vive en `src/state/useTransacciones.ts`.
 */
import type { Modo } from './theme';

export type Tipo = 'GASTO' | 'INGRESO';

export type Categoria = {
  id: string;
  nombre: string;
  modo: Modo;
  tipo: Tipo;
  icono: string; // nombre de ícono Lucide
  esHormiga?: boolean; // "gasto hormiga"/antojo (para el Contador Virtual)
  pideBeneficiario?: boolean; // si true, el registro pregunta para quién (ej. hijos)
};

export type Transaccion = {
  id: string;
  monto: number; // siempre positivo
  tipo: Tipo;
  modo: Modo;
  categoriaId: string;
  beneficiario?: string; // para "Apoyo familiar": a quién se le dio (Pablo / Alex)
  nota?: string;
  fecha: string; // ISO
};

/** Personas a las que se les puede asignar el apoyo familiar. */
export const BENEFICIARIOS = ['Pablo', 'Alex'] as const;

/** Categorías predefinidas. El `tipo` de la categoría define si suma o resta. */
export const CATEGORIAS: Categoria[] = [
  // NEGOCIO
  { id: 'ventas', nombre: 'Ventas', modo: 'NEGOCIO', tipo: 'INGRESO', icono: 'Coffee' },
  { id: 'insumos', nombre: 'Insumos', modo: 'NEGOCIO', tipo: 'GASTO', icono: 'Package' },
  { id: 'servicios', nombre: 'Servicios', modo: 'NEGOCIO', tipo: 'GASTO', icono: 'Zap' },
  { id: 'otro-negocio', nombre: 'Otro', modo: 'NEGOCIO', tipo: 'GASTO', icono: 'Ellipsis' },
  // PERSONAL
  { id: 'super', nombre: 'Súper', modo: 'PERSONAL', tipo: 'GASTO', icono: 'ShoppingCart' },
  { id: 'antojos', nombre: 'Antojos', modo: 'PERSONAL', tipo: 'GASTO', icono: 'Candy', esHormiga: true },
  { id: 'salidas', nombre: 'Salidas', modo: 'PERSONAL', tipo: 'GASTO', icono: 'Utensils' },
  { id: 'apoyo', nombre: 'Hijos', modo: 'PERSONAL', tipo: 'GASTO', icono: 'HandCoins', pideBeneficiario: true },
  { id: 'ingreso', nombre: 'Ingreso', modo: 'PERSONAL', tipo: 'INGRESO', icono: 'Wallet' },
];

export function categoriasDe(modo: Modo): Categoria[] {
  return CATEGORIAS.filter((c) => c.modo === modo);
}

export function categoriaPorId(id: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}

// --- Persistencia + reactividad -------------------------------------------

const CLAVE = 'cafecito.transacciones.v1';
const VACIO: Transaccion[] = []; // referencia estable para SSR

let cache: Transaccion[] | null = null;
const oyentes = new Set<() => void>();

function cargar(): Transaccion[] {
  if (typeof window === 'undefined') return VACIO;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos = crudo ? (JSON.parse(crudo) as Transaccion[]) : [];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function persistir(datos: Transaccion[]) {
  cache = datos;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CLAVE, JSON.stringify(datos));
  }
  oyentes.forEach((fn) => fn());
}

/** API del store (consumida por useSyncExternalStore). */
export const store = {
  subscribe(oyente: () => void): () => void {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
  },
  getSnapshot(): Transaccion[] {
    if (cache === null) cache = cargar();
    return cache;
  },
  getServerSnapshot(): Transaccion[] {
    return VACIO;
  },
  agregar(entrada: Omit<Transaccion, 'id' | 'fecha'>): Transaccion {
    const actuales = store.getSnapshot();
    const nueva: Transaccion = {
      ...entrada,
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : String(Date.now() + Math.random()),
      fecha: new Date().toISOString(),
    };
    persistir([nueva, ...actuales]);
    return nueva;
  },
  eliminar(id: string) {
    persistir(store.getSnapshot().filter((t) => t.id !== id));
  },
};
