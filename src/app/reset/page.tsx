'use client';

/**
 * Página de reinicio: borra los datos guardados en ESTE dispositivo
 * (movimientos, metas, presupuestos, sueldo) y limpia la caché de la app
 * para forzar la versión más reciente. Útil para empezar de cero o cuando
 * el teléfono se quedó con una versión vieja.
 */
import { useState } from 'react';

const CLAVES = [
  'cafecito.transacciones.v1',
  'cafecito.presupuestos.v1',
  'cafecito.ingresoFijo.v1',
  'cafecito.metas.v1',
  'cafecito.modo',
];

export default function PaginaReset() {
  const [paso, setPaso] = useState<'confirmar' | 'borrando' | 'listo'>('confirmar');

  async function reiniciar() {
    setPaso('borrando');
    try {
      // 1) Borrar los datos de la app en este dispositivo.
      for (const k of CLAVES) window.localStorage.removeItem(k);

      // 2) Quitar la app vieja cacheada (service worker + cachés).
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const claves = await caches.keys();
        await Promise.all(claves.map((c) => caches.delete(c)));
      }
    } catch {
      // aunque algo falle, seguimos: lo importante es no dejar a la usuaria atorada
    }
    setPaso('listo');
    // 3) Recargar desde cero a la pantalla principal.
    setTimeout(() => {
      window.location.href = '/';
    }, 1200);
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: 'linear-gradient(160deg, #186a5f 0%, #0a3a35 100%)' }}
    >
      {paso === 'confirmar' && (
        <>
          <h1 className="text-3xl font-extrabold">Reiniciar la app</h1>
          <p className="max-w-xs text-lg leading-relaxed text-white/80">
            Esto borra <span className="font-bold text-white">todos los movimientos, metas y ajustes</span> guardados
            en este teléfono, y trae la versión más nueva de la app. No se puede deshacer.
          </p>
          <button
            onClick={reiniciar}
            className="min-h-[64px] rounded-full px-10 text-xl font-extrabold"
            style={{ background: '#ef7a63', color: '#1a120c' }}
          >
            Sí, borrar todo y empezar de cero
          </button>
          <a href="/" className="text-white/70 underline underline-offset-4">
            Mejor no, volver a la app
          </a>
        </>
      )}

      {paso === 'borrando' && <p className="text-2xl font-bold">Limpiando…</p>}

      {paso === 'listo' && (
        <>
          <p className="text-3xl font-extrabold">¡Listo!</p>
          <p className="text-lg text-white/80">La app quedó como nueva. Abriendo…</p>
        </>
      )}
    </main>
  );
}
