'use client';

/**
 * Historial por meses: una tarjeta por mes (entró, salió y balance del mes)
 * y, al tocarla, el detalle completo de movimientos. Cada mes es un corte
 * independiente que empieza en $0; nada se borra nunca.
 */
import { useMemo, useState } from 'react';
import { modos } from '@/lib/theme';
import { historialMensual, type PeriodoMes } from '@/lib/analisis';
import { categoriaPorId } from '@/lib/store';
import { pesos, fechaCorta } from '@/lib/format';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { useIngresoFijo } from '@/state/useIngresoFijo';
import { Icono } from './Icono';

export function SheetHistorial({ onClose }: { onClose: () => void }) {
  const { modo } = useModo();
  const m = modos[modo];
  const tx = useTransacciones();
  const ingresoFijo = useIngresoFijo();
  const [abierto, setAbierto] = useState<string | null>(null); // clave del mes expandido

  const periodos = useMemo(() => historialMensual(tx, modo, ingresoFijo), [tx, modo, ingresoFijo]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/70" />

      {/* Superficie oscura cohesiva (legible también en iPhone). */}
      <div
        className="relative mx-auto flex h-full w-full max-w-md flex-col"
        style={{
          background: 'rgba(16, 11, 8, 0.85)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        }}
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-5 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: m.acento, color: '#1a120c' }}
          >
            <Icono nombre="History" size={22} />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold">Historial de {m.nombre.toLowerCase()}</h2>
            <p className="text-sm text-white/55">Cada mes tiene su propio corte</p>
          </div>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icono nombre="X" size={20} />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 pb-[max(24px,env(safe-area-inset-bottom))]">
          {periodos.map((p) => (
            <TarjetaMes
              key={p.clave}
              p={p}
              acento={m.acento}
              expandido={abierto === p.clave}
              onToggle={() => setAbierto(abierto === p.clave ? null : p.clave)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TarjetaMes({
  p,
  acento,
  expandido,
  onToggle,
}: {
  p: PeriodoMes;
  acento: string;
  expandido: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/6" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <button onClick={onToggle} className="flex w-full flex-col gap-3 p-4 text-left" aria-expanded={expandido}>
        <div className="flex items-center gap-2">
          <span className="flex-1 font-bold capitalize">
            {p.nombre}
            {p.esActual && (
              <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: acento, color: '#1a120c' }}>
                En curso
              </span>
            )}
          </span>
          <span style={{ transform: expandido ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s var(--ease-suave)' }}>
            <Icono nombre="ChevronDown" size={18} />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[15px]">
          <Cifra etiqueta="Entró" valor={pesos(p.ingresos)} color="var(--color-bien)" />
          <Cifra etiqueta="Salió" valor={pesos(p.gastos)} />
          <Cifra
            etiqueta="Balance"
            valor={pesos(p.balance)}
            color={p.balance >= 0 ? 'var(--color-bien)' : 'var(--color-cuidado)'}
            fuerte
          />
        </div>
      </button>

      {expandido && (
        <div className="aparecer border-t border-white/10 px-4 py-3">
          {p.movimientos.length === 0 ? (
            <p className="py-2 text-center text-sm text-white/50">Sin movimientos anotados este mes.</p>
          ) : (
            <div className="divide-y divide-white/8">
              {p.movimientos.map((t) => {
                const cat = categoriaPorId(t.categoriaId);
                const ingreso = t.tipo === 'INGRESO';
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2.5">
                    <Icono nombre={cat?.icono ?? 'Ellipsis'} size={18} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">
                        {cat?.nombre ?? 'Movimiento'}
                        {t.beneficiario ? ` · ${t.beneficiario}` : ''}
                      </p>
                      <p className="text-xs text-white/50">{fechaCorta(t.fecha)}</p>
                    </div>
                    <span
                      className="shrink-0 font-bold tabular-nums"
                      style={{ color: ingreso ? 'var(--color-bien)' : '#fff' }}
                    >
                      {ingreso ? '+' : '−'}
                      {pesos(t.monto)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Cifra({ etiqueta, valor, color = '#fff', fuerte = false }: { etiqueta: string; valor: string; color?: string; fuerte?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-white/55">{etiqueta}</span>
      <span className={`tabular-nums ${fuerte ? 'font-extrabold' : 'font-semibold'}`} style={{ color }}>
        {valor}
      </span>
    </div>
  );
}
