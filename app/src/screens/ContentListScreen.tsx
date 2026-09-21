import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, spacing } from "@/theme/tokens";
import { fetchItemsByCategory } from "@/firebase/firestore";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ContentListItem } from "@/components/ContentListItem";
import { BottomNavBar } from "@/components/BottomNavBar";
import { FadeIn } from "@/components/FadeIn";
import type { ContentCategory, ContentItem, RootStackParamList } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "ContentList">;

const EMPTY_MESSAGE: Record<ContentCategory, string> = {
  oracoes: "Nenhuma oração disponível no momento.",
  musicas: "Nenhuma música disponível no momento.",
  textos: "Nenhum texto disponível no momento.",
  livros: "Nenhum livro disponível no momento.",
};

/**
 * Tela genérica usada pelas três subpáginas do hub Mensageiros (Orações,
 * Músicas, Textos), conforme docs/UX-ARCHITECTURE.md e
 * docs/BACKEND-ARCHITECTURE.md (coleção `items` filtrada por `category`).
 */
export function ContentListScreen({ route, navigation }: Props) {
  const { category } = route.params;
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchItemsByCategory(category);
      setItems(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ErrorState
            message="Não conseguimos carregar esta lista agora. Tente novamente em instantes."
            onRetry={load}
          />
        </View>
        <BottomNavBar active={category} />
      </View>
    );
  }
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <EmptyState message={EMPTY_MESSAGE[category]} />
        </View>
        <BottomNavBar active={category} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FadeIn style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            // Entrada escalonada: cada item aparece um pouco depois do
            // anterior (até o 6º — depois disso o atraso vira ruído em
            // vez de efeito) em vez de a lista inteira "piscar" junto.
            <FadeIn delay={Math.min(index, 6) * 40}>
              <ContentListItem
                item={item}
                onPress={(pressedItem) =>
                  navigation.navigate("ItemDetail", { item: pressedItem })
                }
              />
            </FadeIn>
          )}
        />
      </FadeIn>
      <BottomNavBar active={category} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
});
