import { defineQuery } from 'bitecs';
import { Player, Position, AimAngle } from '../ecs/components.js';

const playerQuery = defineQuery([Player, Position, AimAngle]);

export function createMouseAimSystem(scene) {
  // Hide default cursor on game canvas
  scene.input.setDefaultCursor('none');

  // Crosshair graphics (fixed to camera)
  const crosshair = scene.add.graphics().setScrollFactor(0).setDepth(999);

  // Track mouse position
  let pointerX = 0;
  let pointerY = 0;

  scene.input.on('pointermove', (pointer) => {
    pointerX = pointer.x;
    pointerY = pointer.y;
  });

  function drawCrosshair(x, y) {
    crosshair.clear();
    crosshair.lineStyle(2, 0xffffff, 0.8);
    const size = 10;
    const gap = 4;
    // Horizontal lines
    crosshair.lineBetween(x - size, y, x - gap, y);
    crosshair.lineBetween(x + gap, y, x + size, y);
    // Vertical lines
    crosshair.lineBetween(x, y - size, x, y - gap);
    crosshair.lineBetween(x, y + gap, x, y + size);
    // Center dot
    crosshair.fillStyle(0xff4444, 0.9);
    crosshair.fillCircle(x, y, 1.5);
  }

  return function MouseAimSystem(world) {
    const cam = scene.cameras.main;
    // Convert screen pointer to world coordinates
    const worldX = pointerX + cam.scrollX;
    const worldY = pointerY + cam.scrollY;

    world.aim.x = pointerX;
    world.aim.y = pointerY;
    world.aim.worldX = worldX;
    world.aim.worldY = worldY;

    const entities = playerQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const px = Position.x[eid];
      const py = Position.y[eid];
      const angle = Math.atan2(worldY - py, worldX - px);
      AimAngle.angle[eid] = angle;
      AimAngle.mouseX[eid] = worldX;
      AimAngle.mouseY[eid] = worldY;
      world.aim.angle = angle;
    }

    // Draw crosshair at screen pointer position
    drawCrosshair(pointerX, pointerY);
  };
}
