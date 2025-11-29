// ========================================
// 設定ファイル
// ========================================

export const CONFIG = {
    // 地図設定
    map: {
        defaultCenter: {
            lat: 33.590200, // 福岡SRPセンタービル
            lng: 130.351903,
            zoom: 16
        },
        minZoom: 10,
        maxZoom: 19
    },

    // BODIK API設定
    api: {
        baseUrl: 'https://wapi.bodik.jp',
        searchRadius: 20000, // 検索半径（メートル）
        maxResults: 100,     // 最大取得件数
        endpoints: {
            aed: { endpoint: 'aed', name: 'AED' },
            hospital: { endpoint: 'hospital', name: '医療機関' },
            freewifi: { endpoint: 'public_wireless_lan', name: '公衆無線LANアクセスポイント' },
            evacuation: { endpoint: 'evacuation_space', name: '指定緊急避難場所' },
            toilet: { endpoint: 'public_toilet', name: '公衆トイレ' }
        }
    },

    // UI設定
    ui: {
        markerColors: {
            aed: '#e74c3c',        // 赤
            hospital: '#3498db',    // 青
            freewifi: '#27ae60',    // 緑
            evacuation: '#f39c12',  // オレンジ
            toilet: '#9b59b6'       // 紫
        },
        reloadDistanceThreshold: 2000  // 地図移動時のデータ再読み込み閾値（メートル）
    },

    // お気に入り設定
    favorites: {
        enabled: true,              // お気に入い機能の有効/無効
        maxCount: 100,              // 最大保存数
        storageKey: 'udc2025_favorites'  // localStorageのキー
    },

    // 位置情報設定
    geolocation: {
        timeout: 5000,         // 5秒タイムアウト
        enableHighAccuracy: false,  // 速度優先
        maximumAge: 300000     // 5分以内のキャッシュ位置を使用
    }
};