import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import type { RootStackParamList } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "Mensageiros">;

const OPTIONS: Array<{
  label: string;
  category: "oracoes" | "musicas" | "textos" | "livros";
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { label: "Orações", category: "oracoes", icon: "hands-pray" },
  { label: "Músicas", category: "musicas", icon: "music-note-outline" },
  { label: "Textos", category: "textos", icon: "text-box-outline" },
  { label: "Livros", category: "livros", icon: "book-open-page-variant-outline" },
];

/**
 * Hub de Mensageiros: quatro botões de mesmo peso visual, em formato de
 * pílula, com largura fixa (não esticam com a página) e um ícone
 * minimalista por categoria, a pedido do Head (2026-09-21). Conforme
 * docs/UX-ARCHITECTURE.md seção 1.2 e docs/BACKEND-ARCHITECTURE.md.
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
          <MaterialCommunityIcons
            name={option.icon}
            size={20}
            color={colors.surface}
            style={styles.buttonIcon}
          />
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  button: {
    minHeight: minTouchSize + 12,
    width: "100%",
    maxWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  buttonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.2,
    color: colors.surface,
    textAlign: "center",
  },
});
