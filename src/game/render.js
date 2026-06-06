// Renderização do campo no canvas 2D. Desenha SEMPRE em unidades lógicas (FIELD.W x H);
// o caller configura o transform de DPR antes (setupCanvas).

import { FIELD, COLORS, PADDLE, BALL, TIMER } from '../data/constants.js';

// Configura o canvas para DPR (nitidez em Retina/iPhone) e devolve o ctx
// já escalado para desenhar em unidades lógicas.
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
  // gramado base
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // listras horizontais alternadas
  const stripes = 10;
  const sh = H / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.stripeA : COLORS.stripeB;
    ctx.fillRect(0, i * sh, W, sh);
  }

  // refletor (luz de estádio)
  const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, H * 0.6);
  g.addColorStop(0, COLORS.spotlight);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // marcações
  ctx.save();
  ctx.globalAlpha = COLORS.lineAlpha;
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;

  const m = 8; // margem da borda
  ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);

  // linha central tracejada
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(m, H / 2);
  ctx.lineTo(W - m, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // círculo central
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 64, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.line;
  ctx.fill();

  // grandes e pequenas áreas (topo e base)
  const baW = 220,
    baH = 90,
    paW = 120,
    paH = 40;
  // topo
  ctx.strokeRect((W - baW) / 2, m, baW, baH);
  ctx.strokeRect((W - paW) / 2, m, paW, paH);
  // base
  ctx.strokeRect((W - baW) / 2, H - m - baH, baW, baH);
  ctx.strokeRect((W - paW) / 2, H - m - paH, paW, paH);

  ctx.restore();

  drawGoal(ctx, true); // topo
  drawGoal(ctx, false); // base
}

function drawGoal(ctx, top) {
  const { W, H } = FIELD;
  const gw = 150;
  const gh = 18;
  const x = (W - gw) / 2;
  const y = top ? 0 : H - gh;

  // rede
  ctx.save();
  ctx.strokeStyle = COLORS.net;
  ctx.lineWidth = 1;
  for (let i = 0; i <= gw; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i, y + gh);
    ctx.stroke();
  }
  for (let j = 0; j <= gh; j += 6) {
    ctx.beginPath();
    ctx.moveTo(x, y + j);
    ctx.lineTo(x + gw, y + j);
    ctx.stroke();
  }
  // traves
  ctx.strokeStyle = COLORS.post;
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (top) {
    ctx.moveTo(x, y + gh);
    ctx.lineTo(x, y);
    ctx.lineTo(x + gw, y);
    ctx.lineTo(x + gw, y + gh);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + gh);
    ctx.lineTo(x + gw, y + gh);
    ctx.lineTo(x + gw, y);
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
  const { W, H } = FIELD;
  const { score, timeLeft } = state;

  // placar — p2 (cima) e p1 (baixo), nas laterais do meio
  ctx.save();
  ctx.font = '800 40px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = COLORS.p2;
  ctx.fillText(String(score.top), 40, H / 2 - 30);
  ctx.fillStyle = COLORS.p1;
  ctx.fillText(String(score.bottom), 40, H / 2 + 30);

  // cronômetro central
  const warn = timeLeft <= TIMER.WARN_SECONDS;
  ctx.fillStyle = warn ? COLORS.timerWarn : COLORS.hud;
  ctx.font = '800 30px "Baloo 2", sans-serif';
  const mm = Math.floor(timeLeft / 60);
  const ss = String(Math.floor(timeLeft % 60)).padStart(2, '0');
  ctx.fillText(`${mm}:${ss}`, W - 44, H / 2);
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
  ctx.font = '800 36px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = msg.color;
  ctx.shadowColor = msg.color;
  ctx.shadowBlur = 20;
  ctx.fillText(msg.text, FIELD.W / 2, FIELD.H / 2 - 90);
  ctx.restore();
}

// Desenho de um frame completo.
export function renderFrame(ctx, state) {
  drawField(ctx);

  const ballAlpha = state.ballAlpha ?? 1;
  drawBall(ctx, state.ball, ballAlpha);

  drawPaddle(ctx, state.paddles.bottom, COLORS.p1);
  drawPaddle(ctx, state.paddles.top, COLORS.p2);

  drawHUD(ctx, state);

  if (state.goalFlashAlpha > 0) drawGoalFlash(ctx, state.goalFlashAlpha);
  drawPowerMessage(ctx, state.powerMessage);
}
