/**
 * 距離計算結果を表示
 * @param {Object} result - 計算結果
 */
function displayResult(result) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = 'result';
    resultDiv.innerHTML = `
        <h3>📏 計算結果</h3>
        <div><strong>🏢 起点:</strong> ${result.address1}</div>
        <div style="margin-left: 20px; margin-bottom: 10px;">
            座標: <span class="coordinate">${result.coordinates1.lat.toFixed(6)}, ${result.coordinates1.lon.toFixed(6)}</span>
        </div>
        <div><strong>📍 目的地:</strong> ${result.address2}</div>
        <div style="margin-left: 20px; margin-bottom: 15px;">
            座標: <span class="coordinate">${result.coordinates2.lat.toFixed(6)}, ${result.coordinates2.lon.toFixed(6)}</span>
        </div>
        <div class="distance-highlight">
            🎯 直線距離: ${result.distance_km} km (${result.distance_m} m)
        </div>
        <div class="calculation-method">
            📊 計算方法: ${result.calculationMethod}
        </div>
    `;
}

/**
 * エラーを表示
 * @param {string} message - エラーメッセージ
 */
function displayError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = 'result error';
    resultDiv.innerHTML = `<strong>❌ エラー:</strong> ${message}`;
}

/**
 * ローディング表示
 */
function showLoading() {
    const resultDiv = document.getElementById('result');
    resultDiv.className = 'result loading';
    resultDiv.innerHTML = '🔄 計算中...';
}