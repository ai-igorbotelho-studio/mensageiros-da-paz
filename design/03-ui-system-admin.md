# Sistema de UI — Painel Admin (`/admin`)

Documento do subagente `ui-designer`, estágio de Design de Alta Fidelidade.
Construído sobre `design/00-experience-vision.md` (conceito "mesa de
trabalho sacristã"), `design/01-creative-direction-admin.md` (partido
estético + voice&tone) e `design/02-ux-architecture-admin.md` (fluxo,
hierarquia de ação, estrutura responsiva). Fonte de tokens: exclusivamente
`app/src/theme/tokens.ts` + `ADMIN_BG`/`ADMIN_SURFACE` já em
`AdminScreen.tsx`. Nenhuma cor, fonte, raio ou tamanho novo é introduzido
aqui — este documento **especifica a aplicação em alta fidelidade**, não
uma nova linguagem visual.

As 4 decisões do Head (sidebar em desktop, 2 painéis, "Novo item" no topo,
undo temporário) estão tratadas como definitivas e não são reabertas.

---

## 0. Tokens herdados (referência rápida, não redefinidos)

```
colors.primary       #803C7A  Mulberry
colors.primaryLight  #AF65A8  Magenta
colors.accent/success #3BCFA9 Sage
colors.danger         #B3261E
colors.textPrimary    #00170C Deep mint
colors.textSecondary  #6B4463
colors.surface        #FFF6EF
colors.background     #FFEDDF  (Pale apricot — NUNCA usado no admin)
ADMIN_BG              #EFE8DD  (greige — fundo de tela do admin)
ADMIN_SURFACE         #FBF7F1  (superfície de card/painel do admin)
colors.inverseMuted   #E7C9E3

fonts.display   Lora     (títulos de seção)
fonts.body      Lexend   (todo o resto)

spacing   xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48
radii     sm 8 · md 16 · lg 24 · pill 999
minTouchSize 44 · minFontSize 17
```

---

## 1. Escala tipográfica do admin

Duas famílias apenas (Lora para display, Lexend para tudo mais), conforme
`01-creative-direction-admin.md §4.1`. Corpo nunca abaixo de 17px — os
tamanhos abaixo de 17 hoje existentes no código (`13`, `14`, `15`, `16`)
são o principal risco de auditoria identificado nesta especificação (ver
§6 "Riscos para o gate").

| Nível | Fonte | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|---|
| **Display** | Lora | 24px | 400 (regular) | 30px | Título da tela ("Painel administrativo"), `styles.title`. Único uso de Lora no admin — reservado a título de topo, nunca em corpo de card. |
| **Título de seção** | Lexend | 17px | 700 | 22px | `sectionTitle` ("Categorias", "Itens"), cabeçalho de grupo do overview. Hoje 16px — subir para 17 (ver §6). |
| **Rótulo de grupo/etiqueta** | Lexend | 13px, uppercase, letter-spacing 0.4 | 700 | 16px | `formGroupTitle` ("IDENTIFICAÇÃO", "CONTEÚDO"). Exceção deliberada abaixo de 17px: é rótulo de agrupamento visual (como um "olho" de seção), não texto de leitura/instrução — mantém-se pequeno e maiúsculo por convenção editorial (Sanity Studio), nunca carrega informação que não esteja repetida em outro lugar legível ≥17px. |
| **Corpo / label de campo / botão** | Lexend | 17px | 400 (texto) / 600 (label, botão) | 24px | Texto de input, rótulo de campo ("Título", "Categoria"), texto de botão primário/secundário/destrutivo, item de lista, linhas de accordion. Piso mínimo do admin — todo texto operacional (o que o admin lê para decidir uma ação) vive aqui. |
| **Corpo denso (tabela/lista compacta)** | Lexend | 17px | 400 | 22px | Linhas do overview (`overviewItemTitle`), itens de lista com muitas linhas simultâneas — densidade se resolve com `line-height` mais justo e `spacing.xs/sm` entre linhas, nunca reduzindo `font-size` abaixo de 17. Substitui o `13.5px` atual (ver §6). |
| **Hint / meta / auxiliar** | Lexend | 17px, cor `textSecondary` | 400, itálico opcional para hint de campo | 22px | `fieldHint`, `itemMeta`, texto de ajuda ("Isso vai apagar N itens..."). Antes 12-14px — sobe para 17 (ver §6). Diferenciação de hierarquia vem de **cor** (`textSecondary`) e peso, não de tamanho reduzido — é a técnica recomendada por `02-ux-architecture-admin.md §2.4(3)` para agrupar hints condicionais sem criar uma terceira escala. |
| **Micro-rótulo (badge/etiqueta de estado)** | Lexend | 13px, uppercase | 700 | 16px | `statusBadgeText` ("Publicado"/"Rascunho"), `adminBannerText`. Segunda exceção deliberada abaixo de 17: é rótulo de estado dentro de uma pílula com contexto redundante ao lado (ícone de cor + posição), nunca a única fonte de informação da tela. |

