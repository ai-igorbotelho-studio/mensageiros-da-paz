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
  { label: "Músicas", category: "musicas", Icon: MusicIcon },
  { label: "Textos", category: "textos", Icon: TextIcon },
  { label: "Livros", category: "livros", Icon: BookIcon },
];

interface Props {
  // categoria da página atual (ausente na Home, que não pertence a nenhuma)
  active?: ContentCategory;
}

/**
 * Barra de navegação flutuante, fixa na mesma posição em TODAS as
 * páginas — inclusive a Home (2026-09-21, a pedido do Head: era o único
 * menu de navegação entre categorias, mas a Home também tinha os 4
 * botões grandes de categoria, duplicando a mesma ação de duas formas
 * diferentes; os botões grandes foram removidos da Home e esta barra
 * passou a ser o único menu, "flutuando" sobre o conteúdo em vez de
 * empurrar o layout, com a mesma posição/aparência em todo lugar).
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
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    maxWidth: 480,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    ...Platform.select({
      web: { boxShadow: "0 4px 16px rgba(0,0,0,0.12)" },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
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
