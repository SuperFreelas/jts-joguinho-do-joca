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
};
