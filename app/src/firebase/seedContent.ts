import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseReady } from "./config";
import type { ContentCategory, ContentSource, FileType } from "@/types";

/**
 * Conteúdo inicial real do app (docs/CONTENT-SEED.md), cadastrado via
 * botão "Importar conteúdo inicial" no /admin (2026-09-21) — em vez de
 * exigir credenciais de admin fora do app, roda dentro da sessão já
 * autenticada de quem clicar. As 8 orações usam o campo `text` (texto
 * direto, sem arquivo) com o texto extraído do protótipo original. Os 18
 * livros apontam para os links do Google Drive do Head. A música
 * "Guerreiro do Bem" aponta para o áudio servido pelo Cloudflare Pages
 * (`app/content-src/musicas/`).
 */

interface SeedItem {
  title: string;
  description?: string;
  category: ContentCategory;
  source: ContentSource;
  text?: string;
  fileUrl?: string;
  fileType?: FileType;
  streamingProvider?: string;
  streamingUrl?: string;
  order: number;
}

const ORACOES: SeedItem[] = [
  {
    title: "Prece de Cáritas",
    category: "oracoes",
    source: "upload",
    order: 1,
    text: `Deus, nosso Pai, que sois todo poder e bondade, daí forças àqueles que passam pela provação, daí luz àqueles que procuram a verdade, ponde no coração do homem a compaixão e a caridade!

Deus! Dai ao viajor a estrela guia, ao aflito a consolação, ao doente o repouso. Pai! Daí ao culpado o arrependimento, ao espírito a verdade, à criança o guia, ao órfão o pai.

Senhor! Que a vossa bondade se estenda sobre tudo que criastes. Piedade, Senhor, para aqueles que Vos não conhecem, esperança para aqueles que sofrem. Que a Vossa bondade permita aos espíritos consoladores derramarem por toda a parte a paz, a esperança e a fé!

Deus! Um raio, uma centelha do Vosso amor pode iluminar a terra; deixai-nos beber nas fontes dessa bondade fecunda e infinita e todas as lágrimas secarão, todas as dores se acalmarão. Um só coração, um só pensamento subirá até Vós como um grito de reconhecimento e de amor.`,
  },
  {
    title: "Consagração do Aposento",
    category: "oracoes",
    source: "upload",
    order: 2,
    text: `Dentro do círculo infinito da divina presença que me envolve inteiramente, afirmo: há uma só presença aqui, é a da Harmonia, que faz vibrar todos os corações de felicidade e alegria. Quem quer que aqui entre, sentirá as vibrações da Divina Harmonia.

Há uma só presença aqui, é a do Amor. Deus é o Amor que envolve todos os seres num só sentimento de unidade. Este recinto está cheio da presença do Amor. No Amor eu vivo, me movo e existo. Quem quer que aqui entre, sentirá a pura e santa presença do Amor.

Há uma só presença aqui, é a da Verdade. Tudo que aqui existe, tudo que aqui se fala, tudo que se pensa é a expressão da Verdade. Quem quer que aqui entre, sentirá a presença da Verdade.`,
  },
  {
    title: "Pai Nosso",
    category: "oracoes",
    source: "upload",
    order: 3,
    text: `Pai nosso, que estais nos céus, santificado seja o Vosso nome. Venha a nós o Vosso reino, seja feita a Vossa vontade, assim na terra como no céu.

O pão nosso de cada dia nos dai hoje, perdoai as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido.

E não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.`,
  },
  {
    title: "Ave Maria",
    category: "oracoes",
    source: "upload",
    order: 4,
    text: `Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus.

Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora da nossa morte. Amém.`,
  },
  {
    title: "A Grande Invocação",
    category: "oracoes",
    source: "upload",
    order: 5,
    text: `Do ponto de Luz na mente de Deus, flua Luz à mente dos homens; que a Luz desça à Terra.

Do ponto de Amor no coração de Deus, flua o Amor ao coração dos homens; que o Amor desça à Terra.

Do centro onde é conhecida a vontade de Deus, o propósito guie as pequenas vontades dos homens — o propósito que os Mestres conhecem e servem.

Do centro a que chamamos gênero humano, cumpra-se o plano de Amor e de Luz, e que aprendamos a transcender todo o mal.

Que a Luz, o Amor e o Poder restabeleçam o Plano Divino sobre a Terra.`,
  },
  {
    title: "Oração de São Francisco",
    category: "oracoes",
    source: "upload",
    order: 6,
    text: `Senhor, fazei de mim um instrumento de vossa paz. Onde houver ódio, que eu leve o amor; onde houver ofensa, que eu leve o perdão; onde houver discórdia, que eu leve a união.

Onde houver dúvida, que eu leve a fé; onde houver erro, que eu leve a verdade; onde houver desespero, que eu leve a esperança; onde houver tristeza, que eu leve a alegria; onde houver trevas, que eu leve a luz!

Ó Mestre, fazei que eu procure mais consolar, que ser consolado; compreender, que ser compreendido; amar, que ser amado. Pois é dando que se recebe, perdoando que se é perdoado, e é morrendo que se vive para a vida eterna.`,
  },
  {
    title: "Prece ao Dr. Bezerra de Menezes",
    category: "oracoes",
    source: "upload",
    order: 7,
    text: `Nós Te rogamos, Pai de infinita Bondade e Justiça, o auxílio de Jesus Cristo, através de Bezerra de Menezes e suas legiões de companheiros; que eles nos assistam, Senhor, consolando os aflitos, curando aqueles que se tornam merecedores, confortando aqueles que tiverem suas provas e expiações a passar, esclarecendo aos que desejarem conhecer a verdade e assistindo a todos quantos apelam ao Teu infinito Amor.

Jesus, Divino portador da Graça e da Verdade, estende Tuas mãos dadivosas em socorro daqueles que Te reconhecem o Despenseiro Fiel e Prudente.

Faze-o, Divino Modelo, através de Tuas legiões consoladoras, de Teus bons espíritos, a fim de que a Fé se eleve, a Esperança aumente, a Bondade se expanda e o Amor triunfe sobre todas as coisas.

Bezerra de Menezes, Apóstolo do Bem e da Paz, Amigo dos humildes e dos enfermos, movimenta as tuas falanges amigas em benefício daqueles que sofrem, sejam males físicos ou espirituais.`,
  },
  {
    title: "Oração a Saint Germain",
    category: "oracoes",
    source: "upload",
    order: 8,
    text: `Ó Saint Germain, envia a Chama Violeta para o mais fundo do meu ser. Amados Zadkiel e Oromasis, expandi, intensificai com vosso poder.

Vinde com vossa chama saturar, penetrar, expandir livremente, para a mente de Deus libertar, neste instante e eternamente.

Eu Sou a Chama Violeta que consome e transmuta toda energia que não seja luz, paz, amor e liberdade.`,
  },
];

