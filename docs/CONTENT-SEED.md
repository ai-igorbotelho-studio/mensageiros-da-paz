# Conteúdo real — lista de cadastro (seed)

Este arquivo é um checklist do conteúdo real já definido para o app, para
você cadastrar no Firestore/Storage via Firebase Console, seguindo o guia
de "Sem painel admin web" em `docs/BACKEND-ARCHITECTURE.md`. Os arquivos de
mídia (áudio, PDF, imagem) em si **não são commitados neste repositório**
— binários grandes não pertencem ao histórico do Git; eles vão direto para
o Firebase Storage no momento do cadastro.

Categoria (`category`) usa os valores `oracoes`, `musicas`, `textos`,
conforme o modelo de dados em `docs/BACKEND-ARCHITECTURE.md`.

## Músicas

| # | Título | Artista/Autor | Ano | Duração (aprox.) | Status |
|---|--------|----------------|-----|-------------------|--------|
| 1 | Guerreiro do Bem | Pablo Sganzerla | 2014 | 5:14 | Recebido do Head (arquivo local, aguardando upload real no Firebase Storage) |

Campos sugeridos ao criar o documento em `items` (coleção Firestore):
```json
{
  "title": "Guerreiro do Bem",
  "description": "Pablo Sganzerla · 2014",
  "category": "musicas",
  "file_type": "audio",
  "mime_type": "audio/mpeg",
  "order": 1,
  "published": true
}
```
`file_url` é preenchido depois de subir o MP3 no Storage e copiar o link
público, conforme o passo a passo em `docs/BACKEND-ARCHITECTURE.md`.

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

## Textos

Nenhum conteúdo real definido ainda.
