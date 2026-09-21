import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { db, auth, firebaseReady } from "./config";
import type {
  ContentCategory,
  ContentItem,
  ContentSource,
  FileType,
  StreamingProvider,
} from "@/types";

/**
 * Escrita autenticada para a tela /admin (app/src/screens/AdminScreen.tsx).
 * Único usuário admin, criado manualmente pelo Head no Firebase Console
 * (Authentication → e-mail/senha, sem self-signup). A Security Rule exige
 * `sign_in_provider == 'password'` especificamente — não basta estar
 * autenticado, porque o app já usa autenticação ANÔNIMA para registrar
 * device tokens de push (ver pushNotifications.ts); sem essa distinção,
 * qualquer visitante do app teria permissão de escrita em `items`/`config`.
 * Ver docs/BACKEND-ARCHITECTURE.md seção 6.1 (revisão 2026-09-19, painel
 * de admin reintroduzido).
 */

export function watchAdminAuth(callback: (user: User | null) => void): () => void {
  if (!firebaseReady || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function adminSignIn(email: string, password: string): Promise<void> {
  if (!firebaseReady || !auth) {
    throw new Error("Firebase não configurado");
  }
  await signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignOut(): Promise<void> {
  if (!firebaseReady || !auth) return;
  await signOut(auth);
}

export async function adminSetPracticeOfTheWeek(
  text: string,
  inspiration: string,
  adminEmail: string
): Promise<void> {
  if (!firebaseReady || !db) throw new Error("Firebase não configurado");
  const ref = doc(db, "config", "practice_of_the_week");
  await setDoc(ref, {
    text,
    inspiration: inspiration || null,
    updated_at: serverTimestamp(),
    updated_by: adminEmail,
  });
}

/** Lista TODOS os itens de uma categoria, incluindo rascunhos não publicados (visão de admin). */
export async function adminListItemsByCategory(
  category: ContentCategory
): Promise<ContentItem[]> {
  if (!firebaseReady || !db) throw new Error("Firebase não configurado");
  const itemsRef = collection(db, "items");
  // Sem `orderBy` — ver o mesmo comentário em firestore.ts
  // (fetchItemsByCategory): evita depender de índice composto manual.
  const q = query(itemsRef, where("category", "==", category));
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
        coverImageUrl: data.cover_image_url ?? null,
        streamingProvider: data.streaming_provider ?? null,
        streamingUrl: data.streaming_url ?? null,
        order: data.order ?? 0,
        createdAt: data.created_at?.toMillis?.() ?? null,
        published: !!data.published,
      } satisfies ContentItem;
    })
    .sort((a, b) => a.order - b.order);
}

export interface ItemFormValues {
  title: string;
  description: string;
  category: ContentCategory;
  source: ContentSource;
  // texto puro (ex.: orações) — independente de source, coexiste com
  // upload/streaming quando o item também tiver um arquivo/link
  text: string;
  fileUrl: string;
  fileType: FileType;
  // capa/imagem de destaque (hoje só usado por Livros) — independente
  // de `fileUrl`, que aqui é o PDF do livro em si
  coverImageUrl: string;
  streamingProvider: StreamingProvider;
  streamingUrl: string;
  order: number;
  published: boolean;
}

function mimeTypeFor(fileType: FileType): string {
  if (fileType === "pdf") return "application/pdf";
  if (fileType === "image") return "image/jpeg";
  if (fileType === "gdoc") return "text/plain";
  return "audio/mpeg";
}

export async function adminCreateItem(values: ItemFormValues, adminEmail: string): Promise<void> {
  if (!firebaseReady || !db) throw new Error("Firebase não configurado");
  const itemsRef = collection(db, "items");
  const isUpload = values.source === "upload";
  await addDoc(itemsRef, {
    title: values.title,
    description: values.description || null,
    category: values.category,
    source: values.source,
    text: values.text || null,
    file_url: isUpload ? values.fileUrl : null,
    file_type: isUpload ? values.fileType : null,
    mime_type: isUpload ? mimeTypeFor(values.fileType) : null,
    file_size_bytes: null,
    cover_image_url: values.coverImageUrl || null,
    streaming_provider: isUpload ? null : values.streamingProvider,
    streaming_url: isUpload ? null : values.streamingUrl,
    order: values.order,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: adminEmail,
    published: values.published,
  });
}

export async function adminUpdateItem(
  id: string,
  values: ItemFormValues
): Promise<void> {
  if (!firebaseReady || !db) throw new Error("Firebase não configurado");
  const isUpload = values.source === "upload";
  await updateDoc(doc(db, "items", id), {
    title: values.title,
    description: values.description || null,
    category: values.category,
    source: values.source,
    text: values.text || null,
    file_url: isUpload ? values.fileUrl : null,
    file_type: isUpload ? values.fileType : null,
    mime_type: isUpload ? mimeTypeFor(values.fileType) : null,
    cover_image_url: values.coverImageUrl || null,
    streaming_provider: isUpload ? null : values.streamingProvider,
    streaming_url: isUpload ? null : values.streamingUrl,
    order: values.order,
    updated_at: serverTimestamp(),
    published: values.published,
  });
}

export async function adminDeleteItem(id: string): Promise<void> {
  if (!firebaseReady || !db) throw new Error("Firebase não configurado");
  await deleteDoc(doc(db, "items", id));
}

export async function adminGetPracticeOfTheWeek(): Promise<{ text: string; inspiration: string }> {
  if (!firebaseReady || !db) throw new Error("Firebase não configurado");
  const snap = await getDoc(doc(db, "config", "practice_of_the_week"));
  if (!snap.exists()) return { text: "", inspiration: "" };
  const data = snap.data();
  return { text: data.text ?? "", inspiration: data.inspiration ?? "" };
}
