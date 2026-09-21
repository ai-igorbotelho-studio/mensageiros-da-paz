# Design System Spec — Painel Admin (`/admin`) — v1.0.0 (proposta)

Documento do subagente `design-system-engineer`. Versiona em camadas os
tokens de `app/src/theme/tokens.ts` e define o contrato dos 14 componentes
do inventário de `design/03-ui-system-admin.md §5`. Insumo direto para
implementação após o gate do Head — **nenhum arquivo de `app/**` foi
alterado para produzir este documento**. Todos os valores abaixo já
existem em `tokens.ts`/`AdminScreen.tsx`; nada é inventado.

Status: **proposta aguardando aprovação do Head** (gate pré-build).

---

## 1. Token map versionado

### 1.0 Convenção de nomenclatura

`camada.categoria.papel[.variante][.estado]`, ex.: `color.action.primary.default`,
`space.inset.card`. Nomes são a interface pública do design system — o
valor por trás pode mudar entre versões sem quebrar quem consome o nome
(essa é a razão de existir a camada semântica).

### 1.1 Camada 1 — Primitivos (paleta bruta, já em `tokens.ts`)

Sem mudança — é a fonte física de valor, nunca referenciada direto por
componente (só pela camada semântica).

| Primitivo | Valor | Origem em `tokens.ts` |
|---|---|---|
| `palette.mulberry` | `#803C7A` | `colors.primary` |
| `palette.magenta` | `#AF65A8` | `colors.primaryLight` |
| `palette.paleApricot` | `#FFEDDF` | `colors.background` |
| `palette.paleApricotTint` | `#FFF6EF` | `colors.surface` |
| `palette.sage` | `#3BCFA9` | `colors.accent` / `colors.success` |
| `palette.deepMint` | `#00170C` | `colors.textPrimary` / `colors.darkBackground` |
| `palette.mulberryDark` | `#6B4463` | `colors.textSecondary` |
| `palette.dangerRed` | `#B3261E` | `colors.danger` |
| `palette.inverseMuted` | `#E7C9E3` | `colors.inverseMuted` |
| `palette.adminGreige` | `#EFE8DD` | `ADMIN_BG` (`AdminScreen.tsx`, não em `tokens.ts` hoje — ver §3.3) |
| `palette.adminSurface` | `#FBF7F1` | `ADMIN_SURFACE` (idem) |
| `palette.fontDisplay` | `Lora` | `fonts.display` |
| `palette.fontBody` | `Lexend` | `fonts.body` |
| `space.4/8/16/24/32/48` | `4·8·16·24·32·48` | `spacing.xs..xxl` |
| `radius.8/16/24/999` | `8·16·24·999` | `radii.sm..pill` |

### 1.2 Camada 2 — Semânticos (o que componentes devem consumir)

**Cor — ação/navegação**

| Token semântico | Primitivo | Uso |
|---|---|---|
| `color.action.primary.bg` | `palette.mulberry` | fundo de botão primário, aba ativa, sidebar item ativo |
| `color.action.primary.bg.hover` | `palette.magenta` | hover de botão/sidebar-item primário |
| `color.action.primary.text` | `palette.paleApricotTint` (`colors.surface`) | texto sobre fundo `action.primary.bg` |
| `color.action.secondary.border` | `palette.mulberryDark` (`textSecondary`) | borda de botão secundário default |
| `color.action.secondary.border.hover` | `palette.mulberry` | borda de botão secundário hover/foco |
| `color.action.secondary.text` | `palette.mulberryDark` | texto de botão secundário default |
| `color.action.destructive.bg` | `palette.dangerRed` | fundo de botão destrutivo |
| `color.action.destructive.text` | `palette.paleApricotTint` | texto sobre fundo destrutivo |
| `color.focus.ring` | `palette.mulberry` (ou `palette.dangerRed` em contexto destrutivo) | anel de foco 2px, offset 2px |

