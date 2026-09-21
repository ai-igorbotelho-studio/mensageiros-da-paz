import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, spacing } from "@/theme/tokens";

interface Props {
  previewUrl: string;
}

/**
 * Player oficial embutido do Google Drive, só pra web — ver o
 * comentário de `toGoogleDrivePreviewUrl` em driveUrl.ts pro porquê.
 * Usa `React.createElement("iframe", ...)` em vez de JSX porque
 * `<iframe>` não é um elemento React Native válido — só existe DOM de
 * verdade quando `Platform.OS === "web"` (react-native-web), daí o
 * guard antes de qualquer coisa.
 *
 * O visual interno do player (caixa escura, waveform) é do próprio
 * Google — cross-origin, não dá pra restilizar por CSS. Reclamado
 * como "horrível" (2026-09-21): o que dá pra fazer é integrar melhor
 * com uma moldura no estilo do app ao redor, em vez de deixar o
 * retângulo escuro flutuando sozinho na página.
 */
export function DriveAudioEmbed({ previewUrl }: Props) {
  if (Platform.OS !== "web") return null;
  return (
    <View style={styles.frame}>
      <View style={styles.iframeWrap}>
        {React.createElement("iframe", {
          src: previewUrl,
          style: { width: "100%", height: "100%", border: "none" },
          allow: "autoplay",
        })}
      </View>
      <Text style={styles.caption}>Player do Google Drive</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  iframeWrap: {
    height: 110,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  caption: {
    fontFamily: fonts.bodyFallback,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
