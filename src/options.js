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

    getSettings().then((settings) => {
        faviconCheckbox.checked = settings.faviconFetchingEnabled;
    });

    faviconCheckbox.addEventListener('change', () => {
        updateSettings({ faviconFetchingEnabled: faviconCheckbox.checked }).then(showSavedToast);
    });
}

init();
