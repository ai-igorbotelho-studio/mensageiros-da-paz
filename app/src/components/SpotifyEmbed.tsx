import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { radii } from "@/theme/tokens";

interface Props {
  trackId: string;
}

/**
 * Player embutido do Spotify (Android/iOS via react-native-webview — exige
 * EAS Build/dev client, não funciona no Expo Go puro). A versão web
 * (SpotifyEmbed.web.tsx) usa <iframe> direto, sem essa limitação.
 */
export function SpotifyEmbed({ trackId }: Props) {
  const src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: src }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 152,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
