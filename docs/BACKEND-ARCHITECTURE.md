# Arquitetura de Backend — Mensageiros da Paz

Documento produzido pelo subagente `backend-integration`, estágio 04
(Integração & Dados) do pipeline em `DIGITAL-PRODUCT-TEAM.md`. Cobre a stack
recomendada, modelo de dados, contrato de API, painel de admin, notificações
push, segurança e checklist de deploy. Base para `mobile-crossplatform`
(consumo do app) e `devops-deploy` (estágio 06).

Escopo de conteúdo: conforme `docs/UX-ARCHITECTURE.md`, o app tem Home
("Prática da Semana") → Mensageiros → **Orações** / **Músicas** / **Textos**.
Este documento já assume a subpágina **Textos** (pedida pelo Head na tarefa de
admin), estendendo o hub de Mensageiros para três categorias de conteúdo, o
que deve ser confirmado com `ux-architect`/Head antes do gate de Design ser
fechado para essa tela.

---

## 1. Decisão de stack (recomendação — Head decide)

### Opções avaliadas

| Critério | Firebase | Supabase | Backend próprio (Node/Postgres) |
|---|---|---|---|
| Velocidade de entrega do MVP | Muito alta (Auth, Storage, Firestore, FCM prontos) | Alta (Postgres + Auth + Storage prontos) | Baixa (tudo construído do zero) |
| Custo inicial (baixo volume) | Free tier generoso; paga por uso acima | Free tier generoso; paga por uso acima | Custo de infra + custo de horas de eng. |
| Push nativo (APNs/FCM) | **Nativo** — Firebase Cloud Messaging cobre Android e iOS (via APNs) na mesma API | Não tem serviço de push próprio — precisa integrar FCM à parte (mais peças) | Precisa integrar FCM (Android) + APNs (iOS) manualmente |
| Storage de arquivos (PDF/imagem/áudio) | Firebase Storage: upload direto, URLs assinadas, regras de acesso declarativas | Supabase Storage: equivalente, baseado em S3 | Requer S3/Cloud Storage + lógica própria |
| Facilidade de admin (CRUD simples) | Alta — SDK client-side simples, regras de segurança declarativas | Alta — Postgres + REST/GraphQL autogerado, painel admin embutido (Supabase Studio) | Baixa — precisa construir CRUD e auth do zero |
| Modelo de dados relacional (categorias, ordenação) | Firestore é NoSQL — modelagem de listas/ordenação é mais manual | Postgres — relacional nativo, ótimo para listas ordenadas por categoria | Postgres — mesmo benefício, mais esforço de setup |
| Vendor lock-in | Alto (Firestore/regras proprietárias) | Médio (Postgres padrão por baixo, migração mais viável) | Nenhum |
| Time/skill necessário | Baixo | Baixo-médio (SQL básico) | Alto |

### Decisão recomendada: **Firebase**

Justificativa objetiva para este produto:

1. **Push é o critério decisivo.** O Head pediu explicitamente notificações
   push nativas iOS+Android. Firebase Cloud Messaging (FCM) é a única opção
   das três que resolve isso com um único SDK/API, incluindo o encaminhamento
   para APNs no iOS sem precisar de infraestrutura própria de certificado
   (ainda é preciso configurar a chave APNs no console, mas sem servidor
   próprio de push).
2. **Volume de conteúdo é pequeno e não-relacional em profundidade.** O app
   tem 3 categorias de conteúdo (Orações/Músicas/Textos) + 1 registro de
   Prática da Semana — não há necessidade de joins complexos, agregações ou
   relatórios SQL. Isso neutraliza a maior vantagem do Supabase (Postgres
   relacional) para este caso de uso específico.
3. **Velocidade de entrega para MVP é prioridade dada pelo Head** (produto
   ainda em estágio de descoberta/implementação inicial, sem prazo folgado
   documentado). Firebase minimiza código de backend: Firestore + Storage +
   Auth + FCM cobrem 100% dos requisitos sem servidor customizado a manter.
4. **Custo em baixo volume é próximo de zero** — free tier do Spark
   plan/Blaze plan pay-as-you-go é suficiente para um grupo de estudos, sem
   servidor dedicado rodando ocioso.
