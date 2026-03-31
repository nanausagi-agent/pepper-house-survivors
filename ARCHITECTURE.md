# 🌶️ 胡椒家防衛戦 — Technical Architecture

> **Version:** 1.0 | **Author:** 娜娜 🐇 | **Date:** 2026-04-01
> **Engine:** Phaser 3.80+ | **ECS:** bitECS | **Deploy:** Static HTML

---

## 1. 專案結構

```
pepper-house-survivors/
├── index.html                 # 入口
├── GDD.md                     # 設計文件
├── ARCHITECTURE.md            # 本檔案
├── package.json               # 依賴管理
├── vite.config.js             # 建構設定
├── src/
│   ├── main.js                # Phaser 啟動 + 場景註冊
│   ├── config.js              # 遊戲常數 + 配置
│   ├── scenes/
│   │   ├── BootScene.js       # 資源載入
│   │   ├── MenuScene.js       # 主選單 + 角色選擇
│   │   ├── GameScene.js       # 主遊戲場景
│   │   ├── PauseScene.js      # 暫停 / 升級選擇（overlay）
│   │   ├── ResultScene.js     # 結算畫面
│   │   └── index.js           # Scene 匯出
│   ├── ecs/
│   │   ├── world.js           # bitECS world 初始化
│   │   ├── components.js      # 所有 ECS 組件定義
│   │   └── index.js
│   ├── systems/
│   │   ├── MovementSystem.js      # 玩家 + 敵人移動
│   │   ├── InputSystem.js         # 鍵盤 / 觸控輸入
│   │   ├── SpawnSystem.js         # 敵人波次生成
│   │   ├── CombatSystem.js        # 傷害判定 + 碰撞
│   │   ├── WeaponSystem.js        # 武器邏輯（pattern 分派）
│   │   ├── ProjectileSystem.js    # 投射物更新
│   │   ├── HealthSystem.js        # 生命值 + 死亡處理
│   │   ├── ExperienceSystem.js    # 經驗值 + 升級觸發
│   │   ├── PickupSystem.js        # 經驗寶石 + 道具拾取
│   │   ├── SkillSystem.js         # 主動技能冷卻 + 觸發
│   │   ├── EvolutionSystem.js     # 進化合成檢測
│   │   ├── StatusEffectSystem.js  # buff/debuff tick
│   │   ├── RenderSystem.js        # sprite 同步 + 動畫
│   │   ├── CleanupSystem.js       # 離屏/死亡實體回收
│   │   └── index.js
│   ├── entities/
│   │   ├── EntityFactory.js       # 實體建立工廠
│   │   ├── PlayerFactory.js       # 玩家角色建立
│   │   ├── EnemyFactory.js        # 敵人建立
│   │   ├── ProjectileFactory.js   # 投射物建立
│   │   ├── PickupFactory.js       # 經驗寶石/道具掉落
│   │   └── index.js
│   ├── characters/
│   │   ├── CharacterRegistry.js   # 角色註冊中心
│   │   ├── moo.js                 # ムーさん 角色定義
│   │   ├── nyao.js                # にゃおぬこ 角色定義
│   │   ├── abarenboo.js           # あばれんぼー 角色定義
│   │   ├── minori.js              # みのり（Phase 2 預留）
│   │   └── pepper.js              # 胡椒少佐（Phase 2 預留）
│   ├── weapons/
│   │   ├── WeaponRegistry.js      # 武器註冊 + JSON 載入
│   │   ├── patterns/              # 武器彈道模式
│   │   │   ├── AutoAimPattern.js
│   │   │   ├── MeleePattern.js
│   │   │   ├── AreaPattern.js
│   │   │   ├── TrailPattern.js
│   │   │   ├── SpreadPattern.js
│   │   │   ├── OrbitPattern.js
│   │   │   └── BeamPattern.js
│   │   └── index.js
│   ├── items/
│   │   ├── ItemRegistry.js        # 道具註冊 + modifier 邏輯
│   │   ├── ModifierStack.js       # flat_add → percent_mul → cap
│   │   └── index.js
│   ├── managers/
│   │   ├── WaveManager.js         # 波次控制器
│   │   ├── LevelUpManager.js      # 升級選項生成
│   │   ├── EvolutionManager.js    # 進化配方管理
│   │   ├── ObjectPool.js          # 通用物件池
│   │   ├── SpatialHash.js         # 空間雜湊碰撞
│   │   └── EventBus.js            # 全域事件總線
│   ├── ui/
│   │   ├── HUD.js                 # 血量/等級/時間
│   │   ├── LevelUpUI.js           # 升級選擇面板
│   │   ├── ResultCard.js          # 結算卡
│   │   ├── DamageNumber.js        # 傷害數字飄字
│   │   └── index.js
│   └── utils/
│       ├── math.js                # 向量/距離/角度工具
│       ├── random.js              # seeded RNG
│       └── debug.js               # 開發用 overlay
├── public/
│   ├── data/
│   │   ├── weapons.json           # 武器定義
│   │   ├── items.json             # 道具定義
│   │   ├── recipes.json           # 進化配方
│   │   ├── enemies.json           # 敵人定義
│   │   ├── waves.json             # 波次時間軸
│   │   └── characters.json        # 角色基礎數值
│   └── assets/
│       ├── sprites/               # sprite sheets
│       ├── tiles/                 # 地圖 tileset
│       ├── ui/                    # UI 元素
│       └── audio/                 # 音效 + BGM
└── dist/                          # 建構產出（→ Playground）
```

