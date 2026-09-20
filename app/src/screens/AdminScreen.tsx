import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import type { User } from "firebase/auth";
import { colors, fonts, minTouchSize, radii, spacing } from "@/theme/tokens";
import {
  adminCreateItem,
  adminDeleteItem,
  adminGetPracticeOfTheWeek,
  adminListItemsByCategory,
  adminSetPracticeOfTheWeek,
  adminSignIn,
  adminSignOut,
  adminUpdateItem,
  watchAdminAuth,
  type ItemFormValues,
} from "@/firebase/admin";
import { seedInitialContent } from "@/firebase/seedContent";
import { syncPracticeToSheet } from "@/integrations/practiceSheetSync";
import type {
  ContentCategory,
  ContentItem,
  ContentSource,
  FileType,
  StreamingProvider,
} from "@/types";

/**
 * Painel de admin dentro do próprio app (rota /admin na versão web),
 * revertendo a decisão original de "sem painel dedicado" — ver
 * DECISIONS.md, 2026-09-19, "Painel de admin reintroduzido". Único
 * usuário (o Head), autenticado por e-mail/senha criado manualmente no
 * Firebase Console. Não é um app separado, apenas mais uma tela do mesmo
 * código-base React Native/Expo.
 *
 * Como não há Firebase Storage (ver DECISIONS.md, "Sem Firebase
 * Storage"), o campo de arquivo é um link colado pelo Head — de
 * QUALQUER provedor de cloud com link direto (Google Drive, Dropbox,
 * OneDrive, Cloudflare Pages, etc.), não um upload real. Música também
 * aceita um link de plataforma de streaming (Spotify, YouTube Music,
 * SoundCloud, Apple Music) em vez de arquivo — ver
 * DECISIONS.md, "Streaming: suporte a múltiplas plataformas de música".
 */

const CATEGORIES: ContentCategory[] = ["oracoes", "musicas", "textos", "livros"];
const CATEGORY_LABEL: Record<ContentCategory, string> = {
  oracoes: "Orações",
  musicas: "Músicas",
  textos: "Textos",
  livros: "Livros",
};

const STREAMING_PROVIDERS: StreamingProvider[] = [
  "spotify",
  "youtube",
  "soundcloud",
  "apple_music",
  "other",
];
const STREAMING_PROVIDER_LABEL: Record<StreamingProvider, string> = {
  spotify: "Spotify",
  youtube: "YouTube Music",
  soundcloud: "SoundCloud",
  apple_music: "Apple Music",
  other: "Outra plataforma",
};

const EMPTY_FORM: ItemFormValues = {
  title: "",
  description: "",
  category: "livros",
  source: "upload",
  text: "",
  fileUrl: "",
  fileType: "pdf",
  streamingProvider: "spotify",
  streamingUrl: "",
  order: 1,
  published: true,
};

