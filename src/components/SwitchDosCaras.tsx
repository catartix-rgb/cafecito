'use client';

/**
 * Switch Gigante "Dos Caras" en estilo liquid glass. Dos mitades enormes
 * (Mi casa / El negocio); la activa se ilumina con el acento del modo.
 */
import { modos, type Modo } from '@/lib/theme';
import { useModo } from '@/state/mode';
import { Icono } from './Icono';

export function SwitchDosCaras() {
  const { modo, setModo } = useModo();

  return (
    <div
      role="tablist"
      aria-label="Cambiar entre Mi casa y El negocio"
      className="glass flex gap-1 rounded-full p-1.5"
    >
      <Mitad valor="PERSONAL" activo={modo === 'PERSONAL'} onSelect={() => setModo('PERSONAL')} />
      <Mitad valor="NEGOCIO" activo={modo === 'NEGOCIO'} onSelect={() => setModo('NEGOCIO')} />
    </div>
  );
}

function Mitad({ valor, activo, onSelect }: { valor: Modo; activo: boolean; onSelect: () => void }) {
  const m = modos[valor];
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      onClick={onSelect}
      className="flex flex-1 items-center justify-center gap-2.5 rounded-full py-3.5 text-lg font-bold transition-all duration-300"
      style={{
        minHeight: 58,
        background: activo ? m.acento : 'transparent',
        color: activo ? '#1a120c' : 'rgba(255,255,255,0.72)',
        boxShadow: activo ? `0 6px 20px ${m.suave}` : 'none',
      }}
    >
      <Icono nombre={m.icono} size={22} />
      <span>{m.nombre}</span>
    </button>
  );
}
