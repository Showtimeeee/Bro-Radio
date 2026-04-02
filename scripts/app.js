let currentStation = null;
let isPlaying = false;
let currentVolume = 0.8;
let audioElement = null;
let favorites = new Set();
let listeningHistory = [];
let currentTab = 'all';

// Анимация спектра
let spectrumAnimationFrame = null;
let lastSpectrumUpdate = 0;

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    setupAudio();
    loadFavorites();
    loadHistory();
    loadStations();
    setupEventListeners();
    setupSpectrum();
    setupKeyboardShortcuts();
    setupAnimationOptimization();
    setCurrentYear();
}

// === АУДИО (упрощённо, без Web Audio API) ===
function setupAudio() {
    audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.setAttribute('playsinline', '');
    audioElement.setAttribute('webkit-playsinline', '');
    audioElement.volume = currentVolume;
    
    // Обработчики событий
    audioElement.addEventListener('error', handleAudioError);
    audioElement.addEventListener('ended', handleAudioEnded);
    
    initPlayer();
}

function handleAudioError(e) {
    console.warn('Ошибка загрузки:', currentStation?.code, e);
    
    // План Б: пробуем убрать crossOrigin и перезагрузить
    if (audioElement.crossOrigin) {
        audioElement.crossOrigin = null;
        audioElement.load();
        return;
    }
    
    document.getElementById('status-text').textContent = '❌ Не удалось загрузить. Следующая...';
    setTimeout(nextStation, 2000);
}

function handleAudioEnded() {
    document.getElementById('status-text').textContent = 'Воспроизведение завершено';
    isPlaying = false;
    document.getElementById('play-btn').classList.remove('playing');
}

function initPlayer() {
    if (audioElement) {
        audioElement.volume = currentVolume;
    }
    document.getElementById('volume-slider').value = currentVolume * 100;
    document.getElementById('volume-value').textContent = Math.round(currentVolume * 100) + '%';
}

// === ВОСПРОИЗВЕДЕНИЕ ===
async function playAudio() {
    if (!currentStation) {
        document.getElementById('status-text').textContent = 'Сначала выберите станцию';
        return;
    }
    
    try {
        await audioElement.play();
        isPlaying = true;
        document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
        document.getElementById('play-btn').classList.add('playing');
        updateMediaSession();
        
        const selectedItem = document.querySelector(`.station-item[data-code="${currentStation.code}"]`);
        if (selectedItem) {
            selectedItem.classList.add('playing');
        }
    } catch (error) {
        console.error('Ошибка воспроизведения:', error);
        document.getElementById('status-text').textContent = '⚠️ Ошибка. Попробуйте позже...';
        isPlaying = false;
    }
}

function pauseAudio() {
    audioElement.pause();
    isPlaying = false;
    document.getElementById('play-btn').classList.remove('playing');
    document.getElementById('status-text').textContent = '⏸ Пауза';
    document.querySelectorAll('.station-item.playing').forEach(item => {
        item.classList.remove('playing');
    });
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
    }
}

function stopAudio() {
    audioElement.pause();
    audioElement.currentTime = 0;
    isPlaying = false;
    document.getElementById('play-btn').classList.remove('playing');
    document.getElementById('status-text').textContent = '⏹ Остановлено';
    document.querySelectorAll('.station-item.playing').forEach(item => {
        item.classList.remove('playing');
    });
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
    }
}

