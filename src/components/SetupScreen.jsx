import { useRef, useState } from 'react';
import { PLAYERS, PLAYERS_BY_NAME } from '../data/players.js';
import { POWERS } from '../data/powers.js';
import { FIELD, LEGEND, MODE, RARITY, RARITY_ORDER } from '../data/constants.js';
import { loadNames, saveNames, getProfile } from '../collection/storage.js';
import Avatar from '../collection/avatar.jsx';

// Pré-jogo: nomes + escalação por jogador.
// Cada lado vê APENAS a coleção do nome digitado ali (coleções por jogador).
// Esquerda = Jogador 2 (azul) ; Direita = Jogador 1 (amarelo). Toggle pra remover.
export default function SetupScreen({ mode, profiles, onReady }) {
  const saved = loadNames();
  const [names, setNames] = useState({ right: saved.right, left: saved.left });
  const [placements, setPlacements] = useState([]);
  const [armed, setArmed] = useState(null); // { side, player }
  const fieldRef = useRef(null);
  const idRef = useRef(0);

  // lados ativos (no VS Máquina só a direita é humana)
  const sides =
    mode === MODE.VS_CPU
      ? [{ key: 'right', color: 'var(--p1)', human: true }]
      : [
          { key: 'left', color: 'var(--p2)', human: true },
          { key: 'right', color: 'var(--p1)', human: true },
        ];

  // coleção (ordenada por raridade) do nome digitado num lado
  const ownedFor = (side) => {
    const prof = getProfile(profiles, names[side]);
    const owned = new Set(prof.owned);
    return RARITY_ORDER.flatMap((rk) => PLAYERS.filter((p) => p.rarity === rk && owned.has(p.name)));
  };

  const zoneFor = (side) => {
    const cx = FIELD.W / 2;
    return side === 'right'
      ? { x0: cx + 50, x1: FIELD.W - 130, y0: 50, y1: FIELD.H - 50 }
      : { x0: 130, x1: cx - 50, y0: 50, y1: FIELD.H - 50 };
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const countFor = (side) => placements.filter((p) => p.owner === side).length;

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
    const side = armed.side;
    if (countFor(side) >= LEGEND.MAX_PER_PLAYER) return;
    const onRight = px >= FIELD.W / 2;
    if ((side === 'right') !== onRight) return; // só na metade do dono
    const z = zoneFor(side);
    const x = clamp(px, z.x0, z.x1);
    const y = clamp(py, z.y0, z.y1);
    const pl = PLAYERS_BY_NAME[armed.player];
    setPlacements([
      ...placements,
      { id: ++idRef.current, x, y, owner: side, power: pl.power, rarity: pl.rarity, number: pl.number, name: pl.name },
    ]);
  };

  const start = () => {
    const finalNames =
      mode === MODE.VS_CPU
        ? { right: names.right.trim() || 'Você', left: 'CPU' }
        : { right: names.right.trim() || 'Jogador 1', left: names.left.trim() || 'Jogador 2' };
    saveNames({ right: names.right, left: names.left });
    onReady({
      names: finalNames,
      placements: placements.map(({ x, y, power, owner, rarity, number, name }) => ({
        x, y, power, owner, rarity, number, name,
      })),
    });
  };

  const fieldTouch = (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    onFieldClick({ clientX: t.clientX, clientY: t.clientY });
  };

  const Column = ({ side }) => {
    const owned = ownedFor(side);
    const placeholder = side === 'right' ? (mode === MODE.VS_CPU ? 'Seu nome' : 'Jogador 1') : 'Jogador 2';
    return (
      <div className={`setup-col setup-col--${side}`}>
        <div className="setup-col-head">
          <input
            className="setup-name-input"
            type="text"
            maxLength={12}
            placeholder={placeholder}
            value={names[side]}
            onChange={(e) => setNames({ ...names, [side]: e.target.value })}
          />
          <span className="setup-col-count">{countFor(side)}/{LEGEND.MAX_PER_PLAYER}</span>
        </div>
        <div className="setup-col-chips">
          {owned.length === 0 ? (
            <div className="setup-col-empty">
              {names[side].trim() ? 'Sem jogadores na coleção' : 'Digite o nome'}
            </div>
          ) : (
            owned.map((p) => {
              const isArmed = armed && armed.side === side && armed.player === p.name;
              const power = POWERS[p.power];
              return (
                <button
                  key={p.name}
                  className={`setup-acard ${isArmed ? 'setup-acard--armed' : ''}`}
                  onClick={() => setArmed({ side, player: p.name })}
                >
                  <span className="av-wrap av-wrap--sm">
                    <span className="av-circle">
                      <Avatar player={p} size={34} />
                    </span>
                    {power && (
                      <span className="av-badge" style={{ background: power.color }}>
                        {power.emoji}
                      </span>
                    )}
                  </span>
                  <span className="setup-acard-name">{p.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="screen setup-screen">
      <h1 className="setup-title">⚽ Quem vai jogar?</h1>
      <p className="setup-hint">
        Digite o nome, escolha do seu lado e toque na sua metade (até 2). 👑🔥 têm poder; os outros
        só rebatem. Toque de novo pra remover.
      </p>

      <div className="setup-arena">
        {/* esquerda = P2 (azul) */}
        {mode === MODE.VS_CPU ? (
          <div className="setup-col setup-col--cpu">
            <div className="setup-cpu-label">🤖 CPU</div>
          </div>
        ) : (
          <Column side="left" />
        )}

        {/* campo */}
        <div
          className="setup-field"
          ref={fieldRef}
          onClick={onFieldClick}
          onTouchStart={fieldTouch}
        >
          <div className="setup-half setup-half--left" />
          <div className="setup-half setup-half--right" />
          <div className="setup-centerline" />
          {placements.map((p) => {
            const power = POWERS[p.power];
            return (
              <div
                key={p.id}
                className="setup-legend"
                style={{ left: `${(p.x / FIELD.W) * 100}%`, top: `${(p.y / FIELD.H) * 100}%` }}
              >
                <span
                  className="av-circle"
                  style={{ borderColor: power ? 'var(--gold)' : 'rgba(255,255,255,0.7)' }}
                >
                  <Avatar player={PLAYERS_BY_NAME[p.name]} size={30} />
                </span>
                {power && (
                  <span className="av-badge" style={{ background: power.color }}>
                    {power.emoji}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* direita = P1 (amarelo) */}
        <Column side="right" />
      </div>

      <button className="btn btn--green" onClick={start}>
        ▶️ Começar!
      </button>
    </div>
  );
}