**Regra geral:** qualquer texto que o admin precisa *ler para decidir* (rótulo
de campo, conteúdo de item, mensagem de erro/confirmação, texto de botão)
fica em 17px Lexend. Só rótulo de agrupamento (`formGroupTitle`) e badge de
estado (`statusBadgeText`) ficam abaixo — ambos com informação redundante
em outro elemento ≥17px na mesma tela, nunca a única leitura possível.

---

## 2. Espaçamento e grid responsivo

### 2.1 Aplicação de `spacing`

| Token | Valor | Uso no admin |
|---|---|---|
| `xs` (4) | Espaço interno mínimo — entre ícone e texto num badge, gap de `categoryRow`. |
| `sm` (8) | Espaço entre linhas relacionadas dentro de um bloco (label→input, item→item dentro de accordion), padding vertical de chip/botão pequeno. |
| `md` (16) | Padding padrão de card (`libraryCard`, `accordionHeader`), gap entre blocos de formulário próximos, margem lateral de tela em mobile. |
| `lg` (24) | Espaço entre seções distintas de uma tela (fim de um formGroup até o início do próximo), padding de `screen`, gutter entre painel A e painel B em desktop. |
| `xl` (32) | Espaço antes de `sectionTitle` (separação clara de bloco temático). |
| `xxl` (48) | Espaço de respiro no fim de scroll (`scrollContent` padding-bottom), separação entre cabeçalho global e navegação. |

Regra: nenhum espaçamento novo fora da escala — inclusive nos novos
elementos desta especificação (sidebar, painel B, toast de undo).

### 2.2 Breakpoints e comportamento de grid

```
320px ─────── 768px ─────── 960px ─────── 1280px ─────── 1920px
 mobile         tablet          desktop          desktop        desktop
 1 coluna       1 coluna        2 painéis        2 painéis      2 painéis
 tabs topo      tabs topo       + sidebar        + sidebar      + sidebar
                                lateral          lateral        lateral
                                                  (mais respiro  (mais respiro
                                                  no painel B,   no painel B,
                                                  não mais       não mais
                                                  largura de     largura de
                                                  leitura)       leitura)
```

- **320-767px (mobile):** coluna única, `padding-horizontal: spacing.lg`
  (24px), segmented control em pílula no topo (`tabRow`), formulário abre
  inline abaixo do ponto de origem (accordion do item ou bloco "Novo item"
  no topo da lista — decisão 3).
- **768-959px (tablet estreito):** mesma estrutura de mobile — apenas
  `padding-horizontal` pode subir para `spacing.xl` (32px) se sobrar
  espaço; sem 2 painéis ainda (largura insuficiente para 38%/62% com
  largura de leitura mínima confortável).
