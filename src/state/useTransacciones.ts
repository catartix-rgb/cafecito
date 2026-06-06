'use client';

/**
 * Hook reactivo sobre el store de transacciones. Cualquier componente que lo
 * use se vuelve a renderizar automáticamente al agregar o borrar un movimiento.
 */
import { useSyncExternalStore } from 'react';
import { store, type Transaccion } from '@/lib/store';

export function useTransacciones(): Transaccion[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export { store } from '@/lib/store';
