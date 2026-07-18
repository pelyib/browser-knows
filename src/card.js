import { converter } from "./markdown";

const grid = document.querySelector('#container');

export const TAG_TOGGLED_EVENT = 'tag:toggled';
export const KNOWLEDGE_OPENED_EVENT = 'knowledge:opened';

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

    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.className = 'card-open-btn';
    openButton.innerHTML = '&#8599;';
    openButton.setAttribute('aria-label', 'Open');
    openButton.title = 'Open';
    openButton.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent(KNOWLEDGE_OPENED_EVENT, { detail: { knowledge } }));
    });

    footer.appendChild(tags);
    footer.appendChild(openButton);
    card.appendChild(body);
    card.appendChild(footer);

    col.appendChild(card);

    if (prepend) {
        grid.prepend(col);
    } else {
        grid.appendChild(col);
    }
}
