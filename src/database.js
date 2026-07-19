const dbDescription = {
    name: 'browser-knows',
    version: 2,
    objectStores: {
        knowledges: {
            name: 'knowledges',
            // TODO: start to use these parameters
            keyPath: 'id',
            autoIncrement: true
        },
        tags: {
            name: 'tags',
            keyPath: 'name'
        }
    },
}

const knowledges = [
    {
        tags: ['list', 'markdown'],
        body: `### A list

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3`
    },
    {
        tags: ['link', 'markdown'],
        body: `### Simple link
[Google](https://google.com)`,
    },
    {
        tags: ['table', 'markdown'],
        body: `### Just a table
| h1    |    h2   |      h3 |
|:------|:-------:|--------:|
| 100   | laci | maci |
| *foo* | **bar** | ~~baz~~ |
`,
    },
    {
        tags: ['extension', 'youtube', 'link', 'markdown'],
        body: `### And my fav, a yt video
![The Bus](https://www.youtube.com/watch?v=83m261lAlrs =250x*)`,
    }
];

/** @type {IDBDatabase} */
let connection;

function initConnection() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbDescription.name, dbDescription.version);

        openRequest.onerror = (event) => {
            reject(event);
        };

        openRequest.onsuccess = (event) => {
            connection = event.target.result;
            resolve(connection);
        };

        openRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore(
                dbDescription.objectStores.knowledges.name,
                { keyPath: 'id', autoIncrement: true }
            );
            db.createObjectStore(dbDescription.objectStores.tags.name, { keyPath: 'name' });

            objectStore.transaction.oncomplete = () => {
                const kwnowledgeStore = db
                    .transaction(dbDescription.objectStores.knowledges.name, 'readwrite')
                    .objectStore(dbDescription.objectStores.knowledges.name);

                knowledges.forEach((knowledge) =>{
                    kwnowledgeStore.add(knowledge);
                });

                const tagsStore = db
                    .transaction(dbDescription.objectStores.tags.name, 'readwrite')
                    .objectStore(dbDescription.objectStores.tags.name);

                knowledges.forEach((knowledge) => {
                    knowledge.tags.forEach((tag) => {
                        const request = tagsStore.get(tag);
                        request.onsuccess = () => {
                            const record = request.result || { name: tag, usageCount: 0 };
                            record.usageCount += 1;
                            tagsStore.put(record);
                        };
                    });
                });
            }
        }
    });
}

function getConnection() {
    if (connection) {
        return connection;
    }

    throw new Error("Connection not established, call ensureConnection() first");
}

export async function ensureConnection() {
    if (!connection) {
        try {
            await initConnection();
        } catch (error) {
            console.log(error);
            throw new Error("Can not establish connection to IndexedDB");
        }
    }
}

export function getKnowledgeObjectStore() {
    return getConnection()
        .transaction(dbDescription.objectStores.knowledges.name, 'readwrite')
        .objectStore(dbDescription.objectStores.knowledges.name);
}

function getTagsObjectStore() {
    return getConnection()
        .transaction(dbDescription.objectStores.tags.name, 'readwrite')
        .objectStore(dbDescription.objectStores.tags.name);
}

export function getAllKnowledge() {
    return new Promise((resolve, reject) => {
        const results = [];
        const request = getKnowledgeObjectStore().openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                resolve(results);
            }
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export function recordTagsUsage(tags) {
    const store = getTagsObjectStore();
    tags.forEach((tag) => {
        const request = store.get(tag);
        request.onsuccess = () => {
            const record = request.result || { name: tag, usageCount: 0 };
            record.usageCount += 1;
            store.put(record);
        };
    });
}

export function getTagUsageMap() {
    return new Promise((resolve, reject) => {
        const usage = new Map();
        const request = getTagsObjectStore().openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                usage.set(cursor.value.name, cursor.value.usageCount);
                cursor.continue();
            } else {
                resolve(usage);
            }
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export function getTagsByUsage() {
    return getTagUsageMap().then((usage) => {
        return [...usage.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([tag]) => tag);
    });
}
