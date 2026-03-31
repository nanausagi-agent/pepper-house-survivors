import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Health, Collider, Enemy, Dead } from '../ecs/components.js';

const ENEMY_DEFS = {
  grunt_a: { hp: 20, speed: 50, damage: 5, radius: 7, xp: 1, tier: 0 },
  grunt_b: { hp: 40, speed: 60, damage: 8, radius: 8, xp: 2, tier: 1 },
  fast:    { hp: 10, speed: 120, damage: 4, radius: 6, xp: 2, tier: 2 },
  tank:    { hp: 100, speed: 30, damage: 15, radius: 12, xp: 5, tier: 3 },
  shooter: { hp: 30, speed: 55, damage: 6, radius: 7, xp: 3, tier: 4 },
  elite:   { hp: 500, speed: 45, damage: 20, radius: 20, xp: 30, tier: 5 },
};

export function getEnemyDef(type) {
  return ENEMY_DEFS[type] || ENEMY_DEFS.grunt_a;
}

export function createEnemy(world, type, x, y) {
  const def = getEnemyDef(type);
  const eid = addEntity(world);

  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;

  addComponent(world, Health, eid);
  Health.current[eid] = def.hp;
  Health.max[eid] = def.hp;
  Health.invulnTimer[eid] = 0;

  addComponent(world, Collider, eid);
  Collider.radius[eid] = def.radius;

  addComponent(world, Enemy, eid);
  Enemy.typeId[eid] = def.tier;
  Enemy.tier[eid] = def.tier;
  Enemy.damage[eid] = def.damage;
  Enemy.speed[eid] = def.speed;
  Enemy.xpValue[eid] = def.xp;

  return eid;
}

export function resetEnemy(world, eid, type, x, y) {
  const def = getEnemyDef(type);
  Position.x[eid] = x;
  Position.y[eid] = y;
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;
  Health.current[eid] = def.hp;
  Health.max[eid] = def.hp;
  Health.invulnTimer[eid] = 0;
  Collider.radius[eid] = def.radius;
  Enemy.typeId[eid] = def.tier;
  Enemy.tier[eid] = def.tier;
  Enemy.damage[eid] = def.damage;
  Enemy.speed[eid] = def.speed;
  Enemy.xpValue[eid] = def.xp;
}
