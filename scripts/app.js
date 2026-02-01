let currentStation = null;
let isPlaying = false;
let currentVolume = 0.8;
let audioPlayer = null;
let audioContext = null;
let analyser = null;
let source = null;
let biquadFilters = [];
let spectrumInterval = null;
let favorites = new Set();
let listeningHistory = [];
let currentTab = 'all';
let isEqualizerEnabled = false;
let equalizerGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10 полос
let equalizerPresets = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    pop: [3, 2, 1, 0, -1, -2, -3, -2, -1, 0],
    rock: [4, 3, 2, 1, 0, 1, 2, 3, 2, 1],
    jazz: [2, 1, 0, -1, -2, -3, -2, -1, 0, 1],
    bass: [6, 5, 4, 3, 2, 1, 0, -1, -2, -3],
    classical: [1, 0, -1, -2, -3, -2, -1, 0, 1, 2],
    dance: [4, 3, 2, 1, 0, -1, 0, 1, 2, 3]
};

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    audioPlayer = document.getElementById('audio-player');
    initApp();
});

function initApp() {
    // Загрузка избранного из localStorage
    loadFavorites();
    
    // Загрузка истории из localStorage
    loadHistory();
    
    // Загрузка настроек эквалайзера
    loadEqualizerSettings();
    
    // Инициализация плеера
    initPlayer();
    
    // Инициализация эквалайзера
    initEqualizer();
    
    // Загрузка станций
    loadStations();
    
    // Настройка элементов управления
    setupEventListeners();
    
    // Настройка спектра
    setupSpectrum();
    
    // Настройка горячих клавиш
    setupKeyboardShortcuts();
    
    // Установка текущего года
    setCurrentYear();
}

function loadFavorites() {
    try {
        const saved = localStorage.getItem('broRadioFavorites');
        if (saved) {
            favorites = new Set(JSON.parse(saved));
        }
    } catch (e) {
        console.warn('Не удалось загрузить избранное:', e);
    }
}

function saveFavorites() {
    try {
        localStorage.setItem('broRadioFavorites', JSON.stringify([...favorites]));
    } catch (e) {
        console.warn('Не удалось сохранить избранное:', e);
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('broRadioHistory');
        if (saved) {
            listeningHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Не удалось загрузить историю:', e);
    }
}

function saveHistory() {
    try {
        // Сохраняем только последние 50 записей
        if (listeningHistory.length > 50) {
            listeningHistory = listeningHistory.slice(-50);
        }
        localStorage.setItem('broRadioHistory', JSON.stringify(listeningHistory));
    } catch (e) {
        console.warn('Не удалось сохранить историю:', e);
    }
}

function loadEqualizerSettings() {
    try {
        const saved = localStorage.getItem('broRadioEqualizer');
        if (saved) {
            const settings = JSON.parse(saved);
            equalizerGains = settings.gains || equalizerGains;
            isEqualizerEnabled = settings.enabled || false;
        }
    } catch (e) {
        console.warn('Не удалось загрузить настройки эквалайзера:', e);
    }
}

function saveEqualizerSettings() {
    try {
        const settings = {
            gains: equalizerGains,
            enabled: isEqualizerEnabled
        };
        localStorage.setItem('broRadioEqualizer', JSON.stringify(settings));
    } catch (e) {
        console.warn('Не удалось сохранить настройки эквалайзера:', e);
    }
}

function addToHistory(station) {
    const historyItem = {
        code: station.code,
        url: station.url,
        bitrate: station.bitrate,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString()
    };
    
    // Удаляем дубликаты
    listeningHistory = listeningHistory.filter(item => item.code !== station.code);
    
    // Добавляем в начало
    listeningHistory.unshift(historyItem);
    
    // Сохраняем
    saveHistory();
}

function initPlayer() {
    // Установка громкости
    audioPlayer.volume = currentVolume;
    document.getElementById('volume-slider').value = currentVolume * 100;
    document.getElementById('volume-value').textContent = Math.round(currentVolume * 100) + '%';
}

function initEqualizer() {
    // Создаем полосы эквалайзера в DOM
    const equalizerContainer = document.getElementById('equalizer-bands');
    if (!equalizerContainer) return;
    
    equalizerContainer.innerHTML = '';
    
    const frequencies = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
    
    frequencies.forEach((freq, index) => {
        const band = document.createElement('div');
        band.className = 'eq-band';
        band.dataset.index = index;
        band.innerHTML = `
            <div class="eq-freq">${freq}</div>
            <div class="eq-slider-container">
                <input type="range" class="eq-slider" min="-12" max="12" value="${equalizerGains[index]}" step="1" orient="vertical">
                <div class="eq-value">${equalizerGains[index]}dB</div>
            </div>
        `;
        equalizerContainer.appendChild(band);
        
        // Обработчик изменения слайдера
        const slider = band.querySelector('.eq-slider');
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            equalizerGains[index] = value;
            band.querySelector('.eq-value').textContent = value + 'dB';
            applyEqualizer();
            saveEqualizerSettings();
        });
    });
    
    // Кнопка включения/выключения эквалайзера
    const eqToggleBtn = document.getElementById('eq-toggle-btn');
    if (eqToggleBtn) {
        eqToggleBtn.addEventListener('click', toggleEqualizer);
        updateEqualizerButton();
    }
    
    // Кнопки пресетов
    setupEqualizerPresets();
}

