import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Collider, Projectile } from '../ecs/components.js';

export function createProjectile(world, x, y, vx, vy, damage, speed, lifetime = 2000) {
  const eid = addEntity(world);

  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = vx;
  Velocity.y[eid] = vy;

  addComponent(world, Collider, eid);
  Collider.radius[eid] = 5;

  addComponent(world, Projectile, eid);
  Projectile.damage[eid] = damage;
  Projectile.speed[eid] = speed;
  Projectile.piercing[eid] = 0;
  Projectile.lifetime[eid] = lifetime;

  return eid;
}

export function resetProjectile(world, eid, x, y, vx, vy, damage, speed, lifetime = 2000) {
  Position.x[eid] = x;
  Position.y[eid] = y;
  Velocity.x[eid] = vx;
  Velocity.y[eid] = vy;
  Projectile.damage[eid] = damage;
  Projectile.speed[eid] = speed;
  Projectile.piercing[eid] = 0;
  Projectile.lifetime[eid] = lifetime;
}
