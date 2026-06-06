'use client';

/**
 * Estado global del "modo Dos Caras": ¿estamos en Mi casa o en El negocio?
 * Se recuerda entre visitas usando localStorage.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Modo } from '@/lib/theme';

type ModoContexto = {
  modo: Modo;
  setModo: (m: Modo) => void;
  alternar: () => void;
};

const Contexto = createContext<ModoContexto | null>(null);
const CLAVE_GUARDADO = 'cafecito.modo';

export function ProveedorModo({ children }: { children: ReactNode }) {
  const [modo, setModoState] = useState<Modo>('NEGOCIO');

  // Al montar, recuperamos el último modo usado.
  useEffect(() => {
    const guardado = window.localStorage.getItem(CLAVE_GUARDADO);
    if (guardado === 'PERSONAL' || guardado === 'NEGOCIO') {
      setModoState(guardado);
    }
  }, []);

  const setModo = useCallback((m: Modo) => {
    setModoState(m);
    window.localStorage.setItem(CLAVE_GUARDADO, m);
  }, []);

  const alternar = useCallback(() => {
    setModo(modo === 'NEGOCIO' ? 'PERSONAL' : 'NEGOCIO');
  }, [modo, setModo]);

  const valor = useMemo(() => ({ modo, setModo, alternar }), [modo, setModo, alternar]);

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
