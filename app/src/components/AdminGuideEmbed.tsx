import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors, radii } from "@/theme/tokens";

interface Props {
  url: string;
}

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
    height: 720,
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
