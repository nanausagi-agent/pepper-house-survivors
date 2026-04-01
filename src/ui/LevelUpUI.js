import { Attack, Health } from '../ecs/components.js';
import { t } from '../i18n.js';

const FONT = "'DotGothic16', monospace";

export function createLevelUpUI(scene, world, onChoice) {
  let container = null;

  const UPGRADES = [
    {
      id: 'damage', labelKey: 'levelup.damage', descKey: 'levelup.damage.desc',
      apply: () => { const eid = world.player.eid; if (eid >= 0) Attack.damage[eid] *= 1.15; },
    },
    {
      id: 'speed', labelKey: 'levelup.speed', descKey: 'levelup.speed.desc',
      apply: () => { world.player.speed *= 1.10; },
    },
    {
      id: 'maxhp', labelKey: 'levelup.maxhp', descKey: 'levelup.maxhp.desc',
      apply: () => {
        const eid = world.player.eid;
        Health.max[eid] += 20;
        Health.current[eid] = Math.min(Health.current[eid] + 20, Health.max[eid]);
      },
    },
    {
      id: 'firerate', labelKey: 'levelup.firerate', descKey: 'levelup.firerate.desc',
      apply: () => { const eid = world.player.eid; Attack.cooldown[eid] *= 0.88; },
    },
    {
      id: 'pickup', labelKey: 'levelup.pickup', descKey: 'levelup.pickup.desc',
      apply: () => { world.player.pickupRange *= 1.2; },
    },
    {
      id: 'heal', labelKey: 'levelup.heal', descKey: 'levelup.heal.desc',
      apply: () => {
        const eid = world.player.eid;
        Health.current[eid] = Math.min(Health.current[eid] + Health.max[eid] * 0.3, Health.max[eid]);
      },
    },
  ];

  function show() {
    if (container) return;

    world.paused = true;
    const cam = scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    container = scene.add.container(0, 0).setScrollFactor(0).setDepth(200);

    // Dim overlay
    const overlay = scene.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.6);
    container.add(overlay);

    // Title
    const title = scene.add.text(cx, cy - 140, t('levelup.title'), {
      fontSize: '32px', fontFamily: FONT, color: '#FFD700',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    container.add(title);

    const subtitle = scene.add.text(cx, cy - 105, t('levelup.pick'), {
      fontSize: '14px', fontFamily: FONT, color: '#aaaaaa',
    }).setOrigin(0.5);
    container.add(subtitle);

    // Pick 3 random upgrades
    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    choices.forEach((choice, i) => {
      const y = cy - 40 + i * 70;
      const bg = scene.add.rectangle(cx, y, 350, 55, 0x222244, 0.9)
        .setStrokeStyle(2, 0x4488FF);
      const label = scene.add.text(cx, y - 8, t(choice.labelKey), {
        fontSize: '18px', fontFamily: FONT, color: '#ffffff',
      }).setOrigin(0.5);
      const desc = scene.add.text(cx, y + 14, t(choice.descKey), {
        fontSize: '12px', fontFamily: FONT, color: '#aaaaaa',
      }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => bg.setFillStyle(0x334466, 1))
        .on('pointerout', () => bg.setFillStyle(0x222244, 0.9))
        .on('pointerdown', () => {
          choice.apply();
          hide();
          if (onChoice) onChoice(choice);
        });

      container.add([bg, label, desc]);
    });
  }

  function hide() {
    if (container) {
      container.destroy();
      container = null;
    }
    world.paused = false;
  }

  return { show, hide };
}
