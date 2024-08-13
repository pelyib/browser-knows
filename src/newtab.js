import Showdown from "showdown";
import { ensureConnection, getKnowledgeObjectStore } from "./database";
import EasyMDE from "easymde";
import {create, addTag } from "./createNew";
require('showdown-youtube');

let converter = new Showdown.Converter({extensions: ['youtube'], tables: true, emoji: true, strikethrough: true, underline: true});
let grid = document.querySelector('#container');

ensureConnection()
    .then(() => {
        knowledges = getKnowledgeObjectStore();
        knowledges.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const col = document.createElement('div')
                col.className = 'col';
                const card = document.createElement('div');
                card.className = 'card';

                const body = document.createElement('div');
                body.className = 'card-body';
                const content = document.createElement('p');
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
                    tagItem.innerText = tag;
                    footer.append(tagItem);
                });
                card.appendChild(body);
                card.appendChild(footer);

                col.appendChild(card);

                grid.appendChild(col);

                cursor.continue();
            }
        };
    })
    .catch((error) => {
        console.log(error);
    })

function init() {
    new EasyMDE({
        lineNumbers: false,
        placeholder: 'A new core memory',
        toolbar: ["bold", "italic", "code", "quote", "|", "table", "horizontal-rule", "preview", "|", "guide"],
        element: document.getElementById('newKnowledgeFormBody'),
        toolbarButtonClassPrefix: "mde",
        forceSync: true,
        autoRefresh:true,
    });

    document.getElementById('newKnowledgeForm').addEventListener('submit', create);
    document.getElementById('addTag').addEventListener('click', addTag);
};

init();
