const STORAGE_KEY = 'bk-theme';

function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
}

function getSystemTheme(media) {
    return media.matches ? 'dark' : 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);

    const button = document.getElementById('themeToggle');
    if (button) {
        const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        button.innerHTML = theme === 'dark' ? '&#9728;&#65039;' : '&#127769;';
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
    }
}

export function applyColorTheme() {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    setTheme(getStoredTheme() || getSystemTheme(media));

    media.addEventListener('change', () => {
        if (!getStoredTheme()) {
            setTheme(getSystemTheme(media));
        }
    });

    const button = document.getElementById('themeToggle');
    if (button) {
        button.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            setTheme(next);
        });
    }
}
