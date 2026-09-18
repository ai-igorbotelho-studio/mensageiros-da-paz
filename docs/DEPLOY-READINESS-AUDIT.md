# Auditoria de Prontidão para Deploy — Mensageiros da Paz

Relatório produzido pelo subagente `audit-code`, auditoria independente e
somente-leitura, a pedido explícito do Head. Cobre segredos/credenciais,
código do app (`app/src/`), regras de segurança do Firebase, consistência
entre documentação e implementação, status das ressalvas de
`docs/PRIVACY-REVIEW.md`, e checklist de prontidão para deploy.

## Veredito

**REPROVADO — não está pronto para deploy hoje.**

7 achados bloqueadores, 4 altos, 5 médios, 3 baixos/observações.

---

## 1. Segredos/credenciais — OK

`app/.gitignore` cobre `.env`, `google-services.json`,
`GoogleService-Info.plist`, `*.jks/.p8/.p12/.key/.mobileprovision`. Apenas
`app/.env.example` está commitado, com placeholders. Nenhum segredo real
encontrado no repositório. Nenhum projeto Firebase real está configurado
ainda (esperado nesta fase).

## 2. Código do app — achados

- **BLOQUEADOR** `app/src/notifications/pushNotifications.ts:77-83`:
  registro de device token é feito por escrita direta do client no
  Firestore (`addDoc(collection(db,"devices"),...)`), sem validação
  server-side — exatamente a brecha sinalizada em `docs/PRIVACY-REVIEW.md`
  item 3d. A regra do Firestore documentada em
  `docs/BACKEND-ARCHITECTURE.md:336` é `allow create, update: if true`,
  escrita pública sem rate limit nem schema. Qualquer client não
  autenticado pode inserir volume arbitrário de documentos em `devices`
  (abuse/DoS de custo, poluição de destinatários de push).
- **BLOQUEADOR** `app/src/notifications/pushNotifications.ts:74`: usa
  `Notifications.getExpoPushTokenAsync()` (token Expo), não o token FCM
  nativo real exigido pela arquitetura. `@react-native-firebase/messaging`
  está em `package.json` mas não é importado em lugar nenhum de `src/`. A
  feature de push está sinalizada como "pronta" mas na prática é um
  placeholder de desenvolvimento incompatível com o Firebase Admin SDK
  descrito na arquitetura.
- **BLOQUEADOR (UX/funcional)** `app/src/navigation/RootNavigator.tsx:53-57`
  registra `SettingsScreen`, mas nenhuma tela (`HomeScreen.tsx`,
  `MensageirosScreen.tsx`) tem botão/link `navigation.navigate("Settings")`.
  A tela de toggle de notificações é inacessível ao usuário final — a
  feature de push não pode ser habilitada por ninguém no app publicado.
- **ALTO** `app/src/notifications/pushNotifications.ts:93-106`
  `disableNotifications()`: se `deleteDoc` falhar (rede indisponível), o
  app marca localmente `notifications_enabled=false` mesmo assim (catch
  vazio, comentário justifica com "job de limpeza"), mas esse job
  (ressalva 3c de `PRIVACY-REVIEW.md`) não existe no código nem em nenhuma
  Cloud Function no repositório — a mitigação citada no comentário não
  existe, então o token pode permanecer ativo indefinidamente após o
  usuário desativar.
- **MÉDIO** `app/src/screens/ItemDetailScreen.tsx:23-27`: `useEffect` de
  cleanup do `Audio.Sound` depende de `[sound]` — risco de manter sons
  carregados sem parar/descartar corretamente ao trocar de item na mesma
  instância de tela (pouco provável dado stack navigation cria nova
  instância por push, mas vale nota).
- **MÉDIO**: `fetchItemsByCategory`/`fetchPracticeOfTheWeek`
  (`app/src/firebase/firestore.ts`) não fazem cache local nem timeout de
  rede explícito, embora `docs/BACKEND-ARCHITECTURE.md:380-382` e
  `docs/UX-ARCHITECTURE.md` exijam cache da última leitura para modo
  offline/timeout — divergência entre doc e implementação.
- **MÉDIO**: nenhum arquivo de teste automatizado existe no repositório
  (sem `*.test.*`/`*.spec.*`/`jest.config*`) e não há `jest`/testing-library
  nas dependências. Gap total de cobertura de testes.
- **MÉDIO**: não existe `.eslintrc*` no projeto, mas `package.json` define
  `"lint": "eslint . --ext .ts,.tsx"` — o script vai falhar/rodar sem
  config (ESLint 9 exige `eslint.config.js`). Comando de qualidade
  declarado mas não funcional.
- **BAIXO**: tipagem em `app/src/firebase/firestore.ts:24,44` usa
  `snap.data()`/`d.data()` sem tipo, propagando `any` implícito para
  campos como `data.category`, sem runtime validation/schema (ex. zod).
  Funciona, mas é frágil a mudanças de shape no Firestore sem quebra em
  tempo de compilação.
- **Dependências**: `firebase ^10.12.5`, `expo ~51`, `react-native 0.74.5`
  — nenhuma CVE óbvia identificada sem acesso à rede/audit real (`npm
  audit` não rodado, sandbox sem `node_modules` instalado). Recomenda-se
  rodar `npm audit`/`osv-scanner` como parte do pipeline de CI antes do
  deploy, hoje inexistente.

## 3. Regras de segurança Firebase (conforme especificadas na doc)

- `config/practice_of_the_week` e `items`: leitura pública correta,
  escrita restrita a admin — adequado.