**Cor — feedback/estado**

| Token semântico | Primitivo | Uso |
|---|---|---|
| `color.feedback.success.bg` | `palette.sage` | badge "Publicado", toast de sucesso |
| `color.feedback.success.text` | `palette.deepMint` | texto sobre `feedback.success.bg` (correção já aplicada no código — nunca `surface` claro sobre Sage, contraste reprova) |
| `color.feedback.danger.bg` | `palette.dangerRed` | toast de erro, badge de erro |
| `color.feedback.danger.text` | `palette.paleApricotTint` | texto sobre `feedback.danger.bg` |
| `color.feedback.neutral.bg` | `palette.mulberryDark` (`textSecondary`) | badge "Rascunho" |
| `color.feedback.neutral.text` | `palette.paleApricotTint` | texto sobre badge "Rascunho" |
| `color.feedback.pending.bg` | `palette.deepMint` | toast de undo (§4.9 do `03`) — neutro-escuro, nem danger nem success |
| `color.feedback.pending.text` | `palette.paleApricotTint` | texto do toast de undo |
| `color.feedback.pending.action` | `palette.inverseMuted` | link "Desfazer" dentro do toast |

**Cor — superfície/texto (admin)**

| Token semântico | Primitivo | Uso |
|---|---|---|
| `color.surface.admin.canvas` | `palette.adminGreige` (`ADMIN_BG`) | fundo de tela do admin (nunca `background` público) |
| `color.surface.admin.card` | `palette.adminSurface` (`ADMIN_SURFACE`) | cards, inputs, sidebar, painéis |
| `color.surface.admin.cardAlt` | `palette.paleApricot` (`colors.background`) | exceção documentada: fundo do `accordionCard` expandido — profundidade dentro do greige, nunca fundo de tela inteira |
| `color.text.primary` | `palette.deepMint` | corpo de texto padrão |
| `color.text.secondary` | `palette.mulberryDark` | hint/meta/texto de apoio |
| `color.text.link` | `palette.mulberry` | link, ação textual (nunca `palette.sage` como texto — reprova AA, ver §1.4) |
| `color.border.default` | `palette.magenta` (`primaryLight`) | borda de input/card/chip não selecionado |
| `color.border.danger` | `palette.dangerRed` | borda de input em erro |

**Espaço**

| Token semântico | Primitivo | Uso |
|---|---|---|
| `space.inset.card` | `space.16` (`md`) | padding interno de card/accordion header |
| `space.inset.screen.mobile` | `space.24` (`lg`) | padding horizontal de tela em mobile/tablet |
| `space.stack.field` | `space.8` (`sm`) | label→input, item→item em bloco |
| `space.stack.section` | `space.24` (`lg`) | entre seções distintas de formulário |
| `space.stack.beforeSectionTitle` | `space.32` (`xl`) | antes de `sectionTitle` |
| `space.inset.scrollEnd` | `space.48` (`xxl`) | padding-bottom de scroll |
| `space.gap.layout` | `space.24` (`lg`) | gutter sidebar/painel A/painel B (desktop) |
| `space.gap.destructiveIsolation` | `space.24` (`lg`) | afastamento extra entre "Excluir" e demais ações do accordion (§4.8 do `03`, ainda não implementado — ver §3.3) |

**Tipografia**

| Token semântico | Família/tamanho/peso/lh | Uso |
|---|---|---|
| `type.display` | Lora 24/400/30 | título de tela |
| `type.sectionTitle` | Lexend 17/700/22 | título de seção (hoje 16 — mudança proposta, §1.4) |
| `type.groupLabel` | Lexend 13 uppercase ls0.4/700/16 | rótulo de agrupamento (exceção <17 documentada) |
| `type.body` | Lexend 17/400/24 | texto operacional padrão |
| `type.bodyStrong` | Lexend 17/600/24 | label de campo, texto de botão |
| `type.bodyDense` | Lexend 17/400/22 | linha de lista/tabela compacta (hoje 13.5 — mudança proposta) |
| `type.hint` | Lexend 17/400/22, cor `color.text.secondary` | hint/meta (hoje 12-14 — mudança proposta) |
| `type.microLabel` | Lexend 13 uppercase/700/16 | badge de estado (exceção <17 documentada) |

