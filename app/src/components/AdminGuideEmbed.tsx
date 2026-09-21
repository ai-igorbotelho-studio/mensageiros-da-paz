import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "@/theme/tokens";

interface Props {
  url: string;
}

// Ocupa a maior parte da altura da tela em vez de uma caixa fixa pequena
// (achado do Head 2026-09-21: "deixar o Guia ocupar mais área"). Sem
// borda própria — o card que envolvia isso (com o título duplicado
// "Guia do Admin") foi removido, então essa é a única superfície visível.
const EMBED_HEIGHT = Math.max(640, Dimensions.get("window").height - 260);

/**
 * Guia do Admin embutido na própria aba (Android/iOS via
 * react-native-webview — exige EAS Build/dev client, não funciona no Expo
 * Go puro). A versão web (AdminGuideEmbed.web.tsx) usa <iframe> direto.
 */
export function AdminGuideEmbed({ url }: Props) {
  return (
    <View style={styles.container}>
      <WebView source={{ uri: url }} style={styles.webview} originWhitelist={["*"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: EMBED_HEIGHT,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
