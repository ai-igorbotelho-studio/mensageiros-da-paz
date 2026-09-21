export type ContentCategory = "oracoes" | "musicas" | "textos" | "livros";

// "txt" = arquivo de texto puro hospedado em qualquer link (Drive,
// Cloudflare, etc.), lido direto — diferente de "gdoc" (que exige um
// Google Doc de verdade, pra edição ao vivo) e diferente de `text`
// (texto colado direto no admin, sem arquivo nenhum). Amplia os
// formatos aceitos pra Textos além de só Google Doc (2026-09-21, a
// pedido do Head).
export type FileType = "pdf" | "image" | "audio" | "gdoc" | "txt";

/**
 * "upload" = arquivo com link direto, de qualquer provedor de cloud
 * (Google Drive, Dropbox, OneDrive, Cloudflare Pages, etc. — o app só
 * precisa de uma URL acessível, não importa onde está hospedada).
 * "streaming" = link para uma plataforma de streaming de música
 * (Spotify, YouTube Music, SoundCloud, Apple Music, etc.) — ver
 * `StreamingProvider`.
 */
export type ContentSource = "upload" | "streaming";

export type StreamingProvider =
  | "spotify"
  | "youtube"
  | "soundcloud"
  | "apple_music"
  | "other";

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  category: ContentCategory;
  source: ContentSource;
  // presente quando o conteúdo é texto puro (ex.: orações), exibido
  // direto na tela do item em vez de abrir um arquivo/link externo
  text: string | null;
  // presentes somente quando source === "upload"
  fileUrl: string | null;
  fileType: FileType | null;
  mimeType: string | null;
  // capa/imagem de destaque (hoje só usado por Livros) — independente
  // de `fileType`, que descreve o arquivo principal (o PDF do livro)
  coverImageUrl: string | null;
  // presentes somente quando source === "streaming"
  streamingProvider: StreamingProvider | null;
  streamingUrl: string | null;
  order: number;
  createdAt: number | null;
  published: boolean;
}

export interface PracticeOfTheWeek {
  text: string;
  inspiration: string;
  updatedAt: number | null;
}

export type RootStackParamList = {
  Home: undefined;
  ContentList: { category: ContentCategory; title: string };
  ItemDetail: { item: ContentItem };
  Settings: undefined;
  Admin: undefined;
};
