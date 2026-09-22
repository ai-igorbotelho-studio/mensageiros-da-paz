# Arquitetura de UX — Painel Admin (`/admin`)

Documento do subagente `ux-architect`, estágio de Descoberta & Arquitetura
para o painel administrativo, construído sobre `design/00-experience-vision.md`
(conceito "mesa de trabalho sacristã", 3 princípios) e
`design/01-creative-direction-admin.md` (partido estético + voice & tone).
Baseado no fluxo real hoje implementado em `app/src/screens/AdminScreen.tsx`
(2395 linhas). Escopo: **fluxo e hierarquia de informação**, não estética —
cor/tipografia/espaçamento fino é tarefa de `ui-designer`; grid responsivo em
CSS é tarefa de `frontend-multistack`, a partir da estrutura recomendada
aqui (seção 4).

---

## 1. Mapa de navegação e estados

### 1.1 Árvore de navegação atual

```
/admin
 ├─ [não autenticado] → Tela de login
 │    estados: carregando sessão · formulário · erro de credencial
 │
 └─ [autenticado] → AdminDashboard
      ├─ Aba: Prática da Semana
      │    estados: carregando · formulário preenchido · salvando (implícito,
      │              sem estado próprio hoje) · salvo (toast) · erro (toast)
      │
      ├─ Aba: Biblioteca
      │    ├─ Biblioteca completa (default ao entrar)
      │    │    estados: carregando (skeleton) · 4 grupos recolhidos (default)
      │    │              · grupo expandido · vazio por categoria
      │    ├─ Categoria específica (escolhida via chip)
      │    │    estados: carregando (skeleton) · lista vazia · lista com itens
      │    │              · item expandido (accordion) · edição de item aberta
      │    │              · modo seleção ativo · confirmação de exclusão (1 item)
      │    │              · confirmação de exclusão em massa (N itens) · apagando
      │    └─ Modal de Importar planilha (sobreposto, qualquer sub-estado acima)
      │         estados: lendo planilha · erro de leitura · mapeamento de colunas
      │                   · seleção de linhas · importando · resultado (resumo)
      │
      └─ Aba: Guia do Admin
           estado único: conteúdo estático embutido + link "abrir em nova aba"
```

### 1.2 Observação de arquitetura

A Biblioteca concentra sozinha 90% dos estados possíveis do painel (14 dos
~20 listados acima) porque hoje ela empilha **quatro responsabilidades**
na mesma aba: (a) visão geral multi-categoria, (b) lista de uma categoria,
(c) formulário de criar/editar, (d) importação em massa. Isso é aceitável
como decisão deliberada do Head ("Novo item" foi absorvido de propósito, ver
comentário em `AdminScreen.tsx:170-175`), mas tem custo de estado: qualquer
mudança de contexto (trocar categoria, abrir edição, abrir seleção) precisa
resetar manualmente ~8 variáveis de estado (`goToAdminHome`, linhas 438-452,
e o `useEffect` de troca de categoria, linhas 413-431) — sinal de que a aba
"Biblioteca" é hoje uma máquina de estados única fazendo o trabalho de 3
telas. Não é bug, é dívida de arquitetura de informação: cresce o risco de
um reset esquecido (ex.: seleção múltipla sobrevivendo a uma troca de
categoria) a cada novo estado adicionado.

**Recomendação:** manter a decisão do Head (fluxo único, sem tela separada
de item — ver princípio Notion "editar inline" em `00-experience-vision.md`
§2), mas tratar a Biblioteca internamente como uma **máquina de estados
explícita de 3 modos mutuamente exclusivos**: `overview | list | editing`,
com `importing` como overlay independente de qualquer modo. Isso já é quase
o comportamento real hoje — falta nomear e centralizar o reset num único
lugar (hoje distribuído em `goToAdminHome`, no `useEffect` de `category`, e
em pontos soltos como `closeImport`/cancelamento do form). É recomendação de
estrutura interna, não muda a experiência do Head.

---

## 2. Hierarquia de ação por tela

### 2.1 Login
- **Primária:** Entrar.
- **Secundária:** Mostrar/ocultar senha.
- Sem ruído — hierarquia já está correta, nenhuma ação a mais compete.

### 2.2 Aba Prática da Semana
- **Primária:** Salvar.
- **Secundária:** Índice de Práticas (planilha) → (link externo, apoio).
- **Terciária:** campo "Inspiração" (opcional, uso interno).
- Hierarquia correta hoje: um único CTA primário, sem competição de cor.

