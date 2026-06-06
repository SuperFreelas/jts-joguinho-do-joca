// Persistência em localStorage.
// Coleções POR JOGADOR: golagol.profiles.v1 = { [nome]: { owned: string[], pity } }

const KEY = 'golagol.collection.v1'; // (legado, coleção compartilhada)
const PKEY = 'golagol.profiles.v1';

const emptyProfile = () => ({ owned: [], pity: 0 });

function normalizeProfile(p) {
  return {
    owned: Array.isArray(p?.owned) ? p.owned : [],
    pity: typeof p?.pity === 'number' ? p.pity : 0,
  };
}

// Carrega TODOS os perfis. Migra a coleção antiga compartilhada (se existir) para
// um perfil "Jogador 1" na primeira vez.
export function loadProfiles() {
  let profiles = {};
  try {
    const raw = localStorage.getItem(PKEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && typeof o === 'object') profiles = o;
    }
  } catch {
    profiles = {};
  }
  // migração da coleção legada
  if (Object.keys(profiles).length === 0) {
    try {
      const old = JSON.parse(localStorage.getItem(KEY));
      if (old && Array.isArray(old.owned) && old.owned.length) {
        profiles = { 'Jogador 1': normalizeProfile(old) };
        saveProfiles(profiles);
      }
    } catch {
      /* sem legado */
    }
  }
  return profiles;
}

export function saveProfiles(profiles) {
  try {
    localStorage.setItem(PKEY, JSON.stringify(profiles));
  } catch {
    /* localStorage indisponível — ignora */
  }
}

// Perfil de um nome (sempre devolve um objeto válido).
export function getProfile(profiles, name) {
  const key = (name || '').trim();
  if (!key) return emptyProfile();
  return normalizeProfile(profiles[key]);
}

// Devolve novos profiles com o perfil do nome atualizado.
export function withProfile(profiles, name, profile) {
  const key = (name || '').trim();
  if (!key) return profiles;
  return { ...profiles, [key]: normalizeProfile(profile) };
}

// Lista os perfis salvos: [{ name, owned, pity, count }]
export function listProfiles(profiles) {
  return Object.entries(profiles).map(([name, p]) => {
    const np = normalizeProfile(p);
    return { name, owned: np.owned, pity: np.pity, count: np.owned.length };
  });
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
