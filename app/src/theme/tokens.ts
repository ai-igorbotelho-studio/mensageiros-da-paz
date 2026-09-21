/**
 * Tokens de design derivados da paleta "Ceremony and legacy in education"
 * (esquema Goethe — Zur Farbenlehre, 1810), aplicada ao Mensageiros da Paz
 * a pedido do Head em 2026-09-21, substituindo a paleta "Mystery and
 * transcendence" anterior (fundo roxo reprovado). Ver DECISIONS.md.
 * Nunca preto puro (#000) nem branco puro (#FFF).
 */

export const colors = {
  primary: "#803C7A", // Mulberry (violeta)
  primaryLight: "#AF65A8", // Magenta
  background: "#FFEDDF", // Pale apricot
  surface: "#FFF6EF", // tinta clara de Pale apricot, para cartões/inputs
  accent: "#3BCFA9", // Sage
  textPrimary: "#00170C", // Deep mint (quase preto esverdeado)
  textSecondary: "#6B4463", // tom escurecido de Mulberry, para texto secundário legível
  success: "#3BCFA9", // Sage
  danger: "#B3261E", // vermelho de ação destrutiva (excluir, apagar todos) — antes hardcoded em 3 lugares do AdminScreen
  darkBackground: "#00170C", // Deep mint
  // Texto/ícone "inativo" sobre fundo `primary` sólido (ex.: BottomNavBar
  // invertida) — `primaryLight` sobre `primary` tem contraste baixo demais
  // (roxo sobre roxo, ilegível — relatado 2026-09-21); esse tom claro dá
  // contraste suficiente mesmo sem ser o branco puro do item ativo.
  inverseMuted: "#E7C9E3",
  // Diferenciação visual do painel Admin em relação ao app público
  // (2026-09-21) — um cinza-greige neutro no lugar do Pale apricot do
  // app, sem escurecer nada (uma tentativa de fundo escuro foi revertida
  // por ficar ruim). Só usado em AdminScreen.tsx.
  adminBackground: "#EFE8DD",
} as const;

// Variante escura da paleta — NÃO tem nenhum consumidor em produção hoje
// (confirmado por grep, 2026-09-21). Foi usada brevemente num fundo
// escuro do Admin, revertido a pedido do Head por ficar ruim (ver
// DECISIONS.md) — o Admin hoje usa cores claras próprias
// (`ADMIN_BG`/`ADMIN_SURFACE` em `screens/AdminScreen.tsx`), não estas.
// Mantida em standby (não removida) caso um modo escuro real do app
// volte a ser cogitado no futuro — `primary` já vem clareada pra
// #C77FC0 pra ter contraste suficiente como texto/link sobre fundo
// quase-preto, caso essa hora chegue.
export const darkColors = {
  ...colors,
  background: colors.darkBackground,
  surface: "#122A1F",
  textPrimary: "#FFEDDF",
  textSecondary: "#D89ED1",
  primary: "#C77FC0",
} as const;

/**
 * Lora (títulos/headline) e Lexend (corpo/texto) — paleta "Ceremony and
 * legacy in education", esquema Goethe. As três (Lora, Lexend, DM Mono)
 * são Google Fonts, carregadas via <link> só na web em `App.tsx`
 * (`loadWebFonts` em `src/theme/loadWebFonts.ts`) — em nativo (Expo
 * Go/EAS) ainda não há bundling dos arquivos de fonte, então o RN cai no
 * fallback do sistema automaticamente quando a fonte não está registrada.
 *
 * Era Bodoni Moda — trocada por Lora (2026-09-21, a pedido do Head):
 * Bodoni tem contraste alto e x-height baixo, ilegível nos tamanhos de
 * título no mobile. Lora é uma serifada desenhada pra tela, com contraste
 * mais suave e x-height maior — mantém a elegância combinando com Lexend,
 * com legibilidade melhor em telas pequenas.
 */
export const fonts = {
  display: "Lora",
  displayFallback: "Lora, Georgia, serif",
  body: "Lexend",
  bodyMedium: "Lexend",
  bodyFallback: "Lexend, system-ui, sans-serif",
  // Não usado em nenhum componente do app hoje (confirmado por grep,
  // 2026-09-21) — por isso `loadWebFonts.ts` parou de baixar DM Mono do
  // Google Fonts. Mantido aqui só como token de referência (cai no
  // fallback monoespaçado do sistema se algo vier a usar).
  mono: "DM Mono, ui-monospace, monospace",
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
  pill: 999, // botões sempre em formato de pílula, a pedido do Head (2026-09-21)
};

export const minTouchSize = 44; // a11y — área mínima de toque conforme direção criativa
export const minFontSize = 17; // a11y — fonte-base mínima (subida de 16 pra 17 a pedido do Head, 2026-09-21 — legibilidade no mobile)
