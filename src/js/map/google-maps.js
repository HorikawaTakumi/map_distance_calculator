// Google Maps関連のグローバル変数
let map;
let markers = [];
let circle;
let baseCoords = null;
let targetCoords = null;
let currentRadius = 3; // デフォルト半径

/**
 * Google Mapsを初期化
 */
function initMap() {
    const defaultCenter = { lat: 35.6762, lng: 139.6503 }; // 東京駅

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultCenter,
        mapId: 'DEMO_MAP_ID'
    });

    // APIキー管理ボタンを表示
    updateApiKeyManagementVisibility();

    // 初期住所（起点）の座標を取得して表示
    const baseAddress = document.getElementById('address1').value.trim();
    if (baseAddress) {
        getLatLon(baseAddress).then(coords => {
            baseCoords = coords;
            updateMap();
        }).catch(error => {
            console.warn('初期住所の座標取得に失敗:', error);
        });
    }
}

/**
 * 地図を更新（マーカーと円を描画）
 */
function updateMap() {
    // 既存のマーカーと円をクリア
    clearMapElements();

    if (baseCoords) {
        // 起点のマーカーを追加
        const baseMarker = new google.maps.Marker({
            position: { lat: baseCoords.lat, lng: baseCoords.lon },
            map: map,
            title: '起点（中心地点）',
            icon: createMarkerIcon('#4285F4')
        });
        markers.push(baseMarker);

        // 起点から指定半径の円を描画
        circle = new google.maps.Circle({
            strokeColor: '#FF6B6B',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF6B6B',
            fillOpacity: 0.15,
            map: map,
            center: { lat: baseCoords.lat, lng: baseCoords.lon },
            radius: currentRadius * 1000 // kmをmに変換
        });

        // 地図の中心を起点に設定
        map.setCenter({ lat: baseCoords.lat, lng: baseCoords.lon });
        map.setZoom(13);
    }

    if (targetCoords) {
        // 目的地のマーカーを追加
        const targetMarker = new google.maps.Marker({
            position: { lat: targetCoords.lat, lng: targetCoords.lon },
            map: map,
            title: '目的地',
            icon: createMarkerIcon('#34A853')
        });
        markers.push(targetMarker);

        // 両方の点が表示されるよう地図の範囲を調整
        if (baseCoords) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(baseCoords.lat, baseCoords.lon));
            bounds.extend(new google.maps.LatLng(targetCoords.lat, targetCoords.lon));
            map.fitBounds(bounds);

            // ズームレベルが高すぎる場合は調整
            const listener = google.maps.event.addListener(map, 'idle', function () {
                if (map.getZoom() > 15) map.setZoom(15);
                google.maps.event.removeListener(listener);
            });
        }
    }
}

/**
 * マーカーアイコンを作成
 */
function createMarkerIcon(color) {
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="40" viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 28 12 28s12-19 12-28c0-6.6-5.4-12-12-12z" fill="${color}"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>
        `),
        scaledSize: new google.maps.Size(24, 40),
        anchor: new google.maps.Point(12, 40)
    };
}

/**
 * 地図上の要素をクリア
 */
function clearMapElements() {
    // マーカーを削除
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // 円を削除
    if (circle) {
        circle.setMap(null);
        circle = null;
    }
}

/**
 * Google Maps APIを動的に読み込み
 */
function loadGoogleMapsAPI() {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getApiKey()}&callback=initMap&libraries=geometry&language=ja`;
    script.onerror = function () {
        console.error('Google Maps APIの読み込みに失敗しました');
        const mapDiv = document.getElementById('map');
        mapDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #e53e3e;">⚠️ Google Maps APIの読み込みに失敗しました。APIキーを確認してください。</div>';
    };
    document.head.appendChild(script);
}

// Export functions for global access
function setBaseCoords(coords) {
    baseCoords = coords;
}

function setTargetCoords(coords) {
    targetCoords = coords;
}

function setCurrentRadius(radius) {
    currentRadius = radius;
}

function getMap() {
    return map;
}

function getBaseCoords() {
    return baseCoords;
}

// Make initMap available globally for Google Maps callback
window.initMap = initMap;