// ========================================
// UI制御機能
// ユーザーインターフェースの制御とイベント処理を担当
// ========================================

import { showCurrentLocation } from './location.js';
import { CONFIG } from './config.js';
import { calculateDistance } from './utils.js';

// ========================================
// イベントリスナーの設定
// ========================================
export function setupEventListeners(currentCategoryRef, loadDataForCurrentCategoryCallback, map) {
    // 前回の地図中心位置を保存
    let lastCenter = map.getCenter();

    // カテゴリボタンのクリックイベント
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // アクティブ状態の切り替え
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // カテゴリの切り替え
            currentCategoryRef.current = this.dataset.category;
            console.log(`カテゴリを切り替え: ${currentCategoryRef.current}`);

            // データの再読み込み
            loadDataForCurrentCategoryCallback();
        });
    });

    // 地図の移動・ズーム終了イベント（データ再読み込み）
    map.on('moveend', function () {
        const currentCenter = map.getCenter();
        const distance = calculateDistance(lastCenter.lat, lastCenter.lng, currentCenter.lat, currentCenter.lng);

        console.log(`地図の移動距離: ${distance.toFixed(0)}m`);

        // 移動距離が閾値を超えた場合のみデータ再読み込み
        if (distance > CONFIG.ui.reloadDistanceThreshold) {
            console.log('移動距離が閾値を超えたため、データを再読み込みします');
            loadDataForCurrentCategoryCallback();
            lastCenter = currentCenter;
        }
    });

    // 現在地ボタンのクリックイベント
    const currentLocationBtn = document.getElementById('current-location-btn');
    currentLocationBtn.addEventListener('click', function () {
        showCurrentLocation(map);
    });

    // 更新ボタンのクリックイベント
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', function () {
        refreshData(loadDataForCurrentCategoryCallback);
    });
}

// ========================================
// データの更新
// ========================================
export function refreshData(loadDataForCurrentCategoryCallback) {
    loadDataForCurrentCategoryCallback();
}