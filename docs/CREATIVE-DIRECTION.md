# Direção Criativa — Mensageiros da Paz

Documento de partido estético e direção de marca do app mobile (Android/iOS)
"Mensageiros da Paz". Produzido pelo subagente `creative-direction` como
primeiro entregável do projeto, antecedendo qualquer trabalho de
`ux-architect`, `ui-designer` ou implementação. Não há briefing formal de
negócio até o momento — as interpretações abaixo são hipóteses de trabalho a
validar com o Head e, quando disponível, o cliente.

---

## 1. Interpretação do propósito/conceito

O nome "Mensageiros da Paz" sugere um app de propósito **espiritual/religioso
e comunitário**, provavelmente ligado a contextos de fé cristã (o termo
"mensageiros" evoca vocação, missão, evangelização) e ao tema recorrente da
"paz" como valor central — paz interior, paz social, mensagem de esperança.
Interpretação de trabalho:

- **Público-alvo provável:** pessoas de fé (adultos e jovens adultos),
  membros de uma comunidade religiosa ou movimento específico, voluntários
  ("mensageiros") que compartilham conteúdo inspiracional, e um público mais
  amplo em busca de conteúdo devocional/reflexivo no dia a dia.
- **Núcleo funcional provável:** devocionais diários, versículos/mensagens de
  reflexão, orações, agenda de eventos/encontros da comunidade, espaço de
  comunidade (grupos, testemunhos), talvez doações/apoio a causas de paz.
- **Valores centrais:** acolhimento, esperança, serenidade, propósito,
  simplicidade, autenticidade — não proselitismo agressivo nem
  comercialização de fé.
- **Risco a evitar:** clichê visual religioso (pombas brancas genéricas, luz
  divina em raios, tipografia gótica) que soa datado ou de baixa qualidade
  percebida. O objetivo é um app contemporâneo e sóbrio, não um produto
  "religioso genérico dos anos 2000".

Esta leitura deve ser validada assim que houver um briefing real; até lá, é a
hipótese que orienta o partido estético.

---

## 2. Voice & tone

O app fala como **um amigo presente, não como um púlpito**.

- **Tom:** calmo, acolhedor, direto, nunca grandiloquente. Frases curtas.
  Evita jargão religioso denominacional específico quando possível, para não
  excluir quem está começando a jornada de fé.
- **O que o app NUNCA faz:** pressionar, culpar, usar urgência artificial
  ("não perca!"), gamificar a espiritualidade de forma superficial (streaks
  agressivos, badges vazios), ou soar institucional/burocrático.
- **O que o app SEMPRE faz:** convida ("hoje, uma pausa para..."), reconhece
  o momento do usuário, oferece — não impõe. Linguagem de segunda pessoa,
  próxima, sem formalidade excessiva ("você" e não "o fiel" ou "o usuário").
- **Microcopy de erro/vazio:** tom gentil mesmo em falhas técnicas — nunca
  culpar o usuário; ex. "Não conseguimos carregar sua mensagem de hoje. Tente
  novamente em instantes." em vez de "Erro 404".
- Esse voice & tone deve ser formalizado em detalhe por `content-seo` no
  estágio 02–03, usando este documento como base.

---

## 3. Partido estético

### Paleta de cores

Paleta sóbria, luminosa e serena — evita o clichê "azul-branco genérico de
app religioso" e o dourado excessivo. Base neutra quente + um azul-verde
como cor de identidade (associação a céu/água/horizonte = paz), mais um tom
terroso como acento humano/orgânico.

| Papel | Nome | Hex | Uso |
|---|---|---|---|
| Primária | Azul Horizonte | `#3A5A6B` | Ações primárias, ícones de marca, headers |
| Primária clara | Azul Névoa | `#8FB5BE` | Estados hover/secundários, ilustrações |
| Fundo base | Areia Suave | `#F7F3EC` | Fundo padrão (light mode), respiro visual |
| Fundo alternativo | Off-white Papel | `#FDFBF7` | Cards, superfícies elevadas |
| Acento cálido | Terracota Suave | `#C97B5A` | CTAs de destaque, badges, momentos especiais |
| Neutro escuro | Grafite Suave | `#2E2A26` | Texto principal (nunca preto puro) |
| Neutro médio | Cinza Pedra | `#8A8378` | Texto secundário, legendas |
| Sucesso/positivo | Verde Oliva Suave | `#7A8B6F` | Confirmações, conteúdo "concluído" |
| Dark mode base | Azul-Noite | `#1B2428` | Fundo dark mode |

