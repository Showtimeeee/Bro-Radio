// scripts/app.js

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    initApp();
});

function initApp() {
    // Проверка поддержки аудио
    if (!Utils.checkAudioSupport()) {
        showError('Ваш браузер не поддерживает аудио. Обновите браузер.');
        return;
    }

    // Создание плеера
    createWinampPlayer();
    
    // Загрузка сохраненных настроек
    loadSettings();
    
    // Инициализация аудио
    initAudioPlayer();
    
    // Настройка горячих клавиш
    setupKeyboardShortcuts();
    
    // Запуск анимации спектра
    startSpectrumAnimation();
}

function createWinampPlayer() {
    const playerContainer = document.getElementById('winamp-player');
    
    playerContainer.innerHTML = `
        <!-- Winamp Header -->
        <div class="winamp-header">
            <div class="winamp-title">
                <span class="winamp-text-small">WINAMP</span>
                <span class="winamp-version">5.666</span>
            </div>
            <div class="winamp-controls">
                <button class="winamp-btn minimize" title="Свернуть">─</button>
                <button class="winamp-btn maximize" title="Развернуть">□</button>
                <button class="winamp-btn close" title="Закрыть">×</button>
            </div>
        </div>
        
        <!-- Main Player -->
        <div class="winamp-main">
            <!-- Spectrum Display -->
            <div class="spectrum-display">
                <div class="spectrum-bars"></div>
                <div class="station-info" id="station-code-display">STATION: ---</div>
            </div>
            
            <!-- Search Box -->
            <div class="search-box">
                <div class="search-icon">🔍</div>
                <input type="text" id="station-search" placeholder="Поиск станции по коду..." autocomplete="off">
                <div class="search-results" id="search-results"></div>
            </div>
            
            <!-- Station List Window -->
            <div class="station-window">
                <div class="window-header">
                    <span>📻 СТАНЦИИ [${stations.length}]</span>
                    <span class="station-count" id="station-count">00/${stations.length}</span>
                </div>
                <div class="station-list" id="station-list"></div>
            </div>
            
            <!-- Player Controls -->
            <div class="player-controls">
                <div class="control-row">
                    <button class="ctrl-btn play" id="play-btn" title="Play">▶</button>
                    <button class="ctrl-btn pause" id="pause-btn" title="Pause">⏸</button>
                    <button class="ctrl-btn stop" id="stop-btn" title="Stop">⏹</button>
                    <button class="ctrl-btn prev" id="prev-btn" title="Previous">⏮</button>
                    <button class="ctrl-btn next" id="next-btn" title="Next">⏭</button>
                </div>
                <div class="volume-control">
                    <span class="vol-label">VOL</span>
                    <input type="range" id="volume-slider" min="0" max="100" value="80" class="vol-slider">
                    <span id="volume-value">80%</span>
                </div>
            </div>
            
            <!-- Status Bar -->
            <div class="status-bar">
                <span id="status-text">Готов к воспроизведению</span>
                <span class="bitrate" id="bitrate-display">--- kbps</span>
            </div>
        </div>
    `;
    
    // Инициализация спектра
    const spectrumBars = playerContainer.querySelector('.spectrum-bars');
    Utils.createSpectrumBars(spectrumBars);
    
    // Загрузка списка станций
    renderStationList();
    
    // Настройка элементов управления
    setupPlayerControls();
}

// Остальные функции будут в следующем сообщении (слишком длинно)