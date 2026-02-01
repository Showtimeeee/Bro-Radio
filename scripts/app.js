let currentStation = null;
let isPlaying = false;
let currentVolume = 0.8;
let audioPlayer = null;

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    audioPlayer = document.getElementById('audio-player');
    initPlayer();
    setupEventListeners();
    loadStations();
    setupSpectrum();
    setupKeyboardShortcuts();
});

function initPlayer() {
    // Установка громкости
    audioPlayer.volume = currentVolume;
    document.getElementById('volume-slider').value = currentVolume * 100;
    document.getElementById('volume-value').textContent = Math.round(currentVolume * 100) + '%';
}

function loadStations() {
    const stationList = document.getElementById('station-list');
    const stationCount = document.getElementById('station-count');
    
    stationList.innerHTML = '';
    
    stations.forEach((station, index) => {
        const item = document.createElement('div');
        item.className = 'station-item';
        item.dataset.index = index;
        item.innerHTML = `
            <span class="station-code">${station.code}</span>
            <span class="station-bitrate">${station.bitrate}k</span>
        `;
        
        item.addEventListener('click', () => {
            selectStation(station);
        });
        
        stationList.appendChild(item);
    });
    
    stationCount.textContent = `0/${stations.length}`;
    
    // Выбираем первую станцию
    if (stations.length > 0) {
        selectStation(stations[0]);
    }
}

function selectStation(station) {
    // Снимаем выделение со всех станций
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Выделяем выбранную
    const stationIndex = stations.findIndex(s => s.code === station.code);
    const selectedItem = document.querySelector(`.station-item[data-index="${stationIndex}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Обновляем отображение
    document.getElementById('station-code-display').textContent = `STATION: ${station.code}`;
    document.getElementById('bitrate-display').textContent = `${station.bitrate} kbps`;
    document.getElementById('status-text').textContent = `Выбрана: ${station.code}`;
    document.getElementById('station-count').textContent = `${stationIndex + 1}/${stations.length}`;
    
    // Устанавливаем источник аудио
    currentStation = station;
    audioPlayer.src = station.url;
    
    // Если уже воспроизводилось - продолжаем
    if (isPlaying) {
        playAudio();
    }
}

function playAudio() {
    if (!currentStation) {
        document.getElementById('status-text').textContent = 'Сначала выберите станцию';
        return;
    }
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            document.getElementById('status-text').textContent = `▶ ${currentStation.code}`;
            document.getElementById('play-btn').classList.add('playing');
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
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
    document.getElementById('play-btn').classList.remove('playing');
    document.getElementById('status-text').textContent = 'Остановлено';
}

function nextStation() {
    if (!currentStation) return;
    
    const currentIndex = stations.findIndex(s => s.code === currentStation.code);
    const nextIndex = (currentIndex + 1) % stations.length;
    selectStation(stations[nextIndex]);
    
    if (isPlaying) {
        playAudio();
    }
}

function prevStation() {
    if (!currentStation) return;
    
    const currentIndex = stations.findIndex(s => s.code === currentStation.code);
    const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
    selectStation(stations[prevIndex]);
    
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
            searchResults.innerHTML = filtered.map(station => 
                `<div class="search-result-item" data-code="${station.code}">
                    ${station.code} <span style="color:#666">(${station.bitrate}k)</span>
                </div>`
            ).join('');
            
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
        if (confirm('Закрыть Winamp Player?')) {
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

function setupSpectrum() {
    const spectrumBars = document.querySelector('.spectrum-bars');
    
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
    setInterval(() => {
        if (isPlaying) {
            spectrumBars.querySelectorAll('div').forEach(bar => {
                bar.style.height = Math.random() * 80 + 20 + '%';
            });
        }
    }, 200);
}

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
                break;
            case 's':
            case 'S':
                e.preventDefault();
                document.getElementById('station-search').focus();
                break;
        }
    });
}
