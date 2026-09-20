import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme/tokens";

const EMBLEM_SIZE = 56;
const RING_SIZE = EMBLEM_SIZE + 28;

/**
 * Loading: emblema "Chama Tripla" parado no centro, com um anel girando
 * ao redor (em vez do `ActivityIndicator` genérico do sistema) — a
 * pedido do Head (2026-09-21).
 */
export function LoadingState() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <View style={styles.stack}>
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
        <Image
          source={require("../../assets/branding/chama-tripla.png")}
          style={styles.emblem}
          resizeMode="contain"
          accessibilityLabel="Carregando"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  stack: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.primaryLight,
    borderTopColor: colors.primary,
  },
  emblem: {
    width: EMBLEM_SIZE,
    height: EMBLEM_SIZE,
  },
});
