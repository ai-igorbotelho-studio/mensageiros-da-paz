import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, minTouchSize, spacing } from "@/theme/tokens";

interface Props {
  message?: string;
  onRetry?: () => void;
}

/**
 * Tom gentil mesmo em falha técnica, conforme docs/CREATIVE-DIRECTION.md
 * (voice & tone, seção 2): nunca culpar o usuário, nunca mostrar código de
 * erro cru.
 */
export function ErrorState({
  message = "Não conseguimos carregar este conteúdo. Tente novamente em instantes.",
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    fontFamily: fonts.bodyFallback,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    minHeight: minTouchSize,
    minWidth: minTouchSize,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.surface,
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 16,
  },
});
