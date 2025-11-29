// ========================================
// お気に入り管理機能
// localStorageを使用してお気に入りを管理
// ========================================

const STORAGE_KEY = 'udc2025_favorites';
const MAX_FAVORITES = 100;

// ========================================
// 初期化：localStorageからお気に入りを読み込む
// ========================================
export function initFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('お気に入りの読み込みエラー:', error);
        return [];
    }
}

// ========================================
// お気に入りをlocalStorageに保存
// ========================================
function saveFavorites(favorites) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        return true;
    } catch (error) {
        console.error('お気に入りの保存エラー:', error);
        return false;
    }
}

// ========================================
// お気に入りに追加
// ========================================
export function addFavorite(favorite) {
    const favorites = initFavorites();

    // 既に登録済みかチェック
    if (isFavorite(favorite.resource_id)) {
        console.warn(`既に登録済みです: ${favorite.resource_id}`);
        return false;
    }

    // 最大数に達している場合はエラー
    if (favorites.length >= MAX_FAVORITES) {
        console.error(`お気に入りは最大${MAX_FAVORITES}件までです`);
        return false;
    }

    // 新しいお気に入りオブジェクトを作成
    const newFavorite = {
        resource_id: favorite.resource_id,
        category: favorite.category,
        name: favorite.name,
        lat: favorite.lat,
        lon: favorite.lon,
        address: favorite.address,
        telephoneNumber: favorite.telephoneNumber,
        openingHoursRemarks: favorite.openingHoursRemarks,
        note: favorite.note,
        addedAt: new Date().toISOString()
    };

    favorites.push(newFavorite);
    return saveFavorites(favorites);
}

// ========================================
// お気に入りから削除
// ========================================
export function removeFavorite(resourceId) {
    const favorites = initFavorites();
    const filtered = favorites.filter(fav => fav.resource_id !== resourceId);

    if (filtered.length === favorites.length) {
        console.warn(`見つかりません: ${resourceId}`);
        return false;
    }

    return saveFavorites(filtered);
}

// ========================================
// お気に入りか判定
// ========================================
export function isFavorite(resourceId) {
    const favorites = initFavorites();
    return favorites.some(fav => fav.resource_id === resourceId);
}

// ========================================
// すべてのお気に入りを取得
// ========================================
export function getAllFavorites() {
    return initFavorites();
}

// ========================================
// カテゴリ別にお気に入りをフィルタ
// ========================================
export function getFavoritesByCategory(category) {
    const favorites = initFavorites();
    return favorites.filter(fav => fav.category === category);
}

// ========================================
// お気に入りをクリア（全削除）
// ========================================
export function clearAllFavorites() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('お気に入りクリアエラー:', error);
        return false;
    }
}

// ========================================
// お気に入りの件数を取得
// ========================================
export function getFavoritesCount() {
    return initFavorites().length;
}

// ========================================
// お気に入りをJSONエクスポート
// ========================================
export function exportFavoritesAsJSON() {
    const favorites = initFavorites();
    return JSON.stringify(favorites, null, 2);
}

// ========================================
// JSONからお気に入りをインポート
// ========================================
export function importFavoritesFromJSON(jsonString) {
    try {
        const imported = JSON.parse(jsonString);
        if (!Array.isArray(imported)) {
            console.error('無効なJSON形式です');
            return false;
        }

        // バリデーション：必須フィールドをチェック
        const valid = imported.every(fav =>
            fav.resource_id && fav.category && fav.name && fav.lat && fav.lon
        );

        if (!valid) {
            console.error('必須フィールドが不足しています');
            return false;
        }

        return saveFavorites(imported);
    } catch (error) {
        console.error('インポートエラー:', error);
        return false;
    }
}
