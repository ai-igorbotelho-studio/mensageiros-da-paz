# Sincronizar o painel com a planilha da categoria (criar/editar/apagar)

Quando um item é **importado da planilha**, ele já está lá. Mas
qualquer ação feita **no painel** — criar um item pela "Publicação
manual", editar um item (de qualquer origem) ou apagar um item — só
mexia no Firestore, sem refletir na planilha. A pedido do Head
(2026-09-21): agora o app tenta manter a planilha da categoria em
sincronia com essas 3 ações, pelo mesmo mecanismo já usado pra Prática
da Semana (ver `docs/PRACTICE-SHEET-SETUP.md`): um **Google Apps
Script Web App** por planilha, gratuito, sem Firebase Storage/Blaze,
sem cartão.

Diferente da Prática (que só adiciona linha), aqui o script **procura
a linha pelo título** (primeira coluna) antes de agir:

- **Criar** (`action: "create"`): sempre adiciona uma linha nova — o
  item da Publicação manual ainda não está na planilha.
- **Editar** (`action: "update"`): procura pelo título de **antes** da
  edição (`oldTitulo` — o app manda isso mesmo se você mudou o título)
  e substitui os valores da linha; se não achar (editou um item que
  nunca esteve na planilha), adiciona uma linha nova.
- **Apagar** (`action: "delete"`): procura pelo título atual e só
  marca a coluna **Status** como "Deletado" — **nunca remove a
  linha**, pra manter histórico (mesmo princípio da Prática da Semana:
  nada se perde, só vira um registro de que foi apagado).

É preciso repetir o passo a passo abaixo **uma vez por categoria** (4
vezes) — cada planilha tem seu próprio script e sua própria variável de
ambiente. Até isso ser feito, a sincronização daquela categoria
específica é pulada silenciosamente (o item continua sendo
salvo/editado/apagado normalmente no Firestore — só não reflete na
planilha).

## Colunas de cada planilha

As colunas reais já existentes continuam as mesmas — só entram **2
colunas novas no final**, que você precisa adicionar manualmente antes
de colar o script (senão os dados de Formato/Status caem fora de
lugar):

| Categoria | Planilha | Colunas (nesta ordem, as 2 últimas são novas) |
|---|---|---|
| Livros | [abrir](https://docs.google.com/spreadsheets/d/1LKTCZBxk7Auotzb7ud9Z-HQ8a9E6I2xtYQRUpVptw34/edit?usp=sharing) | Título · Autor · Link para o livro · Link para capa · **Formato** · **Status** |
| Textos | [abrir](https://docs.google.com/spreadsheets/d/1wo1EkVy5bo8o6rZNUYSCrH2oDAJuiw-hQAR5s7oLIT4/edit?usp=sharing) | Título do Texto · Autor · Link para GDoc · **Formato** · **Status** |
| Orações | [abrir](https://docs.google.com/spreadsheets/d/1Hz3lTmV4ubosdQEFhE91RkYxrRf8AhCvFF7kHciO7tk/edit?usp=sharing) | Nome da oração · Link para Gdoc · **Formato** · **Status** |
| Músicas | [abrir](https://docs.google.com/spreadsheets/d/1tJy1a21XWSQOeTiYOcPXr-Rrt0n54ry_cK2UzZKQoMc/edit?usp=sharing) | Música · Autor · Link para Gdoc · **Formato** · **Status** |

- **Formato**: "GDoc", "Texto direto", "Streaming" ou o tipo de arquivo
  (ex.: "PDF"), calculado automaticamente pelo app a partir do que foi
  preenchido no item.
- **Status**: "Publicado", "Rascunho" ou "Deletado" — sempre o estado
  no momento da última ação sincronizada.

**Passo 0 (uma vez por planilha):** abra cada uma das 4 planilhas e
adicione manualmente as colunas "Formato" e "Status" no cabeçalho,
logo depois da última coluna existente.

## Passo a passo (repita para cada uma das 4 planilhas)

1. Abra a planilha da categoria → menu **Extensões → Apps Script**.
2. Apague o conteúdo padrão do editor e cole o script da categoria (veja
   abaixo — cada categoria tem um script próprio, só muda a ordem das
   colunas).
3. Clique em **Salvar** (ícone de disquete).
   - Se já existe uma implantação de uma versão anterior deste guia:
     **Implantar → Gerenciar implantações → ícone de lápis → Versão:
     Nova versão → Implantar** (a URL não muda, não mexe em nada no
     Cloudflare).
   - Se é a primeira vez nesta planilha: dê um nome ao projeto (ex.:
     "Sync Livros"), depois **Implantar → Nova implantação → App da
     Web**, com **Executar como: Eu** e **Quem pode acessar: Qualquer
     pessoa** → **Implantar**. Autorize o acesso quando pedir (é o seu
     próprio script pedindo permissão pra escrever na sua própria
     planilha). Copie a **URL do app da Web** (termina em `/exec`) e
     cadastre no Cloudflare Pages (seção abaixo).

### Script — Livros

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  var STATUS_COL = 6; // Título, Autor, Link, Capa, Formato, Status

  if (body.action === "delete") {
    var row = findRowByTitle(sheet, body.titulo);
    if (row > 0) sheet.getRange(row, STATUS_COL).setValue("Deletado");
  } else if (body.action === "update") {
    var row2 = findRowByTitle(sheet, body.oldTitulo || body.titulo);
    var values = [body.titulo || "", body.autor || "", body.link || "", body.capa || "", body.formato || "", body.status || ""];
    if (row2 > 0) sheet.getRange(row2, 1, 1, values.length).setValues([values]);
    else sheet.appendRow(values);
  } else {
    sheet.appendRow([body.titulo || "", body.autor || "", body.link || "", body.capa || "", body.formato || "", body.status || ""]);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function findRowByTitle(sheet, titulo) {
  if (!titulo) return -1;
  var data = sheet.getDataRange().getValues();
  var alvo = titulo.toString().trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][0] || "").toString().trim().toLowerCase() === alvo) return i + 1;
  }
  return -1;
}
```

### Script — Textos

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  var STATUS_COL = 5; // Título do Texto, Autor, Link, Formato, Status

  if (body.action === "delete") {
    var row = findRowByTitle(sheet, body.titulo);
    if (row > 0) sheet.getRange(row, STATUS_COL).setValue("Deletado");
  } else if (body.action === "update") {
    var row2 = findRowByTitle(sheet, body.oldTitulo || body.titulo);
    var values = [body.titulo || "", body.autor || "", body.link || "", body.formato || "", body.status || ""];
    if (row2 > 0) sheet.getRange(row2, 1, 1, values.length).setValues([values]);
    else sheet.appendRow(values);
  } else {
    sheet.appendRow([body.titulo || "", body.autor || "", body.link || "", body.formato || "", body.status || ""]);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function findRowByTitle(sheet, titulo) {
  if (!titulo) return -1;
  var data = sheet.getDataRange().getValues();
  var alvo = titulo.toString().trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][0] || "").toString().trim().toLowerCase() === alvo) return i + 1;
  }
  return -1;
}
```

### Script — Orações

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  var STATUS_COL = 4; // Nome da oração, Link, Formato, Status

  if (body.action === "delete") {
    var row = findRowByTitle(sheet, body.titulo);
    if (row > 0) sheet.getRange(row, STATUS_COL).setValue("Deletado");
  } else if (body.action === "update") {
    var row2 = findRowByTitle(sheet, body.oldTitulo || body.titulo);
    var values = [body.titulo || "", body.link || "", body.formato || "", body.status || ""];
    if (row2 > 0) sheet.getRange(row2, 1, 1, values.length).setValues([values]);
    else sheet.appendRow(values);
  } else {
    sheet.appendRow([body.titulo || "", body.link || "", body.formato || "", body.status || ""]);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function findRowByTitle(sheet, titulo) {
  if (!titulo) return -1;
  var data = sheet.getDataRange().getValues();
  var alvo = titulo.toString().trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][0] || "").toString().trim().toLowerCase() === alvo) return i + 1;
  }
  return -1;
}
```

### Script — Músicas

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  var STATUS_COL = 5; // Música, Autor, Link, Formato, Status

  if (body.action === "delete") {
    var row = findRowByTitle(sheet, body.titulo);
    if (row > 0) sheet.getRange(row, STATUS_COL).setValue("Deletado");
  } else if (body.action === "update") {
    var row2 = findRowByTitle(sheet, body.oldTitulo || body.titulo);
    var values = [body.titulo || "", body.interprete || "", body.link || "", body.formato || "", body.status || ""];
    if (row2 > 0) sheet.getRange(row2, 1, 1, values.length).setValues([values]);
    else sheet.appendRow(values);
  } else {
    sheet.appendRow([body.titulo || "", body.interprete || "", body.link || "", body.formato || "", body.status || ""]);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function findRowByTitle(sheet, titulo) {
  if (!titulo) return -1;
  var data = sheet.getDataRange().getValues();
  var alvo = titulo.toString().trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][0] || "").toString().trim().toLowerCase() === alvo) return i + 1;
  }
  return -1;
}
```

