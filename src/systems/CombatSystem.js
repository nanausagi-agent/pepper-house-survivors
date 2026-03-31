import { defineQuery, hasComponent, addComponent } from 'bitecs';
import { Position, Collider, Enemy, Player, Projectile, Health, Dead } from '../ecs/components.js';
import { distanceSq } from '../utils/math.js';
import { DAMAGE_INVULN_MS } from '../config.js';
import { eventBus } from '../managers/EventBus.js';

const enemyQuery = defineQuery([Enemy, Position, Collider]);
const projectileQuery = defineQuery([Projectile, Position, Collider]);

export function createCombatSystem(spatialHash) {
  return function CombatSystem(world) {
    const dt = world.time.delta;
    const pid = world.player.eid;
    if (pid < 0) return;

    const px = Position.x[pid];
    const py = Position.y[pid];
    const pRadius = Collider.radius[pid];

    // Decrement invuln timer
    if (Health.invulnTimer[pid] > 0) {
      Health.invulnTimer[pid] -= dt;
    }

    // Rebuild spatial hash
    spatialHash.clear();
    const enemies = enemyQuery(world);
    for (let i = 0; i < enemies.length; i++) {
      const eid = enemies[i];
      if (hasComponent(world, Dead, eid)) continue;
      spatialHash.insert(eid, Position.x[eid], Position.y[eid], Collider.radius[eid]);
    }

    // Enemy -> Player collision
    const nearby = spatialHash.queryRadius(px, py, pRadius + 20);
    for (let i = 0; i < nearby.length; i++) {
      const eid = nearby[i];
      if (hasComponent(world, Dead, eid)) continue;
      if (!hasComponent(world, Enemy, eid)) continue;

      const ex = Position.x[eid];
      const ey = Position.y[eid];
      const eRadius = Collider.radius[eid];
      const minDist = pRadius + eRadius;

      if (distanceSq(px, py, ex, ey) < minDist * minDist) {
        if (Health.invulnTimer[pid] <= 0) {
          const dmg = Enemy.damage[eid];
          Health.current[pid] -= dmg;
          Health.invulnTimer[pid] = DAMAGE_INVULN_MS;
          eventBus.emit('player:damaged', { amount: dmg, source: eid });

          if (Health.current[pid] <= 0) {
            Health.current[pid] = 0;
            eventBus.emit('game:over', { survived: false, stats: world.player });
            world.gameOver = true;
            return;
          }
        }
      }
    }

    // Projectile -> Enemy collision
    const projectiles = projectileQuery(world);
    for (let i = 0; i < projectiles.length; i++) {
      const projEid = projectiles[i];
      if (hasComponent(world, Dead, projEid)) continue;

      const bx = Position.x[projEid];
      const by = Position.y[projEid];
      const bRadius = Collider.radius[projEid];
      const damage = Projectile.damage[projEid];

      const nearEnemies = spatialHash.queryRadius(bx, by, bRadius + 16);
      for (let j = 0; j < nearEnemies.length; j++) {
        const eeid = nearEnemies[j];
        if (hasComponent(world, Dead, eeid)) continue;
        if (!hasComponent(world, Enemy, eeid)) continue;

        const ex = Position.x[eeid];
        const ey = Position.y[eeid];
        const eRadius = Collider.radius[eeid];
        const minDist = bRadius + eRadius;

        if (distanceSq(bx, by, ex, ey) < minDist * minDist) {
          // Hit!
          Health.current[eeid] -= damage;

          if (Health.current[eeid] <= 0) {
            addComponent(world, Dead, eeid);
            world.player.kills++;
            eventBus.emit('enemy:killed', {
              entityId: eeid,
              x: ex, y: ey,
              xpValue: Enemy.xpValue[eeid],
              typeId: Enemy.typeId[eeid],
            });
          }

          // Destroy projectile unless piercing
          if (Projectile.piercing[projEid] <= 0) {
            addComponent(world, Dead, projEid);
            break;
          } else {
            Projectile.piercing[projEid]--;
          }
        }
      }
    }
  };
}
