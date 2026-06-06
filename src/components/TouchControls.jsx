import { touchAxis } from '../game/input.js';
import { MODE } from '../data/constants.js';

// Botões de toque (◀ ▶) por jogador, fallback mobile. Escrevem em input.touchAxis.
// onTouchStart/End com preventDefault para evitar delay/scroll.
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
      {/* Jogador 2 (cima) — escondido no VS Máquina */}
      {mode !== MODE.VS_CPU && (
        <div className="touch-zone touch-zone--top">
          <HoldButton player={1} dir={-1} label="◀" />
          <HoldButton player={1} dir={1} label="▶" />
        </div>
      )}
      {/* Jogador 1 (baixo) */}
      <div className="touch-zone touch-zone--bottom">
        <HoldButton player={0} dir={-1} label="◀" />
        <HoldButton player={0} dir={1} label="▶" />
      </div>
    </div>
  );
}
