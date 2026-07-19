import { getKnowledgeObjectStore, recordTagsUsage } from "./database";
import { create } from "./knowledge";

var browser = require('webextension-polyfill');

const saveKnowledge = function(knowledge) {
    const request = getKnowledgeObjectStore().add(knowledge);
    request.onsuccess = () => {
        recordTagsUsage(knowledge.tags);
    };
}

const makeBookmarksFlat = async function(bookmarkTree) {
    if (bookmarkTree.hasOwnProperty('children')) {
        await Promise.all(bookmarkTree.children.map(async (bookmark) => {
            if (bookmark.hasOwnProperty('children')) {
                await makeBookmarksFlat(bookmark);
            }
            else {
                saveKnowledge(mapToKnowledge(bookmark));
            }
        }));
    }
}

const mapToKnowledge = function(boomkark) {
    return create(`[${boomkark.title}](${boomkark.url})`, ['bookmark', (new URL(boomkark.url)).hostname]);
}

export function syncBookmarkAfterCreation(bookmarkInfo) {
  if (bookmarkInfo.hasOwnProperty('url')) {
      saveKnowledge(mapToKnowledge(bookmarkInfo));
  }
}

export function syncAllBookmarksAfterInstallation() {
    browser.bookmarks.getTree(async (bookmarkTreeNodes) => {
        await Promise.all(bookmarkTreeNodes.map(makeBookmarksFlat))
    });
}
