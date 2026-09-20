# Sincronizar Prática da Semana com a planilha "Mensageiros da Paz"

Planilha: https://docs.google.com/spreadsheets/d/1XW55nKnnHtEEfp6tNDDQHI-XW_4aONsXMKBWI1s4OAA/edit?usp=sharing

Colunas (nessa ordem, já existentes): **Prática da semana · Inspiração ·
Data · Quem publicou**.

O Firestore guarda só a prática **atual** (sobrescrita a cada edição no
`/admin`) — a planilha é o histórico. O app envia uma linha nova
automaticamente toda vez que alguém salva a Prática da Semana no painel,
via um **Google Apps Script Web App** vinculado à própria planilha
(gratuito, sem Firebase Storage/Blaze, sem cartão).

## Passo a passo (uma vez só)

1. Abra a planilha → menu **Extensões → Apps Script**.
2. Apague o conteúdo padrão do editor e cole isto:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var body = JSON.parse(e.postData.contents);
  sheet.appendRow([
    body.practiceText || "",
    body.inspiration || "",
    body.date ? new Date(body.date) : new Date(),
    body.publishedBy || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

3. Clique em **Salvar** (ícone de disquete), dê um nome ao projeto (ex.:
   "Sync Prática da Semana").
4. Clique em **Implantar → Nova implantação**.
5. No tipo, escolha **App da Web**.
6. Configurações:
   - **Executar como**: Eu (sua conta)
   - **Quem pode acessar**: Qualquer pessoa
7. Clique em **Implantar**. Autorize o acesso quando pedir (é o seu
   próprio script pedindo permissão pra escrever na sua própria planilha).
8. Copie a **URL do app da Web** que aparece (termina em `/exec`).

## Configurar no Cloudflare Pages

1. Vá em **Cloudflare Pages → seu projeto → Settings → Environment
   variables**.
2. Adicione uma variável nova:
   - Nome: `EXPO_PUBLIC_PRACTICE_SHEET_WEBHOOK_URL`
   - Valor: a URL copiada no passo 8 acima
3. Salve e force um novo deploy (**Deployments → Retry deployment** no
   mais recente, ou aguarde o próximo push).

Pronto — a partir do próximo deploy, toda vez que a Prática da Semana for
salva no `/admin`, uma linha nova aparece na planilha automaticamente.

## Se algo não funcionar

- **Nenhuma linha aparece**: confira se a variável de ambiente está com o
  nome exato `EXPO_PUBLIC_PRACTICE_SHEET_WEBHOOK_URL` e se o deploy mais
  recente já rodou depois de configurá-la.
- **Erro de autorização ao implantar**: normal na primeira vez — clique em
  "Avançado" → "Acessar [nome do projeto] (não seguro)" na tela de aviso
  do Google (é o aviso padrão para scripts que você mesmo escreveu/colou).
- A sincronização nunca impede o app de funcionar: se a planilha falhar
  por qualquer motivo, a Prática da Semana continua salva normalmente no
  Firestore — só a cópia na planilha que não é criada naquela vez.
