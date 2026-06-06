import { useEffect, useRef, useState } from 'react';
import { drawBaller, applyDraw } from '../collection/gacha.js';
import Avatar from '../collection/avatar.jsx';
import { RARITY } from '../data/constants.js';
import { POWERS } from '../data/powers.js';

// Abre um baller: giro 3D (~1.8s) -> reveal com shine. Sorteia uma única vez.
export default function BallerScreen({ collection, winnerName, onCollected }) {
  const drawRef = useRef(null);
  if (drawRef.current === null) drawRef.current = drawBaller(collection);
  const draw = drawRef.current;

  const [phase, setPhase] = useState('spinning'); // 'spinning' | 'revealed'

  useEffect(() => {
    const id = setTimeout(() => setPhase('revealed'), 1800);
    return () => clearTimeout(id);
  }, []);

  const rarity = RARITY[draw.player.rarity] || RARITY.COMUM;
  const power = draw.player.power ? POWERS[draw.player.power] : null;

  const finish = () => onCollected(applyDraw(collection, draw));

  return (
    <div className="screen baller-screen">
      {winnerName && <div className="baller-owner">🎁 Baller de {winnerName}</div>}
      <div className="baller-stage">
        <div
          className={`baller-card ${phase === 'spinning' ? 'baller-card--spinning' : 'baller-card--revealed'}`}
          style={{ '--rarity': rarity.color }}
        >
          {phase === 'spinning' ? (
            <div className="baller-back">
              <div className="baller-back-logo">⚽</div>
            </div>
          ) : (
            <div className="baller-front">
              <div className="baller-shine" />
              <div className="baller-band" style={{ background: rarity.color }}>
                {rarity.emoji} {rarity.label}
              </div>
              <div className="baller-avatar">
                <Avatar player={draw.player} size={120} />
              </div>
              <div className="baller-name">{draw.player.name}</div>
              {power && (
                <div className="baller-power" style={{ color: power.color }}>
                  {power.emoji} {power.name}
                </div>
              )}
              {draw.isDuplicate && <div className="baller-dup">(Repetido!)</div>}
            </div>
          )}
        </div>
      </div>

      {phase === 'revealed' && (
        <button className="btn btn--green" onClick={finish}>
          {draw.isDuplicate ? '⚽ Jogar de novo!' : '✅ Colecionar!'}
        </button>
      )}
    </div>
  );
}
