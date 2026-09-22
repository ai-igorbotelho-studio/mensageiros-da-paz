import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { semanticTokens as t } from "@/theme/tokens";

export interface AdminInputProps
  extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
  /** Identificador estável usado para ligar label/erro via `aria-*`. */
  fieldId?: string;
  /** Estilo extra do container externo (ex.: `flex: 1` num par lado a lado). */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * `AdminInput`/`AdminTextarea` (design/04 §2.6) num só componente
 * (`multiline` alterna pro contrato de textarea, `component.input.
 * textareaMinHeight`). Estados: default, foco (borda 2px substitui a
 * 1px, não soma — evita reflow), erro, disabled.
 */
export function AdminInput({
  label,
  error,
  hint,
  multiline = false,
  fieldId,
  editable = true,
  containerStyle,
  ...inputProps
}: AdminInputProps) {
  const [focused, setFocused] = useState(false);
  const describedBy = error ? `${fieldId ?? "admin-input"}-error` : hint ? `${fieldId ?? "admin-input"}-hint` : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text nativeID={fieldId ? `${fieldId}-label` : undefined} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        {...inputProps}
        multiline={multiline}
        editable={editable}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        placeholderTextColor={t.color.text.secondary}
        aria-labelledby={fieldId ? `${fieldId}-label` : undefined}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        style={[
          styles.input,
          multiline && styles.textArea,
          focused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      />
      {error ? (
        <Text nativeID={fieldId ? `${fieldId}-error` : undefined} style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text nativeID={fieldId ? `${fieldId}-hint` : undefined} style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Alias explícito pro contrato de textarea de design/04 §2.6. */
export function AdminTextArea(props: Omit<AdminInputProps, "multiline">) {
  return <AdminInput {...props} multiline />;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: t.space.stack.field,
  },
  label: {
    ...t.type.bodyStrong,
    color: t.color.text.primary,
    marginBottom: t.space.stack.field,
  },
  input: {
    minHeight: t.size.minTouch,
    borderWidth: 1,
    borderColor: t.color.border.default,
    borderRadius: t.radius.control,
    paddingHorizontal: t.space.inset.card,
    paddingVertical: t.space.stack.field,
    backgroundColor: t.color.surface.admin.card,
    color: t.color.text.primary,
    ...t.type.body,
  },
  textArea: {
    minHeight: t.component.input.textareaMinHeight,
    textAlignVertical: "top",
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: t.color.action.primary.bg,
  },
  inputError: {
    borderColor: t.color.border.danger,
  },
  inputDisabled: {
    opacity: t.component.button.disabledOpacity,
  },
  hint: {
    ...t.type.hint,
    marginTop: t.space.stack.field,
  },
  error: {
    ...t.type.hint,
    color: t.color.border.danger,
    marginTop: t.space.stack.field,
  },
});
