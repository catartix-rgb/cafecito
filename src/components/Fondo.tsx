'use client';

import { modos } from '@/lib/theme';
import { useModo } from '@/state/mode';

/** Fondo de pantalla completa con el gradiente del modo actual. */
export function Fondo() {
  const { modo } = useModo();
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 transition-[background] duration-700 ease-out"
      style={{ background: modos[modo].gradiente }}
    />
  );
}
