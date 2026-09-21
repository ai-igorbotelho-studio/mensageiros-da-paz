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
 * Na web, também cresce um pouco (scale 1 → 1.02) no hover do mouse —
 * o app roda como site também, e sem isso nada reage até o clique,
 * o que parece "morto" num desktop (2026-09-21: "efeitos modernos de
 * interatividade"). `onHoverIn`/`onHoverOut` não fazem nada em
 * nativo (mobile não tem hover), então o mesmo componente serve os
 * dois sem `Platform.select`.
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

  function animateTo(value: number) {
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }

  return (
    <AnimatedPressable
      onPressIn={() => animateTo(0.96)}
      onPressOut={() => animateTo(1)}
      onHoverIn={() => animateTo(1.02)}
      onHoverOut={() => animateTo(1)}
      style={[style, { transform: [{ scale }] }]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
