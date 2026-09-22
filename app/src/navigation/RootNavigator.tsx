import React, { useCallback, useState } from "react";
import { Text } from "react-native";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize } from "@/theme/tokens";
import { HomeScreen } from "@/screens/HomeScreen";
import { ContentListScreen } from "@/screens/ContentListScreen";
import { ItemDetailScreen } from "@/screens/ItemDetailScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { AdminScreen } from "@/screens/AdminScreen";
import { PressableScale } from "@/components/PressableScale";
import { GearIcon } from "@/components/CategoryIcons";
import { BottomNavBar } from "@/components/BottomNavBar";
import type { ContentCategory, RootStackParamList } from "@/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Nas telas onde a barra aparece, qual categoria (se alguma) ela marca
// como ativa — usado pra manter a BottomNavBar persistente (ver comentário
// em RootNavigator abaixo) sincronizada com a rota atual.
function activeCategoryFor(
  name: keyof RootStackParamList,
  params: RootStackParamList[keyof RootStackParamList]
): ContentCategory | undefined {
  if (name === "ContentList") {
    return (params as RootStackParamList["ContentList"] | undefined)?.category;
  }
  if (name === "ItemDetail") {
    return (params as RootStackParamList["ItemDetail"] | undefined)?.item.category;
  }
  return undefined;
}

const SCREENS_WITHOUT_BAR = new Set<keyof RootStackParamList>(["Settings", "Admin"]);

/**
 * Habilita `https://mensageiros-da-paz.pages.dev/admin` como endereço
 * direto na versão web (React Navigation linking) — ver DECISIONS.md,
 * 2026-09-19, "Painel de admin reintroduzido". `ItemDetail` fica de fora
 * do linking porque depende do objeto completo do item, não só de um id
 * na URL — não é um caso de uso de deep link aqui.
 */
const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: "",
      Settings: "configuracoes",
      Admin: "admin",
    },
  },
};

/**
 * Navegação estritamente hierárquica (sem tabs), conforme
 * docs/UX-ARCHITECTURE.md seção 3, mesclada (2026-09-21, a pedido do
 * Head) para: Home (Prática da Semana + Orações/Músicas/Textos/Livros na
 * mesma página) -> detalhe do item. O hub intermediário "Mensageiros"
 * foi removido — a Home assumiu esse papel. "Voltar" usa os
 * gestos/botões nativos de cada SO (comportamento padrão do
 * native-stack, sem customização que quebre a convenção).
 */
export function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  // Começa escondida: em deep link direto pra /admin ou /configuracoes
  // (linking), a rota real só é conhecida no onReady — começar com
  // show:true piscaria a barra por um instante nessas telas antes de
  // corrigir.
  const [barState, setBarState] = useState<{ show: boolean; active?: ContentCategory }>({
    show: false,
  });

  const syncBar = useCallback(() => {
    const route = navigationRef.getCurrentRoute();
    if (!route) return;
    const name = route.name as keyof RootStackParamList;
    setBarState({
      show: !SCREENS_WITHOUT_BAR.has(name),
      active: activeCategoryFor(name, route.params as never),
    });
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef} linking={linking} onReady={syncBar} onStateChange={syncBar}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.bodyFallback },
          headerTitleAlign: "center",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          // Slide horizontal (padrão iOS) em vez do crossfade anterior
          // (2026-09-21, a pedido do Head — o fade "apagava tudo",
          // BottomNavBar incluída, antes de reaparecer, sentido como uma
          // transição quebrada/feia). Agora a barra é persistente (fora
          // do Stack.Navigator, só o conteúdo desliza por baixo dela —
          // ver BottomNavBar renderizada abaixo), então a transição lê
          // como elegante e direcional, sem nada "sumindo".
          animation: "slide_from_right",
          animationDuration: 280,
          // Cabeçalho fixo "Mensageiros da Paz" em todas as páginas, a
          // pedido do Head (2026-09-21) — substitui os títulos por tela
          // usados antes (nome da subpágina/item). Também funciona como
          // botão de voltar para a Home a partir de qualquer tela.
          headerTitle: () => (
            <PressableScale
              onPress={() => navigation.navigate("Home")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Ir para a Home"
              // tabIndex=1 (bug de auditoria a11y 2026-09-22, WCAG 2.4.3):
              // o header (React Navigation) monta DEPOIS do conteúdo da
              // tela no DOM em RN Web, então por padrão (tabIndex
              // implícito 0) ele só recebe foco por Tab no FINAL, depois
              // de tudo — invertendo a ordem visual (header no topo).
              // Reordenar o próprio Navigator é arriscado (afeta toda
              // tela); em vez disso, um tabIndex positivo (>0) tira este
              // elemento da ordem "natural" (0) e o coloca primeiro na
              // sequência de Tab, alinhando foco com a leitura visual sem
              // mexer em montagem/DOM. É o único tabIndex>0 do app — não
              // há outros elementos com tabIndex explícito com quem possa
              // conflitar/entrelaçar.
              // RN tipa `tabIndex` como `0 | -1 | undefined` (só cobre o
              // caso nativo de excluir da ordem de foco); no DOM/RN Web
              // qualquer inteiro é válido — mesmo `as` usado alhures no
              // arquivo pra props que passam direto pro DOM (ex.: Toast
              // `aria-live` em AdminScreen.tsx).
              {...({ tabIndex: 1 } as unknown as { tabIndex: 0 | -1 })}
            >
              <Text
                style={{
                  fontFamily: fonts.bodyFallback,
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                Mensageiros da Paz
              </Text>
            </PressableScale>
          ),
        })}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            // Ponto de entrada único para Configurações: um ícone discreto
            // no cabeçalho da Home, já que o hub "Mensageiros" foi mesclado
            // aqui e deixou de existir como tela separada.
            headerRight: () => (
              <PressableScale
                onPress={() => navigation.navigate("Settings")}
                hitSlop={8}
                style={{
                  minWidth: minTouchSize,
                  minHeight: minTouchSize,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                accessibilityRole="button"
                accessibilityLabel="Configurações"
              >
                <GearIcon size={20} color={colors.primary} />
              </PressableScale>
            ),
          })}
        />
        <Stack.Screen name="ContentList" component={ContentListScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
      {barState.show ? (
        <BottomNavBar active={barState.active} navigationRef={navigationRef} />
      ) : null}
    </NavigationContainer>
  );
}
