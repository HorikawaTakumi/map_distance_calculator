/**
 * 住所から緯度経度を取得
 * @param {string} address - 住所文字列
 * @returns {Promise<{lat: number, lon: number}>} 緯度経度オブジェクト
 */
async function getLatLon(address) {
    try {
        // 国土地理院APIを先に試す
        const response = await fetch(SEARCH_URL + encodeURIComponent(address));

        if (!response.ok) {
            throw new Error(`HTTP エラー: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            // 国土地理院APIで見つからない場合、GoogleマップAPIをフォールバックとして使用
            if (hasValidApiKey()) {
                console.log('国土地理院APIで見つからないため、GoogleマップAPIを使用します');
                return await getLatLonFromGoogleMaps(address);
            }
            throw new Error(`住所が見つかりませんでした: ${address}`);
        }

        const lat = data[0].geometry.coordinates[1];
        const lon = data[0].geometry.coordinates[0];

        return { lat, lon };
    } catch (error) {
        // 国土地理院APIでエラーが発生した場合も、GoogleマップAPIをフォールバックとして試す
        if (hasValidApiKey() && !error.message.includes('GoogleマップAPI')) {
            console.log('国土地理院APIでエラーが発生したため、GoogleマップAPIを使用します');
            try {
                return await getLatLonFromGoogleMaps(address);
            } catch (googleError) {
                throw new Error(`住所検索エラー (${address}): 国土地理院API: ${error.message}, GoogleマップAPI: ${googleError.message}`);
            }
        }
        throw new Error(`住所検索エラー (${address}): ${error.message}`);
    }
}

/**
 * GoogleマップAPIを使用して住所から緯度経度を取得
 * @param {string} address - 住所文字列
 * @returns {Promise<{lat: number, lon: number}>} 緯度経度オブジェクト
 */
async function getLatLonFromGoogleMaps(address) {
    const apiKey = getApiKey();
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    console.log('GoogleマップAPI呼び出し中:', googleUrl.replace(apiKey, 'HIDDEN'));

    const response = await fetch(googleUrl);

    if (!response.ok) {
        throw new Error(`GoogleマップAPI HTTPエラー: ${response.status}`);
    }

    const data = await response.json();
    console.log('GoogleマップAPIレスポンス:', data);

    if (data.status === 'REQUEST_DENIED') {
        const errorMessage = data.error_message ? data.error_message : 'APIキーが無効、またはGeocoding APIが有効化されていません';
        throw new Error(`APIエラー: ${errorMessage}`);
    }

    if (data.status === 'OVER_DAILY_LIMIT' || data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('API使用制限に達しました');
    }

    if (data.status === 'INVALID_REQUEST') {
        throw new Error('リクエストが無効です');
    }

    if (data.status === 'UNKNOWN_ERROR') {
        throw new Error('サーバーエラーが発生しました。しばらく待ってから再試行してください');
    }

    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
        throw new Error(`住所が見つかりませんでした: ${address}`);
    }

    const location = data.results[0].geometry.location;
    return { lat: location.lat, lon: location.lng };
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