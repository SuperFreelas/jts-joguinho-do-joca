// IA do modo VS Máquina. Controla o goleiro da ESQUERDA (P2/azul).
// Segue o Y da bola: reage forte quando a bola vem, fraco quando vai;
// dead zone, e chance de hesitar — ganhável por uma criança de 7 anos.

import { AI } from '../data/constants.js';

// Retorna input vertical -1..1 para o goleiro da esquerda.
export function aiAxis(state, rng = Math.random) {
  const ball = state.ball;
  const paddle = state.paddles.left;
  if (!ball || !paddle) return 0;

  if (rng() < AI.HESITATE) return 0; // hesita

  const diff = ball.y - paddle.y;
  if (Math.abs(diff) < AI.DEADZONE_PX) return 0; // dead zone

  const incoming = ball.vx < 0; // bola indo pra esquerda (em direção à IA)
  const speed = incoming ? AI.REACT_TOWARD : AI.REACT_AWAY;
  return Math.sign(diff) * speed;
}
