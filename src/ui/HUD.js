import { Health } from '../ecs/components.js';
import { COLORS, GAME_DURATION } from '../config.js';
import { t } from '../i18n.js';

const FONT = "'DotGothic16', monospace";

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
    fontSize: '18px', fontFamily: FONT, color: '#ffffff',
    stroke: '#000000', strokeThickness: 3,
  }).setScrollFactor(0).setDepth(101);

  const timerText = scene.add.text(scene.cameras.main.width - margin, margin, '00:00', {
    fontSize: '18px', fontFamily: FONT, color: '#ffffff',
    stroke: '#000000', strokeThickness: 3,
  }).setScrollFactor(0).setDepth(101).setOrigin(1, 0);

  const killText = scene.add.text(scene.cameras.main.width - margin, margin + 24, '', {
    fontSize: '14px', fontFamily: FONT, color: '#ffcc00',
    stroke: '#000000', strokeThickness: 2,
  }).setScrollFactor(0).setDepth(101).setOrigin(1, 0);

  // Ultimate cooldown gauge — bottom center
  const ultGfx = scene.add.graphics().setScrollFactor(0).setDepth(101);
  const camW = scene.cameras.main.width;
  const camH = scene.cameras.main.height;
  const ultBarW = 160;
  const ultBarH = 12;
  const ultX = (camW - ultBarW) / 2;
  const ultY = camH - 30;

  const ultLabel = scene.add.text(camW / 2, ultY - 14, '必殺技 [SPACE]', {
    fontSize: '11px', fontFamily: FONT, color: '#cccccc',
    stroke: '#000000', strokeThickness: 2,
  }).setScrollFactor(0).setDepth(101).setOrigin(0.5);

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
      levelText.setText(t('hud.level', { level: world.player.level }));

      // Timer
      const elapsed = Math.min(world.time.elapsed, GAME_DURATION);
      const secs = Math.floor(elapsed / 1000);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      timerText.setText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);

      // Kills
      killText.setText(t('hud.kills', { kills: world.player.kills }));

      // Ultimate gauge
      ultGfx.clear();
      const ultCd = world.player.ultCooldown || 15000;
      const ultTimer = world.player.ultTimer || 0;
      const ultActive = world.player.ultActive || 0;

      // Background
      ultGfx.fillStyle(0x333333, 0.8);
      ultGfx.fillRoundedRect(ultX, ultY, ultBarW, ultBarH, 3);

      if (ultActive > 0) {
        // Active — gold pulsing bar
        ultGfx.fillStyle(0xFFD700, 0.9);
        ultGfx.fillRoundedRect(ultX, ultY, ultBarW, ultBarH, 3);
        ultLabel.setText('⚡ 発動中！');
        ultLabel.setColor('#FFD700');
      } else if (ultTimer <= 0) {
        // Ready
        ultGfx.fillStyle(0x44FF44, 0.9);
        ultGfx.fillRoundedRect(ultX, ultY, ultBarW, ultBarH, 3);
        ultLabel.setText('必殺技 [SPACE] ✓');
        ultLabel.setColor('#44FF44');
      } else {
        // Charging
        const ratio = 1 - (ultTimer / ultCd);
        ultGfx.fillStyle(0x6666FF, 0.8);
        ultGfx.fillRoundedRect(ultX, ultY, ultBarW * ratio, ultBarH, 3);
        const secLeft = Math.ceil(ultTimer / 1000);
        ultLabel.setText(`必殺技 ${secLeft}秒`);
        ultLabel.setColor('#8888FF');
      }
    },

    destroy() {
      hpBg.destroy();
      hpBar.destroy();
      xpBar.destroy();
      levelText.destroy();
      timerText.destroy();
      killText.destroy();
      ultGfx.destroy();
      ultLabel.destroy();
    },
  };
}
