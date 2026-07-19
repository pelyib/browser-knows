var browser = require('webextension-polyfill');

const STORAGE_KEY = 'settings';

const DEFAULT_SETTINGS = {
    faviconFetchingEnabled: true,
};

export async function getSettings() {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...(stored[STORAGE_KEY] || {}) };
}

export async function updateSettings(changes) {
    const updated = { ...(await getSettings()), ...changes };
    await browser.storage.local.set({ [STORAGE_KEY]: updated });
    return updated;
}
