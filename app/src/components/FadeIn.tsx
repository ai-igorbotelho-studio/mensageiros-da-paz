import React, { useEffect, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Some com fade curto ao montar — usado onde uma tela troca
 * `LoadingState` por conteúdo, pra essa troca não ser um "pop" seco
 * (2026-09-21, a pedido do Head: sem gap abrupto entre páginas).
 */
export function FadeIn({ style, children }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [opacity]);

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}
