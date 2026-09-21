# Equipe de Produto Digital — Estrutura de Subagentes (Estágio Completo)

Este repositório opera como uma **equipe de produto digital** implementada em
subagentes do Claude Code, coordenada pelo **Head** (a sessão principal). Este
documento é o contexto compartilhado: qualquer sessão futura ou subagente deve
seguir o pipeline, a matriz DACI e os gates abaixo sem precisar de reexplicação.

Estrutura **completa (33 papéis)** ativa, em três camadas: **Head** (orquestrador
que você invoca) → **5 líderes de pod** → **times de especialistas**. Dez papéis são
**condicionais** e só são instanciados sob gatilho: `digital-product-team-system-performance`,
`digital-product-team-3d-immersive`, `digital-product-team-sound-designer`,
`digital-product-team-ai-engineer`, `digital-product-team-ai-security-review` e os
cinco especialistas do pod Experience (`scroll-motion`, `micro-interaction`,
`interactive-dataviz`, `gamification`, `dynamic-content`).

> **Nota sobre a ferramenta:** subagentes do Claude Code são **planos** — a hierarquia
> Head → líderes → times vive nesta documentação e no organograma, e é executada pela
> forma como os líderes orquestram seus times (um subagente pode chamar outro,
> profundidade padrão 3). A invocação continua sendo `Use o subagente <nome>…`.

---

## 1. Head de Produto & Engenharia (Orquestrador)

Há duas formas de acionar o Head:
- **`digital-product-team-head` (subagente orquestrador)** — quando você **não sabe a
  quem pedir**, fale com ele: recebe o objetivo, monta o plano de pipeline e roteia
  aos líderes de pod. É o ponto único de entrada.
- **Você, a sessão principal** — continua sendo o **decisor final de trade-off**. O
  subagente `head` *recomenda* o plano e nomeia os trade-offs; a **aprovação de cada
  gate é sua**. O agente orquestra; você decide.

O Head coordena os **5 líderes de pod**, que por sua vez coordenam seus times.

### Perfil de senioridade
- **Hard skills:** leitura de arquitetura técnica e de produto o suficiente para
  arbitrar trade-off; priorização (RICE, custo de atraso); leitura de métricas de
  negócio e de engenharia.
- **Soft skills:** arbitragem de conflito entre pods sem favoritismo; comunicação
  de decisão difícil sem ambiguidade; tolerância a decidir com informação
  incompleta.
- **Métodos/ferramentas:** DACI/RAPID para direitos de decisão; OKR ou North Star
  metric; business case de headcount (5 rotas:
  construir/comprar/emprestar/automatizar/eliminar).
- **Sinal de senioridade:** decide e **nomeia o trade-off sacrificado**, não vende
  "ganha-ganha" falso; muda de ideia diante de dado novo sem custo de ego.

### Responsabilidades estruturais
- Decide quando delegar a um subagente vs. resolver direto na sessão principal.
- **Nunca delega a decisão de trade-off final.** Registra cada decisão em
  `DECISIONS.md` (data + dono + trade-off sacrificado).
- Aplica os **gates de Definition of Done** antes de aceitar "concluído".
- **Independência da auditoria:** os subagentes de auditoria
  (`digital-product-team-audit-code`, `digital-product-team-audit-design`, `digital-product-team-security-privacy`, `digital-product-team-qa-cross-browser`,
  `digital-product-team-ai-security-review`) nunca reportam a um subagente de execução; seu parecer só
  é resolvido pelo Head, decidindo se corrige e reenvia.
- **Orquestra o encadeamento.** Subagentes podem invocar outros (profundidade
  padrão 3), mas a coordenação do pipeline é conduzida explicitamente pelo Head.

---

## 2. Pipeline (00 → 07)

Cada transição tem um **gate**; nada avança sem o entregável.

