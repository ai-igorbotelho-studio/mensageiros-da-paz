import React from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { semanticTokens as t } from "@/theme/tokens";

/**
 * Breakpoints do admin (design/04 §2.2): 320/768/960/1280/1920. RN Web
 * não tem media query CSS — a responsividade é derivada de
 * `useWindowDimensions()` (ver `useAdminBreakpoint` abaixo), nunca de
 * CSS condicional.
 */
export const ADMIN_BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 960,
  desktopLg: 1280,
  desktopXl: 1920,
} as const;

export type AdminBreakpoint = "mobile" | "tablet" | "desktop";

export function useAdminBreakpoint(): AdminBreakpoint {
  const { width } = useWindowDimensions();
  if (width >= ADMIN_BREAKPOINTS.desktop) return "desktop";
  if (width >= ADMIN_BREAKPOINTS.tablet) return "tablet";
  return "mobile";
}

export interface AdminTwoPaneLayoutProps {
  /** Sidebar (desktop ≥960px) — null/undefined em mobile/tablet. */
  sidebar?: React.ReactNode;
  /** Painel A — lista/overview (~38%, min 360px em desktop). */
  paneA: React.ReactNode;
  /** Painel B — editor/detalhe (~62%, max-width ~720px). Null = sem editor aberto. */
  paneB?: React.ReactNode | null;
}

/**
 * `AdminTwoPaneLayout` (design/04 §2.3, `03 §2.2`). Desktop (≥960px):
 * sidebar + painel A + painel B lado a lado, container centralizado com
 * teto `component.container.maxWidth` (1600px), scroll independente por
 * painel. Abaixo de 960px: coluna única empilhada (sidebar não
 * renderiza — quem chama passa `sidebar={null}` nesse caso; painel A e B
 * empilham numa única ScrollView, preservando o comportamento atual).
 *
 * A11y: sidebar como landmark de navegação fica a cargo do componente
 * passado via `sidebar` (ex. `AdminSidebar` já usa
 * `accessibilityRole="navigation"`); painel B usa `role="main"`. Scroll
 * de cada painel é independente e não usa `tabindex` — sem prender foco
 * de teclado.
 */
export function AdminTwoPaneLayout({ sidebar, paneA, paneB }: AdminTwoPaneLayoutProps) {
  const breakpoint = useAdminBreakpoint();
  const isDesktop = breakpoint === "desktop";

  if (!isDesktop) {
    return (
      <ScrollView style={styles.mobileColumn} contentContainerStyle={styles.mobileScrollContent}>
        {paneA}
        {paneB}
      </ScrollView>
    );
  }

  return (
    <View style={styles.desktopContainer}>
      {sidebar ? <View style={styles.sidebarSlot}>{sidebar}</View> : null}
      <View style={styles.paneA}>
        <ScrollView contentContainerStyle={styles.paneScrollContent}>{paneA}</ScrollView>
      </View>
      {paneB ? (
        <View style={styles.paneB} {...({ role: "main" } as Record<string, string>)}>
          <ScrollView contentContainerStyle={styles.paneBScrollContent}>
            <View style={styles.paneBContent}>{paneB}</View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mobileColumn: {
    flex: 1,
  },
  mobileScrollContent: {
    paddingBottom: t.space.inset.scrollEnd,
  },
  desktopContainer: {
    flex: 1,
    flexDirection: "row",
    gap: t.space.gap.layout,
    width: "100%",
    maxWidth: t.component.container.maxWidth,
    alignSelf: "center",
  },
  sidebarSlot: {
    width: t.component.sidebar.width,
    flexShrink: 0,
  },
  paneA: {
    // component.panelA.width é "38%" — teto absoluto em telas muito
    // largas (design/04 §2.2, ≥1280px) evita a lista crescer
    // desproporcionalmente.
    width: t.component.panelA.width,
    maxWidth: t.component.panelA.maxWidth,
    minWidth: 360,
    flexShrink: 0,
  },
  paneScrollContent: {
    paddingBottom: t.space.inset.scrollEnd,
  },
  paneB: {
    flex: 1,
    minWidth: 0,
  },
  paneBScrollContent: {
    paddingBottom: t.space.inset.scrollEnd,
    alignItems: "flex-start",
  },
  paneBContent: {
    width: "100%",
    maxWidth: t.component.panelB.maxWidth,
  },
});
