/**
 * Tokens de design derivados de docs/CREATIVE-DIRECTION.md.
 * Nunca preto puro (#000) nem branco puro (#FFF).
 */

export const colors = {
  primary: "#3A5A6B", // Azul Horizonte
  primaryLight: "#8FB5BE", // Azul Névoa
  background: "#F7F3EC", // Areia Suave
  surface: "#FDFBF7", // Off-white Papel
  accent: "#C97B5A", // Terracota Suave
  textPrimary: "#2E2A26", // Grafite Suave
  textSecondary: "#8A8378", // Cinza Pedra
  success: "#7A8B6F", // Verde Oliva Suave
  darkBackground: "#1B2428", // Azul-Noite
} as const;

export const darkColors = {
  ...colors,
  background: colors.darkBackground,
  surface: "#232E33",
  textPrimary: "#F7F3EC",
  textSecondary: "#B8B2A6",
} as const;

/**
 * Fraunces (display/títulos) e Inter (corpo/UI) — conforme direção criativa.
 * Devem ser carregadas via `expo-font` + Google Fonts no App.tsx
 * (@expo-google-fonts/fraunces, @expo-google-fonts/inter). Enquanto as fontes
 * não são adicionadas ao bundle, o fallback abaixo usa a fonte do sistema
 * para não quebrar a renderização.
 */
export const fonts = {
  display: "Fraunces_600SemiBold",
  displayFallback: "serif",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodyFallback: "System",
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
