import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import type { ContentCategory, ContentItem, PracticeOfTheWeek } from "@/types";

/**
 * Leitura de dados públicos conforme docs/BACKEND-ARCHITECTURE.md (seções 2 e 3).
 * Sem autenticação — app é 100% leitura pública no MVP.
 */

export async function fetchPracticeOfTheWeek(): Promise<PracticeOfTheWeek> {
  const ref = doc(db, "config", "practice_of_the_week");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { text: "", updatedAt: null };
  }
  const data = snap.data();
  return {
    text: data.text ?? "",
    updatedAt: data.updated_at?.toMillis?.() ?? null,
  };
}

export async function fetchItemsByCategory(
  category: ContentCategory
): Promise<ContentItem[]> {
  const itemsRef = collection(db, "items");
  const q = query(
    itemsRef,
    where("category", "==", category),
    where("published", "==", true),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "",
      description: data.description ?? null,
      category: data.category,
      source: data.source ?? "upload",
      fileUrl: data.file_url ?? null,
      fileType: data.file_type ?? null,
      mimeType: data.mime_type ?? null,
      spotifyUrl: data.spotify_url ?? null,
      order: data.order ?? 0,
      createdAt: data.created_at?.toMillis?.() ?? null,
      published: !!data.published,
    } satisfies ContentItem;
  });
}
