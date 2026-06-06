'use client';

/**
 * Registra el Service Worker para que la app funcione sin internet
 * y sea instalable en la pantalla de inicio. Solo en producción
 * (en desarrollo estorba al recargar cambios).
 */
import { useEffect } from 'react';

export function RegistroSW() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Si falla el registro, la app sigue funcionando igual (solo sin offline).
      });
    }
  }, []);

  return null;
}
