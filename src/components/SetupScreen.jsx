import { useEffect, useRef, useState } from 'react';
import { PLAYERS } from '../data/players.js';
import { POWERS } from '../data/powers.js';
import { FIELD, LEGEND, MODE } from '../data/constants.js';

// Tela de posicionamento: cada jogador escolhe um lendário e clica/toca na sua
// metade do campo para posicionar (até 2). Toque num posicionado para remover.
// Auto-pula se não houver lendários na coleção.
export default function SetupScreen({ mode, collection, onReady }) {
  const owned = new Set(collection?.owned || []);
  const ownedLegends = PLAYERS.filter((p) => p.rarity === 'LENDARIO' && owned.has(p.name));

  const players =
    mode === MODE.VS_CPU
      ? [{ key: 'right', label: '🟡 Você', color: 'var(--p1)' }]
      : [
          { key: 'right', label: '🟡 Jogador 1', color: 'var(--p1)' },
          { key: 'left', label: '🔵 Jogador 2', color: 'var(--p2)' },
        ];

  const [placements, setPlacements] = useState([]);
  const [armed, setArmed] = useState(null); // { owner, name, power }
  const fieldRef = useRef(null);
  const idRef = useRef(0);

  // Sem lendários => pula direto pro jogo.
  useEffect(() => {
    if (ownedLegends.length === 0) onReady([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (ownedLegends.length === 0) return null;

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

    // remover se clicou em cima de um posicionado
    const hitIdx = placements.findIndex((p) => Math.hypot(p.x - px, p.y - py) <= LEGEND.R + 6);
    if (hitIdx >= 0) {
      setPlacements(placements.filter((_, i) => i !== hitIdx));
      return;
    }
    if (!armed) return;
    const owner = armed.owner;
    if (countFor(owner) >= LEGEND.MAX_PER_PLAYER) return;
    // precisa clicar na metade do próprio jogador
    const onRight = px >= FIELD.W / 2;
    if ((owner === 'right') !== onRight) return;
    const z = zoneFor(owner);
    const x = clamp(px, z.x0, z.x1);
    const y = clamp(py, z.y0, z.y1);
    setPlacements([...placements, { id: ++idRef.current, x, y, owner, power: armed.power, name: armed.name }]);
  };

  const start = () => onReady(placements.map(({ x, y, power, owner }) => ({ x, y, power, owner })));

  return (
    <div className="screen setup-screen">
      <h1 className="setup-title">👑 Escale seus Lendários</h1>
      <p className="setup-hint">Escolha um lendário e toque na sua metade do campo (até 2). Toque de novo pra remover.</p>

      <div className="setup-field" ref={fieldRef} onClick={onFieldClick} onTouchStart={(e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        onFieldClick({ clientX: t.clientX, clientY: t.clientY });
      }}>
        <div className="setup-half setup-half--left" />
        <div className="setup-half setup-half--right" />
        <div className="setup-centerline" />
        {placements.map((p) => {
          const left = (p.x / FIELD.W) * 100;
          const top = (p.y / FIELD.H) * 100;
          return (
            <div
              key={p.id}
              className="setup-legend"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                background: POWERS[p.power].color,
              }}
            >
              {POWERS[p.power].emoji}
            </div>
          );
        })}
      </div>

      <div className="setup-pickers">
        {players.map((pl) => (
          <div key={pl.key} className="setup-picker">
            <div className="setup-picker-label" style={{ color: pl.color }}>
              {pl.label} ({countFor(pl.key)}/{LEGEND.MAX_PER_PLAYER})
            </div>
            <div className="setup-chips">
              {ownedLegends.map((lg) => {
                const isArmed = armed && armed.owner === pl.key && armed.name === lg.name;
                return (
                  <button
                    key={lg.name}
                    className={`setup-chip ${isArmed ? 'setup-chip--armed' : ''}`}
                    onClick={() => setArmed({ owner: pl.key, name: lg.name, power: lg.power })}
                  >
                    <span className="setup-chip-emoji">{POWERS[lg.power].emoji}</span>
                    {lg.name}
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
