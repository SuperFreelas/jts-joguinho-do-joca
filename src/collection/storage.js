// Persistência da coleção em localStorage.
// Formato: { owned: string[] (nomes), pity: number }

const KEY = 'golagol.collection.v1';

export function loadCollection() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { owned: [], pity: 0 };
    const o = JSON.parse(raw);
    return {
      owned: Array.isArray(o.owned) ? o.owned : [],
      pity: typeof o.pity === 'number' ? o.pity : 0,
    };
  } catch {
    return { owned: [], pity: 0 };
  }
}

export function saveCollection(c) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ owned: c.owned, pity: c.pity }));
  } catch {
    /* localStorage indisponível (modo privado) — ignora */
  }
}

// --- Nomes dos jogadores (lembrados entre partidas) ---
const NAMES_KEY = 'golagol.names.v1';

export function loadNames() {
  try {
    const o = JSON.parse(localStorage.getItem(NAMES_KEY)) || {};
    return { right: o.right || '', left: o.left || '' };
  } catch {
    return { right: '', left: '' };
  }
}

export function saveNames(n) {
  try {
    localStorage.setItem(NAMES_KEY, JSON.stringify({ right: n.right || '', left: n.left || '' }));
  } catch {
    /* ignora */
  }
}
