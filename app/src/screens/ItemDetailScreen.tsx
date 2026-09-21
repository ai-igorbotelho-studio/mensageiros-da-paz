import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { ErrorState } from "@/components/ErrorState";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { BottomNavBar } from "@/components/BottomNavBar";
import { toDirectFileUrl, toGoogleDocsTextExportUrl } from "@/utils/driveUrl";
import type { ContentCategory, RootStackParamList, StreamingProvider } from "@/types";

const CATEGORY_LABEL: Record<ContentCategory, string> = {
  oracoes: "Orações",
  musicas: "Músicas",
  textos: "Textos",
  livros: "Livros",
};

/** Extrai o id da faixa de uma URL do Spotify (open.spotify.com/track/{id} ou /embed/track/{id}). */
function extractSpotifyTrackId(url: string): string | null {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

const STREAMING_LABEL: Record<StreamingProvider, string> = {
  spotify: "no Spotify",
  youtube: "no YouTube Music",
  soundcloud: "no SoundCloud",
  apple_music: "no Apple Music",
  other: "no site original",
};

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetail">;

/**
 * Visualizador de item: PDF/imagem abrem visualização, áudio toca inline.
 * PDF usa `react-native-pdf` (requer build nativo via EAS — não funciona no
 * Expo Go). Enquanto isso não estiver disponível, cai no fallback de abrir
 * o arquivo no navegador do dispositivo.
 */
const VOLUME_STEP = 0.1;

export function ItemDetailScreen({ route, navigation }: Props) {
  const { item } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [playbackError, setPlaybackError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [gdocText, setGdocText] = useState<string | null>(null);
  const [gdocLoading, setGdocLoading] = useState(false);
  const [gdocError, setGdocError] = useState(false);

  const isGdoc = item.source === "upload" && item.fileType === "gdoc" && !!item.fileUrl;

  useEffect(() => {
    if (!isGdoc || !item.fileUrl) return;
    const exportUrl = toGoogleDocsTextExportUrl(item.fileUrl);
    if (!exportUrl) {
      setGdocError(true);
      return;
    }
    setGdocLoading(true);
    setGdocError(false);
    fetch(exportUrl)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then(setGdocText)
      .catch(() => setGdocError(true))
      .finally(() => setGdocLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGdoc, item.fileUrl]);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  async function togglePlayback() {
    if (!item.fileUrl) return;
    setPlaybackError(false);
    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: toDirectFileUrl(item.fileUrl) },
          { shouldPlay: true, volume },
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
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Falha ao tocar áudio:", item.fileUrl, err);
      setPlaybackError(true);
    }
  }

  async function stopPlayback() {
    if (!sound) return;
    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
    } catch {
      setPlaybackError(true);
    }
  }

  async function changeVolume(delta: number) {
    const next = Math.min(1, Math.max(0, volume + delta));
    setVolume(next);
    if (sound) {
      try {
        await sound.setVolumeAsync(next);
      } catch {
        // Silencioso: alguns players web não suportam volume programático
        // (o controle nativo do navegador continua funcionando).
      }
    }
  }

  const isPlaying = status && "isPlaying" in status ? status.isPlaying : false;
  const isLoaded = status?.isLoaded ?? false;
  const canStop = isLoaded && (isPlaying || (status && "positionMillis" in status && status.positionMillis > 0));

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Pressable
        style={styles.backButton}
        onPress={() =>
          navigation.navigate("ContentList", {
            category: item.category,
            title: CATEGORY_LABEL[item.category],
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Voltar para ${CATEGORY_LABEL[item.category]}`}
      >
        <Text style={styles.backButtonText}>
          ← Voltar para {CATEGORY_LABEL[item.category]}
        </Text>
      </Pressable>

      <Text style={styles.title}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}

      {item.text ? <Text style={styles.itemText}>{item.text}</Text> : null}

      {isGdoc ? (
        gdocLoading ? (
          <Text style={styles.description}>Carregando texto…</Text>
        ) : gdocError ? (
          <ErrorState
            message="Não conseguimos carregar o texto do Google Doc. Confira se o link está compartilhado como 'Qualquer pessoa com o link'."
            onRetry={() => {
              setGdocError(false);
              setGdocLoading(true);
              const exportUrl = item.fileUrl ? toGoogleDocsTextExportUrl(item.fileUrl) : null;
              if (!exportUrl) {
                setGdocError(true);
                setGdocLoading(false);
                return;
              }
              fetch(exportUrl)
                .then((res) => {
                  if (!res.ok) throw new Error("fetch failed");
                  return res.text();
                })
                .then(setGdocText)
                .catch(() => setGdocError(true))
                .finally(() => setGdocLoading(false));
            }}
          />
        ) : (
          <Text style={styles.itemText}>{gdocText}</Text>
        )
      ) : null}

      {item.source === "streaming" && item.streamingUrl ? (
        (() => {
          const isSpotify = item.streamingProvider === "spotify";
          const trackId = isSpotify ? extractSpotifyTrackId(item.streamingUrl) : null;
          const label = STREAMING_LABEL[item.streamingProvider ?? "other"];
          return trackId ? (
            <SpotifyEmbed trackId={trackId} />
          ) : (
            <Pressable
              style={styles.playButton}
              onPress={() => Linking.openURL(item.streamingUrl!)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${label}`}
            >
              <Text style={styles.playButtonText}>Abrir {label}</Text>
            </Pressable>
          );
        })()
      ) : null}

      {item.source === "upload" && item.fileType === "image" && item.fileUrl ? (
        <Image
          source={{ uri: toDirectFileUrl(item.fileUrl) }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={item.title}
        />
      ) : null}

      {item.source === "upload" && item.fileType === "audio" && item.fileUrl ? (
        <View style={styles.audioBlock}>
          {playbackError ? (
            <ErrorState
              message="Não conseguimos tocar este áudio agora. Tente novamente em instantes."
              onRetry={togglePlayback}
            />
          ) : (
            <>
              <View style={styles.transportRow}>
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
                <Pressable
                  style={[styles.stopButton, !canStop && styles.stopButtonDisabled]}
                  onPress={stopPlayback}
                  disabled={!canStop}
                  accessibilityRole="button"
                  accessibilityLabel="Parar"
                >
                  <Text style={styles.stopButtonText}>Parar</Text>
                </Pressable>
              </View>

              <View style={styles.volumeRow}>
                <Pressable
                  style={styles.volumeButton}
                  onPress={() => changeVolume(-VOLUME_STEP)}
                  accessibilityRole="button"
                  accessibilityLabel="Diminuir volume"
                >
                  <Text style={styles.volumeButtonText}>−</Text>
                </Pressable>
                <View style={styles.volumeTrack}>
                  <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
                </View>
                <Pressable
                  style={styles.volumeButton}
                  onPress={() => changeVolume(VOLUME_STEP)}
                  accessibilityRole="button"
                  accessibilityLabel="Aumentar volume"
                >
                  <Text style={styles.volumeButtonText}>+</Text>
                </Pressable>
                <Text style={styles.volumeLabel}>{Math.round(volume * 100)}%</Text>
              </View>
            </>
          )}
        </View>
      ) : null}

      {item.source === "upload" && item.fileType === "pdf" && item.fileUrl ? (
        <View style={styles.pdfBlock}>
          <Text style={styles.description}>
            Este documento é um PDF. Toque abaixo para abri-lo.
          </Text>
          <Pressable
            style={styles.playButton}
            onPress={() => Linking.openURL(item.fileUrl!)}
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
      </ScrollView>
      <BottomNavBar active={item.category} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  backButton: {
    minHeight: minTouchSize - 8,
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 14,
    color: colors.primary,
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
  itemText: {
    fontFamily: fonts.displayFallback,
    fontSize: 18,
    lineHeight: 28,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  image: {
    flex: 1,
    borderRadius: radii.md,
  },
  audioBlock: {
    marginTop: spacing.lg,
    alignItems: "center",
    width: "100%",
  },
  transportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stopButton: {
    minHeight: minTouchSize,
    minWidth: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stopButtonDisabled: {
    opacity: 0.4,
  },
  stopButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 16,
    color: colors.textSecondary,
  },
  volumeRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    maxWidth: 320,
  },
  volumeButton: {
    minHeight: 36,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 18,
  },
  volumeButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  volumeTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryLight,
    overflow: "hidden",
  },
  volumeFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  volumeLabel: {
    fontFamily: fonts.bodyFallback,
    fontSize: 12,
    color: colors.textSecondary,
    width: 36,
    textAlign: "right",
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