**Raio**

| Token semântico | Primitivo | Uso |
|---|---|---|
| `radius.control` | `radius.16` (`md`) | input, card |
| `radius.container` | `radius.24` (`lg`) | modal, painel |
| `radius.action` | `radius.999` (`pill`) | todo botão (regra do Head: botões sempre pílula) |

**Toque/acessibilidade**

| Token semântico | Valor | Uso |
|---|---|---|
| `size.minTouch` | `44` (`minTouchSize`) | altura/largura mínima de qualquer alvo tocável |
| `size.minFont` | `17` (`minFontSize`) | piso de fonte para texto operacional (exceções documentadas em `type.groupLabel`/`type.microLabel`) |

### 1.3 Camada 3 — Tokens de componente (quando o semântico não basta)

Só onde o `03` especificou um valor que não é reuso direto de um semântico
genérico:

| Token de componente | Valor | Origem |
|---|---|---|
| `component.toast.undo.duration` | `6000–8000ms` | `03 §4.9` |
| `component.input.textarea.minHeight` | `96` | `03 §4.7` (valor já hardcoded hoje, promovido a token) |
| `component.sidebar.width` | `220–260` | `03 §2.2` |
| `component.panelA.width` | `38%` (desktop), teto `420` (≥1280px) | `03 §2.2` |
| `component.panelB.maxWidth` | `720` | `03 §2.2` |
| `component.container.maxWidth` | `1600` | `03 §2.2` (≥1920px) |
| `component.button.disabled.opacity` | `0.5` | já existe como `buttonDisabled` no código |

### 1.4 Mudanças propostas para v1.0.0 (não aplicadas em código — para aprovação do Head)

Cada item aqui é uma correção que `03 §6` já identificou como divergência
entre o código atual e o próprio `tokens.ts`/direção criativa. Registrado
como parte do spec versionado, não como decisão unilateral de encode.

| # | Mudança | De → Para | Justificativa | Tipo |
|---|---|---|---|---|
| M1 | `type.sectionTitle` | 16px → 17px | Abaixo do piso `minFontSize` declarado no próprio `tokens.ts` | Correção (breaking visual mínimo, sem breaking de API) |
| M2 | `type.bodyDense` (`overviewItemTitle`) | 13.5px → 17px | Idem | Correção |
| M3 | `type.hint` (`fieldHint`/`helper`/`error`/`success`) | 12–14px → 17px | Idem | Correção |
| M4 | `type.body`/`bodyStrong` de botão (`primaryButtonText`/`secondaryButtonText`) | 16px → 17px | Idem | Correção |
| M5 | `categoryChipText` | 13px → 17px | Idem (não está na lista de exceções deliberadas de `03 §1`) | Correção |
| M6 | `color.action.primary.bg` do botão primário (`primaryButton`) | `colors.accent` (Sage) → `colors.primary` (Mulberry) | Sage é reservado a confirmação/estado publicado (`01 §3`); botão "primary" usando Sage diverge de `primaryButtonWide`, que já usa Mulberry corretamente — inconsistência dentro do mesmo arquivo | Correção de semântica de cor |
| M7 | Copy de confirmação de exclusão em massa | "Confirmar: apagar N item(ns)?" → "Apagar N itens de {categoria}" + texto de apoio sobre janela de undo | Decisão 4 do Head (undo temporário) tornou a copy atual desatualizada/incorreta | **Pendente de validação do Head** — é copy/voice&tone, não decisão de UI unilateral (ver `03 §7`) |

