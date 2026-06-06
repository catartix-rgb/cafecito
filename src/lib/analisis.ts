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
