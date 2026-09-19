export type ContentCategory = "oracoes" | "musicas" | "textos";

export type FileType = "pdf" | "image" | "audio";

export type ContentSource = "upload" | "spotify";

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
  // presente somente quando source === "spotify"
  spotifyUrl: string | null;
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
  Mensageiros: undefined;
  ContentList: { category: ContentCategory; title: string };
  ItemDetail: { item: ContentItem };
  Settings: undefined;
};
