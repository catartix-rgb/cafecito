'use client';

/**
 * Detalle de un movimiento con opción de borrarlo. Pensado para corregir
 * errores fácilmente (toca el movimiento equivocado y lo eliminas).
 */
import { modos } from '@/lib/theme';
import { categoriaPorId, store, type Transaccion } from '@/lib/store';
import { pesos, fechaCorta } from '@/lib/format';
import { Icono } from './Icono';

export function SheetDetalle({ transaccion, onClose }: { transaccion: Transaccion; onClose: () => void }) {
  const cat = categoriaPorId(transaccion.categoriaId);
  const m = modos[transaccion.modo];
  const ingreso = transaccion.tipo === 'INGRESO';

  function borrar() {
    store.eliminar(transaccion.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/50" />

      <div className="glass-fuerte subir relative mx-auto flex w-full max-w-md flex-col gap-5 rounded-t-[32px] px-5 pb-8 pt-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25" />

        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-3xl"
            style={{ background: m.suave }}
          >
            <Icono nombre={cat?.icono ?? 'Ellipsis'} size={30} />
          </span>
          <p className="text-lg font-semibold text-white/70">
            {cat?.nombre ?? 'Movimiento'}
            {transaccion.beneficiario ? ` · ${transaccion.beneficiario}` : ''}
          </p>
          <p className="text-5xl font-extrabold tabular-nums" style={{ color: ingreso ? 'var(--color-bien)' : '#fff' }}>
            {ingreso ? '+' : '−'}
            {pesos(transaccion.monto)}
          </p>
          <p className="text-white/50">
            {m.nombre} · {fechaCorta(transaccion.fecha)}
          </p>
        </div>

        <button
          onClick={borrar}
          className="flex min-h-[60px] items-center justify-center gap-2 rounded-full text-lg font-bold"
          style={{ background: 'rgba(239,122,99,0.18)', color: 'var(--color-cuidado)', border: '1px solid rgba(239,122,99,0.4)' }}
        >
          <Icono nombre="Delete" size={22} /> Borrar movimiento
        </button>
        <button onClick={onClose} className="text-center font-semibold text-white/70">
          Cancelar
        </button>
      </div>
    </div>
  );
}
