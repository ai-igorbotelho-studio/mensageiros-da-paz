import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii } from "@/theme/tokens";

interface Props {
  url: string;
}

/**
 * Versão web do Guia do Admin embutido na própria aba — <iframe> direto.
 * Artifacts do claude.ai podem recusar embutir em iframe de outro domínio
 * (X-Frame-Options/CSP); por isso o link "Abrir em nova aba" ao lado
 * (AdminScreen.tsx) continua sempre visível como alternativa, não só um
 * fallback escondido.
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
    height: 720,
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
});
