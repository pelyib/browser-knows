import { syncBookmarkAfterCreation, syncAllBookmarksAfterInstallation } from "./bookmarks";
import { ensureConnection } from "./database";

var browser = require('webextension-polyfill');

browser.runtime.onInstalled.addListener(() => {
    ensureConnection()
        .then(() => {syncAllBookmarksAfterInstallation()})
        .catch(() => { console.log("Plugin installed but DB is not ready") });
});

browser.bookmarks.onCreated.addListener((id, bookmarkInfo) => {
    ensureConnection()
        .then(() => {
            syncBookmarkAfterCreation(bookmarkInfo)
        })
        .catch((error) => { 
            console.error("Sync after bookmark creation failed, reason: ", error);
        });
});
