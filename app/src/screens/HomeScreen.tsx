import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { fetchPracticeOfTheWeek } from "@/firebase/firestore";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import {
  BookIcon,
  MusicIcon,
  PrayerIcon,
  TextIcon,
} from "@/components/CategoryIcons";
import type { RootStackParamList } from "@/types";

const CACHE_KEY = "practice_of_the_week_cache";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const OPTIONS: Array<{
  label: string;
  category: "oracoes" | "musicas" | "textos" | "livros";
  Icon: typeof PrayerIcon;
}> = [
  { label: "Orações", category: "oracoes", Icon: PrayerIcon },
  { label: "Músicas", category: "musicas", Icon: MusicIcon },
  { label: "Textos", category: "textos", Icon: TextIcon },
  { label: "Livros", category: "livros", Icon: BookIcon },
];

/**
 * Home: Prática da Semana + os quatro botões de categoria na mesma
 * página (Orações/Músicas/Textos/Livros), a pedido do Head (2026-09-21) —
 * substitui o passo intermediário do hub "Mensageiros" por um único
 * botão. Ver docs/UX-ARCHITECTURE.md seção 1.1 e 5 (o que NÃO entra aqui).
 *
 * Layout espalhado pela altura da página (2026-09-21, a pedido do
 * Head): emblema fixo perto do topo, texto da prática centralizado
 * numa área fixa no meio, botões numa área fixa perto do rodapé —
 * três blocos com `flex` próprios (não tudo empilhado/compacto no
 * centro), com fontes e botões pequenos o bastante para caber sem
 * cortar.
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
      <View style={styles.emblemArea}>{emblem}</View>
      <View style={styles.textArea}>
        <Text style={styles.label}>Prática da semana</Text>
        <Text style={styles.practiceText}>
          {text || "Nenhuma prática publicada no momento."}
        </Text>
      </View>
      <View style={styles.buttonArea}>
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
            <option.Icon size={15} color={colors.surface} />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emblemArea: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  emblem: {
    width: 84,
    height: 130,
  },
  textArea: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  practiceText: {
    fontFamily: fonts.displayFallback,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: "center",
  },
  buttonArea: {
    flex: 2,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  button: {
    minHeight: minTouchSize - 8,
    width: "100%",
    maxWidth: 200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.2,
    color: colors.surface,
    textAlign: "center",
  },
});
