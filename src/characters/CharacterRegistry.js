import { COLORS } from '../config.js';

const characters = new Map();

export const CharacterRegistry = {
  register(charDef) {
    characters.set(charDef.id, charDef);
  },

  get(id) {
    return characters.get(id);
  },

  getAll() {
    return [...characters.values()].filter(c => c.phase === 1);
  },

  init(characterData) {
    for (const c of characterData) {
      this.register(c);
    }
  },
};

// Default character data (used if JSON not loaded)
export const DEFAULT_CHARACTERS = [
  {
    id: 'moo',
    name: 'ムーさん',
    archetype: 'tactician',
    phase: 1,
    color: COLORS.player.moo,
    baseStats: { hp: 100, speed: 120, armor: 0, pickupRange: 40 },
    startWeapon: 'spread',
    description: '佈陣型 — 戰略性配置',
  },
  {
    id: 'nyao',
    name: 'にゃおぬこ',
    archetype: 'aggressor',
    phase: 1,
    color: COLORS.player.nyao,
    baseStats: { hp: 80, speed: 160, armor: 0, pickupRange: 35 },
    startWeapon: 'spread',
    description: '壓迫型 — 高速近戰',
  },
  {
    id: 'abarenboo',
    name: 'あばれんぼー',
    archetype: 'rhythm',
    phase: 1,
    color: COLORS.player.abarenboo,
    baseStats: { hp: 120, speed: 130, armor: 2, pickupRange: 45 },
    startWeapon: 'spread',
    description: '節奏型 — 蓄力掃擊',
  },
];