- **≥960px (desktop):** ativa sidebar lateral (decisão 1) + layout de 2
  painéis (decisão 2):
  - **Sidebar:** largura fixa 220-260px, fundo `ADMIN_SURFACE`, itens
    empilhados verticalmente (Prática da Semana / Biblioteca / Guia do
    Admin), `padding: spacing.md`, altura total = altura da viewport
    abaixo do cabeçalho.
  - **Painel A (lista/overview):** ~38% da largura restante (após
    sidebar), mínimo absoluto 320px, scroll próprio (`overflow-y: auto`,
    independente do painel B), botão "Novo item" ancorado no topo
    (decisão 3, `position: sticky` dentro do painel A).
  - **Painel B (editor/detalhe):** ~62% da largura restante, conteúdo
    interno com `max-width: 720px` centralizado ou alinhado à esquerda
    (não esticar input até a borda do painel), scroll próprio.
  - Gutter entre sidebar/painel A/painel B: `spacing.lg` (24px).
- **≥1280px:** painel B ganha mais respiro lateral (padding extra até o
  `max-width` de 720px ser atingido), painel A pode crescer até um teto de
  ~420px absolutos em vez de continuar em % (evita lista virar
  desproporcionalmente larga em monitores grandes).
- **≥1920px:** container geral do admin trava em `max-width: 1600px`,
  centralizado — nunca deixa sidebar+painéis esticarem até a borda de
  monitor ultrawide.

### 2.3 Overview em grid 2 colunas (desktop ≥960px)

Confirma a recomendação de `02-ux-architecture-admin.md §4` com salvaguarda
explícita contra "virar dashboard de BI" (`§5.5`): cada bloco de categoria
no grid 2x2 mantém o `overviewGroupHeader` sólido + lista de itens dentro
(acionável, com chevron/expand), nunca um número solto ou card decorativo
sem lista. Gap entre blocos: `spacing.md`. Em mobile/tablet, os mesmos
blocos empilham em coluna única (comportamento atual, sem alteração).

---

## 3. Sistema de cor aplicado

