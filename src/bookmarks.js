import { getKnowledgeObjectStore } from "./database";
import { create } from "./knowledge";

var browser = require('webextension-polyfill');

const makeBookmarksFlat = async function(bookmarkTree) {
    if (bookmarkTree.hasOwnProperty('children')) {
        await Promise.all(bookmarkTree.children.map(async (bookmark) => {
            if (bookmark.hasOwnProperty('children')) {
                await makeBookmarksFlat(bookmark);
            }
            else {
                getKnowledgeObjectStore().add(mapToKnowledge(bookmark));
            }
        }));
    }
}

const mapToKnowledge = function(boomkark) {
    return create(`[${boomkark.title}](${boomkark.url})`, ['bookmark', (new URL(boomkark.url)).hostname]);
}

export function syncBookmarkAfterCreation(bookmarkInfo) {
  if (bookmarkInfo.hasOwnProperty('url')) {
      getKnowledgeObjectStore().add(mapToKnowledge(bookmarkInfo));
  }
}

export function syncAllBookmarksAfterInstallation() {
    browser.bookmarks.getTree(async (bookmarkTreeNodes) => {
        await Promise.all(bookmarkTreeNodes.map(makeBookmarksFlat))
    });
}
