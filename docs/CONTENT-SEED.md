# Conteúdo real — lista de cadastro (seed)

Este arquivo é um checklist do conteúdo real já definido para o app, para
você cadastrar no Firestore via Firebase Console, seguindo o guia de "Sem
painel admin web" em `docs/BACKEND-ARCHITECTURE.md`.

> **Revisão 2026-09-19 — sem Firebase Storage.** O Firebase Storage passou
> a exigir cartão de crédito (plano Blaze) mesmo no uso gratuito, e o Head
> recusou cadastrar cartão (ver `DECISIONS.md`). PDFs agora ficam no
> **Google Drive** do Head; áudio próprio fica versionado no repositório
> e servido pelo **Cloudflare Pages**. `file_url` aponta para essas fontes.

Categoria (`category`) usa os valores `oracoes`, `musicas`, `textos`,
`livros`, conforme o modelo de dados em `docs/BACKEND-ARCHITECTURE.md`.
`source` (`upload` ou `spotify`) discrimina se o item tem arquivo próprio ou
é um link do Spotify (seção 2.2 do mesmo documento).

## Músicas

| # | Título | Artista/Autor | Ano | Duração (aprox.) | Origem | Status |
|---|--------|----------------|-----|-------------------|--------|--------|
| 1 | Guerreiro do Bem | Pablo Sganzerla | 2014 | 5:14 | Upload próprio (Cloudflare Pages) | Commitado em `app/content-src/musicas/Guerreiro-do-Bem.mp3`, servido em produção |
| 2 | Chamatrina | Emanazul | — | — | Spotify | `spotify_url`: `https://open.spotify.com/track/0DaPk7qd7pDqmuybzgbTOO` |

Campos sugeridos para o item 1 (upload, hospedado no Cloudflare Pages —
ver nota de revisão no topo deste arquivo):
```json
{
  "title": "Guerreiro do Bem",
  "description": "Pablo Sganzerla · 2014",
  "category": "musicas",
  "source": "upload",
  "file_url": "https://mensageiros-da-paz.pages.dev/content/musicas/Guerreiro-do-Bem.mp3",
  "file_type": "audio",
  "mime_type": "audio/mpeg",
  "order": 1,
  "published": true
}
```

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
agora hospedados no **Google Drive pessoal do Head** (pasta compartilhada
como "Qualquer pessoa com o link — Leitor"), já que o Firebase Storage
deixou de ser gratuito (ver nota de revisão no topo deste arquivo).
Descrições de duas linhas já escritas e aplicadas no protótipo
(`Livros.dc.html`); cada card tem um ícone de livro genérico (ilustração
vetorial, sem capa real do livro — não há fonte confiável de capa real
para todos os títulos, e o próprio guia de direção criativa recomenda
ilustração simples em vez de imagens externas).