const LIVROS: SeedItem[] = [
  { title: "O Livro Tibetano dos Mortos", category: "livros", source: "upload", fileType: "pdf", order: 1, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzLUZBLUtSZnRpUUk/view?usp=sharing&resourcekey=0-ppwSNZG14VAUwq66cmwX3A" },
  { title: "O Evangelho de Judas", category: "livros", source: "upload", fileType: "pdf", order: 2, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzVlBQWmhha1BUUjA/view?usp=drive_link&resourcekey=0-C5y6sHN9ibGf35VwSk4usg" },
  { title: "O Evangelho Essênio da Paz", category: "livros", source: "upload", fileType: "pdf", order: 3, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzcWpKaG9iOUF1LVE/view?usp=drive_link&resourcekey=0-boiN9wW6XD3xG78F-DX0Dg" },
  { title: "O Caibalion", category: "livros", source: "upload", fileType: "pdf", order: 4, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzVVE3RWlCdElJdU0/view?usp=drive_link&resourcekey=0-A_db9hbE3LbM5xeBNUQHXQ" },
  { title: "Corpus Hermeticum", description: "Hermes Trismegisto", category: "livros", source: "upload", fileType: "pdf", order: 5, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzVHdNNDZjYWh6VU0/view?usp=drive_link&resourcekey=0-QD5c3115LhuX__W06zd1Xw" },
  { title: "O Livro de Enoque", category: "livros", source: "upload", fileType: "pdf", order: 6, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzVzRTNnR0SVpGaFU/view?usp=drive_link&resourcekey=0-THhf3SP_uXKynNPnlhzv1w" },
  { title: "Dicionário Rosacruz", category: "livros", source: "upload", fileType: "pdf", order: 7, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzM2txbWIyeUlCdEU/view?usp=drive_link&resourcekey=0-cIIv-Gjpp-cVuWCIz2Yy5Q" },
  { title: "Atlântida e Lemúria, continentes desaparecidos", description: "W. Scott-Elliot", category: "livros", source: "upload", fileType: "pdf", order: 8, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzVm9DWGZvVEVzZXM/view?usp=drive_link&resourcekey=0-SuLDhZFp1qDBM7m6mIaubQ" },
  { title: "Pistis Sofia II", category: "livros", source: "upload", fileType: "pdf", order: 9, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzN001TlJCMkJWR0U/view?usp=drive_link&resourcekey=0-iDi6CPmD3JwjGuQC0-a5hw" },
  { title: "Ramatis — O Astro Intruso", category: "livros", source: "upload", fileType: "pdf", order: 10, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzQUZZdVpLYUY5eGM/view?usp=drive_link&resourcekey=0-xeQ_IMPXkya0puAcGbaNSg" },
  { title: "Pistis Sofia III", category: "livros", source: "upload", fileType: "pdf", order: 11, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzRTBFaDNKZHZhVWs/view?usp=drive_link&resourcekey=0-ZOQcHw0EyvJ9KHxe-sPIZQ" },
  { title: "O Livro de Ouro de Saint Germain", category: "livros", source: "upload", fileType: "pdf", order: 12, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzaFY3V3ZKZksyS2M/view?usp=drive_link&resourcekey=0-1hPhPuZfoy82YZld58RZsA" },
  { title: "Pistis Sofia", category: "livros", source: "upload", fileType: "pdf", order: 13, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzbXNaT2R3N29hMzQ/view?usp=drive_link&resourcekey=0-nyJ-yClLMDYUPH-i_LdnHA" },
  { title: "Bhagavad Gita", description: "PT-BR", category: "livros", source: "upload", fileType: "pdf", order: 14, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzYU5DRHQwVDh4Ymc/view?usp=drive_link&resourcekey=0-gaPiUDTWo5SnCAMgh44IgA" },
  { title: "Poemas Ocultistas", description: "Fernando Pessoa", category: "livros", source: "upload", fileType: "pdf", order: 15, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzUzZKYW5QdFVDT1E/view?usp=drive_link&resourcekey=0-E18JOztQXMeJk2mgnp--uA" },
  { title: "A Doutrina Secreta", description: "Helena Blavatsky", category: "livros", source: "upload", fileType: "pdf", order: 16, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzUFVwa09ZczgwVVU/view?usp=drive_link&resourcekey=0-PkfBo56-KIyhw0UXvg4Kdw" },
  { title: "Mãos de Luz", description: "Barbara Ann Brennan", category: "livros", source: "upload", fileType: "pdf", order: 17, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzME5LOVVxVkFTeVU/view?usp=drive_link&resourcekey=0-YFA1ch6EFhY-8G6zjxGpbA" },
  { title: "Courageous Dreaming", category: "livros", source: "upload", fileType: "pdf", order: 18, fileUrl: "https://drive.google.com/file/d/0B0HNPNo_DmQzNThtUWtDS1NwQTg/view?usp=drive_link&resourcekey=0-dbdHNrEhWXY0g1Xv4tdGMA" },
];

const MUSICAS: SeedItem[] = [
  {
    title: "Guerreiro do Bem",
    description: "Pablo Sganzerla · 2014",
    category: "musicas",
    source: "upload",
    fileType: "audio",
    order: 1,
    fileUrl: "https://mensageiros-da-paz.pages.dev/content/musicas/Guerreiro-do-Bem.mp3",
  },
];

export const SEED_ITEMS: SeedItem[] = [...ORACOES, ...LIVROS, ...MUSICAS];

export async function seedInitialContent(
  adminEmail: string,
  onProgress?: (done: number, total: number) => void
): Promise<{ created: number; failed: number }> {
  if (!firebaseReady || !db) throw new Error("Firebase não configurado");
  const itemsRef = collection(db, "items");
  let created = 0;
  let failed = 0;
  for (let i = 0; i < SEED_ITEMS.length; i++) {
    const item = SEED_ITEMS[i];
    try {
      await addDoc(itemsRef, {
        title: item.title,
        description: item.description ?? null,
        category: item.category,
        source: item.source,
        text: item.text ?? null,
        file_url: item.fileUrl ?? null,
        file_type: item.fileType ?? null,
        mime_type: item.fileType === "pdf" ? "application/pdf" : item.fileType === "audio" ? "audio/mpeg" : null,
        file_size_bytes: null,
        streaming_provider: item.streamingProvider ?? null,
        streaming_url: item.streamingUrl ?? null,
        order: item.order,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: adminEmail,
        published: true,
      });
      created++;
    } catch {
      failed++;
    }
    onProgress?.(i + 1, SEED_ITEMS.length);
  }
  return { created, failed };
}
