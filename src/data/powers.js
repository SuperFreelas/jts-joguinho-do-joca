// Superpoderes dos lendários. Durações em TICKS (60 ticks = 1s).
// Ativam quando a bola bate no lendário em campo.

export const POWERS = {
  SUPER_CHUTE: {
    key: 'SUPER_CHUTE',
    name: 'Super Chute',
    emoji: '🔥',
    color: '#ff6600',
    label: '🔥 SUPER CHUTE!',
    // Instantâneo: aplica num único disparo de trajetória
    speedMult: 2.2,
    durationTicks: 0,
  },
  BOLA_INVISIVEL: {
    key: 'BOLA_INVISIVEL',
    name: 'Bola Invisível',
    emoji: '👻',
    color: '#cfd8ff',
    label: '👻 BOLA INVISÍVEL!',
    ballAlpha: 0.08,
    durationTicks: 150, // ~2.5s
  },
  SUPER_GOLEIRO: {
    key: 'SUPER_GOLEIRO',
    name: 'Super Goleiro',
    emoji: '🛡️',
    color: '#00cc66',
    label: '🛡️ SUPER GOLEIRO!',
    paddleWidth: 100,
    durationTicks: 240, // ~4s — afeta o goleiro do MESMO lado
  },
  SUPER_TRAVA: {
    key: 'SUPER_TRAVA',
    name: 'Super Trava',
    emoji: '🧊',
    color: '#3399ff',
    label: '🧊 SUPER TRAVA!',
    freezeEmoji: '❄️',
    durationTicks: 180, // ~3s — congela goleiro ADVERSÁRIO
  },

  // ---- Poderes dos ÉPICOS (mais leves que os lendários) ----
  TURBO: {
    key: 'TURBO',
    name: 'Turbo',
    emoji: '⚡',
    color: '#ffd24d',
    label: '⚡ TURBO!',
    speedMult: 1.6, // instantâneo, 1 trajetória (sem fogo)
    durationTicks: 0,
  },
  CURVAO: {
    key: 'CURVAO',
    name: 'Curvão',
    emoji: '🌀',
    color: '#9b59ff',
    label: '🌀 CURVÃO!',
    curveAngle: 0.04, // rad por tick — a bola faz curva
    durationTicks: 150, // ~2.5s
  },
  GOL_DUPLO: {
    key: 'GOL_DUPLO',
    name: 'Gol Duplo',
    emoji: '✖️',
    color: '#ff7ab8',
    label: '✖️2 GOL DUPLO!',
    durationTicks: 0, // arma até o próximo gol do lado
  },
  MINI_BOLA: {
    key: 'MINI_BOLA',
    name: 'Mini Bola',
    emoji: '🍃',
    color: '#7cfc98',
    label: '🍃 MINI BOLA!',
    scale: 0.55, // a bola encolhe
    durationTicks: 180, // ~3s
  },
  IMA: {
    key: 'IMA',
    name: 'Ímã',
    emoji: '🧲',
    color: '#ff5544',
    label: '🧲 ÍMÃ!',
    slowMul: 0.45, // goleiro ADVERSÁRIO fica lento
    durationTicks: 180, // ~3s
  },
  TELEGUIADO: {
    key: 'TELEGUIADO',
    name: 'Teleguiado',
    emoji: '🎯',
    color: '#33ddee',
    label: '🎯 TELEGUIADO!',
    homingK: 0.07, // quão forte a bola mira o gol
    durationTicks: 120, // ~2s
  },
};
