'use client';

/**
 * Orquestador de la app: fondo, vista actual, navegación inferior y la hoja
 * de registro. Mantiene el estado de qué vista se ve y si la hoja está abierta.
 */
import { useState } from 'react';
import { Fondo } from './Fondo';
import { NavInferior } from './NavInferior';
import { SheetRegistro } from './SheetRegistro';
import { Inicio } from './vistas/Inicio';
import { Consejos } from './vistas/Consejos';

export type Vista = 'inicio' | 'consejos';

export function App() {
  const [vista, setVista] = useState<Vista>('inicio');
  const [registrando, setRegistrando] = useState(false);

  return (
    <>
      <Fondo />
      <div className="min-h-dvh">
        {vista === 'inicio' ? <Inicio /> : <Consejos />}
      </div>
      <NavInferior vista={vista} onVista={setVista} onRegistrar={() => setRegistrando(true)} />
      {registrando && <SheetRegistro onClose={() => setRegistrando(false)} />}
    </>
  );
}
