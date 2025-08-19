/**
 * 2つの住所間の距離を計算
 * @param {string} address1 - 住所1
 * @param {string} address2 - 住所2
 * @returns {Promise<Object>} 距離計算結果
 */
async function getDistance(address1, address2) {
    try {
        console.log(`住所1を検索中: ${address1}`);
        const coords1 = await getLatLon(address1);
        console.log(`住所1の座標: (${coords1.lat}, ${coords1.lon})`);

        console.log(`住所2を検索中: ${address2}`);
        const coords2 = await getLatLon(address2);
        console.log(`住所2の座標: (${coords2.lat}, ${coords2.lon})`);

        // 距離計算（優先順位: Google Maps API > 国土地理院API > Haversine公式）
        let distance;
        let calculationMethod;

        try {
            // 1. Google Maps APIのGeometry Libraryを使用（最優先）
            if (window.google && google.maps && google.maps.geometry) {
                const point1 = new google.maps.LatLng(coords1.lat, coords1.lon);
                const point2 = new google.maps.LatLng(coords2.lat, coords2.lon);
                const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
                distance = distanceInMeters / 1000; // km単位に変換
                calculationMethod = 'Google Maps API';
                console.log('Google Maps APIで距離を計算しました');
            } else {
                throw new Error('Google Maps Geometry Libraryが利用できません');
            }
        } catch (googleApiError) {
            console.warn('Google Maps APIが使用できません:', googleApiError.message);
            try {
                // 2. 国土地理院APIを使用（次の優先）
                const url = LEN_URL
                    .replace('%s', coords1.lat)
                    .replace('%s', coords1.lon)
                    .replace('%s', coords2.lat)
                    .replace('%s', coords2.lon);

                const response = await fetch(url);
                const data = await response.json();
                distance = parseFloat(data.OutputData.geoLength);
                calculationMethod = '国土地理院API';
                console.log('国土地理院APIで距離を計算しました');
            } catch (gsiApiError) {
                // 3. Haversine公式で計算（フォールバック）
                console.warn('国土地理院APIが使用できません。Haversine公式で計算します。');
                distance = calculateHaversineDistance(coords1.lat, coords1.lon, coords2.lat, coords2.lon);
                calculationMethod = 'Haversine公式';
                console.log('Haversine公式で距離を計算しました');
            }
        }

        return {
            address1: address1,
            address2: address2,
            coordinates1: coords1,
            coordinates2: coords2,
            distance_km: Math.round(distance * 1000) / 1000,
            distance_m: Math.round(distance * 1000 * 10) / 10,
            calculationMethod: calculationMethod
        };
    } catch (error) {
        throw new Error(`距離計算エラー: ${error.message}`);
    }
}