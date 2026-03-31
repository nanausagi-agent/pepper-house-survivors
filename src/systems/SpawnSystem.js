import { defineQuery, hasComponent } from 'bitecs';
import { Position, Enemy, Dead } from '../ecs/components.js';
import { createEnemy } from '../entities/EnemyFactory.js';
import { randomPointOnEdge } from '../utils/math.js';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_SPAWN_MARGIN, MAX_ENEMIES } from '../config.js';

const enemyQuery = defineQuery([Enemy]);

export function createSpawnSystem(waveManager) {
  return function SpawnSystem(world) {
    const pid = world.player.eid;
    if (pid < 0) return;

    const px = Position.x[pid];
    const py = Position.y[pid];

    // Count alive enemies
    const enemies = enemyQuery(world);
    let aliveCount = 0;
    for (let i = 0; i < enemies.length; i++) {
      if (!hasComponent(world, Dead, enemies[i])) aliveCount++;
    }

    if (aliveCount >= MAX_ENEMIES) return;

    const spawns = waveManager.getSpawns(world.time.elapsed, world.time.delta);

    for (let i = 0; i < spawns.length; i++) {
      if (aliveCount >= MAX_ENEMIES) break;
      const type = spawns[i];
      const hw = GAME_WIDTH * 0.5;
      const hh = GAME_HEIGHT * 0.5;
      const pos = randomPointOnEdge(px, py, hw, hh, ENEMY_SPAWN_MARGIN);
      createEnemy(world, type, pos.x, pos.y);
      aliveCount++;
    }
  };
}
