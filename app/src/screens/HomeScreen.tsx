import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { fetchPracticeOfTheWeek } from "@/firebase/firestore";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import type { RootStackParamList } from "@/types";

const CACHE_KEY = "practice_of_the_week_cache";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

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
 * Home: Prática da Semana + os quatro botões de categoria na mesma
 * página (Orações/Músicas/Textos/Livros), a pedido do Head (2026-09-21) —
 * substitui o passo intermediário do hub "Mensageiros" por um único
 * botão. Ver docs/UX-ARCHITECTURE.md seção 1.1 e 5 (o que NÃO entra aqui).
 */
export function HomeScreen({ navigation }: Props) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const practice = await fetchPracticeOfTheWeek();
      setText(practice.text);
      await AsyncStorage.setItem(CACHE_KEY, practice.text);
    } catch {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setText(cached);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const emblem = (
    <Image
      source={require("../../assets/branding/chama-tripla.png")}
      style={styles.emblem}
      resizeMode="contain"
      accessibilityLabel="Emblema da Chama Tripla"
    />
  );

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {emblem}
          <ErrorState
            message="Não conseguimos carregar a prática desta semana. Tente novamente em instantes."
            onRetry={load}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {emblem}
        <Text style={styles.label}>Prática da semana</Text>
        <Text style={styles.practiceText}>
          {text || "Nenhuma prática publicada no momento."}
        </Text>
      </View>
      <View style={styles.buttonGroup}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emblem: {
    width: 96,
    height: 149,
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  label: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  practiceText: {
    fontFamily: fonts.displayFallback,
    fontSize: 26,
    lineHeight: 36,
    color: colors.textPrimary,
    textAlign: "center",
  },
  buttonGroup: {
    alignItems: "center",
    gap: spacing.sm,
  },
  button: {
    minHeight: minTouchSize,
    width: "100%",
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
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
    fontSize: 14,
    letterSpacing: 0.2,
    color: colors.surface,
    textAlign: "center",
  },
});
