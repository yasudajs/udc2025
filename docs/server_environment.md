# サーバー環境まとめ（ロリポップ / udc2025.yjs.jp）

最終更新日: 2025-10-18

## URL
- https://udc2025.yjs.jp/

## サーバー
- Nginx + LiteSpeed（提供プランに準拠）

## Python
- 3.7.17（EOL）

## 主要モジュール（抜粋）
- Flask==2.2.5
- Jinja2==3.1.6
- Werkzeug==2.2.3
- requests==2.31.0
- pandas==1.3.5 / numpy==1.21.6
- MySQLクライアント: mysqlclient, PyMySQL, mysql-connector-python

詳細は `requirements_server.txt` を参照。

## 注意点
- Python 3.7系のため、最新のFlask 3.xは未対応
- 外部パッケージの追加インストールが制限される可能性（サーバー側に依存）
- 常駐プロセスの可否やWSGI/FCGIの設定方法はプランに依存

## CGI設定（重要）

### シェバン（Shebang）
- **サーバーモデル**: spdxxx（サーバー番号: spd156）
- **Python パス**: `/usr/local/bin/python3.7`
- **設定値**: `#!/usr/local/bin/python3.7`

詳細は [ロリポップCGIマニュアル](https://lolipop.jp/manual/hp/cgi/) を参照。

### パーミッション設定（ロリポップ推奨値）

| ファイル種 | パーミッション | 8進数 | 説明 |
|---|---|---|---|
| CGI実行ファイル | rwx---r-x | 705 | owner: rwx, group: ---, other: r-x |
| Pythonスクリプト | rwx---r-x | 705 | owner: rwx, group: ---, other: r-x |
| .htaccess | rw----r-- | 604 | owner: rw-, group: ---, other: r-- |
| データファイル | rw------- | 600 | owner: rw-, group: ---, other: --- |

**注意**: ロリポップではセキュリティ上、777や666の設定では動作しない場合がある。

### トラブルシューティング
- `lscgid: execve(): No such file or directory` エラー
  - シェバンのパスが間違っていないか確認
  - ファイルの改行コードをLFに統一（Windowsの場合、CRLFから変換）
  - ファイルを削除して再アップロード

## 推奨方針
- 依存バージョンの固定（requirements.txtをサーバー準拠に）
- ログ設計とエラーハンドリングを明確化
- 将来のPython 3.10+ への移行計画を並行で策定
