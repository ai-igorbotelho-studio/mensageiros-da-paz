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

/**
 * `EXPO_PUBLIC_FIREBASE_API_KEY` etc. ainda não existem (nenhum projeto
 * Firebase real foi criado — ver checklist em docs/BACKEND-ARCHITECTURE.md
 * seção 7). Sem essa guarda, `initializeApp` lança uma exceção síncrona no
 * carregamento do módulo (antes de qualquer componente React montar),
 * derrubando o bundle inteiro e deixando a tela em branco sem nenhum erro
 * visível ao usuário. Com a guarda, o app carrega normalmente e cada tela
 * mostra seu próprio estado de erro já implementado (ErrorState), porque as
 * funções de `firestore.ts`/`pushNotifications.ts` rejeitam com um erro
 * comum, capturado pelo try/catch que já existe em cada tela.
 */
export const firebaseReady = Boolean(firebaseConfig.apiKey);

let app: ReturnType<typeof initializeApp> | null = null;
if (firebaseReady) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const firebaseApp = app;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
