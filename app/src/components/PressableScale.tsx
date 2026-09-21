import React, { useRef } from "react";
import { Animated, Pressable, type PressableProps } from "react-native";

interface Props extends Omit<PressableProps, "children"> {
  children: React.ReactNode;
}

/**
 * `Pressable` com um leve "encolher" ao toque (scale 1 → 0.96, spring
 * suave) — microinteração consistente reutilizada em botões/cards do
 * app, em vez de cada tela reinventar a própria animação de toque
 * (2026-09-21, a pedido do Head: "animações sutis aos botões"). Não
 * aceita `children`/`style` como função (render prop) — só o caso de
 * uso simples, que é o único usado no app.
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
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={style}
      {...props}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}
