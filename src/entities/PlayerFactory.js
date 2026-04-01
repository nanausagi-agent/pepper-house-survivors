import { addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Health, Collider, Player, Attack, AimAngle, Ultimate } from '../ecs/components.js';

export function createPlayer(world, charDef, x, y) {
  const eid = addEntity(world);

  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;

  addComponent(world, Health, eid);
  Health.current[eid] = charDef.baseStats.hp;
  Health.max[eid] = charDef.baseStats.hp;
  Health.invulnTimer[eid] = 0;

  addComponent(world, Collider, eid);
  Collider.radius[eid] = 14;

  addComponent(world, Player, eid);

  addComponent(world, Attack, eid);
  Attack.damage[eid] = 10;
  Attack.cooldown[eid] = 600;
  Attack.timer[eid] = 0;
  Attack.range[eid] = 200;

  addComponent(world, AimAngle, eid);
  AimAngle.angle[eid] = 0;
  AimAngle.mouseX[eid] = 0;
  AimAngle.mouseY[eid] = 0;

  // Ultimate ability — type based on character
  const ultTypes = { moo: 0, nyao: 1, abarenboo: 2 };
  addComponent(world, Ultimate, eid);
  Ultimate.cooldown[eid] = 15000; // 15s cooldown
  Ultimate.timer[eid] = 0;       // ready immediately
  Ultimate.duration[eid] = 3000; // 3s active
  Ultimate.active[eid] = 0;
  Ultimate.type[eid] = ultTypes[charDef.id] || 0;

  world.player.eid = eid;
  world.player.speed = charDef.baseStats.speed;
  world.player.pickupRange = charDef.baseStats.pickupRange;
  world.player.characterId = charDef.id;
  world.player.color = charDef.color;
  // Default fireMode: auto (0). Characters with aimed weapons get set per weapon data.
  world.player.fireMode = 0;
  world.player.usesAim = false;

  return eid;
}
