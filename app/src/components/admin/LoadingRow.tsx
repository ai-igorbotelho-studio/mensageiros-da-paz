import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { semanticTokens as t } from "@/theme/tokens";

export interface LoadingRowProps {
  count?: number;
}

/**
 * `SkeletonRow` (design/04 §2.11), exportado como `LoadingRow`.
 * `count` linhas fantasma (default 3) por categoria em carregamento.
 * `aria-busy` no container, texto visualmente oculto anunciado pro
 * leitor de tela (achado pendente de confirmação com `audit-design` —
 * hoje o skeleton legado em `AdminScreen.tsx` é só visual).
 */
export function LoadingRow({ count = 3 }: LoadingRowProps) {
  return (
    <View accessibilityRole="none" aria-busy accessibilityLabel="Carregando lista">
      <Text style={styles.srOnly} accessibilityElementsHidden={false}>
        Carregando lista
      </Text>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 52,
    borderRadius: t.radius.control,
    backgroundColor: t.color.surface.admin.canvas,
    opacity: 0.6,
    marginBottom: t.space.stack.field,
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0,
  },
});
