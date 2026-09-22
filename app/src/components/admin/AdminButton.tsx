import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { PressableScale } from "@/components/PressableScale";
import { semanticTokens as t } from "@/theme/tokens";

export type AdminButtonVariant = "primary" | "secondary" | "destructive";

export interface AdminButtonProps {
  label: string;
  onPress: () => void;
  variant?: AdminButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

/**
 * `AdminButtonPrimary`/`Secondary`/`Destructive` (design/04 §2.4) num só
 * componente parametrizado por `variant` — os 3 contratos compartilham
 * estados/tokens de toque/foco, só a cor muda. Consome só
 * `semanticTokens` (nunca `colors`/`spacing` direto), M6 já aplicado
 * (`action.primary.bg` = Mulberry).
 *
 * Estados: default, pressed (herdado de `PressableScale`), disabled,
 * loading (`aria-busy`, texto substituído sem reflow — mede o mesmo
 * espaço do label). Alvo sempre ≥`size.minTouch`.
 */
export function AdminButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  accessibilityLabel,
}: AdminButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "destructive" && styles.destructive,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? t.color.action.secondary.text : t.color.action.primary.text}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" && styles.textPrimary,
            variant === "secondary" && styles.textSecondary,
            variant === "destructive" && styles.textDestructive,
          ]}
        >
          {label}
        </Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: t.size.minTouch,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: t.radius.action,
    paddingHorizontal: t.space.stack.section,
    paddingVertical: t.space.inset.card,
  },
  primary: {
    backgroundColor: t.color.action.primary.bg,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: t.color.action.secondary.border,
  },
  destructive: {
    backgroundColor: t.color.action.destructive.bg,
  },
  disabled: {
    opacity: t.component.button.disabledOpacity,
  },
  text: {
    ...t.type.bodyStrong,
  },
  textPrimary: {
    color: t.color.action.primary.text,
  },
  textSecondary: {
    color: t.color.action.secondary.text,
  },
  textDestructive: {
    color: t.color.action.destructive.text,
  },
});