function setupEqualizerPresets() {
    const presetsContainer = document.getElementById('eq-presets');
    if (!presetsContainer) return;
    
    Object.keys(equalizerPresets).forEach(presetName => {
        const presetBtn = document.createElement('button');
        presetBtn.className = 'eq-preset-btn';
        presetBtn.textContent = presetName.charAt(0).toUpperCase() + presetName.slice(1);
        presetBtn.dataset.preset = presetName;
        presetBtn.addEventListener('click', () => {
            applyPreset(presetName);
        });
        presetsContainer.appendChild(presetBtn);
    });
}

function applyPreset(presetName) {
    if (!equalizerPresets[presetName]) return;
    
    equalizerGains = [...equalizerPresets[presetName]];
    
    // Обновляем слайдеры
    document.querySelectorAll('.eq-band').forEach((band, index) => {
        const slider = band.querySelector('.eq-slider');
        const valueDisplay = band.querySelector('.eq-value');
        slider.value = equalizerGains[index];
        valueDisplay.textContent = equalizerGains[index] + 'dB';
    });
    
    applyEqualizer();
    saveEqualizerSettings();
    
    document.getElementById('status-text').textContent = `Применен пресет: ${presetName}`;
    setTimeout(() => {
        if (currentStation && isPlaying) {
            document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
        }
    }, 2000);
}

function toggleEqualizer() {
    isEqualizerEnabled = !isEqualizerEnabled;
    
    if (isEqualizerEnabled) {
        setupAudioContext();
    } else {
        disconnectEqualizer();
    }
    
    updateEqualizerButton();
    saveEqualizerSettings();
    
    document.getElementById('status-text').textContent = 
        `Эквалайзер ${isEqualizerEnabled ? 'включен' : 'выключен'}`;
    setTimeout(() => {
        if (currentStation && isPlaying) {
            document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
        }
    }, 2000);
}

function updateEqualizerButton() {
    const eqToggleBtn = document.getElementById('eq-toggle-btn');
    if (eqToggleBtn) {
        if (isEqualizerEnabled) {
            eqToggleBtn.classList.add('active');
            eqToggleBtn.title = 'Выключить эквалайзер';
        } else {
            eqToggleBtn.classList.remove('active');
            eqToggleBtn.title = 'Включить эквалайзер';
        }
    }
}

function setupAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Создаем фильтры для каждой полосы
            const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
            
            biquadFilters = frequencies.map(freq => {
                const filter = audioContext.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                return filter;
            });
            
            // Соединяем фильтры в цепочку
            for (let i = 0; i < biquadFilters.length - 1; i++) {
                biquadFilters[i].connect(biquadFilters[i + 1]);
            }
            
            // Подключаем к динамикам
            biquadFilters[biquadFilters.length - 1].connect(audioContext.destination);
            
            applyEqualizer();
            
        } catch (e) {
            console.warn('Ошибка создания AudioContext:', e);
            isEqualizerEnabled = false;
            updateEqualizerButton();
        }
    }
}

function applyEqualizer() {
    if (!isEqualizerEnabled || !biquadFilters.length) return;
    
    biquadFilters.forEach((filter, index) => {
        if (filter) {
            filter.gain.value = equalizerGains[index];
        }
    });
}

function disconnectEqualizer() {
    // Отключаем фильтры от аудио
    if (source && biquadFilters.length) {
        source.disconnect();
        source.connect(audioContext.destination);
    }
}

