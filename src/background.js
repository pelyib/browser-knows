import { syncBookmarkAfterCreation, syncAllBookmarksAfterInstallation } from "./bookmarks";
import { ensureConnection } from "./database";

var browser = require('webextension-polyfill');

ensureConnection()
    .then(() => { console.log("DB is ready") })
    .catch(() => {})

browser.runtime.onInstalled.addListener(syncAllBookmarksAfterInstallation);
browser.bookmarks.onCreated.addListener(syncBookmarkAfterCreation);
