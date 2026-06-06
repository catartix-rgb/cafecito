'use client';

import { modos } from '@/lib/theme';
import { useModo } from '@/state/mode';
import { Icono } from './Icono';
import type { Vista } from './App';

export function NavInferior({
  vista,
  onVista,
  onRegistrar,
}: {
  vista: Vista;
  onVista: (v: Vista) => void;
  onRegistrar: () => void;
}) {
  const { modo } = useModo();
  const acento = modos[modo].acento;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="glass-fuerte mx-5 flex w-full max-w-md items-center justify-between rounded-full px-8 py-2.5">
        <BotonNav
          activo={vista === 'inicio'}
          icono="House"
          etiqueta="Inicio"
          acento={acento}
          onClick={() => onVista('inicio')}
        />

        {/* Botón central gigante de registrar */}
        <button
          aria-label="Anotar un movimiento"
          onClick={onRegistrar}
          className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full transition-transform active:scale-95"
          style={{ background: acento, color: '#1a120c', boxShadow: `0 10px 30px ${modos[modo].suave}` }}
        >
          <Icono nombre="Plus" size={32} />
        </button>

        <BotonNav
          activo={vista === 'consejos'}
          icono="Lightbulb"
          etiqueta="Consejos"
          acento={acento}
          onClick={() => onVista('consejos')}
        />
      </div>
    </nav>
  );
}

function BotonNav({
  activo,
  icono,
  etiqueta,
  acento,
  onClick,
}: {
  activo: boolean;
  icono: string;
  etiqueta: string;
  acento: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-20 flex-col items-center gap-0.5 py-1 text-xs font-semibold transition-colors"
      style={{ color: activo ? acento : 'rgba(255,255,255,0.6)' }}
    >
      <Icono nombre={icono} size={24} />
      {etiqueta}
    </button>
  );
}