function loadStations() {
    const stationList = document.getElementById('station-list');
    const stationCount = document.getElementById('station-count');
    
    stationList.innerHTML = '';
    
    let stationsToShow = [];
    
    switch(currentTab) {
        case 'all':
            stationsToShow = stations;
            break;
        case 'favorites':
            stationsToShow = stations.filter(station => favorites.has(station.code));
            break;
        case 'history':
            stationsToShow = stations.filter(station => 
                listeningHistory.some(item => item.code === station.code)
            );
            // Сортируем по времени прослушивания
            stationsToShow.sort((a, b) => {
                const aTime = listeningHistory.find(item => item.code === a.code)?.timestamp || '';
                const bTime = listeningHistory.find(item => item.code === b.code)?.timestamp || '';
                return bTime.localeCompare(aTime);
            });
            break;
    }
    
    stationsToShow.forEach((station) => {
        const item = document.createElement('div');
        item.className = 'station-item';
        item.dataset.code = station.code;
        
        // ТОЛЬКО если станция в избранном, показываем звездочку
        if (favorites.has(station.code)) {
            item.innerHTML = `
                <span class="station-code">★ ${station.code}</span>
                <span class="station-bitrate">${station.bitrate}k</span>
            `;
        } else {
            item.innerHTML = `
                <span class="station-code">${station.code}</span>
                <span class="station-bitrate">${station.bitrate}k</span>
            `;
        }
        
        item.addEventListener('click', () => {
            selectStation(station);
        });
        
        stationList.appendChild(item);
    });
    
    stationCount.textContent = `${stationsToShow.length}/${stations.length}`;
    
    // Выбираем первую станцию если нет текущей
    if (!currentStation && stationsToShow.length > 0) {
        selectStation(stationsToShow[0]);
    }
}

function toggleFavorite(stationCode) {
    if (favorites.has(stationCode)) {
        favorites.delete(stationCode);
        document.getElementById('status-text').textContent = `❌ Удалено из избранного: ${stationCode}`;
    } else {
        favorites.add(stationCode);
        document.getElementById('status-text').textContent = `✅ Добавлено в избранное: ${stationCode}`;
    }
    
    saveFavorites();
    
    // Обновляем кнопку избранного
    updateFavoriteButton();
    
    // Перезагружаем список станций
    loadStations();
    
    // Через 3 секунды возвращаем обычный статус
    setTimeout(() => {
        if (currentStation && isPlaying) {
            document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
        }
    }, 3000);
}

function updateFavoriteButton() {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (currentStation && favorites.has(currentStation.code)) {
        favoriteBtn.classList.add('active');
        favoriteBtn.title = 'Удалить из избранного';
    } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.title = 'Добавить в избранное';
    }
}

