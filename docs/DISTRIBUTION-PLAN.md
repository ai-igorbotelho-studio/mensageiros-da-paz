# Plano de Distribuição Fechada — Mensageiros da Paz

Produzido pelo subagente `devops-deploy`. Escopo definido pela decisão do
Head em `DECISIONS.md` (2026-09-18): app de uso pessoal/grupo fechado, sem
custo de servidor, sem publicação pública nas lojas, sem manutenção
contínua. Este plano **não substitui** `docs/DEPLOY-READINESS-AUDIT.md` —
os bloqueadores de código/segurança dessa auditoria (Cloud Functions,
regra Firestore de `devices`, token FCM real, navegação para Settings,
projeto Firebase real) continuam valendo para distribuição fechada
também, exceto os itens 6 (Política de Privacidade/Nutrition Label) e
parte do item 7 (painel admin, ver observação abaixo), que são
específicos de loja pública ou podem ser simplificados. Nenhum rollout
deste plano deve acontecer antes de esses bloqueadores serem resolvidos e
reauditados.

---

## 1. Android — APK direto por link (recomendado)

**Caminho:** `eas build --platform android --profile preview` (perfil
configurado para gerar `.apk`, não `.aab`) → EAS retorna uma URL de
download do artefato → Head compartilha o link (ou o arquivo baixado) por
WhatsApp/e-mail/Drive com as pessoas cadastradas → cada pessoa instala
manualmente ("sideload"), habilitando "instalar de fontes desconhecidas"
uma vez no Android.

**Custo:** US$0. EAS Build tem tier gratuito (builds na fila compartilhada,
mais lentos, mas suficientes para builds pontuais de um grupo pequeno).
Não é necessária conta Google Play Developer (evita os US$25 únicos).

**Configuração necessária em `app/eas.json`:**
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

**Alternativa avaliada — Google Play Internal Testing Track:** grátis
para o track em si, mas exige criar conta de desenvolvedor Google Play
pagando os US$25 (taxa única, não recorrente) e aceitar as políticas de
desenvolvedor do Google (incluindo, tecnicamente, ainda ter que preencher
Data Safety form mesmo para teste interno). Para 2-3 dispositivos de um
grupo fechado, isso não compensa: **APK direto é a recomendação**, pois
some com a única vantagem prática do Play (atualização automática
percebida pelo usuário) sendo secundária face ao EAS Update (seção 3). Se
o grupo crescer para dezenas de pessoas com pouca familiaridade técnica
para habilitar "fontes desconhecidas", reavaliar o Play Internal Testing
como opção de conveniência, não de necessidade técnica.

---

## 2. iOS — decisão do Head entre Expo Go (grátis) e TestFlight (US$99/ano)

Diferente do Android, a Apple não oferece nenhum caminho gratuito para
instalar um app "de verdade" (fora do Expo Go, com ícone/nome próprio,
suportando módulos nativos) em iPhones de terceiros sem uma conta Apple
Developer Program. Isso é uma restrição da própria Apple, não uma escolha
de engenharia deste time. Duas opções reais:

### Opção A — Expo Go (grátis)

O app roda dentro do app "Expo Go", baixado gratuitamente na App Store
pela própria pessoa cadastrada. O Head compartilha um link/QR code do
projeto Expo; cada pessoa abre o link dentro do Expo Go.

**Limitação real e relevante:** o app já está configurado (ver
`DECISIONS.md`, decisão de stack mobile) para usar
`@react-native-firebase/messaging` via **EAS Build com dev client
customizado** — um módulo nativo que **não roda dentro do Expo Go**, pois
o Expo Go é um binário fechado da própria Expo sem esses módulos nativos
compilados. Na prática, se o caminho for Expo Go no iOS:
- Push notification nativo via FCM/APNs **não funciona no iOS**. A
  feature de notificações ficaria limitada ao Android.
- Todo o resto do app (telas de conteúdo, Prática da Semana, leitura)
  funciona normalmente, pois usa apenas Firebase JS SDK (sem nativo).

