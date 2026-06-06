// Avatar SVG determinístico a partir do nome (hash). Mesma entrada => mesmo rosto.
// Camisa na cor da raridade, com número. Cabelo/pele/rosto variam por hash.

import { RARITY } from '../data/constants.js';

// hash djb2 simples e estável
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return h >>> 0;
}

const SKIN = ['#f8d5c2', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
const HAIR = ['#1a1a1a', '#5a3825', '#d9b56b', '#a0522d', '#e8c84a']; // preto, castanho, loiro, ruivo, dourado
// estilos: 0 curto, 1 moicano, 2 cacheado, 3 longo, 4 raspado
const HAIR_STYLES = 5;
const SHIRT_STYLES = 3; // 0 lisa, 1 listrada, 2 dividida

function pickIdx(h, shift, mod) {
  return Math.floor(h / Math.pow(2, shift)) % mod;
}

function Hair({ style, color, skin }) {
  switch (style) {
    case 0: // curto (touca arredondada cobrindo o topo)
      return <path d="M22 44 A28 28 0 0 1 78 44 L78 40 A28 26 0 0 0 22 40 Z" fill={color} />;
    case 1: // moicano
      return (
        <>
          <path d="M24 42 A26 26 0 0 1 76 42 L76 41 A26 24 0 0 0 24 41 Z" fill={color} opacity="0.0" />
          <rect x="46" y="14" width="8" height="26" rx="4" fill={color} />
        </>
      );
    case 2: // cacheado (bolinhas no topo)
      return (
        <g fill={color}>
          {[28, 38, 48, 58, 68].map((cx, i) => (
            <circle key={i} cx={cx} cy={24 - (i % 2) * 4} r="9" />
          ))}
          <path d="M22 44 A28 28 0 0 1 78 44 L78 42 A28 24 0 0 0 22 42 Z" />
        </g>
      );
    case 3: // longo (desce pelas laterais)
      return (
        <g fill={color}>
          <path d="M20 44 A30 30 0 0 1 80 44 L80 38 A30 28 0 0 0 20 38 Z" />
          <path d="M20 44 L20 78 Q26 82 30 76 L30 48 Z" />
          <path d="M80 44 L80 78 Q74 82 70 76 L70 48 Z" />
        </g>
      );
    case 4: // raspado (sombra fina no topo, mostra pele)
    default:
      return <path d="M26 40 A24 24 0 0 1 74 40 L74 38 A24 22 0 0 0 26 38 Z" fill={color} opacity="0.55" />;
  }
}

function Shirt({ style, color, number }) {
  const dark = shade(color, -0.25);
  return (
    <g>
      {/* tronco/camisa */}
      <path d="M26 128 L26 96 Q26 84 40 80 L60 80 Q74 84 74 96 L74 128 Z" fill={color} />
      {/* ombros */}
      <path d="M40 80 Q50 92 60 80 L60 80 Q74 84 74 92 L74 96 Q62 88 50 96 Q38 88 26 96 L26 92 Q26 84 40 80 Z" fill={dark} opacity="0.5" />
      {style === 1 && (
        <g stroke={dark} strokeWidth="4" opacity="0.85">
          <line x1="36" y1="80" x2="36" y2="128" />
          <line x1="50" y1="80" x2="50" y2="128" />
          <line x1="64" y1="80" x2="64" y2="128" />
        </g>
      )}
      {style === 2 && <path d="M50 80 L50 128 L74 128 L74 96 Q74 84 60 80 Z" fill={dark} opacity="0.6" />}
      {/* número */}
      <text
        x="50"
        y="116"
        textAnchor="middle"
        fontFamily="'Baloo 2', sans-serif"
        fontWeight="800"
        fontSize="20"
        fill="#ffffff"
        opacity="0.95"
      >
        {number}
      </text>
    </g>
  );
}

// clareia/escurece uma cor hex
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r + r * amt)));
  g = Math.max(0, Math.min(255, Math.round(g + g * amt)));
  b = Math.max(0, Math.min(255, Math.round(b + b * amt)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function Avatar({ player, size = 120 }) {
  const h = hashStr(player.name);
  const skin = SKIN[pickIdx(h, 0, SKIN.length)];
  const hairColor = HAIR[pickIdx(h, 3, HAIR.length)];
  const hairStyle = pickIdx(h, 6, HAIR_STYLES);
  const shirtStyle = pickIdx(h, 9, SHIRT_STYLES);
  const shirtColor = (RARITY[player.rarity] || RARITY.COMUM).color;
  const eyeY = 44;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 130"
      width={size}
      height={size * 1.3}
      aria-label={player.name}
    >
      {/* orelhas */}
      <circle cx="22" cy={eyeY} r="6" fill={skin} />
      <circle cx="78" cy={eyeY} r="6" fill={skin} />
      {/* cabeça */}
      <circle cx="50" cy="42" r="28" fill={skin} />
      {/* cabelo (atrás dos olhos) */}
      <Hair style={hairStyle} color={hairColor} skin={skin} />
      {/* sobrancelhas */}
      <g stroke={shade(hairColor, -0.2)} strokeWidth="2.5" strokeLinecap="round">
        <line x1="36" y1={eyeY - 6} x2="46" y2={eyeY - 7} />
        <line x1="54" y1={eyeY - 7} x2="64" y2={eyeY - 6} />
      </g>
      {/* olhos */}
      <g fill="#27313a">
        <circle cx="41" cy={eyeY} r="3" />
        <circle cx="59" cy={eyeY} r="3" />
      </g>
      {/* boca sorrindo */}
      <path d="M40 54 Q50 62 60 54" fill="none" stroke="#9b4a3a" strokeWidth="2.5" strokeLinecap="round" />
      {/* nariz */}
      <path d="M50 46 L48 52 L52 52 Z" fill={shade(skin, -0.18)} />
      {/* camisa */}
      <Shirt style={shirtStyle} color={shirtColor} number={player.number} />
    </svg>
  );
}
