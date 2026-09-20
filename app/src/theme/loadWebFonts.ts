import { Platform } from "react-native";

/**
 * Injeta as fontes da paleta "Ceremony and legacy in education" (Bodoni
 * Moda, Lexend, DM Mono — todas Google Fonts) só na web — em nativo,
 * `fonts.*Fallback` em `tokens.ts` já cai no fallback do sistema (não há
 * arquivo de fonte bundled localmente ainda). Chamar uma única vez, cedo,
 * em `App.tsx`.
 */
export function loadWebFonts() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const href =
    "https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700;800;900&family=Lexend:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap";
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}
