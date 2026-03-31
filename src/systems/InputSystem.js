import { defineQuery } from 'bitecs';
import { Player, Velocity } from '../ecs/components.js';

const playerQuery = defineQuery([Player, Velocity]);

export function createInputSystem(scene) {
  const keys = scene.input.keyboard.addKeys({
    up: 'W', down: 'S', left: 'A', right: 'D',
    arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT',
  });

  return function InputSystem(world) {
    let dx = 0, dy = 0;
    if (keys.left.isDown || keys.arrowLeft.isDown) dx -= 1;
    if (keys.right.isDown || keys.arrowRight.isDown) dx += 1;
    if (keys.up.isDown || keys.arrowUp.isDown) dy -= 1;
    if (keys.down.isDown || keys.arrowDown.isDown) dy += 1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.SQRT2;
      dx *= inv;
      dy *= inv;
    }

    world.input.x = dx;
    world.input.y = dy;

    const speed = world.player.speed || 150;
    const entities = playerQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      Velocity.x[eid] = dx * speed;
      Velocity.y[eid] = dy * speed;
    }
  };
}
