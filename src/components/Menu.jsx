import GamepadStatus from './GamepadStatus.jsx';
import { MODE } from '../data/constants.js';

// Menu principal. No 1º Tempo: 2 Jogadores ativo; VS Máquina e Álbum desabilitados
// (entram nas fases seguintes), mas já presentes para o roteamento ficar completo.
export default function Menu({ onStart, collectionCount = 0 }) {
  return (
    <div className="screen">
      <h1 className="logo">GOL A GOL</h1>
      <div className="floating-ball">⚽</div>
      <div className="subtitle">⚡ Edição Noturna ⚡</div>

      <button className="btn btn--green" onClick={() => onStart(MODE.TWO_PLAYER)}>
        👥 2 JOGADORES
      </button>
      <button className="btn btn--blue btn--disabled" disabled title="Em breve (Prorrogação)">
        🤖 VS MÁQUINA
      </button>
      <button className="btn btn--gold btn--disabled" disabled title="Em breve (2º Tempo)">
        🏆 Meu Álbum ({collectionCount}/30)
      </button>

      <GamepadStatus />
    </div>
  );
}
