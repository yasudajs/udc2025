# API連携仕様（BODIK API / UDC2025）

最終更新日: 2026-06-14

## 1. 目的
BODIK API（WAPI）から防災関連データ（AED/医療機関/公衆無線LAN/指定緊急避難場所/公衆トイレ）を取得し、地図描画に適した形式へ正規化するための仕様を定義する。

## 2. 参照
- BODIK API トップ: https://www.bodik.jp/project/bodik-api/
- BODIK API しくみ: https://www.bodik.jp/project/bodik-api/bodik-api-info/
- BODIK API マニュアル: https://www.bodik.jp/project/bodik-api/bodik-api-manual/
- Swagger（オンライン仕様）: https://wapi.bodik.jp/docs

## 3. 利用予定データセット（apiname）
| apiname | 説明 |
|---|---|
| aed | AED設置箇所一覧 |
| hospital | 医療機関一覧 |
| public_wireless_lan | 公衆無線LANアクセスポイント一覧 |
| evacuation_space | 指定緊急避難場所一覧 |
| public_toilet | 公衆トイレ一覧 |

必要に応じて追加（public_facility など）。

## 4. 標準化データモデル
```jsonc
{
  "id": "string",            // 一意識別子（元データのIDなど）
  "name": "string",          // 名称
  "category": "aed|hospital|freewifi|evacuation|toilet|...",
  "lat": 33.000000,
  "lng": 130.000000,
  "address": "string",
  "tel": "string|null",
  "open_hours": "string|null",
  "municipality": "string|null", // 自治体名
  "updated_at": "ISO8601|null",
  "raw": { /* 必要最小限の原文保持 */ }
}
```

## 5. BODIK API（WAPI）基本情報
- ベースURL: https://wapi.bodik.jp
- 位置情報検索に対応（内部はElasticsearch）。
- データはCKANのCSVから毎日夜間に取り込み・更新（説明より）。

## 6. 主なエンドポイント（GET）
1) 自治体一覧（データセット別）
   - GET /<apiname>/organization
   - 例: https://wapi.bodik.jp/aed/organization
   - レスポンス（例の構成）: dataset_type, apiname, organ_code, count などの配列

2) データ検索（自治体標準ODS）
   - GET /<apiname>
   - パラメータ例:
     - select_type=data（固定的に指定する例あり）
     - maxResults=10（最大件数）
     - municipalityName=福岡市（自治体名による絞り込み）
     - 他のパラメータはSwagger参照
   - 例: https://wapi.bodik.jp/aed?select_type=data&maxResults=100&municipalityName=福岡市

3) データセットの構成情報
   - GET /config/<apiname>
   - 例: https://wapi.bodik.jp/config/aed
   - レスポンス: apiname, display_name, geometry, dataModel, fields などの定義

4) 自治体情報（全体）
   - GET /organization
   - 例: https://wapi.bodik.jp/organization
   - レスポンス: organ_code, organ_name 等の配列

## 7. その他のエンドポイント（POST）
- 高度検索/非標準データセット向け
  - POST /api/<apiname>
  - リクエストボディに条件JSONを指定（例：範囲検索など）
  - 例（数値範囲の例・マニュアルより）:
    ```json
    {
      "maxOccupancyCapacity": {"gte": 1000, "lte": 2000}
    }
    ```

## 8. 正規化（フィールドマッピング）方針
- 実際のフィールド名はデータセット/自治体により差異があるため、まず GET /config/<apiname> で項目を確認し、以下の標準項目にマッピングする。
- 最低限: 緯度/経度、名称、住所（あれば電話/営業時間）。
- 緯度経度が欠落するレコードは描画対象外としてログに記録。

## 9. 取得方式（現行方針）

現行実装:
- フロントエンドから BODIK API を直接呼び出す方式を採用。
- 理由: BODIK API を利用することで、ローカルにデータを保持せずに運用できるため。
- 方針: ローカルDBおよびサーバー側キャッシュは採用しない。

## 10. キャッシュ/パフォーマンス
- 現行実装: サーバー側キャッシュなし。
- TTL目安: 24h（BODIK夜間更新を考慮）。
- レート: 公式に明示なし。礼儀的にバースト抑制（連続呼び出し間隔、ページング活用）。

## 11. エラーハンドリング
- HTTP 4xx/5xx/タイムアウト: ユーザー通知とコンソールログで検知。将来的にリトライ/キャッシュフォールバックを追加検討。
- データ欠損: 緯度/経度が無効な行はスキップし、件数をログ。

## 12. セキュリティ
- 現状APIキー不要の想定。将来必要になった場合はサーバー側環境変数で保持。
- 入力パラメータのサニタイズ、想定外の巨大リクエストの抑制。

## 13. 動作確認用リクエスト例（現行）
- 自治体一覧（AED）: https://wapi.bodik.jp/aed/organization
- AED検索（福岡市・最大100件）: https://wapi.bodik.jp/aed?select_type=data&maxResults=100&municipalityName=福岡市
- 構成情報（AED）: https://wapi.bodik.jp/config/aed

## 14. 今後の詰め事項
- 各カテゴリ（aed/hospital/public_wireless_lan/evacuation_space/public_toilet）の実フィールド名確認とマッピング表の確定（Swaggerを基に作成）。
- 取得範囲（bbox/中心半径）やクエリ仕様の最終決定。
- APIレスポンス変化時のフォールバック表示方針を確定。
