# Visão de Experiência — Painel Admin (Mensageiros da Paz)

Escopo: só `/admin` (AdminScreen.tsx — Prática, Biblioteca, Guia). Não é o
app público. Documento de conceito, anterior a UX/UI — orienta
`ux-architect` e `ui-designer` do pod Interactive.

---

## 1. Conceito em uma frase

**O admin é uma mesa de trabalho sacristã** — um lugar sóbrio, rápido e
confiável onde quem cuida do conteúdo trabalha com as mãos, não uma vitrine
que precisa impressionar quem entra. Aqui a interação existe para reduzir
erro e ansiedade de quem administra sozinho um acervo real (planilhas,
links de Drive, exclusões permanentes) — nunca para demonstrar
sofisticação técnica.

### 3 princípios de experiência

1. **Confiança sobre encanto.** Toda interação prioriza "o admin sabe
   exatamente o que vai acontecer antes de clicar" acima de qualquer
   efeito bonito. Zero motion decorativo sem função de estado.
2. **Clareza de estado, sempre visível.** Salvando, salvo, erro, sincronizado
   com a planilha, publicado vs. rascunho — o estado do sistema nunca fica
   implícito nem depende do admin adivinhar se algo funcionou (o app já
   sofreu bug real de "parecia não estar salvando" — DECISIONS.md
   2026-09-21). Feedback imediato e explícito é requisito, não polish.
3. **Reversibilidade e fricção proporcional ao risco.** Ações destrutivas
   (apagar item, apagar todos de uma categoria) exigem confirmação em duas
   etapas e linguagem que descreve a consequência real ("Apagar todos de
   Músicas (7)"), nunca um simples "Tem certeza?". Ações rotineiras (editar
   texto, marcar publicado) devem ser as mais rápidas e de menor fricção
   possível — não pagamos o mesmo pedágio de cautela em tudo.

---

## 2. Barra de referência — o que puxar de cada uma

| Referência | O que puxar, especificamente |
|---|---|
| **Linear** | Densidade de informação calma: listas com hierarquia tipográfica clara sem grade pesada; estados de loading/salvo como micro-indicador discreto (não spinner de tela cheia); atalhos de teclado para quem usa o painel com frequência (busca, navegação entre abas). |
| **Notion** | Padrão de "propriedade editável inline" (clicar no campo, editar no lugar, sem modal separado para tudo) — reduz saltos de contexto ao editar um item da Biblioteca. Também: sidebar/abas persistentes e previsíveis (aqui: Prática/Biblioteca/Guia). |
| **Ghost Admin** | Tom editorial sério aplicado a um painel de conteúdo — distinção visual clara entre "publicado" e "rascunho" (cor/etiqueta, não só texto), pensado para quem gerencia texto/mídia, não dados tabulares genéricos. É a referência mais próxima do caso de uso real (CMS de conteúdo devocional). |
| **Sanity Studio** | Como formulários de conteúdo longo (textos de oração, links de Drive, campos opcionais) se organizam sem virar uma parede de inputs — agrupamento por relevância, campos condicionais que só aparecem quando fazem sentido (ex. aviso de Drive só quando categoria = Áudio, já existente no app). |
| **Stripe Dashboard** (bônus, não pedido mas relevante) | Diálogo de confirmação de ação destrutiva com o dado real da consequência embutido no botão ("Apagar 7 itens"), não um alerta genérico — já é o padrão que o botão "Apagar todos" do AdminScreen tenta seguir; formalizar isso como convenção para toda ação destrutiva do painel, não só essa.

Uso pretendido: nenhuma dessas referências deve ser copiada visualmente
(paleta/tipografia do admin seguem os tokens Goethe já definidos em
`tokens.ts`) — o que se importa é o *comportamento* e a *hierarquia de
atenção*, adaptados à paleta e fontes (Lora/Lexend) já estabelecidas.

---

## 3. O que o admin NÃO deve ser (anti-referências)

- **Não é um dashboard de métricas/BI.** Nada de gráficos, KPIs, cards de
  "número de itens" decorativos sem ação associada — o admin gerencia
  conteúdo, não analisa dados.
- **Não é o app público disfarçado.** Evitar herdar a linguagem
  contemplativa/serena da Home (respiro generoso, motion lento) de forma
  acrítica — aqui o admin precisa de velocidade de tarefa, não de uma pausa
  devocional. É a mesma família visual, com ritmo diferente.
- **Não é um site institucional "religioso genérico".** Sem ornamento
  litúrgico, sem ícones de vitral, sem dourado — o painel de trabalho é
  neutro e funcional dentro da paleta da marca, sem simbolismo explícito.
- **Não é um construtor de página tipo Wix/Squarespace com dezenas de
  opções.** O admin tem um operador só (o Head/voluntários de confiança) —
  não precisa de customização visual, temas, ou flexibilidade genérica.
  Cada tela resolve um fluxo específico e conhecido.
- **Não esconde nem disfarça ação irreversível atrás de ícone sutil.**
  Nada de "lixeira minimalista cinza quase invisível" que se clica sem
  querer — o oposto do princípio 3.

---

## 4. Tom emocional

**Sério mas acolhedor — tom de sacristia, não de escritório corporativo nem
de altar.** Quem abre o admin está cuidando de algo que importa (orações,
práticas, textos que outras pessoas vão ler para se recolher) — a
ferramenta deve transmitir cuidado e respeito por essa tarefa sem nunca
ficar solene ou devocional ela mesma. Microcopy do admin segue o voice &
tone geral da marca (CREATIVE-DIRECTION.md §2 — direto, sem jargão, nunca
culpa o usuário em erro), mas com registro mais operacional: instruções
claras de "o que fazer agora" em vez de convite contemplativo. Nunca usa
linguagem litúrgica ("bênção", "que a paz esteja") dentro do próprio
painel — isso pertence ao conteúdo que o admin gerencia, não à interface
que o gerencia.

---

## 5. Aplicação prática imediata (sinalizador para o pod)

- `digital-product-team-micro-interaction`: estados salvo/erro/sincronizado
  como indicadores inline discretos e imediatos (não toast genérico que
  some rápido demais para confirmar).
- `digital-product-team-dynamic-content`: distinção visual clara
  publicado/rascunho e status "sincronizado com a planilha" por item da
  Biblioteca.
- `digital-product-team-scroll-motion`: motion mínimo — apenas transições
  de estado (abrir/fechar formulário, confirmação de exclusão), nunca
  motion ambiental. `prefers-reduced-motion` respeitado como requisito.
- `digital-product-team-gamification`: fora de escopo — não há lugar para
  gamificação num painel de trabalho de um administrador.
- Toda experiência interativa proposta aqui passa pelo gate de
  `digital-product-team-audit-design` + `digital-product-team-qa-cross-browser`
  + `digital-product-team-system-performance` antes de implementação.
