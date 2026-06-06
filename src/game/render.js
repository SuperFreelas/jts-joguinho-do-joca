// Renderização do campo no canvas 2D — PAISAGEM. Desenha SEMPRE em unidades lógicas
// (FIELD.W x FIELD.H); o caller configura o transform de DPR antes (setupCanvas).

import { FIELD, COLORS, PADDLE, BALL, TIMER, GOAL } from '../data/constants.js';

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

function drawBall(ctx, ball, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = COLORS.ball;
  ctx.shadowBlur = 18;
  ctx.fillStyle = COLORS.ball;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL.R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHUD(ctx, state) {
  const { W } = FIELD;
  const { score, timeLeft } = state;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // placar: esquerda (P2 azul) e direita (P1 amarelo), no topo
  ctx.font = '800 40px "Baloo 2", sans-serif';
  ctx.fillStyle = COLORS.p2;
  ctx.fillText(String(score.left), W / 2 - 70, 34);
  ctx.fillStyle = COLORS.p1;
  ctx.fillText(String(score.right), W / 2 + 70, 34);

  // cronômetro central
  const warn = timeLeft <= TIMER.WARN_SECONDS;
  ctx.fillStyle = warn ? COLORS.timerWarn : COLORS.hud;
  ctx.font = '800 30px "Baloo 2", sans-serif';
  const mm = Math.floor(timeLeft / 60);
  const ss = String(Math.floor(timeLeft % 60)).padStart(2, '0');
  ctx.fillText(`${mm}:${ss}`, W / 2, 34);
  ctx.restore();
}

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

  drawHUD(ctx, state);

  if (state.goalFlashAlpha > 0) drawGoalFlash(ctx, state.goalFlashAlpha);
  drawPowerMessage(ctx, state.powerMessage);
}
