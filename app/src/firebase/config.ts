import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Config do Firebase Web SDK — usado para Firestore/Storage.
 * As chaves vêm de variáveis de ambiente públicas (EXPO_PUBLIC_*), conforme
 * app/.env.example. Nunca commitar um .env real com valores reais.
 *
 * Push (FCM) usa @react-native-firebase/messaging separadamente, que lê a
 * configuração nativa de GoogleService-Info.plist / google-services.json
 * (não deste arquivo) — ver app/README.md.
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
