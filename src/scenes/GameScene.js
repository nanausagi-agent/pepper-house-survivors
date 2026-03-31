import Phaser from 'phaser';
import { createGameWorld } from '../ecs/world.js';
import { Position } from '../ecs/components.js';
import { CharacterRegistry } from '../characters/CharacterRegistry.js';
import { createPlayer } from '../entities/PlayerFactory.js';
import { createInputSystem } from '../systems/InputSystem.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { EnemyAISystem } from '../systems/EnemyAISystem.js';
import { createSpawnSystem } from '../systems/SpawnSystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { ProjectileSystem } from '../systems/ProjectileSystem.js';
import { createCombatSystem } from '../systems/CombatSystem.js';
import { PickupSystem } from '../systems/PickupSystem.js';
import { ExperienceSystem } from '../systems/ExperienceSystem.js';
import { createCleanupSystem } from '../systems/CleanupSystem.js';
import { createRenderSystem } from '../systems/RenderSystem.js';
import { SpatialHash } from '../managers/SpatialHash.js';
import { WaveManager } from '../managers/WaveManager.js';
import { eventBus } from '../managers/EventBus.js';
import { createHUD } from '../ui/HUD.js';
import { createLevelUpUI } from '../ui/LevelUpUI.js';
import { createDamageNumberManager } from '../ui/DamageNumber.js';
import { createPickup } from '../entities/PickupFactory.js';
import { WORLD_WIDTH, WORLD_HEIGHT, GAME_DURATION, COLORS, SPATIAL_CELL_SIZE } from '../config.js';
import { createDebugOverlay } from '../utils/debug.js';
import { defineQuery, hasComponent } from 'bitecs';
import { Enemy, Dead } from '../ecs/components.js';

