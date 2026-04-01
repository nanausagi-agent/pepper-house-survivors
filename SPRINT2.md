# Sprint 2 — 操作革新 + 日本語化 + 体験磨き

> **Goal:** PC 向け操作体系を確立し、全 UI を日本語化。分かち合える品質に仕上げる
> **Platform:** PC（デスクトップブラウザ）専用。モバイル対応は将来 Sprint
> **Deploy:** GitHub Pages（自動 CI/CD 済み）
> **DoD:** マウスエイム＋クリック射撃＋必殺技が動作し、全 UI が日本語、OG 付きで共有可能

---

## 設計決定（爸爸指示 2026-04-01）

| # | 操作 | 説明 |
|---|------|------|
| 1 | WASD | 移動（既存） |
| 2 | マウスカーソル | 射撃方向・照準表示 |
| 3 | 左クリック / 長押し | 単発 = セミオート / 長押し = フルオート（武器の fireMode 依存） |
| 4 | スペースキー | 必殺技（キャラ固有・高ダメージ） |

**武器の fireMode 分類：**

| fireMode | 動作 | 左クリック |
|----------|------|-----------|
| `auto` | 自動射撃（従来の VS 式） | 不要（自動発射） |
| `semi` | 単発高火力 | クリック = 1 発 |
| `hold` | 長押し連射 | 長押し = 連射 |
| `aimed` | マウス方向に発射（自動） | 方向のみ影響 |

---

## Tasks

### T1: 入力システム刷新 — MouseAimSystem
- [ ] マウス位置トラッキング（GameScene pointer → world 座標変換）
- [ ] プレイヤーからマウスへの角度を `AimAngle` コンポーネントに格納
- [ ] カスタム照準カーソル描画（Phaser Graphics、十字線）
- [ ] デフォルトカーソル非表示（`canvas.style.cursor = 'none'`）
- [ ] InputSystem 更新：WASD は移動のみ、マウスは照準のみに分離

### T2: クリック射撃 — ManualFireSystem
- [ ] `Weapon` コンポーネントに `fireMode` フィールド追加（0=auto, 1=semi, 2=hold, 3=aimed）
- [ ] 左クリックイベント → `semi` 武器は即時発射
- [ ] 長押し判定（200ms 閾値）→ `hold` 武器は連射開始/終了
- [ ] `auto` 武器は既存 WeaponSystem のまま（左クリック不要）
- [ ] `aimed` 武器はマウス方向に自動発射（角度のみ反映）
- [ ] WeaponSystem 更新：`fireMode` に応じて発射ロジック分岐
- [ ] weapons.json に `fireMode` + `usesAim` フィールド追加

### T3: 必殺技 — UltimateSystem
- [ ] `Ultimate` コンポーネント定義（cooldown, timer, duration, active, type）
- [ ] スペースキー → Ultimate 発動（クールダウン確認）
- [ ] キャラ別必殺技実装：
  - ムーさん：全砲台 3 秒間齊射（既存 SkillSystem の mascot_transform を移行）
  - にゃおぬこ：瞬間移動突進 + AOE 爆発（dash → 到着時範囲ダメージ）
  - あばれんぼー：5 秒間尾巴範囲 ×3（巨大回転）
- [ ] HUD にクールダウンゲージ表示（円形 or バー）
- [ ] 発動時の画面フラッシュ演出（0.1 秒白フラッシュ）

### T4: 全面日本語化
- [ ] `src/i18n.js` 作成 — シンプルな辞書ルックアップ（将来 en 追加可能な構造）
- [ ] 日本語テキスト辞書（ja.json）：
  - メニュー：「ゲーム開始」「キャラクター選択」「操作説明」
  - HUD：「Lv.」「HP」残り時間表示
  - キャラ選択画面：キャラ名 + 説明 + ステータス
  - レベルアップ：「レベルアップ！」「3 つから選んでね」
  - 武器/道具名：全て日本語表示名
  - 結算：「生存時間」「撃破数」「最高コンボ」「もう一回」「タイトルへ」
  - 必殺技名：キャラ別
- [ ] MenuScene 日本語化
- [ ] GameScene HUD 日本語化
- [ ] LevelUpUI 日本語化
- [ ] ResultScene 日本語化
- [ ] フォント：Google Fonts から「DotGothic16」（ドットフォント、日本語対応）

### T5: 照準カーソル + 武器方向可視化
- [ ] プレイヤー sprite のマウス方向への自動フリップ（左右反転）
- [ ] 武器の弾道がマウス方向を基準に発射（`usesAim: true` の武器）
- [ ] 照準線表示（aimed 武器装備時のみ、薄いライン）
- [ ] 投射物の角度をマウス方向に設定

