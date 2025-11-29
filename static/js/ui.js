// ========================================
// UI制御機能
// ユーザーインターフェースの制御とイベント処理を担当
// ========================================

import { showCurrentLocation } from './location.js';
import { CONFIG } from './config.js';
import { calculateDistance } from './utils.js';
import { getAllFavorites, removeFavorite } from './favorites.js';

// ========================================
// ボタンスタイル設定関数
// ========================================
function setDefaultButtonStyle(button, category) {
    const color = CONFIG.ui.markerColors[category];
    button.style.backgroundColor = '#f5f5f5'; // より薄い灰色
    button.style.color = '#333'; // 暗い文字色
    button.style.border = color ? `2px solid ${color}` : 'none'; // 枠線をピンの色に 
} 

let currentMap = null;  // 現在のマップインスタンスを保存

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
    
    // グローバルマップインスタンスを保存
    currentMap = map;
    window.currentMapInstance = map;
    
    // カテゴリ切り替え用のコールバックを保存
    window.loadDataCallback = loadDataForCurrentCategoryCallback;
    window.currentCategoryRef = currentCategoryRef;

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

            // お気に入りマーカーをクリア
            clearFavoriteMarkers();
            
            // お気に入りメニューを非表示にする
            hideFavoritesMenu();

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

    // お気に入りボタンのクリックイベント
    const favoritesBtn = document.getElementById('favorites-btn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', function () {
            showFavoritesMenu();
        });
    }

    // お気に入いメニュー戻るボタン
    const favoritesBackBtn = document.getElementById('favorites-back-btn');
    if (favoritesBackBtn) {
        favoritesBackBtn.addEventListener('click', function () {
            hideFavoritesMenu();
        });
    }

    // 地図の移動・ズーム終了イベント（データ再読み込み）
    map.on('moveend', function () {
        const currentCenter = map.getCenter();
        const distance = calculateDistance(lastCenter.lat, lastCenter.lng, currentCenter.lat, currentCenter.lng);

        console.log(`地図の移動距離: ${distance.toFixed(0)}m`);

        // 移動距離が閾値を超えた場合のみデータ再読み込み
        if (distance > CONFIG.ui.reloadDistanceThreshold) {
            console.log('移動距離が閾値を超えたため、データを再読み込みします');
            loadDataForCurrentCategoryCallback();
            lastCenter = currentCenter;
        }
    });
}

// ========================================
// データの更新
// ========================================
export function refreshData(loadDataForCurrentCategoryCallback) {
    loadDataForCurrentCategoryCallback();
}

// ========================================
// お気に入いメニュー表示
// ========================================
function showFavoritesMenu() {
    const menuContent = document.getElementById('menu-content');
    const favoritesListContainer = document.getElementById('favorites-list-container');
    
    if (menuContent && favoritesListContainer) {
        menuContent.classList.add('hidden');
        favoritesListContainer.classList.remove('hidden');
        renderFavoritesList();
    }
}

// ========================================
// お気に入いメニュー非表示
// ========================================
function hideFavoritesMenu() {
    const menuContent = document.getElementById('menu-content');
    const favoritesListContainer = document.getElementById('favorites-list-container');
    
    if (menuContent && favoritesListContainer) {
        menuContent.classList.remove('hidden');
        favoritesListContainer.classList.add('hidden');
    }
}

// ========================================
// お気に入いマーカーをクリア
// ========================================
function clearFavoriteMarkers() {
    const map = currentMap || window.currentMapInstance;
    if (!map || !window.favMarkers) {
        return;
    }

    // すべてのお気に入いマーカーを地図から削除
    window.favMarkers.forEach(marker => {
        if (marker) {
            map.removeLayer(marker);
        }
    });
    window.favMarkers.length = 0;
    console.log('お気に入いマーカーをクリアしました');
}

