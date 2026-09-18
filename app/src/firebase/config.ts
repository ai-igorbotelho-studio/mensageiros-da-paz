import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Config do Firebase Web SDK — usado para Firestore/Storage/Auth.
 * As chaves vêm de variáveis de ambiente públicas (EXPO_PUBLIC_*), conforme
 * app/.env.example. Nunca commitar um .env real com valores reais.
 *
 * Push usa `expo-notifications` (Expo Push Token), não
 * @react-native-firebase/messaging — ver DECISIONS.md (2026-09-18, "Push
 * notifications: só Android por enquanto") e app/README.md. Funciona em
 * Expo Go/managed workflow, sem exigir build nativo.
 *
 * `getAuth` é usado para autenticação anônima (`signInAnonymously`) antes
 * de escrever na coleção `devices`, conforme docs/BACKEND-ARCHITECTURE.md
 * (regra `allow create: if request.auth != null`).
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
