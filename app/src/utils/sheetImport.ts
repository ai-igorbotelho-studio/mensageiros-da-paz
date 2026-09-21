/**
 * Importação de planilhas Google Sheets para o admin (2026-09-21, a
 * pedido do Head): lê a planilha-índice de cada categoria como CSV
 * público (sem backend, sem Firebase Functions — mesmo princípio do
 * `toGoogleDocsTextExportUrl` em driveUrl.ts), exige apenas que a
 * planilha esteja compartilhada como "Qualquer pessoa com o link".
 */

export function toSheetCsvUrl(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  const sheetId = match?.[1];
  if (!sheetId) return null;
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

/** Parser de CSV simples, com suporte a campos entre aspas (vírgulas/quebras de linha dentro do valor). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim().length > 0)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim().length > 0)) rows.push(row);
  }
  return rows;
}

export type ImportField =
  | "ignore"
  | "title"
  | "description"
  | "text"
  | "fileUrl"
  | "fileType"
  | "order";

export const IMPORT_FIELD_LABEL: Record<ImportField, string> = {
  ignore: "Ignorar",
  title: "Título",
  description: "Descrição / Autor",
  text: "Texto completo",
  fileUrl: "Link do arquivo",
  fileType: "Tipo de arquivo (pdf/image/audio/gdoc)",
  order: "Ordem",
};

// Sem `^...$` (âncoras de início/fim): os cabeçalhos reais costumam ter
// palavras extras em volta (ex.: "Nome da oração", "Link para Gdoc"), e
// um match exato deixava tudo caindo em "Ignorar" — bug relatado
// 2026-09-21 (planilha de Orações importava tudo "sem título").
const HEADER_GUESSES: Array<{ field: ImportField; patterns: RegExp[] }> = [
  { field: "title", patterns: [/t[ií]tulo/i, /nome/i, /name/i] },
  { field: "description", patterns: [/autor/i, /descri[cç][aã]o/i, /author/i] },
  { field: "text", patterns: [/texto/i, /conte[uú]do/i, /letra/i] },
  { field: "fileUrl", patterns: [/link/i, /url/i, /arquivo/i, /imagem/i, /drive/i, /gdoc/i] },
  { field: "fileType", patterns: [/tipo/i, /formato/i] },
  { field: "order", patterns: [/ordem/i, /order/i] },
];

export function guessFieldForHeader(header: string): ImportField {
  for (const guess of HEADER_GUESSES) {
    if (guess.patterns.some((p) => p.test(header.trim()))) return guess.field;
  }
  return "ignore";
}
