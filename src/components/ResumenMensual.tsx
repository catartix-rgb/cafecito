'use client';

/**
 * Resumen mensual automático: una tarjeta por cara (Casa / Tienda / Negocio)
 * con sus 3 cifras clave del mes, más las tendencias contra el mes pasado.
 * Se actualiza solo (siempre mira el mes en curso). Pensado para entenderse
 * de un vistazo en pocos segundos.
 */
import { useMemo } from 'react';
import { modos, type Modo } from '@/lib/theme';
import { resumenMensual, type ResumenModoMes } from '@/lib/analisis';
import { pesos } from '@/lib/format';
import { useTransacciones } from '@/state/useTransacciones';
import { useIngresoFijo } from '@/state/useIngresoFijo';
import { Glass } from './Glass';
import { Icono } from './Icono';

const COLOR_TEND = { BIEN: 'var(--color-bien)', OJO: 'var(--color-ojo)', CUIDADO: 'var(--color-cuidado)' } as const;

/** Etiquetas de las 3 cifras según la cara. */
const ETIQUETAS: Record<Modo, [string, string, string]> = {
  PERSONAL: ['Ingresó', 'Gastó', 'Balance'],
  NEGOCIO: ['Ingresos', 'Gastos', 'Resultado'],
  TIENDA: ['Vendió', 'Gastó', 'Ganancia'],
};

export function ResumenMensual() {
  const tx = useTransacciones();
  const ingresoFijo = useIngresoFijo();
  const resumen = useMemo(() => resumenMensual(tx, ingresoFijo), [tx, ingresoFijo]);

  if (!resumen.hayDatos) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-lg font-bold capitalize text-white/85">Resumen de {resumen.mesNombre}</h2>

      {(['PERSONAL', 'TIENDA', 'NEGOCIO'] as Modo[]).map((modo) => {
        const d = resumen.porModo[modo];
        if (d.ingresos === 0 && d.gastos === 0) return null; // sin actividad: no la mostramos
        return <TarjetaModo key={modo} modo={modo} d={d} />;
      })}

      {resumen.tendencias.length > 0 && (
        <Glass className="flex flex-col divide-y divide-white/10 p-0">
          {resumen.tendencias.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span style={{ color: COLOR_TEND[t.tipo] }}>
                <Icono nombre={t.tipo === 'BIEN' ? 'TrendingUp' : 'TrendingDown'} size={18} />
              </span>
              <p className="flex-1 text-[15px] text-white/90">{t.texto}</p>
            </div>
          ))}
        </Glass>
      )}
    </section>
  );
}

function TarjetaModo({ modo, d }: { modo: Modo; d: ResumenModoMes }) {
  const m = modos[modo];
  const [l1, l2, l3] = ETIQUETAS[modo];
  return (
    <Glass className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: m.suave, color: m.acento }}>
          <Icono nombre={m.icono} size={18} />
        </span>
        <span className="font-bold">{m.nombre}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Cifra etiqueta={l1} valor={pesos(d.ingresos)} color="var(--color-bien)" />
        <Cifra etiqueta={l2} valor={pesos(d.gastos)} color="#ffffff" />
        <Cifra
          etiqueta={l3}
          valor={pesos(d.balance)}
          color={d.balance >= 0 ? 'var(--color-bien)' : 'var(--color-cuidado)'}
        />
      </div>
      {modo === 'TIENDA' && (d.inventarioMes ?? 0) > 0 && (
        <p className="text-center text-sm text-white/55">
          Invertido en mercancía este mes: {pesos(d.inventarioMes ?? 0)}
        </p>
      )}
    </Glass>
  );
}

function Cifra({ etiqueta, valor, color }: { etiqueta: string; valor: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-white/55">{etiqueta}</span>
      <span className="text-lg font-bold tabular-nums" style={{ color }}>
        {valor}
      </span>
    </div>
  );
}
