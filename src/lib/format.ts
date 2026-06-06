/** Utilidades de formato para México (MXN). */

const pesosFmt = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

/** Formatea un número como pesos mexicanos sin centavos. Ej: $2,500 */
export function pesos(n: number): string {
  return pesosFmt.format(Math.round(n));
}

const fechaFmt = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
});

/** Fecha corta legible. Ej: "5 jun" */
export function fechaCorta(iso: string): string {
  return fechaFmt.format(new Date(iso));
}
