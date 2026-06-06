import type { ReactNode } from 'react';

/** Tarjeta de vidrio esmerilado (glassmorphism). */
export function Glass({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`glass rounded-[28px] ${className}`} style={style}>
      {children}
    </div>
  );
}
