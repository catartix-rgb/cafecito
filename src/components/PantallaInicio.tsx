'use client';

/**
 * Pantalla de Inicio. Al cambiar de modo con el switch, toda la pantalla
 * reacciona: saludo, colores, la tarjeta de "la taza" y el botón gigante.
 */
import { modos } from '@/lib/theme';
import { useModo } from '@/state/mode';
import { SwitchDosCaras } from './SwitchDosCaras';

export function PantallaInicio() {
  const { modo } = useModo();
  const m = modos[modo];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8 pb-6">
      {/* Saludo */}
      <h1 className="text-3xl font-extrabold text-tinta">Hola, ma 👋</h1>
      <p className="mt-1 text-lg text-tinta-suave">¿Qué vamos a anotar?</p>

      {/* El Switch Gigante de Dos Caras */}
      <div className="mt-8">
        <SwitchDosCaras />
      </div>

      {/* Tarjeta de "La Taza" (adelanto; la animación llega en el próximo paso) */}
      <section
        className="mt-8 flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl p-8 text-center transition-colors duration-300"
        style={{ backgroundColor: m.colorSuave }}
      >
        <span className="text-8xl leading-none" aria-hidden>
          {m.icono}
        </span>
        <p className="text-3xl font-extrabold" style={{ color: m.color }}>
          {m.nombre}
        </p>
        <p className="max-w-[18rem] text-lg leading-relaxed text-tinta-suave">{m.descripcion}</p>
      </section>

      {/* Botón gigante de registrar */}
      <button
        type="button"
        aria-label="Anotar un movimiento"
        className="mt-6 flex min-h-[76px] items-center justify-center gap-2 rounded-full text-xl font-extrabold shadow-lg transition-transform active:scale-[0.98]"
        style={{ backgroundColor: m.color, color: m.contraste }}
      >
        <span className="text-4xl leading-none">+</span>
        <span>Anotar</span>
      </button>
    </main>
  );
}
