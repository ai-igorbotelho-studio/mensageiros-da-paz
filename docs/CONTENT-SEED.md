# Conteúdo real — lista de cadastro (seed)

Este arquivo é um checklist do conteúdo real já definido para o app, para
você cadastrar no Firestore/Storage via Firebase Console, seguindo o guia
de "Sem painel admin web" em `docs/BACKEND-ARCHITECTURE.md`. Os arquivos de
mídia (áudio, PDF, imagem) em si **não são commitados neste repositório**
— binários grandes não pertencem ao histórico do Git; eles vão direto para
o Firebase Storage no momento do cadastro.

Categoria (`category`) usa os valores `oracoes`, `musicas`, `textos`,
`livros`, conforme o modelo de dados em `docs/BACKEND-ARCHITECTURE.md`.
`source` (`upload` ou `spotify`) discrimina se o item tem arquivo próprio ou
é um link do Spotify (seção 2.2 do mesmo documento).

## Músicas

| # | Título | Artista/Autor | Ano | Duração (aprox.) | Origem | Status |
|---|--------|----------------|-----|-------------------|--------|--------|
| 1 | Guerreiro do Bem | Pablo Sganzerla | 2014 | 5:14 | Upload próprio | Recebido do Head (arquivo local, aguardando upload real no Firebase Storage) |
| 2 | Chamatrina | Emanazul | — | — | Spotify | `spotify_url`: `https://open.spotify.com/track/0DaPk7qd7pDqmuybzgbTOO` |

Campos sugeridos para o item 1 (upload):
```json
{
  "title": "Guerreiro do Bem",
  "description": "Pablo Sganzerla · 2014",
  "category": "musicas",
  "source": "upload",
  "file_type": "audio",
  "mime_type": "audio/mpeg",
  "order": 1,
  "published": true
}
```
`file_url` é preenchido depois de subir o MP3 no Storage e copiar o link
público, conforme o passo a passo em `docs/BACKEND-ARCHITECTURE.md`.

Campos sugeridos para o item 2 (Spotify):
```json
{
  "title": "Chamatrina",
  "description": "Emanazul",
  "category": "musicas",
  "source": "spotify",
  "spotify_url": "https://open.spotify.com/track/0DaPk7qd7pDqmuybzgbTOO",
  "order": 2,
  "published": true
}
```

## Orações

As 8 orações já têm texto definido e aplicado no protótipo visual
(`docs/UX-ARCHITECTURE.md`), mas como o modelo de dados atual assume
conteúdo em arquivo (PDF/imagem/áudio) e essas orações são texto puro,
decisão pendente do Head: cadastrar como PDF gerado a partir do texto, ou
estender o modelo de dados para aceitar campo de texto direto. Orações
com texto já extraído e pronto:

1. Prece de Cáritas
2. Consagração do Aposento
3. Pai Nosso
4. Ave Maria
5. A Grande Invocação
6. Oração de São Francisco
7. Prece ao Dr. Bezerra de Menezes
8. Oração a Saint Germain

Os textos completos estão nas telas do protótipo
(`https://claude.ai/artifact/94YVdkCem2QK6qwmkuTJmQ`, artboards
`OracaoCaritas.dc.html`, `OracaoConsagracao.dc.html`, etc.).

## Leituras → Textos

Nenhum conteúdo real definido ainda.

## Leituras → Livros

18 PDFs recebidos do Head em 2026-09-19 (arquivo `Livros_e_Textos.zip`),
extraídos localmente (não commitados — binários totalizam ~26 MB, acima do
que faz sentido versionar em Git; ficam disponíveis para você subir ao
Firebase Storage). Descrições de duas linhas já escritas e aplicadas no
protótipo (`Livros.dc.html`); cada card tem um ícone de livro genérico
(ilustração vetorial, sem capa real do livro — não há fonte confiável de
capa real para todos os títulos, e o próprio guia de direção criativa
recomenda ilustração simples em vez de imagens externas).

