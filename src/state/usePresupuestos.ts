'use client';

import { useSyncExternalStore } from 'react';
import { presupuestoStore, type Presupuestos } from '@/lib/presupuestos';

export function usePresupuestos(): Presupuestos {
  return useSyncExternalStore(
    presupuestoStore.subscribe,
    presupuestoStore.getSnapshot,
    presupuestoStore.getServerSnapshot
  );
}

export { presupuestoStore } from '@/lib/presupuestos';
