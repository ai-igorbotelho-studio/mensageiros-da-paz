/**
 * Envia cada Prática da Semana salva para a planilha Google "Mensageiros
 * da Paz" (colunas: Prática da semana | Inspiração | Data | Quem
 * publicou) — histórico legível fora do Firestore, a pedido do Head
 * (2026-09-21). Firestore guarda só a prática ATUAL (sobrescrita a cada
 * edição); a planilha vira o registro histórico.
 *
 * Implementado via Google Apps Script Web App (grátis, sem Blaze/cartão —
 * mesma restrição de custo zero já em vigor). O Apps Script fica vinculado
 * à própria planilha e expõe uma URL que aceita POST, adicionando uma
 * linha por vez. Ver docs/PRACTICE-SHEET-SETUP.md para o script exato e o
 * passo a passo de deploy.
 *
 * `EXPO_PUBLIC_PRACTICE_SHEET_WEBHOOK_URL` fica vazia até o Head fazer o
 * deploy do Apps Script e configurar a variável no Cloudflare Pages — até
 * lá, a sincronização é pulada silenciosamente (a gravação no Firestore,
 * que é o que o app realmente lê, nunca fica bloqueada por isso).
 */

interface PracticeSheetRow {
  practiceText: string;
  inspiration: string;
  publishedBy: string;
}

export async function syncPracticeToSheet(row: PracticeSheetRow): Promise<void> {
  const webhookUrl = process.env.EXPO_PUBLIC_PRACTICE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        practiceText: row.practiceText,
        inspiration: row.inspiration,
        date: new Date().toISOString(),
        publishedBy: row.publishedBy,
      }),
    });
  } catch {
    // Nunca bloqueia o fluxo principal (o Firestore já salvou) — a
    // planilha é um histórico auxiliar, não a fonte de verdade do app.
  }
}