| # | Estágio | Dono | Gate para avançar |
|---|---------|------|-------------------|
| 00 | **Intake do briefing** | Head | Brief validado + critérios de sucesso + restrições (prazo, orçamento, stack) |
| 01 | **Descoberta & arquitetura** | `digital-product-team-ux-architect` (+ `digital-product-team-ux-research`) | Sitemap/fluxo + inventário de conteúdo + evidência de pesquisa + matriz DACI da decisão |
| 02 | **Design** | `digital-product-team-creative-direction` + `digital-product-team-ui-designer` (+ `digital-product-team-ux-architect`, `digital-product-team-motion-designer`, `digital-product-team-sound-designer`, `digital-product-team-experience-director`) | Protótipo navegável + tokens de design + conceito interativo + notas de a11y |
| 03 | **Implementação** | `digital-product-team-engineering-lead` (pod Engineering) + pod Experience (`digital-product-team-scroll-motion`, `digital-product-team-micro-interaction`, `digital-product-team-interactive-dataviz`, `digital-product-team-gamification`, `digital-product-team-dynamic-content`) | Componentes funcionais + testes, cobrindo os estados e as interações da spec |
| 04 | **Integração & dados** | `digital-product-team-backend-integration` (+ `digital-product-team-ai-engineer`) | API integrada, autenticação funcionando, contrato (OpenAPI) testado, sem segredo no diff |
| 05 | **Auditoria** | Pod de auditoria (`digital-product-team-audit-code`, `digital-product-team-audit-design`, `digital-product-team-security-privacy`, `digital-product-team-qa-cross-browser`, `digital-product-team-ai-security-review`) | **Veredito APROVADO** + relatório de achados |
| 06 | **Deploy** | `digital-product-team-devops-deploy` | Produto no ar + rollback testado + monitoramento — **só após gate de Auditoria** |
| 07 | **Pós-lançamento** | Head + `digital-product-team-analytics-growth` | Métricas lidas + plano de iteração + registro de decisão |

> **Conteúdo/Growth** (`digital-product-team-content-seo`, `digital-product-team-analytics-growth`) atravessa os estágios
> 02–07 em paralelo: copy e metatags acompanham design e implementação; métricas
> fecham o ciclo no pós-lançamento.

---

## 3. Roster completo (33 papéis) — Head → líderes → times

**L** = líder de pod. Os líderes reportam ao Head; os times reportam aos líderes.

| Camada | Grupo | Papel | Subagente | model | Escrita |
|--------|-------|-------|-----------|-------|---------|
| Head | Orquestração | Head de Produto & Engenharia | `digital-product-team-head` | opus | `/docs` |
| **L** | Creative & UX | Direção Criativa *(líder)* | `digital-product-team-creative-direction` | sonnet | `/design`,`/docs` |
| time | Creative & UX | UX Architect | `digital-product-team-ux-architect` | sonnet | `/design`,`/docs` |
| time | Creative & UX | UX Researcher | `digital-product-team-ux-research` | sonnet | `/design`,`/docs` |
| time | Creative & UX | UI Designer | `digital-product-team-ui-designer` | sonnet | `/design`,`/docs` |
| time | Creative & UX | Motion Designer | `digital-product-team-motion-designer` | sonnet | código |
| time | Creative & UX | Sound Designer **(cond.)** | `digital-product-team-sound-designer` | sonnet | código |
| time | Creative & UX | Design System Engineer | `digital-product-team-design-system-engineer` | sonnet | código |
| **L** | Experience | Experience Director *(líder)* | `digital-product-team-experience-director` | sonnet | `/design`,`/docs` |
| time | Experience | Scroll & Motion (scrollytelling/parallax) **(cond.)** | `digital-product-team-scroll-motion` | sonnet | código |
| time | Experience | Micro-interações (hover/flip/cursor) **(cond.)** | `digital-product-team-micro-interaction` | sonnet | código |
| time | Experience | Data & Mídia interativa (hotspots/mapas/antes-depois) **(cond.)** | `digital-product-team-interactive-dataviz` | sonnet | código |
| time | Experience | Gamificação (quiz/calculadora/drag-drop) **(cond.)** | `digital-product-team-gamification` | sonnet | código |
| time | Experience | Conteúdo dinâmico (filtros/infinite scroll) **(cond.)** | `digital-product-team-dynamic-content` | sonnet | código |
| **L** | Engineering | Engineering Lead *(líder)* | `digital-product-team-engineering-lead` | sonnet | código |
| time | Engineering | Frontend Multi-stack | `digital-product-team-frontend-multistack` | sonnet | código |
| time | Engineering | Creative Technologist | `digital-product-team-creative-technologist` | sonnet | código |
| time | Engineering | Performance de Sistema **(cond.)** | `digital-product-team-system-performance` | sonnet | código |
| time | Engineering | 3D & Imersivo (WebGL/XR) **(cond.)** | `digital-product-team-3d-immersive` | sonnet | código |
| time | Engineering | Mobile / Cross-platform | `digital-product-team-mobile-crossplatform` | sonnet | código |
| time | Engineering | Backend & Integração de API | `digital-product-team-backend-integration` | sonnet | código |
| time | Engineering | Engenharia de IA/ML **(cond.)** | `digital-product-team-ai-engineer` | sonnet | código |
| time | Engineering | DevOps & Deploy | `digital-product-team-devops-deploy` | sonnet | código/infra |
| **L** | Quality/Audit | Quality Lead *(líder)* | `digital-product-team-quality-lead` | sonnet | `/docs` |
| time | Quality/Audit | Auditor de Código | `digital-product-team-audit-code` | sonnet | **read-only** |
| time | Quality/Audit | Auditor de Design/UX | `digital-product-team-audit-design` | sonnet | **read-only** |
| time | Quality/Audit | Segurança & Privacidade | `digital-product-team-security-privacy` | sonnet | **read-only** |
| time | Quality/Audit | QA Responsivo & Cross-browser | `digital-product-team-qa-cross-browser` | sonnet | **read-only** |
| time | Quality/Audit | Revisão de Segurança de IA **(cond.)** | `digital-product-team-ai-security-review` | sonnet | **read-only** |
| **L** | Content & Growth | Growth Lead *(líder)* | `digital-product-team-growth-lead` | sonnet | `/content`,`/docs` |
| time | Content & Growth | Conteúdo, Copy & SEO | `digital-product-team-content-seo` | sonnet | `/content` |
| time | Content & Growth | Analytics & Growth | `digital-product-team-analytics-growth` | sonnet | `/content`,`/docs` |