| # | Título | Autor | Descrição (2 linhas, já no protótipo) |
|---|--------|-------|-----------------------------------------|
| 1 | O Livro Tibetano dos Mortos | — | Guia budista tibetano sobre os estados intermediários entre a morte e o renascimento. Orientação para a travessia da consciência após a morte física. |
| 2 | O Evangelho de Judas | — | Texto gnóstico apócrifo com uma leitura alternativa do vínculo entre Jesus e Judas. Revela uma perspectiva pouco convencional sobre a traição. |
| 3 | O Evangelho Essênio da Paz | — | Ensinamentos atribuídos aos essênios sobre alimentação, natureza e vida espiritual. Convite a uma vida simples, em harmonia com a Terra. |
| 4 | O Caibalion | — | Síntese dos sete princípios herméticos, introdução clássica à filosofia hermética. Base de estudo para quem inicia na tradição hermética. |
| 5 | Corpus Hermeticum | Hermes Trismegisto | Coletânea de textos que fundamentam a tradição hermética ocidental. Reflexões sobre Deus, o cosmo e a natureza da alma. |
| 6 | O Livro de Enoque | — | Texto apócrifo judaico sobre anjos, cosmologia e profecias. Influência marcante sobre tradições esotéricas posteriores. |
| 7 | Dicionário Rosacruz | — | Glossário de termos e conceitos da tradição rosacruz. Referência rápida para aprofundar o estudo esotérico. |
| 8 | Atlântida e Lemúria, continentes desaparecidos | W. Scott-Elliot | Estudo teosófico sobre os lendários continentes perdidos. Descreve civilizações e ensinamentos ocultos remanescentes. |
| 9 | Pistis Sofia II | — | Segundo volume do texto gnóstico sobre os ensinamentos de Jesus ressuscitado. Continuação dos mistérios revelados aos discípulos. |
| 10 | Ramatis — O Astro Intruso | — | Obra psicografada de conteúdo espírita sobre eventos cósmicos e espirituais. Reflexão sobre a influência de fenômenos celestes na Terra. |
| 11 | Pistis Sofia III | — | Terceiro volume do texto gnóstico sobre os ensinamentos de Jesus ressuscitado. Aprofunda os mistérios da alma (Sofia) e sua jornada. |
| 12 | O Livro de Ouro de Saint Germain | — | Ensinamentos atribuídos ao Mestre Ascensionado Saint Germain. Sobre a Chama Violeta e a transmutação espiritual. |
| 13 | Pistis Sofia | — | Texto gnóstico central sobre os ensinamentos de Jesus a seus discípulos. Revela mistérios da alma e da jornada espiritual (Sofia). |
| 14 | Bhagavad Gita | PT-BR | Diálogo espiritual clássico entre Krishna e Arjuna. Um dos textos centrais da filosofia hindu sobre dever e devoção. |
| 15 | Poemas Ocultistas | Fernando Pessoa | Coletânea de poemas de Pessoa com temática esotérica e rosacruz. Reflete a busca espiritual do poeta em versos. |
| 16 | A Doutrina Secreta | Helena Blavatsky | Obra fundamental da Teosofia sobre cosmogênese e antropogênese. Explora, sob perspectiva esotérica, a origem do universo e da humanidade. |
| 17 | Mãos de Luz | Barbara Ann Brennan | Guia clássico de cura energética através do campo áurico. Une observação científica e prática espiritual de cura. |
| 18 | Courageous Dreaming | — | Livro sobre visão xamânica e criação consciente do futuro. Convite a sonhar com coragem a transformação do mundo. |

Campo sugerido por item (upload — todos são PDF):
```json
{
  "title": "<título>",
  "description": "<autor, quando houver>",
  "category": "livros",
  "source": "upload",
  "file_type": "pdf",
  "mime_type": "application/pdf",
  "order": "<posição na lista acima>",
  "published": true
}
```

**Pendência técnica real (não é código, é ação do Head):** o código atual
do app abre PDF por link externo (`Linking.openURL`) — a leitura *dentro*
do app, como pedido ("ler no próprio device"), depende de
`react-native-pdf` (já listado em `app/package.json`) rodar num **build
nativo via EAS** (não funciona no Expo Go puro). Isso ainda não foi
implementado no código — só a UI do protótipo simula a experiência de
leitura paginada. Ver `app/src/screens/ItemDetailScreen.tsx` (comentário
já existente sobre essa limitação).
