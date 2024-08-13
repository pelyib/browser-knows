import Showdown from "showdown";
import { ensureConnection, getKnowledgeObjectStore } from "./database";
import {init as initCreateNewForm} from "./createNew";
require('showdown-youtube');

let converter = new Showdown.Converter({extensions: ['youtube'], tables: true, emoji: true, strikethrough: true, underline: true});
let grid = document.querySelector('#container');

function renderKnowledgeCards(limit) {
    ensureConnection()
        .then(() => {
            knowledges = getKnowledgeObjectStore();
            let cardsCount = 0;
            knowledges.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                if (cardsCount < limit && cursor) {
                    renderKnowledgeCard(cursor.value);
                    cardsCount++;
                    cursor.continue();
                }
            };
        })
        .catch((error) => {
            console.log(error);
        })
}

function renderKnowledgeCard(knowledge) {
    const col = document.createElement('div')
    col.className = 'col';
    const card = document.createElement('div');
    card.className = 'card';

    const body = document.createElement('div');
    body.className = 'card-body';
    const content = document.createElement('p');
    content.setAttribute('data-markdown', knowledge.body);
    content.innerHTML = converter.makeHtml(knowledge.body)
    body.appendChild(content);
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const tags = document.createElement('ul')
    tags.className = 'list-inline';
    knowledge.tags.forEach((tag) => {
        const tagItem = document.createElement('li');
        tagItem.className = 'list-inline-item';
        tagItem.innerText = tag;
        footer.append(tagItem);
    });
    card.appendChild(body);
    card.appendChild(footer);

    col.appendChild(card);

    grid.appendChild(col);
}


function init() {
    initCreateNewForm();
    renderKnowledgeCards(6);
};

init();
