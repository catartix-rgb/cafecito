'use client';

/** Hoja para crear una meta de ahorro: nombre + cantidad objetivo. */
import { useState } from 'react';
import { modos } from '@/lib/theme';
import { pesos } from '@/lib/format';
import { metasStore } from '@/state/useMetas';
import { Icono } from './Icono';
import { Teclado, aplicarTecla } from './Teclado';

export function SheetNuevaMeta({ onClose }: { onClose: () => void }) {
  const m = modos.PERSONAL;
  const [nombre, setNombre] = useState('');
  const [digitos, setDigitos] = useState('');
  const objetivo = parseInt(digitos || '0', 10);
  const listo = nombre.trim().length > 0 && objetivo > 0;

  function guardar() {
    if (!listo) return;
    metasStore.crear(nombre, objetivo);
    onClose();
  }

  const textoBoton = nombre.trim().length === 0 ? 'Escribe un nombre' : objetivo === 0 ? 'Escribe cuánto quieres juntar' : 'Crear meta';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/50" />

      <div className="glass-fuerte subir relative mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-[32px] px-5 pb-8 pt-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Nueva meta de ahorro</h2>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icono nombre="X" size={20} />
          </button>
        </div>

        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="¿Para qué es? (ej. Lavadora nueva)"
          aria-label="Nombre de la meta"
          maxLength={40}
          className="rounded-2xl bg-white/10 px-5 py-3.5 text-[17px] text-white placeholder:text-white/45 focus:outline-none"
        />

        <div className="py-1 text-center">
          <p className="mb-1 text-sm text-white/55">¿Cuánto quieres juntar?</p>
          <span className="text-5xl font-extrabold tabular-nums" style={{ color: digitos ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            {pesos(objetivo)}
          </span>
        </div>

        <Teclado onTecla={(t) => setDigitos((d) => aplicarTecla(d, t))} />

        <button
          onClick={guardar}
          disabled={!listo}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-full text-xl font-extrabold transition-all disabled:opacity-50"
          style={{ background: m.acento, color: '#1a120c' }}
        >
          {listo && <Icono nombre="Check" size={24} />}
          {textoBoton}
        </button>
      </div>
    </div>
  );
}
