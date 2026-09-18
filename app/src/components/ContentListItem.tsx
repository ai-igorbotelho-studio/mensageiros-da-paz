import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import type { ContentItem } from "@/types";

const FILE_TYPE_LABEL: Record<ContentItem["fileType"], string> = {
  pdf: "PDF",
  image: "Imagem",
  audio: "Áudio",
};

interface Props {
  item: ContentItem;
  onPress: (item: ContentItem) => void;
}

export function ContentListItem({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${FILE_TYPE_LABEL[item.fileType]}`}
    >
      <View style={styles.textColumn}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <Text style={styles.badge}>{FILE_TYPE_LABEL[item.fileType]}</Text>
    </Pressable>
  );
}

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
