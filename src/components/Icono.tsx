/**
 * Mapeo de nombres a íconos de lucide-react. Importamos solo los que usamos
 * para mantener el bundle ligero. Cero emojis en todo el proyecto.
 */
import {
  House,
  Coffee,
  Package,
  Zap,
  Ellipsis,
  ShoppingCart,
  Candy,
  Utensils,
  Wallet,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Plus,
  Lightbulb,
  Check,
  X,
  Delete,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Target,
  ChartColumn,
  Send,
  Store,
  MessageCircle,
  HandCoins,
  User,
  TriangleAlert,
  ChevronDown,
  PiggyBank,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

const MAPA: Record<string, ComponentType<LucideProps>> = {
  House,
  Coffee,
  Package,
  Zap,
  Ellipsis,
  ShoppingCart,
  Candy,
  Utensils,
  Wallet,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Plus,
  Lightbulb,
  Check,
  X,
  Delete,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Target,
  ChartColumn,
  Send,
  Store,
  MessageCircle,
  HandCoins,
  User,
  TriangleAlert,
  ChevronDown,
  PiggyBank,
};

export function Icono({ nombre, ...props }: { nombre: string } & LucideProps) {
  const Comp = MAPA[nombre] ?? Ellipsis;
  return <Comp absoluteStrokeWidth strokeWidth={1.75} {...props} />;
}
