import { useEffect, useRef, useState } from 'react';
import { PLAYERS, PLAYERS_BY_NAME } from '../data/players.js';
import { POWERS } from '../data/powers.js';
import { FIELD, LEGEND, MODE, RARITY, RARITY_ORDER } from '../data/constants.js';

// Tela de posicionamento: cada jogador escala até 2 jogadores da SUA coleção e
// toca/clica na sua metade do campo para posicionar. Lendários/épicos têm poder;
// comuns/raros entram como bloqueadores. Toque num posicionado para remover.
// Auto-pula se a coleção estiver vazia.
export default function SetupScreen({ mode, collection, onReady }) {
  const owned = new Set(collection?.owned || []);
  // todos os jogadores da coleção, ordenados por raridade
  const ownedPlayers = RARITY_ORDER.flatMap((rk) =>
    PLAYERS.filter((p) => p.rarity === rk && owned.has(p.name)),
  );

  const players =
    mode === MODE.VS_CPU
      ? [{ key: 'right', label: '🟡 Você', color: 'var(--p1)' }]
      : [
          { key: 'right', label: '🟡 Jogador 1', color: 'var(--p1)' },
          { key: 'left', label: '🔵 Jogador 2', color: 'var(--p2)' },
        ];

  const [placements, setPlacements] = useState([]);
  const [armed, setArmed] = useState(null); // { owner, name }
  const fieldRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (ownedPlayers.length === 0) onReady([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (ownedPlayers.length === 0) return null;

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

  const start = () =>
    onReady(placements.map(({ x, y, power, owner, rarity, number, name }) => ({ x, y, power, owner, rarity, number, name })));

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
      <h1 className="setup-title">⚽ Escale seu Time</h1>
      <p className="setup-hint">
        Escolha 2 jogadores e toque na sua metade do campo. 👑 Lendários e 🔥 épicos têm poder; os
        outros só rebatem. Toque de novo pra remover.
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

      <button className="btn btn--green" onClick={start}>
        ▶️ Começar!
      </button>
    </div>
  );
}
