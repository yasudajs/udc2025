// ========================================
// 地図コア機能
// 地図の初期化と基本的なレイヤー設定を担当
// ========================================

import { CONFIG } from './config.js';
import { calculateDistance } from './utils.js';

// ========================================
// グローバル変数（地図コア用）
// ========================================
export let map;
let lastLoadedCenter = null; // 最後にデータを読み込んだ時の中心座標
let isPopupOpening = false; // ポップアップ表示中かどうか

// ========================================
// 地図の初期化
// ========================================
export function initMap(addCurrentLocationMarker, loadDataForCurrentCategory) {
    // 位置情報取得を試みるPromise
    const getLocationPromise = new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            CONFIG.geolocation
        );
    });

    // 位置情報取得を試みて地図を初期化
    getLocationPromise
        .then((position) => {
            // 位置情報取得成功: 現在地で地図を初期化
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map = L.map('map').setView([lat, lng], 15);

            // 現在地マーカーを追加し、ポップアップを開く
            const marker = addCurrentLocationMarker(lat, lng);
            marker.openPopup(); // 初期表示時はポップアップを開く

            console.log('位置情報取得成功、現在地で地図を初期化しました');
        })
        .catch((error) => {
            // 位置情報取得失敗: デフォルト位置で地図を初期化
            console.log('位置情報取得失敗、デフォルト位置で地図を初期化しました:', error.message);
            map = L.map('map').setView(
                [CONFIG.map.defaultCenter.lat, CONFIG.map.defaultCenter.lng],
                CONFIG.map.defaultCenter.zoom
            );
        })
        .finally(() => {
            // 共通の地図設定
            setupMapLayers(loadDataForCurrentCategory);
        });
}

// ========================================
// 地図レイヤーとイベントの設定
// ========================================
export function setupMapLayers(loadDataForCurrentCategory) {
    // OpenStreetMapタイルレイヤーの追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);

    // 地図の移動・ズーム終了イベント
    map.on('moveend', function () {
        console.log('地図の移動が完了しました');

        // ポップアップ表示による移動の場合はスキップ
        if (isPopupOpening) {
            console.log('ポップアップ表示による移動のためデータ再読み込みをスキップ');
            isPopupOpening = false;
            return;
        }

        // 地図の中心座標を取得
        const currentCenter = map.getCenter();

        // 前回のデータ読み込み位置と比較
        if (lastLoadedCenter) {
            const distance = calculateDistance(
                lastLoadedCenter.lat, lastLoadedCenter.lng,
                currentCenter.lat, currentCenter.lng
            );

            // 移動距離が2000m未満の場合はデータ再読み込みをスキップ
            if (distance < 2000) {
                console.log(`移動距離が小さいため再読み込みスキップ (${Math.round(distance)}m)`);
                return;
            }
        }

        loadDataForCurrentCategory();
    });

    // 初回データ読み込み（位置情報取得後に実行）
    loadDataForCurrentCategory();

    console.log('Leaflet地図のレイヤーとイベントを設定しました');
}

// ========================================
// ポップアップ状態の設定
// ========================================
export function setPopupOpeningState(state) {
    isPopupOpening = state;
}