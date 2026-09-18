import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, fonts, spacing } from "@/theme/tokens";
import {
  disableNotifications,
  enableNotifications,
  isNotificationsEnabled,
} from "@/notifications/pushNotifications";

/**
 * Tela de Configurações — NÃO faz parte do mapa de telas original em
 * docs/UX-ARCHITECTURE.md (que lista só Home/Mensageiros/Orações/Músicas
 * e trata "configurações" como fora de escopo do MVP). Ela existe aqui
 * apenas para abrigar o toggle de notificações exigido por
 * docs/BACKEND-ARCHITECTURE.md seção 5 (item 1: "hoje o MVP não tem tela
 * de configurações, então esta feature exige uma nova superfície de UI
 * mínima").
 *
 * LACUNA registrada: esta tela não tem wireframe/aprovação de
 * `ux-architect`/`ui-designer`. Está implementada com o mínimo de
 * fricção visual possível, seguindo os tokens de design, mas deve ser
 * revisada por Design antes do gate de Auditoria. Por ora, não há um
 * ponto de entrada de navegação para esta tela nas 5 telas principais —
 * cabe ao Head/UX decidir onde expor o acesso (ex. ícone discreto na
 * Home, ou modal acionado só quando o app pedir permissão de push).
 */
export function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          disabled={loading}
          trackColor={{ false: colors.textSecondary, true: colors.primaryLight }}
          thumbColor={enabled ? colors.primary : colors.surface}
          accessibilityLabel="Ativar notificações"
        />
      </View>
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
});
