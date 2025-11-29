// ========================================
// お気に入り管理機能
// localStorageを使用してお気に入りを管理
// ========================================

const STORAGE_KEY = 'udc2025_favorites';
const MAX_FAVORITES = 100;

// ========================================
// 内部ユーティリティ関数
// ========================================

function toNumberOrNull(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function normalizeCoordinate(value) {
    const num = toNumberOrNull(value);
    return num === null ? 'na' : num.toFixed(8);
}

function createFavoriteKey(resourceId, category, lat, lon) {
    const idPart = resourceId !== undefined && resourceId !== null && resourceId !== ''
        ? String(resourceId).trim()
        : 'noid';
    const categoryPart = category ? String(category).trim() : 'nocat';
    const latPart = normalizeCoordinate(lat);
    const lonPart = normalizeCoordinate(lon);
    return `${categoryPart}::${idPart}::${latPart}::${lonPart}`;
}

function migrateFavorites(favorites) {
    let changed = false;
    const migrated = favorites.map(fav => {
        if (!fav || typeof fav !== 'object') {
            changed = true;
            return null;
        }

        const lat = toNumberOrNull(fav.lat);
        const lon = toNumberOrNull(fav.lon);
        const category = fav.category;
        const originalId = fav.original_resource_id ?? fav.resource_id;
        const normalizedKey = createFavoriteKey(originalId, category, lat, lon);

        if (fav.resource_id !== normalizedKey || lat !== fav.lat || lon !== fav.lon || !fav.original_resource_id) {
            changed = true;
            return {
                ...fav,
                resource_id: normalizedKey,
                original_resource_id: originalId,
                lat,
                lon
            };
        }

        return {
            ...fav,
            lat,
            lon
        };
    }).filter(Boolean);

    return { migrated, changed };
}

function getFavoritesInternal() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
        return [];
    }

    const { migrated, changed } = migrateFavorites(parsed);
    if (changed) {
        saveFavorites(migrated);
    }
    return migrated;
}

// ========================================
// 初期化：localStorageからお気に入りを読み込む
// ========================================
export function initFavorites() {
    try {
        return getFavoritesInternal();
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
    const lat = toNumberOrNull(favorite.lat);
    const lon = toNumberOrNull(favorite.lon);
    const category = favorite.category;
    const baseResourceId = favorite.original_resource_id ?? favorite.resource_id;
    const favoriteKey = createFavoriteKey(baseResourceId, category, lat, lon);

    // 既に登録済みかチェック
    if (isFavorite(baseResourceId, category, lat, lon, favorites)) {
        console.warn(`既に登録済みです: ${baseResourceId}`);
        return false;
    }

    // 最大数に達している場合はエラー
    if (favorites.length >= MAX_FAVORITES) {
        console.error(`お気に入りは最大${MAX_FAVORITES}件までです`);
        return false;
    }

    // 新しいお気に入りオブジェクトを作成
    const newFavorite = {
        resource_id: favoriteKey,
        original_resource_id: baseResourceId ?? null,
        category,
        name: favorite.name,
        lat,
        lon,
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
export function removeFavorite(resourceId, options = {}) {
    const favorites = initFavorites();
    const lat = options.lat !== undefined ? toNumberOrNull(options.lat) : undefined;
    const lon = options.lon !== undefined ? toNumberOrNull(options.lon) : undefined;
    const category = options.category;
    const originalResourceId = options.originalResourceId ?? resourceId;

    const normalizedKey = createFavoriteKey(originalResourceId, category, lat, lon);

    const filtered = favorites.filter(fav => {
        const favKey = createFavoriteKey(fav.original_resource_id ?? fav.resource_id, fav.category, fav.lat, fav.lon);

        if (favKey === normalizedKey) {
            return false;
        }

        if (!fav.original_resource_id && !String(fav.resource_id).includes('::')) {
            return String(fav.resource_id) !== String(resourceId);
        }

        return true;
    });

    if (filtered.length === favorites.length) {
        console.warn(`見つかりません: ${resourceId}`);
        return false;
    }

    return saveFavorites(filtered);
}

// ========================================
// お気に入りか判定
// ========================================
export function isFavorite(resourceId, category, lat, lon, favoritesCache) {
    const favorites = favoritesCache ?? initFavorites();
    const normalizedKey = createFavoriteKey(resourceId, category, toNumberOrNull(lat), toNumberOrNull(lon));

    return favorites.some(fav => {
        const favKey = createFavoriteKey(fav.original_resource_id ?? fav.resource_id, fav.category, fav.lat, fav.lon);
        if (favKey === normalizedKey) {
            return true;
        }

        if (!fav.original_resource_id && !String(fav.resource_id).includes('::')) {
            return String(fav.resource_id) === String(resourceId);
        }

        return false;
    });
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
