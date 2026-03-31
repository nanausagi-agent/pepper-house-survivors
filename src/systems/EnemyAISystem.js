import { defineQuery, hasComponent } from 'bitecs';
import { Position, Velocity, Enemy, Dead } from '../ecs/components.js';
import { normalize } from '../utils/math.js';

const enemyQuery = defineQuery([Enemy, Position, Velocity]);

export function EnemyAISystem(world) {
  const pid = world.player.eid;
  if (pid < 0) return;

  const px = Position.x[pid];
  const py = Position.y[pid];
  const entities = enemyQuery(world);

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    if (hasComponent(world, Dead, eid)) continue;

    const ex = Position.x[eid];
    const ey = Position.y[eid];
    const speed = Enemy.speed[eid];

    const dir = normalize(px - ex, py - ey);
    Velocity.x[eid] = dir.x * speed;
    Velocity.y[eid] = dir.y * speed;
  }
}
