// ========================================
// グローバル変数
// ========================================
let markers = [];
let currentCategory = 'aed';

// 設定とユーティリティのインポート
import { CONFIG } from './config.js';
import {
    showNotification,
    showLoading,
    clearMarkers,
    clearCurrentLocationMarkers,
    calculateDistance
} from './utils.js';

// 地図コア機能と現在地機能のインポート
import { map, initMap, setupMapLayers, setPopupOpeningState } from './map-core.js';
import { addCurrentLocationMarker, showCurrentLocation } from './location.js';

// ========================================
// 初期化処理
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initMap(loadDataForCurrentCategory);
    setupEventListeners();
    // 初期データは地図の moveend イベントで自動読み込み
});

// ========================================
// イベントリスナーの設定
// ========================================
function setupEventListeners() {
    // カテゴリボタンのクリックイベント
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // アクティブ状態の切り替え
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // カテゴリの切り替え
            currentCategory = this.dataset.category;
            console.log(`カテゴリを切り替え: ${currentCategory}`);

            // データの再読み込み
            loadDataForCurrentCategory();
        });
    });

    // 現在地ボタンのクリックイベント
    const currentLocationBtn = document.getElementById('current-location-btn');
    currentLocationBtn.addEventListener('click', function () {
        showCurrentLocation();
    });

    // 更新ボタンのクリックイベント
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', function () {
        refreshData();
    });
}

// ========================================
// データの更新
// ========================================
function refreshData() {
    loadDataForCurrentCategory();
}

// ========================================
// BODIK APIからデータ取得
// ========================================
function loadDataForCurrentCategory() {
    const config = CONFIG.api.endpoints[currentCategory];
    if (!config) {
        console.error(`未対応のカテゴリ: ${currentCategory}`);
        return;
    }

    // ローディング表示
    showLoading(true);
    showNotification(`${config.name}のデータを読み込み中...`);

    // 地図の中心座標を取得
    const center = map.getCenter();
    const lat = center.lat;
    const lon = center.lng;

    // 最後にデータを読み込んだ位置を記録
    lastLoadedCenter = { lat: lat, lng: lon };

    // APIのURLを構築
    const apiUrl = `${CONFIG.api.baseUrl}/${config.endpoint}?select_type=geometry&lat=${lat}&lon=${lon}&distance=${CONFIG.api.searchRadius}&maxResults=${CONFIG.api.maxResults}`;

    console.log(`API呼び出し: ${apiUrl}`);

    // BODIK APIを呼び出し
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if ('resultsets' in data) {
                const resultsets = data['resultsets'];
                if ('features' in resultsets) {
                    const features = resultsets['features'];
                    displayMarkers(features);
                    showNotification(`${config.name}を${features.length}件表示しました`, 'success');
                } else {
                    console.warn('featuresが見つかりません');
                    clearMarkers();
                    showNotification(`${config.name}のデータが見つかりませんでした`, 'warning');
                }
            } else {
                console.warn('resultsetsが見つかりません', data);
                clearMarkers();
                showNotification(`${config.name}のデータ取得に失敗しました`, 'error');
            }
        })
        .catch(error => {
            console.error('APIエラー:', error);
            clearMarkers();
            showNotification(`${config.name}のデータ取得に失敗しました: ${error.message}`, 'error');
        })
        .finally(() => {
            showLoading(false);
        });
}

// ========================================
// マーカーを地図に表示
// ========================================
function displayMarkers(features) {
    // 既存のマーカーをクリア
    clearMarkers();

    // カテゴリに応じたマーカーアイコンを作成
    const markerIcon = createMarkerIcon(currentCategory);

    // featuresからマーカーを作成
    for (let feature of features) {
        try {
            const properties = feature['properties'];
            const geometry = feature['geometry'];

            if (!geometry || !geometry['coordinates']) {
                console.warn('位置情報がありません:', feature);
                continue;
            }

            const coordinates = geometry['coordinates'];
            // BODIK APIの座標は [経度, 緯度] の順なので注意
            const lat = coordinates[1];
            const lon = coordinates[0];

            // マーカーを作成（カスタムアイコンを使用）
            const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(map);

            // ポップアップ内容を作成
            let popupContent = `<h3>${properties['name'] || '名称不明'}</h3>`;

            // 住所があれば追加
            if (properties['address']) {
                popupContent += `<p>📍 ${properties['address']}</p>`;
            }

            // その他の情報があれば追加
            if (properties['remarks']) {
                popupContent += `<p>${properties['remarks']}</p>`;
            }

            // ポップアップを設定
            const popup = L.popup().setContent(popupContent);
            marker.bindPopup(popup);

            // マーカークリック時のイベントリスナー
            marker.on('click', function () {
                isPopupOpening = true;
                // ポップアップを開く
                marker.openPopup();
                // フラグを元に戻す（少し遅延させる）
                setTimeout(() => {
                    isPopupOpening = false;
                }, 100);
            });

            // マーカーを配列に保存
            markers.push(marker);

        } catch (error) {
            console.error('マーカー作成エラー:', error, feature);
        }
    }

    console.log(`${markers.length}個のマーカーを表示しました`);
}

// ========================================
// カテゴリ別マーカーアイコンの作成
// ========================================
function createMarkerIcon(category) {
    // カテゴリに応じた色を取得（デフォルトは青）
    const color = CONFIG.ui.markerColors[category] || '#3498db';

    // Leaflet用のカスタムアイコンを作成
    // SVGを使って色付きマーカーを生成
    const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
            <path fill="${color}" stroke="white" stroke-width="1" d="M12 0C7.6 0 4 3.6 4 8c0 5.4 8 16 8 16s8-10.6 8-16c0-4.4-3.6-8-8-8z"/>
            <circle fill="white" cx="12" cy="8" r="3"/>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        className: 'custom-marker-icon',
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -45]
    });
}


