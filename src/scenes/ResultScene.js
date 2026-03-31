import Phaser from 'phaser';
import { CharacterRegistry } from '../characters/CharacterRegistry.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.resultData = data || {};
  }

  create() {
    const { width, height } = this.cameras.main;
    const d = this.resultData;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x111122);

    // Result status
    const survived = d.survived;
    const statusText = survived ? '🌶️ SURVIVED!' : '💀 GAME OVER';
    const statusColor = survived ? '#FFD700' : '#FF4444';

    this.add.text(width / 2, 80, statusText, {
      fontSize: '40px', fontFamily: 'monospace', color: statusColor,
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    // Character info
    const charDef = CharacterRegistry.get(d.character);
    if (charDef) {
      const circle = this.add.graphics();
      circle.fillStyle(charDef.color, 1);
      circle.fillCircle(width / 2, 160, 30);

      this.add.text(width / 2, 205, charDef.name, {
        fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(0.5);
    }

    // Stats
    const elapsed = d.elapsed || 0;
    const secs = Math.floor(elapsed / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const stats = [
      `存活時間: ${timeStr}`,
      `撃殺数: ${d.kills || 0}`,
      `到達レベル: Lv.${d.level || 1}`,
    ];

    stats.forEach((line, i) => {
      this.add.text(width / 2, 260 + i * 35, line, {
        fontSize: '18px', fontFamily: 'monospace', color: '#cccccc',
      }).setOrigin(0.5);
    });

    // Retry button
    const retryBtn = this.add.rectangle(width / 2, height - 120, 250, 50, 0x224422)
      .setStrokeStyle(2, 0x44AA44)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height - 120, '🔄 もう一度プレイ', {
      fontSize: '18px', fontFamily: 'monospace', color: '#44FF44',
    }).setOrigin(0.5);

    retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x336633));
    retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x224422));
    retryBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Back to menu button
    const menuBtn = this.add.rectangle(width / 2, height - 60, 250, 40, 0x222244)
      .setStrokeStyle(2, 0x4444AA)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height - 60, 'キャラ選択に戻る', {
      fontSize: '14px', fontFamily: 'monospace', color: '#8888FF',
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x333366));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x222244));
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
