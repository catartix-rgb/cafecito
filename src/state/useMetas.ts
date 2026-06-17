'use client';

import { useSyncExternalStore } from 'react';
import { metasStore, type Meta } from '@/lib/metas';

export function useMetas(): Meta[] {
  return useSyncExternalStore(metasStore.subscribe, metasStore.getSnapshot, metasStore.getServerSnapshot);
}

export { metasStore } from '@/lib/metas';