### Opção B — TestFlight (requer Apple Developer Program, ~US$99/ano)

Build nativo real via `eas build --platform ios --profile production` +
submissão ao TestFlight (`eas submit`). Permite convidar até 10.000
testadores por e-mail, sem revisão pública da App Store (a revisão do
TestFlight é mais leve e rápida, focada em crash/metadata básico, não em
compliance de conteúdo de loja pública). App instalado é indistinguível
de um app publicado: ícone próprio, push nativo funcionando de verdade,
sem depender do app Expo Go de terceiros.

**Custo:** US$99/ano, cobrando o Head diretamente (conta pessoal Apple
Developer). Não há como fracionar ou evitar esse valor se push nativo
real no iOS for um requisito.

**Requisitos mínimos da Apple mesmo em teste interno via TestFlight**
(reconciliando com os bloqueadores 5 e 6 da auditoria): mesmo sem
submissão pública, a Apple exige, para builds no TestFlight:
- Um **App ID** e certificados de distribuição válidos (gerados
  automaticamente pelo `eas build`/`eas submit` com credenciais
  gerenciadas pela EAS, ou manualmente no portal da Apple).
- Um **certificado APNs** configurado no projeto Firebase (já listado
  como bloqueador 5 da auditoria — "projeto Firebase real... configurar
  certificado APNs" — continua sendo pré-requisito técnico, independente
  de loja pública ou TestFlight).
- Preenchimento básico de metadados do app no App Store Connect (nome,
  categoria, ícone, screenshot mínimo) — bem mais leve que o processo de
  revisão pública, mas não é zero: o App Store Connect exige esses campos
  para criar o registro do app antes de habilitar qualquer build no
  TestFlight, mesmo interno.
- **Privacy Nutrition Label**: a Apple **exige** o preenchimento do
  formulário de privacidade (App Privacy details) no App Store Connect
  para qualquer build submetido, **incluindo TestFlight interno** — isso
  não é opcional mesmo sem loja pública. É mais simples que uma Política
  de Privacidade completa publicada (o bloqueador 6 da auditoria), mas
  não elimina a necessidade de descrever os dados coletados (token de
  device para push). **Recomendação:** ainda assim publicar uma Política
  de Privacidade simples (pode ser uma página estática/gist, sem custo de
  servidor) — é referenciada pelo formulário de App Privacy e é boa
  prática mesmo em grupo fechado, dado que dado pessoal (token FCM) é
  coletado.
- Google Play **Data Safety form**, por outro lado, só é exigido para
  publicação na Play Store — **não se aplica** ao caminho de APK direto
  (seção 1). Esse bloqueador some inteiramente para Android nesse
  cenário.

### Recomendação

Dado que o app é "para uso pessoal, ou por outras pessoas que serão
cadastradas por mim mesmo" (grupo provavelmente pequeno, poucas dezenas
no máximo), o custo per-capita do TestFlight tende a ser baixo mesmo que
apenas alguns usuários tenham iPhone. Se push notification for uma
feature que o Head valoriza de fato no iOS, **TestFlight compensa**. Se o
grupo for majoritariamente Android, ou se o Head aceitar que push fique
limitado a Android por ora, **Expo Go evita os US$99/ano** sem custo
técnico adicional — dá para migrar para TestFlight depois, sem retrabalho
de código (mesmo projeto EAS). Esta é uma escolha de custo/feature do
Head, registrada aqui como opção, não como decisão tomada por este
subagente.

---

## 3. Atualizações após o primeiro build

- **Mudanças de JS/TS/assets** (conteúdo de telas, lógica, textos,
  imagens estáticas do bundle) — cobrem a maioria das mudanças esperadas
  em um app deste porte: usar `eas update` para publicar um update OTA
  (over-the-air). O app já instalado nos dispositivos baixa a nova versão
  na próxima abertura, **sem precisar reinstalar nada** (nem novo APK,
  nem novo build no TestFlight). Grátis dentro do tier gratuito do EAS.
