// Hook do game loop: fixed timestep (16.67ms/tick), integra input+física+render,
// gere placar/cronômetro/gols, lendários em campo, superpoderes e o ciclo do rAF.
//
// Contrato de ciclo de vida (F-10): o rAF é cancelado no cleanup do useEffect;
// `running` vira false ao terminar a partida; resetGameState() roda no mount.

import { useEffect, useRef } from 'react';
import {
  FIELD,
  TICK_MS,
  MAX_TICKS_PER_FRAME,
  BALL,
  PADDLE,
  TIMER,
  MODE,
} from '../data/constants.js';
import {
  spawnBall,
  stepBall,
  applyRallyBoost,
  initialPaddles,
  movePaddle,
  collideLegends,
  ballSpeed,
  setBallSpeed,
} from './physics.js';
import { readPlayerAxis } from './input.js';
import { aiAxis } from './ai.js';
import { POWERS } from '../data/powers.js';
import { applyPower } from './applyPower.js';
import { setupCanvas, renderFrame } from './render.js';

function freshBall() {
  return { ...spawnBall(), fire: false, alpha: 1 };
}

function freshState(placements) {
  return {
    ball: freshBall(),
    paddles: initialPaddles(),
    score: { left: 0, right: 0 },
    rallies: 0,
    timeLeft: TIMER.MATCH_SECONDS,
    elapsedMs: 0,
    goalPauseMs: 0,
    goalFlashMs: 0,
    goalFlashAlpha: 0,
    finished: false,
    powerMessage: null,
    legends: (placements || []).map((p) => ({
      x: p.x,
      y: p.y,
      r: 24,
      power: p.power, // pode ser undefined (bloqueador)
      owner: p.owner, // 'left' | 'right'
      rarity: p.rarity,
      number: p.number,
      name: p.name,
      cooldown: 0,
      flash: 0,
    })),
    effects: {
      invisibleTicks: 0,
      superGoalie: { left: 0, right: 0 },
      freeze: { left: 0, right: 0 },
      slow: { left: 0, right: 0 }, // Ímã
      curve: { ticks: 0, dir: 1, angle: 0 }, // Curvão
      homing: { ticks: 0, tx: 0, ty: 0, k: 0 }, // Teleguiado
      miniBallTicks: 0, // Mini Bola
      doubleGoal: { left: false, right: false }, // Gol Duplo
    },
    particles: [],
  };
}

function spawnFireParticles(s) {
  const b = s.ball;
  for (let i = 0; i < 2; i++) {
    if (s.particles.length > 70) break;
    s.particles.push({
      x: b.x,
      y: b.y,
      vx: -b.vx * 0.15 + (Math.random() - 0.5) * 1.5,
      vy: -b.vy * 0.15 + (Math.random() - 0.5) * 1.5,
      life: 18,
      max: 18,
    });
  }
}

