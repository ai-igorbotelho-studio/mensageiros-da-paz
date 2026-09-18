export type ContentCategory = "oracoes" | "musicas" | "textos";

export type FileType = "pdf" | "image" | "audio";

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  category: ContentCategory;
  fileUrl: string;
  fileType: FileType;
  mimeType: string;
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
