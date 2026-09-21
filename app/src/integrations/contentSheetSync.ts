import type { ContentCategory } from "@/types";
import type { ItemFormValues } from "@/firebase/admin";

/**
 * Envia cada item criado via "Publicação manual" (não os importados de
 * planilha — esses já vêm de lá) pra planilha-índice da categoria
 * correspondente, como registro/backup fora do Firestore — a pedido do
 * Head (2026-09-21), mesmo mecanismo já usado pra Prática da Semana
 * (`practiceSheetSync.ts`).
 *
 * Implementado via Google Apps Script Web App (grátis, sem
 * Storage/Blaze) vinculado a cada uma das 4 planilhas. Ver
 * docs/CONTENT-SHEET-SETUP.md para o script exato (um por categoria,
 * já que as colunas mudam) e o passo a passo de deploy — precisa ser
 * feito uma vez por categoria, manualmente, pelo Head (assim como foi
 * feito pra Prática da Semana).
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

// Uma linha por categoria, nas mesmas colunas já documentadas no Guia do
// Admin > Planilhas (docs/CONTENT-SHEET-SETUP.md tem o Apps Script que
// espera exatamente esses campos, na mesma ordem).
function rowFor(category: ContentCategory, item: ItemFormValues): Record<string, string> {
  switch (category) {
    case "livros":
      return {
        titulo: item.title,
        autor: item.description,
        link: item.fileUrl,
        capa: item.coverImageUrl,
      };
    case "textos":
      return {
        titulo: item.title,
        autor: item.description,
        link: item.fileUrl,
      };
    case "oracoes":
      return {
        titulo: item.title,
        texto: item.text,
      };
    case "musicas":
      return {
        titulo: item.title,
        interprete: item.description,
        link: item.source === "streaming" ? item.streamingUrl : item.fileUrl,
      };
  }
}

export async function syncItemToSheet(
  category: ContentCategory,
  item: ItemFormValues,
  publishedBy: string
): Promise<void> {
  const webhookUrl = WEBHOOK_URL_BY_CATEGORY[category];
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        ...rowFor(category, item),
        date: new Date().toISOString(),
        publishedBy,
      }),
    });
  } catch {
    // Nunca bloqueia o fluxo principal (o Firestore já salvou) — a
    // planilha é um histórico auxiliar, não a fonte de verdade do app.
  }
}
