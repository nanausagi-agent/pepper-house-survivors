import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Collider, Pickup, PICKUP_XP } from '../ecs/components.js';

export function createPickup(world, x, y, type = PICKUP_XP, value = 1) {
  const eid = addEntity(world);

  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;

  addComponent(world, Collider, eid);
  Collider.radius[eid] = 5;

  addComponent(world, Pickup, eid);
  Pickup.type[eid] = type;
  Pickup.value[eid] = value;

  return eid;
}

export function resetPickupEntity(world, eid, x, y, type = PICKUP_XP, value = 1) {
  Position.x[eid] = x;
  Position.y[eid] = y;
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;
  Pickup.type[eid] = type;
  Pickup.value[eid] = value;
}
