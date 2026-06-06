import { iconoResponse } from '@/lib/icono';

export const dynamic = 'force-static';

export function GET() {
  return iconoResponse(192);
}
