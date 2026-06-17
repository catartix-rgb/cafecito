/**
 * Filtro SVG global para la refracción del "liquid glass".
 * feTurbulence genera un mapa de ruido suave y feDisplacementMap desplaza el
 * fondo (SourceGraphic) según ese mapa, simulando cómo se deforma la luz al
 * pasar por un vidrio real. Se referencia desde CSS con backdrop-filter:
 * url(#liquid-glass). El SVG no ocupa espacio (0x0, oculto).
 */
export function GlassFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <filter
        id="liquid-glass"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.012"
          numOctaves={2}
          seed={7}
          result="ruido"
        />
        <feGaussianBlur in="ruido" stdDeviation={2} result="mapaSuave" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="mapaSuave"
          scale={18}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
