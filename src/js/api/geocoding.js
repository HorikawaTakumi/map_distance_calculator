/**
 * 住所から緯度経度を取得
 * @param {string} address - 住所文字列
 * @returns {Promise<{lat: number, lon: number}>} 緯度経度オブジェクト
 */
async function getLatLon(address) {
    try {
        const response = await fetch(SEARCH_URL + encodeURIComponent(address));

        if (!response.ok) {
            throw new Error(`HTTP エラー: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error(`住所が見つかりませんでした: ${address}`);
        }

        const lat = data[0].geometry.coordinates[1];
        const lon = data[0].geometry.coordinates[0];

        return { lat, lon };
    } catch (error) {
        throw new Error(`住所検索エラー (${address}): ${error.message}`);
    }
}

/**
 * 緯度経度から住所を取得
 * @param {number} lat - 緯度
 * @param {number} lon - 経度
 * @returns {Promise<Object>} 住所情報
 */
async function getAddress(lat, lon) {
    const url = REVERSE_URL.replace('%s', lon).replace('%s', lat);
    const response = await fetch(url);
    return await response.json();
}