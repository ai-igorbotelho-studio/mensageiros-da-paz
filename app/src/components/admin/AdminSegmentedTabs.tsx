import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";

export interface AdminSegmentedTab<K extends string = string> {
  key: K;
  label: string;
}

export interface AdminSegmentedTabsProps<K extends string = string> {
  tabs: AdminSegmentedTab<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
}

/**
 * `AdminSegmentedTabs` (design/04 §2.2) — extraído do segmented control
 * em pílula que já existia inline em `AdminScreen.tsx` (mobile <960px).
 * Nenhum token/valor mudou nesta extração — só virou componente
 * reutilizável, confinado ao breakpoint mobile/tablet pelo chamador
 * (`AdminSidebar` assume em desktop, mesmo estado de aba).
 */
export function AdminSegmentedTabs<K extends string = string>({
  tabs,
  activeKey,
  onSelect,
}: AdminSegmentedTabsProps<K>) {
  return (
    <View style={styles.tabRow} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return <SegmentedTabItem key={tab.key} tab={tab} active={active} onSelect={onSelect} />;
      })}
    </View>
  );
}

/** Item isolado em componente próprio só pra poder ter `useState` de foco
 * (WCAG 2.4.7) sem violar as regras de hooks dentro do `.map` do pai. */
function SegmentedTabItem<K extends string>({
  tab,
  active,
  onSelect,
}: {
  tab: AdminSegmentedTab<K>;
  active: boolean;
  onSelect: (key: K) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      style={[styles.tab, active && styles.tabActive, focused && styles.tabFocused]}
      onPress={() => onSelect(tab.key)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: spacing.xs / 2,
  },
  tab: {
    flex: 1,
    minHeight: minTouchSize - 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabFocused: {
    outlineWidth: 2,
    outlineStyle: "solid",
    outlineColor: colors.primary,
    outlineOffset: 2,
  } as object,
  tabText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textAlign: "center",
  },
  tabTextActive: {
    color: colors.surface,
  },
});
