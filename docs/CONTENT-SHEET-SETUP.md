# Sincronizar itens criados via "Publicação manual" com a planilha da categoria

Quando um item é **importado da planilha**, ele já está lá — nada a
sincronizar. Mas quando um item é criado direto no painel, pela seção
"Publicação manual" (sem passar pela planilha), ele fica só no
Firestore. A pedido do Head (2026-09-21): toda vez que isso acontecer,
o app também tenta adicionar uma linha na planilha da categoria
correspondente — pelo mesmo mecanismo já usado pra Prática da Semana
(ver `docs/PRACTICE-SHEET-SETUP.md`): um **Google Apps Script Web App**
por planilha, gratuito, sem Firebase Storage/Blaze, sem cartão.

É preciso repetir o passo a passo abaixo **uma vez por categoria** (4
vezes) — cada planilha tem seu próprio script e sua própria variável de
ambiente. Até isso ser feito, a sincronização daquela categoria
específica é pulada silenciosamente (o item continua sendo salvo
normalmente no Firestore — só não ganha uma cópia na planilha).

## Colunas esperadas em cada planilha

Conferido direto em cada planilha real (2026-09-21, via leitura do Google
Drive) — não é mais suposição:

| Categoria | Planilha | Colunas reais (nesta ordem) |
|---|---|---|
| Livros | [abrir](https://docs.google.com/spreadsheets/d/1LKTCZBxk7Auotzb7ud9Z-HQ8a9E6I2xtYQRUpVptw34/edit?usp=sharing) | Título · Autor · Link para o livro · Link para capa |
| Textos | [abrir](https://docs.google.com/spreadsheets/d/1wo1EkVy5bo8o6rZNUYSCrH2oDAJuiw-hQAR5s7oLIT4/edit?usp=sharing) | Título do Texto · Autor · Link para GDoc |
| Orações | [abrir](https://docs.google.com/spreadsheets/d/1Hz3lTmV4ubosdQEFhE91RkYxrRf8AhCvFF7kHciO7tk/edit?usp=sharing) | Nome da oração · Link para Gdoc |
| Músicas | [abrir](https://docs.google.com/spreadsheets/d/1tJy1a21XWSQOeTiYOcPXr-Rrt0n54ry_cK2UzZKQoMc/edit?usp=sharing) | Música · Autor · Link para Gdoc |

Orações é cadastrada como **link de Google Doc** (igual Textos), não
texto colado direto na planilha — a suposição inicial ("Texto
completo") estava errada e já foi corrigida no script abaixo e no
código do app (`contentSheetSync.ts`).

## Passo a passo (repita para cada uma das 4 planilhas)

1. Abra a planilha da categoria → menu **Extensões → Apps Script**.
2. Apague o conteúdo padrão do editor e cole o script da categoria (veja
   abaixo — cada categoria tem um script próprio, só muda a ordem das
   colunas).
3. Clique em **Salvar** (ícone de disquete), dê um nome ao projeto (ex.:
   "Sync Livros").
4. Clique em **Implantar → Nova implantação**.
5. No tipo, escolha **App da Web**.
6. Configurações:
   - **Executar como**: Eu (sua conta)
   - **Quem pode acessar**: Qualquer pessoa
7. Clique em **Implantar**. Autorize o acesso quando pedir (é o seu
   próprio script pedindo permissão pra escrever na sua própria
   planilha).
8. Copie a **URL do app da Web** que aparece (termina em `/exec`).

### Script — Livros

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  sheet.appendRow([
    body.titulo || "",
    body.autor || "",
    body.link || "",
    body.capa || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

### Script — Textos

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  sheet.appendRow([
    body.titulo || "",
    body.autor || "",
    body.link || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

### Script — Orações

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  sheet.appendRow([
    body.titulo || "",
    body.link || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

### Script — Músicas

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  sheet.appendRow([
    body.titulo || "",
    body.interprete || "",
    body.link || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Configurar no Cloudflare Pages

1. Vá em **Cloudflare Pages → seu projeto → Settings → Environment
   variables**.
2. Adicione uma variável para cada URL copiada (só as que você já
   implantou — pode fazer aos poucos, categoria por categoria):
   - `EXPO_PUBLIC_SHEET_WEBHOOK_LIVROS`
   - `EXPO_PUBLIC_SHEET_WEBHOOK_TEXTOS`
   - `EXPO_PUBLIC_SHEET_WEBHOOK_ORACOES`
   - `EXPO_PUBLIC_SHEET_WEBHOOK_MUSICAS`
3. Salve e force um novo deploy (**Deployments → Retry deployment** no
   mais recente, ou aguarde o próximo push).

Pronto — a partir do próximo deploy, todo item criado pela "Publicação
manual" daquela categoria (não os importados da planilha) ganha uma
linha nova na planilha correspondente automaticamente.

## Se algo não funcionar

- **Nenhuma linha aparece**: confira o nome exato da variável de
  ambiente pra aquela categoria, e se o deploy mais recente já rodou
  depois de configurá-la.
- **Linha aparece, mas nas colunas erradas**: o `appendRow([...])` do
  script está numa ordem diferente da planilha real — ajuste a ordem
  dentro dos colchetes pra bater com as colunas de verdade.
- **Erro de autorização ao implantar**: normal na primeira vez — clique
  em "Avançado" → "Acessar [nome do projeto] (não seguro)" na tela de
  aviso do Google (é o aviso padrão para scripts que você mesmo
  escreveu/colou).
- A sincronização nunca impede o app de funcionar: se a planilha falhar
  por qualquer motivo, o item continua salvo normalmente no Firestore —
  só a cópia na planilha que não é criada naquela vez.
