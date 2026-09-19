# Mensageiros da Paz — App Mobile

App React Native (Expo) para iOS e Android. Decisão de stack registrada em
`../DECISIONS.md` (2026-09-18): Expo managed workflow, consumindo Firebase
(Firestore/Storage/Auth) conforme `../docs/BACKEND-ARCHITECTURE.md`.

**Push notifications (atualizado 2026-09-18):** por decisão do Head
(`../DECISIONS.md`), push funciona hoje só em Android, custo zero, via
**Expo Push Token** (`expo-notifications` + `Notifications.getExpoPushTokenAsync()`).
Isso roda em Expo Go/managed workflow — **não é mais necessário** um
development build nativo (EAS dev client) nem `@react-native-firebase/messaging`
só para push, ao contrário de uma decisão anterior já superada. iOS via
Expo Go não recebe notificações reais por enquanto; a tela de Configurações
avisa isso ao usuário.

**Músicas do Spotify (atualizado 2026-09-19):** itens com `source: "spotify"`
(ver `../docs/BACKEND-ARCHITECTURE.md` seção 2.2) mostram o player embutido
do Spotify (`react-native-webview` no app nativo, `<iframe>` direto na
versão web — `src/components/SpotifyEmbed.tsx` e `.web.tsx`). **O player
embutido via WebView só funciona em build nativo com EAS (dev client) —
não funciona no Expo Go puro**, porque `react-native-webview` é um módulo
nativo. Na versão web (Cloudflare Pages) funciona sem restrição.

## Estrutura

```
app/
├── App.tsx                     # entrypoint, navegação + safe area
├── app.json                    # config Expo (ícone, splash, plugins nativos)
├── src/
│   ├── theme/tokens.ts         # paleta, tipografia, espaçamento (docs/CREATIVE-DIRECTION.md)
│   ├── types/index.ts          # tipos de domínio (ContentItem, rotas etc.)
│   ├── firebase/
│   │   ├── config.ts           # inicialização do Firebase Web SDK (Firestore/Auth)
│   │   └── firestore.ts        # leituras: practice_of_the_week, items por categoria
│   ├── navigation/RootNavigator.tsx   # Home -> Mensageiros -> Orações|Músicas|Textos
│   │                                   # ícone de engrenagem no header de "Mensageiros" -> Settings
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── MensageirosScreen.tsx
│   │   ├── ContentListScreen.tsx      # reutilizada por Orações/Músicas/Textos (via param `category`)
│   │   ├── ItemDetailScreen.tsx       # visualização de PDF/imagem/áudio
│   │   └── SettingsScreen.tsx         # toggle de notificações; acessada pelo ícone ⚙ em "Mensageiros"
│   ├── components/              # ContentListItem, LoadingState, ErrorState, EmptyState
│   └── notifications/pushNotifications.ts   # permissão + auth anônima + registro de Expo Push Token em `devices`
```

## Acesso à tela de Configurações

Não há tela de Configurações no mapa original de `../docs/UX-ARCHITECTURE.md`.
Para não adicionar nada à Home (que deve permanecer minimalista, conforme
`../docs/UX-ARCHITECTURE.md`/`../docs/CREATIVE-DIRECTION.md`), o acesso fica
num ícone discreto de engrenagem (⚙) no cabeçalho da tela "Mensageiros"
(`src/navigation/RootNavigator.tsx`, `headerRight`), que já tem um header
nativo visível. Essa tela ainda não tem wireframe/aprovação formal de
Design — ver nota em `src/screens/SettingsScreen.tsx`.

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Xcode (para simulador iOS, só em macOS) com Command Line Tools instalado
- Android Studio (para emulador Android) com um AVD configurado
- Conta Expo com `projectId` configurado em `app.json` (`extra.eas.projectId`)
  — necessário para `Notifications.getExpoPushTokenAsync()` funcionar, mesmo
  em Expo Go/managed workflow (não é mais preciso EAS dev client nativo só
  para push, ver nota acima).

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
   Firestore/Storage/Auth (`src/firebase/config.ts`), incluindo a
   autenticação anônima usada antes de escrever na coleção `devices`
   (ver `src/notifications/pushNotifications.ts`).
2. **`projectId` do EAS** (`app.json` → `extra.eas.projectId`) — necessário
   para `Notifications.getExpoPushTokenAsync()` gerar um Expo Push Token
   válido. Criar com `eas init` (conta Expo gratuita).
3. **Firestore Security Rules** — habilitar autenticação anônima no
   Console Firebase (Authentication → Sign-in method → Anônimo) e aplicar
   a regra `allow create: if request.auth != null` na coleção `devices`,
   conforme `../docs/BACKEND-ARCHITECTURE.md`.

O `.env` não deve ser commitado com valores reais — está no `.gitignore`.
As chaves "web" do Firebase não são segredos de servidor (são públicas por
design, protegidas pelas Security Rules), mas o time mantém a mesma
política cautelosa de não versionar essas chaves.

## Rodando localmente

Com o `projectId` do EAS configurado (ver acima), o Expo Go já é suficiente
— não há mais necessidade de development build nativo só para push:

```bash
npm start
# pressione "i" para abrir no simulador iOS, "a" para o emulador Android
# ou escaneie o QR code com o app Expo Go num dispositivo físico
```

Push (Expo Push Token) só entrega notificações de fato em **Android**, via
APK instalado diretamente no aparelho (build de produção/preview com
`eas build --platform android`). Em iOS/Expo Go, o toggle de notificações
fica desabilitado com um aviso na tela de Configurações — ver
`src/notifications/pushNotifications.ts` (`isIOSPushUnavailable`).

iOS simulator: `npm run ios` (requer Xcode instalado e simulador já criado).
Android emulator: `npm run android` (requer Android Studio com um AVD
rodando, ou `emulator -avd <nome>` executado antes).

## O que falta para rodar de ponta a ponta

- Chaves reais do Firebase (`.env`) e habilitação de autenticação anônima
  no Console Firebase — projeto Firebase ainda não foi provisionado neste
  repositório (fora do escopo deste subagente).
- Projeto EAS (`eas.json` + `projectId` em `app.json`) — criar com
  `eas init` quando o time tiver conta Expo/EAS configurada. Necessário
  para o Expo Push Token, mesmo sem build nativo.
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
