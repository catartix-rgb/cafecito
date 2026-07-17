/**
 * Construye el "contexto RAG" que se le da al asesor de IA: un resumen en
 * texto de los datos financieros reales guardados localmente, para que sus
 * respuestas se basen en los números de la usuaria y no inventen nada.
 */
import type { Transaccion } from './store';
import { categoriaPorId } from './store';
import type { Presupuestos } from './presupuestos';
import type { Meta } from './metas';
import {
  resumenDelMes,
  gastoHormigaSemana,
  apoyoPorHijo,
  distribucionGastos,
  comparacionMensual,
  gastosInusuales,
  invertidoEnInventario,
  saldoActual,
  PRECIO_COSTAL,
} from './analisis';
import { pesos, fechaCorta } from './format';

export function construirContexto(
  transacciones: Transaccion[],
  presupuestos: Presupuestos,
  ingresoFijo: number = 0,
  metas: Meta[] = []
): string {
  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (transacciones.length === 0) {
    const sueldo =
      ingresoFijo > 0
        ? ` Tiene registrado un ingreso fijo del hogar de ${pesos(ingresoFijo)} al mes.`
        : '';
    return `Hoy es ${hoy}. La usuaria todavía no ha registrado movimientos, así que casi no hay datos.${sueldo}`;
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
  lineas.push(
    'SALDO EN CAJA (acumulado desde el inicio; NUNCA se reinicia al cambiar de mes — el saldo final de un mes pasa como saldo inicial del siguiente):'
  );
  lineas.push(`- Casa: ${pesos(saldoActual(transacciones, 'PERSONAL', ingresoFijo))}`);
  lineas.push(`- Negocio (café): ${pesos(saldoActual(transacciones, 'NEGOCIO'))}`);
  lineas.push(`- Tienda: ${pesos(saldoActual(transacciones, 'TIENDA'))}`);
  lineas.push('');
  lineas.push('NEGOCIO (el café) — este mes:');
  lineas.push(`- Ventas (entró): ${pesos(neg.ingresos)}`);
  lineas.push(`- Gastos (salió): ${pesos(neg.gastos)}`);
  lineas.push(`- Balance: ${pesos(neg.balance)}`);
  lineas.push(`- Meta de gasto del mes: ${metaNeg > 0 ? pesos(metaNeg) : 'no tiene meta puesta'}`);
  lineas.push('');

  // TIENDA (solo si tiene movimientos)
  const tienda = resumenDelMes(transacciones, 'TIENDA');
  const invTienda = invertidoEnInventario(transacciones, 'TIENDA');
  if (tienda.ingresos > 0 || tienda.gastos > 0 || invTienda > 0) {
    lineas.push('TIENDA (negocio aparte) — este mes:');
    lineas.push(`- Ventas (entró): ${pesos(tienda.ingresos)}`);
    lineas.push(`- Gastos (salió): ${pesos(tienda.gastos)}`);
    lineas.push(`- Ganancia estimada: ${pesos(tienda.balance)}`);
    lineas.push(`- Dinero invertido en mercancía (histórico): ${pesos(invTienda)}`);
    lineas.push('');
  }

  const casaIngresosTot = casa.ingresos + ingresoFijo;
  const casaBalanceTot = casaIngresosTot - casa.gastos;
  lineas.push('CASA (personal) — este mes:');
  lineas.push(
    `- Ingreso fijo del hogar (sueldo/pensión que entra cada mes): ${ingresoFijo > 0 ? pesos(ingresoFijo) : 'no lo ha registrado'}`
  );
  lineas.push(`- Otros ingresos anotados este mes: ${pesos(casa.ingresos)}`);
  lineas.push(`- Ingresos totales del mes (sueldo + otros): ${pesos(casaIngresosTot)}`);
  lineas.push(`- Gastos: ${pesos(casa.gastos)}`);
  lineas.push(`- Balance (lo que entró menos lo que salió): ${pesos(casaBalanceTot)}`);
  lineas.push(`- Meta de gasto del mes: ${metaCasa > 0 ? pesos(metaCasa) : 'no tiene meta puesta'}`);
  lineas.push('');
  lineas.push(
    `Gasto hormiga (antojos) de esta semana: ${pesos(hormiga)}` +
      (hormiga > 0 ? ` (equivale a ${costales <= 1 ? 'un costal' : costales + ' costales'} de café, a ${pesos(PRECIO_COSTAL)} cada uno).` : '.')
  );
  lineas.push('');

  // ¿En qué se fue el dinero de la casa? (distribución por categoría)
  const dist = distribucionGastos(transacciones, 'PERSONAL');
  if (dist.total > 0) {
    lineas.push('EN QUÉ SE FUE EL DINERO DE LA CASA (este mes, % del gasto total):');
    for (const s of dist.slices) {
      lineas.push(`- ${s.nombre}: ${pesos(s.total)} (${Math.round(s.pct * 100)}%)`);
    }
    lineas.push('');
  }

  // Comparación con el mes pasado (Casa)
  const comp = comparacionMensual(transacciones, 'PERSONAL', ingresoFijo);
  if (comp.hayMesPasado) {
    lineas.push('COMPARADO CON EL MES PASADO (Casa):');
    lineas.push(`- Gasto total: ${pesos(comp.gastosEste)} este mes vs ${pesos(comp.gastosPasado)} el mes pasado.`);
    lineas.push(`- Ahorro: ${pesos(comp.ahorroEste)} este mes vs ${pesos(comp.ahorroPasado)} el mes pasado.`);
    for (const c of comp.cambios) {
      if (c.dir === 'igual') continue;
      if (c.dir === 'nuevo') {
        lineas.push(`- ${c.nombre}: nuevo este mes (${pesos(c.esteMes)}).`);
      } else {
        const pct = Math.round((c.pct ?? 0) * 100);
        lineas.push(`- ${c.nombre}: ${pct > 0 ? '+' : ''}${pct}% (${pesos(c.mesPasado)} → ${pesos(c.esteMes)}).`);
      }
    }
    lineas.push('');
  }

  // Gastos inusuales (Casa)
  const inusuales = gastosInusuales(transacciones, 'PERSONAL');
  if (inusuales.length > 0) {
    lineas.push('GASTOS INUSUALES DE LA CASA (muy por encima del promedio de su categoría):');
    for (const a of inusuales) {
      lineas.push(`- ${pesos(a.monto)} en ${a.nombre} (su promedio es ~${pesos(a.promedio)}).`);
    }
    lineas.push('');
  }

  // Metas de ahorro
  if (metas.length > 0) {
    lineas.push('METAS DE AHORRO:');
    for (const meta of metas) {
      const pct = meta.objetivo > 0 ? Math.round((meta.ahorrado / meta.objetivo) * 100) : 0;
      const falta = Math.max(0, meta.objetivo - meta.ahorrado);
      lineas.push(`- ${meta.nombre}: lleva ${pesos(meta.ahorrado)} de ${pesos(meta.objetivo)} (${pct}%, le falta ${pesos(falta)}).`);
    }
    lineas.push('');
  }

  // Apoyo familiar a los hijos (Pablo / Alex)
  const apoyoMes = apoyoPorHijo(transacciones, 'mes');
  const apoyoSemana = apoyoPorHijo(transacciones, 'semana');
  const hijosMes = Object.keys(apoyoMes);
  lineas.push('APOYO A LOS HIJOS (dinero que les dio):');
  if (hijosMes.length === 0) {
    lineas.push('- Este mes no le ha dado dinero a ningún hijo (o no lo ha anotado).');
  } else {
    const totalMes = Object.values(apoyoMes).reduce((s, n) => s + n, 0);
    lineas.push(`- Este mes (total ${pesos(totalMes)}):`);
    for (const hijo of hijosMes) {
      lineas.push(`    · ${hijo}: ${pesos(apoyoMes[hijo])}`);
    }
    const hijosSem = Object.keys(apoyoSemana);
    if (hijosSem.length > 0) {
      const totalSem = Object.values(apoyoSemana).reduce((s, n) => s + n, 0);
      lineas.push(`- Esta semana (total ${pesos(totalSem)}): ${hijosSem.map((h) => `${h} ${pesos(apoyoSemana[h])}`).join(', ')}.`);
    }
  }
  lineas.push('');

  lineas.push('Últimos movimientos (del más reciente al más antiguo):');
  for (const t of transacciones.slice(0, 25)) {
    const cat = categoriaPorId(t.categoriaId);
    const cara = t.modo === 'NEGOCIO' ? 'NEGOCIO' : 'CASA';
    const signo = t.tipo === 'INGRESO' ? '+' : '-';
    const quien = t.beneficiario ? ` para ${t.beneficiario}` : '';
    lineas.push(`- [${cara}] ${cat?.nombre ?? 'Movimiento'}${quien}: ${signo}${pesos(t.monto)} (${fechaCorta(t.fecha)})`);
  }

  return lineas.join('\n');
}
