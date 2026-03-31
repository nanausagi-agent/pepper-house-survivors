import { createWorld } from 'bitecs';

export function createGameWorld() {
  const world = createWorld();
  // Attach runtime state that systems need
  world.time = { delta: 0, elapsed: 0 };
  world.input = { x: 0, y: 0, skill: false };
  world.player = { eid: -1, level: 1, xp: 0, xpToNext: 10, kills: 0, selectedCharacter: null };
  world.gameOver = false;
  world.paused = false;
  return world;
}