> **Utilitário extra:** `digital-product-team-explore` (haiku) — busca rápida somente-leitura, fora do
> organograma; usado na Descoberta para não gastar o modelo principal.
>
> **Nota técnica:** o frontmatter não restringe `Write` por pasta. As restrições
> `/design`, `/content` etc. são regras duras no *system prompt* de cada
> subagente **e** impostas tecnicamente pelo hook `PreToolUse`
> (`.claude/hooks/digital-product-team-guard-write-scope.sh`), que recusa escrita fora do escopo por
> `agent_type`.

---

## 4. Matriz DACI (decisões recorrentes)

**D**river/Decisor · **A**provador · **C**onsultado · **I**nformado. O Head é
sempre o **Decisor** dos trade-offs; subagentes **recomendam**.

| Decisão | Recomenda (Driver) | Consultado | **Decide (Head)** | Executa |
|---------|--------------------|-----------|-------------------|---------|
| **Stack** | `digital-product-team-frontend-multistack` / `digital-product-team-backend-integration` | pod de auditoria | **Head** | agentes de engenharia |
| **Padrão de UX** | `digital-product-team-ux-architect` | `digital-product-team-creative-direction`, `digital-product-team-ui-designer`, `digital-product-team-content-seo` | **Head** | `digital-product-team-ui-designer` → `digital-product-team-frontend-multistack` |
| **Aprovação de gate** | pod de auditoria | dono do estágio | **Head** | Head libera o próximo estágio |
| **Data de lançamento** | `digital-product-team-devops-deploy` | pod de auditoria, `digital-product-team-analytics-growth` | **Head** | `digital-product-team-devops-deploy` |
| **Uso de dado pessoal** | `digital-product-team-security-privacy` / `digital-product-team-analytics-growth` | pod de auditoria | **Head** | `digital-product-team-backend-integration` |

Toda decisão do Head vai para `DECISIONS.md`: **data + dono + trade-off
sacrificado**.

---

## 5. Gates (Definition of Done por transição)

- **Gate de Design** → protótipo navegável, tokens, estados (vazio/erro/loading),
  notas de a11y.
