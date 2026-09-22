# Direção Criativa — Painel Admin (`/admin`)

Partido estético e voice & tone específicos do painel administrativo do
Mensageiros da Paz, construído sobre `docs/CREATIVE-DIRECTION.md` (marca
pública) e os tokens já em produção (`app/src/theme/tokens.ts`, paleta
Goethe "Ceremony and legacy in education"). O admin **herda a marca, não
cria uma nova** — é a mesma pessoa (o Head) numa postura diferente: de
"orando/lendo" para "organizando o que os outros vão orar/ler".

---

## 1. Partido estético do admin

O admin é o **avesso de trabalho** da mesma casa: onde o app público é sala
de estar (Pale apricot `#FFEDDF`, silêncio visual, uma prática por tela), o
admin é a mesa de trabalho ao lado — mesma casa, luz mais neutra, mais
superfícies visíveis ao mesmo tempo porque há tarefas a fazer, não a
contemplar. Isso já existe certo no código: `adminBackground` (`#EFE8DD`,
greige neutro) e `ADMIN_SURFACE` (`#FBF7F1`) diferenciam o admin do Pale
apricot do app sem quebrar a família de tons quentes-neutros da paleta —
mantenha essa lógica como o eixo central: **o admin nunca usa o
`background` público** (evita a confusão "isto é uma tela do app ou do
gerenciador?"), mas também nunca introduz frio (cinza-azulado, branco
técnico) — o greige já escolhido é o ponto certo entre "neutro o
suficiente para densidade de formulário" e "ainda quente o suficiente para
parecer a mesma marca". Densidade de informação é maior que no app público
(tabelas, formulários, várias ações por tela) e isso é aceitável — o
princípio "silêncio visual é uma feature" da marca pública vira aqui
"clareza é a feature": menos sobre vazio contemplativo, mais sobre nenhuma
ambiguidade sobre o que um botão faz antes de clicar.

## 2. Voice & tone do admin

A pessoa que abre `/admin` não é uma visitante em busca de paz — é alguém
no meio de uma tarefa (cadastrar um livro, corrigir um link, decidir se
apaga algo). O tom muda de **convite** para **instrução clara e
respeitosa**, mas continua sendo a mesma voz de "amigo presente", nunca
"sistema corporativo". Coerência de fé sem ser litúrgico: o admin não reza
com o usuário, mas também não vira um SaaS genérico — trate o conteúdo
como o que é (orações, textos de fé de pessoas reais), não como "registros"
frios.

Regras práticas:
- **Rótulos:** diretos, sem jargão técnico de banco de dados. "Título",
  "Link do arquivo", "Categoria" — nunca "slug", "payload", "metadata".
- **Ações destrutivas:** nomeiam a consequência real, sem eufemismo nem
  dramatização. "Excluir [nome do item]" e não "Apagar definitivamente" (
  soa a ameaça) nem apenas "Remover" (vago demais para uma ação
  irreversível). A confirmação em duas etapas já implementada
  (`AdminScreen.tsx`, botão "Apagar todos de {categoria} (N)") deve dizer o
  que vai acontecer em português concreto: "Isso vai apagar N itens de
  {categoria}. Não dá para desfazer." — não "Tem certeza?" genérico.
- **Estados vazios:** acolhedores, não em branco frio. Em vez de "Nenhum
  item encontrado", preferir "Ainda não há nada em {categoria} — cadastre o
  primeiro item abaixo." (orienta a próxima ação, como a marca pública faz
  ao "oferecer, não impor").
- **Erros técnicos:** mesma regra do app público — nunca culpar quem usa,
  nunca expor jargão de sistema. Em vez de "Erro ao salvar: FAILED_PRECONDITION",
  usar "Não conseguimos salvar agora. Tente de novo em instantes." Se o erro
  for de validação do próprio usuário (campo obrigatório vazio), ser
  específico e gentil: "Falta o título antes de salvar" — não "Campo
  inválido".
