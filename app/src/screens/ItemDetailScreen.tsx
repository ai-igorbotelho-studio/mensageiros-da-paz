import React, { useEffect, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { ErrorState } from "@/components/ErrorState";
import type { RootStackParamList } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetail">;

/**
 * Visualizador de item: PDF/imagem abrem visualização, áudio toca inline.
 * PDF usa `react-native-pdf` (requer build nativo via EAS — não funciona no
 * Expo Go). Enquanto isso não estiver disponível, cai no fallback de abrir
 * o arquivo no navegador do dispositivo.
 */
export function ItemDetailScreen({ route }: Props) {
  const { item } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [playbackError, setPlaybackError] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  async function togglePlayback() {
    setPlaybackError(false);
    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: item.fileUrl },
          { shouldPlay: true },
          setStatus
        );
        setSound(newSound);
        return;
      }
      if (status && "isPlaying" in status && status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch {
      setPlaybackError(true);
    }
  }

  const isPlaying = status && "isPlaying" in status ? status.isPlaying : false;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}

      {item.fileType === "image" ? (
        <Image
          source={{ uri: item.fileUrl }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={item.title}
        />
      ) : null}

      {item.fileType === "audio" ? (
        <View style={styles.audioBlock}>
          {playbackError ? (
            <ErrorState
              message="Não conseguimos tocar este áudio agora. Tente novamente em instantes."
              onRetry={togglePlayback}
            />
          ) : (
            <Pressable
              style={styles.playButton}
              onPress={togglePlayback}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? "Pausar" : "Reproduzir"}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? "Pausar" : "Reproduzir"}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {item.fileType === "pdf" ? (
        <View style={styles.pdfBlock}>
          <Text style={styles.description}>
            Este documento é um PDF. Toque abaixo para abri-lo.
          </Text>
          <Pressable
            style={styles.playButton}
            onPress={() => Linking.openURL(item.fileUrl)}
            accessibilityRole="button"
            accessibilityLabel="Abrir PDF"
          >
            <Text style={styles.playButtonText}>Abrir PDF</Text>
          </Pressable>
          {/*
            Alternativa recomendada para leitura embutida (sem sair do app):
            react-native-pdf (já em package.json), exigindo EAS Build.
            Ex.: <Pdf source={{ uri: item.fileUrl }} style={{ flex: 1 }} />
          */}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayFallback,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fonts.bodyFallback,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  image: {
    flex: 1,
    borderRadius: radii.md,
  },
  audioBlock: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  pdfBlock: {
    marginTop: spacing.lg,
  },
  playButton: {
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  playButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 16,
    color: colors.surface,
  },
});
