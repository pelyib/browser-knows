import { getKnowledgeObjectStore } from "./database";

export function syncBookmarks() {
    browser.bookmarks.getTree(async (bookmarkTreeNodes) => {
        await Promise.all(bookmarkTreeNodes.map(makeBookmarksFlat))
    });
};

const makeBookmarksFlat = async function(bookmarkTree) {
    if (bookmarkTree.hasOwnProperty('children')) {
        await Promise.all(bookmarkTree.children.map(async (bookmark) => {
            if (bookmark.hasOwnProperty('children')) {
                await makeBookmarksFlat(bookmark);
            }
            else {
                getKnowledgeObjectStore().add({
                    tags: ['bookmark', (new URL(bookmark.url)).hostname],
                    body: `[${bookmark.title}](${bookmark.url})`,
                });
            }
        }));
    }
}
