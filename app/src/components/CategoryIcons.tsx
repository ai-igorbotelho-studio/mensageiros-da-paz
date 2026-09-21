import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

/**
 * Ícones minimalistas em SVG puro (sem fonte de ícone) — desenhados no
 * mesmo estilo de linha do protótipo original (docs/UX-ARCHITECTURE.md,
 * artboards Oracoes.dc.html/Musicas.dc.html/etc). SVG não depende de
 * nenhum carregamento de fonte externo, evitando os bugs de
 * `@expo/vector-icons` (fonte travando/não renderizando no web) — ver
 * DECISIONS.md 2026-09-21. Nunca emoji, a pedido do Head.
 */

interface IconProps {
  size?: number;
  color?: string;
}

export function PrayerIcon({ size = 20, color = "#FFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c2.5 3 4 6.2 4 9a4 4 0 0 1-8 0c0-2.8 1.5-6 4-9Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M12 12v7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MusicIcon({ size = 20, color = "#FFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18V5.5L20 4v12.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={6.5} cy={18} r={2.5} stroke={color} strokeWidth={1.6} />
      <Circle cx={17.5} cy={16.5} r={2.5} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function TextIcon({ size = 20, color = "#FFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 4h14M5 9h14M5 14h10M5 19h7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BookIcon({ size = 20, color = "#FFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6.5c-1.5-1.2-3.6-1.8-6.5-1.8v13c2.9 0 5 .6 6.5 1.8M12 6.5c1.5-1.2 3.6-1.8 6.5-1.8v13c-2.9 0-5 .6-6.5 1.8M12 6.5v13"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Ícone de "engrenagem" pra Configurações, substituindo o glifo Unicode
 * "⚙" usado antes (`RootNavigator.tsx`) — renderiza colorido/como
 * emoji em algumas plataformas, contra a regra "nunca emoji"
 * (achado na auditoria de direção criativa pré-V1.0, 2026-09-21).
 */
export function GearIcon({ size = 20, color = "#FFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.6} />
      <Path
        d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6M17.7 17.7l-1.6-1.6M7.9 7.9 6.3 6.3"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