| # | Título | Autor | `file_url` (Google Drive) |
|---|--------|-------|------|
| 1 | O Livro Tibetano dos Mortos | — | https://drive.google.com/file/d/0B0HNPNo_DmQzLUZBLUtSZnRpUUk/view?usp=sharing&resourcekey=0-ppwSNZG14VAUwq66cmwX3A |
| 2 | O Evangelho de Judas | — | https://drive.google.com/file/d/0B0HNPNo_DmQzVlBQWmhha1BUUjA/view?usp=drive_link&resourcekey=0-C5y6sHN9ibGf35VwSk4usg |
| 3 | O Evangelho Essênio da Paz | — | https://drive.google.com/file/d/0B0HNPNo_DmQzcWpKaG9iOUF1LVE/view?usp=drive_link&resourcekey=0-boiN9wW6XD3xG78F-DX0Dg |
| 4 | O Caibalion | — | https://drive.google.com/file/d/0B0HNPNo_DmQzVVE3RWlCdElJdU0/view?usp=drive_link&resourcekey=0-A_db9hbE3LbM5xeBNUQHXQ |
| 5 | Corpus Hermeticum | Hermes Trismegisto | https://drive.google.com/file/d/0B0HNPNo_DmQzVHdNNDZjYWh6VU0/view?usp=drive_link&resourcekey=0-QD5c3115LhuX__W06zd1Xw |
| 6 | O Livro de Enoque | — | https://drive.google.com/file/d/0B0HNPNo_DmQzVzRTNnR0SVpGaFU/view?usp=drive_link&resourcekey=0-THhf3SP_uXKynNPnlhzv1w |
| 7 | Dicionário Rosacruz | — | https://drive.google.com/file/d/0B0HNPNo_DmQzM2txbWIyeUlCdEU/view?usp=drive_link&resourcekey=0-cIIv-Gjpp-cVuWCIz2Yy5Q |
| 8 | Atlântida e Lemúria, continentes desaparecidos | W. Scott-Elliot | https://drive.google.com/file/d/0B0HNPNo_DmQzVm9DWGZvVEVzZXM/view?usp=drive_link&resourcekey=0-SuLDhZFp1qDBM7m6mIaubQ |
| 9 | Pistis Sofia II | — | https://drive.google.com/file/d/0B0HNPNo_DmQzN001TlJCMkJWR0U/view?usp=drive_link&resourcekey=0-iDi6CPmD3JwjGuQC0-a5hw |
| 10 | Ramatis — O Astro Intruso | — | https://drive.google.com/file/d/0B0HNPNo_DmQzQUZZdVpLYUY5eGM/view?usp=drive_link&resourcekey=0-xeQ_IMPXkya0puAcGbaNSg |
| 11 | Pistis Sofia III | — | https://drive.google.com/file/d/0B0HNPNo_DmQzRTBFaDNKZHZhVWs/view?usp=drive_link&resourcekey=0-ZOQcHw0EyvJ9KHxe-sPIZQ |
| 12 | O Livro de Ouro de Saint Germain | — | https://drive.google.com/file/d/0B0HNPNo_DmQzaFY3V3ZKZksyS2M/view?usp=drive_link&resourcekey=0-1hPhPuZfoy82YZld58RZsA |
| 13 | Pistis Sofia | — | https://drive.google.com/file/d/0B0HNPNo_DmQzbXNaT2R3N29hMzQ/view?usp=drive_link&resourcekey=0-nyJ-yClLMDYUPH-i_LdnHA |
| 14 | Bhagavad Gita | PT-BR | https://drive.google.com/file/d/0B0HNPNo_DmQzYU5DRHQwVDh4Ymc/view?usp=drive_link&resourcekey=0-gaPiUDTWo5SnCAMgh44IgA |
| 15 | Poemas Ocultistas | Fernando Pessoa | https://drive.google.com/file/d/0B0HNPNo_DmQzUzZKYW5QdFVDT1E/view?usp=drive_link&resourcekey=0-E18JOztQXMeJk2mgnp--uA |
| 16 | A Doutrina Secreta | Helena Blavatsky | https://drive.google.com/file/d/0B0HNPNo_DmQzUFVwa09ZczgwVVU/view?usp=drive_link&resourcekey=0-PkfBo56-KIyhw0UXvg4Kdw |
| 17 | Mãos de Luz | Barbara Ann Brennan | https://drive.google.com/file/d/0B0HNPNo_DmQzME5LOVVxVkFTeVU/view?usp=drive_link&resourcekey=0-YFA1ch6EFhY-8G6zjxGpbA |
| 18 | Courageous Dreaming | — | https://drive.google.com/file/d/0B0HNPNo_DmQzNThtUWtDS1NwQTg/view?usp=drive_link&resourcekey=0-dbdHNrEhWXY0g1Xv4tdGMA |

Descrições de duas linhas de cada (para o campo `description`, se quiser
usar, ou deixar só o autor): ver a tabela anterior mantida no histórico do
Git deste arquivo, ou as telas do protótipo (`Livros.dc.html`).

Campo sugerido por item (todos são PDF, hospedados no Drive):
```json
{
  "title": "<título>",
  "description": "<autor, quando houver>",
  "category": "livros",
  "source": "upload",
  "file_url": "<link do Drive da tabela acima>",
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