### 2.3 Aba Biblioteca — Biblioteca completa (overview)
- **Primária:** abrir uma categoria (toque no título do item ou botão "↗").
- **Secundária:** expandir/recolher grupo (accordion).
- **Problema concreto:** os dois toques — "expandir lista" (ação de
  inspeção) e "ir para a categoria" (ação de navegação/trabalho) — estão
  lado a lado no mesmo cabeçalho com pesos visuais próximos (círculo "↗" vs.
  chevron "›", `AdminScreen.tsx:960-992`). Pela lei de Hick, dois alvos
  próximos com significados distintos e semelhança visual aumentam erro de
  toque, especialmente em mobile (área de toque mínima 44px já é respeitada,
  mas a *distinção de intenção* entre os dois não é imediatamente óbvia sem
  ler o rótulo de acessibilidade). Recomendação: um dos dois deveria ser a
  ação primária do cabeçalho inteiro (hoje ambíguo qual é); o outro vira
  ação secundária deslocada (ex.: só o texto/ícone do item individual leva
  à categoria; o cabeçalho inteiro só expande/recolhe). **Decisão de UX,
  não visual — precisa validação do Head antes do `ui-designer` desenhar.**

### 2.4 Aba Biblioteca — categoria específica (lista)
- **Primária:** Publicação manual (criar item) — hoje é uma seção recolhida,
  **abaixo** de toda a lista de itens e do bloco de seleção/exclusão em
  massa (`AdminScreen.tsx:1240-1259`). Problema concreto: em uma categoria
  com muitos itens, a ação mais comum de um CMS de conteúdo (criar/adicionar
  novo item) é a que exige mais scroll para alcançar — o oposto do
  esperado. Ghost Admin e Notion colocam "criar" no topo/fixo, não no fim de
  uma lista variável.
- **Secundária:** Importar da planilha; Índice da categoria (planilha).
- **Terciária:** Selecionar itens para apagar (ação de manutenção, uso
  esporádico) — está corretamente no fim da lista, isso está certo.
- Dentro de cada item (accordion expandido): Editar e Excluir têm o
  **mesmo peso visual de link de texto** (`styles.link` vs `styles.linkDanger`,
  linhas 1139-1158) ao lado de Mover ↑/↓. Quatro ações lado a lado sem
  hierarquia de peso (reordenar, editar, excluir) força o admin a ler texto
  para diferenciar risco, em vez de reconhecer por posição/peso — o botão
  destrutivo deveria ter afastamento espacial adicional do bloco de
  reordenar/editar (já existe `accordionActionsSpacer`, o que é um bom
  começo; falta reforço de hierarquia, tarefa de `ui-designer`).
- **Problema concreto de densidade:** o formulário de "Publicação manual"
  quando aberto (linhas 1263-1509) empurra a tela para ~4 cards empilhados
  (Identificação, Conteúdo, Publicação) + toda a lista de itens acima —
  ninguém vê o botão "Adicionar item" sem rolar por múltiplas seções. Ver
  fluxo crítico (a) na seção 3 para recomendação de correção.

### 2.5 Modal de importação
- **Primária:** Importar (dentro do fluxo, ao final do mapeamento).
- **Secundária:** mapear colunas, selecionar linhas.
- **Terciária:** Fechar.
- Hierarquia aceitável, mas o mapeamento de colunas usa o mesmo componente
  visual (`categoryChip`) tanto para "isto é uma opção de categoria" (uso
  normal do painel) quanto para "isto é uma coluna da planilha mapeada para
  um campo" (uso técnico, com estado de "já mapeada" vs "ignorada") — dois
  significados diferentes reaproveitando o mesmo padrão visual de chip pode
  confundir por semelhança (Jakob's Law funciona a favor da familiaridade,
  mas aqui o *significado* do chip muda de contexto sem nenhum sinal
  adicional). Recomendação: o `ui-designer` deve diferenciar visualmente
  "chip de escolha" (categoria, tipo de arquivo) de "chip de mapeamento de
  coluna" (com valor emparelhado, ex. "Coluna A → Título").

---

## 3. Fluxos críticos — passo a passo, fricção e melhoria

### (a) Criar/editar item
**Fluxo atual:** Biblioteca → escolher categoria → rolar até o fim da lista
→ abrir "Publicação manual" → preencher 3 blocos de campos condicionais
(Identificação, Conteúdo, Publicação) → Salvar/Adicionar.

**Fricção:**
1. Para criar, o admin precisa primeiro estar dentro de uma categoria
   específica (não existe "criar item" a partir da Biblioteca completa) —
   correto no espírito de "cada categoria tem seu form", mas obriga um
   passo de navegação a mais (sair do overview) mesmo quando a intenção já
   é clara.
