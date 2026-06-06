// Hook do game loop: fixed timestep (16.67ms/tick), integra input+física+render,
// gere placar/cronômetro/gols e o ciclo de vida do rAF.
//
// Contrato de ciclo de vida (F-10): o rAF é cancelado no cleanup do useEffect;
// `running` vira false ao terminar a partida; resetGameState() roda no mount.

import { useEffect, useRef } from 'react';
import { FIELD, TICK_MS, MAX_TICKS_PER_FRAME, BALL, TIMER, MODE } from '../data/constants.js';
import {
  spawnBall,
  stepBall,
  applyRallyBoost,
  initialPaddles,
  movePaddle,
  ballSpeed,
  setBallSpeed,
} from './physics.js';
import { readPlayerAxis } from './input.js';
import { aiAxis } from './ai.js';
import { setupCanvas, renderFrame } from './render.js';

function freshState() {
  return {
    ball: spawnBall(),
    paddles: initialPaddles(),
    score: { top: 0, bottom: 0 },
    rallies: 0,
    timeLeft: TIMER.MATCH_SECONDS,
    elapsedMs: 0,
    // pausa pós-gol
    goalPauseMs: 0,
    goalFlashMs: 0,
    goalFlashAlpha: 0,
    resetting: false,
    finished: false,
    powerMessage: null,
    ballAlpha: 1,
  };
}

// onFinish(result) chamado uma vez quando o tempo acaba.
export function useGameLoop(canvasRef, { mode, onFinish }) {
  const stateRef = useRef(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const accRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas);

    // reset total no mount (evita vazamento entre partidas)
    const state = freshState();
    stateRef.current = state;
    runningRef.current = true;
    accRef.current = 0;
    lastRef.current = performance.now();

    function tick() {
      const s = stateRef.current;

      // --- Pausa pós-gol / reset ---
      if (s.goalPauseMs > 0) {
        s.goalPauseMs -= TICK_MS;
        if (s.goalPauseMs <= 0) {
          s.ball = spawnBall();
          s.rallies = 0;
        }
        return;
      }

      // --- Cronômetro ---
      s.elapsedMs += TICK_MS;
      s.timeLeft = Math.max(0, TIMER.MATCH_SECONDS - s.elapsedMs / 1000);
      if (s.timeLeft <= 0 && !s.finished) {
        s.finished = true;
        runningRef.current = false;
        const { top, bottom } = s.score;
        const winner = top === bottom ? 'draw' : top > bottom ? 'top' : 'bottom';
        onFinish && onFinish({ winner, score: { ...s.score }, mode });
        return;
      }

      // --- Input dos goleiros ---
      const p1 = readPlayerAxis(0); // baixo
      let p2 = mode === MODE.VS_CPU ? aiAxis(s) : readPlayerAxis(1); // cima
      movePaddle(s.paddles.bottom, p1);
      movePaddle(s.paddles.top, p2);

      // --- Física da bola ---
      const ev = stepBall(s.ball, s.paddles);
      if (ev.type === 'save') {
        s.rallies += 1;
        applyRallyBoost(s.ball, s.rallies);
      } else if (ev.type === 'goal') {
        s.score[ev.scorer] += 1;
        s.goalPauseMs = TIMER.GOAL_PAUSE_MS;
        s.goalFlashMs = TIMER.GOAL_FLASH_MS;
        // posiciona bola "fora" pra não re-detectar
        s.ball.x = FIELD.W / 2;
        s.ball.y = FIELD.H / 2;
        s.ball.vx = 0;
        s.ball.vy = 0;
      }

      // --- Decaimento da velocidade quando "lenta" (reset suave) ---
      // (mantém a bola na velocidade inicial logo após spawn)
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
      if (!runningRef.current && !stateRef.current.finished) {
        // parado mas não finalizado (não deveria acontecer) — ainda assim desenha
      }
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

      // desenha sempre (mesmo no último frame finalizado)
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
