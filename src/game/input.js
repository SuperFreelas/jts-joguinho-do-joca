// Camada de input: Gamepad API (PS4 via Bluetooth) + fallback de teclado + touch.
// Polling a cada frame — NÃO depende de eventos gamepadconnected p/ ler eixos,
// mas usa connected/disconnected p/ status e overlay de reconexão.
//
// Mapeamento PS4 "standard" (Chrome/Safari macOS, gamepad.mapping === 'standard'):
//   axes[0] = analógico esquerdo X
//   buttons[0]  = X (cross)  -> confirmar
//   buttons[12..15] = d-pad cima/baixo/esq/dir
// Em mapping não-standard, ignoramos índices e caímos no teclado.

import { INPUT } from '../data/constants.js';

const keys = new Set();
let keyboardReady = false;
const confirmListeners = new Set();

function ensureKeyboard() {
  if (keyboardReady) return;
  keyboardReady = true;
  window.addEventListener('keydown', (e) => {
    keys.add(e.key);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
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

// Eixo X de um pad "standard": analógico OU d-pad.
function padAxisX(pad) {
  if (!pad || pad.mapping !== 'standard') return 0;
  let x = applyDeadzone(pad.axes[0] || 0);
  if (x === 0) {
    const left = pad.buttons[14] && pad.buttons[14].pressed;
    const right = pad.buttons[15] && pad.buttons[15].pressed;
    if (left) x = -1;
    else if (right) x = 1;
  }
  return x;
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

// Lê o input lateral de um jogador (0 = P1/baixo, 1 = P2/cima).
// Retorna -1..1. Combina gamepad + teclado + touch.
export function readPlayerAxis(player) {
  ensureKeyboard();
  const pads = getPads();
  const standard = pads.filter((p) => p.mapping === 'standard');
  let x = 0;

  // Gamepad: P1 -> primeiro pad standard, P2 -> segundo.
  const pad = standard[player];
  if (pad) x = padAxisX(pad);

  // Teclado
  if (x === 0) {
    if (player === 0) {
      if (keys.has('a') || keys.has('A')) x = -1;
      else if (keys.has('d') || keys.has('D')) x = 1;
    } else {
      if (keys.has('ArrowLeft')) x = -1;
      else if (keys.has('ArrowRight')) x = 1;
    }
  }

  // Touch
  if (x === 0 && touchAxis[player]) x = touchAxis[player];

  return x;
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
