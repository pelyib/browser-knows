import { converter } from "./markdown";

const grid = document.querySelector('#container');

export const TAG_TOGGLED_EVENT = 'tag:toggled';
export const KNOWLEDGE_OPENED_EVENT = 'knowledge:opened';
export const KNOWLEDGE_EDIT_REQUESTED_EVENT = 'knowledge:editRequested';
export const KNOWLEDGE_DELETE_REQUESTED_EVENT = 'knowledge:deleteRequested';

function createActionsMenu(items) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown card-actions';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'card-icon-btn';
    toggle.innerHTML = '&#9881;&#65039;';
    toggle.setAttribute('data-bs-toggle', 'dropdown');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Actions');
    toggle.title = 'Actions';

    const menu = document.createElement('ul');
    menu.className = 'dropdown-menu dropdown-menu-end';

    items.forEach((item) => {
        const li = document.createElement('li');

        if (item.divider) {
            const hr = document.createElement('hr');
            hr.className = 'dropdown-divider';
            li.appendChild(hr);
        } else {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'dropdown-item' + (item.danger ? ' text-danger' : '');
            button.innerHTML = `<span class="dropdown-item-icon">${item.icon}</span>${item.label}`;
            button.addEventListener('click', item.onClick);
            li.appendChild(button);
        }

        menu.appendChild(li);
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(menu);
    return wrapper;
}

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

    if (knowledge.favicon) {
        const row = document.createElement('div');
        row.className = 'card-body-row';
        const favicon = document.createElement('img');
        favicon.className = 'card-favicon';
        favicon.src = knowledge.favicon;
        favicon.alt = '';
        favicon.addEventListener('error', () => favicon.remove());
        row.appendChild(favicon);
        row.appendChild(content);
        body.appendChild(row);
    } else {
        body.appendChild(content);
    }
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

    const actions = createActionsMenu([
        { icon: '&#8599;', label: 'Open', onClick: () => document.dispatchEvent(new CustomEvent(KNOWLEDGE_OPENED_EVENT, { detail: { knowledge } })) },
        { icon: '&#9998;', label: 'Edit', onClick: () => document.dispatchEvent(new CustomEvent(KNOWLEDGE_EDIT_REQUESTED_EVENT, { detail: { knowledge } })) },
        { divider: true },
        { icon: '&#128465;', label: 'Delete', danger: true, onClick: () => document.dispatchEvent(new CustomEvent(KNOWLEDGE_DELETE_REQUESTED_EVENT, { detail: { knowledge } })) },
    ]);

    footer.appendChild(tags);
    footer.appendChild(actions);
    card.appendChild(body);
    card.appendChild(footer);

    col.appendChild(card);

    if (prepend) {
        grid.prepend(col);
    } else {
        grid.appendChild(col);
    }
}
