import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { semanticTokens as t } from "@/theme/tokens";
import { AdminButton } from "./AdminButton";

export interface AdminEmptyStateProps {
  categoryLabel: string;
  onCreatePress: () => void;
}

/**
 * `EmptyState` (design/04 §2.10) — nomeado `AdminEmptyState` pra não
 * colidir com `components/EmptyState.tsx` do app público (contrato
 * diferente). Texto real (não imagem) pro leitor de tela; botão reaproveita
 * o mesmo contrato de `AdminButton` (variant="primary").
 */
export function AdminEmptyState({ categoryLabel, onCreatePress }: AdminEmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nenhum item cadastrado em {categoryLabel}.</Text>
      <AdminButton label="Novo item" onPress={onCreatePress} variant="primary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    paddingVertical: t.space.stack.field,
  },
  text: {
    ...t.type.body,
    color: t.color.text.primary,
    marginBottom: t.space.stack.section,
  },
});
