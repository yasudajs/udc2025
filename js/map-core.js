// ========================================
// 地図コア機能
// 地図の初期化と基本的なレイヤー設定を担当
// ========================================

import { CONFIG } from './config.js';
import { addCurrentLocationMarker } from './location.js';

// ========================================
// グローバル変数（地図コア用）
// ========================================
export let map;
let lastLoadedCenter = null; // 最後にデータを読み込んだ時の中心座標
let isPopupOpening = false; // ポップアップ表示中かどうか

// ========================================
// 地図の初期化
// ========================================
export function initMap() {
    // 既存の地図インスタンスを破棄
    if (map) {
        map.remove();
        map = null;
    }

    // 地図コンテナをクリア
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = '';
    }

    // まずデフォルト位置で地図を初期化
    map = L.map('map').setView(
        [CONFIG.map.defaultCenter.lat, CONFIG.map.defaultCenter.lng],
        CONFIG.map.defaultCenter.zoom
    );

    // 「現在地を取得中です。」のポップアップを表示（loading表示に似せたスタイル）
    const loadingContent = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            text-align: center;
            min-width: 200px;
        ">
            <div style="
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            "></div>
            <p style="margin: 0; font-weight: bold;">現在地を取得中です。</p>
        </div>
    `;

    const loadingPopup = L.popup({
        closeButton: false,
        autoClose: false,
        className: 'loading-popup'
    })
        .setLatLng([CONFIG.map.defaultCenter.lat, CONFIG.map.defaultCenter.lng])
        .setContent(loadingContent)
        .openOn(map);

    // 位置情報取得を試みる（タイムアウト付き）
    const getLocationWithTimeout = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error('Geolocation timeout'));
            }, CONFIG.geolocation.timeout);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    resolve(position);
                },
                (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                },
                CONFIG.geolocation
            );
        });
    };

    // 位置情報取得を試みて地図を初期化
    getLocationWithTimeout()
        .then((position) => {
            // 成功: ポップアップを閉じて現在地に移動
            map.closePopup(loadingPopup);
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);

            // 現在地マーカーを追加
            const marker = addCurrentLocationMarker(lat, lng, map);
            marker.openPopup();
            console.log('位置情報取得成功、現在地で地図を初期化しました');
        })
        .catch((error) => {
            // 失敗: ポップアップを閉じてデフォルト位置を維持、エラーメッセージを表示
            map.closePopup(loadingPopup);

            const errorContent = `
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    text-align: center;
                    min-width: 200px;
                    color: #e74c3c;
                ">
                    <p style="margin: 0; font-weight: bold;">位置情報が取得できなかったので、デフォルトの位置で表示します。</p>
                </div>
            `;

            const errorPopup = L.popup({
                closeButton: false,
                autoClose: false,
                className: 'error-popup'
            })
                .setLatLng([CONFIG.map.defaultCenter.lat, CONFIG.map.defaultCenter.lng])
                .setContent(errorContent)
                .openOn(map);

            // 3秒後にエラーポップアップを閉じる
            setTimeout(() => {
                map.closePopup(errorPopup);
            }, 3000);

            console.log('位置情報取得失敗、デフォルト位置で地図を初期化しました:', error.message);
        })
        .finally(() => {
            // 共通の地図設定
            setupMapLayers();
        });
}

// ========================================
// 地図レイヤーとイベントの設定
// ========================================
export function setupMapLayers() {
    // mapオブジェクトの存在チェック
    if (!map) {
        console.error('地図が初期化されていません');
        return;
    }

    // OpenStreetMapタイルレイヤーの追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);

    console.log('Leaflet地図のレイヤーを設定しました');
}

// ========================================
// ポップアップ状態の設定
// ========================================
export function setPopupOpeningState(state) {
    isPopupOpening = state;
}