'use client';

/**
 * "¿En qué se fue tu dinero?" — distribución de gastos del mes por categoría,
 * con barras simples ordenadas de mayor a menor. Fácil de leer de un vistazo.
 */
import { modos } from '@/lib/theme';
import { distribucionGastos } from '@/lib/analisis';
import { pesos } from '@/lib/format';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { Glass } from '../Glass';
import { Icono } from '../Icono';

export function Distribucion() {
  const { modo } = useModo();
  const tx = useTransacciones();
  const m = modos[modo];

  const { total, slices } = distribucionGastos(tx, modo);
  if (total === 0) return null; // sin gastos este mes: no mostramos nada

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-lg font-bold text-white/80">¿En qué se fue tu dinero?</h2>
      <Glass className="flex flex-col gap-4 p-5">
        {slices.map((s) => (
          <div key={s.categoriaId} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Icono nombre={s.icono} size={18} />
              <span className="flex-1 font-semibold">{s.nombre}</span>
              <span className="text-sm text-white/55">{Math.round(s.pct * 100)}%</span>
              <span className="w-20 text-right font-bold tabular-nums">{pesos(s.total)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(4, s.pct * 100)}%`, background: m.acento, transition: 'width 0.5s ease-out' }}
              />
            </div>
          </div>
        ))}
      </Glass>
    </section>
  );
}
