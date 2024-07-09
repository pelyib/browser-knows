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
![The Bus](https://www.youtube.com/watch?v=75F3CSZcCFs =320x*)`,
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
