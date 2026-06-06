'use client';

/**
 * Taza-medidor: una taza dibujada con trazos finos que se "llena" según un
 * porcentaje (0 a 1). Es la metáfora central, sin emojis. El líquido sube con
 * una transición suave para que se sienta premium.
 */
const CUERPO = 'M30,36 L90,36 L84,102 Q82,114 70,114 L50,114 Q38,114 36,102 Z';

export function TazaGauge({
  pct,
  accent,
  size = 188,
}: {
  pct: number;
  accent: string;
  size?: number;
}) {
  const p = Math.max(0, Math.min(1, isFinite(pct) ? pct : 0));
  const yBase = 113;
  const yTope = 42;
  const ySuperficie = yBase - p * (yBase - yTope);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 130"
      fill="none"
      role="img"
      aria-label={`Taza llena al ${Math.round(p * 100)} por ciento`}
    >
      <defs>
        <clipPath id="recorteTaza">
          <path d={CUERPO} />
        </clipPath>
      </defs>

      {/* Vapor (dos trazos finos, vivos pero sutiles) */}
      <path d="M52,18 q6,-6 0,-12" stroke="rgba(255,255,255,0.35)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M68,18 q6,-6 0,-12" stroke="rgba(255,255,255,0.35)" strokeWidth="2.4" strokeLinecap="round" />

      {/* Interior tenue de la taza */}
      <path d={CUERPO} fill="rgba(255,255,255,0.06)" />

      {/* Líquido que sube */}
      <g clipPath="url(#recorteTaza)">
        <rect
          x="28"
          y={ySuperficie}
          width="64"
          height={yBase - ySuperficie + 4}
          fill={accent}
          opacity={0.92}
          style={{ transition: 'y 0.7s cubic-bezier(0.22,1,0.36,1), height 0.7s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <ellipse
          cx="60"
          cy={ySuperficie}
          rx="32"
          ry="3.5"
          fill="#fff"
          opacity={0.25}
          style={{ transition: 'cy 0.7s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </g>

      {/* Contorno de la taza */}
      <path d={CUERPO} stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinejoin="round" />
      {/* Asa */}
      <path
        d="M90,50 q20,0 18,21 q-2,18 -20,15"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Platillo */}
      <path d="M34,122 L86,122" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
