import { XP_PER_LEVEL } from '../config.js';
import { eventBus } from '../managers/EventBus.js';

export function ExperienceSystem(world) {
  const p = world.player;
  if (p.eid < 0) return;

  while (p.xp >= p.xpToNext && p.level < XP_PER_LEVEL.length) {
    p.xp -= p.xpToNext;
    p.level++;
    p.xpToNext = XP_PER_LEVEL[p.level] || (p.xpToNext + 100);

    eventBus.emit('player:levelup', { newLevel: p.level });
  }
}