## Configurar no Cloudflare Pages

1. Vá em **Cloudflare Pages → seu projeto → Settings → Environment
   variables**.
2. Confirme que existe uma variável por categoria (você já tem as 4 de
   uma rodada anterior — só precisa reimplantar os scripts acima, a
   URL não muda):
   - `EXPO_PUBLIC_SHEET_WEBHOOK_LIVROS`
   - `EXPO_PUBLIC_SHEET_WEBHOOK_TEXTOS`
   - `EXPO_PUBLIC_SHEET_WEBHOOK_ORACOES`
   - `EXPO_PUBLIC_SHEET_WEBHOOK_MUSICAS`
3. **Importante:** essas variáveis só entram em vigor num deploy NOVO
   feito depois de salvá-las — nunca use "Retry" numa linha antiga da
   lista de Deployments (isso reroda o commit congelado daquela linha,
   não o mais recente). Para forçar um deploy novo, prefira empurrar um
   commit novo pro repositório.

## Se algo não funcionar

- **Nenhuma linha aparece/atualiza**: confira o nome exato da variável
  de ambiente pra aquela categoria, e se o deploy mais recente (não um
  Retry de uma linha antiga) já rodou depois de configurá-la.
- **Linha aparece, mas nas colunas erradas**: os `values`/`appendRow`
  do script estão numa ordem diferente da planilha real — ajuste a
  ordem pra bater com as colunas de verdade daquela planilha.
- **Editar/apagar não acha a linha**: o item foi criado antes de você
  ter as colunas Formato/Status, ou o título na planilha tem espaços
  extras/acentuação diferente do Firestore — o `findRowByTitle`
  compara ignorando maiúsculas/minúsculas e espaços nas pontas, mas não
  corrige erro de digitação.
- **Erro de autorização ao implantar**: normal na primeira vez — clique
  em "Avançado" → "Acessar [nome do projeto] (não seguro)" na tela de
  aviso do Google (é o aviso padrão para scripts que você mesmo
  escreveu/colou).
- A sincronização nunca impede o app de funcionar: se a planilha falhar
  por qualquer motivo, o item continua sendo salvo/editado/apagado
  normalmente no Firestore — só a planilha que não reflete naquela vez.
