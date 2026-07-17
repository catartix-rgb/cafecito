/**
 * Contador Virtual — el motor de análisis de Cafecito.
 * Lee las transacciones guardadas y produce números y consejos dinámicos
 * en lenguaje natural y amigable. Funciones puras (fáciles de probar).
 */
import { categoriaPorId, type Transaccion } from './store';
import { modos, type Modo } from './theme';
import type { Presupuestos } from './presupuestos';
import { pesos } from './format';

/** Precio aproximado de un costal de café (MXN), para las analogías. */
export const PRECIO_COSTAL = 1200;

export type Resumen = {
  ingresos: number;
  gastos: number;
  balance: number;
};

function mismaSemana(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  const inicio = inicioDeSemana(ref);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 7);
  return d >= inicio && d < fin;
}

function inicioDeSemana(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const dia = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dia);
  return d;
}

function mismoMes(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

function mismoDia(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear()
  );
}

/** Resumen de ingresos/gastos/balance del mes actual para un modo. */
export function resumenDelMes(transacciones: Transaccion[], modo: Modo): Resumen {
  const hoy = new Date();
  let ingresos = 0;
  let gastos = 0;
  for (const t of transacciones) {
    if (t.modo !== modo || !mismoMes(t.fecha, hoy)) continue;
    if (t.tipo === 'INGRESO') ingresos += t.monto;
    else gastos += t.monto;
  }
  return { ingresos, gastos, balance: ingresos - gastos };
}

/** Suma del gasto hormiga (antojos) de esta semana. */
export function gastoHormigaSemana(transacciones: Transaccion[]): number {
  const hoy = new Date();
  return transacciones
    .filter((t) => {
      const cat = categoriaPorId(t.categoriaId);
      return cat?.esHormiga && t.tipo === 'GASTO' && mismaSemana(t.fecha, hoy);
    })
    .reduce((s, t) => s + t.monto, 0);
}

/**
 * Apoyo familiar (categoría "apoyo") agrupado por hijo, en el periodo dado.
 * Devuelve un objeto como { Pablo: 700, Alex: 300 } (solo incluye a quien recibió algo).
 */
export function apoyoPorHijo(
  transacciones: Transaccion[],
  periodo: 'mes' | 'semana'
): Record<string, number> {
  const hoy = new Date();
  const dentro = (iso: string) => (periodo === 'mes' ? mismoMes(iso, hoy) : mismaSemana(iso, hoy));
  const totales: Record<string, number> = {};
  for (const t of transacciones) {
    if (t.categoriaId !== 'apoyo' || !t.beneficiario || !dentro(t.fecha)) continue;
    totales[t.beneficiario] = (totales[t.beneficiario] ?? 0) + t.monto;
  }
  return totales;
}

export type TipoConsejo = 'BIEN' | 'OJO' | 'CUIDADO';

export type Consejo = {
  id: string;
  tipo: TipoConsejo;
  icono: string; // ícono Lucide
  titulo: string;
  texto: string;
};

/**
 * Genera los consejos del Contador Virtual a partir de TODOS los datos.
 * La analogía estrella cruza las dos caras: el gasto hormiga personal se
 * mide en "costales de café" del negocio.
 */