export function useGameLoop(canvasRef, { mode, onFinish, placements }) {
  const stateRef = useRef(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const accRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas);

    const state = freshState(placements);
    stateRef.current = state;
    runningRef.current = true;
    accRef.current = 0;
    lastRef.current = performance.now();

    function applyPaddleSize(side) {
      const p = side === 'left' ? state.paddles.left : state.paddles.right;
      const big = state.effects.superGoalie[side] > 0;
      const targetH = big ? PADDLE.LEN * PADDLE.GOALIE_MULT : PADDLE.LEN;
      if (p.h !== targetH) {
        p.h = targetH;
        const half = p.h / 2;
        p.y = Math.max(half, Math.min(FIELD.H - half, p.y));
      }
    }

    function tick() {
      const s = stateRef.current;

      // Pausa pós-gol / reset
      if (s.goalPauseMs > 0) {
        s.goalPauseMs -= TICK_MS;
        if (s.goalPauseMs <= 0) {
          s.ball = freshBall();
          s.rallies = 0;
        }
        return;
      }

      // Cronômetro
      s.elapsedMs += TICK_MS;
      s.timeLeft = Math.max(0, TIMER.MATCH_SECONDS - s.elapsedMs / 1000);
      if (s.timeLeft <= 0 && !s.finished) {
        s.finished = true;
        runningRef.current = false;
        const { left, right } = s.score;
        const winner = left === right ? 'draw' : right > left ? 'right' : 'left';
        onFinish && onFinish({ winner, score: { ...s.score }, mode });
        return;
      }

      // Decai cooldowns/flash dos lendários
      for (const lg of s.legends) {
        if (lg.cooldown > 0) lg.cooldown -= 1;
        if (lg.flash > 0) lg.flash -= 1;
      }
      // Decai efeitos
      const ef = s.effects;
      if (ef.invisibleTicks > 0) ef.invisibleTicks -= 1;
      if (ef.superGoalie.left > 0) ef.superGoalie.left -= 1;
      if (ef.superGoalie.right > 0) ef.superGoalie.right -= 1;
      if (ef.freeze.left > 0) ef.freeze.left -= 1;
      if (ef.freeze.right > 0) ef.freeze.right -= 1;
      if (ef.slow.left > 0) ef.slow.left -= 1;
      if (ef.slow.right > 0) ef.slow.right -= 1;
      if (ef.curve.ticks > 0) ef.curve.ticks -= 1;
      if (ef.homing.ticks > 0) ef.homing.ticks -= 1;
      if (ef.miniBallTicks > 0) {
        ef.miniBallTicks -= 1;
        if (ef.miniBallTicks === 0) s.ball.radius = BALL.R; // restaura
      }

      // Tamanho dos goleiros (Super Goleiro)
      applyPaddleSize('left');
      applyPaddleSize('right');

      // Alpha da bola (Bola Invisível)
      s.ball.alpha = ef.invisibleTicks > 0 ? POWERS.BOLA_INVISIVEL.ballAlpha : 1;

      // Input dos goleiros (congelado não se move; Ímã deixa lento)
      const p1 = readPlayerAxis(0); // direita (amarelo)
      const p2 = mode === MODE.VS_CPU ? aiAxis(s) : readPlayerAxis(1); // esquerda (azul)
      if (ef.freeze.right <= 0) movePaddle(s.paddles.right, p1, ef.slow.right > 0 ? 0.45 : 1);
      if (ef.freeze.left <= 0) movePaddle(s.paddles.left, p2, ef.slow.left > 0 ? 0.45 : 1);

      // Curvão: rotaciona a velocidade da bola (mantém o módulo)
      if (ef.curve.ticks > 0) {
        const a = ef.curve.angle * ef.curve.dir;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const vx = s.ball.vx * cos - s.ball.vy * sin;
        const vy = s.ball.vx * sin + s.ball.vy * cos;
        s.ball.vx = vx;
        s.ball.vy = vy;
      }
      // Teleguiado: mira o gol adversário (mantém o módulo)
      if (ef.homing.ticks > 0) {
        const sp = ballSpeed(s.ball);
        const dx = ef.homing.tx - s.ball.x;
        const dy = ef.homing.ty - s.ball.y;
        const dlen = Math.hypot(dx, dy) || 1;
        s.ball.vx += (dx / dlen) * sp * ef.homing.k;
        s.ball.vy += (dy / dlen) * sp * ef.homing.k;
        setBallSpeed(s.ball, sp);
      }

      // Física da bola
      const ev = stepBall(s.ball, s.paddles);
      if (ev.type === 'save') {
        s.rallies += 1;
        applyRallyBoost(s.ball, s.rallies);
        s.ball.fire = false; // Super Chute/Turbo duram 1 trajetória
      } else if (ev.type === 'goal') {
        const pts = ef.doubleGoal[ev.scorer] ? 2 : 1; // Gol Duplo
        s.score[ev.scorer] += pts;
        ef.doubleGoal[ev.scorer] = false;
        s.goalPauseMs = TIMER.GOAL_PAUSE_MS;
        s.goalFlashMs = TIMER.GOAL_FLASH_MS;
        s.ball.vx = 0;
        s.ball.vy = 0;
        s.ball.fire = false;
        s.particles.length = 0;
        // limpa efeitos ligados à bola
        ef.curve.ticks = 0;
        ef.homing.ticks = 0;
        ef.miniBallTicks = 0;
        s.ball.radius = BALL.R;
      } else {
        // Colisão com lendários (atravessa se invisível)
        const hit = collideLegends(s.ball, s.legends, { passThrough: ef.invisibleTicks > 0 });
        if (hit) applyPower(s, hit);
      }

      // Partículas de fogo
      if (s.ball.fire && s.goalPauseMs <= 0) spawnFireParticles(s);
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // mantém velocidade mínima
      const sp = ballSpeed(s.ball);
      if (s.goalPauseMs <= 0 && sp > 0 && sp < BALL.INITIAL_SPEED) {
        setBallSpeed(s.ball, BALL.INITIAL_SPEED);
      }
    }

    function updateEffects(dtMs) {
      const s = stateRef.current;
      if (s.goalFlashMs > 0) {
        s.goalFlashMs -= dtMs;
        s.goalFlashAlpha = Math.max(0, s.goalFlashMs / TIMER.GOAL_FLASH_MS) * 0.55;
      } else {
        s.goalFlashAlpha = 0;
      }
      if (s.powerMessage) {
        s.powerMessage.ttl -= dtMs;
        s.powerMessage.alpha = Math.max(0, s.powerMessage.ttl / 1500);
        if (s.powerMessage.ttl <= 0) s.powerMessage = null;
      }
    }

    function frame(now) {
      const dt = Math.min(now - lastRef.current, TICK_MS * MAX_TICKS_PER_FRAME);
      lastRef.current = now;

      if (runningRef.current) {
        accRef.current += dt;
        let steps = 0;
        while (accRef.current >= TICK_MS && steps < MAX_TICKS_PER_FRAME) {
          tick();
          accRef.current -= TICK_MS;
          steps += 1;
          if (!runningRef.current) break;
        }
      }
      updateEffects(dt);
      renderFrame(ctx, stateRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return stateRef;
}
