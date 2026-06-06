'use client';

/**
 * Hoja para fijar la meta de gasto del mes (presupuesto) del modo activo.
 * La taza del tablero se llenará contra esta meta.
 */
import { useState } from 'react';
import { modos } from '@/lib/theme';
import { pesos } from '@/lib/format';
import { useModo } from '@/state/mode';
import { presupuestoStore, usePresupuestos } from '@/state/usePresupuestos';
import { Icono } from './Icono';
import { Teclado, aplicarTecla } from './Teclado';

export function SheetMeta({ onClose }: { onClose: () => void }) {
  const { modo } = useModo();
  const m = modos[modo];
  const presupuestos = usePresupuestos();
  const actual = presupuestos[modo] ?? 0;

  const [digitos, setDigitos] = useState('');
  const monto = parseInt(digitos || '0', 10);

  function guardar() {
    if (monto <= 0) return;
    presupuestoStore.fijar(modo, monto);
    onClose();
  }

  function quitar() {
    presupuestoStore.fijar(modo, 0);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/50" />

      <div className="glass-fuerte subir relative mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-[32px] px-5 pb-8 pt-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Meta de {m.nombre.toLowerCase()}</h2>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icono nombre="X" size={20} />
          </button>
        </div>

        <p className="-mt-1 text-white/60">¿Cuánto quieres gastar este mes como máximo?</p>

        <div className="py-2 text-center">
          <span
            className="text-6xl font-extrabold tabular-nums"
            style={{ color: digitos ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            {pesos(monto)}
          </span>
          {actual > 0 && !digitos && (
            <p className="mt-1 text-sm text-white/50">Meta actual: {pesos(actual)}</p>
          )}
        </div>

        <Teclado onTecla={(t) => setDigitos((d) => aplicarTecla(d, t))} />

        <button
          onClick={guardar}
          disabled={monto <= 0}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-full text-xl font-extrabold transition-all disabled:opacity-40"
          style={{ background: m.acento, color: '#1a120c' }}
        >
          <Icono nombre="Check" size={24} /> Guardar meta
        </button>

        {actual > 0 && (
          <button onClick={quitar} className="text-center text-white/60 underline-offset-4 hover:underline">
            Quitar meta
          </button>
        )}
      </div>
    </div>
  );
}