| Token | Papel no admin | Contraste (par típico) | Status AA |
|---|---|---|---|
| `colors.primary` (#803C7A) sobre `ADMIN_SURFACE`/`surface` (#FBF7F1/#FFF6EF) | Texto de link, ícone ativo, botão secundário (borda+texto), aba ativa (fundo sólido + texto `surface`) | ~5.9:1 texto sobre surface | Passa AA (texto normal e grande) |
| `colors.surface` sobre `colors.primary` sólido | Texto de botão primário-navegação (`tabTextActive`, `primaryButtonWideText` equivalente) | ~5.9:1 | Passa AA |
| `colors.accent`/`success` (#3BCFA9) como **fundo** de badge "Publicado" | Confirmação positiva, badge de item publicado | Texto **claro** (`surface`) sobre Sage = ~1.8:1 — **reprova**. Já corrigido no código atual: `statusBadgeTextPublished` usa `colors.textPrimary` (Deep mint) sobre Sage = contraste alto, passa AA. | Manter a correção já aplicada — nunca reverter para texto claro sobre Sage. |
| `colors.accent` como **texto** sobre `surface`/`ADMIN_SURFACE` | Não usar. Já documentado como falha no código (`showPasswordText`, `importButtonText`, `error`/`success` comentários) — Sage como texto sobre fundo claro do admin é ~1.84:1, reprova AA. | Reprova | Ver §6 — usar `colors.primary` no lugar quando a intenção é link/ação, e `colors.textPrimary` sobre fundo Sage quando a intenção é confirmação positiva com fundo sólido. |
| `colors.danger` (#B3261E) como fundo de botão destrutivo | Excluir, apagar selecionados, confirmação de exclusão | Texto `surface` sobre danger = alto contraste (~7:1+) | Passa AA |
| `colors.danger` como texto sobre `surface`/`ADMIN_SURFACE`/`background` | Link "Excluir" (`linkDanger`), mensagem de erro (`error`) | ~5.5:1+ | Passa AA |
| `colors.textPrimary` (#00170C) sobre `ADMIN_BG` (#EFE8DD) | Corpo de texto padrão de tela | Alto contraste (texto quase-preto sobre greige claro) | Passa AA com folga |
| `colors.textSecondary` (#6B4463) sobre `ADMIN_SURFACE`/`ADMIN_BG` | Hint, meta, texto secundário | ~5:1+ | Passa AA (texto normal) |
| `colors.textSecondary` como fundo de badge "Rascunho" | `statusBadgeDraft` | Texto `surface` sobre textSecondary = contraste médio-alto | Passa AA (já corrigido no código: `statusBadgeTextDraft` usa `surface`) |

**Hierarquia de ênfase por tela** (conforme `01-creative-direction-admin.md
§3`): no máximo `primary` (ação/navegação) + `accent` (confirmação/estado
publicado) + neutro. `danger` só aparece quando há de fato uma ação
destrutiva disponível na tela — nunca como quarta cor decorativa. Qualquer
tela com mais de 2 cores de destaque simultâneas volta para
`ux-architect`/`ui-designer` antes de seguir.

**Superfícies do admin:** `ADMIN_BG` é o fundo de tela (nunca `background`
público #FFEDDF); `ADMIN_SURFACE`/`colors.surface` para cards, inputs,
sidebar, painéis; `colors.background` (#FFEDDF Pale apricot) só aparece no
admin dentro do `accordionCard` já existente (fundo do card expandido) —
manter, é diferenciação intencional de profundidade (card "dentro" do
greige), não confusão com o app público, já que nunca é fundo de tela
inteira.

---

## 4. Estados de componente

### 4.1 Botão primário (ação de seguir em frente — Salvar, Adicionar item)
- **Default:** fundo `colors.primary`, texto `colors.surface` 17px/700,
  `radii.pill`, `minHeight: minTouchSize`, padding `lg`/`md`.
  (Nota: código atual usa `colors.accent` em `primaryButton` — corrigir,
  ver §6: Sage deve significar "confirmado/publicado", não "ação
  primária padrão".)
- **Hover (desktop, mouse):** fundo `primaryLight`, sombra sutil
  (`shadowOpacity 0.25`, já no padrão de `tabActive`).
- **Foco (teclado):** anel de foco 2px `colors.primary` com offset 2px
  sobre fundo, mantendo o próprio botão como está (não mudar cor de
  fundo no foco — só o anel externo).
- **Pressed/ativo:** fundo escurece levemente (mistura com `textPrimary`
  ~10%) ou `primaryLight` invertido — feedback tátil imediato.
- **Desabilitado:** `opacity: 0.5` (token já existente `buttonDisabled`),
  sem sombra, cursor `not-allowed` em web.
- **Carregando (salvando):** texto substituído por indicador inline
  discreto (Linear-style, não spinner de tela cheia — `00-experience-
  vision.md §2`) + rótulo "Salvando…" mantendo mesmas dimensões (evita
  reflow).

### 4.2 Botão secundário (ação de apoio — Cancelar, Fechar)
- **Default:** transparente, borda 1px `colors.textSecondary`, texto
  `textSecondary` 17px/600, `radii.pill`.
- **Hover:** borda `colors.primary`, texto `colors.primary`.
- **Foco:** anel 2px `colors.primary`.
- **Desabilitado:** `opacity: 0.5`.

### 4.3 Botão destrutivo (Excluir, Apagar selecionados)
- **Default:** fundo `colors.danger`, texto `colors.surface` 17px/700,
  `radii.pill` (correção já aplicada no código, manter).
- **Hover:** fundo escurece ~8% (mistura com preto/deep mint).
- **Foco:** anel 2px `colors.danger` com offset — nunca sutil (princípio
  "não esconde ação irreversível", `00-experience-vision.md §3`).
- **Confirmação (2ª etapa, mesmo botão muda de rótulo):** rótulo passa a
  descrever a consequência real e concreta: "Excluir 'Guerreiro do Bem'"
  ou "Apagar 3 itens de Músicas — não dá para desfazer" — nunca
  "Confirmar?" genérico. Cor permanece `danger`, mas ganha texto de apoio
  abaixo do botão (17px, `textSecondary`) reforçando "Não dá para
  desfazer" quando N ≥ 2 (exclusão em massa) — ver §4.11.
- **Desabilitado:** `opacity: 0.5` (ex.: nenhum item selecionado no modo
  seleção).

### 4.4 Sidebar item (desktop ≥960px)
- **Default:** fundo transparente, texto `textPrimary` 17px/600, ícone à
  esquerda opcional, altura mínima `minTouchSize`, padding `md`.
- **Hover:** fundo `ADMIN_SURFACE` com leve tom de `primaryLight` a 8%
  (equivalente a `rgba(175,101,168,0.08)`), sem mudança de texto.
- **Ativo (aba selecionada):** fundo `colors.primary` sólido, texto
  `colors.surface`, mesma lógica de `tabActive` hoje usada no mobile —
  consistência entre os dois padrões de navegação (decisão 1 preserva a
  linguagem visual, muda só a orientação).
- **Foco (teclado):** anel 2px `colors.primary`, visível mesmo sobre
  fundo ativo.

### 4.5 Segmented tab (mobile <960px, padrão atual)
Mantém tokens existentes: `tab`/`tabActive`/`tabText`/`tabTextActive` sem
alteração — já correto (`01-creative-direction-admin.md` não pede mudança
aqui, só o comportamento pill).

### 4.6 Category chip
- **Default (não selecionado):** borda 1px `primaryLight`, texto
  `textPrimary` 17px, fundo transparente, `radii.pill`.
- **Hover:** fundo `ADMIN_SURFACE` levemente tintado, borda `primary`.
- **Ativo/selecionado:** fundo `primary` sólido, texto `surface` —
  token atual já correto.
- **Foco:** anel 2px `primary`.
- Diferenciação de "chip de mapeamento de coluna" (modal de importação,
  achado `02-ux-architecture-admin.md §2.5`): mesmo componente base, mas
  com um **rótulo emparelhado visível dentro do próprio chip** ("Coluna A
  → Título") em vez de só o valor final, e estado adicional **"ignorada"**
  (fundo transparente, borda tracejada `textSecondary`, texto
  `textSecondary` — visualmente mais "apagado" que um chip de categoria
  não-selecionado, para não confundir os dois significados).

### 4.7 Input / textarea
- **Default:** fundo `colors.surface`, borda 1px `primaryLight`, texto
  `textPrimary` 17px, `radii.md`, `minHeight: minTouchSize` (textarea:
  `minHeight: 96` mantém, mas texto sobe a 17px).
- **Foco:** borda 2px `colors.primary` (substitui a borda 1px, não soma —
  evita "pulo" de layout), leve sombra interna opcional
  (`shadowColor: primary, shadowOpacity: 0.15`).
- **Preenchido (com valor, não em foco):** idêntico ao default — não há
  estilo de "preenchido" adicional necessário (o valor visível já é o
  sinal), evita ruído visual desnecessário.
- **Erro (validação falhou):** borda 2px `colors.danger`, texto de apoio
  abaixo em `colors.danger` 17px ("Falta o título antes de salvar" —
  linguagem exata de `01-creative-direction-admin.md §2`), ícone de alerta
  opcional à direita do campo (não substitui o texto).
- **Desabilitado:** fundo `ADMIN_BG` (mais neutro que `surface`), texto
  `textSecondary`, borda `textSecondary` a 40% opacidade, sem cursor de
  edição.

### 4.8 Card de item (accordion da Biblioteca)
- **Colapsado:** fundo `colors.background` (#FFEDDF, conforme
  `accordionCard` atual — mantém a exceção documentada em §3), borda 1px
  `primaryLight`, `radii.md`, chevron 22px `textSecondary` apontando para
  baixo/direita conforme plataforma.
- **Hover (desktop):** borda `colors.primary`, leve elevação
  (`shadowOpacity 0.08`).
- **Expandido:** chevron rotaciona 90°, cor muda para `colors.primary`
  (`chevronExpanded` já existe), corpo (`accordionBody`) revela
  título/descrição/meta + ações (Editar, Mover ↑/↓, Excluir).
- **Selecionado (modo seleção múltipla ativo):** borda 2px `colors.primary`,
  checkbox preenchido à esquerda (`checkboxChecked`, já existe), fundo
  ligeiramente tintado de `primaryLight` a 6% para reforçar seleção sem
  depender só do checkbox.
- **Ações internas — reforço de hierarquia** (endereça achado
  `02-ux-architecture-admin.md §2.4`): "Mover ↑/↓" e "Editar" agrupados à
  esquerda como botões de ícone/texto neutros (`textSecondary`/`primary`);
  "Excluir" isolado à direita com `spacing.lg` adicional de afastamento
  (além do `accordionActionsSpacer` existente) e cor `danger` — a distância
  espacial passa a ser o sinal primário de risco, não só a cor.

### 4.9 Toast (sucesso, erro, undo)
- **Sucesso:** fundo `colors.accent` (Sage), texto `colors.textPrimary`
  (correção já aplicada — Deep mint sobre Sage passa AA), ícone de check
  opcional, `radii.md`, posição fixa topo (mobile) ou canto superior
  direito do painel B (desktop, para não cobrir a sidebar/painel A).
- **Erro:** fundo `colors.danger`, texto `colors.surface`, mesma posição.
- **Undo (decisão 4 — exclusão em massa):** variante nova, mesma família
  visual do toast padrão:
  - Fundo `colors.textPrimary` (Deep mint, #00170C) — neutro-escuro, não
    `danger` (a exclusão em si já não é mais o foco; o foco é a janela de
    reversão) nem `accent` (não é uma confirmação de sucesso, é uma ação
    reversível pendente).
  - Texto `colors.surface` 17px/600: "N itens excluídos."
  - Ação "Desfazer" como texto-botão inline dentro do próprio toast, cor
    `colors.inverseMuted` (#E7C9E3 — já é o token reservado para
    texto/link sobre fundo escuro sólido, ver `tokens.ts`), sublinhado ou
    peso 700 para se diferenciar da mensagem.
  - Duração: 6-8s, com barra de progresso discreta opcional (`accent` a
    baixa opacidade) indicando tempo restante — reforça "isto ainda pode
    ser desfeito" sem exigir leitura de número.
  - Ao tocar "Desfazer": toast muda para variante de sucesso curto
    ("Restaurado.") por ~2s e fecha.
  - `prefers-reduced-motion`: sem barra de progresso animada, texto
    "(6s)" estático substitui a barra.

### 4.10 Estado vazio
- Container centralizado dentro do painel A (desktop) ou da lista
  (mobile), sem borda/card — texto direto sobre `ADMIN_BG`/`ADMIN_SURFACE`.
- Texto 17px `textPrimary`, tom acolhedor conforme voice&tone: "Ainda não
  há nada em {categoria} — cadastre o primeiro item abaixo." + botão
  primário "Novo item" logo abaixo (reforça a decisão 3, mesmo em estado
  vazio o CTA de criação é a única ação visível).
- Nunca usa ícone decorativo de "caixa vazia" genérico de biblioteca de
  ícones fria — se houver ícone, usar o mesmo glyph de círculo com seta já
  usado no resto do admin, em tom `primaryLight`, baixo contraste
  intencional (decorativo, não informativo).

### 4.11 Loading
- **Carregando lista (skeleton):** `skeletonRow` já existente (altura 52,
  `radii.md`, `ADMIN_BG` a 0.6 opacidade) — manter, é discreto e consistente
  com o princípio Linear de "densidade calma" (`00-experience-vision.md
  §2`). Empilhar 3-4 linhas fantasma por categoria.
- **Carregando ação pontual (salvar, importar):** indicador inline no
  próprio botão (ver §4.1), nunca overlay de tela cheia — regra
  explícita da visão de experiência.
- **Carregando sessão (login):** `centered` existente, indicador simples
  centralizado sobre `ADMIN_BG`.

### 4.12 Confirmação destrutiva (1 item vs. massa)
Reforça `02-ux-architecture-admin.md §3c` com fricção escalando por N,
conforme o trade-off já levantado ali (resolvido pelo Head com undo
temporário — decisão 4, não mais "fricção textual reforçada" isolada):

- **1 item:** botão `linkDanger`/`dangerButton` muda para 2º estado com
  texto "Excluir '{título}'" (nome real do item, não "este item").
  Ao confirmar, exclusão é imediata (não passa por undo — só a exclusão em
  massa usa undo, conforme decisão 4; exclusão unitária mantém o padrão
  atual de 2 toques já avaliado como correto).
- **Massa (N≥2):** botão de confirmação mostra "Apagar {N} itens de
  {categoria}" + texto de apoio 17px `textSecondary` abaixo: "Você pode
  desfazer por alguns segundos depois." (em vez de "não dá para desfazer",
  já que agora dá — o texto de voice&tone original presumia exclusão
  imediata; esta especificação ajusta a frase para refletir a decisão 4,
  sinalizado como atualização de copy a validar com o Head/creative
  direction antes do gate).
- Ao confirmar: exclusão dispara imediatamente no Firestore **ou** entra
  em fila de soft-delete (decisão de arquitetura fora de escopo deste
  documento) — visualmente, os itens somem da lista de imediato e o toast
  de undo (§4.9) aparece. Item(ns) reaparecem na posição original se
  "Desfazer" for tocado dentro da janela.

---

## 5. Inventário de componentes (para `design-system-engineer`)

Nomenclatura sugerida (não vincula nomenclatura final de código):

1. `AdminSidebar` (novo, desktop ≥960px) — variantes: item default/hover/
   ativo/foco (§4.4).
2. `AdminSegmentedTabs` (existente, mobile <960px) — sem alteração de
   token, só confinado a breakpoint.
3. `AdminTwoPaneLayout` (novo) — wrapper estrutural: sidebar + painel A +
   painel B, com regras de largura/scroll independente de §2.2.
4. `AdminButtonPrimary` / `AdminButtonSecondary` / `AdminButtonDestructive`
   (existente, revisão de token — ver §6) — estados default/hover/foco/
   pressed/disabled/loading.
5. `CategoryChip` (existente) + variante `ColumnMappingChip` (novo,
   diferenciação de §4.6).
6. `AdminInput` / `AdminTextarea` (existente, revisão de tamanho — ver §6)
   — estados default/foco/erro/desabilitado.
7. `LibraryItemCard` (accordion, existente) — estados colapsado/expandido/
   selecionado/hover.
8. `StatusBadge` (existente: Publicado/Rascunho) — sem alteração.
9. `AdminToast` (existente) + variante `AdminToastUndo` (novo — §4.9).
10. `EmptyState` (novo componente nomeado — hoje texto solto inline) —
    §4.10.
11. `SkeletonRow` (existente) — sem alteração.
12. `DestructiveConfirmButton` (padrão de interação, não componente visual
    novo — reaproveita `AdminButtonDestructive` com troca de rótulo/estado,
    §4.3 e §4.12).
13. `ImportMappingModal` (existente, revisão interna de chip — item 5).
14. `OverviewCategoryGrid` (novo, desktop ≥960px) — grid 2 colunas de
    `overviewGroupHeader` + lista, §2.3.

---

## 6. Riscos para o gate de `audit-design`

Itens que esta especificação já corrige na definição, mas que **ainda não
estão implementados** em `AdminScreen.tsx` — sinalizar explicitamente para
`frontend-multistack`/`design-system-engineer` aplicarem, e para
`audit-design` verificar:

1. **Tamanhos de fonte abaixo de 17px em texto operacional** — vários
   tokens atuais (`itemDescription` 13, `overviewItemTitle` 13.5,
   `fieldHint` 12, `helper`/`error`/`success` 14, `categoryChipText` 13,
   `secondaryButtonText`/`primaryButtonText` 16, `sectionTitle` 16) violam
   o piso de 17px definido em `tokens.ts` (`minFontSize`) e reafirmado em
   §1 deste documento. Risco de reprovação direta no gate por
   inconsistência com o próprio token declarado como fonte da verdade.
2. **`primaryButton` usa `colors.accent` (Sage) como fundo** — semântica
   errada segundo `01-creative-direction-admin.md §3` (accent é só
   confirmação/publicado). Deveria usar `colors.primary`, como
   `primaryButtonWide` já faz corretamente. Inconsistência entre os dois
   botões "primary" do mesmo arquivo.
3. **Toast de undo (§4.9) e estado vazio nomeado (§4.10) não existem
   ainda no código** — são requeridos pela decisão 4 do Head e pelo
   princípio de voice&tone, respectivamente; precisam ser implementados
   antes do gate considerar a decisão 4 "concluída", não só "documentada".
4. **Texto de confirmação de exclusão em massa** ("Confirmar: apagar N
   item(ns)?") não reflete nem a voice&tone original nem a atualização
   desta especificação (§4.12) — hoje não menciona nem irreversibilidade
   nem a janela de undo. Copy desatualizada é risco de confiança
   (princípio 2 de `00-experience-vision.md`, "clareza de estado sempre
   visível").
5. **Reforço de afastamento espacial entre "Excluir" e as demais ações do
   accordion** (§4.8) ainda não tem o `spacing.lg` adicional — hoje só o
   `accordionActionsSpacer` (flex) separa, sem valor de espaçamento fixo
   mínimo garantido em telas largas onde o flex pode colapsar a distância
   visual se o conteúdo crescer.
6. **Chip de mapeamento de coluna reaproveita 100% o visual de
   `categoryChip`** sem o estado "ignorada" nem o rótulo emparelhado — ver
   §4.6, ainda não implementado.

---

## 7. Entregável e próximos passos

Este documento fecha o design de alta fidelidade dos estados de componente
e da grade responsiva do admin, a partir da estrutura aprovada pelo Head
(sidebar, 2 painéis, "Novo item" no topo, undo temporário). Segue para:
- `digital-product-team-design-system-engineer`: encodar o inventário da
  seção 5 como componentes reutilizáveis com os tokens/estados exatos
  aqui descritos.
- `digital-product-team-frontend-multistack`: implementar o grid
  responsivo (seção 2.2) e o `AdminTwoPaneLayout`.
- `digital-product-team-audit-design`: validar os 6 riscos da seção 6
  antes de aprovar o gate — em especial o piso de 17px (risco 1) e a
  semântica de cor do `primaryButton` (risco 2), que já divergem do
  próprio `tokens.ts` hoje.
- Copy atualizada da confirmação de exclusão em massa (§4.12, risco 4)
  precisa validação do Head — a frase original de
  `00-experience-vision.md` ("não dá para desfazer") ficou desatualizada
  pela decisão 4 (undo temporário) e esta especificação já propõe a
  substituição, mas não é uma decisão de UI unilateral.
