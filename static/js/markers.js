// ========================================
// マーカー管理機能
// 地図上のマーカー表示と管理を担当
// ========================================

import { CONFIG } from './config.js';
import { setPopupOpeningState } from './map-core.js';

// ========================================
// マーカーを地図に表示
// ========================================
export function displayMarkers(features, currentCategoryParam, mapParam, markersArray) {
    // 既存のマーカーをクリア
    markersArray.forEach(marker => {
        if (mapParam && marker) {
            mapParam.removeLayer(marker);
        }
    });
    markersArray.length = 0;

    // featuresの型チェックを追加
    if (!features || !Array.isArray(features)) {
        return;
    }

    // カテゴリに応じたマーカーアイコンを作成
    const markerIcon = createMarkerIcon(currentCategoryParam);

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
            const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(mapParam);

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
                setPopupOpeningState(true);
                // ポップアップを開く
                marker.openPopup();
                // フラグを元に戻す（少し遅延させる）
                setTimeout(() => {
                    setPopupOpeningState(false);
                }, 100);
            });

            // マーカーを配列に保存
            markersArray.push(marker);

        } catch (error) {
            console.error('マーカー作成エラー:', error, feature);
        }
    }

    console.log(`${markersArray.length}個のマーカーを表示しました`);
}

// ========================================
// カテゴリ別マーカーアイコンの作成
// ========================================
export function createMarkerIcon(category) {
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