Regra: nunca preto puro (#000) nem branco puro (#FFF) — reforça a suavidade
tátil da marca. Evitar dourado brilhante, vermelho de alerta genérico e
gradientes saturados tipo "app de meditação corporativo".

### Tipografia sugerida

- **Display/títulos:** uma serifada humanista contemporânea, com leveza
  espiritual sem ser ornamental — ex. referência de família: *Fraunces*,
  *Lora* ou *Source Serif 4*. Transmite acolhimento e tradição sem pesar.
- **Corpo de texto/UI:** sans-serif humanista de alta legibilidade em telas
  pequenas — ex. referência: *Inter*, *Manrope* ou *Public Sans*. Boa
  performance em mobile, suporte a acentuação em português.
- Escala tipográfica generosa, espaçamento de linha confortável (>1.4) —
  contexto de leitura devocional pede conforto, não densidade de informação.
- `ui-designer` e `design-system-engineer` devem confirmar licenciamento e
  disponibilidade das famílias exatas (Google Fonts recomendado para custo
  zero e cobertura de idioma).

### Linguagem visual

- **Partido geral:** minimalista, orgânico, sereno — não corporativo/frio
  nem místico/exagerado. Pensar "papelaria de qualidade + app de bem-estar
  contemporâneo", não "vitral de igreja".
- **Formas:** cantos arredondados suaves (não excessivamente lúdicos),
  composições com bastante espaço em branco/negativo, hierarquia calma.
- **Ilustração/imagética:** preferir ilustração vetorial simples e
  metáforas de luz, horizonte, mãos, caminho, natureza (céu, água, folhas)
  em vez de simbologia religiosa explícita e datada. Fotografia, se usada,
  deve ser naturalista e diversa (não estoque genérico de "pessoas
  sorrindo olhando para cima").
- **Motion (para `motion-designer`):** transições suaves e lentas,
  nunca abruptas ou "gamificadas"; fade e easing orgânico refletem calma.
- **Referências de mood (direção, não fontes literais):** apps de
  bem-estar/mindfulness premium (ex. Calm, Headspace) pelo cuidado com
  ritmo e espaço — porém com paleta mais terrosa/menos clínica; editoriais
  de papelaria/tipografia contemporânea para a sensação de "objeto de
  qualidade"; luz natural do amanhecer/entardecer como referência cromática.

---

## 4. Princípios de marca / diretrizes para os próximos agentes

1. **Silêncio visual é uma feature.** Nunca lotar a tela. Cada elemento a
   mais deve justificar sua presença contra o valor "paz".
2. **Acessibilidade não é opcional aqui.** Contraste AA mínimo mesmo com a
   paleta suave (validar Azul Horizonte sobre Areia Suave e variações);
   texto legível para público de todas as idades, incluindo usuários mais
   velhos — fonte-base não menor que 16px, toques com área mínima 44x44.
3. **Sem clichê religioso datado.** Nada de pomba genérica, raios de luz
   estourados, gradiente "céu dourado". Se símbolo religioso for necessário,
   tratar com minimalismo e uma única cor de traço.
4. **Consistência de tom em toda a copy.** Qualquer texto de erro, loading,
   notificação push ou onboarding segue o voice & tone da seção 2 — validar
   com `content-seo`.
5. **Dark mode é cidadão de primeira classe**, não inversão automática —
   usar a paleta dark definida (`#1B2428` como base), mantendo a mesma
   sensação de serenidade.
6. **Multiplataforma coerente.** `mobile-crossplatform` deve preservar a
   linguagem visual entre iOS e Android sem forçar 100% dos padrões nativos
   de cada SO quando eles conflitarem com o partido estético (ex.: preferir
   tipografia e paleta da marca a Material/Cupertino defaults, mas respeitar
   convenções de navegação e gestos nativos por usabilidade).
7. **Nenhuma decisão de negócio foi validada ainda.** Este documento parte
   de uma interpretação do nome do app. `ux-architect` deve buscar validar
   escopo funcional real com o Head antes de aprofundar fluxos.

---

## 5. Próximos passos recomendados no pipeline

Conforme `DIGITAL-PRODUCT-TEAM.md`, o fluxo correto a partir daqui é:

1. **Head** — validar/complementar o briefing (estágio 00): confirmar com o
   usuário se a interpretação religiosa/espiritual está correta, contexto
   institucional (igreja/movimento específico?), funcionalidades essenciais,
   prazo e restrições de stack antes de aprofundar.
2. **`ux-architect`** (estágio 01) — descoberta e arquitetura: sitemap,
   fluxo de navegação e inventário de conteúdo a partir da hipótese de
   produto descrita na seção 1, sujeito à validação do Head.
3. **`ui-designer`** (estágio 02, em conjunto com este documento e
   `ux-architect`) — traduzir a paleta, tipografia e linguagem visual acima
   em tokens de design e protótipo navegável.
4. **`motion-designer`** (estágio 02) — aplicar os princípios de motion
   (transições suaves/orgânicas) aos componentes interativos.
5. **`content-seo`** — formalizar o voice & tone em um guia de copy
   detalhado, cobrindo microcopy, notificações e onboarding.
6. Gate de Design só deve ser liberado pelo Head quando protótipo, tokens e
   notas de a11y estiverem alinhados com este documento.
