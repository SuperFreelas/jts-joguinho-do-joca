// Aplica o efeito de um superpoder ao estado do jogo (função pura/mutável, testável).
import { BALL } from '../data/constants.js';
import { POWERS } from '../data/powers.js';
import { ballSpeed, setBallSpeed } from './physics.js';

export function setPowerMessage(s, power) {
  s.powerMessage = { text: power.label, color: power.color, ttl: 1500, alpha: 1 };
}

// s: estado do jogo; legend: { power, owner }
export function applyPower(s, legend) {
  const power = POWERS[legend.power];
  if (!power) return;
  setPowerMessage(s, power);
  switch (power.key) {
    case 'SUPER_CHUTE':
      s.ball.fire = true;
      setBallSpeed(s.ball, Math.min(ballSpeed(s.ball) * power.speedMult, BALL.MAX_SPEED * 1.8));
      break;
    case 'BOLA_INVISIVEL':
      s.effects.invisibleTicks = power.durationTicks;
      break;
    case 'SUPER_GOLEIRO':
      s.effects.superGoalie[legend.owner] = power.durationTicks;
      break;
    case 'SUPER_TRAVA': {
      const opp = legend.owner === 'left' ? 'right' : 'left';
      s.effects.freeze[opp] = power.durationTicks;
      break;
    }
    default:
      break;
  }
}