5. **Trade-off sacrificado (a registrar em `DECISIONS.md`):** perde-se
   portabilidade (lock-in no ecossistema Google) e a robustez de um modelo
   relacional verdadeiro. Se o app crescer para necessitar de relatórios
   complexos, múltiplos tipos de relacionamento entre entidades, ou migração
   de provedor, Postgres (Supabase ou custom) seria reavaliado. Para o
   escopo atual (CMS simples de conteúdo + push), esse custo futuro é
   aceitável frente ao ganho de velocidade agora.

### Composição da stack

- **Auth:** Firebase Authentication (e-mail/senha) — apenas para admins, não
  para usuários finais do app (app é 100% leitura pública, sem login de
  usuário no MVP).
- **Banco de dados:** Cloud Firestore (NoSQL, documentos) — coleções
  `practice_of_the_week`, `items` (com campo `category`).
- **Storage de arquivos:** Firebase Storage — PDFs, imagens (JPG/PNG) e
  áudios (mp3/m4a/wav) anexados aos itens.
- **Push:** Firebase Cloud Messaging (FCM) — cobre Android nativamente e iOS
  via integração APNs configurada no console Firebase.
- **Painel admin:** aplicação web separada (React/Vite ou similar, a critério
  de `frontend-multistack`), consumindo Firebase SDK diretamente ou via
  Cloud Functions para lógica de validação/escrita.
- **Lógica de servidor (quando necessária):** Cloud Functions for Firebase
  (Node.js/TypeScript) — usadas para: validação de upload (tipo/tamanho),
  disparo de push ao publicar item novo (opcional), e qualquer regra de
  negócio que não deva rodar no cliente.

---

## 2. Modelo de dados

### 2.1 `practice_of_the_week` (documento único, coleção `config`)

```
config/practice_of_the_week
{
  "text": string,          // conteúdo da Prática da Semana
  "updated_at": timestamp, // atualizado a cada edição
  "updated_by": string     // uid do admin que editou (auditoria simples)
}
```

Documento único (sem histórico/versionamento no MVP, conforme já definido em
`UX-ARCHITECTURE.md` seção 4).

### 2.2 `items` (coleção, um documento por item de Orações/Músicas/Textos)

```
items/{itemId}
{
  "title": string,                 // obrigatório
  "description": string | null,    // opcional, texto curto de apoio
  "category": "oracoes" | "musicas" | "textos",  // obrigatório
  "file_url": string,               // URL do arquivo no Firebase Storage
  "file_type": "pdf" | "image" | "audio",        // derivado do MIME no upload
  "mime_type": string,              // ex. "application/pdf", "audio/mpeg"
  "file_size_bytes": number,
  "order": number,                  // define ordem de exibição dentro da categoria
  "created_at": timestamp,
  "updated_at": timestamp,
  "created_by": string,             // uid do admin
  "published": boolean              // permite admin salvar rascunho sem publicar
}
```

Índice composto recomendado: `category` + `order` (ascendente) para listagem
ordenada por subpágina — configurar em `firestore.indexes.json`.

Observação de modelagem: mesmo com Firestore sendo NoSQL, o campo `category`
funciona como partição lógica; não é necessário usar sub-coleções separadas
por categoria — uma única coleção `items` filtrada por `category` simplifica
o painel admin (uma tela lista/filtra por categoria) e o app (uma query por
tela).

---

## 3. API / contratos

Duas superfícies: (a) acesso direto via Firebase SDK client-side (app mobile
e painel admin autenticado), regido por Firestore Security Rules; (b) Cloud
Functions HTTPS para operações que exigem validação server-side (upload,
disparo de push). Documentar ambas como contrato único para quem consome.

### 3.1 Leitura pública (app mobile — sem autenticação)

| Operação | Acesso | Descrição |
|---|---|---|
| `GET practice_of_the_week` | Firestore read direto (regra pública de leitura) | Retorna `{ text, updated_at }` |
| `GET items?category=oracoes` | Firestore query direta (`where category == 'oracoes' AND published == true`, `orderBy order`) | Lista itens publicados da categoria |
| `GET items?category=musicas` | idem | — |
| `GET items?category=textos` | idem | — |

Contrato equivalente em REST (caso se prefira expor via Cloud Function HTTPS
em vez de SDK direto — recomendado se o time quiser um contrato OpenAPI
estável independente do SDK):

