import { useEffect, useRef, useState } from 'react';
import { FIELD, MODE } from '../data/constants.js';
import { useGameLoop } from '../game/useGameLoop.js';
import { gamepadStatus, onGamepadChange } from '../game/input.js';
import TouchControls from './TouchControls.jsx';

// Tela de jogo: canvas escalado para caber (transform via ResizeObserver),
// overlay de reconexão de controle, e touch controls no mobile.
export default function GameScreen({ mode, onFinish }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const scalerRef = useRef(null);
  const [needGamepad, setNeedGamepad] = useState(false);

  useGameLoop(canvasRef, { mode, onFinish });

  // Escala o campo (480x800 lógico) para caber na área disponível.
  useEffect(() => {
    const wrap = wrapRef.current;
    const scaler = scalerRef.current;
    if (!wrap || !scaler) return;
    const fit = () => {
      const aw = wrap.clientWidth;
      const ah = wrap.clientHeight;
      const scale = Math.min(aw / FIELD.W, ah / FIELD.H);
      // centrado via left/top 50% + translate(-50%,-50%)
      scaler.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  // Overlay de reconexão: só relevante se NÃO houver teclado/touch como principal.
  // Mostra quando um controle some no modo 2P (precisa de 2) ou VS_CPU (precisa de 1).
  useEffect(() => {
    const check = (st = gamepadStatus()) => {
      // Em desenvolvimento (teclado) `count` pode ser 0; só alertamos se já houve pad.
      const need = mode === MODE.TWO_PLAYER ? 2 : 1;
      setNeedGamepad(st.count > 0 && st.count < need);
    };
    const off = onGamepadChange(check);
    const id = setInterval(() => check(), 1000);
    check();
    return () => {
      off();
      clearInterval(id);
    };
  }, [mode]);

  return (
    <div className="game-wrap" ref={wrapRef}>
      <div className="canvas-scaler" ref={scalerRef}>
        <canvas className="field" ref={canvasRef} width={FIELD.W} height={FIELD.H} />
        <TouchControls mode={mode} />
      </div>

      {needGamepad && (
        <div className="overlay">
          <div>🎮 Reconecte o controle</div>
          <div style={{ fontSize: '0.6em', opacity: 0.8 }}>aguardando reconexão…</div>
        </div>
      )}
    </div>
  );
}
