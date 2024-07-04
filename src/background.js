// It is a browser extension background script.
// It should create a new table in the indexeddb.

const dbName = 'browser-knows';
const dbVersion = 1;

const knowledges = [
    {
        id: 1,
        tags: ['tag1', 'tag2'],
        body: `### First

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3`
    },
    {
        id: 2,
        tags: ['tag3', 'tag4'],
        body: `[Google](https://google.com)`,
    },
    {
        id: 3,
        tags: ['tag5', 'tag6'],
        body: `||table||column||
|first|second|`,
    }
];

browser.runtime.onInstalled.addListener(() => {
    const openRequest = indexedDB.open(dbName, dbVersion);

    openRequest.onerror = (event) => {
        console.log('Error opening database', event);
    };

    openRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore('knowledges', { keyPath: 'id' });

        objectStore.transaction.oncomplete = (event) => {
            const kwnowledgeStore = db.transaction('knowledges', 'readwrite').objectStore('knowledges');
            knowledges.forEach((knowledge) =>{
                kwnowledgeStore.add(knowledge);
            });
        }
    };
});

