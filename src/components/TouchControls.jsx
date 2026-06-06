import { touchAxis } from '../game/input.js';
import { MODE } from '../data/constants.js';

// Botões de toque (▲ ▼) por jogador — PAISAGEM. Escrevem em input.touchAxis.
// P1 (direita/amarelo) -> borda direita. P2 (esquerda/azul) -> borda esquerda.
function HoldButton({ player, dir, label }) {
  const set = (v) => (e) => {
    e.preventDefault();
    touchAxis[player] = v;
  };
  return (
    <button
      className="touch-btn"
      onTouchStart={set(dir)}
      onTouchEnd={set(0)}
      onTouchCancel={set(0)}
      onMouseDown={set(dir)}
      onMouseUp={set(0)}
      onMouseLeave={set(0)}
    >
      {label}
    </button>
  );
}

export default function TouchControls({ mode }) {
  return (
    <div className="touch-controls">
      {/* Jogador 2 (esquerda/azul) — escondido no VS Máquina */}
      {mode !== MODE.VS_CPU && (
        <div className="touch-zone touch-zone--left">
          <HoldButton player={1} dir={-1} label="▲" />
          <HoldButton player={1} dir={1} label="▼" />
        </div>
      )}
      {/* Jogador 1 (direita/amarelo) */}
      <div className="touch-zone touch-zone--right">
        <HoldButton player={0} dir={-1} label="▲" />
        <HoldButton player={0} dir={1} label="▼" />
      </div>
    </div>
  );
}