```yaml
openapi: 3.0.3
info:
  title: Mensageiros da Paz — API pública
  version: 1.0.0
paths:
  /practice-of-the-week:
    get:
      summary: Retorna a Prática da Semana atual
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  text: { type: string }
                  updated_at: { type: string, format: date-time }
        "503":
          description: Serviço indisponível — app deve usar cache local
  /items:
    get:
      summary: Lista itens publicados de uma categoria
      parameters:
        - in: query
          name: category
          required: true
          schema: { type: string, enum: [oracoes, musicas, textos] }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Item"
components:
  schemas:
    Item:
      type: object
      properties:
        id: { type: string }
        title: { type: string }
        description: { type: string, nullable: true }
        category: { type: string, enum: [oracoes, musicas, textos] }
        file_url: { type: string, format: uri }
        file_type: { type: string, enum: [pdf, image, audio] }
        order: { type: integer }
        created_at: { type: string, format: date-time }
```

### 3.2 Escrita — admin autenticado

Todas exigem `Authorization: Bearer <Firebase ID token>` de um usuário com
custom claim `admin: true` (ver seção 6).

| Operação | Rota (Cloud Function HTTPS) | Descrição |
|---|---|---|
| `PUT /admin/practice-of-the-week` | Atualiza texto da Prática da Semana | Body `{ text }`; valida não-vazio, tamanho máx. razoável (ex. 2000 chars) |
| `POST /admin/items` | Cria item | Body com metadados; `file_url` só é setado após upload bem-sucedido (fluxo em duas etapas, seção 3.3) |
| `PUT /admin/items/{id}` | Atualiza item (título, descrição, ordem, published) | — |
| `DELETE /admin/items/{id}` | Remove item (e o arquivo associado no Storage) | Confirmação obrigatória no painel |
| `GET /admin/items?category=` | Lista todos os itens da categoria (inclusive não publicados) para o painel | — |

### 3.3 Upload de arquivo

Fluxo em duas etapas (evita bloquear a Cloud Function com upload grande):

1. Painel admin faz upload direto ao Firebase Storage (caminho
   `items/{category}/{itemId}/{filename}`), usando o SDK autenticado.
2. Cloud Function trigger `onFinalize` do Storage valida o arquivo recém-
   enviado (tipo MIME e tamanho — ver seção 6.2). Se inválido, o arquivo é
   apagado e o item marcado como `published: false` com erro reportado ao
   painel. Se válido, grava `file_url`, `file_type`, `mime_type`,
   `file_size_bytes` de volta no documento `items/{itemId}`.

Tipos aceitos: `application/pdf`, `image/jpeg`, `image/png`,
`audio/mpeg` (mp3), `audio/mp4`/`audio/x-m4a` (m4a), `audio/wav`,
`audio/aac`, `audio/ogg`. Tamanho máximo recomendado: 20 MB para PDF/imagem,
50 MB para áudio — ajustável, mas deve ser um valor explícito e documentado
(a confirmar com o Head conforme volume real de conteúdo).

---

## 4. Painel de administração (mínimo viável)

Aplicação web separada do app mobile, não publicada nas lojas — pode ser um
SPA simples hospedado no Firebase Hosting, atrás de login.

Telas mínimas:

1. **Login** — e-mail/senha via Firebase Auth, restrito a contas
   provisionadas manualmente pelo Head/admin técnico (sem cadastro
   público).
2. **Prática da Semana** — formulário com textarea do texto atual +
   timestamp da última edição + botão "Salvar".
3. **Conteúdo por subpágina** (Orações / Músicas / Textos) — três abas ou
   seletor de categoria, cada uma com:
   - Listagem dos itens existentes (título, tipo de arquivo, status
     publicado/rascunho, ordem), ordenável por drag-and-drop ou campo
     numérico `order`.
   - Botão "Novo item": formulário com título, descrição opcional, upload de
     arquivo (input de arquivo com preview — imagem mostra thumbnail, PDF
     mostra ícone + nome, áudio mostra player simples de pré-escuta),
     validação de tipo/tamanho no client antes de enviar.
   - Ação de editar (metadados, trocar arquivo) e remover (com confirmação).
4. **Notificações** (ligado à seção 5) — botão opcional "Enviar notificação"
   com campo de título/mensagem, para o admin disparar push manual (ex.
   avisando nova Prática da Semana).

Sem necessidade de papéis/permissões granulares no MVP (admin único ou poucos
admins com o mesmo nível de acesso), conforme já definido em
`UX-ARCHITECTURE.md`.

