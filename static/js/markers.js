// ========================================
// マーカー管理機能
// 地図上のマーカー表示と管理を担当
// ========================================

import { CONFIG } from './config.js';
import { setPopupOpeningState } from './map-core.js';
import { addFavorite, removeFavorite, isFavorite } from './favorites.js';

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
            const resourceId = properties['resource_id'];
            const buttonId = `fav-${currentCategoryParam}-${lat.toFixed(8)}-${lon.toFixed(8)}`.replace(/[^a-zA-Z0-9_-]/g, '_');

            // マーカーを作成（カスタムアイコンを使用）
            const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(mapParam);

            // ポップアップ用のカスタムクラスを持つDIVを作成
            const popupDiv = document.createElement('div');
            popupDiv.className = 'popup-content';

            // ポップアップ内容を作成
            let popupHTML = `<h3>${properties['name'] || 'データ未登録'}</h3>`;
            popupHTML += `<p>📍 ${properties['address'] || 'データ未登録'}</p>`;
            popupHTML += `<p>📞 ${properties['telephoneNumber'] || 'データ未登録'}</p>`;
            popupHTML += `<p>⏰ ${properties['openingHoursRemarks'] || 'データ未登録'}</p>`;

            // その他の情報があれば追加
            if (properties['note']) {
                popupHTML += `<p>${properties['note']}</p>`;
            }

            // Googleマップで経路案内を開くリンクを追加
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
            popupHTML += `<p><a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #4285f4; text-decoration: none; font-weight: bold;">🗺️ ここへ行く</a></p>`;

            // お気に入りボタンを追加
            const isFav = isFavorite(resourceId, currentCategoryParam, lat, lon);
            const favButtonClass = isFav ? 'favorite-btn favorite-active' : 'favorite-btn';
            const favButtonText = isFav ? '★ お気に入り済み' : '☆ お気に入りに追加';
            const favButtonBgColor = isFav ? '#ffe082' : '#f5f5f5';
            const favButtonTextColor = isFav ? '#ff6f00' : '#333';
            
            popupHTML += `<p><button id="${buttonId}" class="${favButtonClass}" style="cursor: pointer; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: ${favButtonBgColor}; color: ${favButtonTextColor}; font-weight: bold; width: 100%;">${favButtonText}</button></p>`;

            popupDiv.innerHTML = popupHTML;

            // ポップアップを設定
            const popup = L.popup().setContent(popupDiv);
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

            // ポップアップが表示されたときのイベント
            marker.on('popupopen', function () {
                // ポップアップコンテナ内のボタンのみを対象
                const popupContainer = marker.getPopup().getElement();
                if (popupContainer) {
                    // 正確に該当するボタンを取得（IDで完全一致）
                    const favButton = popupContainer.querySelector(`#${buttonId}`);
                    if (favButton) {
                        console.log('お気に入いボタンを見つけました:', resourceId);
                        
                        // ポップアップ表示時に最新のお気に入い状態を反映
                        const currentIsFav = isFavorite(resourceId, currentCategoryParam, lat, lon);
                        console.log(`${resourceId}のお気に入い状態:`, currentIsFav);
                        
                        if (currentIsFav) {
                            favButton.textContent = '★ お気に入り済み';
                            favButton.style.backgroundColor = '#ffe082';
                            favButton.style.color = '#ff6f00';
                            favButton.style.borderColor = '#ff6f00';
                            favButton.classList.add('favorite-active');
                        } else {
                            favButton.textContent = '☆ お気に入りに追加';
                            favButton.style.backgroundColor = '#f5f5f5';
                            favButton.style.color = '#333';
                            favButton.style.borderColor = '#ccc';
                            favButton.classList.remove('favorite-active');
                        }
                        
                        // 既存のイベントリスナーをクリア（重複登録を防止）
                        // addEventListener は複数登録されるため、まず親要素を置き換え
                        const newButton = favButton.cloneNode(true);
                        favButton.parentNode.replaceChild(newButton, favButton);
                        
                        // 新しいイベントリスナーを追加
                        newButton.addEventListener('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('お気に入いボタンがクリックされました:', resourceId, 'ボタン:', newButton);
                            handleFavoriteButtonClick(
                                resourceId,
                                currentCategoryParam,
                                properties,
                                lat,
                                lon,
                                newButton
                            );
                        });
                    } else {
                        console.warn('お気に入いボタンが見つかりません:', buttonId);
                    }
                }
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
// お気に入いマーカーを地図に表示
// ========================================
export function displayFavoritesMarkers(features, markersArray, mapParam) {
    // featuresの型チェック
    if (!features || !Array.isArray(features)) {
        return;
    }

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
            const lat = coordinates[1];
            const lon = coordinates[0];
            const resourceId = properties['resource_id'];
            const category = properties['category'] || 'aed';  // デフォルトはaed

            // カテゴリに応じたマーカーアイコンを作成
            const markerIcon = createMarkerIcon(category);

            // マーカーを作成
            const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(mapParam);

            // ポップアップ用のDIVを作成
            const popupDiv = document.createElement('div');
            popupDiv.className = 'popup-content favorite-marker';

            // ポップアップ内容を作成
            let popupHTML = `<h3>${properties['name'] || 'データ未登録'}</h3>`;
            popupHTML += `<p>📍 ${properties['address'] || 'データ未登録'}</p>`;
            popupHTML += `<p>📞 ${properties['telephoneNumber'] || 'データ未登録'}</p>`;
            popupHTML += `<p>⏰ ${properties['openingHoursRemarks'] || 'データ未登録'}</p>`;

            if (properties['note']) {
                popupHTML += `<p>${properties['note']}</p>`;
            }

            // Googleマップリンク
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
            popupHTML += `<p><a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #4285f4; text-decoration: none; font-weight: bold;">🗺️ ここへ行く</a></p>`;

            // お気に入り削除ボタン
            popupHTML += `<p><button id="remove-fav-${resourceId}" class="remove-fav-btn" style="cursor: pointer; padding: 8px 12px; border: 1px solid #f44336; border-radius: 4px; background-color: #ffebee; color: #f44336; font-weight: bold; width: 100%;">❌ お気に入りから削除</button></p>`;

            popupDiv.innerHTML = popupHTML;

            // ポップアップを設定
            const popup = L.popup().setContent(popupDiv);
            marker.bindPopup(popup);

            // マーカークリック時のイベント
            marker.on('click', function () {
                setPopupOpeningState(true);
                marker.openPopup();
                setTimeout(() => {
                    setPopupOpeningState(false);
                }, 100);
            });

            // ポップアップが表示されたときのイベント
            marker.on('popupopen', function () {
                const popupContainer = marker.getPopup().getElement();
                if (popupContainer) {
                    const removeBtn = popupContainer.querySelector('button[id^="remove-fav-"]');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm('このお気に入いを削除しますか？')) {
                                removeFavorite(resourceId, {
                                    category,
                                    lat,
                                    lon,
                                    originalResourceId: properties['original_resource_id']
                                });
                                mapParam.removeLayer(marker);
                                const index = markersArray.indexOf(marker);
                                if (index > -1) {
                                    markersArray.splice(index, 1);
                                }
                                console.log(`お気に入いから削除: ${properties['name']}`);
                            }
                        });
                    }
                }
            });

            // マーカーを配列に保存
            markersArray.push(marker);

        } catch (error) {
            console.error('マーカー作成エラー:', error, feature);
        }
    }

    console.log(`${markersArray.length}個のお気に入いマーカーを表示しました`);
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

