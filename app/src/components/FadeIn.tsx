import React, { useEffect, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  // Espera esse tanto (ms) antes de começar o fade — usado pra
  // escalonar a entrada de itens de lista (cada um some um pouco
  // depois do anterior) em vez de todos aparecerem juntos.
  delay?: number;
}

/**
 * Some com fade curto ao montar — usado onde uma tela troca
 * `LoadingState` por conteúdo, pra essa troca não ser um "pop" seco
 * (2026-09-21, a pedido do Head: sem gap abrupto entre páginas).
 */
export function FadeIn({ style, children, delay = 0 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, delay, useNativeDriver: true }).start();
  }, [opacity, delay]);

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}
