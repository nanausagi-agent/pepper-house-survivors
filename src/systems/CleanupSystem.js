import { defineQuery, removeEntity, hasComponent } from 'bitecs';
import { Dead, Position, Enemy, Projectile, Pickup } from '../ecs/components.js';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_DESPAWN_MARGIN } from '../config.js';

const deadQuery = defineQuery([Dead]);
const enemyQuery = defineQuery([Enemy, Position]);

export function createCleanupSystem(renderSystem) {
  return function CleanupSystem(world) {
    // Remove dead entities
    const dead = deadQuery(world);
    for (let i = 0; i < dead.length; i++) {
      const eid = dead[i];
      if (renderSystem) renderSystem.destroySprite(eid);
      removeEntity(world, eid);
    }

    // Despawn far-away enemies
    const pid = world.player.eid;
    if (pid < 0) return;
    const px = Position.x[pid];
    const py = Position.y[pid];
    const enemies = enemyQuery(world);
    for (let i = 0; i < enemies.length; i++) {
      const eid = enemies[i];
      if (hasComponent(world, Dead, eid)) continue;
      const dx = Math.abs(Position.x[eid] - px);
      const dy = Math.abs(Position.y[eid] - py);
      if (dx > ENEMY_DESPAWN_MARGIN || dy > ENEMY_DESPAWN_MARGIN) {
        if (renderSystem) renderSystem.destroySprite(eid);
        removeEntity(world, eid);
      }
    }
  };
}
