import Phaser from 'phaser';
import { CharacterRegistry, DEFAULT_CHARACTERS } from '../characters/CharacterRegistry.js';
import { t } from '../i18n.js';

const FONT = "'DotGothic16', monospace";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Register default characters
    CharacterRegistry.init(DEFAULT_CHARACTERS);

    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, 80, '🌶️ ' + t('game.title'), {
      fontSize: '36px', fontFamily: FONT, color: '#FFD700',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, t('game.subtitle'), {
      fontSize: '14px', fontFamily: FONT, color: '#888888',
    }).setOrigin(0.5);

    this.add.text(width / 2, 160, t('menu.select_character'), {
      fontSize: '18px', fontFamily: FONT, color: '#ffffff',
    }).setOrigin(0.5);

    // Character selection buttons
    const chars = CharacterRegistry.getAll();
    const startY = 220;
    const spacing = 100;

    chars.forEach((charDef, i) => {
      const y = startY + i * spacing;

      // Character color preview circle
      const circle = this.add.graphics();
      circle.fillStyle(charDef.color, 1);
      circle.fillCircle(width / 2 - 130, y, 28);
      circle.lineStyle(2, 0xFFFFFF, 0.5);
      circle.strokeCircle(width / 2 - 130, y, 28);

      // Name (from i18n)
      const charName = t(`char.${charDef.id}.name`);
      this.add.text(width / 2 - 80, y - 18, charName, {
        fontSize: '20px', fontFamily: FONT, color: '#ffffff',
      });

      // Description (from i18n)
      const charDesc = t(`char.${charDef.id}.desc`);
      this.add.text(width / 2 - 80, y + 6, charDesc, {
        fontSize: '12px', fontFamily: FONT, color: '#aaaaaa',
      });

      // Stats preview
      const stats = charDef.baseStats;
      this.add.text(width / 2 - 80, y + 24, `HP:${stats.hp}  SPD:${stats.speed}  ARM:${stats.armor}`, {
        fontSize: '11px', fontFamily: FONT, color: '#666666',
      });

      // Clickable area
      const btn = this.add.rectangle(width / 2, y, 380, 85, 0x222244, 0.0)
        .setStrokeStyle(2, 0x444488)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => {
        btn.setFillStyle(0x334466, 0.5);
        btn.setStrokeStyle(2, 0x6688FF);
      });
      btn.on('pointerout', () => {
        btn.setFillStyle(0x222244, 0.0);
        btn.setStrokeStyle(2, 0x444488);
      });
      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { characterId: charDef.id });
      });
    });

    // Controls button
    const ctrlBtnY = startY + chars.length * spacing + 20;
    const ctrlBtn = this.add.rectangle(width / 2, ctrlBtnY, 200, 40, 0x222244, 0.8)
      .setStrokeStyle(2, 0x4488FF)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, ctrlBtnY, t('menu.controls'), {
      fontSize: '14px', fontFamily: FONT, color: '#88BBFF',
    }).setOrigin(0.5);

    ctrlBtn.on('pointerover', () => ctrlBtn.setFillStyle(0x334466, 1));
    ctrlBtn.on('pointerout', () => ctrlBtn.setFillStyle(0x222244, 0.8));
    ctrlBtn.on('pointerdown', () => {
      this.showControls();
    });

    // Instructions
    this.add.text(width / 2, height - 30, t('menu.instructions'), {
      fontSize: '11px', fontFamily: FONT, color: '#555555',
    }).setOrigin(0.5);

    // Controls overlay container (hidden by default)
    this.controlsOverlay = null;
  }

  showControls() {
    if (this.controlsOverlay) return;
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.controlsOverlay = this.add.container(0, 0).setDepth(200);

    const dim = this.add.rectangle(cx, cy, width, height, 0x000000, 0.7);
    this.controlsOverlay.add(dim);

    const box = this.add.rectangle(cx, cy, 340, 280, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x4488FF);
    this.controlsOverlay.add(box);

    const title = this.add.text(cx, cy - 110, t('controls.title'), {
      fontSize: '22px', fontFamily: "'DotGothic16', monospace", color: '#FFD700',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.controlsOverlay.add(title);

    const lines = [
      t('controls.wasd'),
      t('controls.mouse'),
      t('controls.click'),
      t('controls.space'),
      t('controls.esc'),
    ];
    lines.forEach((line, i) => {
      const txt = this.add.text(cx, cy - 60 + i * 30, line, {
        fontSize: '14px', fontFamily: "'DotGothic16', monospace", color: '#cccccc',
      }).setOrigin(0.5);
      this.controlsOverlay.add(txt);
    });

    // Close button
    const closeBtn = this.add.rectangle(cx, cy + 110, 120, 36, 0x224422, 0.9)
      .setStrokeStyle(2, 0x44AA44)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add.text(cx, cy + 110, t('controls.close'), {
      fontSize: '14px', fontFamily: "'DotGothic16', monospace", color: '#44FF44',
    }).setOrigin(0.5);

    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x336633, 1));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x224422, 0.9));
    closeBtn.on('pointerdown', () => {
      this.controlsOverlay.destroy();
      this.controlsOverlay = null;
    });

    this.controlsOverlay.add([closeBtn, closeTxt]);
  }
}
