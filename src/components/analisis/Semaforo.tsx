'use client';

/**
 * Semáforo financiero del dashboard: verde / amarillo / rojo según tendencias
 * reales (gasto vs ingreso, vs meta, vs el ritmo del mes pasado). Al tocarlo,
 * explica brevemente por qué está en ese estado.
 */
import { useState } from 'react';
import { semaforo, type EstadoSemaforo } from '@/lib/analisis';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { usePresupuestos } from '@/state/usePresupuestos';
import { useIngresoFijo } from '@/state/useIngresoFijo';
import { Icono } from '../Icono';

const COLOR: Record<EstadoSemaforo, string> = {
  BIEN: 'var(--color-bien)',
  OJO: 'var(--color-ojo)',
  CUIDADO: 'var(--color-cuidado)',
};

export function Semaforo() {
  const { modo } = useModo();
  const tx = useTransacciones();
  const presupuestos = usePresupuestos();
  const ingresoFijo = useIngresoFijo();
  const [abierto, setAbierto] = useState(false);

  const s = semaforo(tx, modo, presupuestos, ingresoFijo);
  const color = COLOR[s.estado];

  return (
    <button
      onClick={() => setAbierto((v) => !v)}
      aria-expanded={abierto}
      className="glass flex w-full flex-col gap-2 rounded-3xl p-4 text-left transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <span
          className="h-5 w-5 shrink-0 rounded-full"
          style={{ background: color, boxShadow: `0 0 14px ${color}` }}
        />
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">Cómo vas</p>
          <p className="text-lg font-extrabold" style={{ color }}>
            {s.titulo}
          </p>
        </div>
        <span style={{ transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <Icono nombre="ChevronDown" size={20} />
        </span>
      </div>
      {abierto && <p className="aparecer leading-relaxed text-white/85">{s.razon}</p>}
    </button>
  );
}
