/**
 * Sistema de diseño de Cafecito ☕ (versión web)
 * -----------------------------------------------
 * Pensado para una persona mayor: tipografías grandes, alto contraste,
 * áreas de toque enormes y colores cálidos. Cada "modo" (Personal / Negocio)
 * tiene su propia identidad de color para saber de un vistazo en qué cara estás.
 *
 * Los colores neutros viven como variables CSS en globals.css (para Tailwind);
 * aquí exponemos los colores de cada modo, que se aplican de forma dinámica.
 */

export type Modo = 'PERSONAL' | 'NEGOCIO';

/** Identidad visual de cada modo (la idea de "Dos Caras"). */
export const modos: Record<
  Modo,
  {
    nombre: string;
    icono: string; // emoji grande, legible sin cargar fuentes de íconos
    color: string; // color de acento del modo
    colorSuave: string; // versión clara para fondos
    contraste: string; // color de texto sobre `color`
    descripcion: string;
  }
> = {
  PERSONAL: {
    nombre: 'Mi casa',
    icono: '🏠',
    color: '#2E7D6F', // verde azulado calmado
    colorSuave: '#E0F0EC',
    contraste: '#FFFFFF',
    descripcion: 'Aquí verás tus gastos de la casa: súper, antojos y salidas.',
  },
  NEGOCIO: {
    nombre: 'El negocio',
    icono: '☕',
    color: '#6F4E37', // café tostado
    colorSuave: '#EFE4DA',
    contraste: '#FFFFFF',
    descripcion: 'Aquí verás cómo va tu café: ventas, insumos y servicios.',
  },
};

/** Color de marca principal (café), usado en el ícono y la barra del navegador. */
export const COLOR_MARCA = '#6F4E37';
export const COLOR_FONDO = '#FBF7F0';
