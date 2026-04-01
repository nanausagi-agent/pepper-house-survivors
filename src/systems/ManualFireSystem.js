import { defineQuery, hasComponent } from 'bitecs';
import { Player, Position, Attack, AimAngle, Enemy, Dead } from '../ecs/components.js';
import { FIRE_SEMI, FIRE_HOLD } from '../ecs/components.js';
import { createProjectile } from '../entities/ProjectileFactory.js';
import { normalize, distanceSq } from '../utils/math.js';

const playerQuery = defineQuery([Player, Position, Attack, AimAngle]);
const enemyQuery = defineQuery([Enemy, Position]);

const HOLD_THRESHOLD = 200; // ms before hold-fire kicks in

export function createManualFireSystem(scene) {
  // Track pointer state
  scene.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      scene.game.__fireDown = true;
      scene.game.__fireDownTime = Date.now();
    }
  });
  scene.input.on('pointerup', (pointer) => {
    if (!pointer.leftButtonDown()) {
      // If it was a quick click (semi), flag it
      if (scene.game.__fireDown) {
        const elapsed = Date.now() - (scene.game.__fireDownTime || 0);
        if (elapsed < HOLD_THRESHOLD) {
          scene.game.__fireSemiClick = true;
        }
      }
      scene.game.__fireDown = false;
      scene.game.__fireDownTime = 0;
    }
  });

  return function ManualFireSystem(world) {
    const isDown = scene.game.__fireDown || false;
    const downTime = scene.game.__fireDownTime || 0;
    const semiClick = scene.game.__fireSemiClick || false;
    scene.game.__fireSemiClick = false; // consume

    const holdTime = isDown ? Date.now() - downTime : 0;

    world.fire.clicking = semiClick;
    world.fire.holding = isDown && holdTime >= HOLD_THRESHOLD;
    world.fire.holdTime = holdTime;
  };
}
