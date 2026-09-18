# Mensageiros da Paz — App Mobile

App React Native (Expo) para iOS e Android. Decisão de stack registrada em
`../DECISIONS.md` (2026-09-18): Expo managed workflow + EAS Build, consumindo
Firebase (Firestore/Storage/FCM) conforme `../docs/BACKEND-ARCHITECTURE.md`.

## Estrutura

```
app/
├── App.tsx                     # entrypoint, navegação + safe area
├── app.json                    # config Expo (ícone, splash, plugins nativos)
├── src/
│   ├── theme/tokens.ts         # paleta, tipografia, espaçamento (docs/CREATIVE-DIRECTION.md)
│   ├── types/index.ts          # tipos de domínio (ContentItem, rotas etc.)
│   ├── firebase/
│   │   ├── config.ts           # inicialização do Firebase Web SDK (Firestore)
│   │   └── firestore.ts        # leituras: practice_of_the_week, items por categoria
│   ├── navigation/RootNavigator.tsx   # Home -> Mensageiros -> Orações|Músicas|Textos
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── MensageirosScreen.tsx
│   │   ├── ContentListScreen.tsx      # reutilizada por Orações/Músicas/Textos (via param `category`)
│   │   ├── ItemDetailScreen.tsx       # visualização de PDF/imagem/áudio
│   │   └── SettingsScreen.tsx         # toggle de notificações (lacuna de UX, ver nota no arquivo)
│   ├── components/              # ContentListItem, LoadingState, ErrorState, EmptyState
│   └── notifications/pushNotifications.ts   # permissão + registro de token em `devices`
```

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Xcode (para simulador iOS, só em macOS) com Command Line Tools instalado
- Android Studio (para emulador Android) com um AVD configurado
- Conta Expo + EAS CLI (`npm i -g eas-cli`) — necessária porque o app usa
  `@react-native-firebase/messaging` e `expo-notifications`, que exigem um
  **development build nativo** (não funciona 100% no app Expo Go da loja).

## Instalação

```bash
cd app
npm install
cp .env.example .env
# edite .env com as chaves reais do projeto Firebase (ver seção abaixo)
```

## Variáveis de ambiente / configuração do Firebase

1. **`.env`** (não commitar) — copiado de `.env.example`, com as chaves
   "web" do Firebase (Console Firebase → Configurações do projeto → Geral →
   seção "Seus apps" → app Web). Usadas pelo Firebase JS SDK para
   Firestore/Storage (`src/firebase/config.ts`).
2. **`GoogleService-Info.plist`** (iOS) — baixar do Console Firebase (app
   iOS registrado) e colocar em `app/GoogleService-Info.plist`. Necessário
   para push via `@react-native-firebase/messaging` e referenciado em
   `app.json` (`ios.googleServicesFile`).
3. **`google-services.json`** (Android) — baixar do Console Firebase (app
   Android registrado) e colocar em `app/google-services.json`. Referenciado
   em `app.json` (`android.googleServicesFile`).

Nenhum desses três arquivos deve ser commitado com valores reais — todos
estão no `.gitignore`. As chaves "web" do Firebase não são segredos de
servidor (são públicas por design, protegidas pelas Security Rules), mas o
time mantém a mesma política cautelosa de não versionar nenhuma delas.

## Rodando localmente

### Modo desenvolvimento rápido (sem push nativo, Expo Go)

Funciona para Home, navegação, Firestore e telas de conteúdo — não registra
token FCM real (o módulo de notificações usa um token Expo de
desenvolvimento como placeholder, ver comentário em
`src/notifications/pushNotifications.ts`).

```bash
npm start
# pressione "i" para abrir no simulador iOS, "a" para o emulador Android
```

### Modo completo (com push nativo via Firebase, recomendado antes de produção)

Requer development build via EAS, pois `@react-native-firebase/messaging`
tem módulo nativo que o Expo Go não inclui:

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
# instale o build gerado no simulador/emulador ou dispositivo físico, depois:
npm start
```

iOS simulator: `npm run ios` (requer Xcode instalado e simulador já criado).
Android emulator: `npm run android` (requer Android Studio com um AVD
rodando, ou `emulator -avd <nome>` executado antes).

## O que falta para rodar de ponta a ponta

- Chaves reais do Firebase (`.env`, `GoogleService-Info.plist`,
  `google-services.json`) — projeto Firebase ainda não foi provisionado
  neste repositório (fora do escopo deste subagente).
- Projeto EAS (`eas.json` + `projectId` em `app.json`) — criar com
  `eas init` quando o time tiver conta Expo/EAS configurada.
- Assets finais de marca (`assets/icon.png`, `splash.png`,
  `adaptive-icon.png`, `notification-icon.png`) — hoje há só um
  `assets/.gitkeep`; aguardando entregável de `ui-designer`.
- Fontes reais (Fraunces/Inter) via `@expo-google-fonts/*` — hoje o app usa
  fallback de fonte do sistema (`fonts.displayFallback`/`bodyFallback` em
  `src/theme/tokens.ts`) para não travar a renderização sem o pacote de
  fontes.
- Troca do registro de device token de escrita direta no Firestore
  (implementado aqui como atalho de MVP) para a Cloud Function
  `POST /devices` recomendada em `../docs/BACKEND-ARCHITECTURE.md` (seção
  6.1/6.3), antes de produção.
- Revisão de Design (`ux-architect`/`ui-designer`) para a tela de
  Configurações, que não tinha wireframe aprovado — ver nota no topo de
  `src/screens/SettingsScreen.tsx`.
- Passagem pelo pod de auditoria (`qa-cross-browser` para matriz de
  dispositivo, `audit-code`) antes de qualquer deploy, conforme
  `../DIGITAL-PRODUCT-TEAM.md`.
