import React from "react";
import { Pressable, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors, fonts, minTouchSize } from "@/theme/tokens";
import { HomeScreen } from "@/screens/HomeScreen";
import { MensageirosScreen } from "@/screens/MensageirosScreen";
import { ContentListScreen } from "@/screens/ContentListScreen";
import { ItemDetailScreen } from "@/screens/ItemDetailScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import type { RootStackParamList } from "@/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Navegação estritamente hierárquica (sem tabs), conforme
 * docs/UX-ARCHITECTURE.md seção 3:
 * Home -> Mensageiros -> Orações | Músicas | Textos -> detalhe do item.
 * "Voltar" usa os gestos/botões nativos de cada SO (comportamento padrão
 * do native-stack, sem customização que quebre a convenção).
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.bodyFallback },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Mensageiros"
          component={MensageirosScreen}
          options={({ navigation }) => ({
            title: "Mensageiros",
            // Ponto de entrada único para Configurações: um ícone discreto
            // no cabeçalho de "Mensageiros" (não na Home, que permanece
            // minimalista conforme docs/UX-ARCHITECTURE.md/CREATIVE-DIRECTION.md).
            // "Mensageiros" já tem cabeçalho nativo visível, então o ícone
            // não introduz nenhuma superfície visual nova nem compete com
            // o conteúdo da Home.
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
        <Stack.Screen
          name="ContentList"
          component={ContentListScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={({ route }) => ({ title: route.params.item.title })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Configurações" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
