// scripts/utils.js

// Вспомогательные функции
const Utils = {
    // Форматирование времени
    formatTime(seconds) {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Создание спектр-баров
    createSpectrumBars(container, count = 30) {
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const bar = document.createElement('div');
            bar.style.width = '3px';
            bar.style.height = Math.random() * 60 + 10 + '%';
            bar.style.background = 'linear-gradient(to top, #00ff00, #00cc00)';
            bar.style.animationDelay = (i * 0.05) + 's';
            bar.style.animation = 'spectrumPulse ' + (0.5 + Math.random() * 1) + 's infinite';
            container.appendChild(bar);
        }
    },

    // Анимация спектра
    animateSpectrum(container, isPlaying) {
        if (isPlaying) {
            container.querySelectorAll('div').forEach(function(bar) {
                bar.style.height = Math.random() * 80 + 20 + '%';
            });
        }
    },

    // Проверка поддержки аудио
    checkAudioSupport() {
        const audio = document.createElement('audio');
        return !!(audio.canPlayType && 
                 (audio.canPlayType('audio/mpeg;') !== '' || 
                  audio.canPlayType('audio/mp4;') !== ''));
    },

    // Сохранение в localStorage
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage не доступен', e);
        }
    },

    // Загрузка из localStorage
    loadFromStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage не доступен', e);
            return defaultValue;
        }
    },

    // Копирование в буфер обмена
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Скопировано: ' + text);
        }).catch(function(err) {
            console.error('Ошибка копирования: ', err);
        });
    },

    // Дебаунс для поиска
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};