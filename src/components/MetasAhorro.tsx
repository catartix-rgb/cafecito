'use client';

/**
 * Metas de ahorro: lista de metas con barra de progreso y % completado.
 * Tocar una meta abre el abono; el botón de abajo crea una meta nueva.
 * Maneja sus propias hojas para no recargar el orquestador.
 */
import { useState } from 'react';
import { modos } from '@/lib/theme';
import { pesos } from '@/lib/format';
import { useMetas } from '@/state/useMetas';
import type { Meta } from '@/lib/metas';
import { Glass } from './Glass';
import { Icono } from './Icono';
import { SheetNuevaMeta } from './SheetNuevaMeta';
import { SheetAbono } from './SheetAbono';

export function MetasAhorro() {
  const metas = useMetas();
  const m = modos.PERSONAL;
  const [creando, setCreando] = useState(false);
  const [abonando, setAbonando] = useState<Meta | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-lg font-bold text-white/80">Metas de ahorro</h2>

      {metas.map((meta) => {
        const pct = meta.objetivo > 0 ? Math.min(1, meta.ahorrado / meta.objetivo) : 0;
        const completada = meta.ahorrado >= meta.objetivo;
        return (
          <button
            key={meta.id}
            onClick={() => setAbonando(meta)}
            className="glass flex flex-col gap-2 rounded-3xl p-4 text-left transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Icono nombre={completada ? 'Check' : 'PiggyBank'} size={20} style={{ color: m.acento }} />
              <span className="flex-1 font-bold">{meta.nombre}</span>
              <span className="text-sm font-bold" style={{ color: m.acento }}>
                {Math.round(pct * 100)}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: m.acento, transition: 'width 0.5s ease-out' }} />
            </div>
            <p className="text-sm text-white/55">
              {completada ? '¡Meta cumplida! ' : ''}
              {pesos(meta.ahorrado)} de {pesos(meta.objetivo)}
            </p>
          </button>
        );
      })}

      <button
        onClick={() => setCreando(true)}
        className="glass flex items-center justify-center gap-2 rounded-3xl p-4 font-semibold text-white/80 transition-transform active:scale-[0.99]"
      >
        <Icono nombre="Plus" size={20} /> {metas.length === 0 ? 'Crear una meta de ahorro' : 'Nueva meta'}
      </button>

      {creando && <SheetNuevaMeta onClose={() => setCreando(false)} />}
      {abonando && <SheetAbono meta={abonando} onClose={() => setAbonando(null)} />}
    </section>
  );
}
