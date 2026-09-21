import { Platform } from "react-native";

/**
 * Injeta as fontes da paleta "Ceremony and legacy in education" (Lora,
 * Lexend — todas Google Fonts) só na web — em nativo, `fonts.*Fallback`
 * em `tokens.ts` já cai no fallback do sistema (não há arquivo de fonte
 * bundled localmente ainda). Chamar uma única vez, cedo, em `App.tsx`.
 *
 * A serifada de título era Bodoni Moda — elegante, mas com contraste alto
 * e x-height baixo demais pro tamanho pequeno de tela do mobile (relatado
 * 2026-09-21: títulos praticamente ilegíveis em telas pequenas). Lora é
 * uma serifada "de livro", desenhada pra tela, com x-height maior e
 * contraste mais suave — mantém a elegância combinando com o corpo em
 * Lexend, mas lê bem em qualquer tamanho.
 *
 * Otimizado (2026-09-21, achado de auditoria de performance): DM Mono
 * (`fonts.mono` em tokens.ts) nunca é usado em nenhum componente — 3
 * pesos inteiros baixados à toa em todo carregamento, removidos. Pesos
 * de Lora/Lexend cortados pros que o código realmente usa (grep por
 * `fontWeight:`), itálico removido (nenhum uso). `preconnect` adicionado
 * pra paralelizar a conexão com o CDN de fonte do Google, em vez de só
 * abrir depois que o `<link>` de stylesheet já carregou.
 */
export function loadWebFonts() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://fonts.gstatic.com";
  preconnect.crossOrigin = "anonymous";
  document.head.appendChild(preconnect);

  const href =
    "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Lexend:wght@300;400;600;700&display=swap";
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}
