import Isotope from "isotope-layout";
import Showdown from "showdown";
import { ensureConnection, getKnowledgeObjectStore } from "./database";
require('showdown-youtube');

let converter = new Showdown.Converter({extensions: ['youtube'], tables: true, emoji: true, strikethrough: true, underline: true});
let grid = document.querySelector('.grid')

ensureConnection()
    .then(() => {
        knowledges = getKnowledgeObjectStore();
        knowledges.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item card';
                gridItem.setAttribute('data-rank', Math.floor(Math.random() * 1000));

                const body = document.createElement('div');
                body.className = 'card-body';
                const content = document.createElement('p');
                content.className = 'grid-item-body';
                content.setAttribute('data-markdown', cursor.value.body);
                content.innerHTML = converter.makeHtml(cursor.value.body)
                body.appendChild(content);
                const footer = document.createElement('div');
                footer.className = 'card-footer';
                const tags = document.createElement('ul')
                tags.className = 'list-inline';
                cursor.value.tags.forEach((tag) => {
                    const tagItem = document.createElement('li');
                    tagItem.className = 'list-inline-item';
                    tagItem.innerText = ' #' + tag;
                    footer.append(tagItem);
                });
                gridItem.appendChild(body);
                gridItem.appendChild(footer);

                grid.appendChild(gridItem);

                cursor.continue();
            } else {
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
        };
    })
    .catch((error) => {
        console.log(error);
    })
