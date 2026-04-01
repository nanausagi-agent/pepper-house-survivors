import { defineQuery, hasComponent } from 'bitecs';
import { Player, Position, Attack, Enemy, Dead, AimAngle } from '../ecs/components.js';
import { FIRE_AUTO, FIRE_SEMI, FIRE_HOLD, FIRE_AIMED } from '../ecs/components.js';
import { createProjectile } from '../entities/ProjectileFactory.js';
import { normalize, distanceSq } from '../utils/math.js';

const playerQuery = defineQuery([Player, Position, Attack]);
const enemyQuery = defineQuery([Enemy, Position]);

export function WeaponSystem(world) {
  const dt = world.time.delta;
  const entities = playerQuery(world);
  const fireMode = world.player.fireMode || FIRE_AUTO;

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    Attack.timer[eid] -= dt;

    // Determine if we should fire based on fireMode
    let shouldFire = false;
    switch (fireMode) {
      case FIRE_AUTO:
        // Auto weapons fire on cooldown automatically
        shouldFire = Attack.timer[eid] <= 0;
        break;
      case FIRE_SEMI:
        // Semi fires on click only, still respects cooldown
        shouldFire = Attack.timer[eid] <= 0 && world.fire.clicking;
        break;
      case FIRE_HOLD:
        // Hold fires while mouse held, respects cooldown
        shouldFire = Attack.timer[eid] <= 0 && world.fire.holding;
        break;
      case FIRE_AIMED:
        // Aimed fires automatically but uses mouse direction
        shouldFire = Attack.timer[eid] <= 0;
        break;
    }

    if (!shouldFire) {
      if (Attack.timer[eid] <= 0 && (fireMode === FIRE_SEMI || fireMode === FIRE_HOLD)) {
        Attack.timer[eid] = 0; // Don't go negative, wait for input
      }
      continue;
    }

    Attack.timer[eid] = Attack.cooldown[eid];

    const px = Position.x[eid];
    const py = Position.y[eid];
    const damage = Attack.damage[eid];
    const range = Attack.range[eid];
    const usesAim = world.player.usesAim || false;

    // Determine firing direction
    if (usesAim || fireMode === FIRE_AIMED || fireMode === FIRE_SEMI || fireMode === FIRE_HOLD) {
      // Use mouse aim direction
      const angle = world.aim.angle || 0;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      fireSpread(world, px, py, dx, dy, damage);
    } else {
      // Auto: find nearest enemy
      const enemies = enemyQuery(world);
      let nearestEid = -1;
      let nearestDist = range * range;

      for (let j = 0; j < enemies.length; j++) {
        const eeid = enemies[j];
        if (hasComponent(world, Dead, eeid)) continue;
        const d = distanceSq(px, py, Position.x[eeid], Position.y[eeid]);
        if (d < nearestDist) {
          nearestDist = d;
          nearestEid = eeid;
        }
      }

      if (nearestEid < 0) {
        const dx = world.input.x || 1;
        const dy = world.input.y || 0;
        fireSpread(world, px, py, dx, dy, damage);
      } else {
        const ex = Position.x[nearestEid];
        const ey = Position.y[nearestEid];
        const dir = normalize(ex - px, ey - py);
        fireSpread(world, px, py, dir.x, dir.y, damage);
      }
    }
  }
}

function fireSpread(world, px, py, dx, dy, damage) {
  const speed = 300;
  const count = 3;
  const spreadAngle = 0.3;
  const baseAngle = Math.atan2(dy, dx);

  for (let i = 0; i < count; i++) {
    const a = baseAngle + (i - (count - 1) / 2) * spreadAngle;
    const vx = Math.cos(a) * speed;
    const vy = Math.sin(a) * speed;
    createProjectile(world, px, py, vx, vy, damage, speed, 1500);
  }
}
