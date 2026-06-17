'use client';

/** Hoja para abonar dinero a una meta de ahorro (o quitarla). */
import { useState } from 'react';
import { modos } from '@/lib/theme';
import { pesos } from '@/lib/format';
import { metasStore } from '@/state/useMetas';
import type { Meta } from '@/lib/metas';
import { Icono } from './Icono';
import { Teclado, aplicarTecla } from './Teclado';

export function SheetAbono({ meta, onClose }: { meta: Meta; onClose: () => void }) {
  const m = modos.PERSONAL;
  const [digitos, setDigitos] = useState('');
  const monto = parseInt(digitos || '0', 10);
  const pct = meta.objetivo > 0 ? Math.min(1, meta.ahorrado / meta.objetivo) : 0;

  function abonar() {
    if (monto <= 0) return;
    metasStore.abonar(meta.id, monto);
    onClose();
  }

  function quitar() {
    metasStore.eliminar(meta.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/50" />

      <div className="glass-fuerte subir relative mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-[32px] px-5 pb-8 pt-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{meta.nombre}</h2>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icono nombre="X" size={20} />
          </button>
        </div>

        {/* Progreso actual */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">
              Llevas {pesos(meta.ahorrado)} de {pesos(meta.objetivo)}
            </span>
            <span className="font-bold" style={{ color: m.acento }}>
              {Math.round(pct * 100)}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: m.acento }} />
          </div>
        </div>

        <div className="py-1 text-center">
          <p className="mb-1 text-sm text-white/55">¿Cuánto vas a apartar ahora?</p>
          <span className="text-5xl font-extrabold tabular-nums" style={{ color: digitos ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            {pesos(monto)}
          </span>
        </div>

        <Teclado onTecla={(t) => setDigitos((d) => aplicarTecla(d, t))} />

        <button
          onClick={abonar}
          disabled={monto <= 0}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-full text-xl font-extrabold transition-all disabled:opacity-50"
          style={{ background: m.acento, color: '#1a120c' }}
        >
          {monto > 0 && <Icono nombre="Check" size={24} />}
          {monto > 0 ? 'Apartar a esta meta' : 'Escribe el monto'}
        </button>

        <button onClick={quitar} className="text-center text-white/60 underline-offset-4 hover:underline">
          Quitar esta meta
        </button>
      </div>
    </div>
  );
}
