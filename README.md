# 日次 緊張構造チャート

モバイルで毎日5〜10分の入力→保存→習慣化。緊張構造チャートで目標達成を可視化する、Firebase連携PWAアプリケーション。

![PWA Badge](https://img.shields.io/badge/PWA-enabled-blue)
![Mobile First](https://img.shields.io/badge/Mobile-First-green)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Cloud Run](https://img.shields.io/badge/Cloud-Run-blue)
![Security](https://img.shields.io/badge/Security-Hardened-green)

## ✨ 特徴

- 📱 **モバイルファースト設計** - 片手操作に最適化
- ⚡ **PWA対応** - ホーム画面に追加してアプリのように使用可能
- 🔐 **Google認証** - セキュアなログイン
- ☁️ **クラウド同期** - Firestoreで複数デバイス間でデータ同期
- 🎨 **モダンなデザイン** - グラデーション＋フロステッドグラス効果
- ⏱️ **スティッキータイマー** - スクロールしても見えるタイマー
- 🔥 **Streak追跡** - 連続日数を記録してモチベーション維持
- 🔒 **セキュリティ対策** - XSS防止、入力バリデーション、厳格なFirestoreルール
- 📤 **バックアップ機能** - JSON形式でエクスポート/インポート
- 🌙 **ダークモード** - システム設定に自動対応

## 🚀 デプロイ方法

### Cloud Run + Firebaseへのデプロイ

詳細な手順は [DEPLOY.md](./DEPLOY.md) を参照してください。

#### クイックスタート

```bash
# 1. Firebaseセキュリティルールをデプロイ
firebase login
firebase deploy --only firestore:rules

# 2. Cloud Runにデプロイ
gcloud run deploy tension-chart-app \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi
```

### ローカル開発

```bash
# HTTPサーバーを起動
python3 -m http.server 8000
# または
npx serve .

# ブラウザで http://localhost:8000 にアクセス
```

**注意**: Firebase機能を使用するには、`index.html`内のFirebase設定を自分のプロジェクトの設定に変更してください。

## 📖 使い方

### 初回ログイン

1. アプリにアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントでログイン

### 基本フロー

1. **タイマー選択**: 5/7/10分から選択して開始
2. **入力**:
   - 🎯 成果目標: 何を達成したいか
   - 📊 現実: 今の状況
   - ✅ アクション: 具体的な行動（複数追加可能、↑↓で並べ替え）
   - 📝 ステータス: 進捗状況
   - 📸 証拠・ログ: 実行した証拠
   - 💭 リフレクション: 振り返り（任意）
3. **保存**: 下部の「保存して完了」ボタン（Cmd/Ctrl+S でも可）
4. **習慣化**: Streakを伸ばしてバッジを獲得

### タイマーについて

- タイマーは目安として機能します
- 時間を超過しても入力は続けられます
- ページをスクロールしても上部に小さく表示（スティッキータイマー）
- ゼロになると通知が表示されます
- マイナス時間も表示されます（例: -02:30）

### アクション管理

- **追加**: 「+ 追加」ボタンで新しいアクションを追加
- **並べ替え**: ↑↓ボタンでアクションの順序を変更
- **ステータス変更**: 未着手/進行中/完了を選択
- **削除**: ✕ボタンで削除

### 履歴機能

- 📚 **検索**: 全文検索で過去のエントリを検索
- 🔍 **フィルタ**: 「完了アクションあり」で絞り込み
- 📅 **並べ替え**: 新しい順/古い順
- ✏️ **編集**: 過去のエントリを編集可能
- 📋 **複製**: 過去のエントリを今日に複製

### データのバックアップ

1. 設定タブ → 「JSONエクスポート」でバックアップ作成
2. 「JSONインポート」で復元

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: Vanilla JavaScript（フレームワークレス）
- **スタイリング**: Tailwind CSS (CDN)
- **PWA**: Service Worker + Web App Manifest

### バックエンド
- **認証**: Firebase Authentication (Google OAuth)
- **データベース**: Cloud Firestore
- **ストレージ構造**: `users/{userId}/entries/{entryId}`

### インフラ
- **ホスティング**: Google Cloud Run
- **Webサーバー**: nginx (alpine)
- **コンテナ**: Docker

### セキュリティ
- **XSS対策**: HTMLエスケープ関数によるサニタイゼーション
- **入力検証**: クライアント側バリデーション（日付フォーマット、文字数制限）
- **Firestoreルール**: サーバー側バリデーション（データ型、文字数、アクション数制限）
- **HTTPヘッダー**: CSP, X-Frame-Options, Permissions-Policy等

## 📁 ファイル構成

```
.
├── index.html              # メインアプリケーション（Firebase SDK統合）
├── manifest.webmanifest    # PWAマニフェスト
├── sw.js                   # Service Worker
├── Dockerfile              # Cloud Run用Dockerコンテナ設定
├── nginx.conf              # nginx設定（セキュリティヘッダー含む）
├── .dockerignore           # Docker除外ファイル
├── firestore.rules         # Firestoreセキュリティルール
├── DEPLOY.md               # デプロイ手順書
├── generate-icons.html     # PWAアイコン生成ツール
├── icon-192.png           # アプリアイコン 192x192（要生成）
├── icon-512.png           # アプリアイコン 512x512（要生成）
└── README.md              # このファイル
```

## 🔒 セキュリティ

### 実装済みセキュリティ対策

#### 1. XSS（クロスサイトスクリプティング）対策
- すべてのユーザー入力をHTMLエスケープ
- `escapeHtml()` 関数による自動サニタイゼーション
- `innerHTML` への直接代入を回避

#### 2. 入力バリデーション
- **クライアント側**:
  - 日付フォーマット検証 (YYYY-MM-DD)
  - 文字数制限（各フィールド10KB）
  - アクション数制限（最大50個）
  - アクションステータス検証（todo/doing/doneのみ）

- **サーバー側（Firestoreルール）**:
  - データ型検証
  - 必須フィールド検証
  - 文字列長制限（10KB）
  - タイムスタンプ検証
  - 不変フィールド保護

#### 3. HTTPセキュリティヘッダー
```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: [詳細は nginx.conf を参照]
```

#### 4. 認証・認可
- Firebase Authentication による本人確認
- Firestoreルールでユーザーは自分のデータのみアクセス可能
- セッション管理はFirebase SDKに委任

## 📊 データ構造

エントリは以下の形式で Firestore に保存されます：

```json
{
  "id": "unique-id",
  "date": "2025-01-15",
  "goal": {
    "title": "目標タイトル",
    "detail": "詳細説明"
  },
  "reality": "現状の記述",
  "actions": [
    {
      "id": "action-id",
      "text": "アクション内容",
      "status": "todo|doing|done"
    }
  ],
  "statusNote": "ステータスメモ",
  "evidence": "証拠・ログ",
  "reflection": "振り返り",
  "createdAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:30:00.000Z"
}
```

### Firestoreパス構造

```
/users/{userId}/entries/{entryId}
```

各ユーザーのデータは完全に分離されています。

## 🎨 カスタマイズ

### Firebase設定の変更

`index.html` の Firebase設定を自分のプロジェクトに変更：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### カラーテーマ変更

`index.html` の `<style>` セクションでカラーを変更：

```css
/* プライマリカラー */
primary: {
  DEFAULT: '#6366F1',  /* Indigo */
  dark: '#4F46E5',
  light: '#818CF8'
}

/* アクセントカラー */
accent: {
  DEFAULT: '#EC4899',  /* Pink */
  dark: '#DB2777',
  light: '#F472B6'
}
```

## 🔧 開発者ツール

設定タブの「開発者ツール」を展開すると以下の機能が使えます：

- **日付 ±1日**: Streak計算のテスト用
- **日付リセット**: 本日に戻す
- **全データ削除**: Firestoreから全エントリを削除

## 🧪 テスト

### XSS対策のテスト

1. 成果目標に `<script>alert('XSS')</script>` を入力
2. 保存して履歴で確認
3. **期待される結果**: アラートが表示されず、エスケープされたテキストが表示される

### バリデーションのテスト

1. 50個以上のアクションを追加しようとする
2. **期待される結果**: エラーメッセージ "Too many actions" が表示される

## 🔒 プライバシー

- Google認証でユーザーを識別
- データはFirestoreに暗号化されて保存
- 各ユーザーは自分のデータのみアクセス可能
- Google以外の第三者へのデータ共有なし

## 📈 今後の改善案

1. ✅ ~~バックエンド連携~~ - Firebase実装済み
2. ✅ ~~セキュリティ強化~~ - XSS対策、バリデーション実装済み
3. **プッシュ通知** - Firebase Cloud Messaging統合
4. **統計・可視化** - 週次/月次の達成率グラフ
5. **テーマ選択** - ライト/ダーク/カスタムテーマ
6. **エクスポート形式拡張** - CSV, PDF対応

## 🐛 トラブルシューティング

### ログインできない

1. Firebase Consoleで認証が有効になっているか確認
2. Cloud RunのURLがAuthorized domainsに追加されているか確認
3. ブラウザのキャッシュをクリア

### データが保存されない

1. ログインしているか確認
2. Firestoreセキュリティルールが正しくデプロイされているか確認
3. ブラウザコンソールでエラーを確認

### デプロイエラー

詳細は [DEPLOY.md](./DEPLOY.md) のトラブルシューティングセクションを参照。

## 📝 ライセンス

このプロジェクトはオープンソースです。自由に使用・改変できます。

## 🤝 貢献

バグ報告や機能提案は Issue でお願いします。

---

**作成日**: 2025年1月
**バージョン**: 2.0.0
**対応ブラウザ**: Chrome, Safari, Edge（最新版）
**Firebase SDK**: v10.7.1
**デプロイ先**: Google Cloud Run + Firebase
