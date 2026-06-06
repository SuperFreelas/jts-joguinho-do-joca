import Avatar from '../collection/avatar.jsx';
import { PLAYERS, TOTAL_PLAYERS } from '../data/players.js';
import { RARITY, RARITY_ORDER } from '../data/constants.js';
import { POWERS } from '../data/powers.js';

// Álbum de colecionáveis: progresso X/30, seções por raridade, grid 4 col.
// Coletado = avatar+nome(+poder); não coletado = silhueta "???". Scroll só aqui.
export default function AlbumScreen({ collection, onBack }) {
  const owned = new Set(collection.owned || []);
  const count = owned.size;
  const pct = Math.round((count / TOTAL_PLAYERS) * 100);

  return (
    <div className="screen screen--scroll album-screen">
      <h1 className="album-title">🏆 Meu Álbum</h1>
      <div className="album-progress">
        <div className="album-progress-bar">
          <div className="album-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="album-progress-label">
          {count}/{TOTAL_PLAYERS}
        </div>
      </div>

      {RARITY_ORDER.map((rk) => {
        const r = RARITY[rk];
        const players = PLAYERS.filter((p) => p.rarity === rk);
        return (
          <section key={rk} className="album-section">
            <h2 className="album-section-title" style={{ color: r.color }}>
              {r.emoji} {r.label}
            </h2>
            <div className="album-grid">
              {players.map((p) => {
                const has = owned.has(p.name);
                const power = p.power ? POWERS[p.power] : null;
                return (
                  <div key={p.name} className={`album-card ${has ? '' : 'album-card--locked'}`}>
                    {has ? (
                      <>
                        <Avatar player={p} size={64} />
                        <div className="album-card-name">{p.name}</div>
                        {power && (
                          <div className="album-card-power" style={{ color: power.color }}>
                            {power.emoji}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="album-silhouette" />
                        <div className="album-card-name">???</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <button className="btn btn--gold" onClick={onBack} style={{ margin: '18px 0 30px' }}>
        ⬅️ Voltar
      </button>
    </div>
  );
}
