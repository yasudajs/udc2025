// ========================================
// メインエントリーポイント
// アプリケーションの初期化とモジュール統合を担当
// ========================================

import { CONFIG } from './config.js';
import { showNotification, showLoading, clearMarkers } from './utils.js';
import { map, initMap, setupMapLayers } from './map-core.js';
import { addCurrentLocationMarker, showCurrentLocation } from './location.js';
import { displayMarkers } from './markers.js';
import { loadDataForCurrentCategory } from './api.js';
import { setupEventListeners } from './ui.js';

// ========================================
// グローバル変数
// ========================================
let markers = [];
let currentCategory = 'aed';
let lastLoadedCenter = null; // 最後にデータを読み込んだ時の中心座標

// 参照オブジェクト（UIモジュール用）
const currentCategoryRef = { current: currentCategory };

// ========================================
// アプリケーション初期化
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

// ========================================
// アプリ初期化関数
// ========================================
function initApp() {
    try {
        console.log('UDC2025 アプリケーションを初期化中...');

        // 地図の初期化
        initMap((features) => displayMarkers(features, currentCategoryRef.current, map, markers));

        // UIイベントリスナーの設定
        setupEventListeners(currentCategoryRef, handleLoadDataForCurrentCategory);

        // 初期データ読み込みは地図の moveend イベントで自動実行
        console.log('UDC2025 アプリケーションの初期化が完了しました');

    } catch (error) {
        console.error('アプリケーション初期化エラー:', error);
        showNotification('アプリケーションの初期化に失敗しました', 'error');
    }
}

// ========================================
// BODIK APIからデータ取得（ラッパー関数）
// ========================================
function handleLoadDataForCurrentCategory() {
    const lastLoadedCenterRef = { current: lastLoadedCenter };
    loadDataForCurrentCategory(
        (features) => displayMarkers(features, currentCategoryRef.current, map, markers),
        currentCategoryRef.current,
        map,
        lastLoadedCenterRef
    );
    lastLoadedCenter = lastLoadedCenterRef.current;
}