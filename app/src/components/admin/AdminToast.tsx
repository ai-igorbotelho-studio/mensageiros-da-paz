import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { semanticTokens as t } from "@/theme/tokens";

export type AdminToastVariant = "success" | "error" | "undo";

export interface AdminToastProps {
  variant: AdminToastVariant;
  message: string;
  /** Só usado em `variant="undo"`. */
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Segundos restantes exibidos como texto estático (ex.: "(6s)") —
   * `design/04 §2.9`/`03 §4.9`: sem barra de progresso animada
   * (`prefers-reduced-motion`). A lógica de contagem/timer é do
   * `frontend-multistack`; este componente só renderiza o valor
   * recebido.
   */
  secondsRemaining?: number;
}

/**
 * `AdminToast` + variante `AdminToastUndo` (design/04 §2.9) — só a UI;
 * timer/estado de "Restaurado." fica com quem integra (`frontend-
 * multistack`). `role="status"` (success/undo) ou `role="alert"`
 * (error); `aria-live="polite"` pra não interromper leitura em curso.
 */
export function AdminToast({ variant, message, actionLabel, onAction, secondsRemaining }: AdminToastProps) {
  const isError = variant === "error";
  const isUndo = variant === "undo";

  return (
    <View
      style={[styles.base, variant === "success" && styles.success, isError && styles.error, isUndo && styles.undo]}
      accessibilityRole={isError ? "alert" : "text"}
      accessibilityLiveRegion="polite"
    >
      <Text
        style={[
          styles.text,
          variant === "success" && styles.textSuccess,
          isError && styles.textError,
          isUndo && styles.textUndo,
        ]}
      >
        {message}
        {isUndo && typeof secondsRemaining === "number" ? ` (${secondsRemaining}s)` : ""}
      </Text>
      {isUndo && actionLabel ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          style={styles.actionHitArea}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: t.radius.control,
    paddingHorizontal: t.space.inset.card,
    paddingVertical: t.space.stack.field,
  },
  success: {
    backgroundColor: t.color.feedback.success.bg,
  },
  error: {
    backgroundColor: t.color.feedback.danger.bg,
  },
  undo: {
    backgroundColor: t.color.feedback.pending.bg,
  },
  text: {
    ...t.type.body,
    flexShrink: 1,
  },
  textSuccess: {
    color: t.color.feedback.success.text,
  },
  textError: {
    color: t.color.feedback.danger.text,
  },
  textUndo: {
    color: t.color.feedback.pending.text,
  },
  actionHitArea: {
    minHeight: t.size.minTouch,
    minWidth: t.size.minTouch,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: t.space.stack.field,
  },
  actionText: {
    ...t.type.bodyStrong,
    color: t.color.feedback.pending.action,
  },
});
