// Sorteio de baller. Raridades mutuamente exclusivas (somam 100%): ver RARITY.
// Dentro da raridade, prioriza jogadores ainda NÃO possuídos.
// Pity: após PITY_THRESHOLD repetidos consecutivos, garante um jogador novo.

import { PLAYERS, playersByRarity } from '../data/players.js';
import { RARITY, RARITY_ORDER, PITY_THRESHOLD } from '../data/constants.js';

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

// Escolhe uma raridade por faixa cumulativa (0..100).
function rollRarity(rng) {
  const roll = rng() * 100;
  let acc = 0;
  for (const key of RARITY_ORDER) {
    acc += RARITY[key].chance;
    if (roll < acc) return key;
  }
  return 'COMUM';
}

// collection: { owned: string[], pity: number }
// Retorna: { player, rarity, isDuplicate, newPity }
export function drawBaller(collection, rng = Math.random) {
  const owned = new Set(collection.owned || []);
  const pity = collection.pity || 0;

  const notOwnedAll = PLAYERS.filter((p) => !owned.has(p.name));
  const pityActive = pity >= PITY_THRESHOLD && notOwnedAll.length > 0;

  let player;
  if (pityActive) {
    // garante um jogador novo (qualquer raridade)
    player = pick(notOwnedAll, rng);
  } else {
    const rarity = rollRarity(rng);
    const pool = playersByRarity(rarity);
    const notOwned = pool.filter((p) => !owned.has(p.name));
    player = notOwned.length > 0 ? pick(notOwned, rng) : pick(pool, rng);
  }

  const isDuplicate = owned.has(player.name);
  const newPity = isDuplicate ? pity + 1 : 0;

  return { player, rarity: player.rarity, isDuplicate, newPity };
}

// Aplica o resultado à coleção (adiciona se novo; atualiza pity sempre).
export function applyDraw(collection, draw) {
  const owned = draw.isDuplicate
    ? collection.owned
    : [...collection.owned, draw.player.name];
  return { owned, pity: draw.newPity };
}
