import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme/tokens";

const EMBLEM_SIZE = 56;
const RING_SIZE = EMBLEM_SIZE + 28;

/**
 * Loading: emblema "Chama Tripla" no centro, com um anel girando ao
 * redor (em vez do `ActivityIndicator` genérico do sistema). A própria
 * chama pulsa (escala + opacidade) devagar — o anel sozinho, fino nas
 * bordas, não estava sendo percebido como "tem algo se movendo aqui"
 * (2026-09-21, a pedido do Head: "o loading symbol... deveria mostrar
 * movimento").
 */
export function LoadingState() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    spinLoop.start();
    pulseLoop.start();
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [spin, pulse, entrance]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Animated.View
      style={[styles.container, { opacity: entrance }]}
      accessibilityRole="progressbar"
    >
      <View style={styles.stack}>
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
        <Animated.Image
          source={require("../../assets/branding/chama-tripla.png")}
          style={[styles.emblem, { transform: [{ scale }], opacity }]}
          resizeMode="contain"
          accessibilityLabel="Carregando"
        />
      </View>
    </Animated.View>
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