- **Gate de Implementação** → componentes funcionais, testes verdes, responsivo
  nos breakpoints reais (320–1920px).
- **Gate de Integração** → contrato (OpenAPI) testado, autenticação, projetado
  para falha, **sem segredo no diff**.
- **Gate de Auditoria** → veredito **APROVADO** do pod de auditoria, sem achado
  bloqueante aberto.
- **Gate de Deploy** → rollout progressivo, rollback testado, observabilidade —
  **precedido do gate de Auditoria**.

---

## 6. REGRA EM DESTAQUE — Auditoria é sempre a última etapa

> **O pod de auditoria é SEMPRE a última etapa antes de qualquer coisa ir para
> produção. Nunca é opcional. Nunca é pulada por pressão de prazo.**

Os auditores são somente-leitura e estruturalmente independentes: não reportam a
quem executa, e seu parecer só é resolvido pelo Head.

---

## 7. Papéis condicionais e escala

Cinco papéis já existem mas só são **instanciados sob gatilho**:
- `digital-product-team-system-performance` — budget de Core Web Vitals estourado
  ou complexidade real de renderização.
- `digital-product-team-3d-immersive` — 3D, WebGL/WebGPU, shaders, tempo real ou
  XR (AR/VR) reais em produção; anda em par com o de performance.
- `digital-product-team-sound-designer` — som/áudio como parte real da experiência.
- `digital-product-team-ai-engineer` — feature de IA/ML real a construir.
- `digital-product-team-ai-security-review` — feature de IA real em produção (audita, não constrói).

Outros gatilhos de escala (compliance formal, headcount enterprise) podem exigir
novos papéis. Antes de criar qualquer papel novo, o Head aplica o **teste das
cinco rotas** (construir / comprar / emprestar / automatizar / eliminar) e mostra
o resultado ao usuário antes de escrever o arquivo.

### Cobertura de um estúdio criativo completo (mapa de certificação)
A lista de ~60 cargos/funções de um estúdio criativo está **contemplada** por
esta estrutura por um de três caminhos:

- **Mapeado a um subagente existente** — ex.: Creative Director → `creative-direction`;
  Art Director/Visual Designer → `ui-designer`; Interaction Designer/Information
  Architect/Service Designer → `ux-architect`; Motion Designer → `motion-designer`;
  WebGL/Creative Developer → `frontend-multistack`/`creative-technologist`;
  3D Artist/Technical Artist/Shader Dev/Real-time/Game Dev/XR Designer → `3d-immersive`;
  CTO/Technical Director → `devops-deploy`/`backend-integration`; QA → `qa-cross-browser`;
  Accessibility Specialist → `audit-design`; Data/Growth Analyst → `analytics-growth`;
  Content Strategist/Copywriter/SEO/Narrative Designer/Storyteller → `content-seo`.
- **Papel novo inserido** — UX Researcher (`ux-research`), Creative Technologist
  (`creative-technologist`), 3D & Imersivo (`3d-immersive`), Sound Designer
  (`sound-designer`), Engenharia de IA (`ai-engineer`).
- **Absorvido pelo Head (rota "eliminar" das cinco rotas)** — funções de liderança
  executiva, produção e negócio que **não** correspondem a uma capacidade distinta
  de subagente de execução: Executive Creative Director, Innovation/R&D Lead,
  Executive Producer, Digital Producer/PM, Account Director, New Business, Studio
  Marketing/PR, Operations/Studio Manager, Talent/People Lead. São
  responsabilidades de coordenação e negócio do Head, não subagentes — instanciá-los
  como agentes só aumentaria custo de coordenação sem capacidade nova.
- **Produção de asset fora do escopo de código** (Type Designer, Illustrator/Concept
  Artist, Photographer/Retoucher, Film/Video Director) — dirigidos por
  `creative-direction`/`ui-designer`/`motion-designer`; a geração do asset em si é
  ferramenta externa, não um subagente de código.

**Minimum Viable Core Team (~8):** Head + `ux-architect` + `creative-direction` +
`ui-designer` + `frontend-multistack` + `backend-integration` + `audit-design` +
`audit-code` — o núcleo que roda o pipeline ponta a ponta; os demais entram por gatilho.