### T6: 操作説明画面
- [ ] MenuScene に「操作説明」ボタン追加
- [ ] 操作説明オーバーレイ：
  ```
  ┌─────────────────────────┐
  │    🎮 操作説明           │
  │                         │
  │  WASD    — 移動         │
  │  マウス   — 照準         │
  │  左クリック — 射撃       │
  │  スペース  — 必殺技      │
  │  ESC     — ポーズ       │
  │                         │
  │      [閉じる]            │
  └─────────────────────────┘
  ```
- [ ] ゲーム開始時にも初回のみ簡易チュートリアル表示（3 秒フェードアウト）

### T7: OG Meta Tags + 共有対応
- [ ] index.html に Open Graph meta 追加：
  - `og:title` = "🌶️ 胡椒家防衛戦"
  - `og:description` = "胡椒少佐の家を守れ！ブラウザで遊べる VS 風サバイバルゲーム"
  - `og:image` = OG 画像（1200×630）
  - `og:url` = GitHub Pages URL
  - Twitter Card meta
- [ ] OG 画像作成（プログラマティック or 手作り）
- [ ] `<title>` と `<meta description>` 日本語化
- [ ] favicon 設定（🌶️ emoji or ドット絵）

### T8: ローディング画面
- [ ] BootScene リニューアル：
  - 黒背景 + 「🌶️ 胡椒家防衛戦」タイトルロゴ（DotGothic16）
  - プログレスバー（Phaser loader events）
  - 「Loading...」→「準備完了！」
- [ ] 最低 1 秒表示（短すぎるとチラつく）

### T9: 武器 fireMode 対応 — データ更新
- [ ] weapons.json 全武器に `fireMode` + `usesAim` 追加：

| 武器 | fireMode | usesAim | 理由 |
|------|----------|---------|------|
| 吉祥物砲台 | auto | false | 砲台は自動追尾 |
| 連射爪擊 | auto | false | 近距離自動、方向はプレイヤー移動依存 |
| 尾巴迴旋 | auto | false | 360° 全方位 |
| 彈幕花火 | aimed | true | マウス方向に放射 |
| 護盾衝擊 | auto | false | 自身周囲 |
| 雷射光束 | semi | true | クリックで発射、マウス方向 |
| (将来) 重機軌跡 | auto | false | 移動方向依存 |
| (将来) 懷舊召喚 | semi | true | クリックで投擲 |

### T10: ESC ポーズ改善
- [ ] ESC キーでポーズ切替
- [ ] PauseScene リニューアル（日本語）：
  - 「ポーズ中」
  - 「続ける」ボタン
  - 「操作説明」ボタン
  - 「タイトルに戻る」ボタン
- [ ] ポーズ中は背景を暗く（alpha overlay）

### T11: GDD 更新
- [ ] GDD.md に操作設計セクション追加
- [ ] デプロイ先を GitHub Pages に変更
- [ ] プラットフォームを PC 専用に変更
- [ ] 言語を日本語メインに変更

---

## 驗收標準（Acceptance Criteria）

1. マウスカーソルが照準に変わり、プレイヤーがマウス方向を向く
2. `aimed` 武器（彈幕花火）がマウス方向に発射される
3. `semi` 武器（雷射光束）が左クリックで単発射撃
4. スペースキーで必殺技発動、クールダウンゲージが機能
5. 全 UI テキストが日本語表示
6. DotGothic16 フォントが正常に読み込まれる
7. メニュー → キャラ選択 → ゲーム → 結算、全フロー日本語
8. 操作説明画面が表示される
9. ESC でポーズ、日本語メニュー表示
10. OG meta が正しく設定（Facebook Debugger / Twitter Card Validator で確認可能）
11. GitHub Pages にデプロイされ、URL 共有可能
12. 60fps @ 200 敵人維持（操作追加で性能劣化なし）

## 技術制約

- PC 専用、タッチ入力は実装しない
- i18n は辞書方式（react-i18n 等のライブラリ不使用、軽量に）
- DotGothic16 は Google Fonts CDN から読み込み
- OG 画像は static asset（`public/og-image.png`）
- fireMode 追加は既存 WeaponSystem を拡張、新 System は ManualFireSystem のみ

## 見積もり

| Task | 推定時間 | 依存 |
|------|----------|------|
| T1 MouseAim | 1h | — |
| T2 ManualFire | 1.5h | T1 |
| T3 Ultimate | 2h | T1 |
| T4 日本語化 | 2h | — |
| T5 照準可視化 | 1h | T1 |
| T6 操作説明 | 0.5h | T4 |
| T7 OG Meta | 0.5h | — |
| T8 ローディング | 0.5h | T4 |
| T9 データ更新 | 0.5h | T2 |
| T10 ポーズ改善 | 0.5h | T4 |
| T11 GDD 更新 | 0.5h | 全て |
| **合計** | **~10h** | |

---

*Sprint 2 spec by 娜娜 🐇 — 2026-04-01*