---

## 5. Notificações push — arquitetura ponta a ponta

Fluxo:

1. **Usuário ativa notificações no app** — uma opção nas configurações (tela
   simples a definir com `ux-architect`/`mobile-crossplatform`; hoje o MVP
   não tem tela de configurações, então esta feature exige uma nova
   superfície de UI mínima — sinalizar essa dependência ao Head/UX).
2. App solicita permissão nativa do SO (`UNUserNotificationCenter` no iOS,
   permissão de notificação no Android 13+) via SDK do Firebase Messaging.
3. Se concedida, o SDK gera um **device token FCM** único para aquela
   instalação do app.
4. App envia esse token para o backend: `POST /devices` com
   `{ token, platform: "ios" | "android" }`, salvo na coleção `devices`
   (Firestore), com `created_at`/`last_seen_at` para permitir limpeza de
   tokens inativos.
5. **Disparo de notificação** — dois gatilhos possíveis:
   - **Manual:** admin usa o botão no painel (seção 4.4), que chama uma
     Cloud Function `sendNotification` — busca tokens ativos na coleção
     `devices` e envia via Firebase Admin SDK (`admin.messaging()`), que
     encaminha para FCM → APNs (iOS) ou diretamente ao Android (FCM
     nativo).
   - **Automático (opcional, pós-MVP):** trigger no Firestore
     (`onUpdate` de `practice_of_the_week` ou `onCreate` de `items`) chama a
     mesma função de envio — a decidir com o Head se é desejado (evita
     spam; alinhar com voice & tone "nunca urgência artificial").
6. FCM entrega a notificação ao dispositivo (via APNs no iOS, nativamente no
   Android); app trata o toque na notificação com deep link (rotas já
   previstas em `UX-ARCHITECTURE.md`: `/`, `/mensageiros/oracoes`, etc.).
7. **Desativação:** usuário revoga permissão no app ou no SO; próxima
   tentativa de envio a um token inválido faz o FCM retornar erro
   `NotRegistered`/`InvalidRegistration` — a Cloud Function deve tratar essa
   resposta e remover o token da coleção `devices` (evita acúmulo de tokens
   mortos e falhas silenciosas).

Nada de dado pessoal sensível é coletado além do token de push (que não
identifica a pessoa diretamente); ainda assim, por envolver identificador de
dispositivo, este uso deve ser **consultado com `security-privacy`** antes de
implementação em produção, com decisão final registrada pelo Head em
`DECISIONS.md`, conforme a matriz DACI de "Uso de dado pessoal".

---

## 6. Segurança

### 6.1 Regras de acesso (Firestore Security Rules — esboço)

