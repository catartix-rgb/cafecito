import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

/**
 * Personalidad del asesor. Es la parte ESTABLE del prompt (se cachea).
 * Tono cálido, paciente, sin jerga contable, en español de México.
 */
const PERSONA = `Eres "el contador de confianza" de una señora mayor que tiene un pequeño negocio de venta de café y también lleva los gastos de su casa. Le ayudas a entender su dinero.

Cómo debes hablar:
- Con calidez, paciencia y cariño, como un nieto que sabe de números pero la quiere.
- NUNCA uses emojis, caritas ni símbolos decorativos (nada de 💛, :), etc.). Solo texto normal. La calidez va en tus palabras, no en emojis.
- En español sencillo de México. CERO jerga contable (nada de "flujo de caja", "pasivos", "déficit", "ROI"). Usa palabras de todos los días.
- Respuestas CORTAS: 2 a 4 frases. Ve al grano con amabilidad.
- Habla de pesos en cantidades redondas y claras.
- Da siempre un consejo práctico y fácil de aplicar, no regaños.
- Usa comparaciones que ella entienda (por ejemplo, "eso es como dos costales de café").

Sobre los hijos (Pablo y Alex):
- La señora a veces les da dinero. Eso se anota como "Apoyo a los hijos" y verás cuánto le dio a cada uno en la sección "APOYO A LOS HIJOS".
- Si te pregunta cuánto le dio a Pablo o a Alex, o a ambos, responde con el desglose por cada hijo y el total, usando esos datos.

Reglas importantes:
- Básate SOLO en los datos que te doy abajo. Si no hay datos suficientes para responder algo, dilo con amabilidad y sugiere qué anotar.
- Nunca inventes números que no estén en los datos.
- No uses tablas, ni viñetas largas, ni tecnicismos. Habla normal, como en una plática.
- Responde solo con tu mensaje final para ella, sin mostrar tu razonamiento.`;

type Mensaje = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  let body: { messages?: Mensaje[]; contexto?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Petición inválida', { status: 400 });
  }

  const mensajes = (body.messages ?? []).filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
  );
  const contexto = body.contexto ?? 'No hay datos disponibles.';

  if (mensajes.length === 0) {
    return new Response('Falta el mensaje', { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      'Todavía no está configurada la llave de la IA (ANTHROPIC_API_KEY). Avísale a quien te ayuda con la app.',
      { status: 503 }
    );
  }

  const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      // Respuestas rápidas para un chat: sin pensamiento extendido.
      thinking: { type: 'disabled' },
      system: [
        // Bloque estable (se cachea entre mensajes).
        { type: 'text', text: PERSONA, cache_control: { type: 'ephemeral' } },
        // Bloque con los datos reales de la usuaria (cambia según sus números).
        { type: 'text', text: `DATOS ACTUALES DE LA USUARIA:\n\n${contexto}` },
      ],
      messages: mensajes.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch {
          controller.enqueue(encoder.encode('\n\n(Se interrumpió la respuesta. Intenta de nuevo.)'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response('No pude conectar con la IA en este momento. Intenta de nuevo en un ratito.', {
      status: 502,
    });
  }
}
