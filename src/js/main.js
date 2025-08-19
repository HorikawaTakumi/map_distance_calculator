/**
 * 距離計算を実行
 */
async function calculateDistance() {
    const address1 = document.getElementById('address1').value.trim();
    const address2 = document.getElementById('address2').value.trim();
    const button = document.getElementById('calcBtn');

    if (!address1 || !address2) {
        displayError('両方の住所を入力してください');
        return;
    }

    button.disabled = true;
    button.textContent = '計算中...';
    showLoading();

    try {
        const result = await getDistance(address1, address2);

        // 座標をマップモジュールに保存
        setBaseCoords(result.coordinates1);
        setTargetCoords(result.coordinates2);

        // 地図を更新
        if (getMap()) {
            updateMap();
        }

        displayResult(result);
    } catch (error) {
        displayError(error.message);
    } finally {
        button.disabled = false;
        button.textContent = '📏 距離を計算';
    }
}

/**
 * 初期値を設定
 */
function initializeDefaultValues() {
    // 起点住所のデフォルト値を設定
    document.getElementById('address1').value = DEFAULT_BASE_ADDRESS;

    // 半径入力のデフォルト値を設定
    document.getElementById('radiusInput').value = DEFAULT_RADIUS;
}

// Enter キーでの実行
document.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        calculateDistance();
    }
});

// Make calculateDistance available globally for onclick handler
window.calculateDistance = calculateDistance;

// ページ読み込み完了後の初期化
document.addEventListener('DOMContentLoaded', function () {
    // APIキーを初期化
    initializeApiKey();

    // デフォルト値を設定
    initializeDefaultValues();

    if (hasValidApiKey()) {
        // APIキーが設定されている場合はGoogle Mapsを読み込み
        loadGoogleMapsAPI();
    } else {
        // APIキーが設定されていない場合は設定用UIを表示
        showApiKeySetup();
    }
});