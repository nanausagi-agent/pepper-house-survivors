import { Health } from '../ecs/components.js';
import { COLORS, GAME_DURATION } from '../config.js';

export function createHUD(scene, world) {
  const barWidth = 200;
  const barHeight = 16;
  const xpBarHeight = 8;
  const margin = 10;

  // HP bar background
  const hpBg = scene.add.graphics().setScrollFactor(0).setDepth(100);
  const hpBar = scene.add.graphics().setScrollFactor(0).setDepth(101);
  const xpBar = scene.add.graphics().setScrollFactor(0).setDepth(101);

  const levelText = scene.add.text(barWidth + margin * 2 + 10, margin, 'Lv.1', {
    fontSize: '18px', fontFamily: 'monospace', color: '#ffffff',
    stroke: '#000000', strokeThickness: 3,
  }).setScrollFactor(0).setDepth(101);

  const timerText = scene.add.text(scene.cameras.main.width - margin, margin, '00:00', {
    fontSize: '18px', fontFamily: 'monospace', color: '#ffffff',
    stroke: '#000000', strokeThickness: 3,
  }).setScrollFactor(0).setDepth(101).setOrigin(1, 0);

  const killText = scene.add.text(scene.cameras.main.width - margin, margin + 24, 'Kills: 0', {
    fontSize: '14px', fontFamily: 'monospace', color: '#ffcc00',
    stroke: '#000000', strokeThickness: 2,
  }).setScrollFactor(0).setDepth(101).setOrigin(1, 0);

  return {
    update() {
      const pid = world.player.eid;
      if (pid < 0) return;

      // HP bar
      const hpRatio = Math.max(0, Health.current[pid] / Health.max[pid]);
      hpBg.clear();
      hpBg.fillStyle(COLORS.hpBarBg, 1);
      hpBg.fillRoundedRect(margin, margin, barWidth, barHeight, 4);

      hpBar.clear();
      hpBar.fillStyle(COLORS.hpBar, 1);
      hpBar.fillRoundedRect(margin, margin, barWidth * hpRatio, barHeight, 4);

      // XP bar
      const xpRatio = world.player.xpToNext > 0
        ? Math.min(1, world.player.xp / world.player.xpToNext)
        : 0;
      xpBar.clear();
      xpBar.fillStyle(0x333333, 1);
      xpBar.fillRoundedRect(margin, margin + barHeight + 2, barWidth, xpBarHeight, 2);
      xpBar.fillStyle(COLORS.xpBar, 1);
      xpBar.fillRoundedRect(margin, margin + barHeight + 2, barWidth * xpRatio, xpBarHeight, 2);

      // Level
      levelText.setText(`Lv.${world.player.level}`);

      // Timer
      const elapsed = Math.min(world.time.elapsed, GAME_DURATION);
      const secs = Math.floor(elapsed / 1000);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      timerText.setText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);

      // Kills
      killText.setText(`Kills: ${world.player.kills}`);
    },

    destroy() {
      hpBg.destroy();
      hpBar.destroy();
      xpBar.destroy();
      levelText.destroy();
      timerText.destroy();
      killText.destroy();
    },
  };
}
