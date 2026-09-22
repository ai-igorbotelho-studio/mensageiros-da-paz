// Config de lint do app (Expo SDK 51 / React Native Web).
// Usa o preset oficial `eslint-config-expo` (formato eslintrc, pareado com
// ESLint 8 — a combinação que o `expo lint` instala nesta versão do SDK).
// Adicionado para destravar `npm run lint`, que antes referenciava o eslint
// sem nenhuma config/toolchain instalada (achado do qa-cross-browser,
// 2026-09-22). Ver DECISIONS.md.
module.exports = {
  root: true,
  extends: ["expo"],
  ignorePatterns: ["dist/", "node_modules/", "web-build/", ".expo/"],
};
