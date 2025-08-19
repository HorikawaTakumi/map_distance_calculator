// Settings management
let GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY';

// Initialize API key from localStorage
function initializeApiKey() {
    const apiKeyFromStorage = localStorage.getItem('google_maps_api_key');
    if (apiKeyFromStorage && GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY') {
        GOOGLE_MAPS_API_KEY = apiKeyFromStorage;
        console.log('ローカルストレージからAPIキーを取得しました');
    }
}

function getApiKey() {
    return GOOGLE_MAPS_API_KEY;
}

function setApiKey(key) {
    GOOGLE_MAPS_API_KEY = key;
    localStorage.setItem('google_maps_api_key', key);
}

function clearApiKey() {
    GOOGLE_MAPS_API_KEY = '';
    localStorage.removeItem('google_maps_api_key');
}

function hasValidApiKey() {
    return GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY';
}