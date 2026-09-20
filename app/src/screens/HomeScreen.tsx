import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { fetchPracticeOfTheWeek } from "@/firebase/firestore";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import type { RootStackParamList } from "@/types";

const CACHE_KEY = "practice_of_the_week_cache";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

/**
 * Home minimalista: só a Prática da Semana + botão "MENSAGEIROS".
 * Ver docs/UX-ARCHITECTURE.md seção 1.1 e 5 (o que NÃO entra aqui).
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
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => navigation.navigate("Mensageiros")}
        accessibilityRole="button"
        accessibilityLabel="Mensageiros"
      >
        <Text style={styles.buttonText}>MENSAGEIROS</Text>
      </Pressable>
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
  },
  practiceText: {
    fontFamily: fonts.displayFallback,
    fontSize: 26,
    lineHeight: 36,
    color: colors.textPrimary,
  },
  button: {
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
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
