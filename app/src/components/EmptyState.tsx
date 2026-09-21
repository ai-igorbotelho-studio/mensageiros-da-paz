import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "@/theme/tokens";

interface Props {
  message: string;
}

export function EmptyState({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  message: {
    fontFamily: fonts.bodyFallback,
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
