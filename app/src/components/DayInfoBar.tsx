import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "@/theme/tokens";
import { getDayInfo } from "@/utils/skyInfo";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // checa a cada hora se o dia virou

/**
 * Faixa discreta acima da BottomNavBar com data, estação do ano e fase da
 * lua — sempre no fuso de São Paulo (a pedido do Head, 2026-09-21). Sem
 * chamada de rede: recalcula a partir do relógio do aparelho (ver
 * @/utils/skyInfo), então "atualiza diariamente" sozinho enquanto o app
 * fica aberto, sem custo de API.
 */
export function DayInfoBar() {
  const [info, setInfo] = useState(() => getDayInfo());

  useEffect(() => {
    const id = setInterval(() => setInfo(getDayInfo()), CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.text} numberOfLines={1}>
        {info.date} · {info.season} · {info.moonPhase}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Absoluto, não faz parte do fluxo — a BottomNavBar já é flutuante
  // (position: absolute) com um círculo que "salta" acima dela, então
  // esse valor de `bottom` deixa espaço suficiente pra faixa de
  // data/estação/lua não ficar por baixo do círculo ativo.
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 118,
    alignItems: "center",
  },
  text: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
