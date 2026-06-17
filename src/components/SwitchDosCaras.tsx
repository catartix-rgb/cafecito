'use client';

/**
 * Selector de caras (Casa / Negocio / Tienda) con sensación líquida: un único
 * indicador se DESLIZA entre las opciones (interpolando posición con un easing
 * de resorte) y su color se TRANSFORMA de forma gradual al del modo activo.
 * Nada de cambios instantáneos: parece que una gota de material se mueve.
 */
import { modos, ORDEN_MODOS } from '@/lib/theme';
import { useModo } from '@/state/mode';
import { Icono } from './Icono';

export function SwitchDosCaras() {
  const { modo, setModo } = useModo();
  const index = Math.max(0, ORDEN_MODOS.indexOf(modo));
  const m = modos[modo];

  return (
    <div
      role="tablist"
      aria-label="Cambiar entre Casa, Negocio y Tienda"
      className="glass relative flex rounded-full p-1.5"
    >
      {/* La "gota" que se desliza y cambia de color. */}
      <span
        aria-hidden
        className="absolute bottom-1.5 top-1.5 rounded-full"
        style={{
          left: 6,
          width: `calc((100% - 12px) / ${ORDEN_MODOS.length})`,
          transform: `translateX(${index * 100}%)`,
          background: m.acento,
          boxShadow: `0 6px 22px ${m.suave}, inset 0 1px 1px rgba(255,255,255,0.4)`,
          transition:
            'transform 0.55s var(--ease-resorte), background-color 0.45s var(--ease-suave), box-shadow 0.45s var(--ease-suave)',
          willChange: 'transform',
          zIndex: 0,
        }}
      />

      {ORDEN_MODOS.map((valor) => {
        const mm = modos[valor];
        const activo = modo === valor;
        return (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={activo}
            aria-label={mm.nombre}
            onClick={() => setModo(valor)}
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2.5 text-sm font-bold"
            style={{
              minHeight: 58,
              color: activo ? '#1a120c' : 'rgba(255,255,255,0.7)',
              transition: 'color 0.4s var(--ease-suave)',
            }}
          >
            <Icono nombre={mm.icono} size={22} />
            <span>{mm.corto}</span>
          </button>
        );
      })}
    </div>
  );
}