- **Mudanças de dependência nativa** (nova lib com código nativo, upgrade
  de versão do Expo SDK, mudança de permissões no `app.json`) — exigem
  rebuild completo (`eas build`) e redistribuição: novo APK a compartilhar
  (Android) ou novo build no TestFlight (iOS). Não é coberto por
  `eas update`.
- Recomenda-se documentar no `app/README.md` (fora do escopo deste
  arquivo, sugestão para o próprio Head ou para uma tarefa futura) o
  comando exato usado a cada release, para rastreabilidade mínima sem
  exigir um pipeline de CI completo.

---

## 4. Checklist mínimo para instalar em 2-3 dispositivos de teste hoje

Bem mais curto que o checklist de loja pública da auditoria (itens 1-7
originais). Pré-requisitos técnicos que **continuam bloqueadores** mesmo
em distribuição fechada:

1. Resolver bloqueadores 1-4 da auditoria (Cloud Function/regra segura
   para `devices`, token FCM real substituindo o token Expo, entrada de
   navegação para `SettingsScreen`) — sem isso, push não funciona nem de
   forma fechada, e a superfície de abuso na coleção `devices` existe
   independentemente do tamanho do grupo.
2. Criar o projeto Firebase real (dev único já basta para grupo fechado,
   não é necessário separar dev/staging/prod) e gerar
   `google-services.json` / `GoogleService-Info.plist` (bloqueador 5,
   parcialmente simplificado: um único ambiente é suficiente).
3. Configurar certificado APNs no Firebase (necessário só se for pelo
   caminho TestFlight/push real no iOS; dispensável se o caminho iOS for
   Expo Go sem push).
4. Popular ao menos os itens mínimos de conteúdo (`items`,
   `practice_of_the_week`) — o bloqueador 7 (painel de administração
   completo) pode ser **simplificado** para edição direta no Console do
   Firebase (Firestore Data tab) pelo próprio Head, como já antecipado na
   decisão de restrição de escopo em `DECISIONS.md`. Não é necessário
   construir um painel admin web dedicado para 2-3 dispositivos de teste.
5. `app/eas.json` com perfil `preview` (Android APK) e, se aplicável,
   perfil `production` (iOS TestFlight) configurados.
6. Conta Expo (gratuita) criada e logada via `eas login` na máquina que
   fará os builds.
7. Se optar por TestFlight: conta Apple Developer Program ativa (~US$99,
   leva 24-48h para aprovação da Apple) e Privacy Nutrition Label
   preenchido no App Store Connect (ver seção 2).
8. Rodar `eas build` para a(s) plataforma(s) escolhidas, distribuir o
   link/instalar via TestFlight, e confirmar instalação em pelo menos 1
   dispositivo Android e 1 iOS (se aplicável) antes de estender às demais
   pessoas cadastradas.

**Explicitamente fora deste checklist mínimo** (itens da auditoria que
não se aplicam a distribuição fechada sem loja pública): Política de
Privacidade publicada publicamente e Data Safety form do Google Play
(bloqueador 6, só relevante para Android — some inteiramente no caminho
APK direto); suite de testes automatizados e CI/CD completo (recomendado,
mas não bloqueador para instalar em poucos dispositivos de confiança);
App Check e rate limiting sofisticado (a lista fechada de usuários já
reduz o risco de abuso, conforme já registrado em `DECISIONS.md`).

---

## Resumo de custo

| Item | Custo |
|---|---|
| EAS Build (tier gratuito) | US$0 |
| APK direto Android | US$0 |
| Google Play Developer (evitado) | US$0 |
| Expo Go no iOS (se escolhido) | US$0 |
| Apple Developer Program (se TestFlight escolhido) | ~US$99/ano |
| **Total mínimo possível** | **US$0** (só Android + iOS via Expo Go sem push) |
| **Total se push real no iOS for exigido** | **~US$99/ano** |

O único custo monetário potencialmente inevitável do projeto inteiro é a
conta Apple Developer, e só se o Head quiser push funcionando de verdade
em iPhones fora do Expo Go — confirmando o que já estava registrado em
`DECISIONS.md`.
