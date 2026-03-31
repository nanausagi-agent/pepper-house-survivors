import { defineQuery, hasComponent } from 'bitecs';
import { Player, Position, Attack, Enemy, Dead } from '../ecs/components.js';
import { createProjectile } from '../entities/ProjectileFactory.js';
import { normalize, distanceSq } from '../utils/math.js';

const playerQuery = defineQuery([Player, Position, Attack]);
const enemyQuery = defineQuery([Enemy, Position]);

export function WeaponSystem(world) {
  const dt = world.time.delta;
  const entities = playerQuery(world);

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    Attack.timer[eid] -= dt;
    if (Attack.timer[eid] > 0) continue;

    // Reset timer
    Attack.timer[eid] = Attack.cooldown[eid];

    const px = Position.x[eid];
    const py = Position.y[eid];
    const damage = Attack.damage[eid];
    const range = Attack.range[eid];

    // Find nearest enemy
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
      // No nearby enemy — fire spread pattern in movement direction or right
      const dx = world.input.x || 1;
      const dy = world.input.y || 0;
      fireSpread(world, px, py, dx, dy, damage);
    } else {
      // Aim at nearest enemy
      const ex = Position.x[nearestEid];
      const ey = Position.y[nearestEid];
      const dir = normalize(ex - px, ey - py);
      fireSpread(world, px, py, dir.x, dir.y, damage);
    }
  }
}

function fireSpread(world, px, py, dx, dy, damage) {
  const speed = 300;
  const count = 3;
  const spreadAngle = 0.3; // radians between shots
  const baseAngle = Math.atan2(dy, dx);

  for (let i = 0; i < count; i++) {
    const a = baseAngle + (i - (count - 1) / 2) * spreadAngle;
    const vx = Math.cos(a) * speed;
    const vy = Math.sin(a) * speed;
    createProjectile(world, px, py, vx, vy, damage, speed, 1500);
  }
}
