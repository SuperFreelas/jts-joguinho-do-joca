// Física pura da bola. Tudo em unidades lógicas (FIELD.W x FIELD.H), px/tick.
// Sem efeitos colaterais visuais — só atualiza estado e devolve eventos.

import { FIELD, BALL, PADDLE } from '../data/constants.js';

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Velocidade escalar atual da bola.
export function ballSpeed(ball) {
  return Math.hypot(ball.vx, ball.vy);
}

export function setBallSpeed(ball, speed) {
  const cur = ballSpeed(ball) || 1;
  const k = speed / cur;
  ball.vx *= k;
  ball.vy *= k;
}

// Cria uma bola no centro com ângulo aleatório (para cima ou para baixo).
export function spawnBall(rng = Math.random) {
  const angle = (rng() * 0.6 - 0.3) * Math.PI; // ~ -54°..54° da vertical
  const dir = rng() < 0.5 ? 1 : -1; // sobe ou desce
  const speed = BALL.INITIAL_SPEED;
  return {
    x: FIELD.W / 2,
    y: FIELD.H / 2,
    vx: Math.sin(angle) * speed,
    vy: Math.cos(angle) * speed * dir,
    spinning: 0,
  };
}

// Reflexão num paddle: ângulo depende do ponto de impacto (mais na ponta = mais ângulo).
// `goingDown` indica o sentido (true: bola descia, bate no goleiro de baixo).
function reflectOffPaddle(ball, paddle, goingDown, rng) {
  const half = paddle.w / 2;
  const offset = clamp((ball.x - paddle.x) / half, -1, 1); // -1..1
  const angle = offset * BALL.MAX_BOUNCE_ANGLE;
  const speed = ballSpeed(ball);
  ball.vx = Math.sin(angle) * speed;
  ball.vy = Math.cos(angle) * speed * (goingDown ? -1 : 1);
  // leve aleatoriedade
  ball.vx += (rng() - 0.5) * 0.2;
}

// Avança a bola UM tick. Detecta paredes, paddles (com varredura anti-tunneling) e gols.
// paddles: { bottom: {x,y,w,h}, top: {x,y,w,h} }
// Retorna evento: { type: 'none'|'save'|'goal', scorer? }
// `frozen`: { bottom: bool, top: bool } — goleiro congelado não defende? (defende mesmo congelado, só não move)
export function stepBall(ball, paddles, opts = {}) {
  const rng = opts.rng || Math.random;
  const r = BALL.R;
  const prevY = ball.y;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Paredes laterais
  if (ball.x - r < 0) {
    ball.x = r;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + r > FIELD.W) {
    ball.x = FIELD.W - r;
    ball.vx = -Math.abs(ball.vx);
  }

  // --- Colisão com paddles (varredura no eixo Y) ---
  // Goleiro de baixo: face superior em (paddle.y - h/2). Bola descendo (vy>0).
  const pb = paddles.bottom;
  if (ball.vy > 0) {
    const faceY = pb.y - pb.h / 2 - r;
    if (prevY <= faceY && ball.y >= faceY) {
      if (ball.x >= pb.x - pb.w / 2 - r && ball.x <= pb.x + pb.w / 2 + r) {
        ball.y = faceY;
        reflectOffPaddle(ball, pb, true, rng);
        return { type: 'save', side: 'bottom' };
      }
    }
  }

  // Goleiro de cima: face inferior em (paddle.y + h/2). Bola subindo (vy<0).
  const pt = paddles.top;
  if (ball.vy < 0) {
    const faceY = pt.y + pt.h / 2 + r;
    if (prevY >= faceY && ball.y <= faceY) {
      if (ball.x >= pt.x - pt.w / 2 - r && ball.x <= pt.x + pt.w / 2 + r) {
        ball.y = faceY;
        reflectOffPaddle(ball, pt, false, rng);
        return { type: 'save', side: 'top' };
      }
    }
  }

  // --- Gol ---
  // Passou da linha de baixo => gol do jogador de CIMA (p2). E vice-versa.
  if (ball.y - r > FIELD.H) {
    return { type: 'goal', scorer: 'top' }; // p2 marcou
  }
  if (ball.y + r < 0) {
    return { type: 'goal', scorer: 'bottom' }; // p1 marcou
  }

  return { type: 'none' };
}

// Aplica aceleração de rally após uma defesa.
export function applyRallyBoost(ball, rallies) {
  const target = Math.min(ballSpeed(ball) * (1 + BALL.RALLY_FACTOR * rallies), BALL.MAX_SPEED);
  setBallSpeed(ball, target);
}

// Posição inicial dos goleiros.
export function initialPaddles() {
  return {
    bottom: { x: FIELD.W / 2, y: FIELD.H - PADDLE.MARGIN_Y, w: PADDLE.W, h: PADDLE.H },
    top: { x: FIELD.W / 2, y: PADDLE.MARGIN_Y, w: PADDLE.W, h: PADDLE.H },
  };
}

// Move um paddle por um delta de input (-1..1), respeitando a largura atual.
export function movePaddle(paddle, input) {
  paddle.x += input * PADDLE.SPEED;
  const half = paddle.w / 2;
  paddle.x = clamp(paddle.x, half, FIELD.W - half);
}
