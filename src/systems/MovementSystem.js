import { defineQuery } from 'bitecs';
import { Position, Velocity, Player } from '../ecs/components.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config.js';
import { clamp } from '../utils/math.js';

const moveQuery = defineQuery([Position, Velocity]);

export function MovementSystem(world) {
  const dt = world.time.delta / 1000;
  const entities = moveQuery(world);

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    Position.x[eid] += Velocity.x[eid] * dt;
    Position.y[eid] += Velocity.y[eid] * dt;
  }

  // Clamp player to world bounds
  const pid = world.player.eid;
  if (pid >= 0) {
    Position.x[pid] = clamp(Position.x[pid], 16, WORLD_WIDTH - 16);
    Position.y[pid] = clamp(Position.y[pid], 16, WORLD_HEIGHT - 16);
  }
}
