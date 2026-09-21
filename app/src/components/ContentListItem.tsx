import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { BookIcon } from "@/components/CategoryIcons";
import { toDirectFileUrl } from "@/utils/driveUrl";
import type { ContentItem, StreamingProvider } from "@/types";

const FILE_TYPE_LABEL: Record<NonNullable<ContentItem["fileType"]>, string> = {
  pdf: "PDF",
  image: "Imagem",
  audio: "Áudio",
  gdoc: "Texto",
};

const STREAMING_LABEL: Record<StreamingProvider, string> = {
  spotify: "Spotify",
  youtube: "YouTube Music",
  soundcloud: "SoundCloud",
  apple_music: "Apple Music",
  other: "Streaming",
};

function badgeLabel(item: ContentItem): string {
  if (item.source === "streaming" && item.streamingProvider) {
    return STREAMING_LABEL[item.streamingProvider];
  }
  if (item.fileType) return FILE_TYPE_LABEL[item.fileType];
  return "";
}

interface Props {
  item: ContentItem;
  onPress: (item: ContentItem) => void;
}

export function ContentListItem({ item, onPress }: Props) {
  const badge = badgeLabel(item);
  // Espaço de capa só existe pra Livros (2026-09-21, a pedido do Head):
  // as outras categorias não têm imagem própria por item, então o
  // layout de duas colunas ficaria vazio à toa nelas.
  const showCover = item.category === "livros";
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${badge}`}
    >
      {showCover ? (
        item.coverImageUrl ? (
          <Image
            source={{ uri: toDirectFileUrl(item.coverImageUrl) }}
            style={styles.cover}
            resizeMode="cover"
            accessibilityLabel={`Capa de ${item.title}`}
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <BookIcon size={22} color={colors.primaryLight} />
          </View>
        )
      ) : null}
      <View style={styles.textColumn}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
    </Pressable>
  );
}

const COVER_SIZE = 48;

const styles = StyleSheet.create({
  card: {
    minHeight: minTouchSize,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE * 1.4,
    borderRadius: radii.sm,
    marginRight: spacing.md,
  },
  coverPlaceholder: {
    width: COVER_SIZE,
    height: COVER_SIZE * 1.4,
    borderRadius: radii.sm,
    marginRight: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 16,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    fontFamily: fonts.bodyFallback,
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    overflow: "hidden",
  },
});