export function generarConsejos(
  transacciones: Transaccion[],
  presupuestos: Presupuestos = {}
): Consejo[] {
  if (transacciones.length === 0) {
    return [
      {
        id: 'inicio',
        tipo: 'BIEN',
        icono: 'Sparkles',
        titulo: 'Empecemos',
        texto: 'Anota tu primer movimiento con el botón de abajo y aquí verás consejos hechos a tu medida.',
      },
    ];
  }

  const consejos: Consejo[] = [];

  // 0) Avisos de presupuesto (prioritarios): ¿cómo vamos contra la meta?
  for (const modo of ['NEGOCIO', 'PERSONAL'] as Modo[]) {
    const meta = presupuestos[modo] ?? 0;
    if (meta <= 0) continue;
    const gastos = resumenDelMes(transacciones, modo).gastos;
    const uso = gastos / meta;
    const nombre = modos[modo].nombre.toLowerCase();
    if (uso >= 1) {
      consejos.push({
        id: `meta-${modo}`,
        tipo: 'CUIDADO',
        icono: 'Target',
        titulo: `Te pasaste en ${nombre}`,
        texto: `Gastaste ${pesos(gastos)} de tu meta de ${pesos(meta)}. Vamos con calma el resto del mes.`,
      });
    } else if (uso >= 0.8) {
      consejos.push({
        id: `meta-${modo}`,
        tipo: 'OJO',
        icono: 'Target',
        titulo: `Cerca de la meta en ${nombre}`,
        texto: `Llevas ${pesos(gastos)} de ${pesos(meta)}. Te queda ${pesos(meta - gastos)} para el mes.`,
      });
    }
  }

  // 1) Gasto hormiga de la semana en "costales de café".
  const hormiga = gastoHormigaSemana(transacciones);
  if (hormiga > 0) {
    const costales = hormiga / PRECIO_COSTAL;
    if (costales >= 1) {
      consejos.push({
        id: 'hormiga',
        tipo: 'OJO',
        icono: 'Candy',
        titulo: 'Ojo con los antojos',
        texto: `Esta semana los antojos suman ${pesos(hormiga)}. Es como ${formatoCostales(
          costales
        )} de café. ¡Ahí se va el negocio!`,
      });
    } else {
      consejos.push({
        id: 'hormiga',
        tipo: 'BIEN',
        icono: 'Candy',
        titulo: 'Antojos bajo control',
        texto: `Llevas ${pesos(hormiga)} en antojos esta semana. Vas bien, sigue así.`,
      });
    }
  }

  // 2) Cómo va el negocio este mes.
  const neg = resumenDelMes(transacciones, 'NEGOCIO');
  if (neg.ingresos > 0 || neg.gastos > 0) {
    if (neg.balance >= 0) {
      consejos.push({
        id: 'negocio',
        tipo: 'BIEN',
        icono: 'TrendingUp',
        titulo: 'El negocio va en verde',
        texto: `Este mes el café te ha dejado ${pesos(neg.balance)} a favor. ¡Bien hecho!`,
      });
    } else {
      consejos.push({
        id: 'negocio',
        tipo: 'CUIDADO',
        icono: 'TrendingDown',
        titulo: 'El negocio está apretado',
        texto: `Este mes gastaste ${pesos(Math.abs(neg.balance))} más de lo que vendiste. Revisemos los insumos.`,
      });
    }
  }

  // 3) Gastos de la casa este mes.
  const casa = resumenDelMes(transacciones, 'PERSONAL');
  if (casa.gastos > 0) {
    consejos.push({
      id: 'casa',
      tipo: 'OJO',
      icono: 'House',
      titulo: 'Gastos de la casa',
      texto: `Llevas ${pesos(casa.gastos)} en gastos personales este mes.`,
    });
  }

  return consejos;
}

function formatoCostales(n: number): string {
  const redondo = Math.round(n);
  if (redondo <= 1) return 'un costal';
  return `${redondo} costales`;
}

// ===========================================================================
// Análisis para "entender el dinero" (semáforo, distribución, comparación,
// alertas). Todas son funciones puras sobre las transacciones reales.
// ===========================================================================

/** Primer día del mes anterior (para comparar mes contra mes). */
function refMesAnterior(): Date {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d;
}

/** Gastos del modo, agrupados por categoría, dentro del mes de `ref`. */
function gastosPorCategoria(tx: Transaccion[], modo: Modo, ref: Date): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tx) {
    if (t.modo !== modo || t.tipo !== 'GASTO' || !mismoMes(t.fecha, ref)) continue;
    m.set(t.categoriaId, (m.get(t.categoriaId) ?? 0) + t.monto);
  }
  return m;
}

function sumaMapa(m: Map<string, number>): number {
  let s = 0;
  m.forEach((v) => (s += v));
  return s;
}

function ingresosEnMes(tx: Transaccion[], modo: Modo, ref: Date, fijo: number): number {
  let ing = 0;
  for (const t of tx) {
    if (t.modo === modo && t.tipo === 'INGRESO' && mismoMes(t.fecha, ref)) ing += t.monto;
  }
  return ing + fijo;
}

export type SliceGasto = { categoriaId: string; nombre: string; icono: string; total: number; pct: number };