// === ВЫБОР СТАНЦИИ ===
function selectStation(station) {
    addToHistory(station);
    
    // Визуальное выделение
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('active', 'playing');
    });
    const selectedItem = document.querySelector(`.station-item[data-code="${station.code}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
        if (isPlaying) selectedItem.classList.add('playing');
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Обновление интерфейса
    document.getElementById('station-code-display').textContent = `STATION: ${station.code}`;
    document.getElementById('bitrate-display').textContent = `${station.bitrate} kbps`;
    document.getElementById('status-text').textContent = `Выбрана: ${station.code}`;
    
    const stationsToShow = getCurrentTabStations();
    const stationIndex = stationsToShow.findIndex(s => s.code === station.code);
    document.getElementById('station-count').textContent = `${stationIndex + 1}/${stationsToShow.length}`;
    
    currentStation = station;
    
    // Перезагрузка аудио
    audioElement.pause();
    audioElement.src = station.url;
    audioElement.load();
    
    updateFavoriteButton();
    updateMediaSession();
    
    if (isPlaying) {
        playAudio();
    }
}

// === ИЗБРАННОЕ И ИСТОРИЯ ===
function loadFavorites() {
    try {
        const saved = localStorage.getItem('broRadioFavorites');
        if (saved) favorites = new Set(JSON.parse(saved));
    } catch (e) { console.warn('Не удалось загрузить избранное:', e); }
}

function saveFavorites() {
    try {
        localStorage.setItem('broRadioFavorites', JSON.stringify([...favorites]));
    } catch (e) { console.warn('Не удалось сохранить избранное:', e); }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('broRadioHistory');
        if (saved) listeningHistory = JSON.parse(saved);
    } catch (e) { console.warn('Не удалось загрузить историю:', e); }
}

function saveHistory() {
    try {
        if (listeningHistory.length > 50) listeningHistory = listeningHistory.slice(-50);
        localStorage.setItem('broRadioHistory', JSON.stringify(listeningHistory));
    } catch (e) { console.warn('Не удалось сохранить историю:', e); }
}

function addToHistory(station) {
    const historyItem = {
        code: station.code,
        url: station.url,
        bitrate: station.bitrate,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString()
    };
    listeningHistory = listeningHistory.filter(item => item.code !== station.code);
    listeningHistory.unshift(historyItem);
    saveHistory();
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
    updateFavoriteButton();
    loadStations();
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

// === СПИСОК СТАНЦИЙ ===
function loadStations() {
    const stationList = document.getElementById('station-list');
    const stationCount = document.getElementById('station-count');
    stationList.innerHTML = '';
    
    let stationsToShow = [];
    switch(currentTab) {
        case 'all': stationsToShow = stations; break;
        case 'favorites': stationsToShow = stations.filter(s => favorites.has(s.code)); break;
        case 'history': 
            stationsToShow = stations.filter(s => listeningHistory.some(item => item.code === s.code));
            stationsToShow.sort((a, b) => {
                const aTime = listeningHistory.find(item => item.code === a.code)?.timestamp || '';
                const bTime = listeningHistory.find(item => item.code === b.code)?.timestamp || '';
                return bTime.localeCompare(aTime);
            });
            break;
    }
    
    stationsToShow.forEach(station => {
        const item = document.createElement('div');
        item.className = 'station-item';
        item.dataset.code = station.code;
        item.innerHTML = `
            <span class="station-code">${favorites.has(station.code) ? '★ ' : ''}${station.code}</span>
            <span class="station-bitrate">${station.bitrate}k</span>
        `;
        item.addEventListener('click', () => selectStation(station));
        stationList.appendChild(item);
    });
    
    stationCount.textContent = `${stationsToShow.length}/${stations.length}`;
    
    if (!currentStation && stationsToShow.length > 0) {
        selectStation(stationsToShow[0]);
    }
}

function getCurrentTabStations() {
    switch(currentTab) {
        case 'all': return stations;
        case 'favorites': return stations.filter(s => favorites.has(s.code));
        case 'history': return stations.filter(s => listeningHistory.some(item => item.code === s.code));
        default: return stations;
    }
}

function nextStation() {
    if (!currentStation) return;
    const stationsToShow = getCurrentTabStations();
    const currentIndex = stationsToShow.findIndex(s => s.code === currentStation.code);
    const nextIndex = (currentIndex + 1) % stationsToShow.length;
    selectStation(stationsToShow[nextIndex]);
    if (isPlaying) playAudio();
}

function prevStation() {
    if (!currentStation) return;
    const stationsToShow = getCurrentTabStations();
    const currentIndex = stationsToShow.findIndex(s => s.code === currentStation.code);
    const prevIndex = (currentIndex - 1 + stationsToShow.length) % stationsToShow.length;
    selectStation(stationsToShow[prevIndex]);
    if (isPlaying) playAudio();
}

// === MEDIA SESSION ===
function updateMediaSession() {
    if ('mediaSession' in navigator && currentStation) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentStation.code,
            artist: 'Bro-Radio',
            album: 'Online Radio'
        });
        navigator.mediaSession.setActionHandler('play', () => playAudio());
        navigator.mediaSession.setActionHandler('pause', () => pauseAudio());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevStation());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextStation());
    }
}

// === СПЕКТР (декоративный) ===
function setupSpectrum() {
    const spectrumBars = document.querySelector('.spectrum-bars');
    if (!spectrumBars) return;
    
    spectrumBars.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const bar = document.createElement('div');
        bar.className = 'spectrum-bar';
        bar.style.cssText = `
            width: 4px; height: 20%; background: linear-gradient(to top, #00ff00, #009900);
            margin-right: 2px; display: inline-block; transition: height 0.25s ease-out;
            border-radius: 1px; will-change: height;
        `;
        spectrumBars.appendChild(bar);
    }
    
    if (spectrumAnimationFrame) cancelAnimationFrame(spectrumAnimationFrame);
    
    function animateSpectrum() {
        const now = Date.now();
        if (now - lastSpectrumUpdate > 120) {
            lastSpectrumUpdate = now;
            const bars = document.querySelectorAll('.spectrum-bar');
            if (bars.length > 0) {
                const time = now * 0.001;
                bars.forEach((bar, index) => {
                    const phase = index * 0.3;
                    const wave = isPlaying 
                        ? Math.sin(time + phase) * 0.5 + 0.5 
                        : Math.sin(time * 0.5 + phase) * 0.3 + 0.7;
                    const height = isPlaying ? 20 + wave * 50 : 15 + wave * 5;
                    const brightness = isPlaying ? 70 + wave * 30 : 50 + wave * 20;
                    bar.style.height = `${height}%`;
                    bar.style.background = `linear-gradient(to top, hsl(120, 100%, ${brightness}%), hsl(120, 100%, 40%))`;
                });
            }
        }
        spectrumAnimationFrame = requestAnimationFrame(animateSpectrum);
    }
    animateSpectrum();
}

function setupAnimationOptimization() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (spectrumAnimationFrame) {
                cancelAnimationFrame(spectrumAnimationFrame);
                spectrumAnimationFrame = null;
            }
        } else {
            setupSpectrum();
        }
    });
}

// === ОБРАБОТЧИКИ СОБЫТИЙ ===
function setupEventListeners() {
    document.getElementById('play-btn')?.addEventListener('click', playAudio);
    document.getElementById('pause-btn')?.addEventListener('click', pauseAudio);
    document.getElementById('stop-btn')?.addEventListener('click', stopAudio);
    document.getElementById('prev-btn')?.addEventListener('click', prevStation);
    document.getElementById('next-btn')?.addEventListener('click', nextStation);
    
    document.getElementById('favorite-btn')?.addEventListener('click', () => {
        if (currentStation) toggleFavorite(currentStation.code);
    });
    
    document.getElementById('all-tab')?.addEventListener('click', () => switchTab('all'));
    document.getElementById('favorites-tab')?.addEventListener('click', () => switchTab('favorites'));
    document.getElementById('history-tab')?.addEventListener('click', () => switchTab('history'));
    
    // Громкость
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    volumeSlider?.addEventListener('input', (e) => {
        currentVolume = e.target.value / 100;
        if (audioElement) audioElement.volume = currentVolume;
        volumeValue.textContent = Math.round(currentVolume * 100) + '%';
    });
    
    // Поиск
    const searchInput = document.getElementById('station-search');
    const searchResults = document.getElementById('search-results');
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length === 0) { searchResults.style.display = 'none'; return; }
        
        const filtered = stations.filter(s => s.code.toLowerCase().includes(query));
        if (filtered.length > 0) {
            searchResults.innerHTML = filtered.map(s => 
                `<div class="search-result-item" data-code="${s.code}">
                    ${s.code} <span style="color:#666">(${s.bitrate}k)</span>${favorites.has(s.code) ? ' ★' : ''}
                </div>`
            ).join('');
            searchResults.style.display = 'block';
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const station = stations.find(s => s.code === item.dataset.code);
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
    
    document.addEventListener('click', (e) => {
        if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Кнопки окна
    document.querySelector('.winamp-btn.minimize')?.addEventListener('click', () => {
        document.getElementById('status-text').textContent = 'Минимизировано';
    });
    document.querySelector('.winamp-btn.maximize')?.addEventListener('click', () => {
        const player = document.getElementById('winamp-player');
        if (player?.style.width === '100%') {
            player.style.width = '500px';
            document.getElementById('status-text').textContent = 'Обычный размер';
        } else {
            player.style.width = '100%';
            document.getElementById('status-text').textContent = 'Развернут';
        }
    });
    document.querySelector('.winamp-btn.close')?.addEventListener('click', () => {
        if (confirm('Закрыть Bro-Radio Player?')) {
            stopAudio();
            document.getElementById('status-text').textContent = 'Player закрыт';
        }
    });
}

// === ВКЛАДКИ ===
function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    loadStations();
}

// === КЛАВИАТУРА ===
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.id === 'station-search') {
            if (e.key === 'Escape') {
                e.target.value = '';
                document.getElementById('search-results').style.display = 'none';
            }
            return;
        }
        
        switch(e.key) {
            case ' ': e.preventDefault(); isPlaying ? pauseAudio() : playAudio(); break;
            case 'ArrowLeft': e.preventDefault(); prevStation(); break;
            case 'ArrowRight': e.preventDefault(); nextStation(); break;
            case '+': case '=': e.preventDefault(); changeVolume(0.1); break;
            case '-': e.preventDefault(); changeVolume(-0.1); break;
            case 'm': case 'M': e.preventDefault(); toggleMute(); break;
            case 's': case 'S': e.preventDefault(); document.getElementById('station-search')?.focus(); break;
            case 'f': case 'F': e.preventDefault(); if (currentStation) toggleFavorite(currentStation.code); break;
            case '1': e.preventDefault(); switchTab('all'); break;
            case '2': e.preventDefault(); switchTab('favorites'); break;
            case '3': e.preventDefault(); switchTab('history'); break;
        }
    });
}

function changeVolume(delta) {
    currentVolume = Math.max(0, Math.min(1, currentVolume + delta));
    if (audioElement) audioElement.volume = currentVolume;
    document.getElementById('volume-slider').value = currentVolume * 100;
    document.getElementById('volume-value').textContent = Math.round(currentVolume * 100) + '%';
}

function toggleMute() {
    if (audioElement) {
        audioElement.muted = !audioElement.muted;
        document.getElementById('status-text').textContent = audioElement.muted ? '🔇 Звук выключен' : '🔊 Звук включен';
        setTimeout(() => {
            if (currentStation) document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
        }, 2000);
    }
}

// === ГОД В ФУТЕРЕ ===
function setCurrentYear() {
    const yearElement = document.querySelector('.footer-year');
    if (yearElement) {
        yearElement.textContent = `© ${new Date().getFullYear()} Bro-Radio`;
    }
}

// === ОЧИСТКА ПРИ ВЫХОДЕ ===
window.addEventListener('beforeunload', () => {
    if (spectrumAnimationFrame) cancelAnimationFrame(spectrumAnimationFrame);
    if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
    }
});
