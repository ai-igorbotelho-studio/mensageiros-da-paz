# Arquitetura de Backend — Mensageiros da Paz

Documento produzido pelo subagente `backend-integration`, estágio 04
(Integração & Dados) do pipeline em `DIGITAL-PRODUCT-TEAM.md`. Cobre a stack
recomendada, modelo de dados, contrato de API, administração de conteúdo,
notificações push, segurança e checklist de deploy. Base para
`mobile-crossplatform` (consumo do app) e `devops-deploy` (estágio 06).

> **Revisão 2026-09-18 — escopo restrito a uso pessoal/grupo fechado.**
> Conforme decisão do Head em `DECISIONS.md` (entrada de 2026-09-18, "Restrição
> de escopo"), este app é para uso do Head e de pessoas cadastradas
> manualmente por ele — não é um produto público em escala, sem custo de
> servidor, publicação pública nas lojas ou manutenção contínua obrigatória.
> Isso simplifica partes desta arquitetura originalmente desenhadas para um
> produto público (ver `docs/DEPLOY-READINESS-AUDIT.md`). As seções 4, 5 e 6
> foram revisadas para refletir isso; o restante do documento (modelo de
> dados, contrato de leitura) permanece válido sem alteração.

Escopo de conteúdo: conforme `docs/UX-ARCHITECTURE.md`, o app tem Home
("Prática da Semana") → Mensageiros → **Orações** / **Músicas** / **Leituras**
(hub interno com **Textos** e **Livros**), quatro categorias de conteúdo no
total: `oracoes`, `musicas`, `textos`, `livros`. A estrutura "Leituras" (antes
só "Textos") e a categoria `livros` foram adicionadas em 2026-09-19 por
pedido direto do Head — `ux-architect` ainda precisa formalizar o wireframe
correspondente em `UX-ARCHITECTURE.md` (pendência já sinalizada ali).

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

> **Revisão 2026-09-19 — conteúdo misto em Músicas.** Conforme decisão do
> Head em `DECISIONS.md` ("Músicas: conteúdo misto — upload próprio +
> Spotify"), um item pode ser um **arquivo próprio** (upload no Firebase
> Storage, tocado pelo player nativo do app) ou um **link do Spotify**
> (abre no app/site do Spotify, sem player embutido). O campo `source`
> discrimina os dois casos; campos de arquivo e campos de Spotify são
> mutuamente exclusivos.

```
items/{itemId}
{
  "title": string,                 // obrigatório
  "description": string | null,    // opcional, texto curto de apoio (ex. "Artista · Ano")
  "category": "oracoes" | "musicas" | "textos" | "livros",  // obrigatório
  "source": "upload" | "spotify",  // obrigatório — discrimina os campos abaixo

  // presentes somente quando source == "upload":
  "file_url": string | null,        // URL do arquivo no Firebase Storage
  "file_type": "pdf" | "image" | "audio" | null,  // derivado do MIME no upload
  "mime_type": string | null,       // ex. "application/pdf", "audio/mpeg"
  "file_size_bytes": number | null,

  // presente somente quando source == "spotify":
  "spotify_url": string | null,     // ex. "https://open.spotify.com/track/{id}"

  "order": number,                  // define ordem de exibição dentro da categoria
  "created_at": timestamp,
  "updated_at": timestamp,
  "created_by": string,             // uid do admin
  "published": boolean              // permite admin salvar rascunho sem publicar
}
```

`source == "spotify"` é hoje só aplicável a `category == "musicas"` (não há
caso de uso para Orações/Textos apontarem a uma faixa do Spotify) — a
Security Rule (seção 6.1) não impõe essa restrição automaticamente, é uma
convenção que o Head deve seguir ao cadastrar. `mobile-crossplatform` deve
renderizar o item de forma diferente conforme `source`: item `upload` abre
o player nativo (como já implementado); item `spotify` abre o link externo
(`Linking.openURL(spotify_url)`) — abrir o app do Spotify se instalado, ou
o navegador/`open.spotify.com` como fallback, sem tentar embutir um player
Spotify dentro do app (exigiria SDK/autenticação OAuth do Spotify, fora do
escopo atual).

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
          schema: { type: string, enum: [oracoes, musicas, textos, livros] }
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
        category: { type: string, enum: [oracoes, musicas, textos, livros] }
        file_url: { type: string, format: uri }
        file_type: { type: string, enum: [pdf, image, audio] }
        order: { type: integer }
        created_at: { type: string, format: date-time }
```

### 3.2 Escrita — administração de conteúdo (revisado)

**Não há mais rotas de Cloud Function HTTPS para CRUD de admin.** Conforme a
seção 4, a edição de `practice_of_the_week` e o CRUD de `items` (incluindo
upload de arquivo) são feitos diretamente pelo Head no Firebase Console,
protegidos pelas Firestore/Storage Security Rules (`request.auth.token.admin
== true`, seção 6.1) — sem necessidade de construir/manter endpoints HTTPS
próprios para isso. A tabela de rotas REST anteriormente documentada aqui
foi removida; ela só voltaria a fazer sentido se um painel de admin web
dedicado for construído no futuro (não é o caso no escopo atual).

### 3.3 Upload de arquivo (revisado — sem Cloud Function de validação)

Upload é feito manualmente pelo Head via Firebase Console → Storage (guia
passo a passo na seção 4.1) — não há mais um fluxo automatizado de duas
etapas com Cloud Function `onFinalize` validando o arquivo, porque não há
mais uma interface de upload de terceiros/não confiável a validar (o único
operador é o próprio Head, com acesso admin). A validação de tipo/tamanho
passa a ser responsabilidade do próprio Head ao escolher o arquivo (a
Security Rule do Storage, seção 6.2, ainda garante que só uma conta admin
autenticada pode escrever, mesmo que o console não valide o conteúdo do
arquivo). Se no futuro terceiros (não o Head) puderem fazer upload, reintroduzir
a validação server-side via Cloud Function.

Tipos aceitos (orientação para o Head ao escolher o arquivo, não mais
imposição automática de servidor): `application/pdf`, `image/jpeg`,
`image/png`, `audio/mpeg` (mp3), `audio/mp4`/`audio/x-m4a` (m4a),
`audio/wav`, `audio/aac`, `audio/ogg`. Tamanho recomendado: até 20 MB para
PDF/imagem, até 50 MB para áudio (o free tier do Storage tem 5 GB de
armazenamento total — evitar arquivos desnecessariamente grandes).

---

## 4. Administração de conteúdo (revisado — sem painel web dedicado)

**Decisão para o escopo fechado atual: não construir nem manter um painel de
admin web separado.** Para um único administrador de conteúdo (o Head)
editando ocasionalmente 1 texto e uma lista pequena de itens, o **próprio
Firebase Console** (gratuito, já incluso em qualquer projeto Firebase) cobre
100% da necessidade: editor de documentos Firestore com formulário de campos,
e upload de arquivo com clique-arrastar no Storage. Construir um SPA React
seria esforço de desenvolvimento e manutenção contínua (dependências,
hospedagem, autenticação própria) sem ganho real para um usuário só editando
esporadicamente. Se no futuro houver múltiplos administradores editando
frequentemente, reavaliar um painel dedicado — não é o caso hoje.

### 4.1 Guia rápido — como o Head edita pelo Firebase Console

**Editar a Prática da Semana:**
1. Acessar https://console.firebase.google.com → projeto do app → **Firestore
   Database**.
2. Abrir a coleção `config` → documento `practice_of_the_week`.
3. Editar o campo `text` diretamente na interface (clique no valor → editar).
4. Atualizar manualmente `updated_at` (usar o seletor de timestamp do
   console, "definir para agora") e `updated_by` (o e-mail/uid do Head).
5. Salvar — a mudança fica disponível para o app imediatamente (leitura
   pública direta do Firestore, sem cache de servidor).

**Adicionar um novo item com arquivo próprio (Orações/Músicas/Textos):**
1. Firebase Console → **Storage** → navegar/criar a pasta
   `items/{category}/` (ex. `items/oracoes/`) → **Fazer upload de arquivo**,
   selecionar o PDF/imagem/áudio.
2. Após o upload, clicar no arquivo → copiar o **URL de download** exibido no
   console (ou gerar um "Get download URL" pela própria tela de detalhes do
   arquivo).
3. Firebase Console → **Firestore Database** → coleção `items` → **Adicionar
   documento** (ID automático ou definido manualmente).
4. Preencher os campos conforme o modelo da seção 2.2: `title`, `description`
   (opcional), `category` (`oracoes`/`musicas`/`textos`/`livros`), `source: "upload"`,
   `file_url` (colado do passo 2), `file_type`, `mime_type`,
   `file_size_bytes` (visível na tela de detalhes do arquivo no Storage),
   `order` (número para posição na lista), `created_at`/`updated_at`
   (definir para agora), `created_by` (uid do Head), `published: true`.
5. Salvar — o item aparece no app na próxima leitura da lista.

**Adicionar uma música do Spotify (só `category: "musicas"`):**
1. No Spotify, copiar o link da faixa (Compartilhar → Copiar link da
   música), formato `https://open.spotify.com/track/{id}`.
2. Firebase Console → **Firestore Database** → coleção `items` → **Adicionar
   documento**.
3. Preencher: `title`, `description` (ex. "Artista · Ano"),
   `category: "musicas"`, `source: "spotify"`, `spotify_url` (link copiado
   no passo 1), `file_url`/`file_type`/`mime_type`/`file_size_bytes: null`,
   `order`, `created_at`/`updated_at`, `created_by`, `published: true`.
4. Salvar — não há upload de arquivo nem Storage envolvido nesse caso; o
   app abre o link externo do Spotify ao tocar no item.

**Editar ou remover um item:** mesma tela do Firestore — editar campos
diretamente, ou apagar o documento (e, separadamente, apagar o arquivo
correspondente no Storage para não deixar órfão).

### 4.2 Custo desta abordagem

Uso do Firebase Console em si é sempre gratuito. O volume de leitura/escrita/
armazenamento gerado por um administrador único editando ocasionalmente fica
muito abaixo dos limites do **plano Spark (free tier)**: Firestore (1 GiB de
armazenamento, 50 mil leituras/dia, 20 mil escritas/dia) e Storage (5 GB,
1 GB/dia de download) — ver seção 6.6 para o detalhamento de custo completo
do projeto.

### 4.3 Trade-off sacrificado

Perde-se: validação de formato de dado no momento da digitação (o console não
impede um `category` com valor errado, por exemplo — só a Security Rule
de leitura filtra por categorias válidas do lado do app), preview de mídia
antes de publicar, e uma UI mais amigável para quem não está confortável
navegando o console técnico do Firebase. Aceitável porque o único operador é
o Head, tecnicamente capaz de seguir o guia acima, e o volume de edição é
baixo (esporádico, não um fluxo de trabalho diário de múltiplas pessoas).

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
5. **Disparo de notificação — única Cloud Function realmente necessária no
   escopo atual.** Enviar push via Firebase Admin SDK (`admin.messaging()`)
   precisa rodar em ambiente de servidor (não é possível fazer isso
   diretamente do client por segurança do Firebase — a credencial de Admin
   SDK nunca deve estar no app/console do navegador). Por isso, ao contrário
   do painel de admin (seção 4) e do CRUD de conteúdo (que o console resolve
   sem código), o disparo de notificação exige uma Cloud Function `sendPush`:
   busca tokens ativos na coleção `devices` e envia via
   `admin.messaging().sendEachForMulticast(...)`, encaminhando para FCM →
   APNs (iOS) ou diretamente ao Android. É a **única** função necessária
   neste escopo — não há mais necessidade de Cloud Functions para CRUD de
   admin, validação de upload ou App Check/rate limiting (ver seção 6).
   - **Como o Head dispara manualmente:** Firebase Console → **Functions** →
     selecionar `sendPush` → aba **Testar função** (ou "Testing") → informar
     o payload JSON de teste (ex. `{ "title": "Nova Prática da Semana",
     "body": "Confira a atualização desta semana" }`) → **Testar**. Não é
     necessário nenhuma UI própria; o próprio console do Firebase serve como
     "botão de disparo". Alternativa igualmente simples: um script Node curto
     rodado localmente pelo Head (`node scripts/send-push.js`) usando o
     Admin SDK autenticado com uma chave de serviço guardada fora do
     repositório.
   - **Automático (opcional, futuro, não necessário hoje):** trigger no
     Firestore (`onUpdate` de `practice_of_the_week` ou `onCreate` de
     `items`) chamando a mesma função de envio — descartado por ora: para um
     grupo fechado pequeno, o disparo manual é suficiente e evita
     complexidade adicional; reavaliar se o volume de atualizações crescer.
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

### 6.1 Regras de acesso (Firestore Security Rules — revisado)

**Mudança em relação à versão anterior:** a auditoria de deploy
(`docs/DEPLOY-READINESS-AUDIT.md`) reprovou a regra original de `devices`
(`allow create, update: if true`) por permitir escrita pública sem nenhuma
validação — qualquer pessoa com a config pública do Firebase (que é sempre
pública por design em apps client-side) poderia inundar a coleção com
documentos arbitrários. Mesmo em escopo fechado essa brecha continua real e é
barata de fechar, então **não foi reintroduzida**. A correção escolhida é a
mais simples possível que ainda resolve o problema: **autenticação anônima do
Firebase** (`signInAnonymously()`, chamada automaticamente pelo app ao abrir,
sem exigir login/senha do usuário) antes de qualquer escrita em `devices`.
Isso troca uma Cloud Function completa com rate limiting/App Check por uma
troca de uma linha na regra — `if true` vira `if request.auth != null`.

```
// firestore.rules (revisado — validar no emulador antes de deploy)
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
      allow create, update: if request.auth != null
                   && request.resource.data.keys().hasOnly(['token', 'platform', 'created_at', 'last_seen_at'])
                   && request.resource.data.platform in ['ios', 'android'];
      allow delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

**O que o app precisa mudar:** ao inicializar, chamar
`firebase.auth().signInAnonymously()` antes de tentar escrever em `devices`.
Isso é gratuito e não pede nenhuma informação do usuário — apenas gera um
`uid` anônimo que a regra usa para exigir `request.auth != null`.

**Avaliação de suficiência / trade-off:** isso fecha a brecha de escrita
totalmente pública (bots/scripts genéricos não autenticados não conseguem
mais escrever), e a validação de `keys().hasOnly(...)` e `platform in
[...]` bloqueia payloads malformados — cobrindo a maior parte do risco
prático para um grupo fechado pequeno. O que **não** cobre, e é aceito como
trade-off consciente neste escopo: um usuário autenticado anonimamente ainda
pode, em teoria, escrever repetidamente (não há rate limiting por uid/IP) —
mitigação completa disso exigiria a Cloud Function com rate limiting que a
auditoria original propôs. Para uso pessoal/grupo fechado (superfície de
ataque pequena, sem divulgação pública do app), esse risco residual é
considerado aceitável; se o app crescer para distribuição mais ampla,
reintroduzir rate limiting server-side antes disso.

### 6.1.1 App Check — não necessário no escopo atual

A versão anterior deste documento recomendava App Check nas Cloud Functions
públicas (seção antiga 6.3). Com a redução a uma única Cloud Function
disparada manualmente pelo próprio Head via console (seção 5), e sem mais
nenhuma função HTTPS pública exposta a clientes não confiáveis, App Check
deixa de ser necessário — não há mais uma função pública recebendo tráfego
de app/admin desconhecido para proteger. Reavaliar se uma função pública for
reintroduzida no futuro.

### 6.2 Validação de upload (revisado)

Sem Cloud Function de validação automática (ver 3.3) — a única pessoa capaz
de fazer upload é o Head, autenticado como admin via Storage Security Rules
(equivalentes às do Firestore: leitura pública de arquivo de item publicado,
escrita restrita a `request.auth.token.admin == true`). Boas práticas que
continuam recomendadas, agora como checklist manual do próprio Head ao
publicar (não mais imposição automática de servidor):
- Preferir os tipos MIME já listados na seção 3.3.
- Evitar arquivos muito acima de 20 MB (PDF/imagem) / 50 MB (áudio) para não
  aproximar do limite do free tier de Storage (seção 6.6).
- Não é necessário sanitizar nome de arquivo manualmente — o Storage aceita
  qualquer nome, mas usar nomes simples (sem acentos/espaços) evita
  problemas de URL.

### 6.3 Rate limiting — reavaliado como desnecessário no escopo atual

A recomendação anterior de App Check + `express-rate-limit` nas Cloud
Functions públicas foi desenhada para um produto público em escala, com
volume de tráfego desconhecido e superfície de ataque grande. Neste escopo:
- Não há mais Cloud Functions HTTPS públicas de CRUD (seção 3.2) — o único
  ponto de escrita programática de terceiro é `devices`, agora protegido por
  autenticação anônima obrigatória (seção 6.1), o que já eleva o custo de
  abuso trivial (spam anônimo em massa) sem exigir infraestrutura extra.
- A única Cloud Function que resta (`sendPush`, seção 5) é disparada
  manualmente pelo próprio Head via console — não está exposta como endpoint
  público que precise de rate limiting.
- Rate limiting por uid/IP em `devices` fica como item de mitigação futura
  (não implementado agora, ver trade-off na seção 6.1) — reavaliar se o
  grupo fechado crescer significativamente ou se houver evidência de abuso.

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
- Nenhum ponto único de escrita sem tratamento de erro — toda mutação
  (edição direta no console, ou envio de push) deve deixar um estado
  verificável (o próprio console mostra sucesso/erro da escrita; logs de
  execução da Cloud Function `sendPush` ficam no Cloud Logging).

### 6.6 Custo esperado (honesto, revisado para o escopo fechado)

- **Firestore, Storage, Auth (inclusive anônima), Cloud Messaging:** cobertos
  integralmente pelo **plano Spark (free tier)** do Firebase para o volume de
  uso esperado (um administrador, um grupo fechado pequeno de leitores,
  poucos itens de conteúdo, uploads esporádicos). Não é necessário cartão de
  crédito nem upgrade de plano só para essas peças.
- **Cloud Functions — exceção honesta:** Cloud Functions (2ª geração, a
  versão atual do produto) **exige o plano Blaze (pay-as-you-go)**, o que
  tecnicamente exige cadastrar um cartão de crédito no projeto GCP, mesmo
  que o uso real fique dentro da faixa gratuita mensal do Blaze (que inclui
  as mesmas cotas gratuitas do Spark, mais capacidade de faturar acima
  delas). Para a única função deste escopo (`sendPush`, disparada
  manualmente e raramente — da ordem de algumas vezes por semana ou menos),
  o consumo fica muito abaixo da cota gratuita de invocações/computação do
  Blaze na prática. **Custo mensal realista esperado: menos de US$1/mês**,
  provavelmente US$0,00 na maioria dos meses — mas o Head deve estar ciente
  de que a conta de faturamento fica ativa (cartão cadastrado) mesmo que a
  fatura chegue a zero, e é recomendável configurar um alerta de orçamento
  baixo (ex. US$1) no console GCP para ser avisado de qualquer anomalia.
- **Hosting:** não é necessário neste escopo (sem painel web separado, seção
  4), mas se for usado no futuro (ex. hospedar uma página estática qualquer),
  também está coberto pelo free tier do Spark para volume baixo.

---

## 7. Preparação para deploy — checklist (revisado para escopo fechado)

Antes de disponibilizar o app ao grupo fechado (`devops-deploy`, estágio 06),
confirmar que existe:

- [ ] Projeto Firebase criado (um único ambiente é suficiente para este
      escopo — separar `staging`/`dev` é opcional, não obrigatório, dado o
      volume baixo e o único operador).
- [ ] Chave de serviço do Admin SDK (usada só se o Head optar pelo script
      local de disparo de push, seção 5) **nunca commitada no repositório**
      — guardada fora do controle de versão (ex. variável de ambiente local
      ou gerenciador de segredos pessoal). Chaves de API do Firebase
      client-side no app são públicas por design e não precisam desse
      cuidado.
- [ ] Certificado/chave APNs configurada no console Firebase (Cloud
      Messaging → Apple app configuration) para push em iOS.
- [ ] `google-services.json` (Android) e `GoogleService-Info.plist` (iOS)
      gerados e integrados ao app pelo `mobile-crossplatform`.
- [ ] Firestore Security Rules revisadas e testadas (emulador) — incluindo a
      regra de `devices` com autenticação anônima obrigatória (seção 6.1).
- [ ] Firebase Storage Rules equivalentes às Firestore Rules (leitura
      pública de arquivo publicado, escrita só admin).
- [ ] App inicializa `signInAnonymously()` antes de registrar o device token
      (seção 6.1) — confirmar com `mobile-crossplatform`.
- [ ] Limite de orçamento (budget alert) configurado no projeto GCP/Firebase
      (ex. US$1) — mitigação simples para a exceção de custo da seção 6.6.
- [ ] Lista de pessoas com acesso ao app (distribuição fechada — TestFlight
      interno / Google Play testes internos / APK direto, conforme
      `devops-deploy`) mantida e atualizada manualmente pelo Head.
- [ ] Revisão final do pod de auditoria (`audit-code`, `security-privacy`)
      conforme gate de Auditoria — obrigatório antes deste checklist ser
      considerado "pronto para uso pelo grupo".

Itens removidos desta versão do checklist por não se aplicarem ao escopo
fechado atual: App Check em Cloud Functions públicas (não há mais nenhuma,
seção 6.1.1), backup agendado via Cloud Scheduler (volume de dados pequeno
e recriável manualmente pelo Head — exportação manual ocasional do Firestore
é suficiente), painel admin publicado com `noindex` (não existe mais painel
web, seção 4).

---

## 8. Pendências para o Head / próximos passos (revisado — escopo fechado)

1. **Decisão de stack já registrada** (seção 1) em `DECISIONS.md`, assim como
   a restrição de escopo de 2026-09-18 que motivou esta revisão.
2. **Confirmar a subpágina "Textos"** com `ux-architect`, já que
   `UX-ARCHITECTURE.md` hoje só documenta Orações e Músicas — este
   documento assume Textos por instrução direta do Head na tarefa de admin,
   mas o fluxo de UX/wireframe dessa tela ainda não existe.
3. **Uso do device token de push já avaliado** por `security-privacy`
   (`docs/PRIVACY-REVIEW.md`) e aprovado com ressalvas pelo Head em
   `DECISIONS.md` — os ajustes obrigatórios daquela decisão (rota de
   exclusão de token, limpeza de tokens obsoletos, validação server-side do
   payload) continuam válidos; a validação server-side agora é resolvida de
   forma simplificada pela autenticação anônima + regra restrita (seção
   6.1), em vez de Cloud Function completa.
4. **Definir tela de configurações** no app para o toggle de notificações
   (não existe hoje no mapa de telas do MVP) — dependência para
   `ux-architect`/`ui-designer`/`mobile-crossplatform`.
5. **Implementação simplificada:** `backend-integration` cria o projeto
   Firebase, configura Firestore/Storage Security Rules (seção 6.1) e a
   única Cloud Function `sendPush` (seção 5) — sem painel de admin web, sem
   CRUD via Cloud Function, sem App Check/rate limiting dedicado. Entrega
   para o gate de Integração (regras testadas no emulador, sem segredo no
   diff).
6. **Head assume o papel de operador de conteúdo** via Firebase Console
   (guia na seção 4.1) — não há dependência de `frontend-multistack` para
   construir/manter uma interface de admin neste escopo.
7. **Orçamento:** configurar alerta de orçamento baixo (seção 6.6) ao
   habilitar o plano Blaze necessário para a Cloud Function `sendPush`.
