import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
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
import { AdminGuideEmbed } from "@/components/AdminGuideEmbed";
import { BookIcon, MusicIcon, PrayerIcon, TextIcon } from "@/components/CategoryIcons";
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
import { syncPracticeToSheet } from "@/integrations/practiceSheetSync";
import {
  guessFieldForHeader,
  IMPORT_FIELD_LABEL,
  parseCsv,
  toSheetCsvUrl,
  type ImportField,
} from "@/utils/sheetImport";
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
 *
 * Reestruturação de UX (2026-09-21, spec do ux-architect subagent): a
 * tela deixou de ser uma ScrollView única e virou 3 abas (Prática da
 * Semana / Biblioteca / Novo ou Editar item), a lista de itens virou um
 * accordion com reordenação por setas, ações ganharam confirmação e
 * feedback consistentes via toast, e a importação de planilha virou um
 * modal em vez de um painel que empurra o layout.
 */

// Diferenciação visual do Admin em relação ao app público (2026-09-21,
// a pedido do Head — a 1ª tentativa foi fundo escuro, reprovada por
// ficar ruim; esta troca fundo por FAIXA + TOM DE FUNDO, sem escurecer
// nada). Um cinza-greige neutro no lugar do Pale apricot do app público
// já sinaliza "isto é outra área" à primeira vista; a faixa colorida
// "Painel Administrativo" no topo reforça isso sem depender só da cor
// de fundo. Paleta/marca (Mulberry, Sage, Lora/Lexend) continuam as
// mesmas — só a composição muda.
const ADMIN_BG = "#EFE8DD";
const ADMIN_SURFACE = "#FBF7F1";

const CATEGORIES: ContentCategory[] = ["oracoes", "musicas", "textos", "livros"];
const CATEGORY_LABEL: Record<ContentCategory, string> = {
  oracoes: "Orações",
  musicas: "Músicas",
  textos: "Textos",
  livros: "Livros",
};
const CATEGORY_ICON: Record<ContentCategory, typeof PrayerIcon> = {
  oracoes: PrayerIcon,
  musicas: MusicIcon,
  textos: TextIcon,
  livros: BookIcon,
};

const PRACTICE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1XW55nKnnHtEEfp6tNDDQHI-XW_4aONsXMKBWI1s4OAA/edit?usp=sharing";

// Guia do Admin (referência rápida do painel, com paleta/tipografia/uso)
// espelhado como uma 3ª aba, na mesma hierarquia de Prática da Semana e
// Biblioteca — a pedido do Head (2026-09-21). Fonte ÚNICA a partir de
// agora: app/public/guia-admin.html, servido como arquivo estático do
// próprio Cloudflare Pages (copiado pro build automaticamente). Um link
// de artifact do claude.ai foi tentado antes e descartado — recusa ser
// embutido em iframe de outro domínio (X-Frame-Options/CSP) e exigia
// manter duas cópias do conteúdo em sincronia manual, o que o Head
// pediu pra eliminar. Qualquer atualização de conteúdo do guia edita
// só este arquivo.
const ADMIN_GUIDE_URL = "https://mensageiros-da-paz.pages.dev/guia-admin.html";

const DEFAULT_IMPORT_FILE_TYPE: Record<ContentCategory, FileType> = {
  oracoes: "gdoc",
  musicas: "audio",
  textos: "gdoc",
  livros: "pdf",
};

const IMPORT_FIELD_OPTIONS: ImportField[] = [
  "ignore",
  "title",
  "description",
  "text",
  "coverImageUrl",
  "fileUrl",
  "fileType",
  "order",
];

const CATEGORY_SHEET_URL: Record<ContentCategory, string> = {
  oracoes:
    "https://docs.google.com/spreadsheets/d/1Hz3lTmV4ubosdQEFhE91RkYxrRf8AhCvFF7kHciO7tk/edit?usp=sharing",
  livros:
    "https://docs.google.com/spreadsheets/d/1LKTCZBxk7Auotzb7ud9Z-HQ8a9E6I2xtYQRUpVptw34/edit?usp=sharing",
  textos:
    "https://docs.google.com/spreadsheets/d/1wo1EkVy5bo8o6rZNUYSCrH2oDAJuiw-hQAR5s7oLIT4/edit?usp=sharing",
  musicas:
    "https://docs.google.com/spreadsheets/d/1tJy1a21XWSQOeTiYOcPXr-Rrt0n54ry_cK2UzZKQoMc/edit?usp=sharing",
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
  coverImageUrl: "",
  streamingProvider: "spotify",
  streamingUrl: "",
  order: 1,
  published: true,
};

// A aba "Novo item" foi absorvida pela Biblioteca (2026-09-21, a
// pedido do Head): ter um formulário de item separado por aba e a
// lista de itens em outra criava duas formas de chegar no mesmo lugar
// e confundia navegação. Agora "Publicação manual" é uma seção
// recolhível dentro de cada categoria da Biblioteca — só uma tela, só
// um fluxo por categoria.
type Tab = "practice" | "library" | "guide";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "practice", label: "Prática da Semana" },
  { key: "library", label: "Biblioteca" },
  { key: "guide", label: "Guia do Admin" },
];

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
        <View style={styles.adminBanner}>
          <Text style={styles.adminBannerText}>Painel administrativo</Text>
        </View>
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