---

## 2. 核心架構決策

### 2.1 ECS (Entity-Component-System)

**為什麼用 bitECS：**
- 高效能（TypedArray，0 GC）
- 適合大量同類實體（敵人、子彈、經驗寶石）
- 組件可自由組合，新功能只加新組件+系統

**組件設計：**
```js
// ecs/components.js
import { defineComponent, Types } from 'bitecs'

// === 基礎 ===
export const Position    = defineComponent({ x: Types.f32, y: Types.f32 })
export const Velocity    = defineComponent({ x: Types.f32, y: Types.f32 })
export const Health      = defineComponent({ current: Types.f32, max: Types.f32 })
export const Sprite      = defineComponent({ textureId: Types.ui16, frame: Types.ui8, scaleX: Types.f32, scaleY: Types.f32 })

// === 標記 ===
export const Player      = defineComponent()
export const Enemy       = defineComponent({ typeId: Types.ui8, tier: Types.ui8 })
export const Projectile  = defineComponent({ ownerId: Types.eid, weaponId: Types.ui8, damage: Types.f32, piercing: Types.ui8 })
export const Pickup      = defineComponent({ type: Types.ui8, value: Types.f32 })
export const Dead        = defineComponent()  // 標記待回收

// === 戰鬥 ===
export const Attack      = defineComponent({ damage: Types.f32, cooldown: Types.f32, timer: Types.f32, range: Types.f32 })
export const Weapon      = defineComponent({ id: Types.ui8, level: Types.ui8, pattern: Types.ui8 })
export const ActiveSkill = defineComponent({ cooldown: Types.f32, timer: Types.f32, duration: Types.f32, active: Types.ui8 })

// === 特殊 ===
export const Turret      = defineComponent({ ownerId: Types.eid, lifetime: Types.f32 })
export const Trail       = defineComponent({ width: Types.f32, damage: Types.f32, duration: Types.f32 })
export const ChargeAttack= defineComponent({ chargeTime: Types.f32, currentCharge: Types.f32, maxRange: Types.f32, baseRange: Types.f32 })
export const HomingTarget= defineComponent({ targetId: Types.eid })

// === 效果 ===
export const StatusEffect= defineComponent({ type: Types.ui8, duration: Types.f32, magnitude: Types.f32 })
export const Knockback   = defineComponent({ force: Types.f32, dirX: Types.f32, dirY: Types.f32 })
```

### 2.2 系統執行順序

```
每幀（GameScene.update）:
  1. InputSystem        — 讀取輸入，更新 Velocity
  2. SkillSystem        — 主動技能冷卻 + 觸發
  3. WeaponSystem       — 自動攻擊觸發 + 建立投射物
  4. MovementSystem     — 套用 Velocity → Position
  5. ProjectileSystem   — 投射物飛行 + 壽命檢查
  6. SpawnSystem        — 波次管理 → 生成敵人
  7. CombatSystem       — 碰撞判定 → 傷害計算
  8. HealthSystem       — 死亡檢測 → 掉落生成
  9. PickupSystem       — 拾取判定 → 經驗/道具
  10. ExperienceSystem  — 升級檢測 → 觸發 LevelUp
  11. EvolutionSystem   — 進化條件檢測
  12. StatusEffectSystem— buff/debuff tick
  13. RenderSystem      — 同步 ECS Position → Phaser sprite
  14. CleanupSystem     — 回收 Dead 標記實體
```

### 2.3 事件總線

系統間完全解耦，透過事件通信：

```js
// managers/EventBus.js
class EventBus {
  constructor() { this.listeners = new Map() }
  on(event, callback) { ... }
  off(event, callback) { ... }
  emit(event, data) { ... }
}

// 預定義事件：
// 'enemy:killed'      → { entityId, position, enemyType }
// 'player:damaged'    → { amount, source }
// 'player:levelup'    → { newLevel, choices }
// 'weapon:evolved'    → { weaponId, newWeaponId }
// 'wave:changed'      → { waveIndex, waveDef }
// 'boss:spawned'      → { bossType }
// 'game:over'         → { survived, stats }
// 'skill:activated'   → { characterId, skillId }
// 'pickup:collected'  → { type, value }
```

### 2.4 物件池

零運行時 allocation，所有高頻實體預建立：

```js
// managers/ObjectPool.js
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 100) { ... }
  acquire() { ... }  // 從池中取出
  release(obj) { ... }  // 歸還池中
  expand(count) { ... }  // 動態擴容
}

// 預建池：
// enemyPool:      500 (可擴至 800)
// projectilePool: 200
// pickupPool:     300
// damageNumPool:  50
// effectPool:     100
```

