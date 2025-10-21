// ========================================
// ユーティリティ関数
// ========================================

// ========================================
// 通知表示
// ========================================
export function showNotification(message, type = 'info') {
    // 簡易的な通知表示（コンソールログ）
    console.log(`[${type.toUpperCase()}] ${message}`);

    // TODO: より見やすい通知UIを追加する場合はここに実装
}

// ========================================
// ローディング表示の制御
// ========================================
export function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        if (show) {
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }
}

// ========================================
// マーカーのクリア
// ========================================
export function clearMarkers() {
    // グローバル変数markersが必要
    if (typeof markers !== 'undefined') {
        markers.forEach(marker => {
            if (typeof map !== 'undefined' && map.removeLayer) {
                map.removeLayer(marker);
            }
        });
        markers = [];
    }
}

// ========================================
// 現在地マーカーのクリア
// ========================================
export function clearCurrentLocationMarkers() {
    if (window.currentLocationMarkers) {
        window.currentLocationMarkers.forEach(marker => {
            if (typeof map !== 'undefined' && map.removeLayer) {
                map.removeLayer(marker);
            }
        });
        window.currentLocationMarkers = [];
    }
}

// ========================================
// デバッグ用：テストマーカーの追加
// ========================================
export function addTestMarkers() {
    // 宇都宮市内の3箇所にテストマーカーを追加
    const testLocations = [
        { lat: 36.5658, lng: 139.8836, name: 'テスト地点1', description: '宇都宮市中心部' },
        { lat: 36.5558, lng: 139.8936, name: 'テスト地点2', description: '宇都宮市東部' },
        { lat: 36.5758, lng: 139.8736, name: 'テスト地点3', description: '宇都宮市西部' }
    ];

    clearMarkers();

    testLocations.forEach(location => {
        if (typeof L !== 'undefined' && typeof map !== 'undefined') {
            const marker = L.marker([location.lat, location.lng])
                .addTo(map)
                .bindPopup(`
                    <h3>${location.name}</h3>
                    <p>${location.description}</p>
                `);
            if (typeof markers !== 'undefined') {
                markers.push(marker);
            }
        }
    });

    console.log(`${testLocations.length}個のテストマーカーを追加しました`);
}

// ========================================
// 2地点間の距離を計算（単位：メートル）
// ========================================
export function calculateDistance(lat1, lng1, lat2, lng2) {
    // Haversine式で2地点間の距離を計算
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // メートル単位
    return distance;
}

// デバッグ用：コンソールからテストマーカーを追加できるようにする
window.addTestMarkers = addTestMarkers;