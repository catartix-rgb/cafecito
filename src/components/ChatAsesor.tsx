'use client';

/**
 * Asesor financiero por chat. Lee los datos locales (RAG), los envía al
 * route handler /api/asesor y muestra la respuesta de la IA en streaming.
 * Estilo liquid glass, sin emojis, con chips de sugerencias para cero fricción.
 */
import { useEffect, useRef, useState } from 'react';
import { modos } from '@/lib/theme';
import { construirContexto } from '@/lib/contexto';
import { useModo } from '@/state/mode';
import { useTransacciones } from '@/state/useTransacciones';
import { usePresupuestos } from '@/state/usePresupuestos';
import { useIngresoFijo } from '@/state/useIngresoFijo';
import { useMetas } from '@/state/useMetas';
import { Icono } from './Icono';

type Mensaje = { role: 'user' | 'assistant'; content: string };

const CHIPS = [
  { icono: 'ChartColumn', etiqueta: 'Resumen de la semana', prompt: '¿Cómo me fue esta semana con mi dinero?' },
  { icono: 'Candy', etiqueta: 'Mis gastos hormiga', prompt: '¿En qué se me están yendo los antojos?' },
  { icono: 'HandCoins', etiqueta: 'Gastos de Pablo y Alex', prompt: '¿Cuánto les he dado a Pablo y a Alex este mes? Dame el desglose de cada uno.' },
  { icono: 'Store', etiqueta: 'Salud de la tienda', prompt: '¿Cómo va mi negocio de café este mes?' },
];

export function ChatAsesor({ onClose }: { onClose: () => void }) {
  const { modo } = useModo();
  const m = modos[modo];
  const transacciones = useTransacciones();
  const presupuestos = usePresupuestos();
  const ingresoFijo = useIngresoFijo();
  const metas = useMetas();

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);

  const finRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  async function enviar(pregunta: string) {
    const limpio = pregunta.trim();
    if (!limpio || cargando) return;

    const historial: Mensaje[] = [...mensajes, { role: 'user', content: limpio }];
    setMensajes([...historial, { role: 'assistant', content: '' }]);
    setTexto('');
    setCargando(true);

    try {
      const res = await fetch('/api/asesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historial,
          contexto: construirContexto(transacciones, presupuestos, ingresoFijo, metas),
        }),
      });

      if (!res.ok || !res.body) {
        const aviso = await res.text().catch(() => '');
        ponerRespuesta(aviso || 'No pude responder en este momento. Intenta de nuevo.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = '';
      let primer = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        if (primer) {
          setCargando(false);
          primer = false;
        }
        ponerRespuesta(acumulado);
      }
    } catch {
      ponerRespuesta('No hubo internet o falló la conexión. Intenta de nuevo en un ratito.');
    } finally {
      setCargando(false);
    }
  }

  /** Reemplaza el contenido del último mensaje (el del asistente). */
  function ponerRespuesta(contenido: string) {
    setMensajes((prev) => {
      const copia = [...prev];
      copia[copia.length - 1] = { role: 'assistant', content: contenido };
      return copia;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
        {/* Encabezado */}
        <header className="glass-fuerte flex items-center gap-3 px-5 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: m.acento, color: '#1a120c' }}
          >
            <Icono nombre="MessageCircle" size={22} />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold">Tu asesor</h2>
            <p className="text-sm text-white/55">Pregúntale sobre tu dinero</p>
          </div>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Icono nombre="X" size={20} />
          </button>
        </header>

        {/* Mensajes */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
          {mensajes.length === 0 && (
            <div className="glass aparecer mx-auto mt-6 max-w-[18rem] rounded-3xl p-5 text-center">
              <span
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: m.suave, color: m.acento }}
              >
                <Icono nombre="Sparkles" size={26} />
              </span>
              <p className="text-lg font-bold">Hola, aquí estoy</p>
              <p className="mt-1 text-white/70">
                Pregúntame lo que quieras sobre tus ventas o tus gastos. Toca un botón de abajo o escríbeme.
              </p>
            </div>
          )}

          {mensajes.map((msg, i) =>
            msg.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div
                  className="max-w-[80%] rounded-3xl rounded-br-lg px-4 py-3 text-[17px] font-medium"
                  style={{ background: m.acento, color: '#1a120c' }}
                >
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start">
                <div className="glass max-w-[85%] rounded-3xl rounded-bl-lg px-4 py-3 text-[17px] leading-relaxed text-white/95">
                  {msg.content || <PuntosCargando />}
                </div>
              </div>
            )
          )}

          {/* Indicador de carga separado, por si el último mensaje aún está vacío */}
          {cargando && mensajes[mensajes.length - 1]?.content === '' && null}
          <div ref={finRef} />
        </div>

        {/* Chips de sugerencias */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {CHIPS.map((c) => (
            <button
              key={c.etiqueta}
              onClick={() => enviar(c.prompt)}
              disabled={cargando}
              className="glass flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <Icono nombre={c.icono} size={18} style={{ color: m.acento }} />
              {c.etiqueta}
            </button>
          ))}
        </div>

        {/* Barra de escritura */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
          className="glass-fuerte flex items-center gap-2 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3"
        >
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu pregunta…"
            aria-label="Escribe tu pregunta"
            className="flex-1 rounded-full bg-white/10 px-5 py-3.5 text-[17px] text-white placeholder:text-white/45 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Enviar"
            disabled={cargando || texto.trim() === ''}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-40"
            style={{ background: m.acento, color: '#1a120c' }}
          >
            <Icono nombre="Send" size={22} />
          </button>
        </form>
      </div>
    </div>
  );
}

function PuntosCargando() {
  return (
    <span className="flex items-center gap-1.5 py-1" aria-label="Pensando">
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/60" />
    </span>
  );
}
