import { initDb } from "./database";

browser.runtime.onInstalled.addListener(() => {
    initDb();
});
