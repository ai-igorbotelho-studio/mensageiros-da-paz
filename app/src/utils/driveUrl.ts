/**
 * Converte um link de compartilhamento do Google Drive (página de
 * visualização HTML, ex. .../file/d/{id}/view?usp=sharing) para a URL de
 * conteúdo direto — necessário pra tocar áudio ou exibir imagem embutida
 * no app. Um link "view" normal retorna HTML, não os bytes do arquivo,
 * então `Audio.Sound`/`<Image>` falham silenciosamente ao tentar
 * carregar.
 *
 * Usa `export=download` (não `export=view`): pra arquivos que não são
 * imagem (áudio, por exemplo), `export=view` frequentemente devolve a
 * página HTML de pré-visualização em vez dos bytes brutos — é isso que
 * fazia a música não tocar. `export=download` serve o conteúdo direto
 * tanto pra imagem quanto pra áudio, enquanto o arquivo for pequeno o
 * bastante pra não disparar o aviso de "não foi possível escanear" do
 * Drive (funciona bem pros tamanhos típicos de mp3/imagem usados aqui).
 *
 * PDF não precisa disso — abre externamente via `Linking.openURL`, e o
 * próprio Google trata a visualização nesse caso.
 *
 * Qualquer outra URL (Cloudflare, Dropbox, etc.) passa direto, sem
 * alteração.
 */
export function toDirectFileUrl(url: string): string {
  if (!url.includes("drive.google.com")) return url;

  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = fileIdMatch?.[1];
  if (!fileId) return url;

  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Converte um link de um Google Doc (.../document/d/{id}/edit?usp=sharing)
 * para a URL de exportação em texto puro (.../export?format=txt) — usada
 * pra ler o conteúdo do documento ao vivo dentro do app (categoria
 * "gdoc" em `FileType`), sem precisar copiar/colar o texto manualmente
 * no admin. O documento precisa estar compartilhado como "Qualquer
 * pessoa com o link".
 */
export function toGoogleDocsTextExportUrl(url: string): string | null {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  const docId = match?.[1];
  if (!docId) return null;
  return `https://docs.google.com/document/d/${docId}/export?format=txt`;
}
