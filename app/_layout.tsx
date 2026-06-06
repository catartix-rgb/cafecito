import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProveedorModo } from '../src/state/mode';
import { palette } from '../src/theme';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <ProveedorModo>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.crema },
          }}
        />
      </ProveedorModo>
    </SafeAreaProvider>
  );
}
