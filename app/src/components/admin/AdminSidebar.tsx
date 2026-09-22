import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/PressableScale";
import { semanticTokens as t } from "@/theme/tokens";

export interface AdminSidebarItem<K extends string = string> {
  key: K;
  label: string;
}

export interface AdminSidebarProps<K extends string = string> {
  items: AdminSidebarItem<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
}

/**
 * `AdminSidebar` (design/04 §2.1/§4.4) — navegação lateral fixa em
 * desktop (≥960px), substitui o segmented control em pílula do mobile
 * (`AdminSegmentedTabs`), controlada pelo mesmo estado de aba.
 *
 * A11y: `role="navigation"`, item ativo com `aria-current="page"`, foco
 * visível mesmo sobre fundo ativo (herdado de `PressableScale`), alvo
 * ≥`size.minTouch`.
 */
export function AdminSidebar<K extends string = string>({
  items,
  activeKey,
  onSelect,
}: AdminSidebarProps<K>) {
  return (
    <View
      style={styles.container}
      // "navigation" não é um `AccessibilityRole` do RN — no web,
      // `role` é repassado direto pro elemento HTML subjacente (RN Web
      // aceita a prop `role` além de `accessibilityRole`), garantindo o
      // landmark `role="navigation"` pedido em design/04 §2.1 sem
      // quebrar o tipo do RN nativo.
      {...({ role: "navigation" } as Record<string, string>)}
      accessibilityLabel="Navegação do painel administrativo"
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <PressableScale
            key={item.key}
            style={[styles.item, active && styles.itemActive]}
            onPress={() => onSelect(item.key)}
            accessibilityRole="link"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            // aria-current é lido nativamente na web pelo RN Web quando
            // passado via `accessibilityState`/prop direta; garantimos
            // aqui via prop nativa do DOM (RN Web repassa props não
            // reconhecidas para o elemento HTML subjacente).
            {...(active ? ({ "aria-current": "page" } as Record<string, string>) : {})}
          >
            <Text style={[styles.text, active && styles.textActive]}>{item.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: t.color.surface.admin.card,
    borderRadius: t.radius.container,
    padding: t.space.inset.card,
    gap: t.space.stack.field,
    alignSelf: "flex-start",
  },
  item: {
    minHeight: t.size.minTouch,
    justifyContent: "center",
    borderRadius: t.radius.control,
    paddingHorizontal: t.space.inset.card,
  },
  itemActive: {
    backgroundColor: t.color.action.primary.bg,
  },
  text: {
    ...t.type.bodyStrong,
    color: t.color.text.primary,
  },
  textActive: {
    color: t.color.action.primary.text,
  },
});
