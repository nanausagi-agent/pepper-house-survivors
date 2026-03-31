import { defineQuery, hasComponent, addComponent } from 'bitecs';
import { Position, Velocity, Pickup, Dead, Player, PICKUP_XP } from '../ecs/components.js';
import { distanceSq, normalize } from '../utils/math.js';
import { PICKUP_RANGE, PICKUP_MAGNET_RANGE, PICKUP_MAGNET_SPEED } from '../config.js';
import { eventBus } from '../managers/EventBus.js';

const pickupQuery = defineQuery([Pickup, Position]);

export function PickupSystem(world) {
  const pid = world.player.eid;
  if (pid < 0) return;

  const px = Position.x[pid];
  const py = Position.y[pid];
  const pickupRange = world.player.pickupRange || PICKUP_RANGE;
  const magnetRange = PICKUP_MAGNET_RANGE;
  const entities = pickupQuery(world);

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    if (hasComponent(world, Dead, eid)) continue;

    const ex = Position.x[eid];
    const ey = Position.y[eid];
    const dSq = distanceSq(px, py, ex, ey);

    // Direct pickup
    if (dSq < pickupRange * pickupRange) {
      const type = Pickup.type[eid];
      const value = Pickup.value[eid];

      if (type === PICKUP_XP) {
        world.player.xp += value;
        eventBus.emit('pickup:collected', { type: 'xp', value });
      }

      addComponent(world, Dead, eid);
      continue;
    }

    // Magnet pull
    if (dSq < magnetRange * magnetRange) {
      const dir = normalize(px - ex, py - ey);
      Velocity.x[eid] = dir.x * PICKUP_MAGNET_SPEED;
      Velocity.y[eid] = dir.y * PICKUP_MAGNET_SPEED;
    } else {
      Velocity.x[eid] = 0;
      Velocity.y[eid] = 0;
    }
  }
}
