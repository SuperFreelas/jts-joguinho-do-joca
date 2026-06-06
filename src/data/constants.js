// ===========================================================================
// GOL A GOL — Edição Noturna :: Constantes
// Coordenadas SEMPRE em unidades lógicas (W x H). DPR é tratado no canvas.
// Velocidades SEMPRE em px/TICK (tick fixo = 1000/60 ms). Nunca px/frame.
// ===========================================================================

// --- Campo (área lógica) — PAISAGEM (deitado para TV 16:9) ---
// Gols nas laterais esquerda (P2 azul) e direita (P1 amarelo).
// Bola viaja na horizontal; quica nas paredes de cima/baixo (y=0, y=H).
export const FIELD = {
  W: 854,
  H: 480,
};

// --- Loop ---
export const TICK_MS = 1000 / 60; // 16.667ms — 1 passo lógico
export const MAX_TICKS_PER_FRAME = 5; // clamp anti "spiral of death"

// --- Tema noturno ---
export const COLORS = {
  bg: '#0d2818',
  stripeA: '#1a4d2e',
  stripeB: '#164428',
  line: '#88ccaa',
  lineAlpha: 0.4,
  post: '#ccddcc',
  spotlight: 'rgba(180, 255, 210, 0.10)',
  p1: '#ffcc00', // jogador 1 (baixo)
  p2: '#3399ff', // jogador 2 (cima)
  ball: '#ffffff',
  goalFlash: 'rgba(255, 220, 60, 0.55)',
  net: 'rgba(200, 221, 204, 0.30)',
  timerWarn: '#ff4d4d',
  hud: '#eafff2',
};

// --- Gols (abertura nas laterais; resto da lateral é parede) ---
export const GOAL = {
  OPENING: 170, // altura da abertura do gol (eixo Y), centralizada
  DEPTH: 18, // profundidade visual da rede (eixo X)
};

// --- Goleiros (paddles) — barras VERTICAIS nas laterais ---
export const PADDLE = {
  LEN: 70, // comprimento (eixo Y)
  THICK: 12, // espessura (eixo X)
  R: 6, // raio das bordas
  SPEED: 6.5, // px/tick no input máximo (movimento vertical)
  MARGIN_X: 30, // distância da borda esquerda/direita
};

// --- Bola ---
export const BALL = {
  R: 9,
  INITIAL_SPEED: 4.2, // px/tick
  MAX_SPEED: 15, // px/tick
  RALLY_FACTOR: 0.08, // vel *= (1 + 0.08 * rallies) a cada defesa
  LEGEND_BOOST: 1.12, // colisão com lendário acelera 12%
  MAX_BOUNCE_ANGLE: (60 * Math.PI) / 180, // ângulo máx ao defletir na ponta
  // Reset pós-gol: decaimento por tick até INITIAL_SPEED
  RESET_DECAY: 0.85,
};

// --- Tempos ---
export const TIMER = {
  MATCH_SECONDS: 60,
  WARN_SECONDS: 10, // cronômetro vermelho
  GOAL_PAUSE_MS: 800, // pausa após gol antes do reset
  GOAL_FLASH_MS: 450,
};

// --- Input ---
export const INPUT = {
  AXIS_DEADZONE: 0.12, // analógico
  CONFIRM_BUTTON: 0, // botão X do PS4 (standard mapping)
};

// --- Raridades (somam 100%) ---
export const RARITY = {
  LENDARIO: { key: 'LENDARIO', label: 'Lendário', emoji: '👑', color: '#ffd700', chance: 5 },
  EPICO: { key: 'EPICO', label: 'Épico', emoji: '🔥', color: '#a855f7', chance: 15 },
  RARO: { key: 'RARO', label: 'Raro', emoji: '💎', color: '#3399ff', chance: 30 },
  COMUM: { key: 'COMUM', label: 'Comum', emoji: '⚽', color: '#2ecc71', chance: 50 },
};
// Ordem de exibição (álbum / thresholds de sorteio)
export const RARITY_ORDER = ['LENDARIO', 'EPICO', 'RARO', 'COMUM'];

// --- Pity ---
export const PITY_THRESHOLD = 5; // após 5 repetidos seguidos, garante novo

// --- Modos de jogo ---
export const MODE = { TWO_PLAYER: '2P', VS_CPU: 'VS_CPU' };

// --- Telas ---
export const SCREEN = {
  MENU: 'MENU',
  SETUP: 'SETUP',
  GAME: 'GAME',
  RESULT: 'RESULT',
  BALLER: 'BALLER',
  ALBUM: 'ALBUM',
};
