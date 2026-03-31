import { defineQuery, hasComponent, addComponent } from 'bitecs';
import { Health, Enemy, Dead, Position } from '../ecs/components.js';
import { eventBus } from '../managers/EventBus.js';

const enemyHealthQuery = defineQuery([Enemy, Health]);

export function HealthSystem(world) {
  // Check enemy health — mark dead
  const entities = enemyHealthQuery(world);
  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    if (hasComponent(world, Dead, eid)) continue;
    if (Health.current[eid] <= 0) {
      addComponent(world, Dead, eid);
      world.player.kills++;
      eventBus.emit('enemy:killed', {
        entityId: eid,
        x: Position.x[eid],
        y: Position.y[eid],
        xpValue: Enemy.xpValue[eid],
        typeId: Enemy.typeId[eid],
      });
    }
  }
}
