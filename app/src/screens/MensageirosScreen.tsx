import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import type { RootStackParamList } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "Mensageiros">;

const OPTIONS: Array<{ label: string; category: "oracoes" | "musicas" | "textos" | "livros" }> = [
  { label: "ORAÇÕES", category: "oracoes" },
  { label: "MÚSICAS", category: "musicas" },
  { label: "TEXTOS", category: "textos" },
  { label: "LIVROS", category: "livros" },
];

/**
 * Hub de Mensageiros: três botões de mesmo peso visual, conforme
 * docs/UX-ARCHITECTURE.md seção 1.2 (adaptado para incluir "Textos" a
 * pedido do Head, junto com docs/BACKEND-ARCHITECTURE.md).
 */
export function MensageirosScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => (
        <Pressable
          key={option.category}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            navigation.navigate("ContentList", {
              category: option.category,
              title: option.label,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={option.label}
        >
          <Text style={styles.buttonText}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  button: {
    minHeight: minTouchSize + 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
    color: colors.surface,
  },
});
