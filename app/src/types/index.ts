export type ContentCategory = "oracoes" | "musicas" | "textos" | "livros";

export type FileType = "pdf" | "image" | "audio";

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
  // presentes somente quando source === "upload"
  fileUrl: string | null;
  fileType: FileType | null;
  mimeType: string | null;
  // presentes somente quando source === "streaming"
  streamingProvider: StreamingProvider | null;
  streamingUrl: string | null;
  order: number;
  createdAt: number | null;
  published: boolean;
}

export interface PracticeOfTheWeek {
  text: string;
  updatedAt: number | null;
}

export type RootStackParamList = {
  Home: undefined;
  ContentList: { category: ContentCategory; title: string };
  ItemDetail: { item: ContentItem };
  Settings: undefined;
  Admin: undefined;
};
