// Física pura da bola — PAISAGEM. Tudo em unidades lógicas (FIELD.W x FIELD.H), px/tick.
// Bola viaja na horizontal; goleiros são barras verticais nas laterais (esq/dir).
// Sem efeitos colaterais visuais — só atualiza estado e devolve eventos.

import { FIELD, BALL, PADDLE, GOAL } from '../data/constants.js';

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function ballSpeed(ball) {
  return Math.hypot(ball.vx, ball.vy);
}

export function setBallSpeed(ball, speed) {
  const cur = ballSpeed(ball) || 1;
  const k = speed / cur;
  ball.vx *= k;
  ball.vy *= k;
}

// Bola no centro com ângulo aleatório, indo para a esquerda ou direita.
export function spawnBall(rng = Math.random) {
  const angle = (rng() * 0.6 - 0.3) * Math.PI; // ~ -54°..54° da horizontal
  const dir = rng() < 0.5 ? 1 : -1; // direita (+1) ou esquerda (-1)
  const speed = BALL.INITIAL_SPEED;
  return {
    x: FIELD.W / 2,
    y: FIELD.H / 2,
    vx: Math.cos(angle) * speed * dir,
    vy: Math.sin(angle) * speed,
    rot: 0, // rotação visual (gira conforme rola)
  };
}

// Reflexão num goleiro vertical: ângulo depende do ponto de impacto em Y.
// `dir` = sentido horizontal de saída (+1 = vai pra direita, -1 = vai pra esquerda).
function reflectOffPaddle(ball, paddle, dir, rng) {
  const half = paddle.h / 2;
  const offset = clamp((ball.y - paddle.y) / half, -1, 1); // -1..1
  const angle = offset * BALL.MAX_BOUNCE_ANGLE;
  const speed = ballSpeed(ball);
  ball.vx = Math.cos(angle) * speed * dir;
  ball.vy = Math.sin(angle) * speed;
  ball.vy += (rng() - 0.5) * 0.2; // leve aleatoriedade
}

// Avança a bola UM tick. Paredes (topo/base), goleiros (varredura em X) e gols (laterais).
// paddles: { left: {x,y,w,h}, right: {x,y,w,h} }
// Retorna: { type: 'none'|'save'|'goal', side?, scorer? }
export function stepBall(ball, paddles, opts = {}) {
  const rng = opts.rng || Math.random;
  const r = BALL.R;
  const prevX = ball.x;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // gira a bola conforme se desloca (sentido pela direção horizontal)
  const dist = Math.hypot(ball.vx, ball.vy);
  ball.rot = (ball.rot || 0) + (dist / BALL.R) * (ball.vx >= 0 ? 1 : -1) * 0.35;

  // Paredes de cima/baixo
  if (ball.y - r < 0) {
    ball.y = r;
    ball.vy = Math.abs(ball.vy);
  } else if (ball.y + r > FIELD.H) {
    ball.y = FIELD.H - r;
    ball.vy = -Math.abs(ball.vy);
  }

  // --- Goleiro da esquerda (P2 azul): bola indo pra esquerda (vx<0) ---
  const pl = paddles.left;
  if (ball.vx < 0) {
    const faceX = pl.x + pl.w / 2 + r;
    if (prevX >= faceX && ball.x <= faceX) {
      if (ball.y >= pl.y - pl.h / 2 - r && ball.y <= pl.y + pl.h / 2 + r) {
        ball.x = faceX;
        reflectOffPaddle(ball, pl, 1, rng);
        return { type: 'save', side: 'left' };
      }
    }
  }

  // --- Goleiro da direita (P1 amarelo): bola indo pra direita (vx>0) ---
  const pr = paddles.right;
  if (ball.vx > 0) {
    const faceX = pr.x - pr.w / 2 - r;
    if (prevX <= faceX && ball.x >= faceX) {
      if (ball.y >= pr.y - pr.h / 2 - r && ball.y <= pr.y + pr.h / 2 + r) {
        ball.x = faceX;
        reflectOffPaddle(ball, pr, -1, rng);
        return { type: 'save', side: 'right' };
      }
    }
  }

  // --- Laterais: parede, EXCETO na abertura do gol (centralizada) ---
  const goalTop = (FIELD.H - GOAL.OPENING) / 2;
  const goalBottom = (FIELD.H + GOAL.OPENING) / 2;
  const inGoalMouth = ball.y >= goalTop && ball.y <= goalBottom;

  // Borda direita
  if (ball.x + r >= FIELD.W) {
    if (inGoalMouth) return { type: 'goal', scorer: 'left' }; // P2 (esquerda) marcou
    ball.x = FIELD.W - r;
    ball.vx = -Math.abs(ball.vx); // quica na trave/lateral
  }
  // Borda esquerda
  if (ball.x - r <= 0) {
    if (inGoalMouth) return { type: 'goal', scorer: 'right' }; // P1 (direita) marcou
    ball.x = r;
    ball.vx = Math.abs(ball.vx);
  }

  return { type: 'none' };
}

export function applyRallyBoost(ball, rallies) {
  const target = Math.min(ballSpeed(ball) * (1 + BALL.RALLY_FACTOR * rallies), BALL.MAX_SPEED);
  setBallSpeed(ball, target);
}

// Posição inicial dos goleiros (barras verticais nas laterais).
export function initialPaddles() {
  return {
    left: { x: PADDLE.MARGIN_X, y: FIELD.H / 2, w: PADDLE.THICK, h: PADDLE.LEN },
    right: { x: FIELD.W - PADDLE.MARGIN_X, y: FIELD.H / 2, w: PADDLE.THICK, h: PADDLE.LEN },
  };
}

// Move um paddle verticalmente por um delta de input (-1 cima .. +1 baixo).
export function movePaddle(paddle, input) {
  paddle.y += input * PADDLE.SPEED;
  const half = paddle.h / 2;
  paddle.y = clamp(paddle.y, half, FIELD.H - half);
}
