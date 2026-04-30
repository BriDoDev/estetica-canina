---
version: alpha
name: Paws & Glow — Warm Pastel Canine
description: Estética canina premium con diagnóstico IA. Vibrante, amigable, accesible.
colors:
  primary: "#FF8C7A"
  on-primary: "#4A1E1E"
  primary-container: "#FFDAD6"
  on-primary-container: "#410002"
  secondary: "#B5EAD7"
  on-secondary: "#3A6B5C"
  secondary-container: "#D6F7EC"
  tertiary: "#C3B1E1"
  on-tertiary: "#4A3F6B"
  tertiary-container: "#E8DEF8"
  neutral: "#FFF8F0"
  on-neutral: "#4A3F6B"
  surface: "#FFFFFF"
  on-surface: "#4A3F6B"
  surface-dim: "#F5EDFA"
  surface-bright: "#FFF8F0"
  outline: "#F0E4D4"
  error: "#FFB3B3"
  on-error: "#7A3B3B"
  error-container: "#FFDAD6"
  success: "#A8E6CF"
  on-success: "#3A6B5C"
  warning: "#FFE5B4"
  on-warning: "#7A5C3B"
typography:
  headline-lg:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
  headline-md:
    fontFamily: Quicksand
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
  headline-sm:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
  label-lg:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.04em
rounded:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 16px
components:
  card-elevated:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-outlined:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-filled:
    backgroundColor: "{colors.surface-dim}"
    rounded: "{rounded.lg}"
    padding: 24px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 12px
  badge:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.xs}"
    padding: 6px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 12px
  sidebar-item:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 10px
  sidebar-item-active:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.sm}"
  table-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: 12px
  table-row-hover:
    backgroundColor: "{colors.surface-dim}"
  stat-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 20px
  chip-filter:
    backgroundColor: "{colors.surface-dim}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xs}"
    padding: 8px
  chip-filter-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xs}"
    padding: 8px
---

## Overview

Paws & Glow es una plataforma de estética canina premium con diagnóstico por IA. La interfaz debe transmitir **calidez, confianza y profesionalismo canino**.

**Brand personality**: Amigable, profesional, moderno, accesible. El diseño debe sentirse como una boutique de mascotas premium — limpio pero acogedor, eficiente pero no frío.

**Target**: Dueños de mascotas (consumidores) y administradores de estéticas caninas (staff). El consumidor ve una landing page cálida y confiable. El staff ve un backoffice productivo y claro.

## Colors

La paleta usa tonos **pastel vibrantes** que evocan el mundo canino.

- **Primary (#FF8C7A):** Coral cálido — el color de acción principal. Botones, links, indicadores activos. Evoca energía y cuidado.
- **Secondary (#B5EAD7):** Menta suave — elementos secundarios, badges de éxito, fondos de cards informativas.
- **Tertiary (#C3B1E1):** Lavanda — acentos decorativos, hover states, elementos premium.
- **Neutral (#FFF8F0):** Crema cálida — fondo global. Más suave que blanco puro.
- **Surface (#FFFFFF):** Blanco puro solo para cards elevadas — contraste limpio.
- **Surface-Dim (#F5EDFA):** Lavanda muy clara para fondos secundarios y rows alternadas.
- **Success (#A8E6CF):** Verde pastel para estados completados y confirmaciones.
- **Warning (#FFE5B4):** Ámbar pastel para alertas no críticas.
- **Error (#FFB3B3):** Rosa suave para errores (no rojo agresivo).

**Regla de contraste**: Todo texto debe cumplir WCAG AA (4.5:1). El texto oscuro (#4A3F6B) sobre fondo crema pasa. El texto blanco sobre coral primario pasa.

## Typography

Toda la interfaz usa **Quicksand** — una fuente geométrica y amigable con curvas redondeadas que refuerza la personalidad de la marca.

- **Headlines**: Quicksand Bold (700) — para títulos de página y secciones principales.
- **Body**: Quicksand Regular (400) — contenido general, descripciones, tablas.
- **Labels**: Quicksand Medium (500) con letter-spacing — badges, chips, etiquetas de filtro.

**Regla**: No usar más de 2 pesos de fuente por pantalla. Bold solo para headlines. Regular/Medium para todo lo demás.

## Layout

**Grid**: Columnas flexibles con grid CSS. Tarjetas de estadísticas en 4-columnas (desktop) → 2-columnas (mobile).

**Spacing**: Escala base de 8px. Cards con 24px de padding interno. Gutter de 24px entre columnas. Margen lateral de 16px en mobile, 24px en desktop.

**Responsive**: Mobile-first. Breakpoints: sm (640px), lg (1024px). Sidebar colapsa en mobile (<1024px).

## Elevation & Depth

**Tonal Layers**: La profundidad se logra con colores, no sombras pesadas.

- Cards elevadas (stat cards): Sombra suave colored (`0 4px 14px -2px rgba(255,140,122,0.15)`) — eleva sin ser agresiva.
- Cards outlined (tablas, listas): Sin sombra, borde sutil (`#F0E4D4`).
- Cards filled (sidebar, chips): Fondo de color sin sombra ni borde.

## Shapes

**Redondez generosa**: Todo elemento interactivo usa bordes redondeados para reforzar la sensación amigable y orgánica.

- Botones: 12px border-radius
- Cards: 20px border-radius
- Inputs: 12px border-radius
- Chips/badges: 8px border-radius
- Avatares: full (circular)

**Regla**: No mezclar esquinas cuadradas con redondeadas en la misma vista. Todo sigue la misma escala de redondez.

## Components

### Dashboard Cards
- **Stat cards**: Elevated, 20px rounded, 20px padding. Icono abajo, valor grande arriba.
- **Recent items card**: Outlined, sin sombra. Items con hover background (#F5EDFA). Avatares circulares con gradiente.

### Buttons
- **Primary**: Coral (#FF8C7A) fondo, texto blanco, 12px rounded, 12px padding. Hover: Lavanda (#C3B1E1).
- **Outline**: Transparente, borde slate-200, texto oscuro.
- **Ghost**: Sin borde, solo texto. Para acciones destructivas (cancelar).

### Chips & Filters
- **Inactive**: Fondo surface-dim, texto on-surface. 8px rounded.
- **Active**: Fondo primary, texto blanco. Sin borde.

### Table Rows
- **Default**: Fondo surface, 12px rounded. Sin bordes entre filas.
- **Hover**: Fondo surface-dim. Transición suave 200ms.

### Sidebar
- **Active item**: Fondo primary-container, texto on-primary-container. 12px rounded.
- **Inactive item**: Transparente, texto on-surface. Hover: surface-dim.

## Do's and Don'ts

- ✅ Usar el color primario SOLO para la acción más importante por pantalla
- ✅ Mantener WCAG AA (4.5:1) para todo texto normal
- ✅ Usar máximo 2 pesos de fuente por pantalla
- ✅ Bordes redondeados consistentes (escala 8-12-16-20)
- ✅ Sombras de color (coral/lavanda), nunca negras
- ❌ No mezclar esquinas cuadradas con redondeadas
- ❌ No usar rojo puro para errores (usar rosa pastel)
- ❌ No más de un botón primario por vista
- ❌ No texto sobre imágenes sin overlay de contraste
