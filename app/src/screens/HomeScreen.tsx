import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, fonts, spacing } from "@/theme/tokens";
import { fetchPracticeOfTheWeek } from "@/firebase/firestore";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { DayInfoBar } from "@/components/DayInfoBar";
import { FadeIn } from "@/components/FadeIn";

const CACHE_KEY = "practice_of_the_week_cache";

/**
 * Home: só a Prática da Semana. Os 4 botões grandes de categoria
 * (Orações/Músicas/Textos/Livros) foram removidos daqui (2026-09-21, a
 * pedido do Head) — duplicavam a mesma navegação que a `BottomNavBar`
 * já oferece flutuando por cima de toda página, inclusive esta. Manter
 * os dois era confuso (dois menus diferentes pra mesma ação).
 */
export function HomeScreen() {
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
      <View style={styles.outer}>
        <View style={styles.content}>
          {emblem}
          <ErrorState
            message="Não conseguimos carregar a prática desta semana. Tente novamente em instantes."
            onRetry={load}
          />
        </View>
        <DayInfoBar />
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <FadeIn style={styles.container}>
        <View style={styles.emblemArea}>{emblem}</View>
        <View style={styles.textArea}>
          <Text style={styles.label}>Prática da semana</Text>
          <Text style={styles.practiceText}>
            {text || "Nenhuma prática publicada no momento."}
          </Text>
        </View>
        <View style={styles.spacerArea} />
      </FadeIn>
      <DayInfoBar />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  practiceText: {
    fontFamily: fonts.displayFallback,
    fontSize: 21,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: "center",
    maxWidth: 420,
    alignSelf: "center",
  },
  // Reserva o espaço que os botões ocupavam antes, pra manter o texto
  // da prática na mesma posição vertical de antes — a navegação real
  // agora é só a BottomNavBar flutuante.
  spacerArea: {
    flex: 2,
  },
});
