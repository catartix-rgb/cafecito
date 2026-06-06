/**
 * Sistema de diseño de Cafecito ☕
 * -----------------------------------
 * Pensado para una persona mayor: tipografías grandes, alto contraste,
 * áreas de toque enormes y colores cálidos. Cada "modo" (Personal / Negocio)
 * tiene su propia identidad de color para que de un vistazo se sepa
 * en qué cara de la app estás.
 */

export type Modo = 'PERSONAL' | 'NEGOCIO';

/** Paleta base neutra, compartida por toda la app. */
export const palette = {
  blanco: '#FFFFFF',
  crema: '#FBF7F0', // fondo cálido, descansa la vista
  tinta: '#2B2420', // texto principal (café muy oscuro, no negro puro)
  tintaSuave: '#6B6157', // texto secundario
  borde: '#E9E1D6',
  verde: '#3E8E5A', // "vas bien"
  amarillo: '#E0A100', // "ojo ahí"
  rojo: '#D6452F', // "cuidado"
  sombra: 'rgba(43, 36, 32, 0.12)',
} as const;

/** Identidad visual de cada modo (la idea de "Dos Caras"). */
export const modos: Record<
  Modo,
  {
    nombre: string;
    icono: string; // emoji grande, legible sin cargar fuentes de íconos
    color: string; // color de acento del modo
    colorSuave: string; // versión clara para fondos
    contraste: string; // color de texto sobre `color`
  }
> = {
  PERSONAL: {
    nombre: 'Mi casa',
    icono: '🏠',
    color: '#2E7D6F', // verde azulado calmado
    colorSuave: '#E0F0EC',
    contraste: '#FFFFFF',
  },
  NEGOCIO: {
    nombre: 'El negocio',
    icono: '☕',
    color: '#6F4E37', // café tostado
    colorSuave: '#EFE4DA',
    contraste: '#FFFFFF',
  },
};

/** Espaciado generoso (en píxeles). */
export const espacio = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
} as const;

/** Tamaños de letra grandes para alta legibilidad. */
export const texto = {
  gigante: 56, // el monto en pantalla
  titulo: 30,
  subtitulo: 22,
  cuerpo: 18,
  etiqueta: 16,
} as const;

/** Radios redondeados y suaves. */
export const radio = {
  md: 16,
  lg: 24,
  pildora: 999,
} as const;
