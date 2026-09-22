import React from "react";
import { StyleSheet, Text } from "react-native";
import { PressableScale } from "@/components/PressableScale";
import { semanticTokens as t } from "@/theme/tokens";

export interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Variante usada em `ImportMappingModal` (design/04 §2.5/§2.13). */
  ignored?: boolean;
  accessibilityLabel?: string;
}

/**
 * `CategoryChip` (design/04 §2.5) — seleção de categoria/tipo/coluna.
 * Padding garante alvo ≥`size.minTouch` mesmo sendo um chip
 * compacto (hit area por padding, não por encolher o componente).
 */
export function CategoryChip({ label, selected, onPress, ignored = false, accessibilityLabel }: CategoryChipProps) {
  return (
    <PressableScale
      style={[styles.base, selected && styles.selected, ignored && styles.ignored]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={[styles.text, selected && styles.textSelected, ignored && styles.textIgnored]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: t.size.minTouch,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.color.border.default,
    borderRadius: t.radius.action,
    paddingHorizontal: t.space.stack.section,
    paddingVertical: t.space.stack.field,
  },
  selected: {
    backgroundColor: t.color.action.primary.bg,
    borderColor: t.color.action.primary.bg,
  },
  ignored: {
    borderStyle: "dashed",
    borderColor: t.color.text.secondary,
  },
  text: {
    ...t.type.body,
    color: t.color.text.primary,
  },
  textSelected: {
    color: t.color.action.primary.text,
  },
  textIgnored: {
    color: t.color.text.secondary,
  },
});
