'use client';

/**
 * Tablero de Inicio. Lee transacciones y presupuesto del modo activo y se
 * actualiza al instante. La taza se "vacía" conforme se gasta de la meta.
 */
import { useMemo } from 'react';
import { modos } from '@/lib/theme';
import { categoriaPorId, type Transaccion } from '@/lib/store';
import { resumenDelMes } from '@/lib/analisis';
import { pesos, fechaCorta } from '@/lib/format';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { usePresupuestos } from '@/state/usePresupuestos';
import { useIngresoFijo } from '@/state/useIngresoFijo';
import { SwitchDosCaras } from '../SwitchDosCaras';
import { TazaGauge } from '../TazaGauge';
import { TiendaResumen } from './TiendaResumen';
import { Glass } from '../Glass';
import { Icono } from '../Icono';
import { Semaforo } from '../analisis/Semaforo';
import { Distribucion } from '../analisis/Distribucion';
import { Comparacion } from '../analisis/Comparacion';
import { AlertasInusuales } from '../analisis/AlertasInusuales';
import { MetasAhorro } from '../MetasAhorro';

export function Inicio({
  onEditarMeta,
  onEditarSueldo,
  onMovimiento,
}: {
  onEditarMeta: () => void;
  onEditarSueldo: () => void;
  onMovimiento: (t: Transaccion) => void;
}) {
  const { modo } = useModo();
  const transacciones = useTransacciones();
  const presupuestos = usePresupuestos();
  const ingresoFijo = useIngresoFijo();
  const m = modos[modo];

  const resumen = useMemo(() => resumenDelMes(transacciones, modo), [transacciones, modo]);
  const recientes = useMemo(
    () => transacciones.filter((t) => t.modo === modo).slice(0, 5),
    [transacciones, modo]
  );

  // El ingreso fijo del hogar solo aplica a "Casa" (PERSONAL) y se suma a lo que entró.
  const fijoAplicable = modo === 'PERSONAL' ? ingresoFijo : 0;
  const ingresosTot = resumen.ingresos + fijoAplicable;
  const balanceTot = ingresosTot - resumen.gastos;

  const meta = presupuestos[modo] ?? 0;
  const restante = meta - resumen.gastos;

  // Con meta: la taza llena = nada gastado, y se vacía al gastar.
  // Sin meta: la taza se llena con lo que ya se gastó de lo que entró.
  const pct =
    meta > 0
      ? Math.max(0, Math.min(1, restante / meta))
      : ingresosTot > 0
        ? resumen.gastos / ingresosTot
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

      {/* Semáforo financiero (tócalo para saber por qué) */}
      <Semaforo />

      {modo === 'TIENDA' ? (
        <TiendaResumen />
      ) : (
        <>
      {/* Hero: la taza + meta o balance del mes */}
      <Glass className="relative flex flex-col items-center gap-2 p-6 text-center aparecer">
        <button
          aria-label="Editar meta del mes"
          onClick={onEditarMeta}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <Icono nombre="Pencil" size={18} />
        </button>

        <TazaGauge pct={pct} accent={m.acento} />

        {meta > 0 ? (
          <>
            <p className="text-sm font-medium uppercase tracking-wide text-white/55">
              {restante >= 0 ? 'Te queda este mes' : 'Te pasaste de la meta'}
            </p>
            <p
              className="text-5xl font-extrabold tabular-nums"
              style={{ color: restante >= 0 ? 'var(--color-bien)' : 'var(--color-cuidado)' }}
            >
              {pesos(Math.abs(restante))}
            </p>
            <p className="text-sm text-white/50">
              Meta {pesos(meta)} · Gastado {pesos(resumen.gastos)}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium uppercase tracking-wide text-white/55">
              Balance de {m.nombre.toLowerCase()} este mes
            </p>
            <p
              className="text-5xl font-extrabold tabular-nums"
              style={{ color: balanceTot >= 0 ? 'var(--color-bien)' : 'var(--color-cuidado)' }}
            >
              {pesos(balanceTot)}
            </p>
            <button
              onClick={onEditarMeta}
              className="mt-1 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
            >
              <Icono nombre="Target" size={16} /> Poner meta del mes
            </button>
          </>
        )}
      </Glass>

      {/* Dos tarjetas: entró / salió */}
      <div className="grid grid-cols-2 gap-4">
        <Glass className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Icono nombre="ArrowUpRight" size={16} /> Entró
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-bien)' }}>
            {pesos(ingresosTot)}
          </span>
        </Glass>
        <Glass className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Icono nombre="ArrowDownRight" size={16} /> Salió
          </span>
          <span className="text-2xl font-bold tabular-nums">{pesos(resumen.gastos)}</span>
        </Glass>
      </div>

      {/* Ingreso fijo del hogar (solo en Casa) */}
      {modo === 'PERSONAL' &&
        (ingresoFijo > 0 ? (
          <Glass className="flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: m.suave }}>
              <Icono nombre="Wallet" size={20} />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Ingreso del hogar</p>
              <p className="text-sm text-white/55">{pesos(ingresoFijo)} cada mes · ya incluido arriba</p>
            </div>
            <button
              aria-label="Editar ingreso del hogar"
              onClick={onEditarSueldo}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
            >
              <Icono nombre="Pencil" size={18} />
            </button>
          </Glass>
        ) : (
          <button
            onClick={onEditarSueldo}
            className="glass flex items-center gap-3 rounded-3xl p-4 text-left transition-transform active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Icono nombre="Wallet" size={20} />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Agregar ingreso del hogar</p>
              <p className="text-sm text-white/55">Tu sueldo o lo que entra fijo cada mes</p>
            </div>
            <Icono nombre="Plus" size={20} />
          </button>
        ))}
        </>
      )}

      {/* Alertas de gastos inusuales (si hay) */}
      <AlertasInusuales />

      {/* ¿En qué se fue tu dinero? */}
      <Distribucion />

      {/* Comparado con el mes pasado */}
      <Comparacion />

      {/* Metas de ahorro (solo en Casa) */}
      {modo === 'PERSONAL' && <MetasAhorro />}

      {/* Movimientos recientes (tocables para corregir/borrar) */}
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
                <button
                  key={t.id}
                  onClick={() => onMovimiento(t)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-white/10"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: m.suave }}
                  >
                    <Icono nombre={cat?.icono ?? 'Ellipsis'} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {cat?.nombre ?? 'Movimiento'}
                      {t.beneficiario ? ` · ${t.beneficiario}` : ''}
                    </p>
                    <p className="text-sm text-white/50">{fechaCorta(t.fecha)}</p>
                  </div>
                  <span
                    className="shrink-0 text-lg font-bold tabular-nums"
                    style={{ color: ingreso ? 'var(--color-bien)' : '#fff' }}
                  >
                    {ingreso ? '+' : '−'}
                    {pesos(t.monto)}
                  </span>
                </button>
              );
            })}
          </Glass>
        )}
      </section>
    </div>
  );
}
