import GamepadStatus from './GamepadStatus.jsx';
import { MODE } from '../data/constants.js';

// Menu principal.
export default function Menu({ onStart, onOpenAlbums }) {
  return (
    <div className="screen">
      <h1 className="logo">GOL A GOL</h1>
      <div className="floating-ball">⚽</div>
      <div className="subtitle">⚡ Edição Noturna ⚡</div>

      <button className="btn btn--green" onClick={() => onStart(MODE.TWO_PLAYER)}>
        👥 2 JOGADORES
      </button>
      <button className="btn btn--blue" onClick={() => onStart(MODE.VS_CPU)}>
        🤖 VS MÁQUINA
      </button>
      <button className="btn btn--gold" onClick={onOpenAlbums}>
        🏆 Álbuns
      </button>

      <GamepadStatus />
    </div>
  );
}
