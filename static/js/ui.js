// ========================================
// UI制御機能
// ユーザーインターフェースの制御とイベント処理を担当
// ========================================

import { showCurrentLocation } from './location.js';
import { CONFIG } from './config.js';
import { calculateDistance } from './utils.js';

// ========================================
// ボタンスタイル設定関数
// ========================================
function setDefaultButtonStyle(button, category) {
    const color = CONFIG.ui.markerColors[category];
    button.style.backgroundColor = '#e0e0e0'; // 薄灰色
    button.style.color = '#333'; // 暗い文字色
    button.style.border = color ? `2px solid ${color}` : 'none'; // 枠線をピンの色に
}

function setActiveButtonStyle(button, category) {
    const color = CONFIG.ui.markerColors[category];
    if (color) {
        button.style.backgroundColor = color;
        button.style.color = '#fff'; // 白文字
        button.style.border = `2px solid ${color}`; // アクティブ時も枠線維持
    }
}

// ========================================
// イベントリスナーの設定
// ========================================
export function setupEventListeners(currentCategoryRef, loadDataForCurrentCategoryCallback, map) {
    // 前回の地図中心位置を保存
    let lastCenter = map.getCenter();

    // カテゴリボタンのクリックイベント
    const categoryButtons = document.querySelectorAll('.category-btn');

    // 初期化時にすべてのボタンをデフォルトスタイルに設定
    categoryButtons.forEach(button => {
        const category = button.dataset.category;
        setDefaultButtonStyle(button, category);
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // すべてのボタンをデフォルトスタイルにリセット
            categoryButtons.forEach(btn => {
                const cat = btn.dataset.category;
                setDefaultButtonStyle(btn, cat);
                btn.classList.remove('active');
            });

            // 選択されたボタンをアクティブスタイルに設定
            this.classList.add('active');
            const category = this.dataset.category;
            setActiveButtonStyle(this, category);

            // カテゴリの切り替え
            currentCategoryRef.current = category;
            console.log(`カテゴリを切り替え: ${category}`);

            // データの再読み込み
            loadDataForCurrentCategoryCallback();
        });
    });

    // 初期カテゴリ（AED）のボタンをアクティブに設定
    const initialActiveButton = document.querySelector(`.category-btn[data-category="${currentCategoryRef.current}"]`);
    if (initialActiveButton) {
        initialActiveButton.classList.add('active');
        setActiveButtonStyle(initialActiveButton, currentCategoryRef.current);
    }

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