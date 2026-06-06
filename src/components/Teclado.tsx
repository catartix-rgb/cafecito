'use client';

/**
 * Teclado numérico grande y reutilizable. Notifica cada tecla pulsada:
 * un dígito ('0'..'9'), '00', o 'borrar'.
 */
import { Icono } from './Icono';

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'borrar'];

export function Teclado({ onTecla }: { onTecla: (t: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {TECLAS.map((t) => (
        <button
          key={t}
          type="button"
          aria-label={t === 'borrar' ? 'Borrar' : t}
          onClick={() => onTecla(t)}
          className="flex h-14 items-center justify-center rounded-2xl text-2xl font-bold transition-colors active:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          {t === 'borrar' ? <Icono nombre="Delete" size={24} /> : t}
        </button>
      ))}
    </div>
  );
}

/** Aplica una tecla a una cadena de dígitos (máximo 7). */
export function aplicarTecla(digitos: string, t: string): string {
  if (t === 'borrar') return digitos.slice(0, -1);
  return (digitos.length >= 7 ? digitos : (digitos + t)).replace(/^0+(?=\d)/, '');
}
