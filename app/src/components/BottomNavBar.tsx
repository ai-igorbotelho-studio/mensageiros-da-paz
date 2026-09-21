import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  { label: "Músicas", category: "musicas", Icon: MusicIcon },
  { label: "Textos", category: "textos", Icon: TextIcon },
  { label: "Livros", category: "livros", Icon: BookIcon },
];

interface Props {
  // categoria da página atual (ausente na Home, que não pertence a nenhuma)
  active?: ContentCategory;
}

/**
 * Barra de navegação fixa no rodapé de todas as páginas de conteúdo,
 * a pedido do Head (2026-09-21): subnavegação entre as 4 categorias,
 * com a página atual destacada e acesso direto às outras sem precisar
 * voltar para a Home primeiro.
 */
export function BottomNavBar({ active }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
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
            <tab.Icon size={20} color={isActive ? colors.primary : colors.textSecondary} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
    backgroundColor: colors.surface,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontFamily: fonts.bodyFallback,
    fontSize: 11,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
