/**
 * Sistema de diseño de Cafecito (versión "liquid glass")
 * ------------------------------------------------------
 * Sin emojis. Cada modo ("Mi casa" / "El negocio") tiene su propia identidad:
 * un color de acento, un ícono de Lucide y un gradiente de fondo elegante sobre
 * el que flotan las tarjetas de vidrio esmerilado (glassmorphism).
 */

export type Modo = 'PERSONAL' | 'NEGOCIO' | 'TIENDA';

/** Orden en que se muestran los modos en el selector. */
export const ORDEN_MODOS: Modo[] = ['PERSONAL', 'NEGOCIO', 'TIENDA'];

/** Nombres de íconos de lucide-react (se resuelven en <Icono/>). */
export type NombreIcono = string;

export const modos: Record<
  Modo,
  {
    nombre: string;
    corto: string; // etiqueta corta para el selector de 3 caras
    icono: NombreIcono; // ícono Lucide del modo
    acento: string; // color de acento sólido (botones, énfasis)
    suave: string; // versión translúcida del acento
    /** Gradiente de fondo de pantalla completa para este modo. */
    gradiente: string;
    descripcion: string;
  }
> = {
  PERSONAL: {
    nombre: 'Mi casa',
    corto: 'Casa',
    icono: 'House',
    acento: '#34D6B4',
    suave: 'rgba(52, 214, 180, 0.18)',
    gradiente:
      'radial-gradient(120% 90% at 15% 12%, #2f8d7d 0%, transparent 55%),' +
      'radial-gradient(100% 80% at 85% 0%, #41b89a 0%, transparent 50%),' +
      'radial-gradient(120% 120% at 80% 100%, #0e4842 0%, transparent 55%),' +
      'linear-gradient(160deg, #186a5f 0%, #0a3a35 100%)',
    descripcion: 'Súper, antojos y salidas de la casa.',
  },
  NEGOCIO: {
    nombre: 'El negocio',
    corto: 'Negocio',
    icono: 'Coffee',
    acento: '#E8A55C',
    suave: 'rgba(232, 165, 92, 0.18)',
    gradiente:
      'radial-gradient(120% 90% at 15% 12%, #9c6b44 0%, transparent 55%),' +
      'radial-gradient(100% 80% at 85% 0%, #c08a55 0%, transparent 50%),' +
      'radial-gradient(120% 120% at 80% 100%, #3a271b 0%, transparent 55%),' +
      'linear-gradient(160deg, #6b4a33 0%, #2a1c13 100%)',
    descripcion: 'Ventas, insumos y servicios del café.',
  },
  TIENDA: {
    nombre: 'La tienda',
    corto: 'Tienda',
    icono: 'Store',
    acento: '#7C9CF5',
    suave: 'rgba(124, 156, 245, 0.18)',
    gradiente:
      'radial-gradient(120% 90% at 15% 12%, #4a63b5 0%, transparent 55%),' +
      'radial-gradient(100% 80% at 85% 0%, #5f7fd6 0%, transparent 50%),' +
      'radial-gradient(120% 120% at 80% 100%, #1e2a52 0%, transparent 55%),' +
      'linear-gradient(160deg, #344a8f 0%, #161d38 100%)',
    descripcion: 'Ventas, mercancía y gastos de la tienda.',
  },
};

/** Color de marca principal (café), usado en el ícono de la app. */
export const COLOR_MARCA = '#6F4E37';
/** Color de fondo/barra del navegador (tono oscuro elegante para el glass). */
export const COLOR_FONDO = '#1a120c';
