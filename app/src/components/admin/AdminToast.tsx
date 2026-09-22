import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
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
  /**
   * A.5 (WCAG 2.2.1 "Timing Adjustable") — chamados quando o mouse
   * entra/sai ou o foco de teclado entra/sai do toast, pra quem integra
   * pausar/retomar o timer de undo. Só faz sentido em `variant="undo"`.
   */
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
}

/**
 * `AdminToast` + variante `AdminToastUndo` (design/04 §2.9) — só a UI;
 * timer/estado de "Restaurado." fica com quem integra (`frontend-
 * multistack`). `role="status"` (success/undo) ou `role="alert"`
 * (error); `aria-live="polite"` pra não interromper leitura em curso.
 */
export function AdminToast({
  variant,
  message,
  actionLabel,
  onAction,
  secondsRemaining,
  onPauseTimer,
  onResumeTimer,
}: AdminToastProps) {
  const isError = variant === "error";
  const isUndo = variant === "undo";

  return (
    <Pressable
      // `Pressable`, não `View`: é o único componente RN com
      // `onHoverIn`/`onHoverOut` embutidos (mouse), que somam ao
      // `onFocus`/`onBlur` (teclado) pra pausar/retomar o timer de undo
      // (A.5, WCAG 2.2.1). `focusable={false}` mantém o wrapper em si
      // fora da ordem de tabulação — quem recebe foco de fato é o botão
      // "Desfazer" logo abaixo, e o evento de foco borbulha até aqui.
      focusable={false}
      onHoverIn={isUndo ? onPauseTimer : undefined}
      onHoverOut={isUndo ? onResumeTimer : undefined}
      onFocus={isUndo ? onPauseTimer : undefined}
      onBlur={isUndo ? onResumeTimer : undefined}
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
    </Pressable>
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
