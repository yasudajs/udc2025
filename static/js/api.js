// ========================================
// API連携機能
// BODIK APIとの通信を担当
// ========================================

import { CONFIG } from './config.js';
import { showNotification, showLoading } from './utils.js';

// ========================================
// BODIK APIからデータ取得
// ========================================
export function loadDataForCurrentCategory(displayMarkersCallback, currentCategoryParam, mapParam, lastLoadedCenterRef) {
    const config = CONFIG.api.endpoints[currentCategoryParam];
    if (!config) {
        console.error(`未対応のカテゴリ: ${currentCategoryParam}`);
        return;
    }

    // ローディング表示
    showLoading(true);
    showNotification(`${config.name}のデータを読み込み中...`);

    // 地図の中心座標を取得
    const center = mapParam.getCenter();
    const lat = center.lat;
    const lon = center.lng;

    // 最後にデータを読み込んだ位置を記録
    lastLoadedCenterRef.current = { lat: lat, lng: lon };

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
                    displayMarkersCallback(features);
                    showNotification(`${config.name}を${features.length}件表示しました`, 'success');
                } else {
                    console.warn('featuresが見つかりません');
                    displayMarkersCallback([]);
                    showNotification(`${config.name}のデータが見つかりませんでした`, 'warning');
                }
            } else {
                console.warn('resultsetsが見つかりません', data);
                displayMarkersCallback([]);
                showNotification(`${config.name}のデータ取得に失敗しました`, 'error');
            }
        })
        .catch(error => {
            console.error('APIエラー:', error);
            displayMarkersCallback([]);
            showNotification(`${config.name}のデータ取得に失敗しました: ${error.message}`, 'error');
        })
        .finally(() => {
            showLoading(false);
        });
}