const enemyCountQuery = defineQuery([Enemy]);

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.selectedCharacter = data.characterId || 'moo';
  }

  create() {
    // Reset event bus
    eventBus.clear();

    // Create world
    this.world = createGameWorld();
    this.world.player.selectedCharacter = this.selectedCharacter;

    // Draw world background
    this.drawBackground();

    // Camera setup
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Create player
    const charDef = CharacterRegistry.get(this.selectedCharacter);
    const playerEid = createPlayer(this.world, charDef, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.cameras.main.startFollow(
      { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 },
      true, 0.1, 0.1
    );

    // Create managers
    const spatialHash = new SpatialHash(SPATIAL_CELL_SIZE);
    const wavesData = this.cache.json.get('waves') || { waves: this.getDefaultWaves() };
    const waveManager = new WaveManager(wavesData.waves || this.getDefaultWaves());

    // Create render system first (needed by cleanup)
    this.renderSystem = createRenderSystem(this, this.world);

    // Create all systems
    this.systems = [
      createInputSystem(this),
      WeaponSystem,
      MovementSystem,
      EnemyAISystem,
      createSpawnSystem(waveManager),
      ProjectileSystem,
      createCombatSystem(spatialHash),
      PickupSystem,
      ExperienceSystem,
      createCleanupSystem(this.renderSystem),
    ];

    // UI
    this.hud = createHUD(this, this.world);
    this.levelUpUI = createLevelUpUI(this, this.world);
    this.damageNumbers = createDamageNumberManager(this);
    this.debugOverlay = createDebugOverlay(this);

    // Camera follow target (we'll update it)
    this.followTarget = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };
    this.cameras.main.startFollow(this.followTarget, true, 0.1, 0.1);

    // Event listeners
    eventBus.on('player:levelup', () => {
      this.levelUpUI.show();
    });

    eventBus.on('enemy:killed', (data) => {
      // Spawn XP gem
      createPickup(this.world, data.x, data.y, 0, data.xpValue);
      // Damage number
      this.damageNumbers.spawn(data.x, data.y - 10, data.xpValue, '#76FF03');
    });

    eventBus.on('player:damaged', (data) => {
      const pid = this.world.player.eid;
      this.damageNumbers.spawn(
        Position.x[pid], Position.y[pid] - 20,
        data.amount, '#FF4444'
      );
      this.cameras.main.shake(80, 0.005);
    });

    eventBus.on('game:over', () => {
      this.time.delayedCall(500, () => {
        this.scene.start('ResultScene', {
          survived: false,
          elapsed: this.world.time.elapsed,
          kills: this.world.player.kills,
          level: this.world.player.level,
          character: this.selectedCharacter,
        });
      });
    });
  }

  update(time, delta) {
    if (this.world.gameOver) return;
    if (this.world.paused) return;

    // Update world time
    this.world.time.delta = delta;
    this.world.time.elapsed += delta;

    // Check win condition (survived 15 minutes)
    if (this.world.time.elapsed >= GAME_DURATION) {
      this.scene.start('ResultScene', {
        survived: true,
        elapsed: GAME_DURATION,
        kills: this.world.player.kills,
        level: this.world.player.level,
        character: this.selectedCharacter,
      });
      return;
    }

    // Run all ECS systems
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i](this.world);
    }

    // Update camera follow target
    const pid = this.world.player.eid;
    if (pid >= 0) {
      this.followTarget.x = Position.x[pid];
      this.followTarget.y = Position.y[pid];
    }

    // Update render
    this.renderSystem.update();
    this.hud.update();
    this.damageNumbers.update(delta);

    // Debug
    const enemies = enemyCountQuery(this.world);
    let aliveCount = 0;
    for (let i = 0; i < enemies.length; i++) {
      if (!hasComponent(this.world, Dead, enemies[i])) aliveCount++;
    }
    this.debugOverlay.update(this.world, aliveCount);
  }

  drawBackground() {
    // Dark background with grid
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.bg, 1);
    bg.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Grid lines
    bg.lineStyle(1, 0x2a2a4e, 0.3);
    const gridSize = 64;
    for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
      bg.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
      bg.lineBetween(0, y, WORLD_WIDTH, y);
    }

    // World border
    bg.lineStyle(3, 0xFF4444, 0.6);
    bg.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    bg.setDepth(0);
  }

  getDefaultWaves() {
    return [
      { time: 0, enemies: [{ type: 'grunt_a', rate: 0.5, max: 20 }] },
      { time: 30, enemies: [{ type: 'grunt_a', rate: 0.8, max: 30 }] },
      { time: 60, enemies: [{ type: 'grunt_a', rate: 1.0, max: 40 }, { type: 'grunt_b', rate: 0.3, max: 10 }] },
      { time: 120, enemies: [{ type: 'grunt_a', rate: 1.2, max: 50 }, { type: 'grunt_b', rate: 0.5, max: 20 }, { type: 'fast', rate: 0.2, max: 8 }] },
      { time: 180, enemies: [{ type: 'grunt_a', rate: 1.5, max: 60 }, { type: 'grunt_b', rate: 0.8, max: 25 }, { type: 'fast', rate: 0.4, max: 15 }] },
      { time: 300, enemies: [{ type: 'grunt_a', rate: 2.0, max: 80 }, { type: 'grunt_b', rate: 1.0, max: 30 }, { type: 'fast', rate: 0.5, max: 20 }, { type: 'tank', rate: 0.1, max: 5 }] },
      { time: 600, enemies: [{ type: 'grunt_a', rate: 3.0, max: 100 }, { type: 'grunt_b', rate: 1.5, max: 50 }, { type: 'fast', rate: 1.0, max: 30 }, { type: 'tank', rate: 0.3, max: 10 }] },
    ];
  }

  shutdown() {
    eventBus.clear();
    if (this.renderSystem) this.renderSystem.destroyAll();
    if (this.hud) this.hud.destroy();
    if (this.damageNumbers) this.damageNumbers.destroyAll();
    if (this.debugOverlay) this.debugOverlay.destroy();
  }
}
