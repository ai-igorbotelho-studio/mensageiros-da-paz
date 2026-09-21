import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { BookIcon } from "@/components/CategoryIcons";
import { PressableScale } from "@/components/PressableScale";
import { toGoogleDriveImageUrl } from "@/utils/driveUrl";
import type { ContentItem, StreamingProvider } from "@/types";

// Rótulos de ação (o que a pessoa vai FAZER ao tocar), não o formato
// técnico do arquivo — "PDF" não dizia nada sobre a ação; "Ler agora"
// diz (2026-09-21, a pedido do Head).
const FILE_TYPE_LABEL: Record<NonNullable<ContentItem["fileType"]>, string> = {
  pdf: "Ler agora",
  image: "Ver imagem",
  audio: "Ouvir agora",
  gdoc: "Ler agora",
};

const STREAMING_LABEL: Record<StreamingProvider, string> = {
  spotify: "Ouvir no Spotify",
  youtube: "Ouvir no YouTube Music",
  soundcloud: "Ouvir no SoundCloud",
  apple_music: "Ouvir no Apple Music",
  other: "Ouvir agora",
};

function actionLabel(item: ContentItem): string {
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

// Alguns itens importados de planilha acabam com o título vazio (coluna
// errada mapeada — ver AdminScreen.tsx). Sem isso, o card renderizava
// completamente em branco: nada ilegível, literalmente sem texto
// nenhum (relatado 2026-09-21 na categoria Textos). Cai pra descrição
// ou pro início do texto, e só em último caso mostra um aviso — nunca
// fica em branco.
function displayTitle(item: ContentItem): string {
  if (item.title.trim()) return item.title;
  if (item.description?.trim()) return item.description;
  if (item.text?.trim()) return item.text.trim().slice(0, 60);
  return "(sem título — editar no admin)";
}

export function ContentListItem({ item, onPress }: Props) {
  const action = actionLabel(item);
  const title = displayTitle(item);
  // Espaço de capa só existe pra Livros (2026-09-21, a pedido do Head):
  // as outras categorias não têm imagem própria por item, então o
  // layout de duas colunas ficaria vazio à toa nelas.
  const showCover = item.category === "livros";
  return (
    <PressableScale
      style={styles.card}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${action}`}
    >
      {showCover ? (
        item.coverImageUrl ? (
          <Image
            source={{ uri: toGoogleDriveImageUrl(item.coverImageUrl) }}
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
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
        {action ? (
          <View style={styles.actionChip}>
            <Text style={styles.actionChipText}>{action}</Text>
            <Text style={styles.actionChipArrow}>→</Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const COVER_SIZE = 56;

const styles = StyleSheet.create({
  card: {
    minHeight: minTouchSize,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  },
  title: {
    fontFamily: fonts.displayFallback,
    fontWeight: "700",
    fontSize: 17,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Chip de ação compacto (largura do próprio conteúdo, não da linha
  // toda) — corrige o botão que antes esticava de ponta a ponta do
  // card por causa de um bug de layout no wrapper de animação
  // (2026-09-21, relatado "UX ficou muito ruim").
  actionChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  actionChipText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 12.5,
    color: colors.primary,
  },
  actionChipArrow: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 12.5,
    color: colors.primary,
  },
});
