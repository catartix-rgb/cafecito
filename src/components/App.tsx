'use client';

/**
 * Orquestador de la app: fondo, vista actual, navegación inferior y las hojas
 * (registro, meta del mes, detalle de un movimiento).
 */
import { useState } from 'react';
import type { Transaccion } from '@/lib/store';
import { Fondo } from './Fondo';
import { NavInferior } from './NavInferior';
import { SheetRegistro } from './SheetRegistro';
import { SheetMeta } from './SheetMeta';
import { SheetSueldo } from './SheetSueldo';
import { SheetDetalle } from './SheetDetalle';
import { ChatAsesor } from './ChatAsesor';
import { Inicio } from './vistas/Inicio';
import { Consejos } from './vistas/Consejos';

export type Vista = 'inicio' | 'consejos';

export function App() {
  const [vista, setVista] = useState<Vista>('inicio');
  const [registrando, setRegistrando] = useState(false);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [editandoSueldo, setEditandoSueldo] = useState(false);
  const [detalle, setDetalle] = useState<Transaccion | null>(null);
  const [asesorAbierto, setAsesorAbierto] = useState(false);

  return (
    <>
      <Fondo />
      <div className="min-h-dvh">
        {vista === 'inicio' ? (
          <Inicio
            onEditarMeta={() => setEditandoMeta(true)}
            onEditarSueldo={() => setEditandoSueldo(true)}
            onMovimiento={setDetalle}
          />
        ) : (
          <Consejos onAbrirAsesor={() => setAsesorAbierto(true)} />
        )}
      </div>

      <NavInferior vista={vista} onVista={setVista} onRegistrar={() => setRegistrando(true)} />

      {registrando && <SheetRegistro onClose={() => setRegistrando(false)} />}
      {editandoMeta && <SheetMeta onClose={() => setEditandoMeta(false)} />}
      {editandoSueldo && <SheetSueldo onClose={() => setEditandoSueldo(false)} />}
      {detalle && <SheetDetalle transaccion={detalle} onClose={() => setDetalle(null)} />}
      {asesorAbierto && <ChatAsesor onClose={() => setAsesorAbierto(false)} />}
    </>
  );
}
