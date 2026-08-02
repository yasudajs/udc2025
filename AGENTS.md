# GitHub Copilot Instructions

このファイルは、GitHub Copilotがコードを生成する際に従うべきプロジェクト固有のルールとガイドラインを定義します。

## プロジェクト概要

- **プロジェクト名**: UDC2025
- **フレームワーク**: Flask 2.2.5
- **Python バージョン**: 3.7
- **用途**: Webアプリケーション

## コーディング規約

### Python

- PEP 8に準拠したコードスタイル
- インデントは4スペース
- 関数・クラスには必ずdocstringを記述
- 型ヒントを可能な限り使用
- 変数名・関数名は日本語を避け、英語の snake_case を使用

```python
# Good
def get_user_data(user_id: int) -> dict:
    """ユーザーデータを取得する"""
    pass

# Bad
def getUserData(user_id):
    pass
```

### Flask

- ルーティングは `app.py` に集約
- テンプレートは `templates/` ディレクトリに配置
- 静的ファイルは `static/` ディレクトリに配置
- 環境変数は `.env` ファイルで管理

### JavaScript

- ES6以降の文法を使用
- セミコロンは省略しない
- 変数宣言は `const` を優先、必要に応じて `let` を使用
- `var` は使用しない
- 関数名・変数名は camelCase を使用
- JavaScriptは機能ごとにファイルを分割して管理
  - 例: `api.js`（API通信）, `utils.js`（ユーティリティ）, `map.js`（地図機能）

```javascript
// Good: api.js
const userData = getUserData();

// Good: utils.js
function formatDate(date) {
  return date.toISOString();
}

// Bad: すべてを app.js に記述
var user_data = getUserData()
```

### HTML/CSS

- HTML5の文法に準拠
- CSSクラス名はケバブケース（kebab-case）を使用
- インデントは2スペース
- CSSは機能ごとにファイルを分割して管理
  - 例: `base.css`（基本スタイル）, `components.css`（コンポーネント）, `layout.css`（レイアウト）

```html
<!-- Good -->
<div class="user-profile">
  <h1 class="profile-title">Title</h1>
</div>

<!-- Bad -->
<div class="user_profile">
    <h1 class="profileTitle">Title</h1>
</div>
```

```css
/* Good: components.css */
.user-profile {
  padding: 20px;
}

/* Bad: すべてを style.css に記述 */
```

## データベース

- SQLiteを使用
- SQLクエリはSQLAlchemy ORMを使用して記述

## セキュリティ

- パスワードやAPIキーは `.env` ファイルに保存し、コードに直接記述しない
- ユーザー入力は必ずバリデーション・サニタイズを行う
- SQLインジェクション対策としてプレースホルダーを使用

## エラーハンドリング

- 例外は適切にキャッチし、ユーザーフレンドリーなメッセージを表示
- ログは適切なレベルで記録（DEBUG, INFO, WARNING, ERROR）

```python
try:
    result = process_data(data)
except ValueError as e:
    logger.error(f"Invalid data: {e}")
    return {"error": "無効なデータです"}, 400
```

## コメント

- 複雑なロジックには日本語でコメントを記述
- 関数・クラスのdocstringは日本語で記述
- TODOコメントには期限や担当者を明記

```python
# TODO: 2025-11-30までにキャッシュ機能を実装（担当: yjs）
def get_data():
    """データを取得する
    
    Returns:
        dict: 取得したデータ
    """
    pass
```

## テスト

- 重要な機能には単体テストを記述
- テストファイルは `test_*.py` の命名規則に従う
- pytestを使用

## 禁止事項

- グローバル変数の使用は最小限に
- ハードコードされた設定値（URL、ポート番号など）は使用しない
- 未使用のインポートやコードは削除

## Git運用

- Git コミットメッセージは日本語で簡潔に記述
- 機密情報を含むファイル（`sftp.json`, `.env`）は `.gitignore` に追加
- **重要**: Git関連の処理（commit, push）は、ユーザーから明示的に指示があった場合のみ実行する
- 作業完了後に自動的にコミット・プッシュしない

## その他

- コード生成時は必要最小限のファイルのみ作成する
- 不要なファイルやディレクトリは作成しない
- prompt.mdはユーザーのメモなので、操作対象にはしない
