import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize, spacing } from "@/theme/tokens";
import { BookIcon, MusicIcon, PrayerIcon, TextIcon } from "@/components/CategoryIcons";
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

interface Props {
  // categoria da página atual (ausente na Home, que não pertence a nenhuma)
  active?: ContentCategory;
}

/**
 * Barra de navegação flutuante, fixa na mesma posição em TODAS as
 * páginas — inclusive a Home. Cor invertida (fundo roxo sólido, ícones
 * e texto claros, sem borda) e sempre centralizada horizontalmente com
 * largura própria, em vez de esticar de ponta a ponta em telas largas
 * (2026-09-21, a pedido do Head — antes `left`/`right` fixos faziam a
 * barra ocupar a tela inteira em desktop, já que `maxWidth` não tem
 * efeito quando `left` e `right` estão os dois definidos num elemento
 * `position: absolute`). Por isso o wrapper externo ocupa a tela toda
 * só pra centralizar (`alignItems: "center"`), e a barra em si é quem
 * tem a largura máxima.
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
            <Pressable
              key={tab.category}
              style={styles.tab}
              onPress={() => {
                if (isActive) return;
                navigation.navigate("ContentList", {
                  category: tab.category,
                  title: tab.label,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                <tab.Icon size={20} color={isActive ? colors.primary : colors.inverseMuted} />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  // Círculo preenchido com a cor de destaque (Sage) atrás do ícone da
  // categoria atual — reforça qual página está ativa além da cor do
  // texto/ícone (2026-09-21, a pedido do Head).
  iconCircleActive: {
    backgroundColor: colors.accent,
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
});
