// Camada de input: Gamepad API (PS4 via Bluetooth) + fallback de teclado + touch.
// Polling a cada frame — NÃO depende de eventos gamepadconnected p/ ler eixos,
// mas usa connected/disconnected p/ status e overlay de reconexão.
//
// Mapeamento PS4 "standard" (Chrome/Safari macOS, gamepad.mapping === 'standard'):
//   axes[1] = analógico esquerdo Y (cima negativo)
//   buttons[0]  = X (cross)  -> confirmar
//   buttons[12..15] = d-pad cima/baixo/esq/dir
// Em mapping não-standard, ignoramos índices e caímos no teclado.
//
// PAISAGEM: goleiros se movem na VERTICAL. -1 = cima, +1 = baixo.
// Jogador 0 = P1 (amarelo, goleiro da DIREITA). Jogador 1 = P2 (azul, ESQUERDA).

import { INPUT } from '../data/constants.js';

const keys = new Set();
let keyboardReady = false;
const confirmListeners = new Set();

function ensureKeyboard() {
  if (keyboardReady) return;
  keyboardReady = true;
  window.addEventListener('keydown', (e) => {
    keys.add(e.key);
    if (e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
      // evita o scroll da página com setas/espaço durante o jogo
      e.preventDefault();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      confirmListeners.forEach((fn) => fn(0));
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
}

// --- Touch state (preenchido por TouchControls) ---
// touchAxis[player] em {-1,0,1}
export const touchAxis = { 0: 0, 1: 0 };

// --- Gamepad helpers ---
function getPads() {
  const raw = navigator.getGamepads ? navigator.getGamepads() : [];
  // só pads conectados, na ordem de index
  return Array.from(raw).filter(Boolean);
}

function applyDeadzone(v) {
  return Math.abs(v) < INPUT.AXIS_DEADZONE ? 0 : v;
}

// Eixo Y de um pad "standard": analógico OU d-pad (cima = -1, baixo = +1).
function padAxisY(pad) {
  if (!pad || pad.mapping !== 'standard') return 0;
  let y = applyDeadzone(pad.axes[1] || 0);
  if (y === 0) {
    const up = pad.buttons[12] && pad.buttons[12].pressed;
    const down = pad.buttons[13] && pad.buttons[13].pressed;
    if (up) y = -1;
    else if (down) y = 1;
  }
  return y;
}

function padConfirm(pad) {
  if (!pad || pad.mapping !== 'standard') return false;
  const b = pad.buttons[INPUT.CONFIRM_BUTTON];
  return !!(b && b.pressed);
}

// Status de conexão para a UI.
export function gamepadStatus() {
  const pads = getPads();
  const standard = pads.filter((p) => p.mapping === 'standard');
  return {
    count: standard.length,
    p1: standard.length >= 1,
    p2: standard.length >= 2,
  };
}

// Lê o input vertical de um jogador (0 = P1/direita, 1 = P2/esquerda).
// Retorna -1..1 (cima/baixo). Combina gamepad + teclado + touch.
export function readPlayerAxis(player) {
  ensureKeyboard();
  const pads = getPads();
  const standard = pads.filter((p) => p.mapping === 'standard');
  let y = 0;

  // Gamepad: P1 -> primeiro pad standard, P2 -> segundo.
  const pad = standard[player];
  if (pad) y = padAxisY(pad);

  // Teclado: P1 = W/S, P2 = ↑/↓
  if (y === 0) {
    if (player === 0) {
      if (keys.has('w') || keys.has('W')) y = -1;
      else if (keys.has('s') || keys.has('S')) y = 1;
    } else {
      if (keys.has('ArrowUp')) y = -1;
      else if (keys.has('ArrowDown')) y = 1;
    }
  }

  // Touch
  if (y === 0 && touchAxis[player]) y = touchAxis[player];

  return y;
}

// Botão de confirmar de qualquer fonte (menus). Edge-detect fica com o chamador.
export function readConfirm() {
  const pads = getPads().filter((p) => p.mapping === 'standard');
  return pads.some(padConfirm);
}

export function onKeyboardConfirm(fn) {
  ensureKeyboard();
  confirmListeners.add(fn);
  return () => confirmListeners.delete(fn);
}

// Lifecycle de conexão (status ao vivo + overlay de reconexão).
export function onGamepadChange(fn) {
  const handler = () => fn(gamepadStatus());
  window.addEventListener('gamepadconnected', handler);
  window.addEventListener('gamepaddisconnected', handler);
  return () => {
    window.removeEventListener('gamepadconnected', handler);
    window.removeEventListener('gamepaddisconnected', handler);
  };
}
