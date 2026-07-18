import { ensureConnection, getAllKnowledge } from "./database";
import { renderKnowledgeCard, TAG_TOGGLED_EVENT } from "./card";

const DEFAULT_LIMIT = 6;
const DEBOUNCE_MS = 150;

let debounceTimer;
const selectedTags = new Set();

function matchesQuery(knowledge, query) {
    if (!query) {
        return true;
    }
    if (knowledge.body.toLowerCase().includes(query)) {
        return true;
    }
    return knowledge.tags.some((tag) => tag.toLowerCase().includes(query));
}

function matchesSelectedTags(knowledge) {
    if (selectedTags.size === 0) {
        return true;
    }
    return [...selectedTags].every((tag) => knowledge.tags.includes(tag));
}

function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function renderSelectedTagsList() {
    const list = document.getElementById('selectedTagsFilter');
    clearChildren(list);

    selectedTags.forEach((tag) => {
        const item = document.createElement('li');
        item.className = 'list-inline-item selected-tag';
        item.innerText = tag;
        item.title = 'Remove tag filter';
        item.addEventListener('click', () => toggleTag(tag));
        list.appendChild(item);
    });
}

function toggleTag(tag) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
    } else {
        selectedTags.add(tag);
    }
    renderSelectedTagsList();
    renderResults();
}

function renderResults() {
    const query = document.getElementById('search').value.trim().toLowerCase();

    ensureConnection()
        .then(() => getAllKnowledge())
        .then((knowledges) => {
            const matched = knowledges.filter((knowledge) => matchesQuery(knowledge, query) && matchesSelectedTags(knowledge));
            const hasActiveFilter = query.length > 0 || selectedTags.size > 0;
            const results = hasActiveFilter ? matched : matched.slice(0, DEFAULT_LIMIT);

            clearChildren(document.getElementById('container'));
            results.forEach((knowledge) => renderKnowledgeCard(knowledge, false, selectedTags));
        })
        .catch((error) => {
            console.log(error);
        });
}

export function init() {
    document.getElementById('search').addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(renderResults, DEBOUNCE_MS);
    });

    document.addEventListener(TAG_TOGGLED_EVENT, (event) => toggleTag(event.detail.tag));

    renderResults();
}
