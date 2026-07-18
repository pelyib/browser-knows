const dbDescription = {
    name: 'browser-knows',
    version: 1,
    objectStores: {
        knowledges: {
            name: 'knowledges',
            // TODO: start to use these parameters
            keyPath: 'id',
            autoIncrement: true
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
![The Bus](https://www.youtube.com/watch?v=75F3CSZcCFs =250x*)`,
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
            db = event.target.result;
            const objectStore = db.createObjectStore(
                dbDescription.objectStores.knowledges.name, 
                { keyPath: 'id', autoIncrement: true }
            );

            objectStore.transaction.oncomplete = () => {
                const kwnowledgeStore = db
                    .transaction(dbDescription.objectStores.knowledges.name, 'readwrite')
                    .objectStore(dbDescription.objectStores.knowledges.name);

                knowledges.forEach((knowledge) =>{
                    kwnowledgeStore.add(knowledge);
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

export function computeTagUsage(knowledges) {
    const usage = new Map();
    knowledges.forEach((knowledge) => {
        knowledge.tags.forEach((tag) => {
            usage.set(tag, (usage.get(tag) || 0) + 1);
        });
    });
    return usage;
}

export function getTagsByUsage() {
    return getAllKnowledge().then((knowledges) => {
        const usage = computeTagUsage(knowledges);
        return [...usage.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([tag]) => tag);
    });
}
