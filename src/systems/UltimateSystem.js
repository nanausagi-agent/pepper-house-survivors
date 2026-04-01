import { defineQuery, hasComponent } from 'bitecs';
import { Player, Position, Ultimate, Enemy, Dead, Health, Collider } from '../ecs/components.js';
import { createProjectile } from '../entities/ProjectileFactory.js';
import { distanceSq } from '../utils/math.js';
import { eventBus } from '../managers/EventBus.js';

const playerQuery = defineQuery([Player, Position, Ultimate]);
const enemyQuery = defineQuery([Enemy, Position]);

export function createUltimateSystem(scene) {
  const spaceKey = scene.input.keyboard.addKey('SPACE');
  let wasDown = false;

  return function UltimateSystem(world) {
    const dt = world.time.delta;
    const entities = playerQuery(world);

    // Detect space press (not hold)
    const isDown = spaceKey.isDown;
    const justPressed = isDown && !wasDown;
    wasDown = isDown;

    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];

      // Tick down cooldown
      if (Ultimate.timer[eid] > 0) {
        Ultimate.timer[eid] = Math.max(0, Ultimate.timer[eid] - dt);
      }

      // Tick active duration
      if (Ultimate.active[eid] > 0) {
        Ultimate.active[eid] = Math.max(0, Ultimate.active[eid] - dt);
        // Execute ongoing effects while active
        executeUltimate(world, scene, eid, dt);
      }

      // Activate on space press
      if (justPressed && Ultimate.timer[eid] <= 0 && Ultimate.active[eid] <= 0) {
        Ultimate.active[eid] = Ultimate.duration[eid];
        Ultimate.timer[eid] = Ultimate.cooldown[eid];
        // Screen flash effect
        scene.cameras.main.flash(100, 255, 255, 255, true);
        eventBus.emit('ultimate:activated', { type: Ultimate.type[eid] });
      }

      // Expose state for HUD
      world.player.ultCooldown = Ultimate.cooldown[eid];
      world.player.ultTimer = Ultimate.timer[eid];
      world.player.ultActive = Ultimate.active[eid];
    }
  };
}

function executeUltimate(world, scene, eid, dt) {
  const type = Ultimate.type[eid];
  const px = Position.x[eid];
  const py = Position.y[eid];

  switch (type) {
    case 0: // Moo: all-direction barrage every 100ms
      executeMooUlt(world, px, py, dt);
      break;
    case 1: // Nyao: dash + AOE explosion at end
      executeNyaoUlt(world, scene, eid, px, py, dt);
      break;
    case 2: // Abarenboo: massive tail spin (huge AOE damage)
      executeAbarenbooUlt(world, px, py, dt);
      break;
  }
}

// Moo: 全砲台齊射 — rapid fire in 8 directions
let mooFireTimer = 0;
function executeMooUlt(world, px, py, dt) {
  mooFireTimer += dt;
  if (mooFireTimer < 100) return;
  mooFireTimer -= 100;

  const speed = 350;
  const damage = 15;
  for (let a = 0; a < 8; a++) {
    const angle = (a / 8) * Math.PI * 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    createProjectile(world, px, py, vx, vy, damage, speed, 1200);
  }
}

// Nyao: 瞬間突進 — dash toward mouse, AOE at destination
function executeNyaoUlt(world, scene, eid, px, py, dt) {
  const angle = world.aim.angle || 0;
  const dashSpeed = 600;
  // Move player toward aim
  Position.x[eid] += Math.cos(angle) * dashSpeed * (dt / 1000);
  Position.y[eid] += Math.sin(angle) * dashSpeed * (dt / 1000);

  // AOE damage to nearby enemies during dash
  const aoeRadius = 80;
  const aoeDamage = 25 * (dt / 1000);
  const enemies = enemyQuery(world);
  for (let j = 0; j < enemies.length; j++) {
    const eeid = enemies[j];
    if (hasComponent(world, Dead, eeid)) continue;
    const d = distanceSq(Position.x[eid], Position.y[eid], Position.x[eeid], Position.y[eeid]);
    if (d < aoeRadius * aoeRadius) {
      Health.current[eeid] -= aoeDamage;
    }
  }
}

// Abarenboo: 尾巴無限伸長 — massive AOE spin
let abaFireTimer = 0;
function executeAbarenbooUlt(world, px, py, dt) {
  abaFireTimer += dt;
  if (abaFireTimer < 150) return;
  abaFireTimer -= 150;

  // Huge radius damage
  const aoeRadius = 200;
  const aoeDamage = 20;
  const enemies = enemyQuery(world);
  for (let j = 0; j < enemies.length; j++) {
    const eeid = enemies[j];
    if (hasComponent(world, Dead, eeid)) continue;
    const d = distanceSq(px, py, Position.x[eeid], Position.y[eeid]);
    if (d < aoeRadius * aoeRadius) {
      Health.current[eeid] -= aoeDamage;
    }
  }
}
