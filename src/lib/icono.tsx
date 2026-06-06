import { ImageResponse } from 'next/og';
import { COLOR_MARCA } from './theme';

/**
 * Genera el ícono de la app (un café estilizado sobre el color de marca)
 * en el tamaño pedido. Se usa para el manifest PWA (192 y 512 px).
 * Lo dibujamos con formas simples para no depender de fuentes de emoji.
 */
export function iconoResponse(size: number): ImageResponse {
  const taza = size * 0.62; // diámetro del "platillo/taza" blanco
  const cafe = size * 0.4; // diámetro del círculo de café

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLOR_MARCA,
        }}
      >
        <div
          style={{
            width: taza,
            height: taza,
            borderRadius: taza,
            backgroundColor: '#FBF7F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: cafe,
              height: cafe,
              borderRadius: cafe,
              backgroundColor: COLOR_MARCA,
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
