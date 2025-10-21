// ========================================
// 現在地機能
// 位置情報取得と現在地マーカー管理を担当
// ========================================

import { CONFIG } from './config.js';
import { showNotification, showLoading, clearCurrentLocationMarkers } from './utils.js';

// ========================================
// 現在地マーカーの追加
// ========================================
export function addCurrentLocationMarker(lat, lng, map) {
    // 現在地マーカーを追加
    const currentLocationMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            html: '📍',
            className: 'current-location-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    })
        .addTo(map)
        .bindPopup('<b>現在地</b>');

    // マーカーを現在地マーカー配列に保存（重複管理のため）
    if (!window.currentLocationMarkers) {
        window.currentLocationMarkers = [];
    }
    window.currentLocationMarkers.push(currentLocationMarker);

    return currentLocationMarker;
}

// ========================================
// 現在地の表示
// ========================================
export function showCurrentLocation(map) {
    if (!navigator.geolocation) {
        showNotification('お使いのブラウザは位置情報に対応していません', 'error');
        return;
    }

    showNotification('現在地を取得中...');
    showLoading(true); // ローディング表示を開始

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // 地図を現在地に移動
            map.setView([lat, lng], 15);

            // 既存の現在地マーカーをクリア
            clearCurrentLocationMarkers();

            // 現在地マーカーを追加
            const marker = addCurrentLocationMarker(lat, lng, map);
            marker.openPopup(); // 現在地ボタン押下時はポップアップを開く

            showNotification('現在地を表示しました', 'success');
            showLoading(false); // ローディング表示を終了
        },
        function (error) {
            let errorMessage = '現在地の取得に失敗しました';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '位置情報の使用が許可されていません。ブラウザの設定で位置情報へのアクセスを許可してください。';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '位置情報が取得できません。電波状況やGPS設定を確認してください。';
                    break;
                case error.TIMEOUT:
                    errorMessage = '位置情報の取得がタイムアウトしました（5秒以内に応答がありませんでした）。電波状況を確認するか、再度お試しください。';
                    break;
            }
            showNotification(errorMessage, 'error');
            showLoading(false); // ローディング表示を終了
        },
        CONFIG.geolocation
    );
}