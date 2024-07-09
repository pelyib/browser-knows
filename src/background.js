import { syncBookmarks } from "./bookmarks";
import { ensureConnection } from "./database";

browser.runtime.onInstalled.addListener(() => {
    ensureConnection()
        .then(() => { syncBookmarks() })
        .catch(() => { console.log("banan") });
});
