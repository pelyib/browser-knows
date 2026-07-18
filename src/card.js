import Showdown from "showdown";
require('showdown-youtube');

const converter = new Showdown.Converter({extensions: ['youtube'], tables: true, emoji: true, strikethrough: true, underline: true});
const grid = document.querySelector('#container');

export function renderKnowledgeCard(knowledge, prepend = false) {
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

    if (prepend) {
        grid.prepend(col);
    } else {
        grid.appendChild(col);
    }
}
