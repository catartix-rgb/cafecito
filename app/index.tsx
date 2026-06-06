import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwitchDosCaras } from '../src/components/SwitchDosCaras';
import { useModo } from '../src/state/mode';
import { espacio, modos, palette, radio, texto } from '../src/theme';

export default function Inicio() {
  const { modo } = useModo();
  const insets = useSafeAreaInsets();
  const m = modos[modo];

  return (
    <View style={[estilos.pantalla, { paddingTop: insets.top + espacio.md }]}>
      {/* Saludo */}
      <Text style={estilos.saludo}>Hola, ma 👋</Text>
      <Text style={estilos.subtitulo}>¿Qué vamos a anotar?</Text>

      {/* El Switch Gigante de Dos Caras */}
      <View style={estilos.bloqueSwitch}>
        <SwitchDosCaras />
      </View>

      {/* Tarjeta de "La Taza" (por ahora un adelanto; la animación llega después) */}
      <View style={[estilos.tarjetaTaza, { backgroundColor: m.colorSuave }]}>
        <Text style={estilos.tazaIcono}>{m.icono}</Text>
        <Text style={[estilos.tazaModo, { color: m.color }]}>{m.nombre}</Text>
        <Text style={estilos.tazaTexto}>
          {modo === 'NEGOCIO'
            ? 'Aquí verás cómo va tu café: ventas, insumos y servicios.'
            : 'Aquí verás tus gastos de la casa: súper, antojos y salidas.'}
        </Text>
      </View>

      {/* Botón gigante de registrar */}
      <View style={[estilos.zonaBoton, { paddingBottom: insets.bottom + espacio.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Anotar un movimiento"
          style={({ pressed }) => [
            estilos.botonRegistrar,
            { backgroundColor: m.color, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[estilos.botonMas, { color: m.contraste }]}>+</Text>
          <Text style={[estilos.botonTexto, { color: m.contraste }]}>Anotar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingHorizontal: espacio.md,
    backgroundColor: palette.crema,
  },
  saludo: {
    fontSize: texto.titulo,
    fontWeight: '800',
    color: palette.tinta,
  },
  subtitulo: {
    fontSize: texto.cuerpo,
    color: palette.tintaSuave,
    marginTop: espacio.xs,
  },
  bloqueSwitch: {
    marginTop: espacio.lg,
  },
  tarjetaTaza: {
    flex: 1,
    marginTop: espacio.lg,
    borderRadius: radio.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.lg,
    gap: espacio.sm,
  },
  tazaIcono: {
    fontSize: 96,
  },
  tazaModo: {
    fontSize: texto.titulo,
    fontWeight: '800',
  },
  tazaTexto: {
    fontSize: texto.cuerpo,
    color: palette.tintaSuave,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 280,
  },
  zonaBoton: {
    paddingTop: espacio.md,
  },
  botonRegistrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio.sm,
    borderRadius: radio.pildora,
    minHeight: 76, // botón GIGANTE
    shadowColor: palette.tinta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  botonMas: {
    fontSize: 40,
    fontWeight: '800',
    marginTop: -4,
  },
  botonTexto: {
    fontSize: texto.subtitulo,
    fontWeight: '800',
  },
});
