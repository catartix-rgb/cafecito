'use client';

/**
 * Tablero de Inicio. Lee las transacciones reales del modo activo y se
 * actualiza al instante cuando se agrega un movimiento (reactividad).
 */
import { useMemo } from 'react';
import { modos } from '@/lib/theme';
import { categoriaPorId } from '@/lib/store';
import { resumenDelMes } from '@/lib/analisis';
import { pesos, fechaCorta } from '@/lib/format';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { SwitchDosCaras } from '../SwitchDosCaras';
import { TazaGauge } from '../TazaGauge';
import { Glass } from '../Glass';
import { Icono } from '../Icono';

export function Inicio() {
  const { modo } = useModo();
  const transacciones = useTransacciones();
  const m = modos[modo];

  const resumen = useMemo(() => resumenDelMes(transacciones, modo), [transacciones, modo]);

  const recientes = useMemo(
    () => transacciones.filter((t) => t.modo === modo).slice(0, 4),
    [transacciones, modo]
  );

  // La taza se llena según cuánto se ha gastado de lo que entró este mes.
  const pct =
    resumen.ingresos > 0
      ? resumen.gastos / resumen.ingresos
      : resumen.gastos > 0
        ? 1
        : 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-10 pb-40">
      <header>
        <h1 className="text-3xl font-extrabold">Hola, ma</h1>
        <p className="mt-1 text-lg text-white/60">Así va tu mes</p>
      </header>

      <SwitchDosCaras />

      {/* Hero: la taza + balance del mes */}
      <Glass className="flex flex-col items-center gap-2 p-6 text-center aparecer">
        <TazaGauge pct={pct} accent={m.acento} />
        <p className="text-sm font-medium uppercase tracking-wide text-white/55">
          Balance de {m.nombre.toLowerCase()} este mes
        </p>
        <p
          className="text-5xl font-extrabold tabular-nums"
          style={{ color: resumen.balance >= 0 ? 'var(--color-bien)' : 'var(--color-cuidado)' }}
        >
          {pesos(resumen.balance)}
        </p>
      </Glass>

      {/* Dos tarjetas: entró / salió */}
      <div className="grid grid-cols-2 gap-4">
        <Glass className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Icono nombre="ArrowUpRight" size={16} /> Entró
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-bien)' }}>
            {pesos(resumen.ingresos)}
          </span>
        </Glass>
        <Glass className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Icono nombre="ArrowDownRight" size={16} /> Salió
          </span>
          <span className="text-2xl font-bold tabular-nums">{pesos(resumen.gastos)}</span>
        </Glass>
      </div>

      {/* Movimientos recientes */}
      <section className="flex flex-col gap-3">
        <h2 className="px-1 text-lg font-bold text-white/80">Últimos movimientos</h2>
        {recientes.length === 0 ? (
          <Glass className="p-6 text-center text-white/60">
            Todavía no hay nada aquí. Toca el botón <span className="font-bold text-white">+</span> para anotar el
            primero.
          </Glass>
        ) : (
          <Glass className="divide-y divide-white/10 overflow-hidden p-0">
            {recientes.map((t) => {
              const cat = categoriaPorId(t.categoriaId);
              const ingreso = t.tipo === 'INGRESO';
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: m.suave }}
                  >
                    <Icono nombre={cat?.icono ?? 'Ellipsis'} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{cat?.nombre ?? 'Movimiento'}</p>
                    <p className="text-sm text-white/50">{fechaCorta(t.fecha)}</p>
                  </div>
                  <span
                    className="shrink-0 text-lg font-bold tabular-nums"
                    style={{ color: ingreso ? 'var(--color-bien)' : '#fff' }}
                  >
                    {ingreso ? '+' : '−'}
                    {pesos(t.monto)}
                  </span>
                </div>
              );
            })}
          </Glass>
        )}
      </section>
    </div>
  );
}
