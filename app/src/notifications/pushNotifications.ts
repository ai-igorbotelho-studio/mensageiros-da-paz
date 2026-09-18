import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

/**
 * Fluxo ponta a ponta descrito em docs/BACKEND-ARCHITECTURE.md seção 5 e
 * autorizado (com ressalvas) em DECISIONS.md — 2026-09-18, "Uso de dado
 * pessoal — device token FCM": opt-in explícito, desativado por padrão,
 * e exclusão do token ao desativar.
 *
 * NOTA: em produção, o token FCM real deve vir de
 * `@react-native-firebase/messaging` (`messaging().getToken()`), que exige
 * um build nativo (EAS Build) com google-services.json /
 * GoogleService-Info.plist configurados — não funciona no Expo Go. Este
 * módulo usa `expo-notifications` para a solicitação de permissão nativa
 * (compatível com Expo Go para desenvolvimento) e delega a obtenção do
 * token real ao módulo nativo do Firebase quando disponível.
 *
 * O registro de token via SDK client direto no Firestore (como feito aqui)
 * é um atalho de MVP. docs/BACKEND-ARCHITECTURE.md recomenda mover esse
 * registro para uma Cloud Function HTTPS (`POST /devices`) antes de
 * produção, para validação server-side e rate limiting — ver seção 6.1/6.3.
 */

const DEVICE_ID_KEY = "device_id";
const NOTIFICATIONS_ENABLED_KEY = "notifications_enabled";
const DEVICE_DOC_ID_KEY = "device_doc_id";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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
    // Placeholder de desenvolvimento: em build nativo, trocar por
    // `await messaging().getToken()` do @react-native-firebase/messaging.
    const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;

    const deviceId = await getOrCreateDeviceId();
    const docRef = await addDoc(collection(db, "devices"), {
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
      await deleteDoc(doc(db, "devices", docId));
    } catch {
      // Falha ao remover o token remotamente não deve travar o toggle local;
      // o job de limpeza periódica no backend cobre tokens órfãos
      // (ver DECISIONS.md, ressalva de security-privacy).
    }
    await AsyncStorage.removeItem(DEVICE_DOC_ID_KEY);
  }
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
}
