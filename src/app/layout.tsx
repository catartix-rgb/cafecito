import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { ProveedorModo } from '@/state/mode';
import { RegistroSW } from '@/components/RegistroSW';
import { COLOR_FONDO } from '@/lib/theme';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cafecito',
  description: 'Tus finanzas, fáciles y visuales. Para tu casa y tu negocio de café.',
  applicationName: 'Cafecito',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cafecito',
  },
};

export const viewport: Viewport = {
  themeColor: COLOR_FONDO,
  width: 'device-width',
  initialScale: 1,
  // No desactivamos el zoom: una persona mayor puede querer acercar el texto.
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full">
        <ProveedorModo>{children}</ProveedorModo>
        <RegistroSW />
      </body>
    </html>
  );
}