### 2.5 空間雜湊碰撞

O(n) 碰撞不用暴力搜尋：

```js
// managers/SpatialHash.js
class SpatialHash {
  constructor(cellSize = 64) { ... }
  clear() { ... }
  insert(entityId, x, y, w, h) { ... }
  query(x, y, w, h) { ... }  // 回傳附近實體 ID 陣列
  queryRadius(x, y, radius) { ... }
}
```

---

## 3. 資料驅動設計

### 3.1 武器 JSON Schema

```json
{
  "weapons": [
    {
      "id": "moo_turret",
      "name": "吉祥物砲台",
      "nameEn": "Mascot Turret",
      "owner": "moo",
      "type": "turret",
      "pattern": "auto_aim",
      "baseDamage": 8,
      "baseCooldown": 800,
      "baseRange": 80,
      "maxLevel": 8,
      "levelScaling": {
        "damage": [8, 10, 12, 14, 16, 18, 22, 28],
        "cooldown": [800, 750, 700, 650, 600, 550, 500, 450],
        "range": [80, 85, 90, 95, 100, 110, 120, 140],
        "extra": {
          "maxTurrets": [1, 1, 2, 2, 3, 3, 3, 4]
        }
      },
      "spriteKey": "weapon_turret",
      "sfxKey": "sfx_turret_fire",
      "evolves": [
        { "requiresItem": "homing_scope", "into": "auto_sentry_v2" }
      ]
    }
  ]
}
```

### 3.2 角色 JSON Schema

```json
{
  "characters": [
    {
      "id": "moo",
      "name": "ムーさん",
      "archetype": "tactician",
      "phase": 1,
      "unlocked": true,
      "baseStats": {
        "hp": 100,
        "speed": 120,
        "armor": 0,
        "pickupRange": 40
      },
      "startWeapon": "moo_turret",
      "passiveId": "turret_ramp",
      "skillId": "mascot_transform",
      "spriteKey": "char_moo",
      "portraitKey": "portrait_moo",
      "color": "#FF9800"
    }
  ]
}
```

### 3.3 波次 JSON Schema

```json
{
  "waves": [
    {
      "time": 0,
      "enemies": [
        { "type": "grunt_a", "rate": 0.5, "max": 20 }
      ]
    },
    {
      "time": 120,
      "enemies": [
        { "type": "grunt_a", "rate": 1.0, "max": 30 },
        { "type": "grunt_b", "rate": 0.3, "max": 10 }
      ]
    },
    {
      "time": 300,
      "boss": { "type": "elite_1" },
      "enemies": [
        { "type": "grunt_a", "rate": 1.5, "max": 40 },
        { "type": "grunt_b", "rate": 0.8, "max": 20 },
        { "type": "fast", "rate": 0.3, "max": 10 }
      ]
    }
  ]
}
```

---

## 4. 擴展點設計（為未來準備）

### 4.1 新角色
1. 在 `characters/` 新增 `minori.js`
2. 在 `data/characters.json` 加一筆
3. 在 `CharacterRegistry.js` 註冊
4. 若有新 pattern → 在 `weapons/patterns/` 加檔案

### 4.2 新武器
1. 在 `data/weapons.json` 加定義
2. 若新 pattern → 在 `weapons/patterns/` 加檔案，註冊到 `WeaponRegistry`

### 4.3 新道具
1. 在 `data/items.json` 加定義
2. 特殊質變邏輯 → `items/ItemRegistry.js` 加 handler

### 4.4 新進化
1. 在 `data/recipes.json` 加配方

### 4.5 觀眾投票模式（Phase 2）
- 透過 EventBus 接收外部事件
- 新增 `AudienceSystem.js` 監聽投票結果
- 觸發 buff/debuff/敵人生成

### 4.6 新地圖
- 地圖用 Tiled JSON 格式
- `data/maps/` 目錄放地圖檔
- `MapManager.js` 載入 + 互動物件

---

## 5. 性能策略

| 策略 | 實作 |
|------|------|
| Object Pool | 子彈/敵人/特效/經驗寶石全池化 |
| Spatial Hash | 碰撞用 64px 格子，只查鄰近 |
| bitECS TypedArray | 組件資料連續記憶體，cache friendly |
| Off-screen cull | 離螢幕 1.5 倍的投射物立即回收 |
| Batch rendering | Phaser 自動 batching 同 texture |
| 減少 GC | 避免運行時 new Object，重用向量 |
| Frame budget | 200 敵人 @ 60fps 先，benchmark 後調整 |

---

## 6. 建構 & 部署

```bash
# 開發
npm run dev          # vite dev server, hot reload

# 建構
npm run build        # → dist/

# 部署到工坊
npm run deploy       # cp dist/* → Playground/games/pepper-house-survivors/
```

---

*Architecture by 娜娜 🐇 — 2026-04-01*
