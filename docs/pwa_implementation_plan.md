# UDC2025 PWA化 実装計画書

## 概要
現在のHTML+JSアプリ（Leaflet使用）をPWA（Progressive Web App）化し、スマートフォン等でネイティブアプリのように全画面表示で動作するようにします。
また、GitHub Pages (`https://yasudajs.github.io/udc2025/`) での公開を前提とし、サブディレクトリ環境でも正常に動作するようパス設定を行います。

## 要件定義
1. **アイコン画像**
   - ユーザーから提供された青と白のデザイン画像を元に、PWA用のアイコン画像（`192x192` および `512x512` ピクセルのPNG形式）を作成し配置する。
2. **オフライン時の動作**
   - APIからデータを取得し、Leafletでネットワーク上の地図タイルを表示するアプリの性質上、オフラインでの主要機能の動作は不可とする。
   - 代わりに、オフライン時にユーザーがアプリを開いた際は「現在オフラインです。地図やデータを表示するためにネットワークに接続してください📡」という専用のメッセージ画面を表示する。
3. **表示モード**
   - URLバー等を非表示にし、ネイティブアプリのように見せる「全画面モード（Standalone）」に設定する。
4. **ホスティング環境の考慮**
   - GitHub Pagesのサブディレクトリ（`/udc2025/`）で動作するよう、`manifest.json` の `start_url` や各種リソースの読み込みには相対パス（`./`）を使用する。

## 変更・追加するファイル一覧

### 1. [NEW] `manifest.json`
- **保存先**: `c:\work\lolipop\udc2025\manifest.json`
- **内容**: PWAの基本設定。
  - `name`, `short_name`: アプリ名
  - `start_url`: `"./index.html"` または `"."`
  - `display`: `"standalone"`
  - `icons`: 生成したアプリアイコンへの相対パスを指定

### 2. [NEW] `sw.js` (Service Worker)
- **保存先**: `c:\work\lolipop\udc2025\sw.js`
- **内容**: ネットワークのプロキシ制御。
  - インストール時（`install` イベント）に `offline.html` をキャッシュに保存。
  - 通信時（`fetch` イベント）は基本的にネットワークからデータを取得。
  - オフライン等でネットワークリクエストが失敗した場合に、キャッシュから `offline.html` を返却する。

### 3. [NEW] `offline.html`
- **保存先**: `c:\work\lolipop\udc2025\offline.html`
- **内容**: オフライン時のメッセージ画面。
  - 画面中央に「現在オフラインです。地図やデータを表示するためにネットワークに接続してください📡」というメッセージを表示するシンプルなHTML。

### 4. [NEW] PWA用アイコン画像
- **保存先**: `c:\work\lolipop\udc2025\images\`（または `icons\`）内
- **内容**: `icon-192x192.png` および `icon-512x512.png`
  - 提供されたデザイン画像からサイズを調整して配置する。

### 5. [MODIFY] `index.html`
- **保存先**: `c:\work\lolipop\udc2025\index.html`
- **変更内容**:
  - `<head>` 内に `<link rel="manifest" href="./manifest.json">` を追記。
  - `<head>` 内に iOS向けのアプリアイコン指定 `<link rel="apple-touch-icon" href="./images/icon-192x192.png">` を追記。
  - `<body>` 終了タグの直前などに、`sw.js` を登録するJavaScriptコードを追記。

## 検証手順
1. ローカル開発環境（またはGitHub Pages）にて `index.html` を開く。
2. ブラウザのデベロッパーツール（Applicationタブ）を開き、`manifest.json` と Service Worker が正常に読み込まれていることを確認する。
3. ブラウザに「アプリのインストール」ボタンが表示されることを確認する。
4. デベロッパーツールのNetworkタブ等で状態を「Offline」に切り替え、ページをリロードした際に `offline.html` が表示されることを確認する。
