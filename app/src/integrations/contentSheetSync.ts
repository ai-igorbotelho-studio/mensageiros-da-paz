import type { ContentCategory } from "@/types";
import type { ItemFormValues } from "@/firebase/admin";

/**
 * Mantém a planilha da categoria em sincronia com o que acontece no
 * painel — criação, edição e exclusão de item, feitas por qualquer
 * caminho (Publicação manual OU edição/exclusão de um item que veio de
 * importação) — a pedido do Head (2026-09-21). Mesmo mecanismo já usado
 * pra Prática da Semana (`practiceSheetSync.ts`): um Google Apps Script
 * Web App por planilha, gratuito, sem Storage/Blaze.
 *
 * Diferente da Prática (que só adiciona linha nova), aqui o Apps Script
 * de cada planilha PROCURA a linha pelo título/nome (primeira coluna)
 * antes de agir:
 *   - "create": sempre adiciona linha nova (item veio da Publicação
 *     manual, ainda não está na planilha).
 *   - "update": acha a linha pelo `oldTitulo` (o título ANTES da
 *     edição — pode ter mudado) e substitui os valores; se não achar
 *     (ex.: editou um item que nunca esteve na planilha), adiciona
 *     linha nova.
 *   - "delete": acha a linha pelo título atual e só marca a coluna
 *     Status como "Deletado" — nunca remove a linha (histórico).
 *
 * Ver docs/CONTENT-SHEET-SETUP.md para os 4 scripts e o passo a passo
 * de deploy — precisa reimplantar as 4 planilhas pra ganhar as colunas
 * novas (Formato, Status) e a lógica de busca por título.
 *
 * As 4 variáveis (`EXPO_PUBLIC_SHEET_WEBHOOK_*`) ficam vazias até o
 * deploy — até lá, a sincronização é pulada silenciosamente pra cada
 * categoria sem webhook configurado. A gravação no Firestore (o que o
 * app realmente lê) nunca é bloqueada por isso.
 */

const WEBHOOK_URL_BY_CATEGORY: Record<ContentCategory, string | undefined> = {
  oracoes: process.env.EXPO_PUBLIC_SHEET_WEBHOOK_ORACOES,
  musicas: process.env.EXPO_PUBLIC_SHEET_WEBHOOK_MUSICAS,
  textos: process.env.EXPO_PUBLIC_SHEET_WEBHOOK_TEXTOS,
  livros: process.env.EXPO_PUBLIC_SHEET_WEBHOOK_LIVROS,
};

type SyncAction = "create" | "update" | "delete";

function formatoFor(item: ItemFormValues): string {
  if (item.source === "streaming") return "Streaming";
  if (item.fileUrl.trim()) return item.fileType === "gdoc" ? "GDoc" : item.fileType.toUpperCase();
  if (item.text.trim()) return "Texto direto";
  return "—";
}

function statusFor(item: ItemFormValues): string {
  return item.published ? "Publicado" : "Rascunho";
}

// Uma linha por categoria — Formato e Status sempre nas 2 últimas
// colunas, em todas as 4 planilhas (ver docs/CONTENT-SHEET-SETUP.md).
function rowFor(category: ContentCategory, item: ItemFormValues): Record<string, string> {
  const formato = formatoFor(item);
  const status = statusFor(item);
  switch (category) {
    case "livros":
      return {
        titulo: item.title,
        autor: item.description,
        link: item.fileUrl,
        capa: item.coverImageUrl,
        formato,
        status,
      };
    case "textos":
      return {
        titulo: item.title,
        autor: item.description,
        link: item.fileUrl,
        formato,
        status,
      };
    case "oracoes":
      return {
        titulo: item.title,
        link: item.fileUrl,
        formato,
        status,
      };
    case "musicas":
      return {
        titulo: item.title,
        interprete: item.description,
        link: item.source === "streaming" ? item.streamingUrl : item.fileUrl,
        formato,
        status,
      };
  }
}

async function post(category: ContentCategory, payload: Record<string, unknown>): Promise<void> {
  const webhookUrl = WEBHOOK_URL_BY_CATEGORY[category];
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Nunca bloqueia o fluxo principal (o Firestore já salvou/apagou) —
    // a planilha é um histórico auxiliar, não a fonte de verdade do app.
  }
}

/** Item criado (só Publicação manual — importado já está na planilha) ou editado. */
export async function syncItemToSheet(
  category: ContentCategory,
  item: ItemFormValues,
  action: "create" | "update",
  publishedBy: string,
  oldTitulo?: string
): Promise<void> {
  await post(category, {
    action,
    oldTitulo: oldTitulo ?? item.title,
    ...rowFor(category, item),
    date: new Date().toISOString(),
    publishedBy,
  });
}

/** Item apagado — marca a linha como "Deletado" na planilha, nunca remove. */
export async function syncItemDeleteToSheet(
  category: ContentCategory,
  titulo: string,
  publishedBy: string
): Promise<void> {
  await post(category, {
    action: "delete" satisfies SyncAction,
    titulo,
    date: new Date().toISOString(),
    publishedBy,
  });
}
