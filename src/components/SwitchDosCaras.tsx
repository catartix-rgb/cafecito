'use client';

/**
 * Selector de caras (Casa / Negocio / Tienda) en estilo liquid glass.
 * Tres segmentos grandes; el activo se ilumina con el acento de su modo.
 */
import { modos, ORDEN_MODOS, type Modo } from '@/lib/theme';
import { useModo } from '@/state/mode';
import { Icono } from './Icono';

export function SwitchDosCaras() {
  const { modo, setModo } = useModo();

  return (
    <div
      role="tablist"
      aria-label="Cambiar entre Casa, Negocio y Tienda"
      className="glass flex gap-1 rounded-full p-1.5"
    >
      {ORDEN_MODOS.map((valor) => (
        <Segmento key={valor} valor={valor} activo={modo === valor} onSelect={() => setModo(valor)} />
      ))}
    </div>
  );
}

function Segmento({ valor, activo, onSelect }: { valor: Modo; activo: boolean; onSelect: () => void }) {
  const m = modos[valor];
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      aria-label={m.nombre}
      onClick={onSelect}
      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2.5 text-sm font-bold transition-all duration-300"
      style={{
        minHeight: 58,
        background: activo ? m.acento : 'transparent',
        color: activo ? '#1a120c' : 'rgba(255,255,255,0.7)',
        boxShadow: activo ? `0 6px 20px ${m.suave}` : 'none',
      }}
    >
      <Icono nombre={m.icono} size={22} />
      <span>{m.corto}</span>
    </button>
  );
}
