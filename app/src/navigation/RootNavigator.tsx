import React from "react";
import { Pressable, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize } from "@/theme/tokens";
import { HomeScreen } from "@/screens/HomeScreen";
import { ContentListScreen } from "@/screens/ContentListScreen";
import { ItemDetailScreen } from "@/screens/ItemDetailScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { AdminScreen } from "@/screens/AdminScreen";
import type { RootStackParamList } from "@/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

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
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.bodyFallback },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          // Cabeçalho fixo "Mensageiros da Paz" em todas as páginas, a
          // pedido do Head (2026-09-21) — substitui os títulos por tela
          // usados antes (nome da subpágina/item). Também funciona como
          // botão de voltar para a Home a partir de qualquer tela.
          headerTitle: () => (
            <Pressable
              onPress={() => navigation.navigate("Home")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Ir para a Home"
            >
              <Text
                style={{
                  fontFamily: fonts.bodyFallback,
                  fontSize: 17,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                Mensageiros da Paz
              </Text>
            </Pressable>
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
              <Pressable
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
                <Text style={{ fontSize: 20, color: colors.primary }}>⚙</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="ContentList" component={ContentListScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
