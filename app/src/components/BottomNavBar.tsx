import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import { BookIcon, MusicIcon, PrayerIcon, TextIcon } from "@/components/CategoryIcons";
import { PressableScale } from "@/components/PressableScale";
import type { ContentCategory, RootStackParamList } from "@/types";

const TABS: Array<{
  label: string;
  category: ContentCategory;
  Icon: typeof PrayerIcon;
}> = [
  { label: "Orações", category: "oracoes", Icon: PrayerIcon },
  { label: "Livros", category: "livros", Icon: BookIcon },
  { label: "Músicas", category: "musicas", Icon: MusicIcon },
  { label: "Textos", category: "textos", Icon: TextIcon },
];

const CIRCLE_SIZE = 58;

interface Props {
  // categoria da página atual (ausente na Home, que não pertence a nenhuma)
  active?: ContentCategory;
}

/**
 * Barra de navegação flutuante, fixa na mesma posição em TODAS as
 * páginas — inclusive a Home. Sempre centralizada horizontalmente com
 * largura própria (não estica de ponta a ponta em telas largas). A
 * categoria ativa "salta" pra fora da barra num círculo grande com
 * brilho (halo de sombra colorida) e ícone maior/branco — redesenhado
 * 2026-09-21 a pedido do Head, referência de app de câmbio/mercado com
 * esse padrão de ícone ativo destacado + animação elástica ao trocar
 * de aba (Animated.spring com "bounciness" alto, dá um leve exagero
 * antes de assentar em vez de simplesmente aparecer).
 */
export function BottomNavBar({ active }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // A barra inteira dá um pequeno "pulso" elástico a cada troca de aba,
  // além do círculo do ícone ativo — reforça a sensação de mola em vez
  // de só o círculo se mexer sozinho (achado do Head, 2026-09-21).
  const barScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    barScale.setValue(0.94);
    Animated.spring(barScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 18,
    }).start();
  }, [active, barScale]);

  return (
    <View style={styles.floatingWrap} pointerEvents="box-none">
      <Animated.View style={[styles.bar, { transform: [{ scale: barScale }] }]}>
        {TABS.map((tab) => {
          const isActive = tab.category === active;
          return (
            <NavTab
              key={tab.category}
              label={tab.label}
              Icon={tab.Icon}
              isActive={isActive}
              onPress={() => {
                if (isActive) return;
                navigation.navigate("ContentList", {
                  category: tab.category,
                  title: tab.label,
                });
              }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

interface NavTabProps {
  label: string;
  Icon: typeof PrayerIcon;
  isActive: boolean;
  onPress: () => void;
}

function NavTab({ label, Icon, isActive, onPress }: NavTabProps) {
  const pop = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: true,
      speed: 14,
      // Bounciness alto de propósito: o círculo "estoura" um pouco além
      // do tamanho final antes de assentar — o movimento elástico que
      // sinaliza a troca de aba, em vez de só aparecer/crescer reto.
      bounciness: 16,
    }).start();
  }, [isActive, pop]);

  const circleScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const circleTranslate = pop.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <PressableScale
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            opacity: pop,
            transform: [{ translateY: circleTranslate }, { scale: circleScale }],
          },
        ]}
        pointerEvents="none"
      >
        <Icon size={28} color={colors.surface} />
      </Animated.View>

      {!isActive ? <Icon size={22} color={colors.inverseMuted} /> : <View style={styles.iconSpacer} />}

      <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
      {isActive ? <View style={styles.underline} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.lg,
    alignItems: "center",
  },
  bar: {
    width: "92%",
    maxWidth: 420,
    flexDirection: "row",
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: minTouchSize - 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  // Círculo que "salta" pra fora da barra sobre a categoria ativa — cor
  // diferente da barra (Sage, o "destaque" da paleta, contra o Mulberry
  // da barra) e halo de sombra colorida em volta, pra ler como um botão
  // "aceso" de verdade, não só um ícone maior.
  circle: {
    position: "absolute",
    top: -(CIRCLE_SIZE / 2 + 14),
    left: "50%",
    marginLeft: -CIRCLE_SIZE / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  // Reserva o espaço do ícone normal quando ele "sobe" pro círculo, pra
  // não deslocar o rótulo abaixo.
  iconSpacer: {
    width: 22,
    height: 22,
  },
  label: {
    fontFamily: fonts.bodyFallback,
    fontSize: 12,
    color: colors.inverseMuted,
  },
  labelActive: {
    color: colors.surface,
    fontWeight: "700",
  },
  underline: {
    marginTop: 2,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surface,
  },
});
