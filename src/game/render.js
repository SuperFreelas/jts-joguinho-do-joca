// Renderização do campo no canvas 2D — PAISAGEM. Desenha SEMPRE em unidades lógicas
// (FIELD.W x FIELD.H); o caller configura o transform de DPR antes (setupCanvas).

import { FIELD, COLORS, PADDLE, BALL, GOAL } from '../data/constants.js';

export function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(FIELD.W * dpr);
  canvas.height = Math.round(FIELD.H * dpr);
  canvas.style.width = FIELD.W + 'px';
  canvas.style.height = FIELD.H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawField(ctx) {
  const { W, H } = FIELD;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // listras verticais alternadas
  const stripes = 12;
  const sw = W / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.stripeA : COLORS.stripeB;
    ctx.fillRect(i * sw, 0, sw, H);
  }

  // refletor
  const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.55);
  g.addColorStop(0, COLORS.spotlight);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // marcações
  ctx.save();
  ctx.globalAlpha = COLORS.lineAlpha;
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;

  const m = 8;
  ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);

  // linha central vertical tracejada
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(W / 2, m);
  ctx.lineTo(W / 2, H - m);
  ctx.stroke();
  ctx.setLineDash([]);

  // círculo central
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.line;
  ctx.fill();

  // grandes e pequenas áreas (esquerda e direita)
  const baW = 90,
    baH = 230,
    paW = 40,
    paH = 130;
  // esquerda
  ctx.strokeRect(m, (H - baH) / 2, baW, baH);
  ctx.strokeRect(m, (H - paH) / 2, paW, paH);
  // direita
  ctx.strokeRect(W - m - baW, (H - baH) / 2, baW, baH);
  ctx.strokeRect(W - m - paW, (H - paH) / 2, paW, paH);

  ctx.restore();

  drawGoal(ctx, true); // esquerda
  drawGoal(ctx, false); // direita
}

function drawGoal(ctx, left) {
  const { W, H } = FIELD;
  const gh = GOAL.OPENING; // abertura (eixo Y)
  const gd = GOAL.DEPTH; // profundidade (eixo X)
  const y = (H - gh) / 2;
  const x = left ? 0 : W - gd;

  ctx.save();
  // rede
  ctx.strokeStyle = COLORS.net;
  ctx.lineWidth = 1;
  for (let i = 0; i <= gh; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x, y + i);
    ctx.lineTo(x + gd, y + i);
    ctx.stroke();
  }
  for (let j = 0; j <= gd; j += 6) {
    ctx.beginPath();
    ctx.moveTo(x + j, y);
    ctx.lineTo(x + j, y + gh);
    ctx.stroke();
  }
  // traves
  ctx.strokeStyle = COLORS.post;
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (left) {
    ctx.moveTo(x + gd, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + gh);
    ctx.lineTo(x + gd, y + gh);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + gd, y);
    ctx.lineTo(x + gd, y + gh);
    ctx.lineTo(x, y + gh);
  }
  ctx.stroke();
  ctx.restore();
}

function drawPaddle(ctx, paddle, color, opts = {}) {
  const x = paddle.x - paddle.w / 2;
  const y = paddle.y - paddle.h / 2;
  ctx.save();
  ctx.shadowColor = opts.glow || color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = color;
  roundRect(ctx, x, y, paddle.w, paddle.h, PADDLE.R);
  ctx.fill();
  if (opts.border) {
    ctx.shadowBlur = 0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = opts.border;
    roundRect(ctx, x, y, paddle.w, paddle.h, PADDLE.R);
    ctx.stroke();
  }
  ctx.restore();
}

// Pentágono regular preto (gomo da bola), centrado em (cx,cy) com raio rr.
function blackPentagon(ctx, cx, cy, rr, rotation) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = rotation - Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// Bola de futebol clássica (Telstar preto-e-branco) com sombreado 3D e rotação.
function drawBall(ctx, ball, alpha = 1) {
  const R = BALL.R;
  ctx.save();
  ctx.globalAlpha = alpha;

  // glow sutil
  ctx.shadowColor = 'rgba(255,255,255,0.85)';
  ctx.shadowBlur = 14;

  // esfera branca com leve sombreado (luz em cima à esquerda)
  const grad = ctx.createRadialGradient(
    ball.x - R * 0.35,
    ball.y - R * 0.35,
    R * 0.15,
    ball.x,
    ball.y,
    R,
  );
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.7, '#f2f2f2');
  grad.addColorStop(1, '#cfd4d2');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
  ctx.fill();

  // a partir daqui desenha os gomos dentro do círculo (sem glow)
  ctx.shadowBlur = 0;
  ctx.save();
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rot || 0);

  ctx.fillStyle = '#161616';
  // pentágono central
  blackPentagon(ctx, 0, 0, R * 0.42, 0);
  // 5 pentágonos parciais junto à borda (cortados pelo clip)
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + Math.PI / 5;
    const cx = Math.cos(a) * R * 1.02;
    const cy = Math.sin(a) * R * 1.02;
    blackPentagon(ctx, cx, cy, R * 0.4, a + Math.PI);
  }

  // costuras finas ligando o pentágono central aos da borda
  ctx.strokeStyle = 'rgba(40,40,40,0.55)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * R * 0.42, Math.sin(a) * R * 0.42);
    ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
    ctx.stroke();
  }
  ctx.restore();

  // contorno
  ctx.strokeStyle = 'rgba(120,120,120,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, R - 0.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Placar/cronômetro agora vivem num overlay HTML (Scoreboard.jsx) — fica nítido
// e com visual de transmissão de TV.

function drawGoalFlash(ctx, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(255, 220, 60, ${alpha})`;
  ctx.fillRect(0, 0, FIELD.W, FIELD.H);
  ctx.restore();
}

function drawPowerMessage(ctx, msg) {
  if (!msg) return;
  ctx.save();
  ctx.globalAlpha = msg.alpha;
  ctx.font = '800 40px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = msg.color;
  ctx.shadowColor = msg.color;
  ctx.shadowBlur = 20;
  ctx.fillText(msg.text, FIELD.W / 2, FIELD.H / 2 - 110);
  ctx.restore();
}

export function renderFrame(ctx, state) {
  drawField(ctx);

  const ballAlpha = state.ballAlpha ?? 1;
  drawBall(ctx, state.ball, ballAlpha);

  drawPaddle(ctx, state.paddles.left, COLORS.p2);
  drawPaddle(ctx, state.paddles.right, COLORS.p1);

  if (state.goalFlashAlpha > 0) drawGoalFlash(ctx, state.goalFlashAlpha);
  drawPowerMessage(ctx, state.powerMessage);
}
