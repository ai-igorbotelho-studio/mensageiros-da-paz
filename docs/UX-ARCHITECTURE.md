# Arquitetura de UX — Mensageiros da Paz (MVP)

Documento produzido pelo subagente `ux-architect`, estágio 01 (Descoberta &
Arquitetura) do pipeline descrito em `DIGITAL-PRODUCT-TEAM.md`. Parte do
requisito funcional já definido pelo Head/cliente para a Home (não é
hipótese) e do partido estético em `docs/CREATIVE-DIRECTION.md`. Este
documento é a base que `ui-designer` deve vestir com alta fidelidade e que
`mobile-crossplatform`/`backend-integration` devem implementar.

---

## 0. Requisito de partida (dado pelo Head, não negociável neste estágio)

- Home minimalista com apenas dois elementos: "Prática da Semana" (texto
  editável via admin/CMS) e um botão "MENSAGEIROS".
- "MENSAGEIROS" leva a uma segunda tela com dois botões: "ORAÇÕES" e
  "MÚSICAS".
- Conteúdo de Orações e Músicas **não foi detalhado** pelo Head — este
  documento trata o conteúdo dessas telas como **hipótese a validar**,
  seguindo o princípio da seção 4.7 de `CREATIVE-DIRECTION.md` ("nenhuma
  decisão de negócio foi validada ainda").

---

## 1. Mapa de telas do MVP

```
[Home]
  └── botão "MENSAGEIROS" ──> [Mensageiros (hub)]
                                  ├── botão "ORAÇÕES" ──> [Orações]
                                  └── botão "MÚSICAS" ──> [Músicas]
```

4 telas no total para o MVP: **Home**, **Mensageiros**, **Orações**,
**Músicas**. Nenhuma outra tela é necessária para atender ao requisito dado.
Onboarding, login, configurações, etc. ficam **fora de escopo do MVP**
até haver requisito explícito do Head — evita inflar a arquitetura além do
que foi pedido (alinhado ao princípio de minimalismo da direção criativa).

### 1.1 Home
- Objetivo: entregar a prática/reflexão da semana com zero fricção e
  oferecer um único caminho de aprofundamento (Mensageiros).
- Conteúdo: texto "Prática da Semana" (vindo de backend/CMS) + botão
  "MENSAGEIROS".

### 1.2 Mensageiros (hub)
- Objetivo: tela de escolha simples entre dois territórios de conteúdo.
- Conteúdo: dois botões — "ORAÇÕES" e "MÚSICAS". Nada além disso, mantendo o
  mesmo padrão minimalista da Home (consistência de padrão de UX entre
  telas-irmãs).

### 1.3 Orações (hipótese a validar com o Head)
Conteúdo provável, a confirmar antes de `ui-designer` aprofundar:
- Lista de orações (título + possivelmente categoria/tema), navegável por
  toque, levando a uma tela de leitura de texto completo da oração.
- Alternativa mais simples (se o volume de conteúdo for pequeno no MVP):
  uma única oração em destaque ("oração da semana"), sem lista.
- Não presumir áudio nem player nesta tela — orações são
  primariamente texto, salvo indicação contrária do Head.
- Estado vazio: "Nenhuma oração disponível no momento." (tom do voice &
  tone da direção criativa).

### 1.4 Músicas (hipótese a validar com o Head)
Conteúdo provável, a confirmar antes de `ui-designer` aprofundar:
- Lista de músicas (título + artista/autor), cada item abre um player de
  áudio simples (play/pause, barra de progresso) — ou linka para
  streaming externo (Spotify/YouTube), a decidir com `backend-integration`
  conforme disponibilidade de conteúdo/licenciamento.
- Requer clarificar com o Head: as músicas são hospedadas pelo próprio app
  (arquivo de áudio) ou são links para plataformas externas? Isso muda
  significativamente o esforço de backend e player nativo
  (`mobile-crossplatform`).
- Estado vazio: mesmo padrão de tom gentil da seção de Orações.

**Ação recomendada:** Head validar com o cliente o escopo real de
Orações/Músicas (quantidade de itens, se há áudio próprio, frequência de
atualização) antes do gate de Design ser fechado em alta fidelidade — hoje
essas duas telas seguem como hipótese de trabalho, não requisito confirmado.

---

## 2. Wireframe textual (estrutura, não visual)

### Home
```
[Tela: Home]
├─ Espaço de respiro superior (sem header pesado / sem logo grande)
├─ Rótulo pequeno: "Prática da semana" (label secundário, discreto)
├─ Texto principal: <conteúdo vindo do backend> (destaque tipográfico,
│   display serifado conforme direção criativa, 1 a poucas frases)
├─ Espaço de respiro
└─ Botão primário: "MENSAGEIROS" (CTA único da tela, cor de acento/primária)
```
Nada mais nesta tela: sem menu de navegação inferior, sem ícones extras, sem
notificações, sem avatar de usuário — ver seção 5 (princípios de
minimalismo).

### Mensageiros (hub)
```
[Tela: Mensageiros]
├─ Botão de voltar (topo, padrão nativo iOS/Android — back gesture/seta)
├─ Título discreto opcional: "Mensageiros" (se necessário para orientação;
│   avaliar se é redundante com o botão que trouxe o usuário aqui)
├─ Espaço de respiro
├─ Botão: "ORAÇÕES"
├─ Botão: "MÚSICAS"
└─ (dois botões de mesmo peso visual, empilhados verticalmente, área de
   toque mínima 44x44 conforme diretriz de a11y da direção criativa)
```

### Orações (hipótese)
```
[Tela: Orações]
├─ Botão de voltar (para Mensageiros)
├─ Título: "Orações"
├─ [Se lista] Lista de itens (título da oração, toque abre leitura)
│   └─ Estado vazio: mensagem gentil, sem ilustração pesada
└─ [Se destaque único] Texto da oração da semana, centralizado, legível
```

### Músicas (hipótese)
```
[Tela: Músicas]
├─ Botão de voltar (para Mensageiros)
├─ Título: "Músicas"
├─ Lista de itens (título + autor/artista, toque abre player ou link)
│   └─ Estado vazio: mensagem gentil
└─ [Se player interno] Mini player fixo ou tela de player dedicada
   (play/pause, progresso, título) — a definir com backend-integration
```

---

## 3. Fluxo de navegação

```
Home
  │
  │  (toque em "MENSAGEIROS")
  ▼
Mensageiros
  │                         │
  │ (toque "ORAÇÕES")       │ (toque "MÚSICAS")
  ▼                         ▼
Orações                   Músicas
  │                         │
  │ (voltar — gesto/seta)   │ (voltar — gesto/seta)
  ▼                         ▼
Mensageiros ◄───────────────┘
  │
  │ (voltar — gesto/seta)
  ▼
Home
```

Regras de navegação:
- Navegação estritamente hierárquica (árvore, sem atalhos cruzados entre
  Orações e Músicas — para ir de uma à outra, o usuário passa por
  Mensageiros). Isso é intencional: reforça o hub como ponto de escolha
  único e mantém cada tela mono-propósito (lei de Hick — menos opções
  visíveis por vez).
- "Voltar" usa os padrões nativos de cada SO (gesto de borda no iOS, botão
  de sistema/seta no Android) — consistente com o princípio 6 da direção
  criativa (preservar convenções nativas de navegação mesmo customizando
  visual).
- Não há bottom tab bar no MVP — a navegação é 100% linear/hierárquica,
  coerente com "silêncio visual é uma feature".
- Deep link opcional recomendado para pós-MVP: abrir diretamente em
  Orações ou Músicas a partir de notificação push (fora de escopo agora,
  mas a estrutura de rotas já nasce compatível: `/`, `/mensageiros`,
  `/mensageiros/oracoes`, `/mensageiros/musicas`).

---

## 4. Requisito de admin/CMS para "Prática da Semana"

Requisito explícito do Head: o texto da Prática da Semana **não pode ser
hardcoded no app** — precisa ser editável por um administrador sem novo
deploy. Implicações para `backend-integration`:

- **Endpoint mínimo de leitura (app → backend):**
  `GET /practice-of-the-week` retornando algo como
  `{ "text": "...", "updated_at": "..." }`. Simples, sem autenticação no
  lado de leitura (conteúdo público).
- **Painel admin simples (edição):** interface mínima (pode ser
  form/CRUD básico, não precisa de app dedicado) protegida por
  autenticação, permitindo a um administrador único ou poucos
  administradores editar o texto. Não precisa de versionamento nem
  histórico no MVP — apenas edição do valor atual.
- **Modelo de dados mínimo sugerido:** uma única entidade/registro
  "practice_of_the_week" com campo de texto e timestamp de atualização —
  não precisa ser "semanal" automatizado (sem agendamento) no MVP; a
  troca é manual, feita pelo admin quando desejar.
- **Estado de erro/loading no app:** a Home deve tratar loading e falha de
  rede ao buscar o texto, seguindo o voice & tone (ex.: "Não conseguimos
  carregar a prática desta semana. Tente novamente em instantes.") — nunca
  deixar a Home vazia/quebrada sem mensagem.
- **Cache local recomendado:** guardar a última "Prática da Semana"
  recebida em cache local (ex. storage do dispositivo) para exibir algo
  mesmo offline/com falha de rede, evitando tela em branco.
- Extensível no futuro: mesmo padrão de CMS simples pode servir para
  editar conteúdo de Orações/Músicas sem novo deploy, mas isso é decisão a
  confirmar com o Head — não presumir agora além da Prática da Semana.

---

## 5. Princípios de minimalismo aplicados — o que NÃO entra na Home

Alinhado ao princípio "silêncio visual é uma feature" da direção criativa:

- Sem bottom navigation bar / tab bar.
- Sem header com logo grande, sem avatar de usuário, sem ícone de
  notificações/sino.
- Sem cards adicionais, banners, carrossel, ou seções de "conteúdo
  relacionado".
- Sem contadores, badges, streaks ou qualquer elemento de gamificação
  (proibido também pelo voice & tone: "nunca gamificar a espiritualidade
  de forma superficial").
- Sem múltiplos CTAs — apenas um botão ("MENSAGEIROS"). Cada elemento
  extra precisa justificar sua presença contra o valor "paz" (regra 1 da
  direção criativa).
- Sem texto de boas-vindas genérico, sem data/hora, sem clima — a tela
  existe só para entregar a prática e o caminho para Mensageiros.
- Mesmo princípio se estende à tela Mensageiros: apenas os dois botões,
  sem descrição longa de cada opção (o rótulo do botão já comunica o
  destino).

---

## 6. Próximos passos recomendados

1. **Head** — validar com o cliente o escopo de conteúdo de Orações e
   Músicas (seções 1.3 e 1.4 são hipótese) antes de travar o gate de
   Design em alta fidelidade; confirmar também se músicas usam áudio
   próprio ou link externo.
2. **`ui-designer`** — traduzir os wireframes textuais (seção 2) em
   protótipo navegável de alta fidelidade usando os tokens de
   `docs/CREATIVE-DIRECTION.md` (paleta, tipografia, espaçamento
   generoso), incluindo estados vazio/erro/loading da Home e das listas de
   Orações/Músicas.
3. **`backend-integration`** — implementar `GET /practice-of-the-week` e
   painel admin simples de edição (seção 4), com contrato testado
   (OpenAPI) antes do gate de Integração.
4. **`mobile-crossplatform`** — implementar as 4 telas e o fluxo de
   navegação hierárquico (seção 3), tratando estados de rede da Home
   conforme seção 4, respeitando convenções nativas de back gesture/seta.
5. **`motion-designer`** — aplicar transições suaves entre as 4 telas
   (fade/slide orgânico), nunca abruptas, conforme seção 3 da direção
   criativa.
6. **`content-seo`** — revisar/formalizar a microcopy exata de "Prática da
   Semana", rótulos dos botões e mensagens de estado vazio/erro, seguindo
   o voice & tone.

---

## 7. Nota sobre padrão de UX (matriz DACI)

Conforme `DIGITAL-PRODUCT-TEAM.md`, "Padrão de UX" tem `ux-architect` como
Driver e o Head como Decisor final. Este documento é a **recomendação**: um
fluxo hierárquico raso (3 níveis), sem navegação por abas, minimalista ao
extremo, alinhado ao requisito literal dado pelo Head. Qualquer expansão
futura (mais seções na Home, tab bar, etc.) deve passar por nova decisão
registrada em `DECISIONS.md`.
