/**
 * Tokens de design derivados da paleta "Mystery and transcendence in
 * education" (esquema Goethe — Zur Farbenlehre, 1810), aplicada ao
 * Mensageiros da Paz a pedido do Head em 2026-09-21. Ver DECISIONS.md.
 * Nunca preto puro (#000) nem branco puro (#FFF).
 */

export const colors = {
  primary: "#4B4C00", // Sprout (verde-oliva escuro)
  primaryLight: "#838338", // Mustard
  background: "#D2D8FF", // Pale violet
  surface: "#E7E9FF", // tinta clara de Pale violet, para cartões/inputs
  accent: "#FC9997", // Sealing wax
  textPrimary: "#270000", // Deep terracotta
  textSecondary: "#5C4A2E", // tom escurecido de Mustard, para texto secundário legível
  success: "#4B4C00", // Sprout
  darkBackground: "#270000", // Deep terracotta
} as const;

export const darkColors = {
  ...colors,
  background: colors.darkBackground,
  surface: "#3A1414",
  textPrimary: "#D2D8FF",
  textSecondary: "#E3B8B6",
} as const;

/**
 * Space Grotesk (títulos/headline) e Redaction (corpo/texto) — paleta
 * "Mystery and transcendence in education", esquema Goethe. Carregadas via
 * <link> de Google Fonts (Space Grotesk) e Fontsource/jsDelivr (Redaction,
 * League Mono) injetado só na web em `App.tsx`
 * (`loadWebFonts` em `src/theme/loadWebFonts.ts`) — em nativo (Expo Go/EAS)
 * ainda não há bundling dos arquivos de fonte, então o RN cai no fallback
 * do sistema automaticamente quando a fonte não está registrada.
 */
export const fonts = {
  display: "Space Grotesk",
  displayFallback: "Space Grotesk, system-ui, sans-serif",
  body: "Redaction",
  bodyMedium: "Redaction",
  bodyFallback: "Redaction, Georgia, serif",
  mono: "League Mono, ui-monospace, monospace",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
};

export const minTouchSize = 44; // a11y — área mínima de toque conforme direção criativa
export const minFontSize = 16; // a11y — fonte-base mínima
