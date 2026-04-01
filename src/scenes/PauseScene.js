import Phaser from 'phaser';
import { t } from '../i18n.js';

const FONT = "'DotGothic16', monospace";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Dark overlay
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.6);

    // Pause title
    this.add.text(cx, cy - 100, t('pause.title'), {
      fontSize: '32px', fontFamily: FONT, color: '#FFD700',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Resume button
    this.createButton(cx, cy - 20, t('pause.resume'), 0x224422, 0x44AA44, '#44FF44', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    // Controls button
    this.createButton(cx, cy + 40, t('pause.controls'), 0x222244, 0x4488FF, '#88BBFF', () => {
      this.showControls();
    });

    // Quit button
    this.createButton(cx, cy + 100, t('pause.quit'), 0x442222, 0xAA4444, '#FF6666', () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('MenuScene');
    });

    // ESC to resume
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    // Controls overlay
    this.controlsOverlay = null;
  }

  createButton(x, y, label, bgColor, strokeColor, textColor, onClick) {
    const btn = this.add.rectangle(x, y, 250, 40, bgColor, 0.9)
      .setStrokeStyle(2, strokeColor)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontSize: '16px', fontFamily: FONT, color: textColor,
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setAlpha(1));
    btn.on('pointerout', () => btn.setAlpha(0.9));
    btn.on('pointerdown', onClick);
  }

  showControls() {
    if (this.controlsOverlay) return;
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.controlsOverlay = this.add.container(0, 0).setDepth(200);

    const dim = this.add.rectangle(cx, cy, width, height, 0x000000, 0.5);
    this.controlsOverlay.add(dim);

    const box = this.add.rectangle(cx, cy, 340, 280, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x4488FF);
    this.controlsOverlay.add(box);

    const title = this.add.text(cx, cy - 110, t('controls.title'), {
      fontSize: '22px', fontFamily: FONT, color: '#FFD700',
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
        fontSize: '14px', fontFamily: FONT, color: '#cccccc',
      }).setOrigin(0.5);
      this.controlsOverlay.add(txt);
    });

    const closeBtn = this.add.rectangle(cx, cy + 110, 120, 36, 0x224422, 0.9)
      .setStrokeStyle(2, 0x44AA44)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.add.text(cx, cy + 110, t('controls.close'), {
      fontSize: '14px', fontFamily: FONT, color: '#44FF44',
    }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => {
      this.controlsOverlay.destroy();
      this.controlsOverlay = null;
    });

    this.controlsOverlay.add([closeBtn, closeTxt]);
  }
}
