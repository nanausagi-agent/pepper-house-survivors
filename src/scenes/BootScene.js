import Phaser from 'phaser';
import { setDictionary } from '../i18n.js';

const FONT = "'DotGothic16', monospace";

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x111122);

    // Title
    this.add.text(width / 2, height / 2 - 60, '🌶️ 胡椒家防衛戦', {
      fontSize: '32px', fontFamily: FONT, color: '#FFD700',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Progress bar
    const barW = 300;
    const barH = 20;
    const barX = (width - barW) / 2;
    const barY = height / 2 + 20;

    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333333, 1);
    progressBg.fillRoundedRect(barX, barY, barW, barH, 4);

    const progressBar = this.add.graphics();

    const loadText = this.add.text(width / 2, barY + barH + 20, '読み込み中...', {
      fontSize: '14px', fontFamily: FONT, color: '#888888',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x4488FF, 1);
      progressBar.fillRoundedRect(barX, barY, barW * value, barH, 4);
    });

    this.load.on('complete', () => {
      loadText.setText('準備完了！');
      loadText.setColor('#44FF44');
    });

    // Load JSON data files
    this.load.json('waves', 'data/waves.json');
    this.load.json('enemies', 'data/enemies.json');
    this.load.json('characters', 'data/characters.json');
    this.load.json('weapons', 'data/weapons.json');
    this.load.json('ja', 'data/ja.json');
  }

  create() {
    // Set up i18n dictionary
    const jaData = this.cache.json.get('ja');
    if (jaData) {
      setDictionary(jaData);
    }

    // Minimum display time (1 second) before proceeding
    this.time.delayedCall(1000, () => {
      this.scene.start('MenuScene');
    });
  }
}