// ========================================
// お気に入いリストを描画
// ========================================
function renderFavoritesList() {
    const favorites = getAllFavorites();
    const favoritesList = document.getElementById('favorites-list');
    
    if (!favoritesList) {
        return;
    }

    // リストをクリア
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="favorites-empty">お気に入りはまだ登録されていません</div>';
        return;
    }

    // カテゴリ名マップ
    const categoryNames = {
        aed: 'AED',
        hospital: '医療機関',
        freewifi: '公衆無線LAN',
        evacuation: '指定緊急避難場所',
        toilet: '公衆トイレ'
    };

    // お気に入いアイテムを作成
    favorites.forEach(favorite => {
        const item = document.createElement('div');
        item.className = 'favorites-item';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'favorites-item-name';
        nameDiv.textContent = favorite.name;

        const addressDiv = document.createElement('div');
        addressDiv.className = 'favorites-item-address';
        addressDiv.textContent = favorite.address || 'アドレスなし';

        const categorySpan = document.createElement('span');
        categorySpan.className = 'favorites-item-category';
        categorySpan.textContent = categoryNames[favorite.category] || favorite.category;

        item.appendChild(nameDiv);
        item.appendChild(addressDiv);
        item.appendChild(categorySpan);

        // クリック時にその地点に地図を移動
        item.addEventListener('click', function () {
            console.log('お気に入いアイテムをクリック:', favorite.name, favorite.lat, favorite.lon);
            console.log('カテゴリ:', favorite.category);
            
            const map = currentMap || window.currentMapInstance;
            
            if (map) {
                // 選択したピンのカテゴリに切り替え
                if (window.currentCategoryRef && window.currentCategoryRef.current !== favorite.category) {
                    window.currentCategoryRef.current = favorite.category;
                    console.log(`カテゴリを切り替え: ${favorite.category}`);
                    
                    // カテゴリボタンのスタイルを更新
                    const categoryButtons = document.querySelectorAll('.category-btn');
                    categoryButtons.forEach(btn => {
                        const cat = btn.dataset.category;
                        setDefaultButtonStyle(btn, cat);
                        btn.classList.remove('active');
                    });
                    
                    const activeButton = document.querySelector(`.category-btn[data-category="${favorite.category}"]`);
                    if (activeButton) {
                        activeButton.classList.add('active');
                        setActiveButtonStyle(activeButton, favorite.category);
                    }
                }
                
                // 選択したカテゴリのデータを読み込む
                if (window.loadDataCallback) {
                    window.loadDataCallback();
                }
                
                // お気に入りマーカーを表示
                displayFavoritesOnMap([favorite]);
                
                // ポップアップが表示された後、ピンが画面中央になるように移動
                setTimeout(() => {
                    // ポップアップの高さ分を考慮してオフセット
                    const popupHeight = 250; // ポップアップの推定高さ
                    const panAmount = popupHeight / 2;
                    map.setView([favorite.lat, favorite.lon], 16);
                    map.panBy([0, panAmount], { animate: false });
                }, 150);
                
                console.log('地図を移動しました');
                
                hideFavoritesMenu();
                // メニューを閉じる
                const sideMenu = document.getElementById('side-menu');
                if (sideMenu) {
                    sideMenu.classList.remove('open');
                }
            } else {
                console.error('マップインスタンスが見つかりません');
            }
        });

        favoritesList.appendChild(item);
    });
}

// ========================================
// お気に入い表示モードの切り替え
// ========================================
let isFavoritesMode = false;

// グローバルお気に入いマーカー配列を初期化
if (!window.favMarkers) {
    window.favMarkers = [];
}

export function toggleFavoritesMode(button, loadDataForCurrentCategoryCallback) {
    isFavoritesMode = !isFavoritesMode;

    if (isFavoritesMode) {
        button.style.backgroundColor = '#ff1744';
        button.style.color = '#fff';
        button.textContent = '❤️ お気に入りを表示中';
        console.log('お気に入り表示モード: ON');
        displayFavorites();
    } else {
        button.style.backgroundColor = '#f5f5f5';
        button.style.color = '#333';
        button.textContent = '❤️ お気に入り';
        console.log('お気に入り表示モード: OFF');
        loadDataForCurrentCategoryCallback();
    }
}

// ========================================
// お気に入りを地図に表示
// ========================================
function displayFavoritesOnMap(favorites) {
    const map = currentMap || window.currentMapInstance;
    console.log('displayFavoritesOnMap - マップ:', map);
    if (!map) {
        console.error('マップインスタンスが見つかりません');
        return;
    }

    // 既存のお気に入いマーカーをクリア
    if (window.favMarkers) {
        window.favMarkers.forEach(marker => {
            map.removeLayer(marker);
        });
        window.favMarkers.length = 0;
    } else {
        window.favMarkers = [];
    }

    // お気に入いをFeatureCollection形式に変換
    const features = favorites.map(fav => ({
        type: 'Feature',
        properties: {
            resource_id: fav.resource_id,
            category: fav.category,
            name: fav.name,
            address: fav.address,
            telephoneNumber: fav.telephoneNumber,
            openingHoursRemarks: fav.openingHoursRemarks,
            note: fav.note
        },
        geometry: {
            type: 'Point',
            coordinates: [fav.lon, fav.lat]
        }
    }));

    // displayFavoritesMarkersをインポートして使用
    import('./markers.js').then(module => {
        console.log('markers.jsをインポートしました');
        module.displayFavoritesMarkers(features, window.favMarkers, map);
        
        // マーカーを表示した後、吹き出しを開く
        if (window.favMarkers.length > 0) {
            const marker = window.favMarkers[0];
            // 少し遅延させて、マーカーが完全に描画された後に吹き出しを開く
            setTimeout(() => {
                if (marker && map) {
                    marker.openPopup();
                    console.log('吹き出しを開きました');
                }
            }, 100);
        }
    }).catch(err => {
        console.error('markers.jsのインポートに失敗:', err);
    });
}