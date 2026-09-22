# Roteiro de QA manual do /admin — verificações pendentes

Estas verificações **não podem ser feitas em sessão de código** porque exigem
(a) login com credencial Firebase real e/ou (b) leitor de tela real
(NVDA/VoiceOver) e/ou (c) Safari/iOS real. Os gates `audit-design` e
`qa-cross-browser` aprovaram tudo o que é verificável por código e por DOM
(Chromium/Playwright); o que sobra está listado aqui para o Head validar
antes do deploy em produção. Ver `DECISIONS.md` (gates de 2026-09-22).

Faça em um navegador de desktop e, quando indicado, também no celular.

## 1. Anel de foco no dashboard autenticado (Bug 1 — WCAG 2.4.7)
Pré-condição: logado no `/admin`.
- [ ] Aba **Biblioteca** → dar **Tab** até o cabeçalho de uma categoria (o
      botão de expandir e o círculo "ver todos"). O anel de foco roxo
      (Mulberry, 2px) deve aparecer **inteiro ao redor** do elemento, sem
      ficar cortado na borda arredondada do card.
- [ ] Abrir a lista de uma categoria → **Tab** até o cabeçalho de um item
      (accordion). Mesmo teste: anel completo, não cortado.
- [ ] Confirmar que o anel não "vaza" por cima de elementos vizinhos.

## 2. Modal de importação por teclado (Bug do audit A.4 — WCAG 2.4.3/4.1.2)
Pré-condição: Biblioteca → abrir "Importar da planilha".
- [ ] Ao abrir, o foco vai **para dentro** do modal (não fica no fundo).
- [ ] Dar **Tab**/**Shift+Tab** repetidamente: o foco **cicla dentro** do
      modal e **não** vaza para o banner, "Sair", sidebar ou lista atrás.
- [ ] Apertar **Esc**: o modal fecha.
- [ ] Ao fechar (Esc ou botão), o foco **volta** para o botão que abriu.

## 3. Pausa do timer de undo (Bug do audit A.5 — WCAG 2.2.1)
Pré-condição: Biblioteca com ≥2 itens; entrar no modo de seleção.
- [ ] Selecionar itens → "Excluir N itens". Aparece o toast "N itens
      excluídos" com "Desfazer" e contagem regressiva.
- [ ] **Passar o mouse** sobre o toast: a contagem **pausa**; ao tirar o
      mouse, **retoma**.
- [ ] **Dar Tab** até o botão "Desfazer" (foco): a contagem **pausa**;
      ao sair do foco, **retoma**.
- [ ] Clicar "Desfazer" **restaura** os itens (nada foi apagado).
- [ ] Deixar o tempo acabar: os itens são apagados de fato (some da lista e
      não voltam ao recarregar).
- [ ] **Trocar de aba/categoria** durante a janela: os itens **não** são
      apagados na hora; o undo continua disponível.

## 4. Leitor de tela (audit A.2/A.3 — WCAG 4.1.3/1.3.1)
Use **NVDA** (Windows) ou **VoiceOver** (Mac), navegando só por teclado.
- [ ] Ao salvar/editar/excluir/importar, o leitor **anuncia** o toast
      ("Item excluído", "Não foi possível salvar" etc.) sem cortar a leitura.
- [ ] No formulário de item, cada campo é lido com **nome** correto (Título,
      Descrição, Texto, URL do arquivo, URL da capa, URL de streaming,
      Ordem) — não só "campo de edição" ou o placeholder.
- [ ] No login, os campos E-mail e Senha são lidos com nome.
- [ ] O toast de undo é anunciado de forma utilizável (sem repetir a cada
      segundo de um jeito irritante — se repetir demais, anotar).

## 5. Safari / iOS real (o ambiente de teste só tem Chromium)
- [ ] Login e dashboard em **Safari desktop**: sem scroll horizontal, foco
      visível, `tabindex` do header funcionando (header é o 1º Tab).
- [ ] **iPhone (Safari iOS)**: layout em coluna única, área de toque dos
      botões confortável (≥44px), `reorderButton` (setas) não colide com o
      vizinho, sem quebra de safe-area/notch.
- [ ] **≥1280px**: sidebar + 2 painéis aparecem; editor à direita com
      largura de leitura confortável (~720px), sem esticar até a borda.

## 6. Transição de breakpoint (verificado no Chromium, reconfirmar visual)
- [ ] Redimensionar de 959→960px: a navegação troca de segmented control
      (topo) para sidebar (lateral) sem "pulo" estranho nem scroll
      horizontal, e o painel B não fica espremido entre 960–1050px.
