import type { MetadataRoute } from 'next';
import { COLOR_FONDO, COLOR_MARCA } from '@/lib/theme';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cafecito',
    short_name: 'Cafecito',
    description: 'Tus finanzas, fáciles y visuales. Para tu casa y tu negocio de café.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: COLOR_FONDO,
    theme_color: COLOR_FONDO,
    lang: 'es',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