function selectStation(station) {
    // Добавляем в историю
    addToHistory(station);
    
    // Снимаем выделение со всех станций
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('active', 'playing');
    });
    
    // Выделяем выбранную
    const selectedItem = document.querySelector(`.station-item[data-code="${station.code}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
        if (isPlaying) {
            selectedItem.classList.add('playing');
        }
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Обновляем отображение
    document.getElementById('station-code-display').textContent = `STATION: ${station.code}`;
    document.getElementById('bitrate-display').textContent = `${station.bitrate} kbps`;
    document.getElementById('status-text').textContent = `Выбрана: ${station.code}`;
    
    // Обновляем счетчик
    const stationsToShow = getCurrentTabStations();
    const stationIndex = stationsToShow.findIndex(s => s.code === station.code);
    document.getElementById('station-count').textContent = `${stationIndex + 1}/${stationsToShow.length}`;
    
    // Устанавливаем источник аудио
    currentStation = station;
    audioPlayer.src = station.url;
    
    // Подключаем эквалайзер если включен
    if (isEqualizerEnabled && audioContext) {
        connectAudioToEqualizer();
    }
    
    // Обновляем кнопку избранного
    updateFavoriteButton();
    
    // Если уже воспроизводилось - продолжаем
    if (isPlaying) {
        playAudio();
    }
}

function connectAudioToEqualizer() {
    if (!audioContext || !isEqualizerEnabled || !biquadFilters.length) return;
    
    try {
        // Отключаем предыдущее соединение
        if (source) {
            source.disconnect();
        }
        
        // Создаем новый источник из аудио элемента
        source = audioContext.createMediaElementSource(audioPlayer);
        
        // Подключаем к цепочке фильтров
        source.connect(biquadFilters[0]);
        
        // Применяем текущие настройки эквалайзера
        applyEqualizer();
        
    } catch (e) {
        console.warn('Ошибка подключения эквалайзера:', e);
    }
}

function getCurrentTabStations() {
    switch(currentTab) {
        case 'all':
            return stations;
        case 'favorites':
            return stations.filter(station => favorites.has(station.code));
        case 'history':
            return stations.filter(station => 
                listeningHistory.some(item => item.code === station.code)
            );
        default:
            return stations;
    }
}

function playAudio() {
    if (!currentStation) {
        document.getElementById('status-text').textContent = 'Сначала выберите станцию';
        return;
    }
    
    // Возобновляем AudioContext если он был приостановлен
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
            document.getElementById('play-btn').classList.add('playing');
            
            // Добавляем анимацию к выбранной станции
            const selectedItem = document.querySelector(`.station-item[data-code="${currentStation.code}"]`);
            if (selectedItem) {
                selectedItem.classList.add('playing');
            }
            
            // Подключаем эквалайзер если нужно
            if (isEqualizerEnabled) {
                connectAudioToEqualizer();
            }
        })
        .catch(error => {
            console.error('Ошибка воспроизведения:', error);
            document.getElementById('status-text').textContent = 'Ошибка загрузки. Попробуйте другую станцию.';
            isPlaying = false;
            
            // Пробуем следующую станцию
            setTimeout(nextStation, 2000);
        });
}

function pauseAudio() {
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById('play-btn').classList.remove('playing');
    document.getElementById('status-text').textContent = 'Пауза';
    
    // Убираем анимацию
    document.querySelectorAll('.station-item.playing').forEach(item => {
        item.classList.remove('playing');
    });
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
    document.getElementById('play-btn').classList.remove('playing');
    document.getElementById('status-text').textContent = 'Остановлено';
    
    // Убираем анимацию
    document.querySelectorAll('.station-item.playing').forEach(item => {
        item.classList.remove('playing');
    });
}

function nextStation() {
    if (!currentStation) return;
    
    const stationsToShow = getCurrentTabStations();
    const currentIndex = stationsToShow.findIndex(s => s.code === currentStation.code);
    const nextIndex = (currentIndex + 1) % stationsToShow.length;
    selectStation(stationsToShow[nextIndex]);
    
    if (isPlaying) {
        playAudio();
    }
}

function prevStation() {
    if (!currentStation) return;
    
    const stationsToShow = getCurrentTabStations();
    const currentIndex = stationsToShow.findIndex(s => s.code === currentStation.code);
    const prevIndex = (currentIndex - 1 + stationsToShow.length) % stationsToShow.length;
    selectStation(stationsToShow[prevIndex]);
    
    if (isPlaying) {
        playAudio();
    }
}

function setupEventListeners() {
    // Кнопки управления
    document.getElementById('play-btn').addEventListener('click', playAudio);
    document.getElementById('pause-btn').addEventListener('click', pauseAudio);
    document.getElementById('stop-btn').addEventListener('click', stopAudio);
    document.getElementById('prev-btn').addEventListener('click', prevStation);
    document.getElementById('next-btn').addEventListener('click', nextStation);
    
    // Кнопка избранного
    document.getElementById('favorite-btn').addEventListener('click', () => {
        if (currentStation) {
            toggleFavorite(currentStation.code);
        }
    });
    
    // Вкладки
    document.getElementById('all-tab').addEventListener('click', () => {
        switchTab('all');
    });
    
    document.getElementById('favorites-tab').addEventListener('click', () => {
        switchTab('favorites');
    });
    
    document.getElementById('history-tab').addEventListener('click', () => {
        switchTab('history');
    });
    
    // Громкость
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    volumeSlider.addEventListener('input', (e) => {
        currentVolume = e.target.value / 100;
        audioPlayer.volume = currentVolume;
        volumeValue.textContent = Math.round(currentVolume * 100) + '%';
    });
    
    // Поиск
    const searchInput = document.getElementById('station-search');
    const searchResults = document.getElementById('search-results');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (query.length === 0) {
            searchResults.style.display = 'none';
            return;
        }
        
        const filtered = stations.filter(station => 
            station.code.toLowerCase().includes(query)
        );
        
        if (filtered.length > 0) {
            searchResults.innerHTML = filtered.map(station => {
                // Только если станция в избранном, показываем звездочку
                const star = favorites.has(station.code) ? ' ★' : '';
                return `<div class="search-result-item" data-code="${station.code}">
                    ${station.code} <span style="color:#666">(${station.bitrate}k)</span>${star}
                </div>`;
            }).join('');
            
            searchResults.style.display = 'block';
            
            // Добавляем обработчики кликов
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const code = item.dataset.code;
                    const station = stations.find(s => s.code === code);
                    if (station) {
                        selectStation(station);
                        searchInput.value = '';
                        searchResults.style.display = 'none';
                        searchInput.blur();
                    }
                });
            });
        } else {
            searchResults.innerHTML = '<div class="search-result-item">Станция не найдена</div>';
            searchResults.style.display = 'block';
        }
    });
    
    // Закрытие результатов поиска при клике вне
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Winamp кнопки
    document.querySelector('.winamp-btn.minimize').addEventListener('click', () => {
        document.getElementById('status-text').textContent = 'Минимизировано';
    });
    
    document.querySelector('.winamp-btn.maximize').addEventListener('click', () => {
        const player = document.getElementById('winamp-player');
        if (player.style.width === '100%') {
            player.style.width = '500px';
            document.getElementById('status-text').textContent = 'Обычный размер';
        } else {
            player.style.width = '100%';
            document.getElementById('status-text').textContent = 'Развернут';
        }
    });
    
    document.querySelector('.winamp-btn.close').addEventListener('click', () => {
        if (confirm('Закрыть Bro-Radio Player?')) {
            stopAudio();
            document.getElementById('status-text').textContent = 'Player закрыт';
        }
    });
    
    // События аудио
    audioPlayer.addEventListener('ended', () => {
        document.getElementById('status-text').textContent = 'Воспроизведение завершено';
        isPlaying = false;
        document.getElementById('play-btn').classList.remove('playing');
    });
    
    audioPlayer.addEventListener('error', () => {
        document.getElementById('status-text').textContent = 'Ошибка потока. Пробуем следующую...';
        setTimeout(nextStation, 1500);
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Обновляем активную вкладку
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Перезагружаем список станций
    loadStations();
}

function setupSpectrum() {
    const spectrumBars = document.querySelector('.spectrum-bars');
    if (!spectrumBars) return;
    
    // Создаем бары
    for (let i = 0; i < 30; i++) {
        const bar = document.createElement('div');
        bar.style.width = '3px';
        bar.style.height = Math.random() * 60 + 10 + '%';
        bar.style.background = 'linear-gradient(to top, #00ff00, #00cc00)';
        bar.style.animationDelay = (i * 0.05) + 's';
        bar.style.animation = 'spectrumPulse ' + (0.5 + Math.random() * 1) + 's infinite';
        spectrumBars.appendChild(bar);
    }
    
    // Анимация
    spectrumInterval = setInterval(() => {
        if (isPlaying) {
            spectrumBars.querySelectorAll('div').forEach(bar => {
                bar.style.height = Math.random() * 80 + 20 + '%';
            });
        }
    }, 200);
}

// Горячие клавиши
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Пропускаем если вводим в поиск
        if (e.target.id === 'station-search') {
            if (e.key === 'Escape') {
                e.target.value = '';
                document.getElementById('search-results').style.display = 'none';
            }
            return;
        }
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (isPlaying) {
                    pauseAudio();
                } else {
                    playAudio();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevStation();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextStation();
                break;
            case '+':
            case '=':
                e.preventDefault();
                currentVolume = Math.min(1, currentVolume + 0.1);
                audioPlayer.volume = currentVolume;
                document.getElementById('volume-slider').value = currentVolume * 100;
                document.getElementById('volume-value').textContent = Math.round(currentVolume * 100) + '%';
                break;
            case '-':
                e.preventDefault();
                currentVolume = Math.max(0, currentVolume - 0.1);
                audioPlayer.volume = currentVolume;
                document.getElementById('volume-slider').value = currentVolume * 100;
                document.getElementById('volume-value').textContent = Math.round(currentVolume * 100) + '%';
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                audioPlayer.muted = !audioPlayer.muted;
                document.getElementById('status-text').textContent = audioPlayer.muted ? 'Звук выключен' : 'Звук включен';
                setTimeout(() => {
                    if (currentStation) {
                        document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
                    }
                }, 2000);
                break;
            case 's':
            case 'S':
                e.preventDefault();
                document.getElementById('station-search').focus();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                if (currentStation) {
                    toggleFavorite(currentStation.code);
                }
                break;
            case '1':
                e.preventDefault();
                switchTab('all');
                break;
            case '2':
                e.preventDefault();
                switchTab('favorites');
                break;
            case '3':
                e.preventDefault();
                switchTab('history');
                break;
            case 'e':
            case 'E':
                e.preventDefault();
                toggleEqualizer();
                break;
        }
    });
}

// Установка текущего года
function setCurrentYear() {
    const yearElement = document.querySelector('.footer-year');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = `© ${currentYear}`;
    }
}

// Предотвращаем утечку памяти при закрытии
window.addEventListener('beforeunload', () => {
    if (spectrumInterval) {
        clearInterval(spectrumInterval);
    }
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
    }
    if (audioContext) {
        audioContext.close();
    }
});
