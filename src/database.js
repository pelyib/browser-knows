const dbDescription = {
    name: 'browser-knows',
    version: 1,
    objectStores: {
        knowledges: {
            name: 'knowledges',
            keyPath: 'id',
            autoIncrement: true
        }
    },
}

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
        body: `
| h1    |    h2   |      h3 |
|:------|:-------:|--------:|
| 100   | laci | maci |
| *foo* | **bar** | ~~baz~~ |
`,
    },
    {
        id: 4,
        tags: ['extension', 'youtube'],
        body: '![The Bus](https://www.youtube.com/watch?v=75F3CSZcCFs =320x*)',
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
            const objectStore = db.createObjectStore(dbDescription.objectStores.knowledges.name, { keyPath: 'id' });

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

export function initDb() {
    ensureConnection()
        .then(() => {
            // build database here
            console.log("Database initialized");
        })
        .catch((error) => {
            console.log(error);
        })
}
