# Cafecito ☕

App de finanzas **ultra-simple** para administrar un pequeño negocio de café y las finanzas personales, pensada para alguien que se abruma con tablas y números. Todo es visual: la idea de una **taza que se llena o se vacía**, botones gigantes y registro de un gasto en **3 toques**.

## Idea central: "Dos Caras"

Un switch gigante alterna entre dos modos:

- 🏠 **Mi casa** — gastos personales (súper, antojos, salidas).
- ☕ **El negocio** — ventas de café, insumos y servicios de la tienda.

## Stack

- **Expo SDK 56** (React Native 0.85, React 19) — Android, iPhone y web con un solo código.
- **expo-router** — navegación basada en archivos.
- **TypeScript** estricto.
- _(Próximamente)_ react-native-svg + Reanimated para la taza animada, expo-sqlite + Drizzle (offline-first) y Supabase (respaldo en la nube).

## Cómo correrlo

```bash
npm install
npx expo start
```

Instala **Expo Go** en tu teléfono y escanea el QR. Cada cambio se refleja al instante.

> Nota: el proyecto usa `legacy-peer-deps` (ver `.npmrc`) por la novedad del SDK 56.

## Estructura

```
app/
  _layout.tsx   Raíz: área segura + proveedor de modo + navegación
  index.tsx     Pantalla de Inicio
src/
  theme/        Sistema de diseño (colores, tipografías, los 2 modos)
  state/        Estado global del modo "Dos Caras"
  components/   Componentes reutilizables (el switch gigante)
```
