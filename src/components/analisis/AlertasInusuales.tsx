'use client';

/**
 * Alertas amigables de gastos inusuales: un gasto del mes muy por encima del
 * promedio histórico de su categoría. Detección simple por comparación.
 */
import { gastosInusuales } from '@/lib/analisis';
import { pesos } from '@/lib/format';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { Glass } from '../Glass';
import { Icono } from '../Icono';

export function AlertasInusuales() {
  const { modo } = useModo();
  const tx = useTransacciones();

  const alertas = gastosInusuales(tx, modo);
  if (alertas.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-lg font-bold text-white/80">Gastos para revisar</h2>
      {alertas.map((a) => (
        <Glass key={a.id} className="flex gap-3 p-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(240,191,76,0.15)', color: 'var(--color-ojo)' }}
          >
            <Icono nombre="TriangleAlert" size={20} />
          </span>
          <p className="flex-1 leading-relaxed text-white/90">
            Este gasto de <span className="font-bold">{pesos(a.monto)}</span> en {a.nombre} es bastante mayor a tu
            promedio (~{pesos(a.promedio)}). ¿Quieres revisarlo?
          </p>
        </Glass>
      ))}
    </section>
  );
}
