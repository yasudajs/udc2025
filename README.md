# UDC2025

オープンデータを地図で可視化する Flask ベースの Web アプリケーションです。
オープンデータ基盤として [BODIK API](https://www.bodik.jp/project/bodik-api/) を利用しています。

この README は、次の2つを最短で進めるためのガイドです。

- プロジェクトをローカルで動かす
- Fork して改善を提案する

## 主な機能

- 地図上でのデータ表示
- カテゴリ単位でのデータ切り替え
- お気に入り登録と再表示

## クイックスタート

### 1. リポジトリ取得

```bash
git clone <repository-url>
cd udc2025
```

### 2. 仮想環境の作成と有効化

```bash
python -m venv venv37
```

Windows (PowerShell):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\venv37\Scripts\Activate.ps1
```

Mac/Linux:

```bash
source venv37/bin/activate
```

### 3. 依存パッケージのインストール

```bash
pip install -r docs/requirements.txt
```

### 4. アプリ起動

```bash
python app.py
```

起動後、ブラウザで以下を開きます。

- http://localhost:5000

## 開発向けセットアップ

### サーバー環境に寄せた依存で確認したい場合

```bash
pip install -r docs/requirements_server.txt
```

### よくあるトラブル

- PowerShell で有効化できない:
	- `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned` を実行
- ポート競合で起動しない:
	- 他プロセスの停止、または起動ポート変更を検討

## Fork して貢献する

1. このリポジトリを Fork
2. Fork をローカルに clone
3. 作業ブランチを作成

```bash
git checkout -b feature/your-change
```

4. 変更・動作確認
5. コミットして Push
6. Pull Request を作成

PR には次を含めてください。

- 変更の目的
- 変更内容の要約
- 動作確認手順
- 影響範囲

## プロジェクト構成

```text
.
|- app.py
|- index.cgi
|- templates/
|- static/
|  |- css/
|  `- js/
`- docs/
```

## ドキュメント

- 要件定義: [docs/01_要件定義.md](docs/01_要件定義.md)
- 機能仕様: [docs/02_機能仕様.md](docs/02_機能仕様.md)
- 画面設計: [docs/03_画面設計.md](docs/03_画面設計.md)
- DB設計: [docs/04_データベース設計.md](docs/04_データベース設計.md)
- デプロイ手順: [docs/05_デプロイ手順.md](docs/05_デプロイ手順.md)
- API連携仕様: [docs/06_API連携仕様.md](docs/06_API連携仕様.md)
- リファクタリング仕様: [docs/07_リファクタリング仕様.md](docs/07_リファクタリング仕様.md)

## デプロイ

ロリポップ環境でのデプロイ例は以下を参照してください。

- [docs/05_デプロイ手順.md](docs/05_デプロイ手順.md)

## データ提供・謝辞

本プロジェクトは、オープンデータ基盤として [BODIK API](https://www.bodik.jp/project/bodik-api/) を活用しています。
公開・運営いただいている [公益財団法人九州先端科学技術研究所](https://www.isit.or.jp/) に感謝いたします。

## ライセンス

ライセンスは今後追記予定です。
