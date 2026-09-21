/**
 * Converte um link de compartilhamento do Google Drive (página de
 * visualização HTML, ex. .../file/d/{id}/view?usp=sharing) para a URL de
 * conteúdo direto (.../uc?export=view&id={id}) — necessário pra tocar
 * áudio ou exibir imagem embutida no app. Um link "view" normal retorna
 * HTML, não os bytes do arquivo, então `Audio.Sound`/`<Image>` falham
 * silenciosamente ao tentar carregar.
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

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
