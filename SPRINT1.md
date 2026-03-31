# Sprint 1 — 基礎框架

> **Goal:** 建立可運行的遊戲骨架，一個角色能移動、敵人會追蹤、有碰撞判定
> **DoD:** 瀏覽器打開能玩，角色 WASD 移動，敵人追蹤，碰撞扣血，死亡有經驗寶石

## Tasks

### T1: 專案初始化
- [ ] Vite + Phaser 3 + bitECS 專案建立
- [ ] 目錄結構按 ARCHITECTURE.md
- [ ] package.json 設好 scripts (dev/build/deploy)
- [ ] index.html 基礎模板
- [ ] vite.config.js 設定（public dir, build output）

### T2: ECS 基礎
- [ ] world.js — bitECS world 初始化
- [ ] components.js — Position, Velocity, Health, Sprite, Player, Enemy, Projectile, Pickup, Dead, Attack, Weapon
- [ ] 系統框架 — 空殼 System 類別，GameScene 依序呼叫

### T3: 場景框架
- [ ] BootScene — 載入資源（先用程序化繪圖替代 sprite）
- [ ] MenuScene — 簡單角色選擇（3 按鈕，先用色塊代替）
- [ ] GameScene — 主遊戲場景骨架
- [ ] ResultScene — 簡單結算（存活時間 + 擊殺數）
- [ ] main.js — Phaser config + 場景註冊

### T4: 玩家移動
- [ ] InputSystem — WASD/方向鍵 + 觸控虛擬搖桿
- [ ] MovementSystem — Velocity → Position
- [ ] RenderSystem — ECS Position → Phaser sprite 同步
- [ ] 程序化玩家 sprite（32x32 色塊 + 方向指示）

### T5: 敵人系統
- [ ] SpawnSystem — 從螢幕外隨機方向生成
- [ ] 敵人 AI — 追蹤玩家（normalize direction × speed）
- [ ] EnemyFactory — 建立敵人實體
- [ ] 程序化敵人 sprite（16x16 色塊）
- [ ] WaveManager 骨架 — 讀 waves.json，按時間生成

### T6: 碰撞 & 戰鬥
- [ ] SpatialHash — 64px grid, insert/query/queryRadius
- [ ] CombatSystem — 敵人碰玩家 → 扣血 + 擊退
- [ ] HealthSystem — 血量 ≤ 0 → 標記 Dead → game over
- [ ] CleanupSystem — 回收 Dead 實體

### T7: 經驗系統
- [ ] 敵人死亡掉經驗寶石（PickupFactory）
- [ ] PickupSystem — 靠近自動拾取
- [ ] ExperienceSystem — 累積經驗 → 升級觸發
- [ ] 升級暫停 + 3 選 1 框架（先用文字按鈕）

### T8: ObjectPool
- [ ] 通用 ObjectPool 類別
- [ ] enemyPool (200 initial)
- [ ] pickupPool (150 initial)
- [ ] projectilePool (100 initial)

### T9: 基礎武器
- [ ] WeaponSystem — 自動攻擊 timer + pattern 分派
- [ ] 一種基礎武器（彈幕花火 — spread pattern）
- [ ] ProjectileSystem — 投射物飛行 + 壽命
- [ ] ProjectileFactory — 從池中建立

### T10: HUD
- [ ] 血量條
- [ ] 等級顯示
- [ ] 存活時間
- [ ] 固定在畫面上方

### T11: 基礎數據檔
- [ ] data/characters.json — 3 角色基礎數值
- [ ] data/weapons.json — 8 把武器定義
- [ ] data/items.json — 8 個道具定義
- [ ] data/enemies.json — 6 類敵人定義
- [ ] data/waves.json — 15 分鐘波次表
- [ ] data/recipes.json — 5 條進化配方

### T12: EventBus + 工具
- [ ] EventBus — on/off/emit
- [ ] math.js — distance, normalize, angle, lerp
- [ ] random.js — seeded RNG (mulberry32)
- [ ] config.js — 遊戲常數集中管理

## 驗收標準
1. `npm run dev` 能啟動
2. 選角色（3 選 1）→ 進入遊戲
3. WASD 控制角色移動
4. 敵人從四周湧入、追蹤玩家
5. 碰到敵人扣血
6. 基礎武器自動射擊消滅敵人
7. 敵人死掉經驗寶石
8. 拾取升級、3 選 1
9. 血量歸零 → 結算畫面
10. 60fps @ 200 敵人（SpatialHash 生效）

## 技術約束
- 純 ES Module，不用 TypeScript（降低複雜度）
- 先用程序化圖形（Graphics/Rectangle），不需 sprite 素材
- bitECS 組件全用 TypedArray（f32/ui8/ui16）
- 0 運行時 object allocation（pool everything）
