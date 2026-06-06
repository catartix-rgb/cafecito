'use client';

/**
 * Switch Gigante "Dos Caras" — el control más importante de la app.
 * Dos mitades enormes (Mi casa / El negocio). La mitad activa se pinta
 * con el color de su modo; la otra queda apagada. Área de toque muy grande.
 */
import { modos, type Modo } from '@/lib/theme';
import { useModo } from '@/state/mode';

export function SwitchDosCaras() {
  const { modo, setModo } = useModo();

  return (
    <div
      role="tablist"
      aria-label="Cambiar entre Mi casa y El negocio"
      className="flex gap-1 rounded-full border-2 border-borde bg-blanco p-1 shadow-sm"
    >
      <MitadSwitch valor="PERSONAL" activo={modo === 'PERSONAL'} onSelect={() => setModo('PERSONAL')} />
      <MitadSwitch valor="NEGOCIO" activo={modo === 'NEGOCIO'} onSelect={() => setModo('NEGOCIO')} />
    </div>
  );
}

function MitadSwitch({
  valor,
  activo,
  onSelect,
}: {
  valor: Modo;
  activo: boolean;
  onSelect: () => void;
}) {
  const m = modos[valor];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      aria-label={m.nombre}
      onClick={onSelect}
      className="flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-xl font-extrabold transition-colors duration-200"
      style={{
        backgroundColor: activo ? m.color : 'transparent',
        color: activo ? m.contraste : 'var(--color-tinta-suave)',
        minHeight: 64,
      }}
    >
      <span className="text-3xl leading-none">{m.icono}</span>
      <span className="truncate">{m.nombre}</span>
    </button>
  );
}