export function AdminScreen() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => watchAdminAuth(setUser), []);

  async function handleLogin() {
    setLoginError(null);
    try {
      await adminSignIn(email.trim(), password);
    } catch {
      setLoginError("E-mail ou senha incorretos.");
    }
  }

  if (user === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helper}>Carregando…</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Admin</Text>
        <Text style={styles.helper}>
          Entre com a conta criada no Firebase Authentication.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <Pressable
            style={styles.showPasswordButton}
            onPress={() => setShowPassword((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </Text>
          </Pressable>
        </View>
        {loginError ? <Text style={styles.error}>{loginError}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={handleLogin} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Entrar</Text>
        </Pressable>
      </View>
    );
  }

  return <AdminDashboard user={user} />;
}

function AdminDashboard({ user }: { user: User }) {
  const [practiceText, setPracticeText] = useState("");
  const [practiceInspiration, setPracticeInspiration] = useState("");
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [practiceSaved, setPracticeSaved] = useState(false);
  const [category, setCategory] = useState<ContentCategory>("livros");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [form, setForm] = useState<ItemFormValues>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  async function runSeed() {
    setSeedRunning(true);
    setSeedResult(null);
    try {
      const { created, failed } = await seedInitialContent(
        user.email ?? "admin",
        (done, total) => setSeedResult(`Importando… ${done}/${total}`)
      );
      setSeedResult(
        failed > 0
          ? `${created} itens importados, ${failed} falharam.`
          : `${created} itens importados com sucesso.`
      );
      loadItems();
    } catch {
      setSeedResult("Falha ao importar. Tente novamente.");
    } finally {
      setSeedRunning(false);
    }
  }

  useEffect(() => {
    adminGetPracticeOfTheWeek()
      .then(({ text, inspiration }) => {
        setPracticeText(text);
        setPracticeInspiration(inspiration);
      })
      .finally(() => setPracticeLoading(false));
  }, []);

  const loadItems = React.useCallback(() => {
    setItemsLoading(true);
    adminListItemsByCategory(category)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setItemsLoading(false));
  }, [category]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function savePractice() {
    setPracticeSaved(false);
    try {
      await adminSetPracticeOfTheWeek(practiceText, practiceInspiration, user.email ?? "admin");
      setPracticeSaved(true);
      syncPracticeToSheet({
        practiceText,
        inspiration: practiceInspiration,
        publishedBy: user.email ?? "admin",
      });
    } catch {
      // erro silencioso simples — admin interno, baixo volume de uso
    }
  }

  function startEdit(item: ContentItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      source: item.source,
      text: item.text ?? "",
      fileUrl: item.fileUrl ?? "",
      fileType: item.fileType ?? "pdf",
      streamingProvider: item.streamingProvider ?? "spotify",
      streamingUrl: item.streamingUrl ?? "",
      order: item.order,
      published: item.published,
    });
  }

  function startNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category, order: items.length + 1 });
  }

  async function submitForm() {
    setFormError(null);
    if (!form.title.trim()) {
      setFormError("Título é obrigatório.");
      return;
    }
    const hasText = form.text.trim().length > 0;
    if (!hasText && form.source === "upload" && !form.fileUrl.trim()) {
      setFormError("Cole o link do arquivo (Drive, Dropbox, OneDrive, Cloudflare, etc.) ou preencha o texto direto.");
      return;
    }
    if (!hasText && form.source === "streaming" && !form.streamingUrl.trim()) {
      setFormError("Cole o link da faixa/plataforma de streaming ou preencha o texto direto.");
      return;
    }
    try {
      if (editingId) {
        await adminUpdateItem(editingId, form);
      } else {
        await adminCreateItem(form, user.email ?? "admin");
      }
      startNew();
      loadItems();
    } catch {
      setFormError("Não foi possível salvar. Tente novamente.");
    }
  }

  async function removeItem(id: string) {
    await adminDeleteItem(id);
    loadItems();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Admin</Text>
        <Pressable onPress={() => adminSignOut()} accessibilityRole="button">
          <Text style={styles.link}>Sair</Text>
        </Pressable>
      </View>
      <Text style={styles.helper}>Logado como {user.email}</Text>

      {/* Importação única do conteúdo inicial (8 orações, 18 livros, 1
          música) — ver src/firebase/seedContent.ts. Roda só uma vez;
          clicar de novo duplica os itens, então confira a lista antes. */}
      <View style={styles.seedBox}>
        <Text style={styles.sectionTitle}>Importar conteúdo inicial</Text>
        <Text style={styles.helper}>
          Cadastra de uma vez as 8 orações, os 18 livros e a música
          "Guerreiro do Bem" já documentados. Clique só uma vez — clicar de
          novo duplica os itens.
        </Text>
        <Pressable
          style={[styles.primaryButton, seedRunning && styles.buttonDisabled]}
          onPress={runSeed}
          disabled={seedRunning}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {seedRunning ? "Importando…" : "Importar conteúdo inicial"}
          </Text>
        </Pressable>
        {seedResult ? <Text style={styles.helper}>{seedResult}</Text> : null}
      </View>

      {/* Prática da Semana */}
      <Text style={styles.sectionTitle}>Prática da Semana</Text>
      {practiceLoading ? (
        <Text style={styles.helper}>Carregando…</Text>
      ) : (
        <>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={practiceText}
            onChangeText={(t) => {
              setPracticeText(t);
              setPracticeSaved(false);
            }}
            multiline
            placeholder="Texto da prática desta semana"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.fieldHint}>
            Inspiração (opcional — fica só no registro interno/planilha, não
            aparece no app)
          </Text>
          <TextInput
            style={styles.input}
            value={practiceInspiration}
            onChangeText={(t) => {
              setPracticeInspiration(t);
              setPracticeSaved(false);
            }}
            placeholder="Ex.: versículo, autor, referência"
            placeholderTextColor={colors.textSecondary}
          />
          <Pressable style={styles.primaryButton} onPress={savePractice} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Salvar</Text>
          </Pressable>
          {practiceSaved ? <Text style={styles.success}>Salvo.</Text> : null}
        </>
      )}

      {/* Seletor de categoria */}
      <Text style={styles.sectionTitle}>Itens</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            style={[styles.categoryChip, category === c && styles.categoryChipActive]}
            onPress={() => setCategory(c)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.categoryChipText,
                category === c && styles.categoryChipTextActive,
              ]}
            >
              {CATEGORY_LABEL[c]}
            </Text>
          </Pressable>
        ))}
      </View>

      {itemsLoading ? (
        <Text style={styles.helper}>Carregando…</Text>
      ) : items.length === 0 ? (
        <Text style={styles.helper}>Nenhum item cadastrado nesta categoria.</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemTextColumn}>
              <Text style={styles.itemTitle}>
                {item.title} {item.published ? "" : "(rascunho)"}
              </Text>
              {item.description ? (
                <Text style={styles.itemDescription}>{item.description}</Text>
              ) : null}
              <Text style={styles.itemMeta}>
                {item.source === "streaming"
                  ? STREAMING_PROVIDER_LABEL[item.streamingProvider ?? "other"]
                  : item.fileType?.toUpperCase()}{" "}
                · ordem {item.order}
              </Text>
            </View>
            <Pressable onPress={() => startEdit(item)} accessibilityRole="button">
              <Text style={styles.link}>Editar</Text>
            </Pressable>
            <Pressable onPress={() => removeItem(item.id)} accessibilityRole="button">
              <Text style={styles.linkDanger}>Excluir</Text>
            </Pressable>
          </View>
        ))
      )}

      {/* Formulário de item */}
      <Text style={styles.sectionTitle}>
        {editingId ? "Editar item" : "Novo item"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        placeholderTextColor={colors.textSecondary}
        value={form.title}
        onChangeText={(title) => setForm((f) => ({ ...f, title }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição (ex: Autor · Ano)"
        placeholderTextColor={colors.textSecondary}
        value={form.description}
        onChangeText={(description) => setForm((f) => ({ ...f, description }))}
      />

      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            style={[styles.categoryChip, form.category === c && styles.categoryChipActive]}
            onPress={() => setForm((f) => ({ ...f, category: c }))}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.categoryChipText,
                form.category === c && styles.categoryChipTextActive,
              ]}
            >
              {CATEGORY_LABEL[c]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldHint}>
        Texto direto (opcional — para orações/textos exibidos na hora, sem
        precisar de arquivo)
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Cole aqui o texto completo, se houver"
        placeholderTextColor={colors.textSecondary}
        value={form.text}
        onChangeText={(text) => setForm((f) => ({ ...f, text }))}
        multiline
      />

      <View style={styles.categoryRow}>
        {(["upload", "streaming"] as ContentSource[]).map((s) => (
          <Pressable
            key={s}
            style={[styles.categoryChip, form.source === s && styles.categoryChipActive]}
            onPress={() => setForm((f) => ({ ...f, source: s }))}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.categoryChipText,
                form.source === s && styles.categoryChipTextActive,
              ]}
            >
              {s === "upload" ? "Arquivo (qualquer link direto)" : "Streaming de música"}
            </Text>
          </Pressable>
        ))}
      </View>

      {form.source === "upload" ? (
        <>
          <Text style={styles.fieldHint}>
            Cole o link direto do arquivo — qualquer provedor de cloud
            funciona (Google Drive, Dropbox, OneDrive, Cloudflare Pages,
            etc.), desde que o link seja acessível publicamente.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="https://drive.google.com/... ou https://mensageiros-da-paz.pages.dev/content/..."
            placeholderTextColor={colors.textSecondary}
            value={form.fileUrl}
            onChangeText={(fileUrl) => setForm((f) => ({ ...f, fileUrl }))}
            autoCapitalize="none"
          />
          <View style={styles.categoryRow}>
            {(["pdf", "image", "audio"] as FileType[]).map((ft) => (
              <Pressable
                key={ft}
                style={[styles.categoryChip, form.fileType === ft && styles.categoryChipActive]}
                onPress={() => setForm((f) => ({ ...f, fileType: ft }))}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    form.fileType === ft && styles.categoryChipTextActive,
                  ]}
                >
                  {ft.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.fieldHint}>
            Escolha a plataforma e cole o link da faixa/álbum/playlist. No
            Spotify o player toca embutido no app; nas outras, o link abre
            na plataforma original.
          </Text>
          <View style={styles.categoryRow}>
            {STREAMING_PROVIDERS.map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.categoryChip,
                  form.streamingProvider === p && styles.categoryChipActive,
                ]}
                onPress={() => setForm((f) => ({ ...f, streamingProvider: p }))}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    form.streamingProvider === p && styles.categoryChipTextActive,
                  ]}
                >
                  {STREAMING_PROVIDER_LABEL[p]}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="https://open.spotify.com/track/... (ou link da plataforma escolhida)"
            placeholderTextColor={colors.textSecondary}
            value={form.streamingUrl}
            onChangeText={(streamingUrl) => setForm((f) => ({ ...f, streamingUrl }))}
            autoCapitalize="none"
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Ordem (número)"
        placeholderTextColor={colors.textSecondary}
        value={String(form.order)}
        onChangeText={(v) => setForm((f) => ({ ...f, order: Number(v) || 0 }))}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <Text style={styles.label}>Publicado</Text>
        <Switch
          value={form.published}
          onValueChange={(published) => setForm((f) => ({ ...f, published }))}
          trackColor={{ false: colors.textSecondary, true: colors.primaryLight }}
          thumbColor={form.published ? colors.primary : colors.surface}
        />
      </View>

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <View style={styles.formButtonsRow}>
        <Pressable style={styles.primaryButton} onPress={submitForm} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>{editingId ? "Salvar alterações" : "Adicionar item"}</Text>
        </Pressable>
        {editingId ? (
          <Pressable style={styles.secondaryButton} onPress={startNew} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.displayFallback,
    fontSize: 24,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  helper: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  fieldHint: {
    fontFamily: fonts.bodyFallback,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  input: {
    minHeight: minTouchSize,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.bodyFallback,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  passwordInput: {
    flex: 1,
  },
  showPasswordButton: {
    minHeight: minTouchSize,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  showPasswordText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
  },
  primaryButton: {
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  seedBox: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  primaryButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 16,
    color: colors.surface,
  },
  secondaryButton: {
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
  secondaryButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 16,
    color: colors.textSecondary,
  },
  formButtonsRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  error: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  success: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    color: colors.success,
    marginTop: spacing.sm,
  },
  link: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: spacing.md,
  },
  linkDanger: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
    marginLeft: spacing.md,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    color: colors.textPrimary,
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  itemTextColumn: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemDescription: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemMeta: {
    fontFamily: fonts.bodyFallback,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodyFallback,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
