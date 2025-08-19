/**
 * Haversine公式を使用した距離計算（APIが使えない場合の代替）
 * @param {number} lat1 - 緯度1
 * @param {number} lon1 - 経度1
 * @param {number} lat2 - 緯度2
 * @param {number} lon2 - 経度2
 * @returns {number} 距離（km）
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径（km）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}