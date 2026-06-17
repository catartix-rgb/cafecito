'use client';

/**
 * Resumen de la Tienda: ganancia estimada (con cambio entre hoy / semana / mes),
 * ventas, gastos y dinero invertido en mercancía. Sencillo y muy visual.
 */
import { useState } from 'react';
import { modos } from '@/lib/theme';
import { resumenPeriodo, invertidoEnInventario, type Periodo } from '@/lib/analisis';
import { pesos } from '@/lib/format';
import { useTransacciones } from '@/state/useTransacciones';
import { Glass } from '../Glass';
import { Icono } from '../Icono';

const PERIODOS: { id: Periodo; etiqueta: string; deLabel: string }[] = [
  { id: 'dia', etiqueta: 'Hoy', deLabel: 'de hoy' },
  { id: 'semana', etiqueta: 'Semana', deLabel: 'de la semana' },
  { id: 'mes', etiqueta: 'Mes', deLabel: 'del mes' },
];

export function TiendaResumen() {
  const tx = useTransacciones();
  const m = modos.TIENDA;
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  const r = resumenPeriodo(tx, 'TIENDA', periodo);
  const invertido = invertidoEnInventario(tx, 'TIENDA');
  const deLabel = PERIODOS.find((p) => p.id === periodo)!.deLabel;

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle de periodo */}
      <div className="glass flex gap-1 rounded-full p-1">
        {PERIODOS.map((p) => {
          const activo = p.id === periodo;
          return (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className="flex-1 rounded-full py-2.5 text-sm font-bold transition-all"
              style={{ background: activo ? m.acento : 'transparent', color: activo ? '#1a120c' : 'rgba(255,255,255,0.7)' }}
            >
              {p.etiqueta}
            </button>
          );
        })}
      </div>

      {/* Ganancia estimada */}
      <Glass className="flex flex-col items-center gap-1 p-6 text-center aparecer">
        <span
          className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: m.suave, color: m.acento }}
        >
          <Icono nombre="Store" size={28} />
        </span>
        <p className="text-sm font-medium uppercase tracking-wide text-white/55">Ganancia {deLabel}</p>
        <p
          className="text-5xl font-extrabold tabular-nums"
          style={{ color: r.balance >= 0 ? 'var(--color-bien)' : 'var(--color-cuidado)' }}
        >
          {pesos(r.balance)}
        </p>
        <p className="text-sm text-white/50">Vendiste {pesos(r.ingresos)} y gastaste {pesos(r.gastos)}</p>
      </Glass>

      {/* Ventas / Gastos del periodo */}
      <div className="grid grid-cols-2 gap-4">
        <Glass className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Icono nombre="Tag" size={16} /> Ventas
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-bien)' }}>
            {pesos(r.ingresos)}
          </span>
        </Glass>
        <Glass className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Icono nombre="ArrowDownRight" size={16} /> Gastos
          </span>
          <span className="text-2xl font-bold tabular-nums">{pesos(r.gastos)}</span>
        </Glass>
      </div>

      {/* Dinero invertido en mercancía (histórico) */}
      <Glass className="flex items-center gap-3 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: m.suave }}>
          <Icono nombre="Package" size={20} />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Invertido en mercancía</p>
          <p className="text-sm text-white/55">Todo lo que has metido en inventario</p>
        </div>
        <span className="text-xl font-bold tabular-nums">{pesos(invertido)}</span>
      </Glass>
    </div>
  );
}
