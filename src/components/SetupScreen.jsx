import { useRef, useState } from 'react';
import { PLAYERS, PLAYERS_BY_NAME } from '../data/players.js';
import { POWERS } from '../data/powers.js';
import { FIELD, LEGEND, MODE, RARITY, RARITY_ORDER } from '../data/constants.js';
import { loadNames, saveNames } from '../collection/storage.js';

// Pré-jogo: nomes dos jogadores + escalação (até 2 cada) da coleção.
// Lendários/épicos têm poder; comuns/raros são bloqueadores. Toggle pra remover.
export default function SetupScreen({ mode, collection, onReady }) {
  const owned = new Set(collection?.owned || []);
  const ownedPlayers = RARITY_ORDER.flatMap((rk) =>
    PLAYERS.filter((p) => p.rarity === rk && owned.has(p.name)),
  );
  const hasFieldables = ownedPlayers.length > 0;

  const players =
    mode === MODE.VS_CPU
      ? [{ key: 'right', label: '🟡 Você', color: 'var(--p1)' }]
      : [
          { key: 'right', label: '🟡 Jogador 1', color: 'var(--p1)' },
          { key: 'left', label: '🔵 Jogador 2', color: 'var(--p2)' },
        ];

  const saved = loadNames();
  const [names, setNames] = useState({ right: saved.right, left: saved.left });
  const [placements, setPlacements] = useState([]);
  const [armed, setArmed] = useState(null);
  const fieldRef = useRef(null);
  const idRef = useRef(0);

  const zoneFor = (owner) => {
    const cx = FIELD.W / 2;
    return owner === 'right'
      ? { x0: cx + 50, x1: FIELD.W - 130, y0: 50, y1: FIELD.H - 50 }
      : { x0: 130, x1: cx - 50, y0: 50, y1: FIELD.H - 50 };
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const countFor = (owner) => placements.filter((p) => p.owner === owner).length;

  const onFieldClick = (e) => {
    const rect = fieldRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * FIELD.W;
    const py = ((e.clientY - rect.top) / rect.height) * FIELD.H;
    const hitIdx = placements.findIndex((p) => Math.hypot(p.x - px, p.y - py) <= LEGEND.R + 6);
    if (hitIdx >= 0) {
      setPlacements(placements.filter((_, i) => i !== hitIdx));
      return;
    }
    if (!armed) return;
    const owner = armed.owner;
    if (countFor(owner) >= LEGEND.MAX_PER_PLAYER) return;
    const onRight = px >= FIELD.W / 2;
    if ((owner === 'right') !== onRight) return;
    const z = zoneFor(owner);
    const x = clamp(px, z.x0, z.x1);
    const y = clamp(py, z.y0, z.y1);
    const pl = PLAYERS_BY_NAME[armed.name];
    setPlacements([
      ...placements,
      { id: ++idRef.current, x, y, owner, power: pl.power, rarity: pl.rarity, number: pl.number, name: pl.name },
    ]);
  };

  const start = () => {
    const finalNames =
      mode === MODE.VS_CPU
        ? { right: names.right.trim() || 'Você', left: 'CPU' }
        : { right: names.right.trim() || 'Jogador 1', left: names.left.trim() || 'Jogador 2' };
    saveNames({ right: mode === MODE.VS_CPU ? names.right : names.right, left: mode === MODE.VS_CPU ? names.left : names.left });
    onReady({
      names: finalNames,
      placements: placements.map(({ x, y, power, owner, rarity, number, name }) => ({
        x, y, power, owner, rarity, number, name,
      })),
    });
  };

  const markerStyle = (p) => {
    const power = POWERS[p.power];
    return {
      left: `${(p.x / FIELD.W) * 100}%`,
      top: `${(p.y / FIELD.H) * 100}%`,
      background: power ? power.color : RARITY[p.rarity].color,
      borderColor: power ? 'var(--gold)' : 'rgba(255,255,255,0.7)',
    };
  };

  return (
    <div className="screen setup-screen">
      <h1 className="setup-title">⚽ Quem vai jogar?</h1>

      {/* Nomes */}
      <div className="setup-names">
        {players.map((pl) => (
          <div key={pl.key} className="setup-name-field">
            <span className="setup-name-dot" style={{ background: pl.color }} />
            <input
              className="setup-name-input"
              type="text"
              maxLength={12}
              placeholder={mode === MODE.VS_CPU ? 'Seu nome' : pl.label.replace(/^.. /, '')}
              value={names[pl.key]}
              onChange={(e) => setNames({ ...names, [pl.key]: e.target.value })}
            />
          </div>
        ))}
        {mode === MODE.VS_CPU && <div className="setup-vs">🆚 🤖 CPU</div>}
      </div>

      {hasFieldables && (
        <>
          <p className="setup-hint">
            Escale até 2 e toque na sua metade. 👑🔥 têm poder; os outros só rebatem. Toque de novo
            pra remover.
          </p>
          <div
            className="setup-field"
            ref={fieldRef}
            onClick={onFieldClick}
            onTouchStart={(e) => {
              e.preventDefault();
              const t = e.changedTouches[0];
              onFieldClick({ clientX: t.clientX, clientY: t.clientY });
            }}
          >
            <div className="setup-half setup-half--left" />
            <div className="setup-half setup-half--right" />
            <div className="setup-centerline" />
            {placements.map((p) => (
              <div key={p.id} className="setup-legend" style={markerStyle(p)}>
                {POWERS[p.power] ? POWERS[p.power].emoji : p.number}
              </div>
            ))}
          </div>

          <div className="setup-pickers">
            {players.map((pl) => (
              <div key={pl.key} className="setup-picker">
                <div className="setup-picker-label" style={{ color: pl.color }}>
                  {pl.label} ({countFor(pl.key)}/{LEGEND.MAX_PER_PLAYER})
                </div>
                <div className="setup-chips">
                  {ownedPlayers.map((p) => {
                    const isArmed = armed && armed.owner === pl.key && armed.name === p.name;
                    const power = POWERS[p.power];
                    const icon = power ? power.emoji : RARITY[p.rarity].emoji;
                    return (
                      <button
                        key={p.name}
                        className={`setup-chip ${isArmed ? 'setup-chip--armed' : ''}`}
                        onClick={() => setArmed({ owner: pl.key, name: p.name })}
                      >
                        <span className="setup-chip-emoji">{icon}</span>
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="btn btn--green" onClick={start}>
        ▶️ Começar!
      </button>
    </div>
  );
}
