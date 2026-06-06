/**
 * Estado global del "modo Dos Caras": ¿estamos en Mi casa o en El negocio?
 * Por ahora vive en memoria; más adelante lo recordaremos entre sesiones
 * con almacenamiento local.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Modo } from '../theme';

type ModoContexto = {
  modo: Modo;
  setModo: (m: Modo) => void;
  alternar: () => void;
};

const Contexto = createContext<ModoContexto | null>(null);

export function ProveedorModo({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<Modo>('NEGOCIO');

  const alternar = useCallback(() => {
    setModo((actual) => (actual === 'NEGOCIO' ? 'PERSONAL' : 'NEGOCIO'));
  }, []);

  const valor = useMemo(() => ({ modo, setModo, alternar }), [modo, alternar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** Hook para leer y cambiar el modo desde cualquier pantalla. */
export function useModo(): ModoContexto {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error('useModo debe usarse dentro de <ProveedorModo>');
  }
  return ctx;
}
