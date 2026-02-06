const Utils = {
    formatTime(seconds) {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    createSpectrumBars(container, count = 15) {
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const bar = document.createElement('div');
            bar.style.width = '4px';
            bar.style.height = Math.random() * 60 + 10 + '%';
            bar.style.background = '#00cc00';
            bar.style.opacity = '0.7';
            bar.style.marginRight = '1px';
            bar.style.display = 'inline-block';
            container.appendChild(bar);
        }
    },

    animateSpectrum(container, isPlaying) {
        if (isPlaying) {
            container.querySelectorAll('div').forEach(function(bar) {
                const randomHeight = 20 + Math.random() * 60;
                bar.style.height = randomHeight + '%';
                bar.style.opacity = 0.5 + Math.random() * 0.5;
            });
        }
    },

    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage не доступен', e);
        }
    },

    loadFromStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage не доступен', e);
            return defaultValue;
        }
    },

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
