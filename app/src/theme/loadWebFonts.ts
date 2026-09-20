import { Platform } from "react-native";

/**
 * Injeta as fontes da paleta "Mystery and transcendence in education"
 * (Space Grotesk via Google Fonts, Redaction e League Mono via
 * Fontsource/jsDelivr) só na web — em nativo, `fonts.*Fallback` em
 * `tokens.ts` já cai no fallback do sistema (não há arquivo de fonte
 * bundled localmente ainda). Chamar uma única vez, cedo, em `App.tsx`.
 */
export function loadWebFonts() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const href =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap";
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  const fontsourceHrefs = [
    "https://cdn.jsdelivr.net/fontsource/css/redaction@latest/latin.css",
    "https://cdn.jsdelivr.net/fontsource/css/league-mono@latest/latin.css",
  ];
  for (const fsHref of fontsourceHrefs) {
    if (!document.querySelector(`link[href="${fsHref}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fsHref;
      document.head.appendChild(link);
    }
  }
}