M1–M6 são consideradas **correções de conformidade** (o código diverge do
próprio token já aprovado), não novas decisões estéticas — mas alteram
a métrica visual de várias telas simultaneamente, por isso seguem listadas
explicitamente para o Head confirmar antes do encode, dado que a regra do
projeto é "Head aprova antes do build".

---

## 2. Contrato de componente (14 itens do inventário `03 §5`)

Formato por componente: **Props/variantes · Estados · Tokens consumidos ·
Requisitos de a11y**.

### 2.1 `AdminSidebar` (novo, desktop ≥960px)
- **Props:** `items: {label, icon?, route}[]`, `activeRoute`.
- **Estados:** default, hover, ativo, foco.
- **Tokens:** `color.surface.admin.card`, `color.action.primary.bg` (ativo),
  `color.action.primary.text` (ativo), `color.text.primary` (default),
  `space.inset.card`, `component.sidebar.width`, `size.minTouch` (altura
  de item), `color.focus.ring`.
- **A11y:** `role="navigation"`, cada item `role="link"`/`tab` conforme
  padrão de nav ativa; item ativo com `aria-current="page"`; foco visível
  por teclado mesmo sobre fundo ativo; alvo de toque ≥44px mesmo em
  densidade desktop.

### 2.2 `AdminSegmentedTabs` (existente, mobile <960px)
- **Props:** `tabs: {label, key}[]`, `activeKey`.
- **Estados:** default, ativo, foco. Sem alteração de token — só
  confinamento de breakpoint (`≥960px` esconde, sidebar assume).
- **Tokens:** os já existentes `tab`/`tabActive`/`tabText`/`tabTextActive`
  (mapear para `color.action.primary.bg`/`color.action.primary.text` na
  migração, sem mudar valor).
- **A11y:** `role="tablist"`/`role="tab"`, `aria-selected`, alvo ≥44px.

### 2.3 `AdminTwoPaneLayout` (novo, wrapper estrutural)
- **Props:** `sidebar: ReactNode`, `paneA: ReactNode`, `paneB: ReactNode | null`,
  `breakpoint` (derivado do viewport, não prop manual).
- **Estados:** mobile (coluna única, paneB inline no ponto de origem),
  tablet (idem mobile), desktop (3 colunas com scroll independente).
- **Tokens:** `component.sidebar.width`, `component.panelA.width`,
  `component.panelB.maxWidth`, `component.container.maxWidth`,
  `space.gap.layout`.
- **A11y:** landmarks (`role="complementary"` sidebar, `role="main"` painel
  B), ordem de foco lógica (sidebar → painel A → painel B), scroll de cada
  painel não deve prender o foco do teclado (sem `tabindex` trap).

### 2.4 `AdminButtonPrimary` / `AdminButtonSecondary` / `AdminButtonDestructive`
- **Props comuns:** `label`, `onPress`, `disabled?`, `loading?`, `icon?`.
- **Estados:** default, hover (web/mouse), foco (teclado), pressed,
  disabled, loading.
- **Tokens Primary:** `color.action.primary.bg`(+hover)/`.text`,
  `radius.action`, `size.minTouch`, `type.bodyStrong`,
  `component.button.disabled.opacity`, `color.focus.ring`. **Ver M6.**
- **Tokens Secondary:** `color.action.secondary.border`(+hover)/`.text`,
  demais iguais.
- **Tokens Destructive:** `color.action.destructive.bg`/`.text`,
  `color.focus.ring` = variante danger, texto de apoio opcional em
  `color.text.secondary` (17px) quando N≥2 (§4.12 do `03`).
- **A11y:** `role="button"`, `aria-disabled` quando `disabled`,
  `aria-busy` quando `loading` (texto substituído sem reflow), alvo
  ≥44px sempre, foco por teclado obrigatório (não só hover), contraste
  do texto sobre fundo validado por par (ver §1.2 tabela de cor).

