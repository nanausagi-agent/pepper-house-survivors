import { defineQuery, hasComponent, addComponent } from 'bitecs';
import { Projectile, Position, Dead } from '../ecs/components.js';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_DESPAWN_MARGIN } from '../config.js';

const projQuery = defineQuery([Projectile, Position]);

export function ProjectileSystem(world) {
  const dt = world.time.delta;
  const pid = world.player.eid;
  if (pid < 0) return;

  const px = Position.x[pid];
  const py = Position.y[pid];
  const entities = projQuery(world);

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    if (hasComponent(world, Dead, eid)) continue;

    // Reduce lifetime
    Projectile.lifetime[eid] -= dt;
    if (Projectile.lifetime[eid] <= 0) {
      addComponent(world, Dead, eid);
      continue;
    }

    // Off-screen cull (1.5x viewport from player)
    const ex = Position.x[eid];
    const ey = Position.y[eid];
    if (
      Math.abs(ex - px) > GAME_WIDTH ||
      Math.abs(ey - py) > GAME_HEIGHT
    ) {
      addComponent(world, Dead, eid);
    }
  }
}
