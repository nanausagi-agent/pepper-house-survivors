import { Attack, Health } from '../ecs/components.js';

export function createLevelUpUI(scene, world, onChoice) {
  let container = null;

  const UPGRADES = [
    {
      id: 'damage', label: 'ATK +15%', desc: '攻撃力アップ',
      apply: () => { const eid = world.player.eid; if (eid >= 0) Attack.damage[eid] *= 1.15; },
    },
    {
      id: 'speed', label: 'SPD +10%', desc: '移動速度アップ',
      apply: () => { world.player.speed *= 1.10; },
    },
    {
      id: 'maxhp', label: 'HP +20', desc: '最大HPアップ',
      apply: () => {
        const eid = world.player.eid;
        Health.max[eid] += 20;
        Health.current[eid] = Math.min(Health.current[eid] + 20, Health.max[eid]);
      },
    },
    {
      id: 'firerate', label: 'FIRE RATE +12%', desc: '攻撃速度アップ',
      apply: () => { const eid = world.player.eid; Attack.cooldown[eid] *= 0.88; },
    },
    {
      id: 'pickup', label: 'MAGNET +20%', desc: '拾取範囲アップ',
      apply: () => { world.player.pickupRange *= 1.2; },
    },
    {
      id: 'heal', label: 'HEAL 30%', desc: 'HP回復',
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
    const title = scene.add.text(cx, cy - 130, 'LEVEL UP!', {
      fontSize: '32px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    container.add(title);

    // Pick 3 random upgrades
    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    choices.forEach((choice, i) => {
      const y = cy - 40 + i * 70;
      const bg = scene.add.rectangle(cx, y, 350, 55, 0x222244, 0.9)
        .setStrokeStyle(2, 0x4488FF);
      const label = scene.add.text(cx, y - 8, choice.label, {
        fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(0.5);
      const desc = scene.add.text(cx, y + 14, choice.desc, {
        fontSize: '12px', fontFamily: 'monospace', color: '#aaaaaa',
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
