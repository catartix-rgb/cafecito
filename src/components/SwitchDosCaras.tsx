/**
 * Switch Gigante "Dos Caras" — el control más importante de la app.
 * Dos mitades enormes (Mi casa / El negocio). La mitad activa se pinta
 * con el color de su modo; la otra queda apagada. Área de toque muy grande.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { espacio, modos, palette, radio, texto, type Modo } from '../theme';
import { useModo } from '../state/mode';

export function SwitchDosCaras() {
  const { modo, setModo } = useModo();

  return (
    <View style={estilos.contenedor} accessibilityRole="tablist">
      <MitadSwitch valor="PERSONAL" activo={modo === 'PERSONAL'} onPress={() => setModo('PERSONAL')} />
      <MitadSwitch valor="NEGOCIO" activo={modo === 'NEGOCIO'} onPress={() => setModo('NEGOCIO')} />
    </View>
  );
}

function MitadSwitch({
  valor,
  activo,
  onPress,
}: {
  valor: Modo;
  activo: boolean;
  onPress: () => void;
}) {
  const m = modos[valor];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={m.nombre}
      style={[
        estilos.mitad,
        { backgroundColor: activo ? m.color : 'transparent' },
      ]}
    >
      <Text style={estilos.icono}>{m.icono}</Text>
      <Text
        style={[
          estilos.etiqueta,
          { color: activo ? m.contraste : palette.tintaSuave },
        ]}
        numberOfLines={1}
      >
        {m.nombre}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    backgroundColor: palette.blanco,
    borderRadius: radio.pildora,
    padding: espacio.xs,
    borderWidth: 2,
    borderColor: palette.borde,
    // sombra suave (iOS + Android)
    shadowColor: palette.tinta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mitad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio.sm,
    paddingVertical: espacio.md,
    borderRadius: radio.pildora,
    minHeight: 64, // área de toque amplia
  },
  icono: {
    fontSize: 30,
  },
  etiqueta: {
    fontSize: texto.subtitulo,
    fontWeight: '800',
  },
});
