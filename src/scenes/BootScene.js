import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // No external assets — all procedural graphics
    // Load JSON data files
    this.load.json('waves', 'data/waves.json');
    this.load.json('enemies', 'data/enemies.json');
    this.load.json('characters', 'data/characters.json');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
