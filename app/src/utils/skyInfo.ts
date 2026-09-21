/**
 * Data, estação do ano e fase da lua para a Home, sempre calculados pro
 * fuso de São Paulo (America/Sao_Paulo) — a pedido do Head (2026-09-21),
 * independente do fuso do aparelho de quem usa o app.
 *
 * Tudo aqui é cálculo puro (sem chamada de rede): estação do ano usa as
 * datas fixas de início de estação no hemisfério sul, e a fase da lua usa
 * o algoritmo padrão do ciclo sinódico (referência: lua nova de
 * 2000-01-06 18:14 UTC, período de 29.53058867 dias). Isso mantém o
 * custo zero (sem API paga, sem Cloud Function) e funciona offline —
 * "atualiza diariamente" porque é sempre recalculado a partir da data
 * atual, nunca de um valor salvo.
 */

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

interface SaoPauloParts {
  year: number;
  month: number; // 1-12
  day: number;
  timestamp: number; // ms UTC, meio-dia do dia em São Paulo — estável pro cálculo da lua
}

function getSaoPauloParts(reference: Date): SaoPauloParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(reference);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const year = get("year");
  const month = get("month");
  const day = get("day");
  // meio-dia UTC do dia civil em São Paulo, só pra ter um instante estável
  // dentro do dia certo pro cálculo da fase lunar (evita virar de dia por
  // causa de fuso na hora de calcular).
  const timestamp = Date.UTC(year, month - 1, day, 12, 0, 0);
  return { year, month, day, timestamp };
}

export function formatSaoPauloDate(reference: Date = new Date()): string {
  const { year, month, day } = getSaoPauloParts(reference);
  return `${day} de ${MONTHS_PT[month - 1]}, ${year}`;
}

/**
 * Estações do hemisfério sul, com datas fixas de início — precisão de
 * dia é suficiente pro contexto (referência espiritual/contemplativa),
 * não uma ferramenta astronômica de precisão.
 */
export function getSeason(reference: Date = new Date()): string {
  const { month, day } = getSaoPauloParts(reference);
  const md = month * 100 + day;
  if (md >= 1221 || md < 320) return "Verão";
  if (md >= 320 && md < 621) return "Outono";
  if (md >= 621 && md < 923) return "Inverno";
  return "Primavera";
}

const SYNODIC_MONTH_DAYS = 29.53058867;
// Lua nova de referência: 2000-01-06 18:14 UTC.
const REFERENCE_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

const MOON_PHASES_PT = [
  "Lua Nova",
  "Lua Crescente",
  "Quarto Crescente",
  "Lua Gibosa Crescente",
  "Lua Cheia",
  "Lua Gibosa Minguante",
  "Quarto Minguante",
  "Lua Minguante",
];

export function getMoonPhase(reference: Date = new Date()): string {
  const { timestamp } = getSaoPauloParts(reference);
  const daysSinceReference = (timestamp - REFERENCE_NEW_MOON_UTC) / 86400000;
  const cyclePosition = daysSinceReference / SYNODIC_MONTH_DAYS;
  const fraction = cyclePosition - Math.floor(cyclePosition); // 0..1
  const index = Math.floor(fraction * 8 + 0.5) % 8;
  return MOON_PHASES_PT[index];
}

export function getDayInfo(reference: Date = new Date()): {
  date: string;
  season: string;
  moonPhase: string;
} {
  return {
    date: formatSaoPauloDate(reference),
    season: getSeason(reference),
    moonPhase: getMoonPhase(reference),
  };
}
