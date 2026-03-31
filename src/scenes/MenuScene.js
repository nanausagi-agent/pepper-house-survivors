import Phaser from 'phaser';
import { CharacterRegistry, DEFAULT_CHARACTERS } from '../characters/CharacterRegistry.js';

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
    this.add.text(width / 2, 80, '🌶️ 胡椒家防衛戦', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, 'Pepper House Survivors', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(width / 2, 170, 'SELECT YOUR CHARACTER', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Character selection buttons
    const chars = CharacterRegistry.getAll();
    const startY = 230;
    const spacing = 110;

    chars.forEach((charDef, i) => {
      const y = startY + i * spacing;

      // Character color preview circle
      const circle = this.add.graphics();
      circle.fillStyle(charDef.color, 1);
      circle.fillCircle(width / 2 - 130, y, 28);
      circle.lineStyle(2, 0xFFFFFF, 0.5);
      circle.strokeCircle(width / 2 - 130, y, 28);

      // Name
      this.add.text(width / 2 - 80, y - 18, charDef.name, {
        fontSize: '22px',
        fontFamily: 'monospace',
        color: '#ffffff',
      });

      // Description
      this.add.text(width / 2 - 80, y + 8, charDef.description, {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
      });

      // Stats preview
      const stats = charDef.baseStats;
      this.add.text(width / 2 - 80, y + 26, `HP:${stats.hp}  SPD:${stats.speed}  ARM:${stats.armor}`, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#666666',
      });

      // Clickable area
      const btn = this.add.rectangle(width / 2, y, 380, 90, 0x222244, 0.0)
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

    // Instructions
    this.add.text(width / 2, height - 40, 'WASD to move | Auto-attack enabled', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#555555',
    }).setOrigin(0.5);
  }
}
