import { useEffect, useRef } from 'react';
import { TIMER, MODE } from '../data/constants.js';

// Placar estilo transmissão de TV. Lê o estado vivo do jogo (stateRef) num rAF
// próprio e atualiza só os nós de texto via ref — sem re-render do React a 60fps.
export default function Scoreboard({ stateRef, mode }) {
  const leftScoreRef = useRef(null);
  const rightScoreRef = useRef(null);
  const timerRef = useRef(null);

  // rótulos dos times (esquerda = P2 azul, direita = P1 amarelo)
  const labels =
    mode === MODE.VS_CPU ? { left: 'CPU', right: 'VOCÊ' } : { left: 'P2', right: 'P1' };

  useEffect(() => {
    let raf = 0;
    const fmt = (t) => {
      const mm = Math.floor(t / 60);
      const ss = String(Math.floor(t % 60)).padStart(2, '0');
      return `${mm}:${ss}`;
    };
    let lastL = -1,
      lastR = -1,
      lastT = '',
      lastWarn = null;
    const loop = () => {
      const s = stateRef && stateRef.current;
      if (s) {
        if (s.score.left !== lastL && leftScoreRef.current) {
          leftScoreRef.current.textContent = s.score.left;
          lastL = s.score.left;
        }
        if (s.score.right !== lastR && rightScoreRef.current) {
          rightScoreRef.current.textContent = s.score.right;
          lastR = s.score.right;
        }
        const t = fmt(s.timeLeft);
        if (t !== lastT && timerRef.current) {
          timerRef.current.textContent = t;
          lastT = t;
        }
        const warn = s.timeLeft <= TIMER.WARN_SECONDS;
        if (warn !== lastWarn && timerRef.current) {
          timerRef.current.classList.toggle('sb-timer--warn', warn);
          lastWarn = warn;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stateRef]);

  return (
    <div className="scoreboard">
      <span className="sb-tab sb-tab--left" />
      <span className="sb-name">{labels.left}</span>
      <span className="sb-score" ref={leftScoreRef}>
        0
      </span>
      <span className="sb-timer" ref={timerRef}>
        1:00
      </span>
      <span className="sb-score" ref={rightScoreRef}>
        0
      </span>
      <span className="sb-name">{labels.right}</span>
      <span className="sb-tab sb-tab--right" />
    </div>
  );
}
