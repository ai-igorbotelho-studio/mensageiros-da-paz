import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors, fonts } from "@/theme/tokens";
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
          options={{ title: "Mensageiros" }}
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
