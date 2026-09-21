import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  url: string;
}

// Ocupa a maior parte da altura da janela em vez de uma caixa fixa pequena
// (achado do Head 2026-09-21: "deixar o Guia ocupar mais área"). Sem
// borda própria — o card que envolvia isso (com o título duplicado
// "Guia do Admin") foi removido, então essa é a única superfície visível.
const EMBED_HEIGHT = "calc(100vh - 260px)";

/**
 * Versão web do Guia do Admin embutido na própria aba — <iframe> direto.
 * Artifacts do claude.ai podem recusar embutir em iframe de outro domínio
 * (X-Frame-Options/CSP); por isso o link "Abrir em nova aba" (ao lado das
 * abas, em AdminScreen.tsx) continua sempre visível como alternativa, não
 * só um fallback escondido.
 */
export function AdminGuideEmbed({ url }: Props) {
  return (
    <View style={styles.container}>
      {React.createElement("iframe", {
        src: url,
        style: { border: 0, width: "100%", height: "100%" },
        loading: "lazy",
        title: "Guia do Admin",
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // @ts-expect-error string calc() só é válido no RN Web
    height: EMBED_HEIGHT,
    minHeight: 640,
  },
});
