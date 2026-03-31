import { defineQuery, hasComponent } from 'bitecs';
import { Position, Player, Enemy, Projectile, Pickup, Dead, Health } from '../ecs/components.js';
import { COLORS } from '../config.js';

const ENEMY_COLORS = [
  COLORS.enemy.grunt_a,
  COLORS.enemy.grunt_b,
  COLORS.enemy.fast,
  COLORS.enemy.tank,
  COLORS.enemy.shooter,
  COLORS.enemy.elite,
];

const playerQuery = defineQuery([Player, Position]);
const enemyQuery = defineQuery([Enemy, Position]);
const projQuery = defineQuery([Projectile, Position]);
const pickupQuery = defineQuery([Pickup, Position]);

export function createRenderSystem(scene, world) {
  const sprites = new Map();

  function getOrCreateSprite(eid, type) {
    if (sprites.has(eid)) return sprites.get(eid);

    let gfx;
    switch (type) {
      case 'player': {
        gfx = scene.add.graphics();
        gfx.setDepth(10);
        break;
      }
      case 'enemy': {
        gfx = scene.add.graphics();
        gfx.setDepth(5);
        break;
      }
      case 'projectile': {
        gfx = scene.add.graphics();
        gfx.setDepth(8);
        break;
      }
      case 'pickup': {
        gfx = scene.add.graphics();
        gfx.setDepth(3);
        break;
      }
      default: {
        gfx = scene.add.graphics();
        break;
      }
    }
    sprites.set(eid, { gfx, type });
    return sprites.get(eid);
  }

  function drawPlayer(gfx, eid) {
    gfx.clear();
    const color = world.player.color || COLORS.player.moo;
    // Body
    gfx.fillStyle(color, 1);
    gfx.fillCircle(0, 0, 14);
    // Direction indicator
    const dirX = world.input.x || 0;
    const dirY = world.input.y || 0;
    if (dirX !== 0 || dirY !== 0) {
      gfx.fillStyle(0xFFFFFF, 0.9);
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      gfx.fillCircle((dirX / (len || 1)) * 10, (dirY / (len || 1)) * 10, 4);
    }
    // Invuln flash
    if (Health.invulnTimer[eid] > 0) {
      gfx.fillStyle(0xFFFFFF, 0.4);
      gfx.fillCircle(0, 0, 16);
    }
  }

  function drawEnemy(gfx, eid) {
    gfx.clear();
    const tier = Enemy.typeId[eid] || 0;
    const color = ENEMY_COLORS[tier] || COLORS.enemy.grunt_a;
    const radius = 7 + tier * 2;
    gfx.fillStyle(color, 1);
    // Square-ish enemies for visual distinction
    gfx.fillRect(-radius, -radius, radius * 2, radius * 2);
    // Eyes
    gfx.fillStyle(0xFFFFFF, 0.9);
    gfx.fillCircle(-3, -3, 2);
    gfx.fillCircle(3, -3, 2);
  }

  function drawProjectile(gfx) {
    gfx.clear();
    gfx.fillStyle(COLORS.projectile, 1);
    gfx.fillCircle(0, 0, 4);
    gfx.fillStyle(0xFFFFFF, 0.6);
    gfx.fillCircle(0, 0, 2);
  }

  function drawPickup(gfx) {
    gfx.clear();
    gfx.fillStyle(COLORS.xpGem, 1);
    // Diamond shape
    gfx.fillPoints([
      { x: 0, y: -5 },
      { x: 5, y: 0 },
      { x: 0, y: 5 },
      { x: -5, y: 0 },
    ], true);
  }

  const sys = {
    update() {
      // Players
      const players = playerQuery(world);
      for (let i = 0; i < players.length; i++) {
        const eid = players[i];
        if (hasComponent(world, Dead, eid)) continue;
        const s = getOrCreateSprite(eid, 'player');
        s.gfx.x = Position.x[eid];
        s.gfx.y = Position.y[eid];
        drawPlayer(s.gfx, eid);
      }

      // Enemies
      const enemies = enemyQuery(world);
      for (let i = 0; i < enemies.length; i++) {
        const eid = enemies[i];
        if (hasComponent(world, Dead, eid)) {
          sys.destroySprite(eid);
          continue;
        }
        const s = getOrCreateSprite(eid, 'enemy');
        s.gfx.x = Position.x[eid];
        s.gfx.y = Position.y[eid];
        drawEnemy(s.gfx, eid);
      }

      // Projectiles
      const projs = projQuery(world);
      for (let i = 0; i < projs.length; i++) {
        const eid = projs[i];
        if (hasComponent(world, Dead, eid)) {
          sys.destroySprite(eid);
          continue;
        }
        const s = getOrCreateSprite(eid, 'projectile');
        s.gfx.x = Position.x[eid];
        s.gfx.y = Position.y[eid];
        drawProjectile(s.gfx);
      }

      // Pickups
      const pickups = pickupQuery(world);
      for (let i = 0; i < pickups.length; i++) {
        const eid = pickups[i];
        if (hasComponent(world, Dead, eid)) {
          sys.destroySprite(eid);
          continue;
        }
        const s = getOrCreateSprite(eid, 'pickup');
        s.gfx.x = Position.x[eid];
        s.gfx.y = Position.y[eid];
        drawPickup(s.gfx);
      }
    },

    destroySprite(eid) {
      const s = sprites.get(eid);
      if (s) {
        s.gfx.destroy();
        sprites.delete(eid);
      }
    },

    destroyAll() {
      for (const [, s] of sprites) {
        s.gfx.destroy();
      }
      sprites.clear();
    },
  };

  return sys;
}
