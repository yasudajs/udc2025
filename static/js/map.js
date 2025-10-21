// ========================================
// グローバル変数
// ========================================
let markers = [];
let currentCategory = 'aed';
let lastLoadedCenter = null; // 最後にデータを読み込んだ時の中心座標

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
import { displayMarkers } from './markers.js';
import { loadDataForCurrentCategory } from './api.js';

// ========================================
// 初期化処理
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initMap((features) => displayMarkers(features, currentCategory, map, markers));
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
// BODIK APIからデータ取得（ラッパー関数）
// ========================================
function loadDataForCurrentCategory() {
    const lastLoadedCenterRef = { current: lastLoadedCenter };
    loadDataForCurrentCategory(
        (features) => displayMarkers(features, currentCategory, map, markers),
        currentCategory,
        map,
        lastLoadedCenterRef
    );
    lastLoadedCenter = lastLoadedCenterRef.current;
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


