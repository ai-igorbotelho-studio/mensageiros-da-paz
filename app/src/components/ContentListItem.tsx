import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { BookIcon } from "@/components/CategoryIcons";
import { PressableScale } from "@/components/PressableScale";
import { toGoogleDriveImageFallbackUrl, toGoogleDriveImageUrl } from "@/utils/driveUrl";
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

// Nenhum formato de URL do Drive funciona pra 100% dos arquivos (varia
// por permissão/tipo/idade do link) — em vez de apostar num só e
// deixar a capa em branco quando falha (relatado de novo 2026-09-21,
// mesmo com o link certo na planilha), tenta um segundo formato antes
// de desistir e cair no ícone de livro.
function BookCover({ url, title }: { url: string; title: string }) {
  const [attempt, setAttempt] = useState<0 | 1 | 2>(0);

  if (attempt === 2) {
    return (
      <View style={styles.coverPlaceholder}>
        <BookIcon size={22} color={colors.primaryLight} />
      </View>
    );
  }

  const src =
    attempt === 0 ? toGoogleDriveImageUrl(url) : toGoogleDriveImageFallbackUrl(url) ?? url;

  return (
    <Image
      source={{ uri: src }}
      style={styles.cover}
      resizeMode="cover"
      accessibilityLabel={`Capa de ${title}`}
      onError={() => setAttempt((a) => ((a + 1) as 0 | 1 | 2))}
    />
  );
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
          <BookCover url={item.coverImageUrl} title={item.title} />
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
      </View>
      {/*
        Antes era um botão de texto ("Ler agora →") repetido em toda
        linha da lista — virou visualmente cansativo de tanto se
        repetir (2026-09-21, a pedido do Head). Um círculo com seta
        fina comunica "abrir" sem precisar de palavra nenhuma, e some
        menos na hierarquia visual do que um botão de texto repetido
        várias vezes.
      */}
      <View style={styles.arrowCircle}>
        <Text style={styles.arrowGlyph}>↗</Text>
      </View>
    </PressableScale>
  );
}

const COVER_SIZE = 56;

const styles = StyleSheet.create({
  card: {
    minHeight: minTouchSize,
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: spacing.sm,
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
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  arrowGlyph: {
    fontSize: 15,
    fontWeight: "300",
    color: colors.primary,
    // leve ajuste ótico: o glifo ↗ não fica visualmente centralizado
    // no círculo sem isso.
    marginBottom: 1,
    marginLeft: 1,
  },
});
