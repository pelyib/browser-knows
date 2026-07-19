import { getKnowledgeObjectStore, recordTagsUsage } from "./database";
import { create } from "./knowledge";
import { getSettings } from "./settings";
import { resolveFavicon } from "./favicon";

var browser = require('webextension-polyfill');

const saveKnowledge = function(knowledge) {
    const request = getKnowledgeObjectStore().add(knowledge);
    request.onsuccess = () => {
        recordTagsUsage(knowledge.tags);
    };
}

const makeBookmarksFlat = async function(bookmarkTree, settings) {
    if (bookmarkTree.hasOwnProperty('children')) {
        await Promise.all(bookmarkTree.children.map(async (bookmark) => {
            if (bookmark.hasOwnProperty('children')) {
                await makeBookmarksFlat(bookmark, settings);
            }
            else {
                saveKnowledge(await mapToKnowledge(bookmark, settings));
            }
        }));
    }
}

const mapToKnowledge = async function(boomkark, settings) {
    const hostname = (new URL(boomkark.url)).hostname;
    const favicon = settings.faviconFetchingEnabled ? await resolveFavicon(hostname) : null;
    return create(`[${boomkark.title}](${boomkark.url})`, ['bookmark', hostname], favicon);
}

export async function syncBookmarkAfterCreation(bookmarkInfo) {
  if (bookmarkInfo.hasOwnProperty('url')) {
      const settings = await getSettings();
      saveKnowledge(await mapToKnowledge(bookmarkInfo, settings));
  }
}

export function syncAllBookmarksAfterInstallation() {
    browser.bookmarks.getTree(async (bookmarkTreeNodes) => {
        const settings = await getSettings();
        await Promise.all(bookmarkTreeNodes.map((tree) => makeBookmarksFlat(tree, settings)));
    });
}