2. O formulário de criação está posicionado **depois** da lista de itens
   existentes — em uma categoria com 30+ itens, a ação de criar fica a
   dezenas de scrolls de distância do ponto de entrada da aba.
3. Campos condicionais (upload vs. streaming; pdf/image/audio/gdoc/txt) são
   corretos em princípio (só mostrar o que é relevante, padrão Sanity
   Studio citado em `00-experience-vision.md`), mas hoje toda a
   ajuda contextual por tipo de arquivo aparece como texto corrido
   (`fieldHint`) sem hierarquia visual de "isto é aviso, isto é instrução,
   isto é obrigatório vs. opcional" — 3 blocos de hint de texto consecutivos
   (audio, drive, gdoc, txt) competem pela mesma atenção.
4. Editar (`startEdit`) reaproveita corretamente o mesmo formulário — bom,
   evita uma segunda tela — mas ao editar o formulário aparece na mesma
   posição (fim da lista), então editar o primeiro item da lista ainda
   exige rolar para baixo até o form, editar, e depois rolar de volta para
   ver o resultado na lista.

**Melhoria recomendada:**
- Mover "Publicação manual" (renomear para "Novo item", mais direto — ver
  voice & tone) para **logo abaixo do cabeçalho da categoria**, antes da
  lista, como ação primária sempre visível/alcançável no topo — não como
  seção recolhida no fim. Trade-off: aumenta a distância até o primeiro
  item da lista existente; mitigar mantendo o form recolhido por padrão
  (como hoje), só reposicionado.
- Ao editar um item específico, abrir o formulário **inline logo abaixo do
  próprio item** (like Notion property edit) em vez de sempre no mesmo
  ponto fixo da tela — evita o salto de contexto de "editei o item 2, mas o
  formulário abriu lá embaixo".
- Agrupar hints de campo condicional sob um único bloco "Sobre este tipo de
  arquivo" com ícone de informação padronizado, não um parágrafo solto por
  condição.

### (b) Importar planilha
**Fluxo atual:** dentro de uma categoria → "Importar da planilha" → modal
abre e já faz fetch automático → mapear colunas (chip cicla por 8 opções em
sequência fixa) → revisar linhas selecionadas → Importar → resultado.

**Fricção:**
1. `cycleMapping` (linha 667) avança a opção de campo **em ciclo linear**
   (ignore → title → description → text → ... → order → ignore). Corrigir
   um mapeamento errado do 7º campo para o 2º exige até 7 toques
   sequenciais no mesmo chip — não há seleção direta (ex. dropdown/menu).
   Fricção alta para uma ação de configuração que pode acontecer em toda
   categoria com muitas colunas.
2. Não há preview do resultado do mapeamento em linha antes de confirmar —
   o admin mapeia "às cegas" (o nome do campo aparece no chip, mas não o
   dado real da primeira linha ao lado, para validar visualmente que
   "Coluna C" realmente é "Descrição").
3. Erro de leitura da planilha (compartilhamento incorreto) é a única
   mensagem de erro tratada — não há distinção entre "planilha vazia",
   "planilha sem cabeçalho reconhecível" e "erro de rede", todos caem no
   mesmo texto genérico de "confira o compartilhamento" (linhas 649-651),
   podendo levar o admin a mexer numa permissão que já está correta.

**Melhoria recomendada:**
- Trocar o ciclo de chip por um seletor direto (toque no cabeçalho da
  coluna abre lista das 8 opções, escolha direta) — reduz fricção de N
  toques para 2.
- Mostrar o valor da primeira linha de dado ao lado do rótulo do campo
  mapeado, mesmo que compacto ("Título: 'Guerreiro do Bem'") — permite
  validação visual sem abrir a planilha original.
- Diferenciar mensagens de erro por causa (vazio vs. permissão vs. rede),
  cada uma com a instrução certa (sem jargão técnico, conforme voice&tone).

### (c) Exclusão em massa com reversibilidade
**Fluxo atual:** dentro de uma categoria → "Selecionar itens para apagar" →
modo seleção ativa (checkbox por item) → marcar itens → "Apagar
selecionados (N)" → confirmação inline no próprio botão ("Confirmar: apagar
N item(ns)?") → segundo toque executa.

**Avaliação:** este é o fluxo **mais alinhado** ao princípio 3 de
`00-experience-vision.md` (fricção proporcional ao risco) — dois passos
explícitos, contagem real no botão, sem modal genérico. Já segue o padrão
Stripe citado como referência.

