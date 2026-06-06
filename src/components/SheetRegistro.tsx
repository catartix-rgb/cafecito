'use client';

/**
 * Hoja de registro rápido. El usuario teclea el monto, toca una categoría y
 * guarda: el movimiento se persiste y el tablero se actualiza al instante.
 */
import { useState } from 'react';
import { modos } from '@/lib/theme';
import { categoriasDe, store } from '@/lib/store';
import { pesos } from '@/lib/format';
import { useModo } from '@/state/mode';
import { Icono } from './Icono';

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'borrar'];

export function SheetRegistro({ onClose }: { onClose: () => void }) {
  const { modo } = useModo();
  const m = modos[modo];
  const categorias = categoriasDe(modo);

  const [digitos, setDigitos] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const monto = parseInt(digitos || '0', 10);
  const listo = monto > 0 && categoriaId !== null;

  function teclear(t: string) {
    if (t === 'borrar') {
      setDigitos((d) => d.slice(0, -1));
      return;
    }
    setDigitos((d) => (d.length >= 7 ? d : (d + t).replace(/^0+/, '')));
  }

  function guardar() {
    if (!listo) return;
    const cat = categorias.find((c) => c.id === categoriaId)!;
    store.agregar({ monto, tipo: cat.tipo, modo, categoriaId: cat.id });
    setGuardado(true);
    setTimeout(onClose, 1100);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Telón */}
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/50" />

      {/* Hoja */}
      <div className="glass-fuerte subir relative mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-[32px] px-5 pb-8 pt-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Anotar en {m.nombre.toLowerCase()}</h2>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icono nombre="X" size={20} />
          </button>
        </div>

        {/* Monto */}
        <div className="py-2 text-center">
          <span className="text-6xl font-extrabold tabular-nums" style={{ color: digitos ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            {pesos(monto)}
          </span>
        </div>

        {/* Categorías */}
        <div className="grid grid-cols-4 gap-2.5">
          {categorias.map((c) => {
            const activa = c.id === categoriaId;
            return (
              <button
                key={c.id}
                onClick={() => setCategoriaId(c.id)}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-semibold transition-all"
                style={{
                  background: activa ? m.acento : 'rgba(255,255,255,0.08)',
                  color: activa ? '#1a120c' : 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Icono nombre={c.icono} size={22} />
                {c.nombre}
              </button>
            );
          })}
        </div>

        {/* Teclado */}
        <div className="grid grid-cols-3 gap-2.5">
          {TECLAS.map((t) => (
            <button
              key={t}
              onClick={() => teclear(t)}
              className="flex h-14 items-center justify-center rounded-2xl bg-white/8 text-2xl font-bold transition-colors active:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              {t === 'borrar' ? <Icono nombre="Delete" size={24} /> : t}
            </button>
          ))}
        </div>

        {/* Guardar */}
        <button
          onClick={guardar}
          disabled={!listo}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-full text-xl font-extrabold transition-all disabled:opacity-40"
          style={{ background: m.acento, color: '#1a120c' }}
        >
          <Icono nombre="Check" size={24} /> Guardar
        </button>
      </div>

      {/* Confirmación */}
      {guardado && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/60">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full aparecer"
            style={{ background: m.acento, color: '#1a120c' }}
          >
            <Icono nombre="Check" size={52} />
          </div>
          <p className="text-2xl font-extrabold">¡Listo!</p>
        </div>
      )}
    </div>
  );
}
