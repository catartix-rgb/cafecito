'use client';

/**
 * Hoja para registrar/editar el ingreso fijo mensual del hogar (sueldo).
 * Se suma a los ingresos del mes en la parte "Casa".
 */
import { useState } from 'react';
import { modos } from '@/lib/theme';
import { pesos } from '@/lib/format';
import { ingresoFijoStore, useIngresoFijo } from '@/state/useIngresoFijo';
import { Icono } from './Icono';
import { Teclado, aplicarTecla } from './Teclado';

export function SheetSueldo({ onClose }: { onClose: () => void }) {
  // El sueldo es de la casa; usamos el acento "personal".
  const m = modos.PERSONAL;
  const actual = useIngresoFijo();

  const [digitos, setDigitos] = useState('');
  const monto = parseInt(digitos || '0', 10);

  function guardar() {
    if (monto <= 0) return;
    ingresoFijoStore.fijar(monto);
    onClose();
  }

  function quitar() {
    ingresoFijoStore.fijar(0);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/50" />

      <div className="glass-fuerte subir relative mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-[32px] px-5 pb-8 pt-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Ingreso del hogar</h2>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icono nombre="X" size={20} />
          </button>
        </div>

        <p className="-mt-1 text-white/60">¿Cuánto dinero entra fijo cada mes? (sueldo, pensión, renta…)</p>

        <div className="py-2 text-center">
          <span
            className="text-6xl font-extrabold tabular-nums"
            style={{ color: digitos ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            {pesos(monto)}
          </span>
          {actual > 0 && !digitos && (
            <p className="mt-1 text-sm text-white/50">Ahora mismo: {pesos(actual)} al mes</p>
          )}
        </div>

        <Teclado onTecla={(t) => setDigitos((d) => aplicarTecla(d, t))} />

        <button
          onClick={guardar}
          disabled={monto <= 0}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-full text-xl font-extrabold transition-all disabled:opacity-50"
          style={{ background: m.acento, color: '#1a120c' }}
        >
          {monto > 0 && <Icono nombre="Check" size={24} />}
          {monto > 0 ? 'Guardar' : 'Escribe el monto'}
        </button>

        {actual > 0 && (
          <button onClick={quitar} className="text-center text-white/60 underline-offset-4 hover:underline">
            Quitar ingreso fijo
          </button>
        )}
      </div>
    </div>
  );
}
