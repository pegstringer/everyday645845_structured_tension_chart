# Cloud Run + Firebase デプロイガイド

このドキュメントでは、緊張構造チャートアプリをCloud RunとFirebaseにデプロイする手順を説明します。

## 前提条件

- Google Cloud Project が作成済み
- Firebase プロジェクトが作成済み（`everyday645845-stchart-backend`）
- Google Cloud CLI (`gcloud`) がインストール済み
- Firebase CLI がインストール済み
- Docker がインストール済み

## 1. Firebase設定

### 1.1 Firestoreセキュリティルールのデプロイ

```bash
# Firebaseにログイン
firebase login

# Firebaseプロジェクトを初期化（初回のみ）
firebase init firestore

# プロジェクトを選択
# ? Please select an option: Use an existing project
# ? Select a default Firebase project: everyday645845-stchart-backend

# セキュリティルールをデプロイ
firebase deploy --only firestore:rules
```

### 1.2 Firebase Authenticationの確認

Firebase Consoleで以下を確認：
- **Authentication** → **Sign-in method** → **Google** が有効になっていること
- **Authorized domains** に Cloud Run のドメインを追加（デプロイ後）

## 2. Cloud Runデプロイ

### 2.1 Google Cloud Project の設定

```bash
# Google Cloud にログイン
gcloud auth login

# プロジェクトを設定
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Cloud Run APIを有効化
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2.2 Dockerイメージのビルドとデプロイ

```bash
# プロジェクトルートディレクトリで実行

# Dockerイメージをビルドしてデプロイ（ワンステップ）
gcloud run deploy tension-chart-app \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# デプロイが成功すると、URLが表示されます
# 例: https://tension-chart-app-xxxxx-an.a.run.app
```

### 2.3 手動ビルド（オプション）

Cloud Buildを使わず、ローカルでビルドしてプッシュする場合：

```bash
# Artifact Registry にリポジトリを作成
gcloud artifacts repositories create tension-chart-repo \
  --repository-format=docker \
  --location=asia-northeast1

# Dockerイメージをビルド
docker build -t asia-northeast1-docker.pkg.dev/$PROJECT_ID/tension-chart-repo/tension-chart-app:latest .

# Dockerイメージをプッシュ
docker push asia-northeast1-docker.pkg.dev/$PROJECT_ID/tension-chart-repo/tension-chart-app:latest

# Cloud Runにデプロイ
gcloud run deploy tension-chart-app \
  --image asia-northeast1-docker.pkg.dev/$PROJECT_ID/tension-chart-repo/tension-chart-app:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi
```

## 3. Firebase Authenticationの設定更新

Cloud Runデプロイ後、取得したURLをFirebase Authenticationの承認済みドメインに追加：

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. **Add domain** をクリック
3. Cloud RunのURL（例: `tension-chart-app-xxxxx-an.a.run.app`）を追加

## 4. 動作確認

1. Cloud RunのURLにアクセス
2. Googleでログインできることを確認
3. エントリを作成・保存できることを確認
4. Firebase Console → **Firestore Database** でデータが保存されていることを確認

## 5. カスタムドメインの設定（オプション）

```bash
# カスタムドメインをマッピング
gcloud run domain-mappings create \
  --service tension-chart-app \
  --domain your-domain.com \
  --region asia-northeast1
```

その後、DNSレコードを設定してください。

## 6. 環境変数の設定（必要に応じて）

Cloud Runで環境変数を設定する場合：

```bash
gcloud run services update tension-chart-app \
  --region asia-northeast1 \
  --set-env-vars "ENV_VAR_NAME=value"
```

## 7. 継続的デプロイ（CI/CD）

GitHub Actionsを使用する場合の例（`.github/workflows/deploy.yml`）：

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: tension-chart-app
          region: asia-northeast1
          source: .
```

## 8. コスト最適化

- **最小インスタンス数**: 0（無料枠を活用）
- **メモリ**: 256Mi（最小）
- **CPU**: 1（最小）
- **リクエストタイムアウト**: 60秒（デフォルト）

## トラブルシューティング

### 認証エラーが発生する場合

1. Firebase Consoleで **Authorized domains** にCloud Run URLが追加されているか確認
2. ブラウザのキャッシュをクリア
3. シークレットモードで試す

### データが保存されない場合

1. Firebase Console → **Firestore Database** → **Rules** でセキュリティルールが正しくデプロイされているか確認
2. ブラウザのコンソールでエラーを確認
3. Cloud Runのログを確認: `gcloud run services logs read tension-chart-app --region asia-northeast1`

### ビルドエラーが発生する場合

1. `Dockerfile`、`nginx.conf` が正しい場所にあるか確認
2. `.dockerignore` で必要なファイルが除外されていないか確認
3. ローカルで `docker build .` を実行してエラーを確認

## リソース

- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
