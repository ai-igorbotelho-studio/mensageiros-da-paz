import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, fonts, spacing } from "@/theme/tokens";
import {
  disableNotifications,
  enableNotifications,
  isIOSPushUnavailable,
  isNotificationsEnabled,
} from "@/notifications/pushNotifications";

/**
 * Tela de Configurações — NÃO faz parte do mapa de telas original em
 * docs/UX-ARCHITECTURE.md (que lista só Home/Mensageiros/Orações/Músicas
 * e trata "configurações" como fora de escopo do MVP). Ela existe aqui
 * apenas para abrigar o toggle de notificações exigido por
 * docs/BACKEND-ARCHITECTURE.md seção 5.
 *
 * Ponto de entrada: ícone de engrenagem no cabeçalho da tela "Mensageiros"
 * (ver app/src/navigation/RootNavigator.tsx). A Home permanece minimalista
 * (Prática da Semana + botão MENSAGEIROS), sem nenhum elemento novo.
 *
 * LACUNA registrada: esta tela não tem wireframe/aprovação formal de
 * `ux-architect`/`ui-designer`. Está implementada com o mínimo de
 * fricção visual possível, seguindo os tokens de design, mas deve ser
 * revisada por Design antes do gate de Auditoria.
 */
export function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pushUnavailable = isIOSPushUnavailable();

  useEffect(() => {
    isNotificationsEnabled().then((value) => {
      setEnabled(value);
      setLoading(false);
    });
  }, []);

  async function handleToggle(value: boolean) {
    setErrorMessage(null);
    if (value) {
      const result = await enableNotifications();
      if (result.ok) {
        setEnabled(true);
      } else if (result.reason === "permission_denied") {
        setErrorMessage(
          "Para ativar, permita notificações nas configurações do seu aparelho."
        );
      } else if (result.reason === "unsupported_device") {
        setErrorMessage("Notificações não estão disponíveis neste dispositivo.");
      } else {
        setErrorMessage("Não conseguimos ativar agora. Tente novamente em instantes.");
      }
    } else {
      await disableNotifications();
      setEnabled(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <View style={styles.row}>
        <View style={styles.textColumn}>
          <Text style={styles.label}>Notificações</Text>
          <Text style={styles.helper}>
            Receba um aviso gentil quando houver uma nova mensagem.
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={loading || pushUnavailable}
          trackColor={{ false: colors.textSecondary, true: colors.primaryLight }}
          thumbColor={enabled ? colors.primary : colors.surface}
          accessibilityLabel="Ativar notificações"
        />
      </View>
      {pushUnavailable ? (
        <Text style={styles.notice}>
          Por enquanto, as notificações ainda não estão disponíveis por
          aqui — estamos usando um caminho mais simples e sem custo,
          pensado para Android primeiro. Assim que isso mudar, avisamos
          você.
        </Text>
      ) : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayFallback,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
  },
  textColumn: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 16,
    color: colors.textPrimary,
  },
  helper: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  error: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.accent,
    marginTop: spacing.md,
  },
  notice: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 20,
  },
});
