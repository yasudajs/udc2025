# BODIK Data Viewer

オープンデータを地図で可視化する Flask ベースの Web アプリケーションです。
オープンデータ基盤として [BODIK API](https://www.bodik.jp/project/bodik-api/) を利用しています。

本アプリはUDC2025応募作品であり、BDICK賞をいただくことが出来ました。
ご協力いただきました皆様に、この場を借りて感謝申し上げます。

アーバンデータチャレンジ2025 ファイナル審査結果
https://urbandata-challenge.jp/news/udc2025prize

この README は、次の2つを最短で進めるためのガイドです。

- プロジェクトをローカルで動かす
- Fork して改善を提案する

## 主な機能

- 地図上でのデータ表示
- カテゴリ単位でのデータ切り替え
- お気に入り登録と再表示

## クイックスタート（ローカル環境で動作させるまで）

### 1. リポジトリ取得

```bash
git clone https://github.com/yasudajs/udc2025.git
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

- 用語集: [docs/00_用語集.md](docs/00_用語集.md)
- 要件定義: [docs/01_要件定義.md](docs/01_要件定義.md)
- 機能仕様: [docs/02_機能仕様.md](docs/02_機能仕様.md)
- 画面設計: [docs/03_画面設計.md](docs/03_画面設計.md)
- DB設計: [docs/04_データベース設計.md](docs/04_データベース設計.md)
- デプロイ手順: [docs/05_デプロイ手順.md](docs/05_デプロイ手順.md)
- API連携仕様: [docs/06_API連携仕様.md](docs/06_API連携仕様.md)

## デプロイ

ロリポップ環境でのデプロイ例は以下を参照してください。

- [docs/05_デプロイ手順.md](docs/05_デプロイ手順.md)

## データ提供・謝辞

本プロジェクトは、オープンデータ基盤として [BODIK API](https://www.bodik.jp/project/bodik-api/) を活用しています。
公開・運営いただいている [公益財団法人九州先端科学技術研究所](https://www.isit.or.jp/) に感謝いたします。

## ライセンス

### コード（Python/JavaScript/CSS など）

MIT ライセンスの下で公開しています。
詳細は [LICENSE](LICENSE) を参照してください。

- 改造・フォーク・商用利用が自由です
- 条件：著作権表示と MIT ライセンス全文を含める

```
Copyright (c) 2025- BODIK Data Viewer Project
```

### ドキュメント（docs/ 以下の Markdown ファイル）

CC BY 4.0（表示）の下で公開しています。

- 改造・共有・商用利用が自由です
- 条件：著作権表示と元の著者を記載

### BODIK API

本プロジェクトで使用している BODIK API は、公益財団法人九州先端科学技術研究所により提供されています。
ご利用の際は、以下の公式サイトの利用規約に従ってください。

- [BODIK](https://www.bodik.jp/)
- [BODIK API](https://www.bodik.jp/project/bodik-api/)
