let currentControlRadius = 3; // デフォルト半径

/**
 * 半径を更新
 */
function updateRadius() {
    const input = document.getElementById('radiusInput');
    const newRadius = parseFloat(input.value);

    if (isNaN(newRadius) || newRadius < 0.1 || newRadius > 50) {
        alert('半径は0.1km〜50kmの範囲で入力してください');
        input.value = currentControlRadius;
        return;
    }

    currentControlRadius = newRadius;
    setCurrentRadius(newRadius);
    console.log(`半径を${currentControlRadius}kmに更新しました`);

    // 地図が表示されている場合は円を更新
    if (getMap() && getBaseCoords()) {
        updateMap();
    }
}

// Make function available globally for onclick handler
window.updateRadius = updateRadius;