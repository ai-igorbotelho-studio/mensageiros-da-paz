import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootNavigator } from "@/navigation/RootNavigator";
import { LoadingState } from "@/components/LoadingState";
import { loadWebFonts } from "@/theme/loadWebFonts";

loadWebFonts();

export default function App() {
  // Carrega explicitamente a fonte de ícones (MaterialCommunityIcons) —
  // no web, sem isso os glyphs dos botões da Home não aparecem (ficam
  // em branco até o font-face carregar, o que sem essa chamada nunca
  // acontece de forma confiável).
  const [iconFontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  if (!iconFontsLoaded) {
    return <LoadingState />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
