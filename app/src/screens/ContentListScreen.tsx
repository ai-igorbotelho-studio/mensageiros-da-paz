import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, spacing } from "@/theme/tokens";
import { fetchItemsByCategory } from "@/firebase/firestore";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ContentListItem } from "@/components/ContentListItem";
import type { ContentItem, RootStackParamList } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "ContentList">;

const EMPTY_MESSAGE: Record<string, string> = {
  oracoes: "Nenhuma oração disponível no momento.",
  musicas: "Nenhuma música disponível no momento.",
  textos: "Nenhum texto disponível no momento.",
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
      <ErrorState
        message="Não conseguimos carregar esta lista agora. Tente novamente em instantes."
        onRetry={load}
      />
    );
  }
  if (items.length === 0) {
    return <EmptyState message={EMPTY_MESSAGE[category]} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ContentListItem
            item={item}
            onPress={(pressedItem) =>
              navigation.navigate("ItemDetail", { item: pressedItem })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
});