### 2.5 `CategoryChip` + variante `ColumnMappingChip`
- **Props:** `label`, `selected: boolean`, `onPress`; `ColumnMappingChip`
  adiciona `pairedLabel` ("Coluna A → Título") e `ignored: boolean`.
- **Estados:** default (não selecionado), hover, selecionado, foco;
  `ColumnMappingChip` soma estado **ignorada**.
- **Tokens:** `color.border.default`/`color.action.primary.bg`
  (selecionado), `color.text.primary`/`color.action.primary.text`
  (selecionado), `radius.action`, `type.body`. Ignorada: borda tracejada
  `color.text.secondary`, texto `color.text.secondary`.
- **A11y:** `role="checkbox"` ou `switch` conforme semântica (seleção
  múltipla vs. toggle único a confirmar com `ux-architect`), estado
  refletido em `aria-checked`/`aria-selected`, alvo ≥44px mesmo sendo
  chip compacto (usar padding, não encolher hit area).

### 2.6 `AdminInput` / `AdminTextarea`
- **Props:** `label`, `value`, `onChange`, `placeholder?`, `error?: string`,
  `hint?: string`, `disabled?`, `multiline?` (textarea).
- **Estados:** default, foco, preenchido (= default), erro, disabled.
- **Tokens:** `color.surface.admin.card`, `color.border.default`(+foco
  `color.action.primary.bg` 2px), `color.text.primary`, `radius.control`,
  `size.minTouch` (input) / `component.input.textarea.minHeight`
  (textarea), `type.body` (valor) / `type.bodyStrong` (label) /
  `type.hint` (mensagem de erro, cor `color.border.danger`).
- **A11y:** `<label>` associado (`for`/`aria-labelledby`), erro anunciado
  via `aria-describedby` + `aria-invalid="true"`, foco visível (borda 2px
  substitui a 1px, sem somar — evita reflow), contraste de placeholder
  não usado como único rótulo.

### 2.7 `LibraryItemCard` (accordion)
- **Props:** `title`, `meta`, `expanded`, `selected?` (modo seleção),
  `onToggle`, `actions: {edit, moveUp, moveDown, delete}`.
- **Estados:** colapsado, hover (desktop), expandido, selecionado.
- **Tokens:** `color.surface.admin.cardAlt` (colapsado/expandido — exceção
  documentada), `color.border.default`(+hover `color.action.primary.bg`),
  `radius.control`, `color.action.primary.bg` (borda selecionado 2px),
  `space.gap.destructiveIsolation` (afastamento de "Excluir" — pendente de
  implementação, ver M-list do `03 §6` item 5).
