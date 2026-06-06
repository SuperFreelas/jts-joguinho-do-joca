import { listProfiles } from '../collection/storage.js';
import { TOTAL_PLAYERS } from '../data/players.js';

// Lista os jogadores (perfis) salvos; toque pra abrir o álbum de cada um.
export default function AlbumsListScreen({ profiles, onOpen, onBack }) {
  const list = listProfiles(profiles).sort((a, b) => b.count - a.count);

  return (
    <div className="screen screen--scroll albums-screen">
      <h1 className="album-title">🏆 Álbuns</h1>

      {list.length === 0 ? (
        <p className="albums-empty">
          Ainda não há jogadores. Jogue uma partida, ganhe um baller e seu álbum aparece aqui! ⚽
        </p>
      ) : (
        <div className="albums-list">
          {list.map((p) => (
            <button key={p.name} className="albums-item" onClick={() => onOpen(p.name)}>
              <span className="albums-item-name">{p.name}</span>
              <span className="albums-item-count">
                {p.count}/{TOTAL_PLAYERS}
              </span>
            </button>
          ))}
        </div>
      )}

      <button className="btn btn--gold" onClick={onBack} style={{ margin: '18px 0 30px' }}>
        ⬅️ Voltar
      </button>
    </div>
  );
}
