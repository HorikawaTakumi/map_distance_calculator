/**
 * APIキー管理ボタンの表示/非表示を制御
 */
function updateApiKeyManagementVisibility() {
    const managementDiv = document.querySelector('.api-key-management');
    if (hasValidApiKey()) {
        managementDiv.classList.remove('hidden');
    } else {
        managementDiv.classList.add('hidden');
    }
}

/**
 * APIキー設定用のUIを表示
 */
function showApiKeySetup() {
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = `
        <div class="api-setup-container">
            <div class="api-setup-header">
                <h3 class="api-setup-title">🗺️ 地図表示機能について</h3>
                <p class="api-setup-description">
                    距離計算は既に利用可能です。<br>
                    地図上での位置表示・マーカー・半径円の表示には<br>
                    Google Maps APIキーが必要です。
                </p>
            </div>
            <div class="api-setup-form">
                <input type="text" id="apiKeyInput" placeholder="APIキーを入力してください" class="api-key-input">
                <button onclick="setApiKeyHandler()" class="btn-primary">
                    APIキーを設定
                </button>
                <small class="api-setup-note">
                    設定したAPIキーはブラウザに保存され、次回から自動で使用されます。
                </small>
            </div>
        </div>
    `;
    // APIキー管理ボタンを非表示
    updateApiKeyManagementVisibility();
}

/**
 * APIキーを設定
 */
function setApiKeyHandler() {
    const input = document.getElementById('apiKeyInput');
    const apiKey = input.value.trim();

    if (!apiKey) {
        alert('APIキーを入力してください');
        return;
    }

    setApiKey(apiKey);
    console.log('APIキーを設定しました');

    // Google Maps APIを読み込み
    loadGoogleMapsAPI();

    // APIキー管理ボタンを表示
    updateApiKeyManagementVisibility();
}

/**
 * APIキーを削除
 */
function clearApiKeyHandler() {
    if (confirm('保存済みのAPIキーを削除しますか？\n削除後はページを再読み込みします。')) {
        clearApiKey();
        console.log('APIキーを削除しました');
        alert('APIキーを削除しました。ページを再読み込みします。');
        location.reload();
    }
}

/**
 * APIキー管理画面を表示
 */
function showApiKeyManagement() {
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = `
        <div class="api-management-container">
            <div class="api-management-header">
                <h3 class="api-management-title">🔧 APIキー管理</h3>
                <p class="api-current-key">
                    現在のAPIキー: <span class="api-key-display">${getApiKey() ? getApiKey().substring(0, 8) + '...' : '未設定'}</span>
                </p>
            </div>
            <div class="api-management-form">
                <input type="text" id="newApiKeyInput" placeholder="新しいAPIキーを入力してください" class="api-key-input">
                <div class="btn-row">
                    <button onclick="updateApiKeyHandler()" class="btn-success">
                        更新
                    </button>
                    <button onclick="clearApiKeyHandler()" class="btn-danger">
                        削除
                    </button>
                </div>
                <button onclick="closeApiKeyManagement()" class="btn-secondary">
                    閉じる
                </button>
            </div>
        </div>
    `;
}

/**
 * APIキー管理画面を閉じる
 */
function closeApiKeyManagement() {
    if (hasValidApiKey()) {
        loadGoogleMapsAPI();
    } else {
        showApiKeySetup();
    }
}

/**
 * APIキーを更新
 */
function updateApiKeyHandler() {
    const input = document.getElementById('newApiKeyInput');
    const apiKey = input.value.trim();

    if (!apiKey) {
        alert('APIキーを入力してください');
        return;
    }

    setApiKey(apiKey);
    console.log('APIキーを更新しました');

    // Google Maps APIを読み込み
    loadGoogleMapsAPI();

    // APIキー管理ボタンを表示
    updateApiKeyManagementVisibility();
}

// Make functions available globally for onclick handlers
window.setApiKeyHandler = setApiKeyHandler;
window.clearApiKeyHandler = clearApiKeyHandler;
window.showApiKeyManagement = showApiKeyManagement;
window.closeApiKeyManagement = closeApiKeyManagement;
window.updateApiKeyHandler = updateApiKeyHandler;