- **A11y:** `role="button"` + `aria-expanded` no header do accordion,
  checkbox de seleção com `aria-checked` e rótulo acessível próprio (não
  só ícone), ação "Excluir" com `aria-label` explícito do item ("Excluir
  {título}", não "Excluir" genérico) para leitor de tela distinguir cards.

### 2.8 `StatusBadge` (Publicado/Rascunho)
- **Props:** `status: "published" | "draft"`.
- **Estados:** só os dois valores de `status` (sem hover/foco — não
  interativo).
- **Tokens:** `color.feedback.success.bg`/`.text` (published),
  `color.feedback.neutral.bg`/`.text` (draft), `type.microLabel`,
  `radius.action`.
- **A11y:** não é `button`; se estiver dentro de item clicável, o rótulo
  do estado precisa estar disponível ao leitor de tela via texto real
  (não só cor) — já é o caso (texto "Publicado"/"Rascunho" visível).

### 2.9 `AdminToast` + variante `AdminToastUndo`
- **Props:** `variant: "success" | "error" | "undo"`, `message`,
  `actionLabel?` (undo), `onAction?`, `duration?`.
- **Estados:** visível, saindo (fade/slide), (undo) acionado → transiciona
  para "Restaurado." por ~2s.
- **Tokens:** success = `color.feedback.success.bg`/`.text`; error =
  `color.feedback.danger.bg`/`.text`; undo = `color.feedback.pending.bg`/
  `.text`/`.action`, `component.toast.undo.duration`, `radius.control`.
- **A11y:** `role="status"` (success/error) ou `role="alert"` (error),
  `aria-live="polite"` (undo, não interrompe leitura em curso), botão
  "Desfazer" com alvo ≥44px mesmo sendo texto inline, `prefers-reduced-
  motion` → sem barra de progresso animada, texto "(6s)" estático no
  lugar (`03 §4.9`).

### 2.10 `EmptyState` (novo, hoje texto solto)
- **Props:** `categoryLabel`, `onCreatePress`.
- **Estados:** único (sem variantes de estado — é ele mesmo um estado de
  outro componente).
- **Tokens:** `color.text.primary`, `type.body`, botão interno =
  `AdminButtonPrimary`, ícone opcional em `palette.magenta`
  (`primaryLight`) baixo contraste intencional.
- **A11y:** texto real (não imagem) para o leitor de tela, botão "Novo
  item" com mesmo contrato de `AdminButtonPrimary` (foco, alvo ≥44px).

### 2.11 `SkeletonRow` (existente)
- **Props:** `count?` (linhas fantasma por categoria, 3–4 default).
- **Estados:** único (estado de carregamento).
- **Tokens:** `color.surface.admin.canvas` a 0.6 opacidade, `radius.control`,
  altura fixa 52.
- **A11y:** `aria-busy="true"` no container pai, `role="status"` com texto
  visualmente oculto ("Carregando lista") para leitor de tela — hoje só
  visual, sem anúncio (achado a confirmar com `audit-design`).

### 2.12 `DestructiveConfirmButton` (padrão de interação, reaproveita 2.4)
- **Props:** `itemLabel` (1 item) | `count` + `categoryLabel` (massa),
  `step: 1 | 2`, `onConfirm`.
- **Estados:** passo 1 (rótulo normal) → passo 2 (rótulo com consequência
  real, cor mantém `danger`).
- **Tokens:** mesmos de `AdminButtonDestructive` (2.4) + `type.hint` para
  texto de apoio abaixo (massa, N≥2) — **copy pendente de validação do
  Head, ver M7**.
- **A11y:** mudança de rótulo no passo 2 deve ser anunciada
  (`aria-live="polite"` no container do botão, não só troca visual de
  texto), nunca depender de duplo-clique cronometrado (cada passo é uma
  interação discreta do usuário).

### 2.13 `ImportMappingModal` (existente, revisão interna do chip 2.5)
- **Props:** `columns: string[]`, `targetFields: string[]`,
  `mapping: Record<string,string|null>`.
- **Estados:** herda de `ColumnMappingChip` (default/selecionado/ignorada).
- **Tokens:** `radius.container`, `color.surface.admin.card`,
  `space.inset.card`; chips internos = 2.5.
- **A11y:** `role="dialog"` com `aria-modal="true"`, foco preso dentro do
  modal (focus trap), `Esc` fecha, foco retorna ao elemento que abriu o
  modal ao fechar.

### 2.14 `OverviewCategoryGrid` (novo, desktop ≥960px)
- **Props:** `categories: {title, items}[]`.
- **Estados:** grid 2 colunas (desktop), coluna única (mobile/tablet —
  mesmo componente, muda só o layout via breakpoint, não uma variante
  separada).
- **Tokens:** `space.stack.section` (gap entre blocos = `space.16`/`md`
  conforme `03 §2.3`, não `lg` — conferir contra `03` antes do encode:
  o `03 §2.3` diz "Gap entre blocos: spacing.md"), `type.sectionTitle`,
  `color.surface.admin.card` por bloco.
- **A11y:** cada bloco de categoria é uma região (`role="region"`
  `aria-labelledby` apontando para o `overviewGroupHeader`), itens dentro
  navegáveis por teclado em ordem de leitura (linha a linha, não
  coluna-a-coluna do grid visual).

---

## 3. Estratégia de versionamento e migração

### 3.1 Princípio

`AdminScreen.tsx` hoje consome `colors.x`/`fonts.x`/`spacing.x` **diretos**
(camada 1/física). Introduzir a camada semântica (§1.2) sem quebrar esse
consumo é possível porque **os valores não mudam** (exceto os itens M1–M7
de §1.4, que são correções, não a introdução dos tokens em si) — só o
nome pelo qual o componente pede o valor muda.

### 3.2 O que é aditivo (não quebra nada)

- Criar o arquivo de tokens semânticos (ex.: `app/src/theme/semanticTokens.ts`)
  que **reexporta/mapeia** valores de `tokens.ts`, sem alterar `tokens.ts`.
  Isso é 100% aditivo: nenhum consumidor existente quebra, porque
  `tokens.ts` continua exatamente como está.
- Criar os 14 componentes do inventário (§2) consumindo a camada semântica,
  como arquivos novos em `app/src/components/admin/`. Também aditivo — não
  toca em `AdminScreen.tsx`.

### 3.3 O que é breaking (precisa de decisão explícita/sequenciamento)

- **Migrar `AdminScreen.tsx` para consumir os componentes novos** em vez
  do JSX/estilo inline atual — é uma reescrita de arquivo grande, com
  risco de regressão visual se feita de uma vez. Recomendação: migração
  incremental por bloco funcional (ex.: primeiro botões, depois inputs,
  depois cards) com validação visual a cada passo, não um PR único.
- **Aplicar M1–M7 (§1.4)** — mudam métricas visuais/semânticas
  observáveis (fontes maiores realocam layout, cor de botão primário
  muda). Tecnicamente "breaking" para quem já viu a tela do jeito atual
  (o Head), mesmo sendo correção de conformidade — por isso listadas
  para aprovação explícita antes do encode, não aplicadas tacitamente
  junto com a criação dos componentes.
- **Promover `ADMIN_BG`/`ADMIN_SURFACE`** (hoje só em `AdminScreen.tsx`,
  fora de `tokens.ts`) para `color.surface.admin.canvas`/`.card` no
  arquivo central de tokens — tecnicamente aditivo em `tokens.ts` (nova
  export), mas exige decidir se `ADMIN_BG`/`ADMIN_SURFACE` continuam
  vivendo em `AdminScreen.tsx` (duplicado) ou são movidos — recomendo
  mover para `tokens.ts` e `AdminScreen.tsx` importar de lá, eliminando a
  duplicação de fonte da verdade. **Trade-off para o Head:** mover exige
  tocar `AdminScreen.tsx` (import), mesmo sem mudar valor — é o único
  ponto onde "só reorganizar" toca o arquivo de produção.

### 3.4 Sequenciamento recomendado (pós-aprovação)

1. Criar camada semântica (aditivo, zero risco).
2. Head aprova/rejeita M1–M7 explicitamente (este documento já lista as 7).
3. Construir os 14 componentes consumindo a camada semântica, com os
   valores M1–M7 já corrigidos nos componentes novos desde o início
   (evita implementar errado e corrigir depois).
4. Migrar `AdminScreen.tsx` incrementalmente para os componentes novos,
   bloco por bloco, com checagem visual a cada bloco.
5. Mover `ADMIN_BG`/`ADMIN_SURFACE` para `tokens.ts` como parte do mesmo
   PR que já toca `AdminScreen.tsx` no passo 4 (não um PR isolado só para
   isso).

### 3.5 Numeração semver do design system

- **v1.0.0** = este spec, camada semântica + 14 contratos de componente,
  valores idênticos aos primitivos atuais + M1–M7 se aprovados.
- Qualquer novo token semântico depois = **minor** (aditivo).
- Qualquer mudança de valor por trás de um token semântico já publicado
  (ex.: trocar `color.action.primary.bg` de Mulberry para outra cor no
  futuro) = **major**, porque muda a aparência de todo consumidor sem
  aviso no código — exige entrada nova em `DECISIONS.md`, como já é a
  prática do projeto para troca de paleta.

---

## 4. Plano de encode pós-aprovação (para o Head dimensionar o build)

Ordem sugerida, dividida por responsável. Nenhum destes arquivos deve ser
criado/alterado antes do gate do Head.

**`design-system-engineer`:**
1. Criar `app/src/theme/semanticTokens.ts` — mapeia §1.2/§1.3 deste
   documento para os primitivos de `tokens.ts` (import, sem duplicar
   valor).
2. Criar `app/src/components/admin/` com os 14 componentes de §2, cada um
   em arquivo próprio (`AdminButtonPrimary.tsx`, `AdminSidebar.tsx`, etc.),
   consumindo só `semanticTokens.ts`.
3. Aplicar M1–M7 (se aprovadas pelo Head) diretamente nos componentes
   novos.
4. Registrar cada componente com os estados de §2 documentados em
   comentário/JSDoc (substitui Storybook nesta fase — Storybook fica para
   quando houver mais de um consumidor real do design system, conforme
   escopo desta fase).

**`frontend-multistack`:**
5. Implementar `AdminTwoPaneLayout` e o grid responsivo de `03 §2.2`
   (breakpoints 768/960/1280/1920) como o wrapper estrutural real,
   consumindo `component.sidebar.width`/`.panelA.width`/`.panelB.maxWidth`.
6. Migrar `AdminScreen.tsx` incrementalmente (§3.4 passo 4) para os
   componentes de `admin/`, bloco por bloco: navegação (sidebar/tabs) →
   botões → inputs → cards de item → toasts/empty state → grid de
   overview.
7. Implementar `AdminToastUndo` com a lógica real de undo (decisão 4 do
   Head) — hoje não existe no código, é o maior item novo de
   comportamento (não só visual).
8. Mover `ADMIN_BG`/`ADMIN_SURFACE` para `tokens.ts` no mesmo PR do passo 6
   (§3.3).

**Validação (fora deste subagente):**
9. `digital-product-team-audit-design` valida os 6 riscos de `03 §6` +
   este documento (em especial M1–M6 aplicadas de fato, não só
   documentadas) antes de aprovar o gate final de UI.
10. `digital-product-team-audit-code` valida a11y de fato (foco, ARIA,
    alvo de toque) nos componentes novos, não só a especificação.

---

## 5. Trade-offs para decisão do Head

1. **M1–M6** (correções de fonte/cor) — aplicar tudo de uma vez no
   encode ou faseado por tela? Aplicar tudo junto é mais simples de
   revisar num único gate; faseado reduz risco de regressão visual ampla
   de uma vez. Recomendação: aplicar junto, já que são pequenas em
   contagem (6 valores) e o `03` já as tratou como piso não-negociável do
   próprio `tokens.ts`.
2. **M7** (copy de exclusão em massa) — precisa aprovação de conteúdo,
   não só de token; sinalizado por `03 §7` como pendente, reforçado aqui.
3. **Mover `ADMIN_BG`/`ADMIN_SURFACE` para `tokens.ts`** (§3.3) — único
   ponto de reorganização que toca `AdminScreen.tsx` sem mudar
   comportamento; Head decide se isso entra no mesmo PR da migração
   (recomendado) ou fica para depois.
4. **Storybook** — fora de escopo desta fase (regra explícita do
   Head/contexto da tarefa). Registrado aqui como pendência futura: se o
   design system crescer para mais de um consumidor (ex.: reaproveitar
   componentes no app público), Storybook passa a valer o custo de setup.
