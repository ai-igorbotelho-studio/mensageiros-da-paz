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
export function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

export function toDirectFileUrl(url: string): string {
  if (!url.includes("drive.google.com")) return url;
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * URL do player embutido oficial do Drive (.../file/d/{id}/preview) —
 * usado pra ÁUDIO hospedado no Drive na versão web, em vez de tentar
 * tocar via `Audio.Sound` com a URL de `toDirectFileUrl`. Mesmo depois
 * de trocar pra `export=download`, áudio do Drive continuava sem
 * tocar (relatado de novo em 2026-09-21) — o endpoint `uc?export=...`
 * serve o arquivo com `Content-Disposition: attachment`, o que faz o
 * navegador tentar baixar em vez de reproduzir inline, e quebra
 * requisições por intervalo (necessárias pra tocar/buscar posição no
 * áudio). O player embutido do Drive é a própria Google resolvendo
 * isso — sem CORS, sem download forçado, sem depender de parâmetro de
 * URL nenhum.
 */
export function toGoogleDrivePreviewUrl(url: string): string | null {
  if (!url.includes("drive.google.com")) return null;
  const fileId = extractDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Endpoint mais novo do Drive pra baixar/streamar bytes
 * (`drive.usercontent.google.com`, em vez do `drive.google.com/uc`
 * legado) — trata melhor requisições por intervalo (necessárias pra
 * áudio tocar/buscar posição no navegador). Usado como PRIMEIRA
 * tentativa pro player customizado do próprio app (com play/pause,
 * parar, volume — a cara do app, em vez da interface do Google); só
 * cai pro iframe do Drive (`toGoogleDrivePreviewUrl`) se isso falhar,
 * porque o iframe sempre funciona mas não dá pra estilizar (é de
 * outro domínio).
 */
export function toGoogleDriveAudioStreamUrl(url: string): string | null {
  if (!url.includes("drive.google.com")) return null;
  const fileId = extractDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
}

/**
 * URL de conteúdo de IMAGEM do Drive via `lh3.googleusercontent.com`
 * (o mesmo domínio de CDN que o próprio Drive/Fotos usa pra servir
 * miniaturas e imagens embutidas). `toDirectFileUrl` (`uc?export=...`)
 * também tem o problema do `Content-Disposition: attachment` — força
 * download em vez de exibir inline, então um `<Image>` com essa URL
 * simplesmente não renderiza nada (relatado 2026-09-21: capas de
 * livro reimportadas continuavam não aparecendo, mesmo com o link
 * certo na planilha). Esse domínio serve a imagem direto, sem forçar
 * download — mesmo princípio da correção já aplicada em áudio.
 */
export function toGoogleDriveImageUrl(url: string): string {
  if (!url.includes("drive.google.com")) return url;
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  // `=s0` (tamanho original) — sem sufixo de tamanho, esse domínio às
  // vezes recusa a servir a imagem pra alguns arquivos.
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

/**
 * Segunda tentativa, usada só se `toGoogleDriveImageUrl` falhar
 * (`onError` do `<Image>`) — `export=view` funciona pra IMAGEM
 * especificamente (diferente de áudio, onde causava o bug do
 * download forçado). Mantido como fallback, não como padrão, porque
 * `lh3.googleusercontent.com` é mais consistente na prática.
 */
export function toGoogleDriveImageFallbackUrl(url: string): string | null {
  if (!url.includes("drive.google.com")) return null;
  const fileId = extractDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
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
