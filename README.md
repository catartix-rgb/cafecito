# Cafecito ☕

App de finanzas **ultra-simple** para administrar un pequeño negocio de café y las finanzas personales, pensada para alguien que se abruma con tablas y números. Todo es visual: la idea de una **taza que se llena o se vacía**, botones gigantes y registro de un gasto en **3 toques**.

Es una **PWA (Progressive Web App)**: se abre en el navegador del teléfono y se puede **instalar en la pantalla de inicio** para que se vea y funcione como una app normal, incluso sin internet.

## Idea central: "Dos Caras"

Un switch gigante alterna entre dos modos:

- 🏠 **Mi casa** — gastos personales (súper, antojos, salidas).
- ☕ **El negocio** — ventas de café, insumos y servicios de la tienda.

## Stack

- **Next.js 16** (App Router) + **React 19** — desplegado en Vercel.
- **Tailwind CSS v4** — interfaz muy visual, rápida de construir.
- **PWA** — manifest + service worker (instalable y offline).
- **TypeScript** estricto.
- _(Próximamente)_ animación de la taza, IndexedDB (offline-first) y Supabase (respaldo en la nube).

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para probar la instalación PWA en tu teléfono, despliega a Vercel (necesita HTTPS).

## Desplegar a Vercel

Conecta este repositorio en [vercel.com/new](https://vercel.com/new). Vercel detecta Next.js automáticamente; no requiere configuración.

## Estructura

```
src/
  app/
    layout.tsx        Layout raíz (idioma, metadatos, proveedor de modo)
    page.tsx          Página de inicio
    manifest.ts       Manifest PWA
    icon*.tsx         Íconos generados por código
  components/         Switch Dos Caras, pantalla de inicio, registro del SW
  state/              Estado global del modo (con persistencia)
  lib/                Sistema de diseño (tema) y generador de íconos
public/
  sw.js               Service worker (offline)
```