**Fricção residual:**
1. **Reversibilidade real é zero** — não existe undo, nem lixeira temporária,
   nem confirmação por digitação para N grande. A confirmação em duas
   etapas mitiga erro de clique, mas não mitiga erro de julgamento
   (selecionar os itens errados e confirmar com convicção). Para exclusões
   de N alto (ex. >10), a fricção deveria escalar mais — hoje o segundo
   toque tem o mesmo custo seja N=2 ou N=50.
2. A confirmação usa o mesmo botão que dispara a ação (o texto muda, a
   posição não) — funcional, mas o texto de confirmação ("Confirmar: apagar
   N item(ns)?") ainda usa reticências/interrogação onde a direção
   criativa pede afirmação concreta do que vai acontecer ("Isso vai apagar
   N itens de {categoria}. Não dá para desfazer.", conforme
   `00-experience-vision.md` princípio 3) — hoje a consequência
   "não dá pra desfazer" **não aparece em nenhum lugar do fluxo real**, só no
   documento de visão. É desalinhamento entre o texto planejado e o
   implementado.

**Melhoria recomendada (necessita decisão do Head):**
- Adicionar a frase de consequência ("Não dá para desfazer") como texto de
  apoio visível junto ao botão de confirmação, não só dentro do rótulo do
  botão.
- **Trade-off a decidir com o Head:** implementar undo temporário (ex. toast
  com "Desfazer" por 5-8s antes da exclusão real no Firestore) versus manter
  a exclusão imediata e irreversível com fricção textual reforçada. Undo
  temporário é mais seguro mas exige mudança de arquitetura de dados
  (soft-delete ou delay); fora do escopo puramente de UX — sinalizar para
  Head decidir antes de `frontend-multistack`/backend implementarem.

### (d) Login
**Fluxo atual:** e-mail + senha → Entrar → erro genérico "E-mail ou senha
incorretos" em caso de falha.

**Avaliação:** fluxo correto e mínimo para 1 usuário administrador único —
não há necessidade de fluxo de recuperação de senha na UI (Firebase Console
resolve isso fora do app, consistente com "não é um produto multi-usuário").
Sem fricção relevante a corrigir; manter como está.

---

## 4. Recomendação de layout responsivo (estrutura, não CSS)

Hoje `AdminScreen.tsx` é uma coluna única sem `max-width`, usada tanto em
mobile quanto em desktop web — em telas largas isso produz linhas de
formulário/texto esticadas além do confortável (ruim para legibilidade,
apesar da fonte mínima 17px já ser respeitada) e desperdiça a maior vantagem
do desktop: mais espaço simultâneo para "ver a lista e editar ao mesmo
tempo", que é exatamente o modelo mental de quem faz gestão de conteúdo
(Notion, Ghost Admin, Sanity Studio — todas usam lista+detalhe lado a lado
em telas largas).

### Estrutura recomendada por breakpoint

**Mobile / tablet estreito (320–959px) — mantém o padrão atual:**
Uma coluna, abas no topo, formulário de edição abre inline abaixo do item
(ou expande a seção de criação), como já é hoje. Não requer mudança
estrutural.

**Desktop largo (960–1920px) — introduz layout de trabalho em 2 painéis:**
```
┌─────────────────────────────────────────────────────────────┐
│ Cabeçalho (Painel administrativo · Logado como · Sair)       │
├───────────────┬─────────────────────────────────────────────┤
│  Abas          │                                              │
│  (vertical,    │                                              │
│  lateral, não  │                                              │
│  topo — ver    │                                              │
│  trade-off §5) │                                              │
├───────────────┼─────────────────────────────────────────────┤
│ PAINEL A       │ PAINEL B                                     │
│ Lista/         │ Editor / detalhe                             │
│ Overview       │ (form de criar/editar item, ou               │
│ (~35-40%       │  formulário da Prática da Semana,             │
│  largura,      │  ou conteúdo do Guia)                        │
│  scroll        │ (~60-65% largura, largura máxima de           │
│  próprio)      │  leitura ~720px dentro do painel — não        │
│                │  esticar inputs até a borda da tela)          │
└───────────────┴─────────────────────────────────────────────┘
```

Regras estruturais para `frontend-multistack` implementar:
- **Lista sempre visível, editor aparece ao lado, não substitui a lista.**
  Selecionar um item no Painel A popula o Painel B — elimina o problema de
  "form no fim de uma lista longa" descrito na seção 3(a): em desktop o
  form nunca fica fora da viewport em relação à lista.
  Isso é responsabilidade *estrutural*, mas depende de uma correção que já
  vale para mobile também — ver seção 3(a).
- **Largura máxima de leitura no Painel B:** inputs de texto/textarea não
  devem esticar até a borda do painel em telas muito largas (>1400px) —
  travar em torno de 640-720px de largura de conteúdo dentro do painel,
  mesmo que o painel em si seja mais largo, para manter legibilidade de
  formulário longo (alinhado ao princípio Sanity Studio citado na visão).
- **Ações fixas:** em telas com lista longa, o botão "Novo item" (ação
  primária da categoria) deve ficar ancorado no topo do Painel A, sempre
  visível sem scroll — não dentro do fluxo de scroll da lista. Ações
  destrutivas em massa (barra de seleção) podem ficar fixas no rodapé do
  Painel A quando o modo seleção está ativo, para não exigir rolar até o
  fim para confirmar/cancelar.
- **Biblioteca completa (overview) em desktop largo:** pode usar o espaço
  extra para mostrar as 4 categorias em grid de 2 colunas em vez de lista
  vertical única — reduz scroll para ver o panorama completo. Isso é
  mudança estrutural leve (grid vs. lista), não visual.
- **Import da planilha continua como modal/overlay em qualquer largura** —
  é uma tarefa pontual e concentrada, não se beneficia de layout lado a
  lado; manter como está estruturalmente, só ajustar largura máxima do
  modal em telas grandes (não ocupar 100% da largura em 1920px).

---

## 5. Trade-offs abertos — decisão do Head

1. **Abas no topo (atual) vs. sidebar lateral em desktop.** A estrutura de
   2 painéis proposta (seção 4) funciona com abas no topo mantidas ou com
   uma sidebar vertical à esquerda (Prática/Biblioteca/Guia empilhados,
   estilo Notion). Sidebar aproveita melhor a largura extra do desktop e
   deixa mais altura útil para os painéis A/B; abas no topo mantêm
   consistência de código entre mobile e desktop (menos variação
   estrutural). **Recomendação do ux-architect:** sidebar em desktop, abas
   em mobile — mas é mudança de padrão de navegação, não só CSS, e precisa
   aprovação do Head antes do `ui-designer` desenhar em alta fidelidade.

2. **Inline edit (atual) vs. tela/painel dedicado para o formulário.** A
   decisão de manter o formulário de item dentro da mesma aba Biblioteca
   (sem tela separada) já foi tomada pelo Head (comentário em
   `AdminScreen.tsx:170-175`) e este documento a mantém. Mas em desktop,
   com o layout de 2 painéis, "inline" passa a significar "painel lateral
   dedicado", que é estruturalmente parecido com "tela separada" só sem
   navegação de rota. Vale confirmar com o Head que essa leitura está
   correta antes de travar em alta fidelidade.

3. **Undo temporário vs. exclusão imediata irreversível com fricção
   textual reforçada** (detalhado na seção 3c). Tem impacto de arquitetura
   de dados (soft-delete), não é decisão só de UX.

4. **Posição da ação "Novo item"** — mover para o topo da categoria (recomendação
   desta seção 3a) muda um padrão que o Head já ajustou/aprovou
   recentemente (comentários no código mostram histórico de mudanças
   pedidas pelo Head sobre esse exato fluxo, ex. "Novo item" virou
   "Publicação manual" a pedido dele). Qualquer reposicionamento precisa
   passar por validação explícita, não é ajuste unilateral do pod.

5. **Overview em grid 2 colunas em desktop** (seção 4) — muda a hierarquia
   visual do panorama de categorias; validar que não introduz a sensação de
   "dashboard de métricas" que a visão de experiência proíbe explicitamente
   (`00-experience-vision.md` §3, "não é um dashboard de BI") — um grid de
   4 blocos pode parecer cards de KPI se o `ui-designer` não tratar com
   cuidado (cada bloco deve continuar sendo lista acionável, não número
   decorativo).

---

## 6. Entregável e próximos passos

Este documento é o esqueleto de UX que `digital-product-team-ui-designer`
veste em alta fidelidade (paleta, tipografia, espaçamento fino, tratamento
visual dos estados) e que `digital-product-team-frontend-multistack`
implementa como grid responsivo real (320-1920px), a partir da estrutura de
2 painéis descrita na seção 4. Os 5 trade-offs da seção 5 precisam de
decisão do Head antes do gate de alta fidelidade ser fechado — em especial
o trade-off 1 (sidebar vs. abas), que muda a base de todo o layout desktop.