- `devices`: **BLOQUEADOR confirmado** — a própria documentação já
  sinaliza a brecha (`docs/BACKEND-ARCHITECTURE.md:343-346`,
  `docs/PRIVACY-REVIEW.md` item 3d), mas o código atual implementa
  exatamente a versão insegura (escrita direta client-side sem Cloud
  Function intermediária). Superfície de abuso real: qualquer pessoa pode
  inserir milhares de tokens falsos, inflando custo de envio de push e
  habilitando DoS de custo (Cloud Messaging/Firestore).

## 4. Consistência doc × código

- Divergência: push usa token Expo, não FCM nativo — a documentação
  assume FCM real.
- Divergência: não há nenhuma Cloud Function no repositório (pasta
  `functions/` inexistente) — toda a seção 3.2/3.3/5/6 de
  `BACKEND-ARCHITECTURE.md` (admin CRUD, upload validado, disparo de
  push, rate limiting, App Check) é 100% não implementada. Só o lado de
  leitura pública do app mobile existe.
- Painel de administração (seção 4 da arquitetura) inexistente no
  repositório — não há como popular `items`/`practice_of_the_week` hoje,
  então o app não tem dados reais possíveis em produção.
- Cache offline exigido por `UX-ARCHITECTURE.md` não implementado (ver
  achado médio acima).

## 5. Ressalvas de `PRIVACY-REVIEW.md` — status

| Ressalva | Status |
|---|---|
| Toggle desativado por padrão | ✅ Implementado (`SettingsScreen.tsx`, estado inicial `enabled=false`) |
| Texto de consentimento simples | ⚠️ Parcial (texto existe, não avaliado por `content-seo`/voice & tone formalmente) |
| Rota de exclusão explícita de token | ⚠️ Parcial/inseguro — escrita direta client-side, não Cloud Function validada, falha silenciosamente sem retry garantido |
| Job periódico de limpeza de tokens obsoletos | ❌ Não implementado (nenhuma Cloud Function no repo) |
| Validação server-side estrita do payload `/devices` | ❌ Não implementado |
| Política de Privacidade publicada | ❌ Não existe no repositório |
| Apple Privacy Nutrition Label / Google Play Data Safety | ⏳ Pendente (fora do escopo de código, bloqueador de publicação na loja) |
| Validação jurídica formal LGPD | ⏳ Pendente, fora do escopo técnico |

Das 9 ressalvas do parecer de privacidade, apenas 1 está resolvida
(toggle off por padrão); as demais 8 continuam pendentes, 3 delas
diretamente no código (validação server-side, job de limpeza, Cloud
Function de exclusão).

## 6. Checklist de prontidão para deploy

### BLOQUEADORES (impedem deploy)

1. Implementar Cloud Functions (`POST /devices`, validação schema
   `{token, platform}`, rate limit) e trocar a regra Firestore `devices`
   de `allow create,update: true` para escrita só via Admin SDK/Function.
2. Implementar job agendado de limpeza de tokens obsoletos (Cloud
   Scheduler + Function usando `last_seen_at`).
3. Trocar token Expo por token FCM nativo real
   (`@react-native-firebase/messaging`), com build EAS nativo testado em
   device real iOS/Android.
4. Adicionar ponto de entrada de navegação para `SettingsScreen` (hoje
   inacessível) — feature de notificações não é utilizável.
5. Criar projeto Firebase real (dev/staging/prod), preencher `.env` real
   (nunca commitado), gerar `google-services.json`/
   `GoogleService-Info.plist`, configurar certificado APNs.
6. Publicar Política de Privacidade do app e preencher Privacy Nutrition
   Label (Apple) / Data Safety form (Google) — exigência de loja, sem
   isso o app é rejeitado na submissão.
7. Construir o painel de administração (seção 4 da arquitetura) — sem ele
   não há como popular conteúdo real em produção.

### RECOMENDADO (não impede tecnicamente, mas é dívida séria)

8. Suite de testes automatizados (hoje inexistente) — pelo menos testes
   de unidade para `pushNotifications.ts`, `firestore.ts` e smoke test de
   navegação.
9. Corrigir/gerar config de ESLint para o script `lint` funcionar;
   configurar CI (lint + typecheck + testes) — hoje não há pipeline
   CI/CD no repositório.
10. Implementar cache local/offline para Home e listas de conteúdo,
    conforme já exigido pela `UX-ARCHITECTURE.md`.
11. Rodar `npm audit`/scanner de dependências antes de cada release.
12. Configurar App Check nas Cloud Functions públicas quando existirem.
13. Backup agendado do Firestore, budget alert no GCP.

## Prioridade de resolução sugerida

1 → 7 nessa ordem: sem Cloud Functions e regra segura de `devices`, não é
seguro habilitar push; sem painel admin, não há conteúdo; sem token FCM
real, push não funciona de verdade; sem entrada de navegação, a feature é
morta; sem projeto Firebase real, nada roda; Política de Privacidade e
declarações de loja são pré-requisito de submissão e podem ser feitas em
paralelo às demais.

---

## Arquivos revisados

`app/src/firebase/config.ts`, `app/src/firebase/firestore.ts`,
`app/src/notifications/pushNotifications.ts`,
`app/src/screens/SettingsScreen.tsx`,
`app/src/screens/ContentListScreen.tsx`,
`app/src/screens/ItemDetailScreen.tsx`,
`app/src/navigation/RootNavigator.tsx`, `app/package.json`,
`app/.gitignore`, `docs/BACKEND-ARCHITECTURE.md`,
`docs/PRIVACY-REVIEW.md`.
