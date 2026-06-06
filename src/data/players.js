// Os 30 jogadores. `number` = número da camisa (usado no avatar).
// Lendários têm `power` (chave em POWERS).

export const PLAYERS = [
  // 👑 LENDÁRIO (5%)
  { name: 'Vini Jr', rarity: 'LENDARIO', number: 7, power: 'SUPER_CHUTE' },
  { name: 'Messi', rarity: 'LENDARIO', number: 10, power: 'BOLA_INVISIVEL' },
  { name: 'Mbappé', rarity: 'LENDARIO', number: 9, power: 'SUPER_GOLEIRO' },
  { name: 'Cristiano Ronaldo', rarity: 'LENDARIO', number: 7, power: 'SUPER_TRAVA' },

  // 🔥 ÉPICO (15%)
  { name: 'Bellingham', rarity: 'EPICO', number: 5 },
  { name: 'Lamine Yamal', rarity: 'EPICO', number: 19 },
  { name: 'Endrick', rarity: 'EPICO', number: 9 },
  { name: 'Saka', rarity: 'EPICO', number: 7 },
  { name: 'Raphinha', rarity: 'EPICO', number: 11 },
  { name: 'Salah', rarity: 'EPICO', number: 11 },

  // 💎 RARO (30%)
  { name: 'Palmer', rarity: 'RARO', number: 20 },
  { name: 'Valverde', rarity: 'RARO', number: 8 },
  { name: 'Wirtz', rarity: 'RARO', number: 10 },
  { name: 'Musiala', rarity: 'RARO', number: 42 },
  { name: 'Alisson', rarity: 'RARO', number: 1 },
  { name: 'Son', rarity: 'RARO', number: 7 },
  { name: 'Phil Foden', rarity: 'RARO', number: 47 },
  { name: 'Bruno Fernandes', rarity: 'RARO', number: 8 },

  // ⚽ COMUM (50%)
  { name: 'Courtois', rarity: 'COMUM', number: 1 },
  { name: 'Militão', rarity: 'COMUM', number: 3 },
  { name: 'Rüdiger', rarity: 'COMUM', number: 22 },
  { name: 'Carvajal', rarity: 'COMUM', number: 2 },
  { name: 'Ter Stegen', rarity: 'COMUM', number: 1 },
  { name: 'Alexander-Arnold', rarity: 'COMUM', number: 66 },
  { name: 'Donnarumma', rarity: 'COMUM', number: 99 },
  { name: 'Marquinhos', rarity: 'COMUM', number: 5 },
  { name: 'Van Dijk', rarity: 'COMUM', number: 4 },
  { name: 'Gabriel Magalhães', rarity: 'COMUM', number: 6 },
  { name: 'Rice', rarity: 'COMUM', number: 41 },
  { name: 'Kimmich', rarity: 'COMUM', number: 6 },
];

export const PLAYERS_BY_NAME = Object.fromEntries(PLAYERS.map((p) => [p.name, p]));

export function playersByRarity(rarity) {
  return PLAYERS.filter((p) => p.rarity === rarity);
}

export const TOTAL_PLAYERS = PLAYERS.length; // 30
