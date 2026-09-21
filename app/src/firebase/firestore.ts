import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, firebaseReady } from "./config";
import type { ContentCategory, ContentItem, PracticeOfTheWeek } from "@/types";

/**
 * Leitura de dados públicos conforme docs/BACKEND-ARCHITECTURE.md (seções 2 e 3).
 * Sem autenticação — app é 100% leitura pública no MVP.
 *
 * `firebaseReady`/`db` podem ser `false`/`null` enquanto não existir um
 * projeto Firebase real configurado (ver app/src/firebase/config.ts). Nesse
 * caso, rejeitamos com um erro comum — cada tela já trata isso com o
 * ErrorState existente, em vez de deixar `db` nulo quebrar a chamada do SDK.
 */

export async function fetchPracticeOfTheWeek(): Promise<PracticeOfTheWeek> {
  if (!firebaseReady || !db) {
    throw new Error("Firebase não configurado");
  }
  const ref = doc(db, "config", "practice_of_the_week");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { text: "", inspiration: "", updatedAt: null };
  }
  const data = snap.data();
  return {
    text: data.text ?? "",
    inspiration: data.inspiration ?? "",
    updatedAt: data.updated_at?.toMillis?.() ?? null,
  };
}

export async function fetchItemsByCategory(
  category: ContentCategory
): Promise<ContentItem[]> {
  if (!firebaseReady || !db) {
    throw new Error("Firebase não configurado");
  }
  const itemsRef = collection(db, "items");
  // Sem `orderBy` de propósito: combinar `where` em dois campos com
  // `orderBy` num terceiro exige um índice composto manual no Firestore
  // (nunca criado no console) — a consulta falhava com
  // FAILED_PRECONDITION, silenciosamente tratado como "sem itens" por
  // quem chama. Ordenar no cliente evita depender de índice nenhum, já
  // que cada categoria tem poucas dezenas de itens no máximo.
  const q = query(
    itemsRef,
    where("category", "==", category),
    where("published", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? "",
        description: data.description ?? null,
        category: data.category,
        source: data.source ?? "upload",
        text: data.text ?? null,
        fileUrl: data.file_url ?? null,
        fileType: data.file_type ?? null,
        mimeType: data.mime_type ?? null,
        streamingProvider: data.streaming_provider ?? null,
        streamingUrl: data.streaming_url ?? null,
        order: data.order ?? 0,
        createdAt: data.created_at?.toMillis?.() ?? null,
        published: !!data.published,
      } satisfies ContentItem;
    })
    .sort((a, b) => a.order - b.order);
}
