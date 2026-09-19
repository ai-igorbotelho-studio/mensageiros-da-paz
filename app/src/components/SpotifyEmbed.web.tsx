import React from "react";
import { StyleSheet, View } from "react-native";
import { radii } from "@/theme/tokens";

interface Props {
  trackId: string;
}

/**
 * Versão web do player embutido do Spotify — <iframe> direto, sem as
 * limitações de WebView do app nativo (funciona em Expo Go/web sem build).
 */
export function SpotifyEmbed({ trackId }: Props) {
  const src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
  return (
    <View style={styles.container}>
      {React.createElement("iframe", {
        src,
        style: { border: 0, width: "100%", height: "100%" },
        allow:
          "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
        loading: "lazy",
        title: "Spotify player",
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 152,
    borderRadius: radii.md,
    overflow: "hidden",
  },
});
