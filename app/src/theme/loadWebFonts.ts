import { Platform } from "react-native";

/**
 * Injeta as fontes da paleta "Ceremony and legacy in education" (Lora,
 * Lexend, DM Mono — todas Google Fonts) só na web — em nativo,
 * `fonts.*Fallback` em `tokens.ts` já cai no fallback do sistema (não há
 * arquivo de fonte bundled localmente ainda). Chamar uma única vez, cedo,
 * em `App.tsx`.
 *
 * A serifada de título era Bodoni Moda — elegante, mas com contraste alto
 * e x-height baixo demais pro tamanho pequeno de tela do mobile (relatado
 * 2026-09-21: títulos praticamente ilegíveis em telas pequenas). Lora é
 * uma serifada "de livro", desenhada pra tela, com x-height maior e
 * contraste mais suave — mantém a elegância combinando com o corpo em
 * Lexend, mas lê bem em qualquer tamanho.
 */
export function loadWebFonts() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const href =
    "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Lexend:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap";
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}