type ToastState = { message: string; kind: "success" | "error" } | null;

function Toast({ toast }: { toast: ToastState }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }, 2300);
    return () => clearTimeout(timer);
  }, [toast, opacity]);

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        toast.kind === "error" ? styles.toastError : styles.toastSuccess,
        { opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <Text style={[styles.chevron, expanded && styles.chevronExpanded]}>›</Text>
  );
}

function AdminDashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<Tab>("practice");
  const [toast, setToast] = useState<ToastState>(null);

  function notify(message: string, kind: "success" | "error" = "success") {
    setToast({ message, kind });
  }

  const [practiceText, setPracticeText] = useState("");
  const [practiceInspiration, setPracticeInspiration] = useState("");
  const [practiceLoading, setPracticeLoading] = useState(true);

  const [category, setCategory] = useState<ContentCategory>("livros");
  const [categoryCounts, setCategoryCounts] = useState<Record<ContentCategory, number>>({
    oracoes: 0,
    musicas: 0,
    textos: 0,
    livros: 0,
  });
  const [items, setItems] = useState<ContentItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  // "Biblioteca completa": visão com os itens das 4 categorias juntos,
  // reaproveitando a mesma busca que já alimenta `categoryCounts` (não
  // dispara uma segunda leitura ao Firestore).
  const [libraryOverview, setLibraryOverview] = useState<
    Record<ContentCategory, ContentItem[]>
  >({ oracoes: [], musicas: [], textos: [], livros: [] });
  const [overviewLoading, setOverviewLoading] = useState(true);
  // Abre a Biblioteca já em "Biblioteca completa" — visão geral primeiro,
  // categoria específica é uma escolha explícita (a pedido do Head).
  const [showAllLibrary, setShowAllLibrary] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [manualOpen, setManualOpen] = useState(false);
  const [form, setForm] = useState<ItemFormValues>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  // "Apagar todos" virou "selecionar e apagar" (2026-09-21, a pedido do
  // Head): um botão único apagando a categoria inteira num toque era
  // perigoso demais — agora exige entrar em modo de seleção e marcar os
  // itens antes de qualquer exclusão em lote.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [importOpen, setImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importRows, setImportRows] = useState<string[][]>([]);
  const [importMapping, setImportMapping] = useState<ImportField[]>([]);
  const [importSelected, setImportSelected] = useState<Set<number>>(new Set());
  const [importRunning, setImportRunning] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    adminGetPracticeOfTheWeek()
      .then(({ text, inspiration }) => {
        setPracticeText(text);
        setPracticeInspiration(inspiration);
      })
      .finally(() => setPracticeLoading(false));
  }, []);

  function refreshCounts() {
    setOverviewLoading(true);
    Promise.all(CATEGORIES.map((c) => adminListItemsByCategory(c)))
      .then((results) => {
        const nextCounts = {} as Record<ContentCategory, number>;
        const nextOverview = {} as Record<ContentCategory, ContentItem[]>;
        CATEGORIES.forEach((c, i) => {
          nextCounts[c] = results[i].length;
          nextOverview[c] = results[i];
        });
        setCategoryCounts(nextCounts);
        setLibraryOverview(nextOverview);
      })
      .catch(() => {})
      .finally(() => setOverviewLoading(false));
  }

  useEffect(() => {
    refreshCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadItems = React.useCallback(() => {
    setItemsLoading(true);
    adminListItemsByCategory(category)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setItemsLoading(false));
  }, [category]);

  useEffect(() => {
    setConfirmDeleteAll(false);
    setExpandedId(null);
    setConfirmDeleteId(null);
    setSelectMode(false);
    setSelectedIds(new Set());
    loadItems();
    // A categoria escolhida na Biblioteca e a categoria do formulário
    // "Novo item" eram estados independentes: trocar a categoria não
    // sincronizava o formulário, então um item podia ser salvo na
    // categoria antiga por engano (bug relatado 2026-09-21: música
    // publicada como livro). Ao trocar de categoria, sempre reabre o
    // formulário limpo já na categoria certa — a menos que um item
    // esteja sendo editado, para não perder o que está sendo alterado.
    if (editingId === null) {
      setForm({ ...EMPTY_FORM, category });
      setManualOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, loadItems]);

  async function savePractice() {
    try {
      await adminSetPracticeOfTheWeek(practiceText, practiceInspiration, user.email ?? "admin");
      notify("Prática da semana salva.");
      syncPracticeToSheet({
        practiceText,
        inspiration: practiceInspiration,
        publishedBy: user.email ?? "admin",
      });
    } catch {
      notify("Não foi possível salvar a prática. Tente novamente.", "error");
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
      coverImageUrl: item.coverImageUrl ?? "",
      streamingProvider: item.streamingProvider ?? "spotify",
      streamingUrl: item.streamingUrl ?? "",
      order: item.order,
      published: item.published,
    });
    setCategory(item.category);
    setActiveTab("library");
    setManualOpen(true);
  }

  function startNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category, order: items.length + 1 });
    setFormError(null);
    setManualOpen(true);
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
        notify("Item atualizado.");
      } else {
        await adminCreateItem(form, user.email ?? "admin");
        notify("Item adicionado.");
      }
      setCategory(form.category);
      setEditingId(null);
      setForm({ ...EMPTY_FORM, category: form.category });
      loadItems();
      refreshCounts();
      setManualOpen(false);
    } catch {
      setFormError("Não foi possível salvar. Tente novamente.");
      notify("Não foi possível salvar o item.", "error");
    }
  }

  async function removeItem(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    try {
      await adminDeleteItem(id);
      notify("Item excluído.");
      loadItems();
      refreshCounts();
    } catch {
      notify("Não foi possível excluir o item.", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  }

  async function moveItem(item: ContentItem, direction: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((i) => i.id === item.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        adminUpdateItem(item.id, { ...formValuesFromItem(item), order: swapWith.order }),
        adminUpdateItem(swapWith.id, { ...formValuesFromItem(swapWith), order: item.order }),
      ]);
      notify("Ordem atualizada.");
      loadItems();
    } catch {
      notify("Não foi possível reordenar. Tente novamente.", "error");
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === sortedItems.length ? new Set() : new Set(sortedItems.map((i) => i.id))
    );
  }

  async function removeSelected() {
    if (selectedIds.size === 0) return;
    if (!confirmDeleteAll) {
      setConfirmDeleteAll(true);
      return;
    }
    setDeletingAll(true);
    try {
      for (const id of selectedIds) {
        await adminDeleteItem(id);
      }
      notify(`${selectedIds.size} item(ns) apagado(s) de ${CATEGORY_LABEL[category]}.`);
      setSelectedIds(new Set());
      setSelectMode(false);
      loadItems();
      refreshCounts();
    } catch {
      notify("Não foi possível apagar os itens selecionados.", "error");
    } finally {
      setDeletingAll(false);
      setConfirmDeleteAll(false);
    }
  }

  async function openImport() {
    setImportOpen(true);
    setImportLoading(true);
    setImportError(null);
    setImportResult(null);
    try {
      const csvUrl = toSheetCsvUrl(CATEGORY_SHEET_URL[category]);
      if (!csvUrl) throw new Error("URL inválida");
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("fetch failed");
      const text = await res.text();
      const table = parseCsv(text);
      if (table.length === 0) {
        setImportHeaders([]);
        setImportRows([]);
        return;
      }
      const [header, ...rows] = table;
      setImportHeaders(header);
      setImportRows(rows);
      const mapping = header.map(guessFieldForHeader);
      // Garante que sempre exista uma coluna mapeada como Título — se
      // nenhum cabeçalho bateu com a adivinhação, assume que é a
      // primeira coluna (padrão mais comum em planilhas de índice).
      if (!mapping.includes("title") && mapping.length > 0) {
        mapping[0] = "title";
      }
      setImportMapping(mapping);
      setImportSelected(new Set(rows.map((_, i) => i)));
    } catch {
      setImportError(
        "Não conseguimos ler a planilha. Confira se ela está compartilhada como \"Qualquer pessoa com o link\"."
      );
    } finally {
      setImportLoading(false);
    }
  }

  function closeImport() {
    setImportOpen(false);
    setImportHeaders([]);
    setImportRows([]);
    setImportMapping([]);
    setImportSelected(new Set());
    setImportResult(null);
    setImportError(null);
  }

  function cycleMapping(columnIndex: number) {
    setImportMapping((current) => {
      const next = [...current];
      const currentIndex = IMPORT_FIELD_OPTIONS.indexOf(next[columnIndex] ?? "ignore");
      next[columnIndex] = IMPORT_FIELD_OPTIONS[(currentIndex + 1) % IMPORT_FIELD_OPTIONS.length];
      return next;
    });
  }

  function toggleRowSelected(rowIndex: number) {
    setImportSelected((current) => {
      const next = new Set(current);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  }

  function valueForField(row: string[], field: ImportField): string {
    const columnIndex = importMapping.indexOf(field);
    if (columnIndex === -1) return "";
    return (row[columnIndex] ?? "").trim();
  }

  async function runImport() {
    setImportRunning(true);
    setImportResult(null);
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let order = items.length + 1;
    // Título (normalizado) -> item já existente na categoria — permite
    // reimportar a mesma planilha sem duplicar itens. Isso é o que
    // resolve, por exemplo, "adicionei a coluna de capa depois, os
    // livros já importados não têm capa": reimportar a planilha de
    // Livros agora ATUALIZA cada item existente com a capa, em vez de
    // criar cópias duplicadas ao lado dos originais.
    const existingByTitle = new Map(
      items.map((item) => [item.title.trim().toLowerCase(), item])
    );
    try {
      for (const rowIndex of importSelected) {
        const row = importRows[rowIndex];
        if (!row) continue;
        const title = valueForField(row, "title");
        if (!title) {
          skipped++;
          continue;
        }
        const fileUrl = valueForField(row, "fileUrl");
        const coverImageUrl = valueForField(row, "coverImageUrl");
        const text = valueForField(row, "text");
        const rawFileType = valueForField(row, "fileType").toLowerCase();
        const fileType: FileType = (["pdf", "image", "audio", "gdoc", "txt"] as FileType[]).includes(
          rawFileType as FileType
        )
          ? (rawFileType as FileType)
          : DEFAULT_IMPORT_FILE_TYPE[category];
        const rawOrder = valueForField(row, "order");
        const parsedOrder = Number(rawOrder);
        const existing = existingByTitle.get(title.trim().toLowerCase());

        const values: ItemFormValues = {
          title,
          description: valueForField(row, "description"),
          category,
          source: "upload",
          text,
          fileUrl,
          fileType,
          coverImageUrl,
          streamingProvider: "spotify",
          streamingUrl: "",
          order: Number.isFinite(parsedOrder) && rawOrder
            ? parsedOrder
            : existing
              ? existing.order
              : order,
          published: existing ? existing.published : true,
        };

        try {
          if (existing) {
            await adminUpdateItem(existing.id, values);
            updated++;
          } else {
            await adminCreateItem(values, user.email ?? "admin");
            created++;
            order++;
          }
        } catch {
          failed++;
        }
      }
      setImportResult(
        `${created} criado(s), ${updated} atualizado(s)${skipped ? `, ${skipped} sem título (ignorado(s))` : ""}${
          failed ? `, ${failed} com erro` : ""
        }.`
      );
      notify(`${created} criado(s) e ${updated} atualizado(s) em ${CATEGORY_LABEL[category]}.`);
      loadItems();
      refreshCounts();
    } finally {
      setImportRunning(false);
    }
  }

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.screen}>
      <View style={styles.adminBanner}>
        <Text style={styles.adminBannerText}>Painel administrativo</Text>
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Admin</Text>
        <Pressable onPress={() => adminSignOut()} accessibilityRole="button">
          <Text style={styles.link}>Sair</Text>
        </Pressable>
      </View>
      <Text style={styles.helper}>Logado como {user.email}</Text>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {activeTab === "practice" ? (
          <View style={styles.libraryCard}>
            <View style={styles.libraryCardHeader}>
              <Text style={styles.libraryCardTitle}>Prática da Semana</Text>
              <Pressable
                style={styles.sheetButton}
                onPress={() => Linking.openURL(PRACTICE_SHEET_URL)}
                accessibilityRole="link"
              >
                <Text style={styles.sheetButtonText}>Índice de Práticas (planilha) →</Text>
              </Pressable>
            </View>
            {practiceLoading ? (
              <Text style={styles.helper}>Carregando…</Text>
            ) : (
              <>
                <Text style={styles.fieldHint}>Texto exibido no app</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={practiceText}
                  onChangeText={setPracticeText}
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
                  onChangeText={setPracticeInspiration}
                  placeholder="Ex.: versículo, autor, referência"
                  placeholderTextColor={colors.textSecondary}
                />
                <Pressable style={styles.primaryButton} onPress={savePractice} accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>Salvar</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}

        {activeTab === "guide" ? (
          <View style={styles.libraryCard}>
            <View style={styles.libraryCardHeader}>
              <Text style={styles.libraryCardTitle}>Guia do Admin</Text>
              <Pressable
                style={styles.sheetButton}
                onPress={() => Linking.openURL(ADMIN_GUIDE_URL)}
                accessibilityRole="link"
              >
                <Text style={styles.sheetButtonText}>Abrir em nova aba →</Text>
              </Pressable>
            </View>
            <AdminGuideEmbed url={ADMIN_GUIDE_URL} />
          </View>
        ) : null}

        {activeTab === "library" ? (
          <>
            <Text style={styles.helper}>
              Escolha uma categoria para ver tudo que está publicado (e
              rascunhos, marcados como "(rascunho)") nela.
            </Text>

            <View style={styles.categoryRow}>
              <Pressable
                style={[styles.categoryChip, showAllLibrary && styles.categoryChipActive]}
                onPress={() => setShowAllLibrary(true)}
                accessibilityRole="button"
                accessibilityState={{ selected: showAllLibrary }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    showAllLibrary && styles.categoryChipTextActive,
                  ]}
                >
                  Biblioteca completa
                </Text>
              </Pressable>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.categoryChip,
                    !showAllLibrary && category === c && styles.categoryChipActive,
                  ]}
                  onPress={() => {
                    setShowAllLibrary(false);
                    setCategory(c);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !showAllLibrary && category === c }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      !showAllLibrary && category === c && styles.categoryChipTextActive,
                    ]}
                  >
                    {CATEGORY_LABEL[c]} ({categoryCounts[c]})
                  </Text>
                </Pressable>
              ))}
            </View>

            {showAllLibrary ? (
              <View style={styles.libraryCard}>
                <Text style={styles.libraryCardTitle}>Biblioteca completa</Text>
                <Text style={styles.fieldHint}>
                  Todos os itens das 4 categorias, agrupados. Toque no título de
                  uma categoria ou num item pra abrir só aquela categoria.
                </Text>
                {overviewLoading ? (
                  <>
                    <View style={styles.skeletonRow} />
                    <View style={styles.skeletonRow} />
                  </>
                ) : (
                  CATEGORIES.map((c) => {
                    const CatIcon = CATEGORY_ICON[c];
                    const catItems = [...libraryOverview[c]].sort((a, b) => a.order - b.order);
                    return (
                      <View key={c} style={styles.overviewGroup}>
                        <Pressable
                          style={styles.overviewGroupHeader}
                          onPress={() => {
                            setShowAllLibrary(false);
                            setCategory(c);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Abrir categoria ${CATEGORY_LABEL[c]}`}
                        >
                          <CatIcon size={18} color={colors.primary} />
                          <Text style={styles.overviewGroupTitle}>
                            {CATEGORY_LABEL[c]} ({catItems.length})
                          </Text>
                        </Pressable>
                        {catItems.length === 0 ? (
                          <Text style={styles.fieldHint}>Nenhum item cadastrado.</Text>
                        ) : (
                          catItems.map((item) => (
                            <Pressable
                              key={item.id}
                              style={styles.overviewItemRow}
                              onPress={() => {
                                setShowAllLibrary(false);
                                setCategory(c);
                              }}
                              accessibilityRole="button"
                            >
                              <Text style={styles.overviewItemTitle} numberOfLines={1}>
                                {item.title || "(sem título)"}
                              </Text>
                              {!item.published ? (
                                <Text style={styles.overviewItemDraft}>rascunho</Text>
                              ) : null}
                            </Pressable>
                          ))
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
            <View style={styles.libraryCard}>
              <View style={styles.libraryCardHeader}>
                <Text style={styles.libraryCardTitle}>{CATEGORY_LABEL[category]}</Text>
                <View style={styles.libraryCardButtonsRow}>
                  <Pressable
                    style={styles.sheetButton}
                    onPress={() => Linking.openURL(CATEGORY_SHEET_URL[category])}
                    accessibilityRole="link"
                  >
                    <Text style={styles.sheetButtonText}>
                      Índice de {CATEGORY_LABEL[category]} (planilha) →
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.importButton}
                    onPress={openImport}
                    accessibilityRole="button"
                  >
                    <Text style={styles.importButtonText}>Importar da planilha</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.divider} />

              {itemsLoading ? (
                <>
                  <View style={styles.skeletonRow} />
                  <View style={styles.skeletonRow} />
                  <View style={styles.skeletonRow} />
                </>
              ) : sortedItems.length === 0 ? (
                <Text style={styles.helper}>Nenhum item cadastrado nesta categoria.</Text>
              ) : (
                sortedItems.map((item, index) => {
                  const expanded = expandedId === item.id;
                  const selected = selectedIds.has(item.id);
                  return (
                    <View key={item.id} style={styles.accordionCard}>
                      <Pressable
                        style={styles.accordionHeader}
                        onPress={() =>
                          selectMode
                            ? toggleSelected(item.id)
                            : setExpandedId(expanded ? null : item.id)
                        }
                        accessibilityRole={selectMode ? "checkbox" : "button"}
                        accessibilityState={selectMode ? { checked: selected } : { expanded }}
                      >
                        {selectMode ? (
                          <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                            {selected ? <Text style={styles.checkboxMark}>✓</Text> : null}
                          </View>
                        ) : null}
                        <View style={styles.itemTextColumn}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <View style={styles.badgeRow}>
                            <View
                              style={[
                                styles.statusBadge,
                                item.published ? styles.statusBadgePublished : styles.statusBadgeDraft,
                              ]}
                            >
                              <Text style={styles.statusBadgeText}>
                                {item.published ? "Publicado" : "Rascunho"}
                              </Text>
                            </View>
                            <Text style={styles.itemMeta}>ordem {item.order}</Text>
                          </View>
                        </View>
                        {!selectMode ? <Chevron expanded={expanded} /> : null}
                      </Pressable>

                      {expanded && !selectMode ? (
                        <View style={styles.accordionBody}>
                          {item.description ? (
                            <Text style={styles.itemDescription}>{item.description}</Text>
                          ) : null}
                          <Text style={styles.itemMeta}>
                            {item.source === "streaming"
                              ? STREAMING_PROVIDER_LABEL[item.streamingProvider ?? "other"]
                              : item.fileType?.toUpperCase()}
                          </Text>

                          <View style={styles.accordionActionsRow}>
                            <Pressable
                              style={[styles.reorderButton, index === 0 && styles.buttonDisabled]}
                              onPress={() => moveItem(item, -1)}
                              disabled={index === 0}
                              accessibilityRole="button"
                              accessibilityLabel="Mover para cima"
                            >
                              <Text style={styles.reorderButtonText}>↑</Text>
                            </Pressable>
                            <Pressable
                              style={[
                                styles.reorderButton,
                                index === sortedItems.length - 1 && styles.buttonDisabled,
                              ]}
                              onPress={() => moveItem(item, 1)}
                              disabled={index === sortedItems.length - 1}
                              accessibilityRole="button"
                              accessibilityLabel="Mover para baixo"
                            >
                              <Text style={styles.reorderButtonText}>↓</Text>
                            </Pressable>
                            <View style={styles.accordionActionsSpacer} />
                            <Pressable onPress={() => startEdit(item)} accessibilityRole="button">
                              <Text style={styles.link}>Editar</Text>
                            </Pressable>
                            <Pressable onPress={() => removeItem(item.id)} accessibilityRole="button">
                              <Text style={styles.linkDanger}>
                                {confirmDeleteId === item.id ? "Confirmar exclusão" : "Excluir"}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}

              {!itemsLoading && sortedItems.length > 0 ? (
                <>
                  <View style={styles.divider} />
                  {!selectMode ? (
                    <Pressable
                      style={styles.selectModeButton}
                      onPress={() => setSelectMode(true)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.selectModeButtonText}>Selecionar itens para apagar</Text>
                    </Pressable>
                  ) : (
                    <>
                      <View style={styles.selectBar}>
                        <Pressable onPress={toggleSelectAll} accessibilityRole="button">
                          <Text style={styles.link}>
                            {selectedIds.size === sortedItems.length
                              ? "Desmarcar todos"
                              : "Selecionar todos"}
                          </Text>
                        </Pressable>
                        <Text style={styles.itemMeta}>
                          {selectedIds.size} de {sortedItems.length} selecionado(s)
                        </Text>
                      </View>
                      <View style={styles.formButtonsRow}>
                        <Pressable
                          style={[
                            styles.dangerButton,
                            styles.selectDeleteButton,
                            (selectedIds.size === 0 || deletingAll) && styles.buttonDisabled,
                          ]}
                          onPress={removeSelected}
                          disabled={selectedIds.size === 0 || deletingAll}
                          accessibilityRole="button"
                        >
                          <Text style={styles.dangerButtonText}>
                            {deletingAll
                              ? "Apagando…"
                              : confirmDeleteAll
                                ? `Confirmar: apagar ${selectedIds.size} item(ns)?`
                                : selectedIds.size === 0
                                  ? "Apagar selecionados"
                                  : `Apagar selecionados (${selectedIds.size})`}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={styles.secondaryButton}
                          onPress={() => {
                            setSelectMode(false);
                            setSelectedIds(new Set());
                            setConfirmDeleteAll(false);
                          }}
                          accessibilityRole="button"
                        >
                          <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </>
              ) : null}

              <View style={styles.divider} />

              {/*
                "Novo item" deixou de ser uma aba própria (2026-09-21, a
                pedido do Head): virou "Publicação manual", uma seção
                recolhível logo abaixo dos itens de CADA categoria da
                Biblioteca — evita duas telas/fluxos diferentes pro
                mesmo lugar (cadastrar/editar um item), reduzindo erro
                de navegação e duplicidade.
              */}
              <Pressable
                style={styles.manualToggle}
                onPress={() => {
                  if (!manualOpen) startNew();
                  else setManualOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ expanded: manualOpen }}
              >
                <Text style={styles.formGroupTitle}>
                  {editingId ? "Editando item" : "Publicação manual"}
                </Text>
                <Chevron expanded={manualOpen} />
              </Pressable>
              {!manualOpen ? (
                <Text style={styles.fieldHint}>
                  Cadastrar ou editar um item de {CATEGORY_LABEL[category]} à mão
                  (sem planilha).
                </Text>
              ) : null}
            </View>
            )}

            {manualOpen && !showAllLibrary ? (
              <>
            <View style={styles.libraryCard}>
              <Text style={styles.formGroupTitle}>Identificação</Text>
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
            </View>

            <View style={styles.libraryCard}>
              <Text style={styles.formGroupTitle}>Conteúdo</Text>
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
                    {(["pdf", "image", "audio", "gdoc", "txt"] as FileType[]).map((ft) => (
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
                  {form.fileType === "audio" ? (
                    <Text style={styles.fieldHint}>
                      Aceita qualquer formato de áudio que o navegador toque
                      (mp3, wav, m4a, ogg, etc.) — o tipo do arquivo não
                      importa pro app, só o link precisa funcionar.
                    </Text>
                  ) : null}
                  {form.fileType === "audio" && form.fileUrl.includes("drive.google.com") ? (
                    <Text style={styles.fieldHint}>
                      Link do Google Drive detectado: o app converte automaticamente
                      para o formato de reprodução direta. Funciona bem pra arquivos
                      pequenos/médios; se o áudio não tocar, o mais confiável é
                      hospedar no Cloudflare Pages (pasta content-src do repositório).
                    </Text>
                  ) : null}
                  {form.fileType === "gdoc" ? (
                    <Text style={styles.fieldHint}>
                      Cole o link de um Google Doc (não Drive comum) — ex.:
                      docs.google.com/document/d/.../edit. O app busca o texto
                      direto do documento toda vez que alguém abre o item, então
                      editar o Doc atualiza o app automaticamente. O documento
                      precisa estar compartilhado como "Qualquer pessoa com o link".
                    </Text>
                  ) : null}
                  {form.fileType === "txt" ? (
                    <Text style={styles.fieldHint}>
                      Cole o link de um arquivo de texto puro (.txt) hospedado
                      em qualquer lugar (Drive, Cloudflare, etc.) — diferente
                      de "Texto/gdoc", não precisa ser um Google Doc.
                      Funciona bem pra textos que não vão ser editados ao
                      vivo, só lidos.
                    </Text>
                  ) : null}

                  {form.category === "livros" ? (
                    <>
                      <Text style={styles.fieldHint}>
                        Capa do livro (opcional) — link direto de uma imagem
                        (Google Drive, Cloudflare, etc.). Aparece do lado do
                        título na lista de Livros; sem capa, o app mostra um
                        ícone de livro no lugar.
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="https://drive.google.com/... (imagem da capa)"
                        placeholderTextColor={colors.textSecondary}
                        value={form.coverImageUrl}
                        onChangeText={(coverImageUrl) => setForm((f) => ({ ...f, coverImageUrl }))}
                        autoCapitalize="none"
                      />
                    </>
                  ) : null}
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
            </View>

            <View style={styles.libraryCard}>
              <Text style={styles.formGroupTitle}>Publicação</Text>
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
                  <Text style={styles.primaryButtonText}>
                    {editingId ? "Salvar alterações" : "Adicionar item"}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setEditingId(null);
                    setForm({ ...EMPTY_FORM, category });
                    setFormError(null);
                    setManualOpen(false);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryButtonText}>
                    {editingId ? "Cancelar" : "Fechar"}
                  </Text>
                </Pressable>
              </View>
            </View>
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <Toast toast={toast} />

      {importOpen ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.headerRow}>
                <Text style={styles.libraryCardTitle}>
                  Importar {CATEGORY_LABEL[category]}
                </Text>
                <Pressable onPress={closeImport} accessibilityRole="button">
                  <Text style={styles.link}>Fechar</Text>
                </Pressable>
              </View>

              {importLoading ? (
                <Text style={styles.helper}>Lendo a planilha…</Text>
              ) : importError ? (
                <Text style={styles.error}>{importError}</Text>
              ) : importRows.length === 0 ? (
                <Text style={styles.helper}>
                  Nenhuma linha encontrada nessa planilha.
                </Text>
              ) : (
                <>
                  <Text style={styles.fieldHint}>
                    Toque em cada coluna abaixo pra escolher o que ela é
                    (título, descrição/autor, link, etc). Já tentamos
                    adivinhar pelo nome da coluna.
                  </Text>
                  <View style={styles.categoryRow}>
                    {importHeaders.map((header, columnIndex) => (
                      <Pressable
                        key={`${header}-${columnIndex}`}
                        style={[
                          styles.categoryChip,
                          importMapping[columnIndex] !== "ignore" &&
                            styles.categoryChipActive,
                        ]}
                        onPress={() => cycleMapping(columnIndex)}
                        accessibilityRole="button"
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            importMapping[columnIndex] !== "ignore" &&
                              styles.categoryChipTextActive,
                          ]}
                        >
                          {header || `Coluna ${columnIndex + 1}`}:{" "}
                          {IMPORT_FIELD_LABEL[importMapping[columnIndex] ?? "ignore"]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.headerRow}>
                    <Text style={styles.fieldHint}>
                      Selecione as linhas que quer importar ({importSelected.size} de{" "}
                      {importRows.length}):
                    </Text>
                    <Pressable
                      onPress={() =>
                        setImportSelected((current) =>
                          current.size === importRows.length
                            ? new Set()
                            : new Set(importRows.map((_, i) => i))
                        )
                      }
                      accessibilityRole="button"
                    >
                      <Text style={styles.link}>
                        {importSelected.size === importRows.length
                          ? "Desmarcar todos"
                          : "Selecionar todos"}
                      </Text>
                    </Pressable>
                  </View>
                  {importRows.map((row, rowIndex) => {
                    const title = valueForField(row, "title") || "(sem título)";
                    const description = valueForField(row, "description");
                    return (
                      <Pressable
                        key={rowIndex}
                        style={styles.importRow}
                        onPress={() => toggleRowSelected(rowIndex)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: importSelected.has(rowIndex) }}
                      >
                        {/*
                          A Switch aqui é só decorativa (pointerEvents
                          "none"): antes ela tinha seu próprio
                          onValueChange além do onPress da linha, e no
                          web os dois disparavam no mesmo toque — um
                          ligava, o outro desligava de volta, então o
                          toque parecia não fazer nada. Um único
                          handler (o da linha) resolve.
                        */}
                        <Switch
                          value={importSelected.has(rowIndex)}
                          trackColor={{ false: colors.textSecondary, true: colors.primaryLight }}
                          thumbColor={importSelected.has(rowIndex) ? colors.primary : colors.surface}
                          pointerEvents="none"
                        />
                        <View style={styles.itemTextColumn}>
                          <Text style={styles.itemTitle}>{title}</Text>
                          {description ? (
                            <Text style={styles.itemDescription}>{description}</Text>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}

                  {importResult ? (
                    <Text style={styles.success}>{importResult}</Text>
                  ) : null}

                  <Pressable
                    style={[
                      styles.primaryButton,
                      (importRunning || importSelected.size === 0) && styles.buttonDisabled,
                    ]}
                    onPress={runImport}
                    disabled={importRunning || importSelected.size === 0}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryButtonText}>
                      {importRunning
                        ? "Importando…"
                        : `Importar ${importSelected.size} selecionado(s)`}
                    </Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function formValuesFromItem(item: ContentItem): ItemFormValues {
  return {
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    source: item.source,
    text: item.text ?? "",
    fileUrl: item.fileUrl ?? "",
    fileType: item.fileType ?? "pdf",
    coverImageUrl: item.coverImageUrl ?? "",
    streamingProvider: item.streamingProvider ?? "spotify",
    streamingUrl: item.streamingUrl ?? "",
    order: item.order,
    published: item.published,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ADMIN_BG,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  container: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: ADMIN_BG,
    padding: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ADMIN_BG,
  },
  adminBanner: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  adminBannerText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.surface,
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
  tabRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: spacing.xs / 2,
  },
  // Trocado de sublinhado fino (pouco destaque, achado do Head) pra
  // segmented control em pílula: a aba ativa vira um bloco sólido
  // (fundo `primary`, texto `surface`) com sombra própria — as 3 abas
  // (Prática da Semana / Biblioteca / Guia do Admin) ficam no mesmo
  // nível de destaque entre si, 2026-09-21.
  tab: {
    flex: 1,
    minHeight: minTouchSize - 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textAlign: "center",
  },
  tabTextActive: {
    color: colors.surface,
  },
  sectionTitle: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  formGroupTitle: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  manualToggle: {
    minHeight: minTouchSize - 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  primaryButtonWide: {
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dangerButton: {
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
    // Antes radii.lg — única exceção restante à regra "botões sempre
    // pill" achada numa varredura (2026-09-21).
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  // "Apagar todos" virou um fluxo de seleção (2026-09-21, a pedido do
  // Head — um botão só apagando a categoria inteira era perigoso
  // demais): este botão neutro entra no modo de seleção, sem nenhum
  // efeito destrutivo por si só.
  selectModeButton: {
    minHeight: minTouchSize,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  selectModeButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  selectDeleteButton: {
    flex: 1,
    marginTop: 0,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  dangerButtonText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 14,
    color: colors.surface,
    textAlign: "center",
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
    // Mesmo bug do linkDanger: colors.accent é a cor de SUCESSO
    // (Sage), errada pra mensagem de erro.
    color: colors.danger,
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
  sheetButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  sheetButtonText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  libraryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  libraryCardHeader: {
    marginBottom: spacing.sm,
  },
  libraryCardButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  importButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  importButtonText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent,
  },
  importRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  libraryCardTitle: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  linkDanger: {
    fontFamily: fonts.bodyFallback,
    fontSize: 14,
    fontWeight: "600",
    // Antes usava colors.accent (Sage, a cor de SUCESSO) pro link
    // "Excluir"/"Confirmar exclusão" — semanticamente errado pra uma
    // ação destrutiva, achado na auditoria de direção criativa
    // 2026-09-21.
    color: colors.danger,
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
  divider: {
    height: 1,
    backgroundColor: colors.primaryLight,
    marginVertical: spacing.sm,
  },
  skeletonRow: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: ADMIN_BG,
    opacity: 0.6,
    marginBottom: spacing.xs,
  },
  overviewGroup: {
    marginTop: spacing.md,
  },
  overviewGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
    marginBottom: spacing.xs,
  },
  overviewGroupTitle: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "700",
    fontSize: 14,
    color: colors.primary,
  },
  overviewItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: minTouchSize - 12,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    gap: spacing.sm,
  },
  overviewItemTitle: {
    flex: 1,
    fontFamily: fonts.bodyFallback,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  overviewItemDraft: {
    fontFamily: fonts.bodyFallback,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  accordionCard: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: spacing.xs,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  accordionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  accordionActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  accordionActionsSpacer: {
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    color: colors.textSecondary,
    transform: [{ rotate: "0deg" }],
  },
  chevronExpanded: {
    transform: [{ rotate: "90deg" }],
    color: colors.primary,
  },
  reorderButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radii.sm,
    marginRight: spacing.xs,
  },
  reorderButtonText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusBadgePublished: {
    backgroundColor: colors.accent,
  },
  statusBadgeDraft: {
    backgroundColor: colors.textSecondary,
  },
  statusBadgeText: {
    fontFamily: fonts.bodyFallback,
    fontSize: 11,
    fontWeight: "700",
    color: colors.surface,
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
  toast: {
    position: "absolute",
    top: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toastSuccess: {
    backgroundColor: colors.accent,
  },
  toastError: {
    backgroundColor: colors.danger,
  },
  toastText: {
    fontFamily: fonts.bodyFallback,
    fontWeight: "600",
    fontSize: 14,
    color: colors.surface,
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "85%",
    backgroundColor: ADMIN_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
  },
  modalScrollContent: {
    paddingBottom: spacing.md,
  },
});