/** ¿En qué se fue el dinero? Distribución de gastos del mes por categoría. */
export function distribucionGastos(tx: Transaccion[], modo: Modo): { total: number; slices: SliceGasto[] } {
  const porCat = gastosPorCategoria(tx, modo, new Date());
  const total = sumaMapa(porCat);
  const slices: SliceGasto[] = [...porCat.entries()]
    .map(([id, monto]) => {
      const cat = categoriaPorId(id);
      return {
        categoriaId: id,
        nombre: cat?.nombre ?? 'Otros',
        icono: cat?.icono ?? 'Ellipsis',
        total: monto,
        pct: total > 0 ? monto / total : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
  return { total, slices };
}

export type CambioCategoria = {
  categoriaId: string;
  nombre: string;
  icono: string;
  esteMes: number;
  mesPasado: number;
  pct: number | null; // null = categoría nueva (no había el mes pasado)
  dir: 'mas' | 'menos' | 'nuevo' | 'igual';
};

export type Comparacion = {
  hayMesPasado: boolean;
  gastosEste: number;
  gastosPasado: number;
  ahorroEste: number;
  ahorroPasado: number;
  cambios: CambioCategoria[];
};

/** Comparación de este mes contra el mes pasado, por categoría y en ahorro. */
export function comparacionMensual(tx: Transaccion[], modo: Modo, ingresoFijo = 0): Comparacion {
  const fijo = modo === 'PERSONAL' ? ingresoFijo : 0;
  const refEste = new Date();
  const refPasado = refMesAnterior();
  const este = gastosPorCategoria(tx, modo, refEste);
  const pasado = gastosPorCategoria(tx, modo, refPasado);
  const gastosEste = sumaMapa(este);
  const gastosPasado = sumaMapa(pasado);
  const ahorroEste = ingresosEnMes(tx, modo, refEste, fijo) - gastosEste;
  const ahorroPasado = ingresosEnMes(tx, modo, refPasado, fijo) - gastosPasado;

  const ids = new Set<string>([...este.keys(), ...pasado.keys()]);
  const cambios: CambioCategoria[] = [];
  for (const id of ids) {
    const a = este.get(id) ?? 0;
    const b = pasado.get(id) ?? 0;
    const cat = categoriaPorId(id);
    let pct: number | null = null;
    let dir: CambioCategoria['dir'] = 'igual';
    if (b === 0 && a > 0) {
      dir = 'nuevo';
    } else if (b > 0) {
      pct = (a - b) / b;
      dir = Math.abs(pct) < 0.03 ? 'igual' : pct > 0 ? 'mas' : 'menos';
    }
    cambios.push({ categoriaId: id, nombre: cat?.nombre ?? 'Otros', icono: cat?.icono ?? 'Ellipsis', esteMes: a, mesPasado: b, pct, dir });
  }
  // De mayor a menor cambio en pesos (lo más relevante primero).
  cambios.sort((x, y) => Math.abs(y.esteMes - y.mesPasado) - Math.abs(x.esteMes - x.mesPasado));
  return { hayMesPasado: gastosPasado > 0, gastosEste, gastosPasado, ahorroEste, ahorroPasado, cambios };
}

export type EstadoSemaforo = 'BIEN' | 'OJO' | 'CUIDADO';
export type ResultadoSemaforo = { estado: EstadoSemaforo; titulo: string; razon: string };

/**
 * Semáforo financiero del modo, basado en tendencias reales: gasto vs ingreso,
 * vs meta, y vs el ritmo del mes pasado (proyectado a la altura del mes en que vamos).
 */
export function semaforo(
  tx: Transaccion[],
  modo: Modo,
  presupuestos: Presupuestos = {},
  ingresoFijo = 0
): ResultadoSemaforo {
  const r = resumenDelMes(tx, modo);
  const fijo = modo === 'PERSONAL' ? ingresoFijo : 0;
  const ingresos = r.ingresos + fijo;
  const gastos = r.gastos;
  const meta = presupuestos[modo] ?? 0;
  const gastosPasado = sumaMapa(gastosPorCategoria(tx, modo, refMesAnterior()));

  if (gastos === 0 && ingresos === 0 && gastosPasado === 0) {
    return {
      estado: 'BIEN',
      titulo: 'Empecemos',
      razon: 'Aún no hay suficientes movimientos para analizar. Anota tus gastos e ingresos y aquí verás cómo vas.',
    };
  }

  // A esta altura del mes, ¿cuánto se esperaría gastar según el mes pasado?
  const hoy = new Date();
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const esperado = gastosPasado * (hoy.getDate() / diasMes);

  // Rojo
  if (ingresos > 0 && gastos > ingresos) {
    return { estado: 'CUIDADO', titulo: 'Cuidado', razon: `Este mes llevas ${pesos(gastos)} de gastos y solo ${pesos(ingresos)} de ingresos: estás gastando más de lo que entra.` };
  }
  if (meta > 0 && gastos > meta) {
    return { estado: 'CUIDADO', titulo: 'Cuidado', razon: `Ya pasaste tu meta de gasto de ${pesos(meta)} (llevas ${pesos(gastos)} este mes).` };
  }
  if (gastosPasado > 0 && gastos > esperado * 1.3) {
    return { estado: 'CUIDADO', titulo: 'Cuidado', razon: `Para esta altura del mes vas gastando bastante más que el mes pasado (${pesos(gastos)}, cuando lo normal sería ~${pesos(Math.round(esperado))}).` };
  }
  // Amarillo
  if (meta > 0 && gastos >= meta * 0.8) {
    return { estado: 'OJO', titulo: 'Atención', razon: `Vas en ${Math.round((gastos / meta) * 100)}% de tu meta de gasto de ${pesos(meta)}.` };
  }
  if (gastosPasado > 0 && gastos > esperado * 1.1) {
    return { estado: 'OJO', titulo: 'Atención', razon: `Vas gastando un poco más que el mes pasado a estas alturas (${pesos(gastos)}, vs ~${pesos(Math.round(esperado))} esperado).` };
  }
  // Verde
  const ahorro = ingresos - gastos;
  return {
    estado: 'BIEN',
    titulo: 'Vas bien',
    razon: ahorro > 0 ? `Vas dentro de lo normal y llevas ${pesos(ahorro)} a favor este mes.` : 'Vas dentro de lo normal para esta altura del mes.',
  };
}

export type GastoInusual = { id: string; nombre: string; icono: string; monto: number; promedio: number; fecha: string };

/** Gastos del mes muy por encima del promedio histórico de su categoría. */
export function gastosInusuales(tx: Transaccion[], modo: Modo): GastoInusual[] {
  const historial = new Map<string, number[]>();
  for (const t of tx) {
    if (t.modo !== modo || t.tipo !== 'GASTO') continue;
    const arr = historial.get(t.categoriaId) ?? [];
    arr.push(t.monto);
    historial.set(t.categoriaId, arr);
  }
  const hoy = new Date();
  const alertas: GastoInusual[] = [];
  for (const t of tx) {
    if (t.modo !== modo || t.tipo !== 'GASTO' || !mismoMes(t.fecha, hoy)) continue;
    const todos = historial.get(t.categoriaId) ?? [];
    if (todos.length < 4) continue; // hace falta historial para comparar
    const promedio = todos.reduce((s, n) => s + n, 0) / todos.length;
    if (promedio > 0 && t.monto >= promedio * 2 && t.monto - promedio >= 150) {
      const cat = categoriaPorId(t.categoriaId);
      alertas.push({ id: t.id, nombre: cat?.nombre ?? 'Movimiento', icono: cat?.icono ?? 'Ellipsis', monto: t.monto, promedio, fecha: t.fecha });
    }
  }
  return alertas.sort((a, b) => b.monto - a.monto).slice(0, 3);
}

// ===========================================================================
// Tienda: resumen por periodo (día/semana/mes) y dinero invertido en mercancía.
// ===========================================================================

export type Periodo = 'dia' | 'semana' | 'mes';

/** Resumen de ingresos/gastos/ganancia de un modo en el periodo dado. */
export function resumenPeriodo(transacciones: Transaccion[], modo: Modo, periodo: Periodo): Resumen {
  const hoy = new Date();
  const dentro = (iso: string) =>
    periodo === 'dia' ? mismoDia(iso, hoy) : periodo === 'semana' ? mismaSemana(iso, hoy) : mismoMes(iso, hoy);
  let ingresos = 0;
  let gastos = 0;
  for (const t of transacciones) {
    if (t.modo !== modo || !dentro(t.fecha)) continue;
    if (t.tipo === 'INGRESO') ingresos += t.monto;
    else gastos += t.monto;
  }
  return { ingresos, gastos, balance: ingresos - gastos };
}

/**
 * Dinero invertido en mercancía/inventario: suma histórica de las compras
 * marcadas como inventario en ese modo. Es una estimación simple del dinero
 * que la usuaria ha puesto en stock (no descuenta lo ya vendido).
 */
export function invertidoEnInventario(transacciones: Transaccion[], modo: Modo): number {
  let total = 0;
  for (const t of transacciones) {
    if (t.modo !== modo || t.tipo !== 'GASTO') continue;
    if (categoriaPorId(t.categoriaId)?.esInventario) total += t.monto;
  }
  return total;
}

// ===========================================================================
// Caja continua: el saldo NUNCA se reinicia. Cada mes es un "período" cuyo
// saldo inicial es el saldo final del mes anterior. Todo se reconstruye a
// partir de los movimientos guardados (que jamás se borran), así que el nuevo
// mes se crea solo y la información histórica queda consultable.
// ===========================================================================

export type PeriodoMes = {
  clave: string; // '2026-06'
  nombre: string; // 'junio de 2026'
  esActual: boolean;
  saldoInicial: number;
  ingresos: number; // en PERSONAL incluye el ingreso fijo del hogar
  gastos: number;
  saldoFinal: number;
  movimientos: Transaccion[]; // del más reciente al más antiguo
};

/**
 * Historial mensual de un modo, del mes más reciente al más antiguo.
 * Recorre desde el mes del primer movimiento hasta el mes actual (incluye
 * meses sin actividad para no romper la cadena de saldos). En PERSONAL, el
 * ingreso fijo del hogar se abona cada mes del período.
 */
export function historialMensual(
  transacciones: Transaccion[],
  modo: Modo,
  ingresoFijo = 0
): PeriodoMes[] {
  const fijo = modo === 'PERSONAL' ? ingresoFijo : 0;
  const propios = transacciones
    .filter((t) => t.modo === modo)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const hoy = new Date();
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const primera = propios.length > 0 ? new Date(propios[0].fecha) : hoy;
  const cursor = new Date(primera.getFullYear(), primera.getMonth(), 1);
  if (cursor > fin) cursor.setTime(fin.getTime()); // fechas futuras: solo el mes actual

  const periodos: PeriodoMes[] = [];
  let saldo = 0;
  let guarda = 0; // tope de seguridad (10 años)
  while (cursor <= fin && guarda++ < 120) {
    const y = cursor.getFullYear();
    const mIdx = cursor.getMonth();
    const movs = propios.filter((t) => {
      const d = new Date(t.fecha);
      return d.getFullYear() === y && d.getMonth() === mIdx;
    });
    let ingresos = fijo;
    let gastos = 0;
    for (const t of movs) {
      if (t.tipo === 'INGRESO') ingresos += t.monto;
      else gastos += t.monto;
    }
    const saldoInicial = saldo;
    saldo = saldoInicial + ingresos - gastos;
    periodos.push({
      clave: `${y}-${String(mIdx + 1).padStart(2, '0')}`,
      nombre: cursor.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
      esActual: y === hoy.getFullYear() && mIdx === hoy.getMonth(),
      saldoInicial,
      ingresos,
      gastos,
      saldoFinal: saldo,
      movimientos: movs.slice().reverse(),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return periodos.reverse(); // más reciente primero
}

/** Saldo acumulado en caja hoy (saldo final del período actual). Nunca se reinicia. */
export function saldoActual(transacciones: Transaccion[], modo: Modo, ingresoFijo = 0): number {
  const h = historialMensual(transacciones, modo, ingresoFijo);
  return h.length > 0 ? h[0].saldoFinal : 0;
}

// ===========================================================================
// Resumen mensual automático: totales por modo + tendencias contra el mes
// pasado. Se calcula sobre los datos ya registrados, así que se "actualiza
// solo" cada mes (siempre mira el mes en curso).
// ===========================================================================

export type ResumenModoMes = {
  ingresos: number;
  gastos: number;
  balance: number;
  /** Solo TIENDA: cuánto se metió en mercancía este mes. */
  inventarioMes?: number;
};

export type Tendencia = { texto: string; tipo: TipoConsejo };

export type ResumenMensual = {
  mesNombre: string;
  hayDatos: boolean;
  porModo: Record<Modo, ResumenModoMes>;
  tendencias: Tendencia[];
};

function inventarioDelMes(tx: Transaccion[], modo: Modo, ref: Date): number {
  let total = 0;
  for (const t of tx) {
    if (t.modo !== modo || t.tipo !== 'GASTO' || !mismoMes(t.fecha, ref)) continue;
    if (categoriaPorId(t.categoriaId)?.esInventario) total += t.monto;
  }
  return total;
}

function pctCambio(actual: number, previo: number): number | null {
  return previo > 0 ? Math.round(((actual - previo) / previo) * 100) : null;
}

export function resumenMensual(transacciones: Transaccion[], ingresoFijo = 0): ResumenMensual {
  const hoy = new Date();
  const mesNombre = hoy.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const porModo = {} as Record<Modo, ResumenModoMes>;
  for (const modo of ['PERSONAL', 'NEGOCIO', 'TIENDA'] as Modo[]) {
    const r = resumenDelMes(transacciones, modo);
    const fijo = modo === 'PERSONAL' ? ingresoFijo : 0;
    const ingresos = r.ingresos + fijo;
    const entry: ResumenModoMes = { ingresos, gastos: r.gastos, balance: ingresos - r.gastos };
    if (modo === 'TIENDA') entry.inventarioMes = inventarioDelMes(transacciones, modo, hoy);
    porModo[modo] = entry;
  }

  const hayDatos =
    porModo.PERSONAL.ingresos + porModo.PERSONAL.gastos +
      porModo.NEGOCIO.ingresos + porModo.NEGOCIO.gastos +
      porModo.TIENDA.ingresos + porModo.TIENDA.gastos >
    0;

  // Tendencias (solo las que tengan mes pasado con qué comparar).
  const tendencias: Tendencia[] = [];

  // Casa: gasto total y la categoría que más creció.
  const casa = comparacionMensual(transacciones, 'PERSONAL', ingresoFijo);
  if (casa.hayMesPasado) {
    const g = pctCambio(casa.gastosEste, casa.gastosPasado);
    if (g !== null && Math.abs(g) >= 5) {
      tendencias.push({
        texto: `Gastaste ${Math.abs(g)}% ${g < 0 ? 'menos' : 'más'} que el mes pasado en la casa.`,
        tipo: g < 0 ? 'BIEN' : 'OJO',
      });
    }
    const subio = casa.cambios.find((c) => c.dir === 'mas' && c.pct !== null && c.pct >= 0.15);
    if (subio) {
      tendencias.push({
        texto: `Los gastos de ${subio.nombre.toLowerCase()} crecieron ${Math.round((subio.pct ?? 0) * 100)}%.`,
        tipo: 'OJO',
      });
    }
  }

  // Casa: ingresos.
  if (casa.hayMesPasado) {
    const ingPasado = casa.ahorroPasado + casa.gastosPasado; // ingresos = ahorro + gastos
    const ingEste = casa.ahorroEste + casa.gastosEste;
    const i = pctCambio(ingEste, ingPasado);
    if (i !== null && i >= 5) {
      tendencias.push({ texto: `Tus ingresos de la casa aumentaron ${i}%.`, tipo: 'BIEN' });
    }
  }

  // Tienda: ganancia.
  const tienda = comparacionMensual(transacciones, 'TIENDA', 0);
  if (tienda.hayMesPasado) {
    const gan = pctCambio(porModo.TIENDA.balance, tienda.ahorroPasado);
    if (gan !== null && Math.abs(gan) >= 5) {
      tendencias.push({
        texto: `La ganancia de la tienda ${gan >= 0 ? 'mejoró' : 'bajó'} ${Math.abs(gan)}%.`,
        tipo: gan >= 0 ? 'BIEN' : 'CUIDADO',
      });
    }
  }

  // Negocio: resultado neto.
  const neg = comparacionMensual(transacciones, 'NEGOCIO', 0);
  if (neg.hayMesPasado) {
    const n = pctCambio(porModo.NEGOCIO.balance, neg.ahorroPasado);
    if (n !== null && Math.abs(n) >= 5) {
      tendencias.push({
        texto: `El resultado del negocio ${n >= 0 ? 'mejoró' : 'bajó'} ${Math.abs(n)}%.`,
        tipo: n >= 0 ? 'BIEN' : 'CUIDADO',
      });
    }
  }

  return { mesNombre, hayDatos, porModo, tendencias: tendencias.slice(0, 5) };
}
