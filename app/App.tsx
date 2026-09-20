import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootNavigator } from "@/navigation/RootNavigator";
import { loadWebFonts } from "@/theme/loadWebFonts";

loadWebFonts();

export default function App() {
  // Dispara o carregamento da fonte de ícones (MaterialCommunityIcons) em
  // paralelo, mas NUNCA bloqueia a renderização do app nisso — no build
  // web essa promise pode não resolver de forma confiável, e travar o
  // app inteiro numa tela de loading infinita é pior do que um ícone
  // ausente por um instante. Os glyphs aparecem assim que a fonte estiver
  // pronta (o texto do botão já é legível e funcional antes disso).
  useFonts({ ...MaterialCommunityIcons.font });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
