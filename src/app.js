import Isotope from "isotope-layout";
import Showdown from "showdown";
require('showdown-youtube');

console.log("Browser knows")

// Connect to browser-knows indexeddb db
// Fetch items from knowledges
// create items from data

let converter = new Showdown.Converter({extensions: ['youtube'], tables: true, emoji: true, strikethrough: true, underline: true});

const browserKnowsOpenRequest = indexedDB.open('browser-knows');
browserKnowsOpenRequest.onsuccess = (e) => {
    db = browserKnowsOpenRequest.result
    const knowledges = db.transaction('knowledges').objectStore('knowledges');

    const grid = document.querySelector('.grid')
    knowledges.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.setAttribute('data-rank', Math.floor(Math.random() * 1000));

            const knowledgeContainer = document.createElement('fieldset');
            const contentContainer = document.createElement('div');
            const content = document.createElement('p');
            content.className = 'grid-item-body';
            content.setAttribute('data-markdown', cursor.value.body);
            content.innerHTML = converter.makeHtml(cursor.value.body)
            contentContainer.appendChild(content);
            const tags = document.createElement('p');
            cursor.value.tags.forEach(tag => tags.append(document.createElement('span').textContent = '#' + tag));

            knowledgeContainer.appendChild(contentContainer);
            knowledgeContainer.appendChild(document.createElement('hr'));
            knowledgeContainer.appendChild(tags);

            gridItem.appendChild(knowledgeContainer);

            grid.appendChild(gridItem);

            cursor.continue();
        }
    };

    let iso = new Isotope('.grid', {
        itemSelector: ".grid-item",
        layoutMode: "masonry",
        getSortData: {
            rank: '[data-rank] parseInt',
            name: '.isotop-sort-by-name'
        }
    });

    iso.arrange({ sortBy: 'rank', sortAscending: false });
}
