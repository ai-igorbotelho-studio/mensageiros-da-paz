import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { radii } from "@/theme/tokens";

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
 */
export function DriveAudioEmbed({ previewUrl }: Props) {
  if (Platform.OS !== "web") return null;
  return (
    <View style={styles.container}>
      {React.createElement("iframe", {
        src: previewUrl,
        style: { width: "100%", height: "100%", border: "none" },
        allow: "autoplay",
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    borderRadius: radii.md,
    overflow: "hidden",
  },
});
