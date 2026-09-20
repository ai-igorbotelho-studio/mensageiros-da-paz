// Injeta meta tags de SEO/Open Graph no index.html gerado pelo `expo
// export -p web` — o Expo SDK 51 não expõe essas tags via app.json, e o
// nome do bundle JS muda a cada build (hash), então não dá pra manter um
// index.html estático em app/public/. Roda como passo de `build:web`
// depois do export. Ver DECISIONS.md 2026-09-21.
const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "..", "dist", "index.html");
const SITE_URL = "https://mensageiros-da-paz.pages.dev";
const DESCRIPTION =
  "Orações, músicas e leituras para a caminhada espiritual em grupo. Uma prática por semana, sempre à mão.";

const metaTags = `
    <meta name="description" content="${DESCRIPTION}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Mensageiros da Paz" />
    <meta property="og:title" content="Mensageiros da Paz" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:image" content="${SITE_URL}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Mensageiros da Paz" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="${SITE_URL}/og-image.png" />
`;

let html = fs.readFileSync(INDEX_PATH, "utf8");
html = html.replace("</title>", "</title>" + metaTags);
fs.writeFileSync(INDEX_PATH, html);
console.log("Meta tags de SEO/Open Graph injetadas em dist/index.html");
