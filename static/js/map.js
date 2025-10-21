// ========================================
// グローバル変数
// ========================================
let markers = [];
let currentCategory = 'aed';
let lastLoadedCenter = null; // 最後にデータを読み込んだ時の中心座標

// 参照オブジェクト（UIモジュール用）
const currentCategoryRef = { current: currentCategory };

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
import { setupEventListeners, refreshData } from './ui.js';

// ========================================
// 初期化処理
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initMap((features) => displayMarkers(features, currentCategoryRef.current, map, markers));
    setupEventListeners(currentCategoryRef, loadDataForCurrentCategory);
    // 初期データは地図の moveend イベントで自動読み込み
});

// ========================================
// BODIK APIからデータ取得（ラッパー関数）
// ========================================
function loadDataForCurrentCategory() {
    const lastLoadedCenterRef = { current: lastLoadedCenter };
    loadDataForCurrentCategory(
        (features) => displayMarkers(features, currentCategoryRef.current, map, markers),
        currentCategoryRef.current,
        map,
        lastLoadedCenterRef
    );
    lastLoadedCenter = lastLoadedCenterRef.current;
}


