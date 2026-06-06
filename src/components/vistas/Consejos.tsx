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

const COLOR_SEMAFORO: Record<TipoConsejo, string> = {
  BIEN: 'var(--color-bien)',
  OJO: 'var(--color-ojo)',
  CUIDADO: 'var(--color-cuidado)',
};

export function Consejos() {
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
    </div>
  );
}