- **Confirmações de sucesso:** breves, sem entusiasmo artificial. "Salvo."
  ou "Prática da semana atualizada." — não "Perfeito! Tudo certo! 🎉" (a
  marca já decidiu nunca usar emoji, DECISIONS.md 2026-09-21).
- **Antes/depois adicionais:**
  - Antes: "Deletar" → Depois: "Excluir [título]"
  - Antes: "Operação concluída com sucesso" → Depois: "Item salvo."
  - Antes: "Tem certeza que deseja continuar?" → Depois: "Excluir
    permanentemente 'Guerreiro do Bem'?"
  - Antes: "Nenhum dado" → Depois: "Nada cadastrado em Livros ainda."

## 3. Uso de cor com propósito

Nenhuma cor nova é necessária — os tokens existentes já cobrem os papéis
que um painel de gestão precisa, desde que usados com disciplina:

- **`colors.primary` (Mulberry) / `primaryLight`:** ações primárias e de
  navegação — salvar, confirmar edição, abas ativas. É a cor de "seguir em
  frente".
- **`colors.accent` (Sage, também `success`):** reservar para confirmação
  positiva e estado "publicado/concluído" — um item salvo com sucesso, uma
  sincronização que funcionou, o badge de "publicado" vs. rascunho. Não usar
  Sage como cor decorativa de botão neutro — ela deve sinalizar
  especificamente "isto deu certo" ou "isto está ao vivo", para manter
  significado.
- **`colors.danger`:** estritamente ações destrutivas ou irreversíveis
  (excluir item, excluir todos, erro bloqueante que impede salvar). Nunca
  usar danger para aviso brando ou informação — isso dilui o peso do
  vermelho exatamente onde ele mais precisa pesar (o botão "Apagar todos").
  Um aviso brando (ex. "Drive pode exibir tela de confirmação de vírus em
  arquivos grandes") deve usar `textSecondary` ou um tom neutro com ícone,
  não danger.
- **Hierarquia de ênfase:** primary > accent > neutro > danger-só-quando-é-
  literalmente-destrutivo. Um formulário comum não deveria ter mais de uma
  cor de destaque por tela além do neutro de fundo — se uma tela do admin
  está usando 4 cores de ação ao mesmo tempo, isso é sinal de que a
  hierarquia de prioridade das ações não foi decidida antes de desenhar a
  tela (voltar para `ux-architect`/`ui-designer`, não resolver só com CSS).

## 4. O que é inegociável (herdado da marca, sem exceção no admin)

1. **Tipografia:** Lora (`fonts.display`) para títulos de seção, Lexend
   (`fonts.body`) para todo o resto — o admin não introduz uma terceira
   fonte "mais funcional/técnica". Densidade de tabela se resolve com
   espaçamento e peso, não com fonte diferente.
2. **Botões em pílula** (`radii.pill`): sem exceção, inclusive nos botões
   destrutivos e nos de ação em massa. Um botão quadrado no admin quebraria
   a única regra de forma que atravessa toda a marca.
3. **Fonte mínima 17px** (`minFontSize`) e área de toque mínima 44x44
   (`minTouchSize`): não relaxar "porque é ferramenta interna" — quem usa o
   admin é a mesma faixa etária/contexto do público do app, não uma equipe
   de TI jovem acostumada a densidade agressiva.
4. **Nunca preto/branco puro:** o greige `adminBackground`/`ADMIN_SURFACE`
   já resolve isso; qualquer novo componente do admin deve puxar cor de
   `theme/tokens.ts`, nunca hardcode `#000`/`#FFF` novo.
5. **Tom acolhedor mesmo em ferramenta de trabalho:** o admin pode (e deve)
   ser mais direto e denso que o app público, mas nunca vira frio,
   burocrático ou genérico de SaaS — nenhuma tela do admin deveria soar como
   se tivesse sido copiada de um painel de e-commerce qualquer.
6. **Sem emoji** (decisão registrada em `DECISIONS.md`, 2026-09-21):
   confirmações e estados usam palavra, não ícone decorativo de humor.
