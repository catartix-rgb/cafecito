'use client';

/**
 * Contador Virtual: lee TODOS los datos guardados y muestra consejos dinámicos
 * en lenguaje natural, con un semáforo de color (verde / amarillo / rojo).
 */
import { useMemo } from 'react';
import { generarConsejos, type TipoConsejo } from '@/lib/analisis';
import { useTransacciones } from '@/state/useTransacciones';
import { usePresupuestos } from '@/state/usePresupuestos';
import { Glass } from '../Glass';
import { Icono } from '../Icono';
import { ResumenMensual } from '../ResumenMensual';

const COLOR_SEMAFORO: Record<TipoConsejo, string> = {
  BIEN: 'var(--color-bien)',
  OJO: 'var(--color-ojo)',
  CUIDADO: 'var(--color-cuidado)',
};

export function Consejos({ onAbrirAsesor }: { onAbrirAsesor: () => void }) {
  const transacciones = useTransacciones();
  const presupuestos = usePresupuestos();
  const consejos = useMemo(
    () => generarConsejos(transacciones, presupuestos),
    [transacciones, presupuestos]
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-10 pb-40">
      <header className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl glass">
          <Icono nombre="Lightbulb" size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold">Tu contador</h1>
          <p className="text-lg text-white/60">Consejos de la semana</p>
        </div>
      </header>

      {/* Entrada al asesor por chat */}
      <button
        onClick={onAbrirAsesor}
        className="glass flex items-center gap-3 rounded-3xl p-4 text-left transition-transform active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <Icono nombre="MessageCircle" size={24} />
        </span>
        <div className="flex-1">
          <p className="font-bold">Pregúntale a tu asesor</p>
          <p className="text-sm text-white/60">Háblale como a una persona sobre tu dinero</p>
        </div>
        <Icono nombre="Send" size={20} />
      </button>

      {/* Resumen mensual automático (todas las caras) */}
      <ResumenMensual />

      <div className="flex flex-col gap-4">
        {consejos.map((c) => (
          <Glass key={c.id} className="flex gap-4 p-5 aparecer">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.1)', color: COLOR_SEMAFORO[c.tipo] }}
            >
              <Icono nombre={c.icono} size={24} />
            </span>
            <div className="flex-1">
              <p className="font-bold" style={{ color: COLOR_SEMAFORO[c.tipo] }}>
                {c.titulo}
              </p>
              <p className="mt-0.5 leading-relaxed text-white/85">{c.texto}</p>
            </div>
          </Glass>
        ))}
      </div>

      {/* Reinicio de la app: discreto y al final, para no tocarlo por accidente.
          Lleva a /reset, que pide confirmación antes de borrar nada. */}
      <a
        href="/reset"
        className="mx-auto mt-4 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white/45"
      >
        <Icono nombre="Delete" size={16} />
        Reiniciar la app (borrar todo)
      </a>
    </div>
  );
}
