'use client';

/**
 * Saldo en caja: el dinero acumulado que NUNCA se reinicia al cambiar de mes
 * (el saldo final de un mes es el inicial del siguiente). Con acceso directo
 * al historial mensual, como una libreta de caja.
 */
import { useMemo, useState } from 'react';
import { modos } from '@/lib/theme';
import { saldoActual } from '@/lib/analisis';
import { pesos } from '@/lib/format';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { useIngresoFijo } from '@/state/useIngresoFijo';
import { Glass } from './Glass';
import { Icono } from './Icono';
import { SheetHistorial } from './SheetHistorial';

export function SaldoCaja() {
  const { modo } = useModo();
  const m = modos[modo];
  const tx = useTransacciones();
  const ingresoFijo = useIngresoFijo();
  const [historialAbierto, setHistorialAbierto] = useState(false);

  const saldo = useMemo(() => saldoActual(tx, modo, ingresoFijo), [tx, modo, ingresoFijo]);

  return (
    <>
      <Glass className="flex items-center gap-3 p-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: m.suave, color: m.acento }}
        >
          <Icono nombre="Landmark" size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-white/55">Saldo en caja</p>
          <p
            className="text-3xl font-extrabold tabular-nums"
            style={{ color: saldo >= 0 ? 'var(--color-bien)' : 'var(--color-cuidado)' }}
          >
            {pesos(saldo)}
          </p>
        </div>
        <button
          onClick={() => setHistorialAbierto(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold"
        >
          <Icono nombre="History" size={16} />
          Historial
        </button>
      </Glass>

      {historialAbierto && <SheetHistorial onClose={() => setHistorialAbierto(false)} />}
    </>
  );
}
