import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
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

const DIAMOND_SIZE = 40;

interface Props {
  // categoria da página atual (ausente na Home, que não pertence a nenhuma)
  active?: ContentCategory;
}

/**
 * Barra de navegação flutuante, fixa na mesma posição em TODAS as
 * páginas — inclusive a Home. Sempre centralizada horizontalmente com
 * largura própria (não estica de ponta a ponta em telas largas). A
 * categoria ativa "salta" pra fora da barra num losango destacado
 * (2026-09-21, a pedido do Head, a partir de uma referência visual) —
 * mais sofisticado que só trocar a cor do ícone.
 */
export function BottomNavBar({ active }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.floatingWrap} pointerEvents="box-none">
      <View style={styles.bar}>
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
      </View>
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
      speed: 18,
      bounciness: 9,
    }).start();
  }, [isActive, pop]);

  const diamondScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const diamondTranslate = pop.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

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
          styles.diamond,
          {
            opacity: pop,
            transform: [
              { translateY: diamondTranslate },
              { scale: diamondScale },
              { rotate: "45deg" },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.diamondIconWrap}>
          <Icon size={18} color={colors.surface} />
        </View>
      </Animated.View>

      {!isActive ? <Icon size={20} color={colors.inverseMuted} /> : <View style={styles.iconSpacer} />}

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
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    ...Platform.select({
      web: { boxShadow: "0 8px 24px rgba(0,0,0,0.22)" },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      },
    }),
  },
  tab: {
    flex: 1,
    minHeight: minTouchSize - 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  // Losango que "salta" pra fora da barra sobre a categoria ativa — o
  // ícone dentro dele gira -45° pra compensar a rotação do losango e
  // ficar em pé.
  diamond: {
    position: "absolute",
    top: -(DIAMOND_SIZE / 2 + 14),
    left: "50%",
    marginLeft: -DIAMOND_SIZE / 2,
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0 4px 10px rgba(0,0,0,0.25)" },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 8,
      },
    }),
  },
  diamondIconWrap: {
    transform: [{ rotate: "-45deg" }],
  },
  // Reserva o espaço do ícone normal quando ele "sobe" pro losango, pra
  // não deslocar o rótulo abaixo.
  iconSpacer: {
    width: 20,
    height: 20,
  },
  label: {
    fontFamily: fonts.bodyFallback,
    fontSize: 11,
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
