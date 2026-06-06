/**
 * Construye el "contexto RAG" que se le da al asesor de IA: un resumen en
 * texto de los datos financieros reales guardados localmente, para que sus
 * respuestas se basen en los números de la usuaria y no inventen nada.
 */
import type { Transaccion } from './store';
import { categoriaPorId } from './store';
import type { Presupuestos } from './presupuestos';
import { resumenDelMes, gastoHormigaSemana, PRECIO_COSTAL } from './analisis';
import { pesos, fechaCorta } from './format';

export function construirContexto(
  transacciones: Transaccion[],
  presupuestos: Presupuestos
): string {
  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (transacciones.length === 0) {
    return `Hoy es ${hoy}. La usuaria todavía no ha registrado ningún movimiento, así que aún no hay datos para analizar.`;
  }

  const neg = resumenDelMes(transacciones, 'NEGOCIO');
  const casa = resumenDelMes(transacciones, 'PERSONAL');
  const hormiga = gastoHormigaSemana(transacciones);
  const costales = Math.round(hormiga / PRECIO_COSTAL);

  const metaNeg = presupuestos.NEGOCIO ?? 0;
  const metaCasa = presupuestos.PERSONAL ?? 0;

  const lineas: string[] = [];
  lineas.push(`Hoy es ${hoy}. Todos los montos están en pesos mexicanos.`);
  lineas.push('');
  lineas.push('NEGOCIO (el café) — este mes:');
  lineas.push(`- Ventas (entró): ${pesos(neg.ingresos)}`);
  lineas.push(`- Gastos (salió): ${pesos(neg.gastos)}`);
  lineas.push(`- Balance: ${pesos(neg.balance)}`);
  lineas.push(`- Meta de gasto del mes: ${metaNeg > 0 ? pesos(metaNeg) : 'no tiene meta puesta'}`);
  lineas.push('');
  lineas.push('CASA (personal) — este mes:');
  lineas.push(`- Ingresos: ${pesos(casa.ingresos)}`);
  lineas.push(`- Gastos: ${pesos(casa.gastos)}`);
  lineas.push(`- Balance: ${pesos(casa.balance)}`);
  lineas.push(`- Meta de gasto del mes: ${metaCasa > 0 ? pesos(metaCasa) : 'no tiene meta puesta'}`);
  lineas.push('');
  lineas.push(
    `Gasto hormiga (antojos) de esta semana: ${pesos(hormiga)}` +
      (hormiga > 0 ? ` (equivale a ${costales <= 1 ? 'un costal' : costales + ' costales'} de café, a ${pesos(PRECIO_COSTAL)} cada uno).` : '.')
  );
  lineas.push('');
  lineas.push('Últimos movimientos (del más reciente al más antiguo):');
  for (const t of transacciones.slice(0, 25)) {
    const cat = categoriaPorId(t.categoriaId);
    const cara = t.modo === 'NEGOCIO' ? 'NEGOCIO' : 'CASA';
    const signo = t.tipo === 'INGRESO' ? '+' : '-';
    lineas.push(`- [${cara}] ${cat?.nombre ?? 'Movimiento'}: ${signo}${pesos(t.monto)} (${fechaCorta(t.fecha)})`);
  }

  return lineas.join('\n');
}
