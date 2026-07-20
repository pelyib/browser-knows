import * as bootstrap from "bootstrap";
import { getSettings, updateSettings } from "./settings";
import { applyColorTheme } from "./theme";

function showSavedToast() {
    const toast = document.getElementById('settingsSaved');
    bootstrap.Toast.getOrCreateInstance(toast).show();
}

function init() {
    applyColorTheme();

    const faviconCheckbox = document.getElementById('faviconFetchingEnabled');
    const cardDensitySelect = document.getElementById('cardDensity');

    getSettings().then((settings) => {
        faviconCheckbox.checked = settings.faviconFetchingEnabled;
        cardDensitySelect.value = settings.cardDensity;
    });

    faviconCheckbox.addEventListener('change', () => {
        updateSettings({ faviconFetchingEnabled: faviconCheckbox.checked }).then(showSavedToast);
    });

    cardDensitySelect.addEventListener('change', () => {
        updateSettings({ cardDensity: cardDensitySelect.value }).then(showSavedToast);
    });
}

init();
