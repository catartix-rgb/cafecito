'use client';

import { useSyncExternalStore } from 'react';
import { ingresoFijoStore } from '@/lib/ingresoFijo';

/** Ingreso fijo mensual del hogar (0 si no se ha configurado). */
export function useIngresoFijo(): number {
  return useSyncExternalStore(
    ingresoFijoStore.subscribe,
    ingresoFijoStore.getSnapshot,
    ingresoFijoStore.getServerSnapshot
  );
}

export { ingresoFijoStore } from '@/lib/ingresoFijo';
