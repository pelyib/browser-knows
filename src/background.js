import { syncBookmarkAfterCreation, syncAllBookmarksAfterInstallation } from "./bookmarks";
import { ensureConnection } from "./database";

var browser = require('webextension-polyfill');

browser.runtime.onInstalled.addListener(() => {
    ensureConnection()
        .then(() => {syncAllBookmarksAfterInstallation()})
        .catch(() => { console.log("Plugin installed but DB is not ready") });
});

browser.bookmarks.onCreated.addListener(() => {
    ensureConnection()
        .then(() => {syncBookmarkAfterCreation()})
        .catch(() => { console.log("Bookmark created but DB is not ready") });
});
