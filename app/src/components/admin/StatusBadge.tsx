import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { semanticTokens as t } from "@/theme/tokens";

export interface StatusBadgeProps {
  status: "published" | "draft";
}

const LABEL: Record<StatusBadgeProps["status"], string> = {
  published: "Publicado",
  draft: "Rascunho",
};

/**
 * `StatusBadge` (design/04 §2.8). Não interativo (sem hover/foco) —
 * só os dois valores de `status`. O rótulo é texto real (não só cor),
 * então continua legível/anunciável mesmo dentro de um item clicável.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const published = status === "published";
  return (
    <View style={[styles.base, published ? styles.published : styles.draft]}>
      <Text style={[styles.text, published ? styles.textPublished : styles.textDraft]}>
        {LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: t.radius.action,
    paddingHorizontal: t.space.stack.field,
    paddingVertical: 2,
  },
  published: {
    backgroundColor: t.color.feedback.success.bg,
  },
  draft: {
    backgroundColor: t.color.feedback.neutral.bg,
  },
  text: {
    ...t.type.microLabel,
  },
  textPublished: {
    color: t.color.feedback.success.text,
  },
  textDraft: {
    color: t.color.feedback.neutral.text,
  },
});
