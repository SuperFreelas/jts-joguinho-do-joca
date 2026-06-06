// Aplica o efeito de um superpoder ao estado do jogo (função pura/mutável, testável).
import { BALL, FIELD } from '../data/constants.js';
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

    // ---- Épicos ----
    case 'TURBO':
      setBallSpeed(s.ball, Math.min(ballSpeed(s.ball) * power.speedMult, BALL.MAX_SPEED * 1.4));
      break;
    case 'CURVAO':
      s.effects.curve = {
        ticks: power.durationTicks,
        dir: Math.random() < 0.5 ? 1 : -1,
        angle: power.curveAngle,
      };
      break;
    case 'GOL_DUPLO':
      s.effects.doubleGoal[legend.owner] = true;
      break;
    case 'MINI_BOLA':
      s.effects.miniBallTicks = power.durationTicks;
      s.ball.radius = BALL.R * power.scale;
      break;
    case 'IMA': {
      const opp = legend.owner === 'left' ? 'right' : 'left';
      s.effects.slow[opp] = power.durationTicks;
      break;
    }
    case 'TELEGUIADO': {
      // mira o gol ADVERSÁRIO ao dono do lendário
      const tx = legend.owner === 'right' ? 0 : FIELD.W; // P1 (dir) ataca gol esquerdo
      s.effects.homing = { ticks: power.durationTicks, tx, ty: FIELD.H / 2, k: power.homingK };
      break;
    }
    default:
      break;
  }
}
