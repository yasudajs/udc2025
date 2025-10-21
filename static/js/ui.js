// ========================================
// UI制御機能
// ユーザーインターフェースの制御とイベント処理を担当
// ========================================

import { showCurrentLocation } from './location.js';

// ========================================
// イベントリスナーの設定
// ========================================
export function setupEventListeners(currentCategoryRef, loadDataForCurrentCategoryCallback, map) {
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
        console.log('地図の移動が完了しました');

        // データの再読み込み
        loadDataForCurrentCategoryCallback();
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