// ========================================
// お気に入りボタンのクリックハンドラ
// ========================================
function handleFavoriteButtonClick(resourceId, category, properties, lat, lon, button) {
    console.log('お気に入いボタンクリック:', resourceId);
    console.log('ボタン要素:', button);
    console.log('ボタンID:', button.id);

    const isFav = isFavorite(resourceId, category, lat, lon);

    if (isFav) {
        // お気に入りから削除
        if (removeFavorite(resourceId, { category, lat, lon })) {
            button.classList.remove('favorite-active');
            button.textContent = '☆ お気に入りに追加';
            button.style.backgroundColor = '#f5f5f5';
            button.style.color = '#333';
            button.style.borderColor = '#ccc';
            console.log(`お気に入りから削除: ${properties['name']}`);
        }
    } else {
        // お気に入りに追加
        const favorite = {
            resource_id: resourceId,
            category: category,
            name: properties['name'],
            lat: lat,
            lon: lon,
            address: properties['address'],
            telephoneNumber: properties['telephoneNumber'],
            openingHoursRemarks: properties['openingHoursRemarks'],
            note: properties['note']
        };

        if (addFavorite(favorite)) {
            button.classList.add('favorite-active');
            button.textContent = '★ お気に入り済み';
            button.style.backgroundColor = '#ffe082';
            button.style.color = '#ff6f00';
            button.style.borderColor = '#ff6f00';
            console.log(`お気に入りに追加: ${properties['name']}`);
        } else {
            console.error('お気に入りの追加に失敗しました');
        }
    }
}