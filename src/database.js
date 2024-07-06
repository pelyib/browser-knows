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


export function initDb() {
    const openRequest = indexedDB.open(dbDescription.name, dbDescription.version);

    openRequest.onerror = (event) => {
        console.log('Error opening database', event);
    };

    openRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore(dbDescription.objectStores.knowledges.name, { keyPath: 'id' });

        objectStore.transaction.oncomplete = (event) => {
            const kwnowledgeStore = db
                .transaction(dbDescription.objectStores.knowledges.name, 'readwrite')
                .objectStore(dbDescription.objectStores.knowledges.name);

            knowledges.forEach((knowledge) =>{
                kwnowledgeStore.add(knowledge);
            });
        }
    };
}
