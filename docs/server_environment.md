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

## 推奨方針
- 依存バージョンの固定（requirements.txtをサーバー準拠に）
- ログ設計とエラーハンドリングを明確化
- 将来のPython 3.10+ への移行計画を並行で策定
