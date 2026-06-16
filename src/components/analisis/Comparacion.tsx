'use client';

/**
 * "Comparado con el mes pasado" — mensajes simples de cuánto subió o bajó cada
 * categoría y cómo va el ahorro. Pensado para entenderse de un vistazo.
 */
import { comparacionMensual, type CambioCategoria } from '@/lib/analisis';
import { pesos } from '@/lib/format';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { useIngresoFijo } from '@/state/useIngresoFijo';
import { Glass } from '../Glass';
import { Icono } from '../Icono';

export function Comparacion() {
  const { modo } = useModo();
  const tx = useTransacciones();
  const ingresoFijo = useIngresoFijo();

  const comp = comparacionMensual(tx, modo, ingresoFijo);
  if (!comp.hayMesPasado) return null; // sin mes pasado, no hay con qué comparar

  const cambios = comp.cambios
    .filter((c) => c.dir !== 'igual' && (c.esteMes > 0 || c.mesPasado > 0))
    .slice(0, 4);

  // Ahorro: solo mostramos % si el mes pasado se ahorró algo positivo.
  let ahorroLinea: { texto: string; bien: boolean } | null = null;
  if (comp.ahorroPasado > 0) {
    const pct = Math.round(((comp.ahorroEste - comp.ahorroPasado) / comp.ahorroPasado) * 100);
    if (pct >= 5) ahorroLinea = { texto: `Tu ahorro mejoró ${pct}% respecto al mes pasado.`, bien: true };
    else if (pct <= -5) ahorroLinea = { texto: `Tu ahorro bajó ${Math.abs(pct)}% respecto al mes pasado.`, bien: false };
  }

  if (cambios.length === 0 && !ahorroLinea) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-lg font-bold text-white/80">Comparado con el mes pasado</h2>
      <Glass className="flex flex-col divide-y divide-white/10 p-0">
        {ahorroLinea && (
          <Linea
            icono="PiggyBank"
            color={ahorroLinea.bien ? 'var(--color-bien)' : 'var(--color-cuidado)'}
            texto={ahorroLinea.texto}
          />
        )}
        {cambios.map((c) => (
          <Linea key={c.categoriaId} {...lineaDeCambio(c)} />
        ))}
      </Glass>
    </section>
  );
}

function lineaDeCambio(c: CambioCategoria): { icono: string; color: string; texto: string } {
  if (c.dir === 'nuevo') {
    return { icono: 'Sparkles', color: 'var(--color-ojo)', texto: `Nuevo este mes: ${c.nombre} (${pesos(c.esteMes)}).` };
  }
  const pct = Math.abs(Math.round((c.pct ?? 0) * 100));
  if (c.dir === 'mas') {
    return { icono: 'TrendingUp', color: 'var(--color-cuidado)', texto: `Gastaste ${pct}% más en ${c.nombre} (${pesos(c.esteMes)}).` };
  }
  return { icono: 'TrendingDown', color: 'var(--color-bien)', texto: `Gastaste ${pct}% menos en ${c.nombre} (${pesos(c.esteMes)}).` };
}

function Linea({ icono, color, texto }: { icono: string; color: string; texto: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10" style={{ color }}>
        <Icono nombre={icono} size={18} />
      </span>
      <p className="flex-1 text-white/90">{texto}</p>
    </div>
  );
}
