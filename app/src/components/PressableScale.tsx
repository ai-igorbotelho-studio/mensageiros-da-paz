import React, { useRef } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, "children" | "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * `Pressable` com um leve "encolher" ao toque (scale 1 → 0.96, spring
 * suave) — microinteração consistente reutilizada em botões/cards do
 * app (2026-09-21, a pedido do Head: "animações sutis aos botões").
 *
 * A transformação vai direto no próprio `Pressable` animado
 * (`Animated.createAnimatedComponent`), não numa `View` extra por
 * dentro — uma `View` extra tem `flexDirection: "column"` por padrão e
 * quebrava o layout de quem usava `style={{flexDirection:"row",...}}`
 * (bug relatado 2026-09-21: card de item da lista com o badge
 * esticando a largura toda em vez de ficar ao lado do texto).
 */
export function PressableScale({ style, children, ...props }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }

  return (
    <AnimatedPressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[style, { transform: [{ scale }] }]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
