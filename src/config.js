// Game constants — single source of truth
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const WORLD_WIDTH = 2400;   // 3x screen
export const WORLD_HEIGHT = 1800;  // 3x screen

export const PLAYER_SPEED = 150;
export const PICKUP_RANGE = 50;
export const PICKUP_MAGNET_RANGE = 120;
export const PICKUP_MAGNET_SPEED = 300;

export const XP_PER_LEVEL = [0, 10, 25, 50, 80, 120, 170, 230, 300, 380, 470, 570, 680, 800, 930, 1070, 1220, 1380, 1550, 1730];

export const ENEMY_SPAWN_MARGIN = 80;    // px outside viewport
export const ENEMY_DESPAWN_MARGIN = 600; // px outside viewport to despawn
export const MAX_ENEMIES = 500;

export const SPATIAL_CELL_SIZE = 64;

export const DAMAGE_INVULN_MS = 500; // iframes after taking damage

export const GAME_DURATION = 15 * 60 * 1000; // 15 minutes in ms

export const COLORS = {
  bg: 0x1a1a2e,
  player: {
    moo: 0xFF9800,
    nyao: 0xE91E63,
    abarenboo: 0x4CAF50,
  },
  enemy: {
    grunt_a: 0x9C27B0,
    grunt_b: 0x673AB7,
    fast: 0xF44336,
    tank: 0x607D8B,
    shooter: 0xFF5722,
    elite: 0xFFEB3B,
  },
  projectile: 0x00BCD4,
  xpGem: 0x76FF03,
  hpBar: 0x4CAF50,
  hpBarBg: 0x424242,
  xpBar: 0x2196F3,
};
