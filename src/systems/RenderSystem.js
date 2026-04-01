import { defineQuery, hasComponent } from 'bitecs';
import { Position, Player, Enemy, Projectile, Pickup, Dead, Health, AimAngle } from '../ecs/components.js';
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

  // Aim line graphics (world space, follows player)
  const aimLine = scene.add.graphics().setDepth(9);

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

    // Get aim angle for directional indicator
    const angle = AimAngle.angle[eid] || 0;
    const facingLeft = Math.abs(angle) > Math.PI / 2;

    // Body
    gfx.fillStyle(color, 1);
    gfx.fillCircle(0, 0, 14);

    // Direction indicator — points toward mouse
    gfx.fillStyle(0xFFFFFF, 0.9);
    gfx.fillCircle(Math.cos(angle) * 10, Math.sin(angle) * 10, 4);

    // Eyes — flip based on aim direction
    const eyeX = facingLeft ? -4 : 4;
    gfx.fillStyle(0x000000, 0.8);
    gfx.fillCircle(eyeX - 2, -4, 2);
    gfx.fillCircle(eyeX + 4, -4, 2);

    // Invuln flash
    if (Health.invulnTimer[eid] > 0) {
      gfx.fillStyle(0xFFFFFF, 0.4);
      gfx.fillCircle(0, 0, 16);
    }

    // Ultimate active glow
    if (world.player.ultActive > 0) {
      gfx.lineStyle(3, 0xFFD700, 0.6 + Math.sin(Date.now() * 0.01) * 0.3);
      gfx.strokeCircle(0, 0, 20);
    }
  }

  function drawEnemy(gfx, eid) {
    gfx.clear();
    const tier = Enemy.typeId[eid] || 0;
    const color = ENEMY_COLORS[tier] || COLORS.enemy.grunt_a;
    const radius = 7 + tier * 2;
    gfx.fillStyle(color, 1);
    gfx.fillRect(-radius, -radius, radius * 2, radius * 2);
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

        // Draw aim line for aimed weapons
        aimLine.clear();
        if (world.player.usesAim) {
          const angle = AimAngle.angle[eid] || 0;
          const px = Position.x[eid];
          const py = Position.y[eid];
          const len = 100;
          aimLine.lineStyle(1, 0xffffff, 0.15);
          aimLine.lineBetween(
            px + Math.cos(angle) * 18,
            py + Math.sin(angle) * 18,
            px + Math.cos(angle) * len,
            py + Math.sin(angle) * len
          );
        }
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
      aimLine.destroy();
    },
  };

  return sys;
}
