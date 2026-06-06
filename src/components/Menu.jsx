import GamepadStatus from './GamepadStatus.jsx';
import { MODE } from '../data/constants.js';
import { PLAYERS } from '../data/players.js';
import { POWERS } from '../data/powers.js';

// Menu principal.
export default function Menu({ onStart, onOpenAlbum, collection, collectionCount = 0 }) {
  const owned = new Set(collection?.owned || []);
  const myLegends = PLAYERS.filter((p) => p.rarity === 'LENDARIO' && owned.has(p.name));
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
      <button className="btn btn--gold" onClick={onOpenAlbum}>
        🏆 Meu Álbum ({collectionCount}/30)
      </button>

      {myLegends.length > 0 && (
        <div className="menu-legends">
          <span className="menu-legends-label">👑 Seus lendários:</span>
          {myLegends.map((p) => (
            <span key={p.name} className="menu-legend-chip" title={POWERS[p.power].name}>
              {POWERS[p.power].emoji} {p.name}
            </span>
          ))}
        </div>
      )}

      <GamepadStatus />
    </div>
  );
}
