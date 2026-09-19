import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, db, firebaseReady } from "@/firebase/config";

/**
 * Fluxo ponta a ponta descrito em docs/BACKEND-ARCHITECTURE.md seção 5 e
 * autorizado (com ressalvas) em DECISIONS.md — 2026-09-18, "Uso de dado
 * pessoal — device token FCM": opt-in explícito, desativado por padrão,
 * e exclusão do token ao desativar.
 *
 * DECISÃO ATUALIZADA (DECISIONS.md, 2026-09-18, "Push notifications: só
 * Android por enquanto, custo total US$0"): o token usado é o **Expo Push
 * Token** (`Notifications.getExpoPushTokenAsync()`), não o token FCM nativo
 * via `@react-native-firebase/messaging`. Isso funciona em Expo Go/managed
 * workflow, sem exigir EAS dev client nativo — reduz custo/complexidade de
 * build, alinhado ao uso pessoal/fechado do app.
 *
 * Push funciona hoje apenas em builds Android (APK direto). Em iOS via
 * Expo Go, o Expo Push Token não entrega notificações reais (sem
 * TestFlight/APNs configurado) — ver aviso na tela de Configurações.
 * Em ambos os casos, o Expo Push Token exige `projectId` do EAS
 * configurado em `app.json`/`eas.json` (mesmo em uso "gerenciado"),
 * usado implicitamente por `getExpoPushTokenAsync()`.
 *
 * Segurança: conforme docs/BACKEND-ARCHITECTURE.md, a coleção `devices`
 * exige `request.auth != null` para criar documentos. Por isso este
 * módulo chama `signInAnonymously()` antes de escrever/remover em
 * `devices`.
 *
 * O registro de token via SDK client direto no Firestore (como feito aqui)
 * é um atalho de MVP. docs/BACKEND-ARCHITECTURE.md recomenda mover esse
 * registro para uma Cloud Function HTTPS (`POST /devices`) antes de
 * produção, para validação server-side e rate limiting — ver seção 6.1/6.3.
 */

async function ensureAnonymousAuth(): Promise<void> {
  if (!firebaseReady || !auth) {
    throw new Error("Firebase não configurado");
  }
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

const DEVICE_ID_KEY = "device_id";
const NOTIFICATIONS_ENABLED_KEY = "notifications_enabled";
const DEVICE_DOC_ID_KEY = "device_doc_id";

// expo-notifications não tem suporte pleno a web; evitar registrar o
// handler nessa plataforma (a versão web não usa push de qualquer forma —
// ver DECISIONS.md, "Push notifications: só Android por enquanto").
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export async function isNotificationsEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  return value === "true";
}

/**
 * Push funciona hoje só em Android (ver DECISIONS.md, 2026-09-18). Em iOS
 * via Expo Go e na versão web não há entrega real de notificação — a UI
 * deve avisar isso de forma gentil em vez de deixar o toggle falhar
 * silenciosamente.
 */
export function isIOSPushUnavailable(): boolean {
  return Platform.OS !== "android";
}

export async function enableNotifications(): Promise<
  { ok: true } | { ok: false; reason: "permission_denied" | "unsupported_device" | "unknown_error" }
> {
  if (!Device.isDevice) {
    return { ok: false, reason: "unsupported_device" };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return { ok: false, reason: "permission_denied" };
  }

  try {
    const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;

    await ensureAnonymousAuth();

    const deviceId = await getOrCreateDeviceId();
    const docRef = await addDoc(collection(db!, "devices"), {
      token: expoPushToken,
      platform: Platform.OS,
      device_id: deviceId,
      created_at: serverTimestamp(),
      last_seen_at: serverTimestamp(),
    });

    await AsyncStorage.setItem(DEVICE_DOC_ID_KEY, docRef.id);
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
    return { ok: true };
  } catch {
    return { ok: false, reason: "unknown_error" };
  }
}

export async function disableNotifications(): Promise<void> {
  const docId = await AsyncStorage.getItem(DEVICE_DOC_ID_KEY);
  if (docId) {
    try {
      await ensureAnonymousAuth();
      await deleteDoc(doc(db!, "devices", docId));
    } catch {
      // Falha ao remover o token remotamente não deve travar o toggle local;
      // o job de limpeza periódica no backend cobre tokens órfãos
      // (ver DECISIONS.md, ressalva de security-privacy).
    }
    await AsyncStorage.removeItem(DEVICE_DOC_ID_KEY);
  }
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
}