```
// firestore.rules (esboço, a validar por security-privacy antes de deploy)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /config/practice_of_the_week {
      allow read: if true;                 // leitura pública
      allow write: if request.auth != null
                   && request.auth.token.admin == true;
    }

    match /items/{itemId} {
      allow read: if resource.data.published == true;   // só itens publicados
      allow write: if request.auth != null
                   && request.auth.token.admin == true;
    }

    match /devices/{deviceId} {
      allow read: if false;                // nunca lido pelo cliente
      allow create, update: if true;       // registro de token (ver nota)
      allow delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Nota: a escrita pública em `devices` (registro de token) deve ser limitada
por Cloud Function (não Firestore direto) para permitir validação de
formato do token e rate limiting — ajustar antes de produção com
`security-privacy`.

### 6.2 Validação de upload

- **Tipo MIME:** validado tanto no client (input `accept`) quanto no
  servidor (Cloud Function trigger, ver 3.3) — nunca confiar apenas na
  extensão do arquivo ou no MIME reportado pelo client sem checagem
  server-side.
- **Tamanho máximo:** 20 MB (PDF/imagem) / 50 MB (áudio), configurável via
  variável de ambiente da Cloud Function — rejeitar e apagar arquivos que
  excedam o limite.
- **Nome de arquivo:** sanitizado (sem caracteres especiais/paths), renomeado
  para UUID no Storage para evitar colisão e enumeração.

### 6.3 Rate limiting básico

- Cloud Functions HTTPS: usar App Check (Firebase) para garantir que
  requisições ao painel admin/API vêm de clientes legítimos, mais
  `express-rate-limit` (ou equivalente) por IP nas funções expostas
  publicamente (ex. registro de device token), para mitigar abuso.
- Firestore Security Rules já limitam escrita a usuários admin autenticados,
  reduzindo superfície de abuso na maior parte das operações.

### 6.4 Autenticação de admin

- Firebase Authentication e-mail/senha, contas provisionadas manualmente
  (sem self-signup).
- Custom claim `admin: true` setada via Firebase Admin SDK por processo
  administrativo (script/console), nunca via client.
- Sessões seguem expiração padrão de ID token do Firebase (1h, renovado via
  refresh token do SDK) — sem necessidade de lógica própria de JWT.

### 6.5 Projetar para falha (padrão do time)

- App mobile: cache local da última Prática da Semana e das listas de itens
  (já recomendado em `UX-ARCHITECTURE.md`), com timeout de rede explícito e
  mensagens de erro no voice & tone definido.
- Cloud Functions: timeout configurado, retry idempotente para envio de
  push (tratar tokens inválidos sem falhar o lote inteiro), e log
  estruturado de erros (Cloud Logging) para diagnóstico.
- Nenhum ponto único de escrita sem tratamento de erro — toda mutação no
  painel admin deve mostrar estado de sucesso/erro claro (nunca "silencioso").

---

## 7. Preparação para deploy — checklist

Antes de produção (`devops-deploy`, estágio 06), confirmar que existe:

- [ ] Projeto Firebase criado (ambiente `production`, separado de
      `staging`/`dev` se houver).
- [ ] Variáveis de ambiente/segredos configurados via Firebase Functions
      config ou Secret Manager — **nunca commitados no repositório**
      (chaves de API do Firebase client-side são públicas por design, mas
      credenciais de Admin SDK e segredos de terceiros não são).
- [ ] Certificado/chave APNs configurada no console Firebase (Cloud
      Messaging → Apple app configuration) para push em iOS.
- [ ] `google-services.json` (Android) e `GoogleService-Info.plist` (iOS)
      gerados e integrados ao app pelo `mobile-crossplatform` — arquivos de
      configuração, não segredo de servidor, mas ainda assim tratados
      conforme política de distribuição do time.
- [ ] Firestore Security Rules revisadas e testadas (emulador) antes do
      deploy — gate de Integração exige "sem segredo no diff" e regras
      testadas.
- [ ] Firebase Storage Rules equivalentes às Firestore Rules (leitura
      pública de arquivo publicado, escrita só admin).
- [ ] HTTPS obrigatório — padrão em Firebase Hosting/Functions, confirmar
      que domínio customizado (se houver) tem certificado válido.
- [ ] Backups: exportação periódica do Firestore (`gcloud firestore
      export`) agendada (Cloud Scheduler + Function), destino em bucket
      separado com retenção definida.
- [ ] App Check habilitado nas Cloud Functions públicas antes do lançamento.
- [ ] Limite de orçamento (budget alert) configurado no projeto GCP/Firebase
      para evitar custo inesperado em caso de abuso.
- [ ] Painel admin publicado em domínio/URL não indexado publicamente
      (`noindex`), com HTTPS e autenticação obrigatória testada.
- [ ] Revisão final do pod de auditoria (`audit-code`, `security-privacy`)
      conforme gate de Auditoria — obrigatório antes deste checklist ser
      considerado "pronto para deploy".

---

## 8. Pendências para o Head / próximos passos

1. **Registrar a decisão de stack** (seção 1) em `DECISIONS.md` — feito
   junto a este documento.
2. **Confirmar a subpágina "Textos"** com `ux-architect`, já que
   `UX-ARCHITECTURE.md` hoje só documenta Orações e Músicas — este
   documento assume Textos por instrução direta do Head na tarefa de admin,
   mas o fluxo de UX/wireframe dessa tela ainda não existe.
3. **Consultar `security-privacy`** sobre o uso do device token de push
   (seção 5) antes de implementação em produção — decisão final é do Head
   conforme matriz DACI.
4. **Definir tela de configurações** no app para o toggle de notificações
   (não existe hoje no mapa de telas do MVP) — dependência para
   `ux-architect`/`ui-designer`/`mobile-crossplatform`.
5. Após aprovação da stack pelo Head, `backend-integration` implementa o
   projeto Firebase, Cloud Functions e Security Rules descritos aqui, e
   entrega para o gate de Integração (contrato testado, sem segredo no
   diff).
