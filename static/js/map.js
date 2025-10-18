// ========================================
// グローバル変数
// ========================================
let map;
let markers = [];
let currentCategory = 'aed';

// 福岡SRPセンタービルの中心座標
const DEFAULT_CENTER = {
    lat: 33.590200, // 緯度
    lng: 130.351903, // 経度
    zoom: 16
};

// BODIK API設定
const BODIK_API_SERVER = 'https://wapi.bodik.jp';
const API_CONFIG = {
    aed: { endpoint: 'aed', name: 'AED' },
    hospital: { endpoint: 'hospital', name: '医療機関' },
    freewifi: { endpoint: 'public_wireless_lan', name: '公衆無線LANアクセスポイント' },
    evacuation: { endpoint: 'evacuation_space', name: '指定緊急避難場所' },
    toilet: { endpoint: 'public_toilet', name: '公衆トイレ' }
};

// カテゴリ別のマーカーアイコン色設定
const MARKER_COLORS = {
    aed: '#e74c3c',        // 赤
    hospital: '#3498db',    // 青
    freewifi: '#27ae60',       // 緑
    evacuation: '#f39c12', // オレンジ
    toilet: '#9b59b6'      // 紫
};

// ========================================
// 初期化処理
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initMap();
    setupEventListeners();
    // 初期データは地図の moveend イベントで自動読み込み
});

// ========================================
// 地図の初期化
// ========================================
function initMap() {
    // Leaflet地図の初期化
    map = L.map('map').setView(
        [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        DEFAULT_CENTER.zoom
    );

    // OpenStreetMapタイルレイヤーの追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);

    // 地図の移動・ズーム終了イベント
    map.on('moveend', function () {
        console.log('地図の移動が完了しました');
        loadDataForCurrentCategory();
    });

    // 初回データ読み込み（moveendは初回発火しないため）
    loadDataForCurrentCategory();

    console.log('Leaflet地図を初期化しました');
}

// ========================================
// イベントリスナーの設定
// ========================================
function setupEventListeners() {
    // カテゴリボタンのクリックイベント
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // アクティブ状態の切り替え
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // カテゴリの切り替え
            currentCategory = this.dataset.category;
            console.log(`カテゴリを切り替え: ${currentCategory}`);

            // データの再読み込み
            loadDataForCurrentCategory();
        });
    });

    // 現在地ボタンのクリックイベント
    const currentLocationBtn = document.getElementById('current-location-btn');
    currentLocationBtn.addEventListener('click', function () {
        showCurrentLocation();
    });

    // 更新ボタンのクリックイベント
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', function () {
        refreshData();
    });
}

// ========================================
// 現在地の表示
// ========================================
function showCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('お使いのブラウザは位置情報に対応していません', 'error');
        return;
    }

    showNotification('現在地を取得中...');

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // 地図を現在地に移動
            map.setView([lat, lng], 15);

            // 現在地マーカーを追加
            L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            })
                .addTo(map)
                .bindPopup('<b>現在地</b>')
                .openPopup();

            showNotification('現在地を表示しました', 'success');
        },
        function (error) {
            let errorMessage = '現在地の取得に失敗しました';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '位置情報の使用が許可されていません';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '位置情報が取得できません';
                    break;
                case error.TIMEOUT:
                    errorMessage = '位置情報の取得がタイムアウトしました';
                    break;
            }
            showNotification(errorMessage, 'error');
        }
    );
}

// ========================================
// データの更新
// ========================================
function refreshData() {
    loadDataForCurrentCategory();
}

// ========================================
// BODIK APIからデータ取得
// ========================================
function loadDataForCurrentCategory() {
    const config = API_CONFIG[currentCategory];
    if (!config) {
        console.error(`未対応のカテゴリ: ${currentCategory}`);
        return;
    }

    // ローディング表示
    showLoading(true);
    showNotification(`${config.name}のデータを読み込み中...`);

    // 地図の中心座標を取得
    const center = map.getCenter();
    const lat = center.lat;
    const lon = center.lng;

    // APIのURLを構築
    const distance = 20000; // 検索半径（メートル）
    const maxResults = 100; // 最大取得件数
    const apiUrl = `${BODIK_API_SERVER}/${config.endpoint}?select_type=geometry&lat=${lat}&lon=${lon}&distance=${distance}&maxResults=${maxResults}`;

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
                    displayMarkers(features);
                    showNotification(`${config.name}を${features.length}件表示しました`, 'success');
                } else {
                    console.warn('featuresが見つかりません');
                    clearMarkers();
                    showNotification(`${config.name}のデータが見つかりませんでした`, 'warning');
                }
            } else {
                console.warn('resultsetsが見つかりません', data);
                clearMarkers();
                showNotification(`${config.name}のデータ取得に失敗しました`, 'error');
            }
        })
        .catch(error => {
            console.error('APIエラー:', error);
            clearMarkers();
            showNotification(`${config.name}のデータ取得に失敗しました: ${error.message}`, 'error');
        })
        .finally(() => {
            showLoading(false);
        });
}

// ========================================
// マーカーを地図に表示
// ========================================
function displayMarkers(features) {
    // 既存のマーカーをクリア
    clearMarkers();

    // カテゴリに応じたマーカーアイコンを作成
    const markerIcon = createMarkerIcon(currentCategory);

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
            const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(map);

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

            // マーカーを配列に保存
            markers.push(marker);

        } catch (error) {
            console.error('マーカー作成エラー:', error, feature);
        }
    }

    console.log(`${markers.length}個のマーカーを表示しました`);
}

// ========================================
// カテゴリ別マーカーアイコンの作成
// ========================================
function createMarkerIcon(category) {
    // カテゴリに応じた色を取得（デフォルトは青）
    const color = MARKER_COLORS[category] || '#3498db';

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
// 通知表示
// ========================================
function showNotification(message, type = 'info') {
    // 簡易的な通知表示（コンソールログ）
    console.log(`[${type.toUpperCase()}] ${message}`);

    // TODO: より見やすい通知UIを追加する場合はここに実装
}

// ========================================
// ローディング表示の制御
// ========================================
function showLoading(show) {
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
function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

// ========================================
// デバッグ用：テストマーカーの追加
// ========================================
function addTestMarkers() {
    // 宇都宮市内の3箇所にテストマーカーを追加
    const testLocations = [
        { lat: 36.5658, lng: 139.8836, name: 'テスト地点1', description: '宇都宮市中心部' },
        { lat: 36.5558, lng: 139.8936, name: 'テスト地点2', description: '宇都宮市東部' },
        { lat: 36.5758, lng: 139.8736, name: 'テスト地点3', description: '宇都宮市西部' }
    ];

    clearMarkers();

    testLocations.forEach(location => {
        const marker = L.marker([location.lat, location.lng])
            .addTo(map)
            .bindPopup(`
                <h3>${location.name}</h3>
                <p>${location.description}</p>
            `);
        markers.push(marker);
    });

    console.log(`${testLocations.length}個のテストマーカーを追加しました`);
}

// デバッグ用：コンソールからテストマーカーを追加できるようにする
window.addTestMarkers = addTestMarkers;
