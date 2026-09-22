import React, { useRef, useState } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { semanticTokens as t } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Anel de foco visível (WCAG 2.4.7) aplicado via `onFocus`/`onBlur` — RN
 * Web repassa esses eventos normalmente para o `Pressable` subjacente,
 * mesmo dentro do `Animated.createAnimatedComponent`. Usa `outline` (só
 * tem efeito no DOM/web; em nativo essas chaves de estilo são
 * ignoradas silenciosamente pelo RN, então o mesmo objeto serve os dois
 * ambientes sem `Platform.select`). Contraste ≥3:1 garantido por usar
 * `colors.primary`, o mesmo tom de marca do resto do sistema de foco.
 */
const focusRingStyle = {
  outlineWidth: 2,
  outlineStyle: "solid",
  outlineColor: t.color.focus.ring,
  outlineOffset: 2,
} as unknown as ViewStyle;

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
export const PressableScale = React.forwardRef<React.ElementRef<typeof Pressable>, Props>(
  function PressableScale({ style, children, onFocus, onBlur, ...props }, ref) {
    const scale = useRef(new Animated.Value(1)).current;
    const [focused, setFocused] = useState(false);

    function animateTo(value: number) {
      Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
    }

    return (
      <AnimatedPressable
        ref={ref}
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        onHoverIn={() => animateTo(1.02)}
        onHoverOut={() => animateTo(1)}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[style, { transform: [{ scale }] }, focused && focusRingStyle]}
        {...props}
      >
        {children}
      </AnimatedPressable>
    );
  }
);
