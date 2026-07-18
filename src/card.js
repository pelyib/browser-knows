import Showdown from "showdown";
require('showdown-youtube');

const converter = new Showdown.Converter({extensions: ['youtube'], tables: true, emoji: true, strikethrough: true, underline: true});
const grid = document.querySelector('#container');

export const TAG_TOGGLED_EVENT = 'tag:toggled';

export function renderKnowledgeCard(knowledge, prepend = false, activeTags = new Set()) {
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
        tagItem.className = 'list-inline-item tag-item';
        if (activeTags.has(tag)) {
            tagItem.classList.add('tag-active');
        }
        tagItem.innerText = tag;
        tagItem.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent(TAG_TOGGLED_EVENT, { detail: { tag } }));
        });
        tags.appendChild(tagItem);
    });
    footer.appendChild(tags);
    card.appendChild(body);
    card.appendChild(footer);

    col.appendChild(card);

    if (prepend) {
        grid.prepend(col);
    } else {
        grid.appendChild(col);
    }
}
